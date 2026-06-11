// cartRoutes.js
const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, saveForLater, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.put('/:itemId/save-later', saveForLater);

module.exports = router;
