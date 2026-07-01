const getModel = (type) => {
  const models = {
    hero: require('../models/Hero'),
    about: require('../models/About'),
    room: require('../models/Room'),
    gallery: require('../models/Gallery'),
    testimonial: require('../models/Testimonial'),
    blog: require('../models/Blog'),
    booking: require('../models/Booking'),
    setting: require('../models/Setting'),
    seo: require('../models/SEO'),
    image: require('../models/Image'),
    footer: require('../models/Footer'),
    navigation: require('../models/Navigation'),
  };
  const Model = models[type];
  if (!Model) throw new Error(`Unknown content type: ${type}`);
  return Model;
};

const singleTypes = ['hero', 'about', 'setting', 'seo', 'footer', 'navigation'];

const getAll = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);
    const { page = 1, limit = 50, sort = '-createdAt', ...filters } = req.query;

    delete filters.page;
    delete filters.limit;
    delete filters.sort;

    Object.keys(filters).forEach((key) => {
      if (filters[key] === 'true') filters[key] = true;
      else if (filters[key] === 'false') filters[key] = false;
    });

    if (singleTypes.includes(type)) {
      const doc = await Model.findOne(filters).sort(sort);
      return res.status(200).json({
        success: true,
        data: doc || null,
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const docs = await Model.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Model.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: docs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getById = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);

    if (singleTypes.includes(type)) {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: `${type} not found`,
        });
      }
      return res.status(200).json({ success: true, data: doc });
    }

    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const getBySlug = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);
    const doc = await Model.findOne({ slug: req.params.slug });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const create = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);

    if (singleTypes.includes(type)) {
      const existing = await Model.findOne();
      if (existing) {
        const updated = await Model.findByIdAndUpdate(
          existing._id,
          req.body,
          { new: true, runValidators: true }
        );
        return res.status(200).json({
          success: true,
          message: `${type} updated successfully`,
          data: updated,
        });
      }
    }

    const doc = await Model.create(req.body);
    res.status(201).json({
      success: true,
      message: `${type} created successfully`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const update = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }
    res.status(200).json({
      success: true,
      message: `${type} updated successfully`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const remove = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);

    if (singleTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${type}. Use PUT to update instead.`,
      });
    }

    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }
    res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const getStats = (type) => async (req, res, next) => {
  try {
    const Model = getModel(type);
    const total = await Model.countDocuments();
    const active = await Model.countDocuments({ isActive: true });
    res.status(200).json({
      success: true,
      data: { total, active },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getStats,
};
