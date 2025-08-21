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
        y: views,     // 觀看數
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

  // 橫條圖數據：分類平均表現
  const barData = useMemo(() => {
    const categoryStats = {};
    
    chartData.forEach(item => {
      const category = getCategoryDisplayName(item.categoryId);
      const score = parseFloat(item.opportunity_score) || 0;
      
      if (!categoryStats[category]) {
        categoryStats[category] = { scores: [], views: [] };
      }
      
      categoryStats[category].scores.push(score);
      categoryStats[category].views.push(parseInt(item.viewCount) || 0);
    });

    return Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        avgScore: (stats.scores.reduce((sum, s) => sum + s, 0) / stats.scores.length).toFixed(1),
        avgViews: Math.round(stats.views.reduce((sum, v) => sum + v, 0) / stats.views.length),
        count: stats.scores.length
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
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
                domain={[1, 5000]}
                allowDataOverflow={true}
                stroke="#6b7280"
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="觀看數"
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

        {/* 橫條圖：分類平均表現 */}
        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 分類平均表現橫條圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            按平均機會分數排序的分類表現{isFiltered ? '（基於篩選結果）' : ''}
          </p>
          <ResponsiveContainer width="100%" height={Math.max(300, barData.length * 50)}>
            <BarChart 
              data={barData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number"
                stroke="#6b7280"
              />
              <YAxis 
                dataKey="category" 
                type="category"
                tick={{fontSize: 12, fill: '#374151'}}
                width={90}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === '平均分數') return [value, name];
                  return [formatNumber(value), name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const data = payload[0].payload;
                    return `${data.category} (${data.count} 個影片)`;
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
                dataKey="avgScore" 
                fill="#8884d8" 
                name="平均分數" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsAnalysis;