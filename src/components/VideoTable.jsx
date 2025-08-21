// VideoTable.jsx
import React, { useState } from 'react';
import { styles } from '../styles/styles.js';
import Pagination from './Pagination.jsx';
import { 
  formatNumber, 
  getScoreColor, 
  getCategoryDisplayName, 
  getDurationLabel,
  getYouTubeUrl,
  formatDate,
  formatDuration
} from '../utils/formatters.js';
import { CATEGORY_MAPPING } from '../utils/constants.js';

const VideoTable = ({ filteredData, totalDataLength, paginationInfo, onPageChange, onPageSizeChange }) => {
  if (totalDataLength === 0) {
    return null;
  }

  if (filteredData.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <div style={{fontSize: '18px', marginBottom: '8px'}}>沒有找到符合條件的資料</div>
          <div style={{fontSize: '14px'}}>請調整篩選條件</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={{overflowX: 'auto'}}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>影片資訊</th>
              <th style={styles.th}>機會分數</th>
              <th style={styles.th}>觀看數據</th>
              <th style={styles.th}>互動數據</th>
              <th style={styles.th}>頻道資訊</th>
              <th style={styles.th}>發布時間</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((video, index) => (
              <VideoRow key={video.videoId || index} video={video} />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 分页组件 */}
      {paginationInfo && paginationInfo.totalItems > 0 && (
        <Pagination 
          currentPage={paginationInfo.currentPage}
          totalPages={paginationInfo.totalPages}
          pageSize={paginationInfo.pageSize}
          totalItems={paginationInfo.totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};

const VideoRow = ({ video }) => {
  return (
    <tr style={styles.tr}>
      <td style={styles.td}>
        <VideoInfo video={video} />
      </td>
      <td style={styles.td}>
        <ScoreInfo video={video} />
      </td>
      <td style={styles.td}>
        <ViewInfo video={video} />
      </td>
      <td style={styles.td}>
        <InteractionInfo video={video} />
      </td>
      <td style={styles.td}>
        <ChannelInfo video={video} />
      </td>
      <td style={styles.td}>
        <TimeInfo video={video} />
      </td>
    </tr>
  );
};

// Tags组件
const TagsDisplay = ({ tags, maxVisible = 3 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!tags || tags === 'N/A') {
    return (
      <div style={tagStyles.noTags}>
        无标签
      </div>
    );
  }

  // 解析tags字符串
  const parseTags = (tagsStr) => {
    if (!tagsStr || tagsStr === 'N/A') return [];
    
    // 移除外层引号并按逗号分割
    return tagsStr
      .split(',')
      .map(tag => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter(tag => tag.length > 0);
  };

  const tagList = parseTags(tags);
  
  if (tagList.length === 0) {
    return (
      <div style={tagStyles.noTags}>
        无标签
      </div>
    );
  }

  const visibleTags = tagList.slice(0, maxVisible);
  const hiddenCount = tagList.length - maxVisible;

  const handleMouseEnter = (e) => {
    if (hiddenCount > 0) {
      const rect = e.target.getBoundingClientRect();
      setTooltipPosition({ 
        x: rect.left + rect.width / 2, 
        y: rect.top - 10 
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div style={tagStyles.container}>
      <div style={tagStyles.tagsWrapper}>
        {visibleTags.map((tag, index) => (
          <span key={index} style={tagStyles.tag}>
            {tag}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span 
            style={tagStyles.moreTag}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            +{hiddenCount}
          </span>
        )}
      </div>
      
      {showTooltip && hiddenCount > 0 && (
        <div 
          style={{
            ...tagStyles.tooltip,
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div style={tagStyles.tooltipContent}>
            <div style={tagStyles.tooltipTitle}>所有标签 ({tagList.length})</div>
            <div style={tagStyles.tooltipTags}>
              {tagList.map((tag, index) => (
                <span key={index} style={tagStyles.tooltipTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div style={tagStyles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
};

// Tags样式
const tagStyles = {
  container: {
    position: 'relative',
    marginTop: '6px',
  },
  tagsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    alignItems: 'center',
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  moreTag: {
    display: 'inline-block',
    padding: '2px 8px',
    fontSize: '11px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  noTags: {
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: '6px',
  },
  tooltip: {
    position: 'fixed',
    zIndex: 1000,
    transform: 'translateX(-50%) translateY(-100%)',
    pointerEvents: 'none',
  },
  tooltipContent: {
    backgroundColor: '#111827',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '300px',
    minWidth: '200px',
  },
  tooltipTitle: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#e5e7eb',
  },
  tooltipTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  tooltipTag: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '10px',
    backgroundColor: '#374151',
    color: '#e5e7eb',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  tooltipArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #111827',
  }
};

const VideoInfo = ({ video }) => (
  <div>
    <div style={{fontSize: '14px', fontWeight: '500', color: '#111827', maxWidth: '300px'}}>
      {video.title || '未知標題'}
    </div>
    <div style={{marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      <span style={{
        ...styles.badge, 
        backgroundColor: CATEGORY_MAPPING[String(video.categoryId || '').trim()] ? '#dbeafe' : '#fee2e2',
        color: CATEGORY_MAPPING[String(video.categoryId || '').trim()] ? '#1e40af' : '#dc2626'
      }}>
        {getCategoryDisplayName(video.categoryId)}
      </span>
      {video.durationCategory && (
        <span style={{...styles.badge, backgroundColor: '#f3f4f6', color: '#374151'}}>
          {getDurationLabel(video.durationCategory)}
        </span>
      )}
    </div>
    
    {/* Tags显示 */}
    <TagsDisplay tags={video.tags} maxVisible={3} />
    
    {video.videoId && (
      <div style={{marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
        <div style={{fontSize: '12px', color: '#6b7280'}}>
          ID: {video.videoId}
        </div>
        <a 
          href={getYouTubeUrl(video.videoId)} 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.urlLink}
          onClick={(e) => e.stopPropagation()}
        >
          觀看影片
        </a>
      </div>
    )}
  </div>
);

const ScoreInfo = ({ video }) => (
  <div>
    <div style={{...styles.score, ...getScoreColor(video.opportunity_score)}}>
      {(parseFloat(video.opportunity_score) || 0).toFixed(1)}
    </div>
    {video.explosion !== undefined && (
      <div style={{marginTop: '8px', fontSize: '12px', color: '#6b7280'}}>
        爆紅: {(parseFloat(video.explosion) || 0).toFixed(0)}
      </div>
    )}
    {video.momentum !== undefined && (
      <div style={{fontSize: '12px', color: '#6b7280'}}>
        動能: {(parseFloat(video.momentum) || 0).toFixed(0)}
      </div>
    )}
  </div>
);

const ViewInfo = ({ video }) => (
  <div>
    <div style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: '#111827', marginBottom: '4px'}}>
      <span style={{marginLeft: '8px'}}>{formatNumber(video.viewCount)}</span>
    </div>
    {video.channelTotalViews && (
      <div style={{fontSize: '12px', color: '#6b7280'}}>
        頻道總觀看: {formatNumber(video.channelTotalViews)}
      </div>
    )}
  </div>
);

const InteractionInfo = ({ video }) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
    <div style={{display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280'}}>
      <span style={{marginLeft: '4px'}}>{formatNumber(video.likeCount)}</span>
    </div>
    <div style={{fontSize: '14px', color: '#6b7280'}}>
      💬 {formatNumber(video.commentCount)}
    </div>
    {video.engagement !== undefined && (
      <div style={{fontSize: '12px', color: '#6b7280'}}>
        互動率: {(parseFloat(video.engagement) || 0).toFixed(1)}%
      </div>
    )}
  </div>
);

const ChannelInfo = ({ video }) => (
  <div>
    <div style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>
      {video.channelTitle || '未知頻道'}
    </div>
    <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
      訂閱者: {formatNumber(video.channelSubscribers)}
    </div>
    {video.channelVideoCount && (
      <div style={{fontSize: '12px', color: '#6b7280'}}>
        影片數: {formatNumber(video.channelVideoCount)}
      </div>
    )}
    {video.channelId && (
      <div style={{fontSize: '11px', color: '#9ca3af', marginTop: '2px'}}>
        頻道ID: {video.channelId.substring(0, 15)}...
      </div>
    )}
  </div>
);

const TimeInfo = ({ video }) => (
  <div>
    <div style={{fontSize: '12px', color: '#6b7280'}}>
      {formatDate(video.publishedAt)}
    </div>
    {video.durationSeconds && (
      <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
        時長: {formatDuration(video.durationSeconds)}
      </div>
    )}
  </div>
);

export default VideoTable;