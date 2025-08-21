// StatisticsOverview.jsx
import React from 'react';
import { styles } from '../styles/styles.js';
import { formatNumber } from '../utils/formatters.js';

const StatisticsOverview = ({ statistics, filteredCount }) => {
  if (!statistics || statistics.totalVideos === 0) {
    return null;
  }

  return (
    <div style={styles.card}>
        {/* 添加标题显示筛选信息 */}
      <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px'}}>
        <h3 style={{margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#111827'}}>
          数据统计概览 (全部影片)
        </h3>
        <p style={{margin: '0', fontSize: '14px', color: '#6b7280'}}>
          当前筛选显示 {filteredCount || 0} / {statistics.totalVideos} 个影片
        </p>
      </div>
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, backgroundColor: '#dbeafe'}}>
          <div style={styles.statHeader}>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#1d4ed8'}}>總影片數</span>
          </div>
          <p style={{...styles.statValue, color: '#1e40af'}}>{statistics.totalVideos || 0}</p>
        </div>
        
        <div style={{...styles.statCard, backgroundColor: '#f3e8ff'}}>
          <div style={styles.statHeader}>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#7c3aed'}}>總觀看數</span>
          </div>
          <p style={{...styles.statValue, color: '#6d28d9'}}>{formatNumber(statistics.totalViews)}</p>
        </div>
        
        <div style={{...styles.statCard, backgroundColor: '#dcfce7'}}>
          <div style={styles.statHeader}>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#16a34a'}}>平均觀看</span>
          </div>
          <p style={{...styles.statValue, color: '#15803d'}}>{formatNumber(statistics.avgViews)}</p>
        </div>
        
        <div style={{...styles.statCard, backgroundColor: '#fed7aa'}}>
          <div style={styles.statHeader}>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#ea580c'}}>平均機會分</span>
          </div>
          <p style={{...styles.statValue, color: '#c2410c'}}>{statistics.avgOpportunityScore || 0}</p>
        </div>
        
        <div style={{...styles.statCard, backgroundColor: '#fecaca'}}>
          <div style={styles.statHeader}>
            <span style={{fontSize: '14px', fontWeight: '500', color: '#dc2626'}}>最高分數</span>
          </div>
          <p style={{...styles.statValue, color: '#b91c1c'}}>{statistics.topScore || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOverview;