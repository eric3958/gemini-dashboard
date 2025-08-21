// useFileUpload.js
import { useState } from 'react';
import { parseCSV, processCSVData } from '../utils/csvParser.js';

export const useFileUpload = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const text = await file.text();
      const csvData = parseCSV(text);
      const parsedData = processCSVData(csvData);
      
      setData(parsedData);
      
    } catch (error) {
      console.error('檔案讀取錯誤:', error);
      alert(`檔案讀取失敗：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    setData,
    handleFileUpload,
    isLoading
  };
};