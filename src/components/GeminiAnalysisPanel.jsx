import React, { useState, useEffect } from 'react';
import './GeminiAnalysisPanel.css';

const GeminiAnalysisPanel = ({ videoData = [] }) => {
  const [creatorData, setCreatorData] = useState([]);
  const [aiThresholds, setAiThresholds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: 'score', direction: 'desc' });
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  // 學習系統相關狀態
  const [learningData, setLearningData] = useState({
    patterns: [],
    feedback: [],
    bestPractices: [],
    analysisHistory: []
  });
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [showLearningDetails, setShowLearningDetails] = useState(false);

  // 對話相關狀態
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const itemsPerPage = 20;

  // 新增工具函數
  const calculateAdvancedMetrics = (creator, videos) => {
    const creatorVideos = videos.filter(v => v.channelId === creator.id);
    const scores = creatorVideos.map(v => v.opportunity_score || 0).filter(score => !isNaN(score));
    
    if (scores.length === 0) return {};
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squareDiffs = scores.map(score => Math.pow(score - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    const consistency = stdDev > 0 ? Math.max(0, 1 - (stdDev / avg)) : 1;
    
    return {
      consistency: Math.round(consistency * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        avg: Math.round(avg * 100) / 100
      }
    };
  };

  const compressCreatorData = (creator) => {
    return {
      n: creator.name,
      id: creator.id,
      ms: Math.round(creator.maxScore),
      vc: creator.videoCount,
      as: Math.round(creator.avgScore * 10) / 10,
      bt: creator.bestVideoTitle ? creator.bestVideoTitle.substring(0, 50) : '',
      bu: creator.bestVideoUrl || '',
      cons: creator.metrics?.consistency ? Math.round(creator.metrics.consistency * 100) / 100 : 0,
      rank: creator.rank
    };
  };

  const estimateTokenUsage = (data) => {
    const jsonString = JSON.stringify(data);
    return Math.ceil(jsonString.length / 4);
  };

  const generateDataSummary = (creators) => {
    const scores = creators.map(c => c.maxScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const distribution = {
      excellent: scores.filter(s => s >= 80).length,
      good: scores.filter(s => s >= 60 && s < 80).length,
      average: scores.filter(s => s >= 40 && s < 60).length,
      poor: scores.filter(s => s < 40).length
    };
    
    const consistencies = creators.map(c => c.metrics.consistency || 0).filter(c => c > 0);
    const avgConsistency = consistencies.length > 0 ? 
      consistencies.reduce((a, b) => a + b, 0) / consistencies.length : 0;
    
    return {
      total: creators.length,
      scoreStats: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        average: Math.round(avgScore * 100) / 100,
        distribution: distribution
      },
      consistencyStats: {
        average: Math.round(avgConsistency * 100) / 100,
        highlyConsistent: consistencies.filter(c => c >= 0.8).length,
        inconsistent: consistencies.filter(c => c < 0.5).length
      }
    };
  };

  // 從本地存儲載入學習數據
  useEffect(() => {
    const savedLearningData = JSON.parse(localStorage.getItem('creatorAnalysisLearning') || '{}');
    if (savedLearningData.patterns) {
      setLearningData(savedLearningData);
    }
  }, []);

  // 保存學習數據到本地存儲
  const saveLearningData = (newLearningData) => {
    localStorage.setItem('creatorAnalysisLearning', JSON.stringify(newLearningData));
    setLearningData(newLearningData);
  };

  // 從影片數據中提取創作者資訊
  useEffect(() => {
    if (videoData && videoData.length > 0) {
      processCreatorData();
    }
  }, [videoData]);

  const processCreatorData = () => {
    const creatorMap = new Map();
    
    videoData.forEach(video => {
      const creatorName = video.channelTitle || video.channelId || '未知創作者';
      const creatorId = video.channelId || creatorName;
      const score = Number(video.opportunity_score) || 0;
      
      if (creatorMap.has(creatorId)) {
        const existing = creatorMap.get(creatorId);
        const updated = {
          ...existing,
          videoCount: existing.videoCount + 1,
          totalScore: existing.totalScore + score,
          videos: [...existing.videos, video] // 保存所有影片數據
        };
        
        if (score > existing.maxScore) {
          updated.maxScore = score;
          updated.bestVideoTitle = video.title || '無標題';
          updated.bestVideoUrl = video.videoUrl || '';
          updated.bestVideoData = video;
        } else {
          updated.maxScore = existing.maxScore;
          updated.bestVideoTitle = existing.bestVideoTitle;
          updated.bestVideoUrl = existing.bestVideoUrl;
          updated.bestVideoData = existing.bestVideoData;
        }
        
        creatorMap.set(creatorId, updated);
      } else {
        creatorMap.set(creatorId, {
          id: creatorId,
          name: creatorName,
          videoCount: 1,
          maxScore: score,
          totalScore: score,
          bestVideoTitle: video.title || '無標題',
          bestVideoUrl: video.videoUrl || '',
          bestVideoData: video,
          videos: [video] // 保存所有影片數據
        });
      }
    });

    const creators = Array.from(creatorMap.values())
      .map(creator => ({
        ...creator,
        avgScore: creator.totalScore / creator.videoCount,
        metrics: calculateAdvancedMetrics(creator, videoData)
      }))
      .sort((a, b) => b.maxScore - a.maxScore)
      .map((creator, index) => ({
        ...creator,
        rank: index + 1
      }));

    setCreatorData(creators);

    if (learningEnabled) {
      analyzeDataPatterns(creators);
    }
  };

  // 分析數據模式並提取學習特徵
  const analyzeDataPatterns = (creators) => {
    const highPerformers = creators.filter(c => c.maxScore > 80).slice(0, 10);
    const lowPerformers = creators.filter(c => c.maxScore < 30);
    
    const titleKeywords = {};
    highPerformers.forEach(creator => {
      if (creator.bestVideoTitle) {
        const words = creator.bestVideoTitle.split(/\s+/).filter(w => w.length > 1);
        words.forEach(word => {
          titleKeywords[word] = (titleKeywords[word] || 0) + 1;
        });
      }
    });

    const creatorNamePatterns = highPerformers.map(c => ({
      name: c.name,
      score: c.maxScore,
      videoCount: c.videoCount
    }));

    const newPatterns = {
      timestamp: Date.now(),
      highPerformerCount: highPerformers.length,
      topTitleKeywords: Object.entries(titleKeywords)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      avgHighPerformerScore: highPerformers.reduce((sum, c) => sum + c.maxScore, 0) / Math.max(highPerformers.length, 1),
      avgLowPerformerScore: lowPerformers.reduce((sum, c) => sum + c.maxScore, 0) / Math.max(lowPerformers.length, 1),
      topCreators: creatorNamePatterns.slice(0, 5)
    };

    const updatedLearningData = {
      ...learningData,
      patterns: [...(learningData.patterns || []), newPatterns].slice(-10)
    };

    saveLearningData(updatedLearningData);
  };

  // 改進的學習上下文生成函數
  const generateLearningContext = () => {
    let learningContext = `\n\n=== 分析指導原則 ===\n`;
    
    if (!learningEnabled) {
      learningContext += `學習模式已關閉，請提供基於當前數據的標準分析。`;
      return learningContext;
    }

    if (learningData.patterns && learningData.patterns.length > 0) {
      const recentPatterns = learningData.patterns.slice(-3);
      const analysisCount = learningData.patterns.length;
      
      learningContext += `過去進行過${analysisCount}次類似的創作者分析。`;
      
      if (recentPatterns.length > 0) {
        const avgHighScores = recentPatterns
          .map(p => p.avgHighPerformerScore)
          .filter(score => score && score > 0);
        
        const avgLowScores = recentPatterns
          .map(p => p.avgLowPerformerScore) 
          .filter(score => score && score > 0);
        
        if (avgHighScores.length > 0) {
          const overallHighAvg = avgHighScores.reduce((a, b) => a + b, 0) / avgHighScores.length;
          const minHigh = Math.min(...avgHighScores);
          const maxHigh = Math.max(...avgHighScores);
          
          learningContext += `歷史分析中，表現優異的創作者平均分數範圍為${minHigh.toFixed(1)}-${maxHigh.toFixed(1)}分，整體平均${overallHighAvg.toFixed(1)}分`;
          
          if (avgLowScores.length > 0) {
            const overallLowAvg = avgLowScores.reduce((a, b) => a + b, 0) / avgLowScores.length;
            const maxLow = Math.max(...avgLowScores);
            learningContext += `，而表現較差的創作者通常在${maxLow.toFixed(1)}分以下`;
          }
          learningContext += `。`;
        }
        
        if (recentPatterns.length >= 2) {
          const latest = recentPatterns[recentPatterns.length - 1];
          const previous = recentPatterns[recentPatterns.length - 2];
          
          if (latest.avgHighPerformerScore && previous.avgHighPerformerScore) {
            const trend = latest.avgHighPerformerScore - previous.avgHighPerformerScore;
            if (Math.abs(trend) > 5) {
              learningContext += `近期高分創作者分數趨勢${trend > 0 ? '上升' : '下降'}了${Math.abs(trend).toFixed(1)}分。`;
            }
          }
        }
        
        const allKeywords = [];
        recentPatterns.forEach(pattern => {
          if (pattern.topTitleKeywords && Array.isArray(pattern.topTitleKeywords)) {
            allKeywords.push(...pattern.topTitleKeywords
              .filter(item => Array.isArray(item) && item[0] && item[0].length > 1)
              .map(([word, count]) => ({ word, count }))
            );
          }
        });
        
        if (allKeywords.length > 0) {
          const keywordFreq = {};
          allKeywords.forEach(({ word, count }) => {
            keywordFreq[word] = (keywordFreq[word] || 0) + count;
          });
          
          const topKeywords = Object.entries(keywordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([word]) => word);
          
          if (topKeywords.length > 0) {
            learningContext += `在高分創作者的標題中，經常出現的關鍵字包括「${topKeywords.join('」、「')}」等詞彙。`;
          }
        }
      }
    } else {
      learningContext += `這是首次分析，將基於當前數據特徵建立基準。`;
    }

    if (learningData.feedback && learningData.feedback.length > 0) {
      const recentFeedback = learningData.feedback.slice(-10);
      const avgRating = recentFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length;
      
      learningContext += `\n\n用戶反饋分析：最近${recentFeedback.length}次分析的平均評分為${avgRating.toFixed(1)}分（滿分5分）。`;
      
      const highRatedFeedback = recentFeedback.filter(f => f.rating >= 4);
      const lowRatedFeedback = recentFeedback.filter(f => f.rating <= 2);
      
      if (highRatedFeedback.length > 0) {
        learningContext += `其中${highRatedFeedback.length}次獲得高分評價（4-5分）。`;
        
        const highRatedThresholds = highRatedFeedback
          .map(f => f.thresholds?.valuable?.threshold)
          .filter(t => t && t > 0);
        
        if (highRatedThresholds.length > 0) {
          const avgHighThreshold = highRatedThresholds.reduce((a, b) => a + b, 0) / highRatedThresholds.length;
          learningContext += `用戶滿意的分析中，有價值創作者的門檻平均設在${avgHighThreshold.toFixed(1)}分。`;
        }
      }
      
      if (lowRatedFeedback.length > 0) {
        learningContext += `但有${lowRatedFeedback.length}次獲得較低評價，需要調整分析方式。`;
      }
    }

    learningContext += `\n\n請根據以上經驗和當前創作者數據，提供更精準的分析：`;
    learningContext += `\n- 考慮當前數據的分佈特徵，避免過於寬鬆或嚴格的標準`;
    learningContext += `\n- 解釋你的分級邏輯，特別是"有價值創作者"的定義標準`;
    learningContext += `\n- 如果當前數據與歷史模式差異很大，請特別說明原因`;
    learningContext += `\n- 提供可操作的建議，幫助用戶理解每個等級的實際意義\n`;

    return learningContext;
  };

  // 完全由AI決定的分析調用
  const getAiThresholds = async () => {
    if (creatorData.length === 0) {
      setError('沒有創作者數據可供分析');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      // 生成完整的數據摘要
      const dataSummary = generateDataSummary(creatorData);
      
      // 壓縮所有創作者數據
      const allCreatorsCompressed = creatorData.map(compressCreatorData);
      
      // 智能數據傳送策略
      const totalTokens = estimateTokenUsage(allCreatorsCompressed) + estimateTokenUsage(dataSummary);
      let dataToSend;

      if (totalTokens > 25000) {
        // 數據量太大，只發送摘要和代表性樣本
        const representativeSamples = {
          topPerformers: creatorData.slice(0, 5).map(compressCreatorData),
          middlePerformers: creatorData.slice(
            Math.floor(creatorData.length / 2) - 2,
            Math.floor(creatorData.length / 2) + 3
          ).map(compressCreatorData),
          lowPerformers: creatorData.slice(-5).map(compressCreatorData)
        };
        
        dataToSend = {
          type: 'summary_and_samples',
          summary: dataSummary,
          samples: representativeSamples,
          totalCreators: creatorData.length,
          message: '數據量較大，已為您精選代表性樣本進行分析'
        };
      } else {
        // 數據量適中，發送完整數據
        dataToSend = {
          type: 'full_dataset',
          summary: dataSummary,
          allCreators: allCreatorsCompressed,
          totalCreators: creatorData.length
        };
      }

      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('找不到 Gemini API 金鑰');
      }

      const learningContext = generateLearningContext();

      const prompt = `
您是一個專業的YouTube創作者價值分析師，請根據以下完整的創作者數據進行深度分析。

## 數據總覽
- 總創作者數量: ${dataSummary.total}
- 綜合表現分數: ${dataSummary.scoreStats.min} - ${dataSummary.scoreStats.max} (平均: ${dataSummary.scoreStats.average})
- 表現分佈: 優秀(${dataSummary.scoreStats.distribution.excellent}人), 良好(${dataSummary.scoreStats.distribution.good}人), 一般(${dataSummary.scoreStats.distribution.average}人), 待改進(${dataSummary.scoreStats.distribution.poor}人)
- 內容一致性: 平均 ${dataSummary.consistencyStats.average} (${dataSummary.consistencyStats.highlyConsistent}人高度一致, ${dataSummary.consistencyStats.inconsistent}人波動較大)

## 詳細創作者數據
以下是${dataToSend.type === 'full_dataset' ? '所有' : '代表性'}創作者的詳細資訊:
${JSON.stringify(dataToSend, null, 2)}

${learningContext}

## 您的分析任務
請基於這些完整數據提供深度分析，包括：

1. **分級標準建議** - 建議合理的有價值/正常/低價值創作者門檻
2. **模式識別** - 識別高分創作者的共同特徵
3. **異常檢測** - 找出異常表現的創作者和可能原因
4. **趨勢分析** - 分析整體數據的分佈趨勢
5. **實用建議** - 提供具體的內容優化建議

## 請以以下JSON格式回應：
{
  "valuable": {
    "threshold": 數字,
    "reason": "為什麼選擇這個門檻作為有價值的標準",
    "confidence": 數字（1-10）,
    "businessValue": "這個等級的商業意義"
  },
  "normal": {
    "min": 數字,
    "max": 數字,
    "reason": "為什麼這個範圍屬於正常水平",
    "confidence": 數字（1-10）,
    "businessValue": "這個等級的特徵"
  },
  "low": {
    "threshold": 數字,
    "reason": "為什麼低於這個分數被認為是低價值",
    "confidence": 數字（1-10）,
    "businessValue": "如何看待這個等級"
  },
  "analysisText": "您的詳細分析文字（至少3段）",
  "keyInsights": ["洞察1", "洞察2", "洞察3"],
  "recommendations": ["建議1", "建議2", "建議3"]
}
      `.trim();

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API 錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Gemini API 回應格式異常');
      }

      const aiText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI 回應中找不到 JSON 格式的數據');
      }

      const analysisText = aiText.substring(0, aiText.indexOf(jsonMatch[0])).trim();
      const jsonString = jsonMatch[0];

      let aiResponse;
      try {
        aiResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON 解析失敗:', parseError);
        throw new Error('AI 回應格式無法解析，請重試');
      }

      if (!aiResponse.valuable || !aiResponse.normal || !aiResponse.low) {
        throw new Error('AI 回應缺少必要欄位');
      }

      // 計算實際百分比（保持原有平鋪結構！）
      const scores = creatorData.map(c => c.maxScore);
      const actualStats = {
        // 保持原有平鋪結構
        valuable: {
          ...aiResponse.valuable,
          percentage: Math.round((scores.filter(s => s >= aiResponse.valuable.threshold).length / scores.length) * 100)
        },
        normal: {
          ...aiResponse.normal,
          percentage: Math.round((scores.filter(s => s >= aiResponse.normal.min && s <= aiResponse.normal.max).length / scores.length) * 100)
        },
        low: {
          ...aiResponse.low,
          percentage: Math.round((scores.filter(s => s < aiResponse.low.threshold).length / scores.length) * 100)
        },
        // 保持原有欄位
        analysisText: analysisText,
        // 添加新數據（不影響原有結構）
        keyInsights: aiResponse.keyInsights || [],
        recommendations: aiResponse.recommendations || [],
        dataType: dataToSend.type,
        totalAnalyzed: creatorData.length
      };

      setAiThresholds(actualStats);

      // 記錄分析歷史
      const analysisRecord = {
        timestamp: Date.now(),
        thresholds: actualStats,
        dataSize: creatorData.length,
        dataType: dataToSend.type
      };

      const updatedLearningData = {
        ...learningData,
        analysisHistory: [...(learningData.analysisHistory || []), analysisRecord].slice(-20)
      };

      saveLearningData(updatedLearningData);

    } catch (err) {
      const errorMessage = err.message || 'AI 分析失敗，請稍後重試';
      setError(errorMessage);
      console.error('Gemini API 錯誤:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // 用戶反饋功能
  const submitFeedback = (rating, comment = '') => {
    const feedback = {
      timestamp: Date.now(),
      rating: rating,
      comment: comment,
      thresholds: aiThresholds,
      dataSize: creatorData.length
    };

    const updatedLearningData = {
      ...learningData,
      feedback: [...(learningData.feedback || []), feedback].slice(-50)
    };

    saveLearningData(updatedLearningData);
    window.alert(`感謝您的反饋！評分：${rating}/5`);
  };

  // 重置學習數據
  const resetLearningData = () => {
    if (window.confirm('確定要清除所有學習數據嗎？這將會重置AI的學習記憶。')) {
      localStorage.removeItem('creatorAnalysisLearning');
      setLearningData({
        patterns: [],
        feedback: [],
        bestPractices: [],
        analysisHistory: []
      });
      window.alert('學習數據已重置');
    }
  };

  // 發送消息給AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      const context = `
        當前分析上下文:
        - 總創作者數: ${creatorData.length}
        - 分數範圍: ${creatorData.length > 0 ? `${Math.min(...creatorData.map(c => c.maxScore)).toFixed(1)} - ${Math.max(...creatorData.map(c => c.maxScore)).toFixed(1)}` : '無數據'}
        - 平均分數: ${stats.avgScore}
        ${aiThresholds ? `- AI分級標準: 有價值(${aiThresholds.valuable.threshold}+), 正常(${aiThresholds.normal.min}-${aiThresholds.normal.max}), 低價值(<${aiThresholds.low.threshold})` : ''}
        
        用戶問題: "${inputMessage}"
      `;
      
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${context}\n\n請以專業分析師的身份回答用戶關於創作者數據分析的問題，提供有價值的見解和建議。`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API錯誤: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `抱歉，發生錯誤: ${error.message}`,
        sender: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 根據AI門檻給創作者分級
  const getCreatorLevel = (score) => {
    if (!aiThresholds) return 'unknown';
    
    if (score >= aiThresholds.valuable.threshold) return 'valuable';
    if (score >= aiThresholds.normal.min) return 'normal';
    return 'low';
  };

  const getLevelInfo = (level) => {
    const levelMap = {
      valuable: { label: '有價值創作者', icon: '🏆', className: 'level-valuable' },
      normal: { label: '正常水平', icon: '📊', className: 'level-normal' },
      low: { label: '低價值創作者', icon: '🗑️', className: 'level-low' },
      unknown: { label: '未分級', icon: '❓', className: 'level-unknown' }
    };
    return levelMap[level] || levelMap.unknown;
  };

  // 排序邏輯
  const sortCreators = (creators) => {
    return [...creators].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'videoCount':
          aValue = a.videoCount;
          bValue = b.videoCount;
          break;
        case 'score':
        default:
          aValue = a.maxScore;
          bValue = b.maxScore;
          break;
      }
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // 過濾邏輯
  const filterCreators = (creators) => {
    let filtered = creators;

    if (filterLevel !== 'all') {
      filtered = filtered.filter(creator => getCreatorLevel(creator.maxScore) === filterLevel);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(creator => 
        creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // 分頁邏輯
  const paginateCreators = (creators) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return creators.slice(startIndex, endIndex);
  };

  // 獲取最終顯示的創作者列表
  const getDisplayCreators = () => {
    const sorted = sortCreators(creatorData);
    const filtered = filterCreators(sorted);
    return paginateCreators(filtered);
  };

  // 匯出CSV
  const exportCSV = () => {
    if (creatorData.length === 0) return;

    const headers = ['排名', '創作者名稱', '頻道ID', '影片數量', '最高分數', '平均分數', '最佳影片標題', '影片連結', '價值等級', '分級原因', 'AI信心度'];
    
    const csvData = creatorData.map(creator => {
      const level = getCreatorLevel(creator.maxScore);
      const levelInfo = getLevelInfo(level);
      const reason = aiThresholds ? 
        (level === 'valuable' ? aiThresholds.valuable.reason :
         level === 'normal' ? aiThresholds.normal.reason :
         aiThresholds.low.reason) : '尚未分析';
      
      const confidence = aiThresholds ? 
        (level === 'valuable' ? aiThresholds.valuable.confidence :
         level === 'normal' ? aiThresholds.normal.confidence :
         aiThresholds.low.confidence) : 'N/A';

      return [
        creator.rank,
        creator.name,
        creator.id,
        creator.videoCount,
        (Number(creator.maxScore) || 0).toFixed(1),
        (Number(creator.avgScore) || 0).toFixed(1),
        creator.bestVideoTitle || '無標題',
        creator.bestVideoUrl || '',
        levelInfo.label,
        reason,
        confidence || 'N/A'
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `creators_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
  };

  const displayCreators = getDisplayCreators();
  const filteredCreators = filterCreators(sortCreators(creatorData));
  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage);

  // 統計數據
  const stats = {
    total: creatorData.length,
    avgScore: creatorData.length > 0 ? (creatorData.reduce((sum, c) => sum + Number(c.maxScore || 0), 0) / creatorData.length).toFixed(1) : 0,
    valuable: aiThresholds ? creatorData.filter(c => getCreatorLevel(c.maxScore) === 'valuable').length : 0,
    normal: aiThresholds ? creatorData.filter(c => getCreatorLevel(c.maxScore) === 'normal').length : 0,
    low: aiThresholds ? creatorData.filter(c => getCreatorLevel(c.maxScore) === 'low').length : 0
  };

  // 學習統計
  const learningStats = {
    totalAnalyses: learningData.patterns?.length || 0,
    totalFeedback: learningData.feedback?.length || 0,
    avgFeedback: learningData.feedback?.length > 0 ? 
      (learningData.feedback.reduce((sum, f) => sum + f.rating, 0) / learningData.feedback.length).toFixed(1) : 'N/A'
  };

  return (       
    <div className="creator-analysis-panel">  
      {/* 標題區域 */}
      <div className="panel-header">
        <div className="title-section">
          <h1 className="main-title">👥 創作者價值分析</h1>
          <div className="learning-indicator">
            <label className="learning-toggle">
              <input
                type="checkbox"
                checked={learningEnabled}
                onChange={(e) => setLearningEnabled(e.target.checked)}
              />
              🧠 AI學習模式
            </label>
            {learningEnabled && (
              <span className="learning-status">
                已學習 {learningStats.totalAnalyses} 次分析
              </span>
            )}
          </div>
        </div>
        
        {/* 數據統計 */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">總創作者數</div>
          </div>
          <div className="stat-card stat-avg">
            <div className="stat-value">{stats.avgScore}</div>
            <div className="stat-label">平均分數</div>
          </div>
          <div className="stat-card stat-valuable">
            <div className="stat-value">{stats.valuable}</div>
            <div className="stat-label">有價值創作者</div>
          </div>
          <div className="stat-card stat-filtered">
            <div className="stat-value">{filteredCreators.length}</div>
            <div className="stat-label">篩選後數量</div>
          </div>
        </div>
      </div>

      {/* 學習狀態面板 */}
      {learningEnabled && (
        <div className="learning-panel">
          <div className="learning-header">
            <h3>🧠 AI學習狀態</h3>
            <div className="learning-controls">
              <button
                onClick={() => setShowLearningDetails(!showLearningDetails)}
                className="toggle-details-btn"
              >
                {showLearningDetails ? '隱藏詳情' : '顯示詳情'}
              </button>
              <button
                onClick={resetLearningData}
                className="reset-learning-btn"
              >
                重置學習
              </button>
            </div>
          </div>
          
          <div className="learning-stats">
            <div className="learning-stat">
              <span className="stat-icon">📊</span>
              <span className="stat-text">分析次數: {learningStats.totalAnalyses}</span>
            </div>
            <div className="learning-stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-text">用戶反饋: {learningStats.totalFeedback} 次</span>
            </div>
            <div className="learning-stat">
              <span className="stat-icon">🎯</span>
              <span className="stat-text">平均評分: {learningStats.avgFeedback}/5</span>
            </div>
          </div>

          {showLearningDetails && learningData.patterns && learningData.patterns.length > 0 && (
            <div className="learning-details">
              <h4>學習到的模式</h4>
              {learningData.patterns.slice(-2).map((pattern, index) => (
                <div key={index} className="pattern-item">
                  <div className="pattern-header">
                    分析時間: {new Date(pattern.timestamp).toLocaleString()}
                  </div>
                  <div className="pattern-content">
                    <p>高分創作者數量: {pattern.highPerformerCount}</p>
                    <p>平均高分: {pattern.avgHighPerformerScore?.toFixed(1)}</p>
                    {pattern.topTitleKeywords && pattern.topTitleKeywords.length > 0 && (
                      <p>熱門關鍵字: {pattern.topTitleKeywords.slice(0, 5).map(([word]) => word).join('、')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI 門檻建議 */}
      <div className="ai-thresholds-section">
        <div className="section-header">
          <h2 className="section-title">⭐ AI門檻建議</h2>
          <button
            onClick={getAiThresholds}
            disabled={aiLoading || creatorData.length === 0}
            className={`ai-analyze-btn ${aiLoading ? 'loading' : ''}`}
          >
            {aiLoading ? (
              <>
                <div className="spinner"></div>
                分析中...
              </>
            ) : (
              <>
                📈 獲取AI建議 {learningEnabled && learningStats.totalAnalyses > 0 && '(增強版)'}
              </>
            )}
          </button>
        </div>

        {aiThresholds && (
          <>
            {/* 顯示AI分析思路 */}
            {aiThresholds.analysisText && (
              <div className="ai-analysis-text">
                <h4>AI分析思路</h4>
                <div className="analysis-content">
                  {aiThresholds.analysisText.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="thresholds-grid">
              <div className="threshold-card valuable">
                <div className="threshold-header">
                  <span className="threshold-icon">🏆</span>
                  <span className="threshold-title">有價值創作者</span>
                  {aiThresholds.valuable.confidence && (
                    <span className="confidence-badge">信心度: {aiThresholds.valuable.confidence}/10</span>
                  )}
                </div>
                <div className="threshold-score">
                  {aiThresholds.valuable.threshold}分以上
                </div>
                <div className="threshold-percentage">
                  占比: {aiThresholds.valuable.percentage}%
                </div>
                <div className="threshold-reason">
                  {aiThresholds.valuable.reason}
                </div>
                {aiThresholds.valuable.businessValue && (
                  <div className="business-value">
                    <strong>商業價值:</strong> {aiThresholds.valuable.businessValue}
                  </div>
                )}
              </div>

              <div className="threshold-card normal">
                <div className="threshold-header">
                  <span className="threshold-icon">📊</span>
                  <span className="threshold-title">正常水平</span>
                  {aiThresholds.normal.confidence && (
                    <span className="confidence-badge">信心度: {aiThresholds.normal.confidence}/10</span>
                  )}
                </div>
                <div className="threshold-score">
                  {aiThresholds.normal.min}-{aiThresholds.normal.max}分
                </div>
                <div className="threshold-percentage">
                  占比: {aiThresholds.normal.percentage}%
                </div>
                <div className="threshold-reason">
                  {aiThresholds.normal.reason}
                </div>
                {aiThresholds.normal.businessValue && (
                  <div className="business-value">
                    <strong>特點:</strong> {aiThresholds.normal.businessValue}
                  </div>
                )}
              </div>

              <div className="threshold-card low">
                <div className="threshold-header">
                  <span className="threshold-icon">🗑️</span>
                  <span className="threshold-title">低價值創作者</span>
                  {aiThresholds.low.confidence && (
                    <span className="confidence-badge">信心度: {aiThresholds.low.confidence}/10</span>
                  )}
                </div>
                <div className="threshold-score">
                  {aiThresholds.low.threshold}分以下
                </div>
                <div className="threshold-percentage">
                  占比: {aiThresholds.low.percentage}%
                </div>
                <div className="threshold-reason">
                  {aiThresholds.low.reason}
                </div>
                {aiThresholds.low.businessValue && (
                  <div className="business-value">
                    <strong>處理建議:</strong> {aiThresholds.low.businessValue}
                  </div>
                )}
              </div>
            </div>

            {/* 用戶反饋區域 */}
            <div className="feedback-section">
              <h4>對這次分析的評價</h4>
              <div className="feedback-buttons">
                <button onClick={() => submitFeedback(5, '很滿意')} className="feedback-btn excellent">
                  ⭐⭐⭐⭐⭐ 很棒
                </button>
                <button onClick={() => submitFeedback(4, '滿意')} className="feedback-btn good">
                  ⭐⭐⭐⭐ 不錯
                </button>
                <button onClick={() => submitFeedback(3, '普通')} className="feedback-btn average">
                  ⭐⭐⭐ 普通
                </button>
                <button onClick={() => submitFeedback(2, '不滿意')} className="feedback-btn poor">
                  ⭐⭐ 需改善
                </button>
                <button onClick={() => submitFeedback(1, '很不滿意')} className="feedback-btn bad">
                  ⭐ 很差
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 控制面板 */}
      <div className="controls-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 搜尋創作者..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <select
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="all">所有等級</option>
          <option value="valuable">有價值創作者</option>
          <option value="normal">正常水平</option>
          <option value="low">低價值創作者</option>
        </select>

        <button
          onClick={exportCSV}
          disabled={creatorData.length === 0}
          className="export-btn"
        >
          📥 匯出CSV
        </button>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="error-message">
          <div className="error-text">{error}</div>
        </div>
      )}

      {/* 創作者列表 */}
      {creatorData.length > 0 ? (
        <div className="creators-table-container">
          <table className="creators-table">
            <thead>
              <tr>
                <th>排名</th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('name')}
                >
                  創作者名稱 {sortConfig.field === 'name' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('videoCount')}
                >
                  影片數量 {sortConfig.field === 'videoCount' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th 
                  className="sortable"
                  onClick={() => handleSort('score')}
                >
                  最高分數 {sortConfig.field === 'score' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                </th>
                <th>平均分數</th>
                <th>最佳影片</th>
                <th>價值等級</th>
              </tr>
            </thead>
            <tbody>
              {displayCreators.map((creator, index) => {
                const level = getCreatorLevel(creator.maxScore);
                const levelInfo = getLevelInfo(level);
                
                return (
                  <tr key={creator.id} className="creator-row">
                    <td className="rank-cell">
                      {creator.rank <= 3 ? (
                        <span className="rank-medal">
                          {creator.rank === 1 ? '🏆' : creator.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="rank-number">#{creator.rank}</span>
                      )}
                    </td>
                    <td className="name-cell" title={`頻道ID: ${creator.id}`}>
                      {creator.name}
                    </td>
                    <td className="count-cell">{creator.videoCount}</td>
                    <td className="score-cell max-score">{(Number(creator.maxScore) || 0).toFixed(1)}</td>
                    <td className="score-cell avg-score">{(Number(creator.avgScore) || 0).toFixed(1)}</td>
                    <td className="video-cell">
                      {creator.bestVideoUrl ? (
                        <a 
                          href={creator.bestVideoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="video-link"
                          title={creator.bestVideoTitle}
                        >
                          {creator.bestVideoTitle && creator.bestVideoTitle.length > 50 
                            ? creator.bestVideoTitle.substring(0, 50) + '...' 
                            : creator.bestVideoTitle || '無標題'}
                        </a>
                      ) : (
                        <span className="no-link" title={creator.bestVideoTitle}>
                          {creator.bestVideoTitle && creator.bestVideoTitle.length > 50 
                            ? creator.bestVideoTitle.substring(0, 50) + '...' 
                            : creator.bestVideoTitle || '無標題'}
                        </span>
                      )}
                    </td>
                    <td className="level-cell">
                      <span className={`level-badge ${levelInfo.className}`}>
                        <span className="level-icon">{levelInfo.icon}</span>
                        {levelInfo.label}
                        {aiThresholds && aiThresholds[level]?.confidence && (
                          <span className="confidence-indicator" title={`AI信心度: ${aiThresholds[level].confidence}/10`}>
                            {aiThresholds[level].confidence >= 8 ? '🎯' : 
                             aiThresholds[level].confidence >= 6 ? '📊' : '❓'}
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                顯示 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredCreators.length)} 
                共 {filteredCreators.length} 個創作者
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  上一頁
                </button>
                <span className="pagination-current">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  下一頁
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-data">
          <div className="no-data-icon">👥</div>
          <h3 className="no-data-title">沒有創作者數據</h3>
          <p className="no-data-description">請先上傳影片數據來分析創作者</p>
        </div>
      )}

      {/* 學習建議提示 */}
      {learningEnabled && learningStats.totalAnalyses < 3 && (
        <div className="learning-tip">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h4>學習提示</h4>
            <p>AI正在學習您的數據模式，建議多進行幾次分析並提供反饋，讓AI建議更加精準！</p>
          </div>
        </div>
      )}
      <div className={`ai-chat-dialog ${chatOpen ? 'open' : ''}`}>
  <div className="chat-header" onClick={() => setChatOpen(!chatOpen)}>
    <div className="chat-title">
      <span className="ai-icon">🤖</span>
      AI分析助手
      {messages.length > 0 && <span className="message-count">{messages.filter(m => m.sender === 'user').length}</span>}
    </div>
    <button className="chat-toggle-btn">
      {chatOpen ? '▼' : '▲'}
    </button>
  </div>
  
  {chatOpen && (
    <div className="chat-content">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>您好！我是您的创作者分析助手。</p>
            <p>我可以帮助您：</p>
            <ul>
              <li>解释分析结果和分级标准</li>
              <li>提供创作者合作建议</li>
              <li>分析数据模式和趋势</li>
              <li>回答关于此仪表板的问题</li>
            </ul>
            <p>请问有什么可以帮您的？</p>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-bubble">
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="message ai">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入您的问题..."
          disabled={isTyping}
          className="chat-input"
        />
        <button 
          onClick={sendMessage} 
          disabled={!inputMessage.trim() || isTyping}
          className="send-button"
        >
          {isTyping ? '●' : '➤'}
        </button>
      </div>
    </div>
  )}
</div>
    </div>
  );
};

export default GeminiAnalysisPanel;