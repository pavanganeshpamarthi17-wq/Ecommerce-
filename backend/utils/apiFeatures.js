class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filterQuery = {};
  }

  search() {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.trim();
      this.query = this.query.find({ $text: { $search: keyword } });
      this.filterQuery.$text = { $search: keyword };
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['keyword', 'page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((f) => delete queryObj[f]);

    // Price range
    const filter = { isActive: true };
    if (queryObj.minPrice || queryObj.maxPrice) {
      filter.price = {};
      if (queryObj.minPrice) filter.price.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) filter.price.$lte = Number(queryObj.maxPrice);
    }

    // Category
    if (queryObj.category) filter.category = queryObj.category;

    // Brand
    if (queryObj.brand) {
      filter.brand = { $regex: queryObj.brand, $options: 'i' };
    }

    // Rating
    if (queryObj.minRating) filter.rating = { $gte: Number(queryObj.minRating) };

    // Availability
    if (queryObj.inStock === 'true') filter.stock = { $gt: 0 };

    this.filterQuery = { ...this.filterQuery, ...filter };
    this.query = this.query.find(filter);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortMap = {
        newest: '-createdAt',
        oldest: 'createdAt',
        price_asc: 'price',
        price_desc: '-price',
        rating: '-rating',
        popular: '-soldCount',
      };
      const sortBy = sortMap[this.queryString.sort] || '-createdAt';
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(this.queryString.limit) || 12));
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
