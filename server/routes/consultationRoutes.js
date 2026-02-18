
const express = require('express');
const router = express.Router();
const {
    bookConsultation,
    getMyConsultations,
    getConsultations,
    updateConsultationStatus,
} = require('../controllers/consultationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, bookConsultation).get(protect, admin, getConsultations);
router.route('/myconsultations').get(protect, getMyConsultations);
router.route('/:id').put(protect, admin, updateConsultationStatus);

module.exports = router;
