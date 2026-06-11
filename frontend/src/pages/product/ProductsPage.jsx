import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { fetchProducts, setFilters } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';
import FilterSidebar from '../../components/product/FilterSidebar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, totalPages, currentPage, loading, filters } = useSelector((s) => s.products);

  // Sync URL params to filters on mount
  useEffect(() => {
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    if (keyword || category) {
      dispatch(setFilters({ keyword, category }));
    }
  }, []); // eslint-disable-line

  const loadProducts = useCallback(
    (page = 1) => {
      const params = {};
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.inStock) params.inStock = filters.inStock;
      if (filters.sort) params.sort = filters.sort;
      params.page = page;
      params.limit = 12;
      dispatch(fetchProducts(params));
    },
    [dispatch, filters]
  );

  useEffect(() => { loadProducts(1); }, [filters]); // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.keyword ? `Results for "${filters.keyword}"` : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} products found</p>
        </div>

        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          {/* Mobile filter */}
          <FilterSidebar onApply={() => loadProducts(1)} />

          {/* Sort */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filters.sort}
              onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
              className="text-sm text-gray-700 bg-transparent focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <FilterSidebar onApply={() => loadProducts(1)} />

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner />
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <LayoutGrid className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  loadProducts(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
