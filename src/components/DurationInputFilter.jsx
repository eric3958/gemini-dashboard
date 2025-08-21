// DurationRangeSlider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { styles } from '../styles/styles.js';
import { DURATION_RANGE_CONFIG, formatDuration } from '../utils/constants.js';

const DurationRangeSlider = ({ 
  minValue, 
  maxValue, 
  onChange,
  dataRange // 從父組件傳入的實際數據範圍
}) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);

  // 計算實際的範圍限制（基於數據或預設配置）
  const actualMin = dataRange ? Math.floor(dataRange.min) : DURATION_RANGE_CONFIG.min;
  const actualMax = dataRange ? Math.ceil(dataRange.max) : DURATION_RANGE_CONFIG.max;
  const step = DURATION_RANGE_CONFIG.step;

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const handleMinChange = useCallback((e) => {
    const value = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(value);
    onChange(value, localMax);
  }, [localMax, onChange, step]);

  const handleMaxChange = useCallback((e) => {
    const value = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(value);
    onChange(localMin, value);
  }, [localMin, onChange, step]);

  // 計算滑桿範圍的百分比
  const minPercent = ((localMin - actualMin) / (actualMax - actualMin)) * 100;
  const maxPercent = ((localMax - actualMin) / (actualMax - actualMin)) * 100;

  const rangeStyle = {
    ...styles.rangeSliderRange,
    left: `${minPercent}%`,
    right: `${100 - maxPercent}%`
  };

  return (
    <div style={styles.durationRangeGroup}>
      <label style={styles.label}>時長篩選</label>
      
      {/* 顯示當前選擇的範圍 */}
      <div style={styles.rangeSliderLabels}>
        <span style={styles.rangeSliderValue}>
          {formatDuration(localMin)}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>至</span>
        <span style={styles.rangeSliderValue}>
          {formatDuration(localMax)}
        </span>
      </div>

      {/* 滑桿容器 */}
      <div style={styles.rangeSliderContainer}>
        {/* 背景軌道 */}
        <div style={styles.rangeSliderTrack}></div>
        
        {/* 選中範圍 */}
        <div style={rangeStyle}></div>

        {/* 最小值滑桿 */}
        <input
          type="range"
          min={actualMin}
          max={actualMax}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          style={{
            ...styles.rangeSliderInput,
            zIndex: 1
          }}
        />

        {/* 最大值滑桿 */}
        <input
          type="range"
          min={actualMin}
          max={actualMax}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          style={{
            ...styles.rangeSliderInput,
            zIndex: 2
          }}
        />
      </div>

      {/* 範圍標籤 */}
      <div style={styles.rangeSliderLabels}>
        <span>{formatDuration(actualMin)}</span>
        <span>{formatDuration(actualMax)}</span>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          background: transparent;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }

        input[type="range"]::-moz-range-track {
          background: transparent;
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          border: none;
        }

        input[type="range"]:focus {
          outline: none;
        }

        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        input[type="range"]:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default DurationRangeSlider;