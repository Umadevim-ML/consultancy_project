
const Consultation = require('../models/Consultation');
const Slot = require('../models/Slot');

// @desc    Book a consultation
// @route   POST /api/consultations
// @access  Private
const bookConsultation = async (req, res) => {
    const { date, time, issueDescription, slotId } = req.body;

    try {
        const consultation = await Consultation.create({
            user: req.user._id,
            date,
            time,
            issueDescription,
        });

        // Mark slot as booked if slotId is provided
        if (slotId) {
            await Slot.findByIdAndUpdate(slotId, { isBooked: true });
        }

        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: 'Invalid consultation data', error: error.message });
    }
};

// @desc    Admin book a consultation for a user
// @route   POST /api/consultations/admin
// @access  Private/Admin
const adminBookConsultation = async (req, res) => {
    const { userId, date, time, issueDescription } = req.body;

    try {
        const consultation = await Consultation.create({
            user: userId, // Admin specifies the user
            date,
            time,
            issueDescription,
        });
        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: 'Invalid consultation data', error: error.message });
    }
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

// @desc    Delete a consultation
// @route   DELETE /api/consultations/:id
// @access  Private/Admin
const deleteConsultation = async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);

    if (consultation) {
        // Find the corresponding slot and mark it as NOT booked
        const start = new Date(consultation.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(consultation.date);
        end.setHours(23, 59, 59, 999);

        await Slot.findOneAndUpdate(
            { date: { $gte: start, $lte: end }, time: consultation.time },
            { isBooked: false }
        );

        await Consultation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Consultation removed' });
    } else {
        res.status(404).json({ message: 'Consultation not found' });
    }
};

// @desc    Cancel a consultation
// @route   PUT /api/consultations/:id/cancel
// @access  Private
const cancelConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Check if the consultation belongs to the user
        if (consultation.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (consultation.status === 'Completed' || consultation.status === 'Cancelled' || consultation.status === 'Rejected') {
            return res.status(400).json({ message: `Cannot cancel a ${consultation.status} appointment` });
        }

        consultation.status = 'Cancelled';
        const updatedConsultation = await consultation.save();

        // Find the corresponding slot and mark it as NOT booked
        const start = new Date(consultation.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(consultation.date);
        end.setHours(23, 59, 59, 999);

        await Slot.findOneAndUpdate(
            { date: { $gte: start, $lte: end }, time: consultation.time },
            { isBooked: false }
        );

        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    bookConsultation,
    adminBookConsultation,
    getMyConsultations,
    getConsultations,
    updateConsultationStatus,
    deleteConsultation,
    cancelConsultation,
};
