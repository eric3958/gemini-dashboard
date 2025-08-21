// src/utils/geminiService.js
class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.dailyRequestCount = parseInt(localStorage.getItem('gemini_requests_today') || '0');
    this.lastRequestDate = localStorage.getItem('gemini_last_date') || '';
    this.maxDailyRequests = 1500;
    
    // 调试信息
    console.log('🔧 Gemini Service 初始化:');
    console.log('- API Key 長度:', this.apiKey.length);
    console.log('- API Key 前10字符:', this.apiKey.substring(0, 10));
    console.log('- 今日請求數:', this.dailyRequestCount);
    console.log('- 剩餘請求數:', this.getRemainingRequests());
    
    this.resetDailyCountIfNeeded();
  }

  resetDailyCountIfNeeded() {
    const today = new Date().toDateString();
    if (this.lastRequestDate !== today) {
      console.log('🔄 重置每日請求計數');
      this.dailyRequestCount = 0;
      localStorage.setItem('gemini_requests_today', '0');
      localStorage.setItem('gemini_last_date', today);
      this.lastRequestDate = today;
    }
  }

  getRemainingRequests() {
    return Math.max(0, this.maxDailyRequests - this.dailyRequestCount);
  }

  incrementRequestCount() {
    this.dailyRequestCount++;
    localStorage.setItem('gemini_requests_today', this.dailyRequestCount.toString());
    console.log(`📊 API 請求計數更新: ${this.dailyRequestCount}/${this.maxDailyRequests}`);
  }

  // 🛠️ 工具方法：清理和验证响应
  cleanAndValidateResponse(response) {
    try {
      // 清理响应文本，移除可能的代码块标记
      let cleanedResponse = response
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim();
      
      // 尝试修复常见的JSON格式问题
      if (!cleanedResponse.startsWith('{') && !cleanedResponse.startsWith('[')) {
        // 尝试找到第一个 { 或 [
        const jsonStart = Math.max(
          cleanedResponse.indexOf('{'),
          cleanedResponse.indexOf('[')
        );
        if (jsonStart !== -1) {
          cleanedResponse = cleanedResponse.substring(jsonStart);
        }
      }
      
      // 解析JSON
      const result = JSON.parse(cleanedResponse);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ JSON 解析失敗:', error);
      return { 
        success: false, 
        error: `JSON 解析錯誤: ${error.message}`,
        rawResponse: response
      };
    }
  }

  async makeRequest(prompt) {
    console.log('🚀 開始 Gemini API 請求...');
    
    if (!this.apiKey) {
      const error = '❌ API Key 未設置！請檢查 .env 文件中的 REACT_APP_GEMINI_API_KEY';
      console.error(error);
      throw new Error(error);
    }

    if (this.dailyRequestCount >= this.maxDailyRequests) {
      const error = `❌ 已達到今日API請求限制 (${this.maxDailyRequests})，請明天再試`;
      console.error(error);
      throw new Error(error);
    }

    console.log('📝 請求參數:');
    console.log('- URL:', `${this.baseUrl}?key=${this.apiKey.substring(0, 10)}...`);
    console.log('- Prompt 長度:', prompt.length);

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      console.log('📤 發送請求到 Gemini API...');
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 收到響應:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API 錯誤響應:', errorData);
        throw new Error(`Gemini API 錯誤 (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      this.incrementRequestCount();
      const data = await response.json();
      
      console.log('✅ API 響應成功');
      console.log('- 候選數量:', data.candidates?.length || 0);
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('❌ API 響應格式異常:', data);
        throw new Error('Gemini API 返回格式異常');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      console.log('📜 響應文本長度:', responseText.length);
      console.log('📜 響應文本預覽:', responseText.substring(0, 200) + '...');
      
      return responseText;
      
    } catch (error) {
      console.error('❌ Gemini API 請求失敗:', error);
      
      // 详细的错误诊断
      if (error.message.includes('Failed to fetch')) {
        console.error('🌐 網路連接問題，請檢查網路連接');
      } else if (error.message.includes('API_KEY')) {
        console.error('🔑 API Key 問題，請檢查 API Key 是否有效');
      }
      
      throw error;
    }
  }

  // 🎯 趋势分析
  async analyzeTrends(videoData, limit = 50) {
    console.log(`📊 開始趨勢分析，數據量: ${videoData.length}，分析限制: ${limit}`);
    
    if (!videoData || videoData.length === 0) {
      throw new Error('沒有視頻數據可供分析');
    }
    
    const actualLimit = Math.min(limit, videoData.length);
    const sampleData = videoData.slice(0, actualLimit);
    console.log(`🎯 使用樣本數據: ${sampleData.length} 個視頻`);
    
    const prompt = `
作為YouTube數據分析專家，請分析以下 ${sampleData.length} 個視頻數據並識別趋势。

視頻數據樣本:
${sampleData.map((video, index) => `
${index + 1}. 標題: ${video.title || '無標題'}
   頻道: ${video.channelTitle || '未知頻道'}
   觀看量: ${video.viewCount || 0}
   點讚數: ${video.likeCount || 0}
   評論數: ${video.commentCount || 0}
   發布時間: ${video.publishedAt || '未知'}
   分類: ${video.categoryId || '未知'}
   時長: ${video.durationSeconds || 0}s
   爆紅指數: ${video.explosion || '未知'}
   互動率: ${video.engagement || '未知'}
`).join('')}

請深度分析這 ${sampleData.length} 個視頻，以JSON格式返回分析結果:
{
  "trending_topics": [
    {"topic": "主題名稱", "frequency": 數量, "growth_rate": "增長率"}
  ],
  "viral_patterns": {
    "optimal_duration": "最佳時長範圍",
    "best_categories": ["最熱門分類"],
    "engagement_threshold": "高互動閾值"
  },
  "predictions": {
    "next_hot_topics": ["預測熱門話題"],
    "recommended_strategies": ["建議策略"]
  }
}

只返回JSON，不要其他文字。`;

    try {
      const response = await this.makeRequest(prompt);
      const cleanedResult = this.cleanAndValidateResponse(response);
      
      if (!cleanedResult.success) {
        throw new Error(cleanedResult.error);
      }
      
      console.log('✅ 趨勢分析完成:', cleanedResult.data);
      return {
        success: true,
        data: cleanedResult.data,
        remainingRequests: this.getRemainingRequests()
      };
    } catch (error) {
      console.error('❌ 趨勢分析失敗:', error);
      return {
        success: false,
        error: error.message,
        remainingRequests: this.getRemainingRequests()
      };
    }
  }

  // 🌟 潜力创作者识别
  async identifyRisingCreators(videoData, limit = 30) {
    console.log(`🌟 開始識別潛力創作者，數據量: ${videoData.length}，分析限制: ${limit}`);
    
    if (!videoData || videoData.length === 0) {
      throw new Error('沒有視頻數據可供分析');
    }
    
    const channelStats = this.aggregateByChannel(videoData);
    const actualLimit = Math.min(limit, Object.keys(channelStats).length);
    const topChannels = Object.entries(channelStats)
      .sort((a, b) => b[1].totalViews - a[1].totalViews)
      .slice(0, actualLimit);

    console.log(`📈 分析 ${topChannels.length} 個頻道`);

    const prompt = `
作為YouTube創作者分析專家，請深度分析以下 ${topChannels.length} 個頻道數據，識別最有潛力的創作者。

頻道數據:
${topChannels.map(([channel, stats], index) => `
${index + 1}. 頻道: ${channel}
   總觀看量: ${stats.totalViews}
   平均觀看量: ${stats.avgViews}
   視頻數量: ${stats.videoCount}
   訂閱數: ${stats.subscribers || '未知'}
   平均互動率: ${stats.avgEngagement?.toFixed(2) || '未知'}
   最近表現: ${stats.recentPerformance}
`).join('')}

基於這 ${topChannels.length} 個頻道的數據，請以JSON格式返回分析結果:
{
  "rising_stars": [
    {
      "channel": "頻道名",
      "potential_score": 85,
      "growth_indicators": ["指標1", "指標2"],
      "strengths": ["優勢1", "優勢2"],
      "recommendations": ["建議1", "建議2"]
    }
  ],
  "breakout_candidates": [
    {
      "channel": "頻道名",
      "breakout_probability": 0.75,
      "key_factors": ["因素1", "因素2"],
      "timeline": "預計爆紅時間"
    }
  ]
}

只返回JSON，不要其他文字。`;

    try {
      const response = await this.makeRequest(prompt);
      const cleanedResult = this.cleanAndValidateResponse(response);
      
      if (!cleanedResult.success) {
        throw new Error(cleanedResult.error);
      }
      
      console.log('✅ 潛力創作者分析完成:', cleanedResult.data);
      return {
        success: true,
        data: cleanedResult.data,
        remainingRequests: this.getRemainingRequests()
      };
    } catch (error) {
      console.error('❌ 潛力創作者分析失敗:', error);
      return {
        success: false,
        error: error.message,
        remainingRequests: this.getRemainingRequests()
      };
    }
  }

  // 🎬 内容策略建议
  async generateContentStrategy(videoData, limit = 25) {
    console.log(`🎬 生成內容策略建議，數據量: ${videoData.length}，分析限制: ${limit}`);
    
    if (!videoData || videoData.length === 0) {
      throw new Error('沒有視頻數據可供分析');
    }
    
    let topPerformers = videoData
      .filter(video => video.explosion !== undefined)
      .sort((a, b) => (b.explosion || 0) - (a.explosion || 0))
      .slice(0, Math.min(limit, videoData.length));

    if (topPerformers.length === 0) {
      topPerformers = videoData
        .sort((a, b) => (parseInt(b.viewCount) || 0) - (parseInt(a.viewCount) || 0))
        .slice(0, Math.min(limit, videoData.length));
    }

    console.log(`🏆 分析 ${topPerformers.length} 個高表現視頻`);

    const prompt = `
作為YouTube內容策略顧問，基於以下 ${topPerformers.length} 個高表現視頻數據，為創作者提供全面的內容策略建議。

高表現視頻數據:
${topPerformers.map((video, index) => `
${index + 1}. 標題: ${video.title || '無標題'}
   觀看量: ${video.viewCount || 0}
   爆紅指數: ${video.explosion || 0}
   時長: ${video.durationSeconds || 0}s
   互動率: ${video.engagement || 0}
   發布時間: ${video.publishedAt || '未知'}
   分類: ${video.categoryId || '未知'}
`).join('')}

基於這 ${topPerformers.length} 個高表現視頻的深度分析，請以JSON格式返回策略建議:
{
  "title_optimization": {
    "effective_patterns": ["模式1", "模式2"],
    "keywords_to_include": ["關鍵詞1", "關鍵詞2"],
    "avoid_patterns": ["避免模式1"]
  },
  "content_timing": {
    "optimal_duration": "最佳時長",
    "best_upload_times": ["時間1", "時間2"],
    "frequency_recommendation": "發布頻率建議"
  },
  "trend_opportunities": {
    "hot_topics": ["熱門話題1", "熱門話題2"],
    "content_gaps": ["內容空白1", "內容空白2"],
    "collaboration_suggestions": ["合作建議1"]
  }
}

只返回JSON，不要其他文字。`;

    try {
      const response = await this.makeRequest(prompt);
      const cleanedResult = this.cleanAndValidateResponse(response);
      
      if (!cleanedResult.success) {
        throw new Error(cleanedResult.error);
      }
      
      console.log('✅ 內容策略生成完成:', cleanedResult.data);
      return {
        success: true,
        data: cleanedResult.data,
        remainingRequests: this.getRemainingRequests()
      };
    } catch (error) {
      console.error('❌ 內容策略生成失敗:', error);
      return {
        success: false,
        error: error.message,
        remainingRequests: this.getRemainingRequests()
      };
    }
  }

  // 🎥 视频优化建议
  async optimizeVideo(videoInfo) {
    console.log(`🎥 開始視頻優化分析: ${videoInfo.title}`);
    
    const prompt = `
作為YouTube優化專家，請為以下視頻提供全面的優化建議：

視頻信息:
標題: ${videoInfo.title}
描述: ${videoInfo.description || '無描述'}
標籤: ${videoInfo.tags?.join(', ') || '無標籤'}
觀看量: ${videoInfo.viewCount || 0}
點讚數: ${videoInfo.likeCount || 0}
評論數: ${videoInfo.commentCount || 0}
時長: ${videoInfo.durationSeconds || 0}秒
分類: ${videoInfo.categoryId || '未知'}

請以JSON格式返回優化建議:
{
  "title_suggestions": {
    "improved_titles": ["優化標題1", "優化標題2"],
    "seo_keywords": ["SEO關鍵詞1", "SEO關鍵詞2"],
    "emotional_triggers": ["情感觸發詞1", "情感觸發詞2"]
  },
  "description_optimization": {
    "structure_tips": ["結構建議1", "結構建議2"],
    "keyword_placement": "關鍵詞布局建議",
    "call_to_action": "行動呼籲建議"
  },
  "engagement_tactics": {
    "thumbnail_tips": ["縮圖建議1", "縮圖建議2"],
    "hook_strategies": ["開場吸引策略1", "開場吸引策略2"],
    "retention_techniques": ["留存技巧1", "留存技巧2"]
  },
  "performance_prediction": {
    "estimated_improvement": "預估提升幅度",
    "success_probability": "成功機率",
    "timeline": "見效時間"
  }
}

只返回JSON，不要其他文字。`;

    try {
      const response = await this.makeRequest(prompt);
      const cleanedResult = this.cleanAndValidateResponse(response);
      
      if (!cleanedResult.success) {
        throw new Error(cleanedResult.error);
      }
      
      console.log('✅ 視頻優化建議完成:', cleanedResult.data);
      return {
        success: true,
        data: cleanedResult.data,
        remainingRequests: this.getRemainingRequests()
      };
    } catch (error) {
      console.error('❌ 視頻優化建議失敗:', error);
      return {
        success: false,
        error: error.message,
        remainingRequests: this.getRemainingRequests()
      };
    }
  }

  // 📊 竞争对手分析
  async analyzeCompetitors(videoData, targetChannel, limit = 20) {
    console.log(`📊 開始競爭對手分析，目標頻道: ${targetChannel}`);
    
    if (!videoData || videoData.length === 0) {
      throw new Error('沒有視頻數據可供分析');
    }
    
    const targetVideos = videoData.filter(video => video.channelTitle === targetChannel);
    const targetCategories = [...new Set(targetVideos.map(v => v.categoryId))];
    const competitors = videoData
      .filter(video => 
        video.channelTitle !== targetChannel && 
        targetCategories.includes(video.categoryId)
      )
      .slice(0, limit);

    console.log(`🎯 找到 ${competitors.length} 個競爭對手視頻`);

    const prompt = `
作為YouTube競爭分析專家，請分析目標頻道與競爭對手的差異。

目標頻道: ${targetChannel}
目標頻道視頻樣本:
${targetVideos.slice(0, 10).map((video, index) => `
${index + 1}. 標題: ${video.title}
   觀看量: ${video.viewCount}
   互動率: ${video.engagement}
`).join('')}

競爭對手數據:
${competitors.slice(0, 15).map((video, index) => `
${index + 1}. 頻道: ${video.channelTitle}
   標題: ${video.title}
   觀看量: ${video.viewCount}
   互動率: ${video.engagement}
`).join('')}

請以JSON格式返回競爭分析:
{
  "competitive_position": {
    "market_position": "市場地位",
    "relative_strength": "相對優勢",
    "weaknesses": ["弱點1", "弱點2"]
  },
  "competitor_insights": [
    {
      "channel": "競爭對手名稱",
      "advantage": "他們的優勢",
      "learn_from": "可學習的地方"
    }
  ],
  "recommendations": {
    "differentiation_strategy": "差異化策略",
    "improvement_areas": ["改進領域1", "改進領域2"],
    "opportunity_gaps": ["機會空白1", "機會空白2"]
  }
}

只返回JSON，不要其他文字。`;

    try {
      const response = await this.makeRequest(prompt);
      const cleanedResult = this.cleanAndValidateResponse(response);
      
      if (!cleanedResult.success) {
        throw new Error(cleanedResult.error);
      }
      
      console.log('✅ 競爭對手分析完成:', cleanedResult.data);
      return {
        success: true,
        data: cleanedResult.data,
        remainingRequests: this.getRemainingRequests()
      };
    } catch (error) {
      console.error('❌ 競爭對手分析失敗:', error);
      return {
        success: false,
        error: error.message,
        remainingRequests: this.getRemainingRequests()
      };
    }
  }

  // 辅助方法：按频道聚合数据
  aggregateByChannel(videoData) {
    const channelStats = {};
    
    videoData.forEach(video => {
      const channel = video.channelTitle || '未知頻道';
      if (!channelStats[channel]) {
        channelStats[channel] = {
          totalViews: 0,
          videoCount: 0,
          subscribers: parseInt(video.channelSubscribers) || 0,
          totalEngagement: 0,
          recentViews: []
        };
      }
      
      const views = parseInt(video.viewCount) || 0;
      const engagement = parseFloat(video.engagement) || 0;
      
      channelStats[channel].totalViews += views;
      channelStats[channel].videoCount++;
      channelStats[channel].totalEngagement += engagement;
      channelStats[channel].recentViews.push(views);
    });
    
    // 计算平均值
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel];
      stats.avgViews = Math.round(stats.totalViews / stats.videoCount);
      stats.avgEngagement = stats.totalEngagement / stats.videoCount;
      
      const recentAvg = stats.recentViews.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, stats.recentViews.length);
      stats.recentPerformance = recentAvg > stats.avgViews ? '上升' : '穩定';
    });
    
    return channelStats;
  }

  // 🔧 服务状态检查
  getServiceStatus() {
    return {
      apiKeyConfigured: !!this.apiKey,
      dailyRequestsUsed: this.dailyRequestCount,
      remainingRequests: this.getRemainingRequests(),
      requestLimitReached: this.dailyRequestCount >= this.maxDailyRequests,
      lastRequestDate: this.lastRequestDate
    };
  }

  // 🧹 重置请求计数（仅用于测试）
  resetRequestCount() {
    this.dailyRequestCount = 0;
    localStorage.setItem('gemini_requests_today', '0');
    console.log('🔄 請求計數已重置');
  }
}

export default new GeminiService();