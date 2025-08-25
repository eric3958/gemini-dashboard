// useVideoData.js - 修改版本，新增表格排序邏輯
import { useState, useMemo, useEffect } from 'react';
import { CATEGORY_MAPPING, DURATION_LABELS } from '../utils/constants.js';

export const useVideoData = (data) => {
  // 原有的篩選狀態
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [customDurationMin, setCustomDurationMin] = useState('');
  const [customDurationMax, setCustomDurationMax] = useState('');
  const [sortBy, setSortBy] = useState('opportunity_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [customSortMin, setCustomSortMin] = useState('');
  const [customSortMax, setCustomSortMax] = useState('');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 新增：表格排序狀態（獨立於主排序）
  const [tableSortBy, setTableSortBy] = useState('');
  const [tableSortOrder, setTableSortOrder] = useState('desc');

  // 新增：二次篩選狀態
  const [secondaryFilters, setSecondaryFilters] = useState({
    channelSubscribersMin: '',
    channelSubscribersMax: '',
    channelTotalViewsMin: '',
    channelTotalViewsMax: '',
    channelVideoCountMin: '',
    channelVideoCountMax: '',
    viewCountMin: '',
    viewCountMax: '',
    likeCountMin: '',
    likeCountMax: '',
    commentCountMin: '',
    commentCountMax: '',
    opportunityScoreMin: '',
    opportunityScoreMax: '',
    explosionMin: '',
    explosionMax: '',
    engagementMin: '',
    engagementMax: '',
    searchKeyword: ''
  });

  // 處理數據，添加分類名稱
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(video => ({
      ...video,
      categoryName: CATEGORY_MAPPING[video.categoryId] || '未知分類',
      durationLabel: DURATION_LABELS[video.durationCategory] || '未知'
    }));
  }, [data]);

  // 獲取所有分類
  const categories = useMemo(() => {
    const categorySet = new Set();
    processedData.forEach(video => {
      categorySet.add(video.categoryName);
    });
    
    return Array.from(categorySet).map(name => ({
      id: Object.keys(CATEGORY_MAPPING).find(key => CATEGORY_MAPPING[key] === name) || name,
      name
    }));
  }, [processedData]);

  // 獲取所有頻道
  const channels = useMemo(() => {
    const channelSet = new Set();
    processedData.forEach(video => {
      if (video.channelTitle) {
        channelSet.add(video.channelTitle);
      }
    });
    return Array.from(channelSet).sort();
  }, [processedData]);

  // 檢查數值是否在範圍內
  const isInRange = (value, min, max) => {
    const numValue = parseFloat(value);
    const numMin = min !== '' ? parseFloat(min) : -Infinity;
    const numMax = max !== '' ? parseFloat(max) : Infinity;
    return numValue >= numMin && numValue <= numMax;
  };

  // 應用二次篩選
  const applySecondaryFilters = (videos) => {
    return videos.filter(video => {
      // 關鍵字搜尋
      if (secondaryFilters.searchKeyword) {
        const keyword = secondaryFilters.searchKeyword.toLowerCase();
        const title = (video.title || '').toLowerCase();
        if (!title.includes(keyword)) {
          return false;
        }
      }

      // 頻道訂閱數篩選
      if (secondaryFilters.channelSubscribersMin !== '' || secondaryFilters.channelSubscribersMax !== '') {
        if (!isInRange(video.channelSubscribers, secondaryFilters.channelSubscribersMin, secondaryFilters.channelSubscribersMax)) {
          return false;
        }
      }

      // 頻道總觀看數篩選
      if (secondaryFilters.channelTotalViewsMin !== '' || secondaryFilters.channelTotalViewsMax !== '') {
        if (!isInRange(video.channelTotalViews, secondaryFilters.channelTotalViewsMin, secondaryFilters.channelTotalViewsMax)) {
          return false;
        }
      }

      // 頻道影片數量篩選
      if (secondaryFilters.channelVideoCountMin !== '' || secondaryFilters.channelVideoCountMax !== '') {
        if (!isInRange(video.channelVideoCount, secondaryFilters.channelVideoCountMin, secondaryFilters.channelVideoCountMax)) {
          return false;
        }
      }

      // 影片觀看數篩選
      if (secondaryFilters.viewCountMin !== '' || secondaryFilters.viewCountMax !== '') {
        if (!isInRange(video.viewCount, secondaryFilters.viewCountMin, secondaryFilters.viewCountMax)) {
          return false;
        }
      }

      // 按讚數篩選
      if (secondaryFilters.likeCountMin !== '' || secondaryFilters.likeCountMax !== '') {
        if (!isInRange(video.likeCount, secondaryFilters.likeCountMin, secondaryFilters.likeCountMax)) {
          return false;
        }
      }

      // 留言數篩選
      if (secondaryFilters.commentCountMin !== '' || secondaryFilters.commentCountMax !== '') {
        if (!isInRange(video.commentCount, secondaryFilters.commentCountMin, secondaryFilters.commentCountMax)) {
          return false;
        }
      }

      // 機會分數篩選
      if (secondaryFilters.opportunityScoreMin !== '' || secondaryFilters.opportunityScoreMax !== '') {
        if (!isInRange(video.opportunity_score, secondaryFilters.opportunityScoreMin, secondaryFilters.opportunityScoreMax)) {
          return false;
        }
      }

      // 爆紅潛力篩選
      if (secondaryFilters.explosionMin !== '' || secondaryFilters.explosionMax !== '') {
        if (!isInRange(video.explosion, secondaryFilters.explosionMin, secondaryFilters.explosionMax)) {
          return false;
        }
      }

      // 互動指數篩選
      if (secondaryFilters.engagementMin !== '' || secondaryFilters.engagementMax !== '') {
        if (!isInRange(video.engagement, secondaryFilters.engagementMin, secondaryFilters.engagementMax)) {
          return false;
        }
      }

      return true;
    });
  };

  // 表格排序函數
  const applySorting = (videos, sortField, sortDirection) => {
    if (!sortField) return videos;

    return [...videos].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // 處理 null, undefined, 空字串的情況
      if (aValue == null || aValue === '') aValue = 0;
      if (bValue == null || bValue === '') bValue = 0;

      // 處理不同類型的數據
      if (sortField === 'publishedAt' || sortField === 'channelPublishedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'duration') {
        aValue = parseFloat(a.durationSeconds) || 0;
        bValue = parseFloat(b.durationSeconds) || 0;
      } else if (['viewCount', 'likeCount', 'commentCount', 'channelSubscribers', 'channelTotalViews'].includes(sortField)) {
        // 確保這些數值欄位被當作數字排序
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (['opportunity_score', 'explosion', 'engagement'].includes(sortField)) {
        // 分數類欄位使用浮點數排序
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'title' || sortField === 'channelTitle' || sortField === 'categoryName') {
        // 純文字欄位使用字串排序
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        return sortDirection === 'desc' 
          ? bValue.localeCompare(aValue, 'zh-TW')
          : aValue.localeCompare(bValue, 'zh-TW');
      } else {
        // 其他欄位嘗試數值排序，失敗則使用字串排序
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          // 都是有效數字，使用數值排序
          aValue = aNum;
          bValue = bNum;
        } else {
          // 包含非數字，使用字串排序
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
          return sortDirection === 'desc' 
            ? bValue.localeCompare(aValue, 'zh-TW')
            : aValue.localeCompare(bValue, 'zh-TW');
        }
      }

      // 數值排序（包括日期物件）
      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
  };

  // 主要篩選和排序邏輯
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...processedData];

    // 分類篩選
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(video => video.categoryId === selectedCategory);
    }

    // 頻道篩選
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(video => video.channelTitle === selectedChannel);
    }

    // 時長篩選
    if (durationFilter !== 'all') {
      if (durationFilter === 'custom') {
        const minDuration = customDurationMin ? parseFloat(customDurationMin) : 0;
        const maxDuration = customDurationMax ? parseFloat(customDurationMax) : Infinity;
        filtered = filtered.filter(video => {
          const durationMinutes = video.durationSeconds / 60;
          return durationMinutes >= minDuration && durationMinutes <= maxDuration;
        });
      } else {
        filtered = filtered.filter(video => video.durationCategory === durationFilter);
      }
    }

    // 應用二次篩選
    filtered = applySecondaryFilters(filtered);

    // 先應用主要排序（如果沒有表格排序的話）
    if (!tableSortBy) {
      // 主要排序邏輯
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // 處理日期
        if (sortBy === 'publishedAt' || sortBy === 'channelPublishedAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }

        // 自定義範圍篩選
        if (sortOrder === 'custom') {
          const minValue = customSortMin ? parseFloat(customSortMin) : -Infinity;
          const maxValue = customSortMax ? parseFloat(customSortMax) : Infinity;
          
          const aInRange = aValue >= minValue && aValue <= maxValue;
          const bInRange = bValue >= minValue && bValue <= maxValue;
          
          if (aInRange && !bInRange) return -1;
          if (!aInRange && bInRange) return 1;
          if (!aInRange && !bInRange) return 0;
        }

        // 正常排序 - 改為預設降序
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue; // 預設降序
        }
      });

      // 如果是自定義範圍，只保留範圍內的數據
      if (sortOrder === 'custom') {
        const minValue = customSortMin ? parseFloat(customSortMin) : -Infinity;
        const maxValue = customSortMax ? parseFloat(customSortMax) : Infinity;
        
        filtered = filtered.filter(video => {
          let value = video[sortBy];
          if (sortBy === 'publishedAt' || sortBy === 'channelPublishedAt') {
            value = new Date(value);
          } else {
            value = parseFloat(value) || 0;
          }
          return value >= minValue && value <= maxValue;
        });
      }
    }

    // 應用表格排序（優先於主排序）
    if (tableSortBy) {
      filtered = applySorting(filtered, tableSortBy, tableSortOrder);
    }

    return filtered;
  }, [
    processedData, 
    selectedCategory, 
    selectedChannel, 
    durationFilter, 
    customDurationMin, 
    customDurationMax,
    sortBy, 
    sortOrder, 
    customSortMin, 
    customSortMax,
    secondaryFilters,
    tableSortBy,
    tableSortOrder
  ]);

  // 分頁處理
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // 分頁信息
  const paginationInfo = useMemo(() => {
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredAndSortedData.length, currentPage, pageSize]);

  // 統計信息
  const statistics = useMemo(() => {
    if (!processedData.length) return null;

    const totalVideos = processedData.length;
    const filteredVideos = filteredAndSortedData.length;
    
    const totalViews = filteredAndSortedData.reduce((sum, video) => sum + (parseFloat(video.viewCount) || 0), 0);
    const totalLikes = filteredAndSortedData.reduce((sum, video) => sum + (parseFloat(video.likeCount) || 0), 0);
    const totalComments = filteredAndSortedData.reduce((sum, video) => sum + (parseFloat(video.commentCount) || 0), 0);
    
    const avgOpportunityScore = filteredAndSortedData.length > 0 
      ? filteredAndSortedData.reduce((sum, video) => sum + (parseFloat(video.opportunity_score) || 0), 0) / filteredAndSortedData.length 
      : 0;

    const uniqueChannels = new Set(filteredAndSortedData.map(video => video.channelTitle)).size;

    return {
      totalVideos,
      filteredVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgOpportunityScore,
      uniqueChannels,
      filteringActive: filteredVideos < totalVideos
    };
  }, [processedData, filteredAndSortedData]);

  // 表格排序控制函數
  const handleTableSort = (columnKey, order) => {
    setTableSortBy(columnKey);
    setTableSortOrder(order);
    setCurrentPage(1); // 排序後回到第一頁
  };

  const clearTableSort = () => {
    setTableSortBy('');
    setTableSortOrder('desc');
    setCurrentPage(1);
  };

  // 頁面控制函數
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // 重置分頁當篩選條件改變時
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory, 
    selectedChannel, 
    durationFilter, 
    customDurationMin, 
    customDurationMax,
    sortBy, 
    sortOrder, 
    customSortMin, 
    customSortMax,
    secondaryFilters
  ]);

  // 當表格排序改變時，清除主排序的自定義範圍
  useEffect(() => {
    if (tableSortBy && sortOrder === 'custom') {
      setSortOrder('desc');
      setCustomSortMin('');
      setCustomSortMax('');
    }
  }, [tableSortBy]);

  return {
    // 原有的 props
    selectedCategory,
    setSelectedCategory,
    selectedChannel,
    setSelectedChannel,
    durationFilter,
    setDurationFilter,
    customDurationMin,
    setCustomDurationMin,
    customDurationMax,
    setCustomDurationMax,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    customSortMin,
    setCustomSortMin,
    customSortMax,
    setCustomSortMax,
    
    // 新增的二次篩選 props
    secondaryFilters,
    setSecondaryFilters,
    
    // 新增的表格排序 props
    tableSortBy,
    tableSortOrder,
    handleTableSort,
    clearTableSort,
    
    // 數據
    categories,
    channels,
    filteredData: paginatedData,
    completeFilteredData: filteredAndSortedData,
    statistics,
    
    // 分頁
    currentPage,
    pageSize,
    paginationInfo,
    handlePageChange,
    handlePageSizeChange
  };
};