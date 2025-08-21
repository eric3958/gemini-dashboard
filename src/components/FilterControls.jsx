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
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
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
            {DURATION_FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;