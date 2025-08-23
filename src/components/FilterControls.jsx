// FilterControls.jsx
import React, { useState } from 'react';
import { styles } from '../styles/styles.js';
import { 
  SORT_OPTIONS, 
  DURATION_FILTER_OPTIONS 
} from '../utils/constants.js';

const FilterControls = ({
  categories,
  channels,
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
  setSecondaryFilters
}) => {
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);

  // 處理二次篩選變更
  const handleSecondaryFilterChange = (filterType, value) => {
    setSecondaryFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // 重置二次篩選
  const resetSecondaryFilters = () => {
    setSecondaryFilters({
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
  };

  return (
    <div style={styles.card}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
        <h2 style={{fontSize: '20px', fontWeight: '600', color: '#111827'}}>篩選與排序</h2>
      </div>
      
      {/* 主要篩選區域 */}
      <div style={styles.filterGrid}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>分類篩選</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部分類</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>頻道篩選</label>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部頻道</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>時長篩選</label>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部時長</option>
            <option value="custom">自定義範圍</option>
            {DURATION_FILTER_OPTIONS.slice(1).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {durationFilter === 'custom' && (
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '8px',
              flexWrap: 'wrap'
            }}>
              <input
                type="number"
                placeholder="最小分鐘"
                value={customDurationMin}
                onChange={(e) => setCustomDurationMin(e.target.value)}
                style={{
                  ...styles.select,
                  width: '80px',
                  fontSize: '14px'
                }}
                min="0"
              />
              <span style={{color: '#6b7280', fontSize: '14px'}}>至</span>
              <input
                type="number"
                placeholder="最大分鐘"
                value={customDurationMax}
                onChange={(e) => setCustomDurationMax(e.target.value)}
                style={{
                  ...styles.select,
                  width: '80px',
                  fontSize: '14px'
                }}
                min="0"
              />
              <span style={{color: '#6b7280', fontSize: '14px'}}>分鐘</span>
            </div>
          )}
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>排序依據</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>排序方式</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={styles.select}
          >
            <option value="desc">由高到低 (預設)</option>
            <option value="asc">由低到高</option>
            <option value="custom">自定義範圍</option>
          </select>
          
          {sortOrder === 'custom' && (
            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '8px',
              flexWrap: 'wrap'
            }}>
              <input
                type="number"
                placeholder="最小值"
                value={customSortMin}
                onChange={(e) => setCustomSortMin(e.target.value)}
                style={{
                  ...styles.select,
                  width: '80px',
                  fontSize: '14px'
                }}
              />
              <span style={{color: '#6b7280', fontSize: '14px'}}>至</span>
              <input
                type="number"
                placeholder="最大值"
                value={customSortMax}
                onChange={(e) => setCustomSortMax(e.target.value)}
                style={{
                  ...styles.select,
                  width: '80px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 二次篩選切換按鈕 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <h3 style={{fontSize: '16px', fontWeight: '600', color: '#111827'}}>進階篩選</h3>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            基於上述篩選結果
          </span>
        </div>
        <button
          onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
          style={{
            ...styles.button,
            backgroundColor: showSecondaryFilters ? '#dbeafe' : '#f3f4f6',
            color: showSecondaryFilters ? '#1d4ed8' : '#374151',
            fontSize: '12px',
            padding: '6px 12px'
          }}
        >
          {showSecondaryFilters ? '收起' : '展開'}
        </button>
      </div>

      {/* 二次篩選區域 */}
      {showSecondaryFilters && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {/* 關鍵字搜尋 */}
          <div style={{marginBottom: '16px'}}>
            <label style={styles.label}>關鍵字搜尋</label>
            <input
              type="text"
              placeholder="搜尋標題內容..."
              value={secondaryFilters.searchKeyword}
              onChange={(e) => handleSecondaryFilterChange('searchKeyword', e.target.value)}
              style={{
                ...styles.select,
                width: '100%'
              }}
            />
          </div>

          {/* 數值範圍篩選 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {/* 頻道訂閱數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>頻道訂閱數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.channelSubscribersMin}
                  onChange={(e) => handleSecondaryFilterChange('channelSubscribersMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.channelSubscribersMax}
                  onChange={(e) => handleSecondaryFilterChange('channelSubscribersMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 頻道總觀看數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>頻道總觀看數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.channelTotalViewsMin}
                  onChange={(e) => handleSecondaryFilterChange('channelTotalViewsMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.channelTotalViewsMax}
                  onChange={(e) => handleSecondaryFilterChange('channelTotalViewsMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 頻道影片數量 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>頻道影片數量</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.channelVideoCountMin}
                  onChange={(e) => handleSecondaryFilterChange('channelVideoCountMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.channelVideoCountMax}
                  onChange={(e) => handleSecondaryFilterChange('channelVideoCountMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 影片觀看數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>影片觀看數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.viewCountMin}
                  onChange={(e) => handleSecondaryFilterChange('viewCountMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.viewCountMax}
                  onChange={(e) => handleSecondaryFilterChange('viewCountMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 按讚數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>按讚數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.likeCountMin}
                  onChange={(e) => handleSecondaryFilterChange('likeCountMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.likeCountMax}
                  onChange={(e) => handleSecondaryFilterChange('likeCountMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 留言數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>留言數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  value={secondaryFilters.commentCountMin}
                  onChange={(e) => handleSecondaryFilterChange('commentCountMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  value={secondaryFilters.commentCountMax}
                  onChange={(e) => handleSecondaryFilterChange('commentCountMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 機會分數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>機會分數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  step="0.1"
                  value={secondaryFilters.opportunityScoreMin}
                  onChange={(e) => handleSecondaryFilterChange('opportunityScoreMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  step="0.1"
                  value={secondaryFilters.opportunityScoreMax}
                  onChange={(e) => handleSecondaryFilterChange('opportunityScoreMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 爆紅潛力 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>爆紅潛力</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  step="0.1"
                  value={secondaryFilters.explosionMin}
                  onChange={(e) => handleSecondaryFilterChange('explosionMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  step="0.1"
                  value={secondaryFilters.explosionMax}
                  onChange={(e) => handleSecondaryFilterChange('explosionMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* 互動指數 */}
            <div style={styles.filterGroup}>
              <label style={styles.label}>互動指數</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <input
                  type="number"
                  placeholder="最小值"
                  step="0.1"
                  value={secondaryFilters.engagementMin}
                  onChange={(e) => handleSecondaryFilterChange('engagementMin', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
                <span style={{color: '#6b7280', fontSize: '12px'}}>至</span>
                <input
                  type="number"
                  placeholder="最大值"
                  step="0.1"
                  value={secondaryFilters.engagementMax}
                  onChange={(e) => handleSecondaryFilterChange('engagementMax', e.target.value)}
                  style={{
                    ...styles.select,
                    width: '90px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 重置按鈕 */}
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={resetSecondaryFilters}
              style={{
                ...styles.button,
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              重置進階篩選
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;