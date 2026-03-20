const Charity = require('../models/Charity');

// @desc   Get all active charities
// @route  GET /api/charities
exports.getCharities = async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = { isActive: true };
    if (search)   filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const charities = await Charity.find(filter).sort({ isFeatured: -1, name: 1 });
    res.json({ success: true, charities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get single charity
// @route  GET /api/charities/:slug
exports.getCharity = async (req, res) => {
  try {
    const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Create charity (admin)
// @route  POST /api/charities
exports.createCharity = async (req, res) => {
  try {
    const { name, description, shortDesc, category, website, isFeatured } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Charity.findOne({ slug });
    if (existing) return res.status(400).json({ success: false, message: 'Charity with this name already exists' });

    const charity = await Charity.create({ name, slug, description, shortDesc, category, website, isFeatured });
    res.status(201).json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Update charity (admin)
// @route  PUT /api/charities/:id
exports.updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Delete charity (admin)
// @route  DELETE /api/charities/:id
exports.deleteCharity = async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Charity deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
