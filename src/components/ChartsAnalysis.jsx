// ChartsAnalysis.jsx
import React, { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { styles } from '../styles/styles.js';
import { formatNumber, getCategoryDisplayName } from '../utils/formatters.js';

const ChartsAnalysis = ({ data, filteredData }) => {
  // 散點圖數據：觀看數 vs 機會分數
  const scatterData = useMemo(() => {
    return data.map(item => {
      const views = parseInt(item.viewCount) || 0;
      const score = parseFloat(item.opportunity_score) || 0;
      const likes = parseInt(item.likeCount) || 0;
      const comments = parseInt(item.commentCount) || 0;
      const interactionRate = views > 0 ? ((likes + comments) / views * 100) : 0;
      
      return {
        x: views,
        y: score,
        z: Math.max(interactionRate * 100, 10), // 點大小，最小為10
        title: item.title || '',
        videoUrl: item.videoUrl || '',
        category: getCategoryDisplayName(item.categoryId),
        interactionRate: interactionRate.toFixed(2)
      };
    });
  }, [data]);

  // 圓餅圖數據：分類分布
  const pieData = useMemo(() => {
    const categoryCount = {};
    
    data.forEach(item => {
      const category = getCategoryDisplayName(item.categoryId);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [data]);

  // 橫條圖數據：分類平均表現
  const barData = useMemo(() => {
    const categoryStats = {};
    
    data.forEach(item => {
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
  }, [data]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  if (!data.length) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <h3>📊 暫無數據可供分析</h3>
          <p>請上傳 CSV 檔案或調整篩選條件</p>
        </div>
      </div>
    );
  }

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
        </h2>
        <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px' }}>
          基於 {data.length} 個影片的數據分析結果
        </p>
      </div>

      {/* 圖表網格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        
        {/* 散點圖：觀看數 vs 機會分數 */}
        <div style={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 觀看數 vs 機會分數散點圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            點大小代表互動率，越大表示互動率越高
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="觀看數"
                tickFormatter={formatNumber}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="機會分數"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '12px',
                        maxWidth: '300px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {data.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                          <div style={{ marginBottom: '2px' }}>分類: {data.category}</div>
                          <div style={{ marginBottom: '2px' }}>觀看數: {formatNumber(data.x)}</div>
                          <div>機會分數: {data.y}</div>
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
            前10大分類佔比分析
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
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 橫條圖：分類平均表現 */}
        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 分類平均表現橫條圖
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            按平均機會分數排序的分類表現
          </p>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                type="category"
                tick={{fontSize: 12}}
                interval={0}
              />
              <YAxis type="number" />
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
              />
              <Bar dataKey="avgScore" fill="#8884d8" name="平均分數" maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsAnalysis;