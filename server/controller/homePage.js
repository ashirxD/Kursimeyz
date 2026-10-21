const HomePage = require('../models/HomePage');
const { normalizeHomeContent } = require('../utils/homeContent');
const { sendError } = require('../middleware/errorHandler');

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
    return sendError(res, error, 'We couldn\'t load the home page. Please refresh the page and try again.');
  }
};

// PUT /api/home-page — admin only.
const updateHomePage = async (req, res) => {
  try {
    res.json(await writeContent(req.body));
  } catch (error) {
    return sendError(res, error, 'We couldn\'t save the home page. Please try again.');
  }
};

// POST /api/home-page/reset — admin only. Puts the shipped hero back, so an admin
// who has edited themselves into a corner has a way out.
const resetHomePage = async (req, res) => {
  try {
    res.json(await writeContent({}));
  } catch (error) {
    return sendError(res, error, 'We couldn\'t reset the home page. Please try again.');
  }
};

module.exports = {
  getHomePage,
  updateHomePage,
  resetHomePage,
};
