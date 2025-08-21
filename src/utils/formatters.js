// formatters.js
import { CATEGORY_MAPPING, DURATION_LABELS } from './constants.js';

// 格式化數字顯示
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = parseInt(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

// 獲取時長標籤
export const getDurationLabel = (category) => {
  return DURATION_LABELS[category] || category;
};

// 獲取分數顏色
export const getScoreColor = (score) => {
  const s = parseFloat(score) || 0;
  if (s >= 80) return { color: '#059669', backgroundColor: '#dcfce7' };
  if (s >= 60) return { color: '#2563eb', backgroundColor: '#dbeafe' };
  if (s >= 40) return { color: '#d97706', backgroundColor: '#fef3c7' };
  return { color: '#dc2626', backgroundColor: '#fee2e2' };
};

// 獲取分類顯示名稱
export const getCategoryDisplayName = (categoryId) => {
  const id = String(categoryId || '').trim();
  return CATEGORY_MAPPING[id] || '無法分類';
};

// 生成 YouTube URL
export const getYouTubeUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

// 格式化日期
export const formatDate = (dateString) => {
  if (!dateString) return '未知';
  return new Date(dateString).toLocaleDateString('zh-TW');
};

// 格式化時長
export const formatDuration = (seconds) => {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};