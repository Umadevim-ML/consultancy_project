
const Consultation = require('../models/Consultation');

// @desc    Book a consultation
// @route   POST /api/consultations
// @access  Private
const bookConsultation = async (req, res) => {
    const { date, time, issueDescription } = req.body;

    const consultation = await Consultation.create({
        user: req.user._id,
        date,
        time,
        issueDescription,
    });

    res.status(201).json(consultation);
};

// @desc    Get user consultations
// @route   GET /api/consultations/myconsultations
// @access  Private
const getMyConsultations = async (req, res) => {
    const consultations = await Consultation.find({ user: req.user._id });
    res.json(consultations);
};

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private/Admin
const getConsultations = async (req, res) => {
    const consultations = await Consultation.find({}).populate('user', 'id name email');
    res.json(consultations);
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id
// @access  Private/Admin
const updateConsultationStatus = async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);

    if (consultation) {
        consultation.status = req.body.status || consultation.status;
        const updatedConsultation = await consultation.save();
        res.json(updatedConsultation);
    } else {
        res.status(404).json({ message: 'Consultation not found' });
    }
};

module.exports = {
    bookConsultation,
    getMyConsultations,
    getConsultations,
    updateConsultationStatus,
};
