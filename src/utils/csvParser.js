// csvParser.js

// 簡化的 CSV 解析函數
export const parseCSV = (text) => {
  const lines = text.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++; // 跳過下一個引號
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim()); // 添加最後一個字段
    result.push(row);
  }
  
  return result;
};

// 處理 CSV 數據轉換為對象數組
export const processCSVData = (csvData) => {
  if (csvData.length === 0) {
    throw new Error('檔案內容為空');
  }

  const headers = csvData[0].map(h => h.replace(/"/g, '').trim());
  const dataRows = csvData.slice(1);
  
  const parsedData = dataRows.map((row, index) => {
    const item = {};
    headers.forEach((header, colIndex) => {
      item[header] = row[colIndex] || '';
    });
    return item;
  });

  return parsedData;
};

// 導出 CSV 數據
export const exportToCSV = (data, filename = 'youtube_analysis') => {
  if (data.length === 0) {
    throw new Error('沒有資料可以匯出');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};