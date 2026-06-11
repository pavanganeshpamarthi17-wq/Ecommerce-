const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage, getFeaturedProducts, adminGetProducts,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../config/cloudinary');

router.get('/featured', getFeaturedProducts);
router.get('/admin/all', protect, authorize('admin'), adminGetProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/:id/images', protect, authorize('admin'), uploadProduct.array('images', 5), uploadProductImages);
router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteProductImage);

module.exports = router;
