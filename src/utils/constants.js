// constants.js

// YouTube 分類ID對應表
export const CATEGORY_MAPPING = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles", 
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
  "30": "Movies",
  "31": "Anime/Animation",
  "32": "Action/Adventure",
  "33": "Classics",
  "34": "Comedy",
  "35": "Documentary",
  "36": "Drama",
  "37": "Family",
  "38": "Foreign",
  "39": "Horror",
  "40": "Sci-Fi/Fantasy",
  "41": "Thriller",
  "42": "Shorts",
  "43": "Shows",
  "44": "Trailers"
};

// 時長分類標籤
export const DURATION_LABELS = {
  'short': '短片 (≤2分)',
  'normal': '一般 (2-10分)',
  'medium': '中等 (10-20分)',
  'long': '長片 (20-35分)',
  'movie': '電影 (≥35分)',
  'unknown': '未知'
};

// 排序選項
export const SORT_OPTIONS = [
  { value: 'opportunity_score', label: '機會分數' },
  { value: 'viewCount', label: '觀看數' },
  { value: 'likeCount', label: '按讚數' },
  { value: 'commentCount', label: '留言數' },
  { value: 'explosion', label: '爆紅潛力' },
  { value: 'channelSubscribers', label: '頻道訂閱數' },
  { value: 'channelTotalViews', label: '頻道總觀看數' },
  { value: 'publishedAt', label: '發布日期' }
];

// 顯示數量選項
export const SHOW_COUNT_OPTIONS = [
  { value: 10, label: '前 10 名' },
  { value: 20, label: '前 20 名' },
  { value: 50, label: '前 50 名' },
  { value: 100, label: '前 100 名' }
];

// 時長篩選選項
export const DURATION_FILTER_OPTIONS = [
  { value: 'all', label: '全部時長' },
  { value: 'short', label: '短片 (≤2分)' },
  { value: 'normal', label: '一般 (2-10分)' },
  { value: 'medium', label: '中等 (10-20分)' },
  { value: 'long', label: '長片 (20-35分)' },
  { value: 'movie', label: '電影 (≥35分)' }
];