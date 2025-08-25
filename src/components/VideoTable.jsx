// VideoTable.jsx - 修改版本，將排序邏輯移到父組件
import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { styles } from '../styles/styles.js';
import { CATEGORY_MAPPING } from '../utils/constants.js';

const VideoTable = ({ 
  filteredData, 
  totalDataLength, 
  paginationInfo, 
  onPageChange, 
  onPageSizeChange,
  // 新增：表格排序相關 props
  tableSortBy,
  tableSortOrder,
  onTableSort,
  onClearTableSort
}) => {
  // 可排序的欄位定義
  const sortableColumns = [
    { key: 'title', label: '影片標題', width: '300px' },
    { key: 'channelTitle', label: '頻道名稱', width: '150px' },
    { key: 'categoryName', label: '分類', width: '120px' },
    { key: 'publishedAt', label: '發布日期', width: '120px' },
    { key: 'channelPublishedAt', label: '頻道創立日期', width: '130px' },
    { key: 'duration', label: '時長', width: '80px' },
    { key: 'viewCount', label: '觀看數', width: '120px' },
    { key: 'likeCount', label: '按讚數', width: '100px' },
    { key: 'commentCount', label: '留言數', width: '100px' },
    { key: 'channelSubscribers', label: '頻道訂閱數', width: '120px' },
    { key: 'channelTotalViews', label: '頻道總觀看', width: '120px' },
    { key: 'opportunity_score', label: '機會分數', width: '100px' },
    { key: 'explosion', label: '爆紅潛力', width: '100px' },
    { key: 'engagement', label: '互動指數', width: '100px' }
  ];

  // 處理欄位點擊排序
  const handleColumnSort = (columnKey) => {
    if (tableSortBy === columnKey) {
      // 相同欄位：切換排序方向
      onTableSort(columnKey, tableSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      // 不同欄位：設定新欄位，預設降序
      onTableSort(columnKey, 'desc');
    }
  };

  // 渲染排序圖示
  const renderSortIcon = (columnKey) => {
    if (tableSortBy !== columnKey) {
      return <ChevronsUpDown size={14} style={{ color: '#9ca3af' }} />;
    }
    
    return tableSortOrder === 'desc' 
      ? <ChevronDown size={14} style={{ color: '#3b82f6' }} />
      : <ChevronUp size={14} style={{ color: '#3b82f6' }} />;
  };

  // 格式化數值顯示
  const formatValue = (value, key) => {
    if (!value && value !== 0) return '-';
    
    switch (key) {
      case 'publishedAt':
      case 'channelPublishedAt':
        return new Date(value).toLocaleDateString('zh-TW');
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      case 'viewCount':
      case 'likeCount':
      case 'commentCount':
      case 'channelSubscribers':
      case 'channelTotalViews':
        return parseInt(value).toLocaleString();
      case 'opportunity_score':
      case 'explosion':
      case 'engagement':
        return parseFloat(value).toFixed(2);
      default:
        return value;
    }
  };

  // 獲取分數顏色
  const getScoreColor = (score, type = 'default') => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return '#6b7280';
    
    if (type === 'opportunity') {
      if (numScore >= 8) return '#10b981';
      if (numScore >= 6) return '#f59e0b';
      return '#ef4444';
    }
    
    if (numScore >= 7) return '#10b981';
    if (numScore >= 4) return '#f59e0b';
    return '#ef4444';
  };

  if (!filteredData || filteredData.length === 0) {
    return (
      <div style={styles.card}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          影片資訊
        </h2>
        <div style={styles.emptyState}>
          <p>沒有符合條件的影片資料</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      {/* 表格標題和排序控制 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          影片資訊
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {tableSortBy && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              backgroundColor: '#dbeafe',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1d4ed8'
            }}>
              <span>排序：{sortableColumns.find(col => col.key === tableSortBy)?.label}</span>
              <span>({tableSortOrder === 'desc' ? '降序' : '升序'})</span>
            </div>
          )}
          
          {tableSortBy && (
            <button
              onClick={onClearTableSort}
              style={{
                ...styles.button,
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '12px',
                padding: '4px 8px'
              }}
            >
              清除排序
            </button>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>每頁顯示:</span>
            <select
              value={paginationInfo.pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              style={{
                ...styles.select,
                width: '80px',
                fontSize: '14px'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* 排序說明 */}
      <div style={{
        backgroundColor: '#f0f9ff',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '13px',
        color: '#0369a1'
      }}>
        💡 點擊欄位標題可進行全域排序（對所有篩選資料排序，不僅是當前頁面）
      </div>

      {/* 資料表格 */}
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '60px' }}>#</th>
              {sortableColumns.map(column => (
                <th
                  key={column.key}
                  onClick={() => handleColumnSort(column.key)}
                  style={{
                    ...styles.th,
                    width: column.width,
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: tableSortBy === column.key ? '#dbeafe' : '#f9fafb',
                    color: tableSortBy === column.key ? '#1d4ed8' : '#6b7280'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'space-between'
                  }}>
                    <span>{column.label}</span>
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th style={{ ...styles.th, width: '100px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((video, index) => {
              const globalIndex = (paginationInfo.currentPage - 1) * paginationInfo.pageSize + index + 1;
              
              return (
                <tr key={video.videoId || index} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>
                      {globalIndex}
                    </span>
                  </td>
                  
                  <td style={styles.td}>
                    <div>
                      <div style={{ 
                        fontWeight: '500', 
                        color: '#111827', 
                        marginBottom: '4px',
                        lineHeight: '1.4'
                      }}>
                        {video.title?.substring(0, 60)}
                        {video.title?.length > 60 && '...'}
                      </div>
                      {video.videoUrl && (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.urlLink}
                        >
                          觀看影片
                        </a>
                      )}
                    </div>
                  </td>
                  
                  <td style={styles.td}>{video.channelTitle || '-'}</td>
                  <td style={styles.td}>{CATEGORY_MAPPING[video.categoryId] || '未知'}</td>
                  <td style={styles.td}>
                    {formatValue(video.publishedAt, 'publishedAt')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.channelPublishedAt, 'channelPublishedAt')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.durationSeconds, 'duration')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.viewCount, 'viewCount')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.likeCount, 'likeCount')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.commentCount, 'commentCount')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.channelSubscribers, 'channelSubscribers')}
                  </td>
                  <td style={styles.td}>
                    {formatValue(video.channelTotalViews, 'channelTotalViews')}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.score,
                      backgroundColor: `${getScoreColor(video.opportunity_score, 'opportunity')}15`,
                      color: getScoreColor(video.opportunity_score, 'opportunity')
                    }}>
                      {formatValue(video.opportunity_score, 'opportunity_score')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.score,
                      backgroundColor: `${getScoreColor(video.explosion)}15`,
                      color: getScoreColor(video.explosion)
                    }}>
                      {formatValue(video.explosion, 'explosion')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.score,
                      backgroundColor: `${getScoreColor(video.engagement)}15`,
                      color: getScoreColor(video.engagement)
                    }}>
                      {formatValue(video.engagement, 'engagement')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {video.videoUrl && (
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...styles.button,
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          fontSize: '12px',
                          padding: '4px 8px',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                      >
                        查看
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 分頁控制 */}
      {paginationInfo.totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            顯示 {paginationInfo.startIndex}-{paginationInfo.endIndex} 筆，
            共 {paginationInfo.totalItems} 筆資料
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPageChange(paginationInfo.currentPage - 1)}
              disabled={!paginationInfo.hasPrevPage}
              style={{
                ...styles.button,
                backgroundColor: paginationInfo.hasPrevPage ? '#f3f4f6' : '#f9fafb',
                color: paginationInfo.hasPrevPage ? '#374151' : '#9ca3af',
                cursor: paginationInfo.hasPrevPage ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              上一頁
            </button>
            
            <span style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#374151'
            }}>
              {paginationInfo.currentPage} / {paginationInfo.totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(paginationInfo.currentPage + 1)}
              disabled={!paginationInfo.hasNextPage}
              style={{
                ...styles.button,
                backgroundColor: paginationInfo.hasNextPage ? '#f3f4f6' : '#f9fafb',
                color: paginationInfo.hasNextPage ? '#374151' : '#9ca3af',
                cursor: paginationInfo.hasNextPage ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTable;