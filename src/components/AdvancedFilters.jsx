// AdvancedFilters.jsx
import React, { useState } from 'react';
import { styles } from '../styles/styles.js';

const AdvancedFilters = ({ advancedFilters, setAdvancedFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = [
    { key: 'viewCount', label: '觀看數' },
    { key: 'likeCount', label: '按讚數' },
    { key: 'commentCount', label: '留言數' },
    { key: 'channelSubscribers', label: '頻道訂閱數' },
    { key: 'channelTotalViews', label: '頻道總觀看數' },
    { key: 'opportunityScore', label: '機會分數' }
  ];

  const updateFilter = (key, field, value) => {
    setAdvancedFilters({
      ...advancedFilters,
      [key]: {
        ...advancedFilters[key],
        [field]: value
      }
    });
  };

  const toggleFilter = (key) => {
    setAdvancedFilters({
      ...advancedFilters,
      [key]: {
        ...advancedFilters[key],
        enabled: !advancedFilters[key].enabled
      }
    });
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    Object.keys(advancedFilters).forEach(key => {
      clearedFilters[key] = { min: '', max: '', enabled: false };
    });
    setAdvancedFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(advancedFilters).filter(filter => filter.enabled).length;
  };

  return (
    <div style={styles.card}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', color: '#111827'}}>進階篩選</h2>
          {getActiveFiltersCount() > 0 && (
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {getActiveFiltersCount()} 個條件
            </span>
          )}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              style={{
                fontSize: '12px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                textDecoration: 'underline'
              }}
            >
              清除全部
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              fontSize: '14px',
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {isExpanded ? '收起' : '展開'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {filterOptions.map(({ key, label }) => (
            <div key={key} style={{
              border: advancedFilters[key].enabled ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: advancedFilters[key].enabled ? '#eff6ff' : 'white'
            }}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                <input
                  type="checkbox"
                  checked={advancedFilters[key].enabled}
                  onChange={() => toggleFilter(key)}
                  style={{marginRight: '8px'}}
                />
                <label style={{fontSize: '14px', fontWeight: '500', color: '#111827'}}>
                  {label}
                </label>
              </div>
              
              {advancedFilters[key].enabled && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input
                    type="number"
                    placeholder="最小值"
                    value={advancedFilters[key].min}
                    onChange={(e) => updateFilter(key, 'min', e.target.value)}
                    style={{
                      ...styles.select,
                      fontSize: '14px',
                      width: '100px'
                    }}
                  />
                  <span style={{color: '#6b7280', fontSize: '14px'}}>至</span>
                  <input
                    type="number"
                    placeholder="最大值"
                    value={advancedFilters[key].max}
                    onChange={(e) => updateFilter(key, 'max', e.target.value)}
                    style={{
                      ...styles.select,
                      fontSize: '14px',
                      width: '100px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;