const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
  res.status(200).json({ success: true, categories });
});

const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return next(new AppError('Category not found', 404));
  res.status(200).json({ success: true, category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return next(new AppError('Category not found', 404));
  res.status(200).json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Category not found', 404));
  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
