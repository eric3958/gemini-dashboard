// FilterControls.jsx
import React from 'react';
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
  setCustomSortMax
}) => {
  return (
    <div style={styles.card}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
        <h2 style={{fontSize: '20px', fontWeight: '600', color: '#111827'}}>篩選與排序</h2>
      </div>
      
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
            <option value="desc">由高到低</option>
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
    </div>
  );
};

export default FilterControls;