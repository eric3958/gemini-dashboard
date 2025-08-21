// Header.jsx - 臨時修復版本
import React from 'react';
import { styles } from '../styles/styles.js';
import { exportToCSV } from '../utils/csvParser.js';

const Header = ({ 
  data, 
  filteredData, 
  handleFileUpload, 
  isLoading 
}) => {
  const handleExport = () => {
    try {
      exportToCSV(filteredData, 'youtube_analysis_filtered');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          YouTube 影片數據分析器
        </h1>
        <div style={styles.buttonGroup}>
          <label style={{...styles.button, ...styles.uploadButton}}>
            <span>{isLoading ? '讀取中...' : '上傳 CSV 檔案'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{display: 'none'}}
              disabled={isLoading}
            />
          </label>
          {data.length > 0 && (
            <button
              style={{...styles.button, ...styles.exportButton}}
              disabled={filteredData.length === 0}
              onClick={handleExport}
            >
              匯出篩選結果
            </button>
          )}
        </div>
      </div>

      {data.length === 0 && !isLoading && (
        <div style={styles.welcomeState}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
          <h2 style={{fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '16px'}}>
            歡迎使用 YouTube 影片數據分析器
          </h2>
          <p style={{fontSize: '16px', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px'}}>
            上傳您的 YouTube 影片 CSV 數據檔案，即可開始分析影片表現、機會分數和各項指標
          </p>
        </div>
      )}
      
      {isLoading && (
        <div style={styles.welcomeState}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>⏳</div>
          <h2 style={{fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '16px'}}>
            正在處理檔案...
          </h2>
        </div>
      )}
    </div>
  );
};

export default Header;