const AboutPage = require('../models/AboutPage');
const { normalizeAboutContent } = require('../utils/aboutContent');

// Both directions run through normalizeAboutContent: reads so an empty or older
// document still answers with a complete page, writes so nothing unvalidated is
// ever stored. See utils/aboutContent.js for what "valid" means per field.
const readContent = async () => {
  const stored = await AboutPage.findOne().lean();
  return normalizeAboutContent(stored || {});
};

// Replaces the whole document, so the caller must send the entire content object;
// anything omitted resets to its built-in default rather than keeping the stored
// value. The admin editor loads the current content first and submits all of it.
const writeContent = async (body) => {
  const content = normalizeAboutContent(body);

  await AboutPage.findOneAndUpdate({}, content, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return content;
};

// GET /api/about-page — public; the storefront About page renders from this.
const getAboutPage = async (req, res) => {
  try {
    res.json(await readContent());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching About page', error: error.message });
  }
};

// PUT /api/about-page — admin only.
const updateAboutPage = async (req, res) => {
  try {
    res.json(await writeContent(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Error saving About page', error: error.message });
  }
};

// POST /api/about-page/reset — admin only. Puts the shipped copy back, so an
// admin who has edited themselves into a corner has a way out.
const resetAboutPage = async (req, res) => {
  try {
    res.json(await writeContent({}));
  } catch (error) {
    res.status(400).json({ message: 'Error resetting About page', error: error.message });
  }
};

module.exports = {
  getAboutPage,
  updateAboutPage,
  resetAboutPage,
};
