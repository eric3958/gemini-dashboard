// YouTubeVideoAnalyzer.jsx
import React from 'react';
import { styles } from '../styles/styles.js';
import { useVideoData } from '../hooks/useVideoData.js';
import ChartsAnalysis from './ChartsAnalysis.jsx';
import Header from './Header.jsx';
import StatisticsOverview from './StatisticsOverview.jsx';
import FilterControls from './FilterControls.jsx';
import VideoTable from './VideoTable.jsx';

const YouTubeVideoAnalyzer = ({ data, handleFileUpload, isLoading }) => {
  console.log('YouTubeVideoAnalyzer 收到的數據:', data?.length || 0, '筆');
  
  // 視頻數據處理邏輯
  const {
    selectedCategory,
    setSelectedCategory,
    selectedChannel,
    setSelectedChannel,
    durationFilter,
    setDurationFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    categories,
    channels,
    currentPage,
    pageSize,
    paginationInfo,
    handlePageChange,
    handlePageSizeChange,
    filteredData, // 分頁後的資料（給 VideoTable 用）
    completeFilteredData, // 完整的篩選資料（給圖表用）
    statistics
  } = useVideoData(data);

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* 頁首和文件上傳 */}
        <Header 
          data={data}
          filteredData={completeFilteredData} // 使用完整篩選資料
          handleFileUpload={handleFileUpload}
          isLoading={isLoading}
        />

        {/* 統計概覽 */}
        <StatisticsOverview statistics={statistics} />

        {data.length > 0 && (
          <ChartsAnalysis 
            data={data}
            filteredData={completeFilteredData} // 使用完整的篩選資料
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        )}

        {/* 篩選控制項 */}
        {data.length > 0 && (
          <FilterControls
            categories={categories}
            channels={channels}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            durationFilter={durationFilter}
            setDurationFilter={setDurationFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}

        {/* 數據表格 */}
        <VideoTable 
          filteredData={filteredData} // 分頁後的資料
          totalDataLength={data.length}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};

export default YouTubeVideoAnalyzer;