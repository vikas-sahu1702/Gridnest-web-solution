const Contact = require('../models/Contact');
const { sendContactEmail } = require('../utils/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const { fullName, email, phone, company, country, state, service, message, honeypot, templateSource } = req.body;

    // Honeypot check (spam bot detection)
    if (honeypot && honeypot.length > 0) {
      // Silently reject but return success to not tip off bots
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      });
    }

    // Create contact record
    const contact = await Contact.create({
      fullName,
      email,
      phone,
      company,
      country,
      state,
      service,
      message,
      templateSource,
      honeypot,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    // Send email notification (don't block the response)
    sendContactEmail({
      fullName,
      email,
      phone,
      company,
      country,
      state,
      service,
      message,
      templateSource,
    }).catch((err) => console.error('Contact email send failed:', err.message, err.code || ''));

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! Our team will get back to you within 24 hours.',
      data: {
        id: contact._id,
        fullName: contact.fullName,
        email: contact.email,
        service: contact.service,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact submissions (admin)
// @route   GET /api/contact
// @access  Private (admin)
const getContacts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contact/:id
// @access  Private (admin)
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-__v');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    // Mark as read
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private (admin)
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private (admin)
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact stats
// @route   GET /api/contact/stats
// @access  Private (admin)
const getContactStats = async (req, res, next) => {
  try {
    const total = await Contact.countDocuments();
    const newInquiries = await Contact.countDocuments({ status: 'new' });
    const thisMonth = await Contact.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const serviceBreakdown = await Contact.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        newInquiries,
        thisMonth,
        serviceBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all contacts (bulk delete)
// @route   DELETE /api/contact/bulk/all
// @access  Private (admin)
const deleteAllContacts = async (req, res, next) => {
  try {
    const result = await Contact.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} contact inquiries successfully`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
  deleteAllContacts,
  getContactStats,
};
