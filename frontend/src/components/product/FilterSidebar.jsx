import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SlidersHorizontal, X } from 'lucide-react';
import { setFilters, resetFilters } from '../../store/slices/productSlice';
import StarRating from '../common/StarRating';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Over ₹10,000', min: 10000, max: '' },
];

const FilterSidebar = ({ onApply }) => {
  const dispatch = useDispatch();
  const { filters, categories } = useSelector((s) => s.products);
  const [open, setOpen] = useState(false);

  const update = (key, value) => dispatch(setFilters({ [key]: value }));

  const handleReset = () => {
    dispatch(resetFilters());
    onApply?.();
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={() => update('category', '')}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat._id}
                checked={filters.category === cat._id}
                onChange={() => update('category', cat._id)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filters.minPrice === String(range.min) && filters.maxPrice === String(range.max)}
                onChange={() => {
                  update('minPrice', String(range.min));
                  update('maxPrice', String(range.max));
                }}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={!filters.minPrice && !filters.maxPrice}
              onChange={() => { update('minPrice', ''); update('maxPrice', ''); }}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Any Price</span>
          </label>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === String(r)}
                onChange={() => update('minRating', String(r))}
                className="text-blue-600"
              />
              <StarRating rating={r} size="sm" />
              <span className="text-sm text-gray-600">& above</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={!filters.minRating}
              onChange={() => update('minRating', '')}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700">Any Rating</span>
          </label>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === 'true'}
            onChange={(e) => update('inStock', e.target.checked ? 'true' : '')}
            className="text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={handleReset} className="btn btn-outline flex-1 text-sm">Reset</button>
        <button onClick={() => { onApply?.(); setOpen(false); }} className="btn btn-primary flex-1 text-sm">Apply</button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="card p-4 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="btn btn-outline text-sm gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative ml-auto w-80 max-w-full h-full bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterSidebar;
