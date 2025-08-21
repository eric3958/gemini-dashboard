// Pagination.jsx - 分页组件
import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalItems, 
  onPageChange, 
  onPageSizeChange 
}) => {
  // 计算显示的页码范围
  const getPageNumbers = () => {
    const delta = 2; // 当前页前后显示的页数
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
  };

  // 计算当前显示的数据范围
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div style={paginationStyles.container}>
      {/* 数据统计信息 */}
      <div style={paginationStyles.info}>
        显示第 {startItem}-{endItem} 条，共 {totalItems} 条数据
      </div>

      {/* 每页显示数量选择器 */}
      <div style={paginationStyles.pageSizeSelector}>
        <span style={paginationStyles.label}>每页显示：</span>
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={paginationStyles.select}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* 分页控件 */}
      <div style={paginationStyles.controls}>
        {/* 上一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...paginationStyles.button,
            ...(currentPage === 1 ? paginationStyles.buttonDisabled : {})
          }}
        >
          ← 上一页
        </button>

        {/* 页码按钮 */}
        <div style={paginationStyles.pageNumbers}>
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span style={paginationStyles.dots}>...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  style={{
                    ...paginationStyles.pageButton,
                    ...(page === currentPage ? paginationStyles.pageButtonActive : {})
                  }}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 下一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...paginationStyles.button,
            ...(currentPage === totalPages ? paginationStyles.buttonDisabled : {})
          }}
        >
          下一页 →
        </button>
      </div>

      {/* 快速跳转 */}
      <div style={paginationStyles.jumpTo}>
        <span style={paginationStyles.label}>跳转至：</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          style={paginationStyles.jumpInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const page = Number(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                e.target.value = '';
              }
            }
          }}
          placeholder={`1-${totalPages}`}
        />
      </div>
    </div>
  );
};

// 分页样式
const paginationStyles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    gap: '12px',
    fontSize: '14px',
  },
  info: {
    color: '#6b7280',
    fontWeight: '500',
  },
  pageSizeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    color: '#6b7280',
    fontSize: '14px',
  },
  select: {
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  button: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#f3f4f6',
  },
  pageNumbers: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '40px',
  },
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
  },
  dots: {
    padding: '8px 4px',
    color: '#9ca3af',
    fontSize: '14px',
  },
  jumpTo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  jumpInput: {
    width: '80px',
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default Pagination;