const express = require('express');
const { getSubscriptions, addSubscription, updateSubscription, deleteSubscription, getUpcoming } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/upcoming', getUpcoming);
router.route('/').get(getSubscriptions).post(addSubscription);
router.route('/:id').put(updateSubscription).delete(deleteSubscription);

module.exports = router;
