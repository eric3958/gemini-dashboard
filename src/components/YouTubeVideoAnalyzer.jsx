// YouTubeVideoAnalyzer.jsx - 更新版本，新增二次篩選支持
import React from 'react';
import { styles } from '../styles/styles.js';
import { useVideoData } from '../hooks/useVideoData.js';
import ChartsAnalysis from './ChartsAnalysis.jsx';
import Header from './Header.jsx';
import StatisticsOverview from './StatisticsOverview.jsx';
import FilterControls from './FilterControls.jsx';
import AdvancedFilterChart from './AdvancedFilterChart.jsx';
import VideoTable from './VideoTable.jsx';

const YouTubeVideoAnalyzer = ({ data, handleFileUpload, isLoading }) => {
  console.log('YouTubeVideoAnalyzer 收到的數據:', data?.length || 0, '筆');
  
  // 視頻數據處理邏輯（包含新的二次篩選）
  const {
    // 原有的篩選狀態
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
    setCustomSortMax,
    
    // 新增的二次篩選狀態
    secondaryFilters,
    setSecondaryFilters,
    
    // 數據
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

        {/* 篩選控制項 - 包含新的二次篩選 */}
        {data.length > 0 && (
          <FilterControls
            // 原有的 props
            categories={categories}
            channels={channels}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
            durationFilter={durationFilter}
            setDurationFilter={setDurationFilter}
            customDurationMin={customDurationMin}
            setCustomDurationMin={setCustomDurationMin}
            customDurationMax={customDurationMax}
            setCustomDurationMax={setCustomDurationMax}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            customSortMin={customSortMin}
            setCustomSortMin={setCustomSortMin}
            customSortMax={customSortMax}
            setCustomSortMax={setCustomSortMax}
            
            // 新增的二次篩選 props
            secondaryFilters={secondaryFilters}
            setSecondaryFilters={setSecondaryFilters}
          />
        )}

        {/* 進階篩選圖表 */}
        {data.length > 0 && (
          <AdvancedFilterChart
            filteredData={completeFilteredData}
            secondaryFilters={secondaryFilters}
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