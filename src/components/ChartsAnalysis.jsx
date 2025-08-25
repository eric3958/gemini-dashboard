// ChartsAnalysis.jsx
import React, { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { styles } from '../styles/styles.js';
import { formatNumber, getCategoryDisplayName } from '../utils/formatters.js';

const ChartsAnalysis = ({ data, filteredData, sortBy, sortOrder }) => {
  // 使用 filteredData 而不是原始 data 来生成图表
  const chartData = filteredData && filteredData.length > 0 ? filteredData : data;

  // 排序邏輯函數
  const sortData = (data, sortBy, sortOrder) => {
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'viewCount':
          aValue = parseInt(a.viewCount) || 0;
          bValue = parseInt(b.viewCount) || 0;
          break;
        case 'likeCount':
          aValue = parseInt(a.likeCount) || 0;
          bValue = parseInt(b.likeCount) || 0;
          break;
        case 'commentCount':
          aValue = parseInt(a.commentCount) || 0;
          bValue = parseInt(b.commentCount) || 0;
          break;
        case 'opportunity_score':
          aValue = parseFloat(a.opportunity_score) || 0;
          bValue = parseFloat(b.opportunity_score) || 0;
          break;
        case 'publishedAt':
          aValue = new Date(a.publishedAt);
          bValue = new Date(b.publishedAt);
          break;
        case 'duration':
          aValue = parseInt(a.duration) || 0;
          bValue = parseInt(b.duration) || 0;
          break;
        default:
          aValue = parseFloat(a.opportunity_score) || 0;
          bValue = parseFloat(b.opportunity_score) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  // 散點圖數據：影片序列 vs 觀看數
  const scatterData = useMemo(() => {
    // 如果沒有提供排序參數，使用默認排序
    const sortedData = sortBy && sortOrder ? 
      sortData(chartData, sortBy, sortOrder) : 
      chartData;
    
    return sortedData.map((item, index) => {
      const views = parseInt(item.viewCount) || 0;
      const score = parseFloat(item.opportunity_score) || 0;
      const likes = parseInt(item.likeCount) || 0;
      const comments = parseInt(item.commentCount) || 0;
      const interactionRate = views > 0 ? ((likes + comments) / views * 100) : 0;
      
      return {
        x: index + 1, // 影片序列（從1開始）
        y: Math.max(views, 1), // 確保觀看數至少為1（避免log(0)問題）
        z: Math.max(interactionRate * 100, 10), // 點大小，最小為10
        title: item.title || '',
        videoUrl: item.videoUrl || '',
        category: getCategoryDisplayName(item.categoryId),
        interactionRate: interactionRate.toFixed(2),
        score: score,
        rank: index + 1
      };
    });
  }, [chartData, sortBy, sortOrder]);

  // 圓餅圖數據：分類分布
  const pieData = useMemo(() => {
    const categoryCount = {};
    
    chartData.forEach(item => {
      const category = getCategoryDisplayName(item.categoryId);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [chartData]);

  // 直條圖數據：分類總觀看數
  const barData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const categoryStats = {};
    
    chartData.forEach((item, index) => {
      let category = '未分類';
      try {
        if (item.categoryId) {
          if (typeof getCategoryDisplayName === 'function') {
            category = getCategoryDisplayName(item.categoryId) || `分類${item.categoryId}`;
          } else {
            category = `分類${item.categoryId}`;
          }
        }
      } catch (e) {
        category = `分類${item.categoryId || index}`;
      }
      
      const views = parseInt(item.viewCount) || 0;
      
      if (!categoryStats[category]) {
        categoryStats[category] = { totalViews: 0, count: 0 };
      }
      
      categoryStats[category].totalViews += views;
      categoryStats[category].count++;
    });

    return Object.keys(categoryStats).map(category => {
      const stats = categoryStats[category];
      
      return {
        category: category.length > 10 ? category.substring(0, 10) + '...' : category,
        fullCategory: category,
        totalViews: stats.totalViews,
        count: stats.count
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 12);
  }, [chartData]);

  // 堆疊條形圖數據：分類 × 時長分組觀看數
  const stackedBarData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    // 時長解析函數
    const parseDuration = (duration) => {
      if (!duration) return 0;
      
      // 如果已經是數字，假設是秒數
      if (typeof duration === 'number') {
        return duration;
      }
      
      const str = String(duration).trim();
      
      // 嘗試解析 HH:MM:SS 或 MM:SS 格式
      if (str.includes(':')) {
        const parts = str.split(':').map(p => parseInt(p) || 0);
        if (parts.length === 3) { // HH:MM:SS
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) { // MM:SS
          return parts[0] * 60 + parts[1];
        }
      }
      
      // 嘗試解析純數字（可能是秒數或分鐘數）
      const num = parseFloat(str);
      if (!isNaN(num)) {
        // 如果數字很小（<300），可能是分鐘數，轉換為秒數
        return num > 300 ? num : num * 60;
      }
      
      return 0;
    };

    const categoryStats = {};
    
    chartData.forEach((item, index) => {
      let category = '未分類';
      try {
        if (item.categoryId) {
          if (typeof getCategoryDisplayName === 'function') {
            category = getCategoryDisplayName(item.categoryId) || `分類${item.categoryId}`;
          } else {
            category = `分類${item.categoryId}`;
          }
        }
      } catch (e) {
        category = `分類${item.categoryId || index}`;
      }
      
      const views = parseInt(item.viewCount) || 0;
      // 優先使用 durationSeconds，如果沒有再用 duration
      const durationSeconds = item.durationSeconds || parseDuration(item.duration);
      
      if (!categoryStats[category]) {
        categoryStats[category] = { 
          shortViews: 0, mediumViews: 0, longViews: 0,
          shortCount: 0, mediumCount: 0, longCount: 0,
          durations: [] // 用於調試
        };
      }
      
      // 記錄原始時長用於調試
      categoryStats[category].durations.push({
        original: item.duration,
        durationSeconds: item.durationSeconds,
        parsed: durationSeconds,
        category: durationSeconds <= 120 ? '短' : durationSeconds <= 1200 ? '中' : '長'
      });
      
      // 按時長分組
      if (durationSeconds <= 120) { // ≤2分鐘
        categoryStats[category].shortViews += views;
        categoryStats[category].shortCount++;
      } else if (durationSeconds <= 1200) { // 2-20分鐘
        categoryStats[category].mediumViews += views;
        categoryStats[category].mediumCount++;
      } else { // >20分鐘
        categoryStats[category].longViews += views;
        categoryStats[category].longCount++;
      }
    });

    // 調試信息：輸出前幾個分類的時長解析結果
    if (typeof console !== 'undefined' && console.log) {
      const firstCategory = Object.keys(categoryStats)[0];
      if (firstCategory && categoryStats[firstCategory].durations.length > 0) {
        console.log('=== 時長解析調試信息 ===');
        console.log('分類:', firstCategory);
        console.log('前5個影片時長:', categoryStats[firstCategory].durations.slice(0, 5));
        console.log('統計結果:', {
          短影片: categoryStats[firstCategory].shortCount,
          中等影片: categoryStats[firstCategory].mediumCount,
          長影片: categoryStats[firstCategory].longCount
        });
        // 檢查原始數據結構
        if (chartData && chartData[0]) {
          console.log('原始數據範例:', chartData[0]);
          console.log('可用的時長相關欄位:', Object.keys(chartData[0]).filter(key => 
            key.toLowerCase().includes('duration') || 
            key.toLowerCase().includes('length') ||
            key.toLowerCase().includes('time')
          ));
        }
      }
    }

    return Object.keys(categoryStats).map(category => {
      const stats = categoryStats[category];
      const totalCount = stats.shortCount + stats.mediumCount + stats.longCount;
      
      return {
        category: category.length > 10 ? category.substring(0, 10) + '...' : category,
        fullCategory: category,
        shortViews: stats.shortViews,
        mediumViews: stats.mediumViews,
        longViews: stats.longViews,
        shortCount: stats.shortCount,
        mediumCount: stats.mediumCount,
        longCount: stats.longCount,
        totalCount: totalCount
      };
    })
    .filter(item => item.totalCount > 0)
    .sort((a, b) => (b.shortViews + b.mediumViews + b.longViews) - (a.shortViews + a.mediumViews + a.longViews))
    .slice(0, 12);
  }, [chartData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  if (!chartData.length) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <h3>📊 暫無數據可供分析</h3>
          <p>請上傳 CSV 檔案或調整篩選條件</p>
        </div>
      </div>
    );
  }

  // 计算筛选状态提示
  const isFiltered = filteredData && filteredData.length !== data.length;
  const filterInfo = isFiltered ? 
    `顯示 ${chartData.length} 個影片（已篩選自 ${data.length} 個影片）` : 
    `基於 ${chartData.length} 個影片的數據分析結果`;

  return (
    <div>
      {/* 標題 */}
      <div style={{...styles.card, marginBottom: '16px'}}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#111827',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📈 智能分析圖表
          {isFiltered && (
            <span style={{
              fontSize: '14px',
              fontWeight: '400',
              color: '#059669',
              backgroundColor: '#dcfce7',
              padding: '4px 8px',
              borderRadius: '12px',
              border: '1px solid #bbf7d0'
            }}>
              已篩選
            </span>
          )}
        </h2>
        <p style={{ 
          color: isFiltered ? '#059669' : '#6b7280', 
          margin: '8px 0 0 0', 
          fontSize: '14px',
          fontWeight: isFiltered ? '500' : 'normal'
        }}>
          {filterInfo}
        </p>
      </div>

      {/* 圖表網格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* 散點圖：影片序列 vs 觀看數 */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 影片序列 vs 觀看數散點圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            按當前排序顯示影片觀看數分布趨勢。點大小代表互動率，點擊散點可開啟影片連結
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="影片序列"
                domain={[1, scatterData.length]}
                allowDataOverflow={false}
                stroke="#6b7280"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="觀看數"
                scale="log"
                domain={[1, 'dataMax']}
                tickFormatter={formatNumber}
                stroke="#6b7280"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '12px',
                        maxWidth: '300px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                          color: '#111827'
                        }}>
                          第 {data.rank} 部：{data.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                          <div style={{ marginBottom: '2px' }}>分類: {data.category}</div>
                          <div style={{ marginBottom: '2px' }}>觀看數: {formatNumber(data.y)}</div>
                          <div style={{ marginBottom: '2px' }}>機會分數: {data.score}</div>
                          <div>互動率: {data.interactionRate}%</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                name="影片" 
                data={scatterData} 
                fill="#8884d8"
                onClick={(data) => {
                  if (data && data.videoUrl) {
                    window.open(data.videoUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 圓餅圖：分類分布 */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            🥧 分類影片數量分布圓餅圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            {isFiltered ? '篩選結果的' : ''}前10大分類佔比分析
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} 個影片`, '數量']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 直條圖：分類總觀看數 */}
        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 分類總觀看數直條圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            按總觀看數排序的分類表現{isFiltered ? '（基於篩選結果）' : ''}（共 {barData.length} 個分類）
          </p>
          
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category"
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={formatNumber}
                  label={{ value: '總觀看數', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [formatNumber(value), '總觀看數']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.fullCategory} (${data.count} 個影片)`;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="totalViews" 
                  fill="#10b981" 
                  name="總觀看數"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>暫無數據</div>
              <div style={{ fontSize: '14px' }}>請檢查數據格式或篩選條件</div>
            </div>
          )}
        </div>

        {/* 群組條形圖：分類 × 時長分組觀看數 */}
        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 分類按影片時長分組觀看數分析
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            各分類在不同時長的影片觀看表現{isFiltered ? '（基於篩選結果）' : ''}
            <br />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></span>
                短影片 (≤2分鐘)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></span>
                中等影片 (2-20分鐘)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '2px' }}></span>
                長影片 (>20分鐘)
              </span>
            </span>
          </p>
          
          {stackedBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={stackedBarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category"
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={formatNumber}
                  label={{ value: '觀看數', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: '#fff',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
                            {data.fullCategory} (共 {data.totalCount} 個影片)
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                              短影片: {formatNumber(data.shortViews)} ({data.shortCount}部)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
                              中等影片: {formatNumber(data.mediumViews)} ({data.mediumCount}部)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ width: '8px', height: '8px', backgroundColor: '#f97316', borderRadius: '50%' }}></span>
                              長影片: {formatNumber(data.longViews)} ({data.longCount}部)
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="shortViews" 
                  fill="#10b981" 
                  name="短影片 (≤2分鐘)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="mediumViews" 
                  fill="#3b82f6" 
                  name="中等影片 (2-20分鐘)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="longViews" 
                  fill="#f97316" 
                  name="長影片 (>20分鐘)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>暫無數據</div>
              <div style={{ fontSize: '14px' }}>請檢查數據格式或篩選條件</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsAnalysis;