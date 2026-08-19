const HomePage = require('../models/HomePage');
const { normalizeHomeContent } = require('../utils/homeContent');

// Both directions run through normalizeHomeContent: reads so an empty or older
// document still answers with a complete hero, writes so nothing unvalidated is
// ever stored. See utils/homeContent.js for what "valid" means per field.
const readContent = async () => {
  const stored = await HomePage.findOne().lean();
  return normalizeHomeContent(stored || {});
};

// Replaces the whole document, so the caller must send the entire content object;
// anything omitted resets to its built-in default rather than keeping the stored
// value. The admin editor loads the current content first and submits all of it.
const writeContent = async (body) => {
  const content = normalizeHomeContent(body);

  await HomePage.findOneAndUpdate({}, content, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return content;
};

// GET /api/home-page — public; the storefront dashboard hero renders from this.
const getHomePage = async (req, res) => {
  try {
    res.json(await readContent());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching home page', error: error.message });
  }
};

// PUT /api/home-page — admin only.
const updateHomePage = async (req, res) => {
  try {
    res.json(await writeContent(req.body));
  } catch (error) {
    res.status(400).json({ message: 'Error saving home page', error: error.message });
  }
};

// POST /api/home-page/reset — admin only. Puts the shipped hero back, so an admin
// who has edited themselves into a corner has a way out.
const resetHomePage = async (req, res) => {
  try {
    res.json(await writeContent({}));
  } catch (error) {
    res.status(400).json({ message: 'Error resetting home page', error: error.message });
  }
};

module.exports = {
  getHomePage,
  updateHomePage,
  resetHomePage,
};
