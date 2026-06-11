import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    }
  }

  const rendered = [];
  let prev = null;
  for (const page of pages) {
    if (prev !== null && page - prev > 1) rendered.push('...');
    rendered.push(page);
    prev = page;
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {rendered.map((item, i) =>
        item === '...' ? (
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
