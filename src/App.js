import React from 'react';
import YouTubeVideoAnalyzer from './components/YouTubeVideoAnalyzer';
import GeminiAnalysisPanel from './components/GeminiAnalysisPanel';
import { useFileUpload } from './hooks/useFileUpload';



function App() {
  // 把这两个 hook 从 YouTubeVideoAnalyzer 移到这里
  const { data, handleFileUpload, isLoading } = useFileUpload();
  
  return (
    <div className="App">
      <h1>YouTube 分析儀</h1>
      <YouTubeVideoAnalyzer 
        data={data} 
        handleFileUpload={handleFileUpload} 
        isLoading={isLoading} 
      />
      <GeminiAnalysisPanel videoData={data} />
    </div>
  );
}

export default App;