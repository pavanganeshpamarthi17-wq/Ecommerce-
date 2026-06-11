const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, updateReview, deleteReview, voteHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, voteHelpful);

module.exports = router;
