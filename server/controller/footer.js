const Footer = require('../models/Footer');
const { normalizeFooterContent } = require('../utils/footerContent');

// Both directions run through normalizeFooterContent: reads so an empty or older
// document still answers with a complete footer, writes so nothing unvalidated is
// ever stored. See utils/footerContent.js for what "valid" means per field.
const readContent = async () => {
  const stored = await Footer.findOne().lean();
  return normalizeFooterContent(stored || {});
};

// Replaces the whole document, so the caller must send the entire content object;
// anything omitted resets to its built-in default rather than keeping the stored
// value. The admin editor loads the current content first and submits all of it.
const writeContent = async (body) => {
  const content = normalizeFooterContent(body);

  await Footer.findOneAndUpdate({}, content, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return content;
};

// GET /api/footer — public; every storefront page renders from this.
const getFooter = async (req, res) => {
  try {
    res.json(await readContent());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching footer', error: error.message });
  }
};

// PUT /api/footer — admin only.
const updateFooter = async (req, res) => {
  try {
    res.json(await writeContent(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Error saving footer', error: error.message });
  }
};

// POST /api/footer/reset — admin only. Puts the shipped footer back, so an admin
// who has edited themselves into a corner has a way out.
const resetFooter = async (req, res) => {
  try {
    res.json(await writeContent({}));
  } catch (error) {
    res.status(400).json({ message: 'Error resetting footer', error: error.message });
  }
};

module.exports = {
  getFooter,
  updateFooter,
  resetFooter,
};
