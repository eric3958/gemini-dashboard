// useVideoData.js - 支持分页版本
import { useState, useMemo } from 'react';
import { CATEGORY_MAPPING } from '../utils/constants.js';

export const useVideoData = (data) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('opportunity_score');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 分類處理邏輯
  const categories = useMemo(() => {
    if (data.length === 0) return [];
    
    const categoryMap = {};
    
    data.forEach(item => {
      if (item.categoryId && item.categoryId !== '') {
        const categoryId = String(item.categoryId).trim();
        
        if (CATEGORY_MAPPING[categoryId]) {
          categoryMap[categoryId] = CATEGORY_MAPPING[categoryId];
        } else {
          categoryMap['unknown'] = '無法分類';
        }
      }
    });
    
    return Object.entries(categoryMap)
      .sort(([a], [b]) => {
        if (a === 'unknown') return 1;
        if (b === 'unknown') return -1;
        return parseInt(a) - parseInt(b);
      })
      .map(([id, name]) => ({ id, name }));
  }, [data]);

  // 頻道處理邏輯
  const channels = useMemo(() => {
    if (data.length === 0) return [];
    
    const channelSet = new Set();
    data.forEach(item => {
      if (item.channelTitle && item.channelTitle.trim() !== '') {
        channelSet.add(item.channelTitle.trim());
      }
    });
    return Array.from(channelSet).sort();
  }, [data]);

  // 篩選和排序邏輯（不包含分页）
  const filteredAndSortedData = useMemo(() => {
    if (data.length === 0) return [];
    
    let filtered = [...data];

    // 分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const categoryId = String(item.categoryId || '').trim();
        
        if (selectedCategory === 'unknown') {
          return !CATEGORY_MAPPING[categoryId] || categoryId === '';
        } else {
          return categoryId === selectedCategory;
        }
      });
    }

    // 频道筛选
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(item => {
        const channelTitle = String(item.channelTitle || '').trim();
        return channelTitle === selectedChannel;
      });
    }

    // 时长筛选
    if (durationFilter !== 'all') {
      filtered = filtered.filter(item => {
        const durationCategory = String(item.durationCategory || '').trim();
        return durationCategory === durationFilter;
      });
    }

    // 排序邏輯
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      if (['opportunity_score', 'explosion', 'newbie', 'momentum', 'engagement', 'technical_quality', 'channel_authority'].includes(sortBy)) {
        aVal = parseFloat(a[sortBy]) || 0;
        bVal = parseFloat(b[sortBy]) || 0;
      } else if (['viewCount', 'likeCount', 'commentCount', 'channelSubscribers', 'channelTotalViews', 'channelVideoCount', 'durationSeconds'].includes(sortBy)) {
        aVal = parseInt(a[sortBy]) || 0;
        bVal = parseInt(b[sortBy]) || 0;
      } else if (sortBy === 'publishedAt') {
        aVal = a[sortBy] ? new Date(a[sortBy]).getTime() : 0;
        bVal = b[sortBy] ? new Date(b[sortBy]).getTime() : 0;
      } else {
        aVal = String(a[sortBy] || '').toLowerCase();
        bVal = String(b[sortBy] || '').toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return typeof aVal === 'number' ? bVal - aVal : bVal.localeCompare(aVal);
      } else {
        return typeof aVal === 'number' ? aVal - bVal : aVal.localeCompare(bVal);
      }
    });

    return filtered;
  }, [data, selectedCategory, selectedChannel, durationFilter, sortBy, sortOrder]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // 分页信息
  const paginationInfo = useMemo(() => {
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [filteredAndSortedData.length, currentPage, pageSize]);

  // 分页操作函数
  const handlePageChange = (page) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    // 重新计算当前页，确保不超出范围
    const newTotalPages = Math.ceil(filteredAndSortedData.length / newPageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }
  };

  // 当筛选条件变化时，重置到第一页
  const setSelectedCategoryWithReset = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const setSelectedChannelWithReset = (channel) => {
    setSelectedChannel(channel);
    setCurrentPage(1);
  };

  const setDurationFilterWithReset = (duration) => {
    setDurationFilter(duration);
    setCurrentPage(1);
  };

  const setSortByWithReset = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const setSortOrderWithReset = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  // 統計計算（基于所有数据，不是分页数据）
  const statistics = useMemo(() => {
    if (data.length === 0) return {
      totalVideos: 0,
      totalViews: 0,
      avgViews: 0,
      avgOpportunityScore: 0,
      topScore: 0
    };

    const totalViews = data.reduce((sum, item) => {
      const views = parseInt(item.viewCount) || 0;
      return sum + views;
    }, 0);
    
    const validScores = data.map(item => {
      const score = parseFloat(item.opportunity_score) || 0;
      return score;
    }).filter(score => score > 0);
    
    const avgOpportunityScore = validScores.length > 0 ? 
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
    const avgViews = data.length > 0 ? totalViews / data.length : 0;
    
    return {
      totalVideos: data.length,
      totalViews,
      avgViews: Math.round(avgViews),
      avgOpportunityScore: avgOpportunityScore.toFixed(1),
      topScore: validScores.length > 0 ? Math.max(...validScores).toFixed(1) : 0
    };
  }, [data]);

  return {
    // 篩選狀態（带重置功能）
    selectedCategory,
    setSelectedCategory: setSelectedCategoryWithReset,
    selectedChannel,
    setSelectedChannel: setSelectedChannelWithReset,
    durationFilter,
    setDurationFilter: setDurationFilterWithReset,
    sortBy,
    setSortBy: setSortByWithReset,
    sortOrder,
    setSortOrder: setSortOrderWithReset,
    
    // 分页状态和操作
    currentPage,
    pageSize,
    paginationInfo,
    handlePageChange,
    handlePageSizeChange,
    
    // 處理後的數據
    categories,
    channels,
    filteredData: paginatedData, // 返回分页后的数据
    allFilteredData: filteredAndSortedData, // 返回所有筛选后的数据（用于统计）
    statistics
  };
};