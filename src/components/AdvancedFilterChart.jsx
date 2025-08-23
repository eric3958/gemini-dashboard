// AdvancedFilterChart.jsx - 進階篩選圖表組件
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { styles } from '../styles/styles.js';

const AdvancedFilterChart = ({ filteredData, secondaryFilters }) => {
  const [selectedMetric, setSelectedMetric] = useState('viewCount');
  const [chartType, setChartType] = useState('line');

  // 可選擇的指標
  const metrics = [
    { value: 'viewCount', label: '觀看數', color: '#3b82f6' },
    { value: 'likeCount', label: '按讚數', color: '#10b981' },
    { value: 'commentCount', label: '留言數', color: '#f59e0b' },
    { value: 'channelSubscribers', label: '頻道訂閱數', color: '#8b5cf6' },
    { value: 'channelTotalViews', label: '頻道總觀看數', color: '#ef4444' },
    { value: 'channelVideoCount', label: '頻道影片數', color: '#06b6d4' },
    { value: 'opportunity_score', label: '機會分數', color: '#84cc16' },
    { value: 'explosion', label: '爆紅潛力', color: '#f97316' },
    { value: 'engagement', label: '互動指數', color: '#ec4899' }
  ];

  // 判斷哪個二次篩選條件有設定值
  const getActiveSortingField = () => {
    const activeFilters = [];
    
    // 檢查數值範圍篩選
    const numericFilters = [
      { field: 'channelSubscribers', min: secondaryFilters.channelSubscribersMin, max: secondaryFilters.channelSubscribersMax },
      { field: 'channelTotalViews', min: secondaryFilters.channelTotalViewsMin, max: secondaryFilters.channelTotalViewsMax },
      { field: 'channelVideoCount', min: secondaryFilters.channelVideoCountMin, max: secondaryFilters.channelVideoCountMax },
      { field: 'viewCount', min: secondaryFilters.viewCountMin, max: secondaryFilters.viewCountMax },
      { field: 'likeCount', min: secondaryFilters.likeCountMin, max: secondaryFilters.likeCountMax },
      { field: 'commentCount', min: secondaryFilters.commentCountMin, max: secondaryFilters.commentCountMax },
      { field: 'opportunity_score', min: secondaryFilters.opportunityScoreMin, max: secondaryFilters.opportunityScoreMax },
      { field: 'explosion', min: secondaryFilters.explosionMin, max: secondaryFilters.explosionMax },
      { field: 'engagement', min: secondaryFilters.engagementMin, max: secondaryFilters.engagementMax }
    ];

    numericFilters.forEach(filter => {
      if (filter.min !== '' || filter.max !== '') {
        activeFilters.push(filter.field);
      }
    });

    // 如果有多個活躍的篩選條件，優先返回當前選中的指標
    if (activeFilters.includes(selectedMetric)) {
      return selectedMetric;
    }
    
    // 否則返回第一個活躍的篩選條件
    return activeFilters[0] || 'viewCount';
  };

  // 根據進階篩選條件重新排序數據
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const sortingField = getActiveSortingField();
    
    // 複製數據並按照進階篩選條件排序（降序）
    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = parseFloat(a[sortingField]) || 0;
      const bValue = parseFloat(b[sortingField]) || 0;
      return bValue - aValue; // 降序排列
    });

    // 為圖表準備數據，限制顯示數量以保持可讀性
    const maxItems = Math.min(sortedData.length, 50);
    
    return sortedData.slice(0, maxItems).map((video, index) => {
      const currentMetric = metrics.find(m => m.value === selectedMetric);
      
      return {
        index: index + 1,
        title: video.title?.substring(0, 30) + (video.title?.length > 30 ? '...' : ''),
        fullTitle: video.title,
        value: parseFloat(video[selectedMetric]) || 0,
        channelTitle: video.channelTitle,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        channelSubscribers: video.channelSubscribers,
        channelTotalViews: video.channelTotalViews,
        channelVideoCount: video.channelVideoCount,
        opportunity_score: video.opportunity_score,
        explosion: video.explosion,
        engagement: video.engagement
      };
    });
  }, [filteredData, selectedMetric, secondaryFilters]);

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentMetric = metrics.find(m => m.value === selectedMetric);
      
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            #{data.index}: {data.fullTitle}
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>
            頻道: {data.channelTitle}
          </p>
          <p style={{ color: currentMetric?.color || '#3b82f6', fontWeight: '600' }}>
            {currentMetric?.label}: {data.value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // 檢查是否有進階篩選條件
  const hasSecondaryFilters = () => {
    return Object.values(secondaryFilters).some(value => value !== '');
  };

  if (!hasSecondaryFilters()) {
    return (
      <div style={styles.card}>
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            進階篩選圖表
          </h3>
          <p>請設定進階篩選條件以顯示圖表</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={styles.card}>
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: '#6b7280'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            進階篩選圖表
          </h3>
          <p>沒有符合篩選條件的數據</p>
        </div>
      </div>
    );
  }

  const currentMetric = metrics.find(m => m.value === selectedMetric);

  return (
    <div style={styles.card}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
          進階篩選圖表分析
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={styles.label}>指標選擇:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={styles.select}
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={styles.label}>圖表類型:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={styles.select}
            >
              <option value="line">折線圖</option>
              <option value="bar">長條圖</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#475569'
      }}>
        <p>
          <strong>排序說明：</strong> 
          根據進階篩選條件 "{getActiveSortingField()}" 降序排列，
          顯示前 {chartData.length} 筆數據
        </p>
      </div>

      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="index"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: '影片序列 (按進階篩選條件排序)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: currentMetric?.label || '數值', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={currentMetric?.color || '#3b82f6'}
                strokeWidth={2}
                dot={{ fill: currentMetric?.color || '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="index"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: '影片序列 (按進階篩選條件排序)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: currentMetric?.label || '數值', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={currentMetric?.color || '#3b82f6'}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        * 數據已按照進階篩選的活躍條件重新排序（降序）
      </div>
    </div>
  );
};

export default AdvancedFilterChart;