const mongoose = require('mongoose');

// Singleton document — only one record ever exists in this collection.
// Read with AboutPage.findOne(), write with findOneAndUpdate({}, data, { upsert: true }).
//
// Everything the storefront's About page shows lives here, so the admin can edit
// the copy, colours, icons and images without a deploy. The shape mirrors
// DEFAULT_ABOUT_CONTENT in utils/aboutContent.js, which is also what validates
// every write — this schema documents and types the document, the normaliser is
// what actually decides whether a value is allowed through.

// Sub-documents get no _id of their own: these are ordered value lists the admin
// replaces wholesale, not rows anything else ever references.
const ValueCardSchema = new mongoose.Schema(
  {
    // Material Symbols ligature name, drawn in an accent-coloured tile.
    icon: { type: String, trim: true, default: 'eco' },
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const StatSchema = new mongoose.Schema(
  {
    // The big number — free text, so "10K+" and "1,200" both work.
    value: { type: String, trim: true, default: '' },
    label: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const ContactLinkSchema = new mongoose.Schema(
  {
    icon: { type: String, trim: true, default: 'email' },
    label: { type: String, trim: true, default: '' },
    // mailto:, tel:, https: or a site-relative path. Checked by the normaliser.
    href: { type: String, trim: true, default: '' },
    // Which of the two button treatments to use.
    style: { type: String, enum: ['subtle', 'accent'], default: 'subtle' },
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    accentColor: { type: String, trim: true, default: '#ff311b' },
    headingColor: { type: String, trim: true, default: '#1a2f1a' },
    bodyColor: { type: String, trim: true, default: '#1a2f1a' },
    // Empty means inherit the site background instead of painting over it.
    pageBackground: { type: String, trim: true, default: '' },
    cardBackground: { type: String, trim: true, default: '#f4f5f0' },
    contactBackground: { type: String, trim: true, default: '#1a2f1a' },
  },
  { _id: false }
);

const AboutPageSchema = new mongoose.Schema(
  {
    theme: { type: ThemeSchema, default: () => ({}) },
    // Section keys in the order the admin dragged them into.
    sectionOrder: { type: [String], default: [] },
    hero: {
      enabled: { type: Boolean, default: true },
      eyebrow: { type: String, trim: true, default: '' },
      titleLine1: { type: String, trim: true, default: '' },
      // Rendered in the accent colour, under the first line.
      titleLine2: { type: String, trim: true, default: '' },
      subtitle: { type: String, trim: true, default: '' },
    },
    values: {
      enabled: { type: Boolean, default: true },
      eyebrow: { type: String, trim: true, default: '' },
      heading: { type: String, trim: true, default: '' },
      items: { type: [ValueCardSchema], default: [] },
    },
    story: {
      enabled: { type: Boolean, default: true },
      eyebrow: { type: String, trim: true, default: '' },
      heading: { type: String, trim: true, default: '' },
      paragraphs: { type: [String], default: [] },
      image: { type: String, trim: true, default: '' },
      imageAlt: { type: String, trim: true, default: '' },
      // Which side the photo sits on; the text takes the other.
      imagePosition: { type: String, enum: ['left', 'right'], default: 'right' },
      badgeEnabled: { type: Boolean, default: true },
      badgeValue: { type: String, trim: true, default: '' },
      badgeLabel: { type: String, trim: true, default: '' },
    },
    stats: {
      enabled: { type: Boolean, default: true },
      items: { type: [StatSchema], default: [] },
    },
    contact: {
      enabled: { type: Boolean, default: true },
      heading: { type: String, trim: true, default: '' },
      subtitle: { type: String, trim: true, default: '' },
      links: { type: [ContactLinkSchema], default: [] },
    },
    backLink: {
      enabled: { type: Boolean, default: true },
      label: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AboutPage', AboutPageSchema);
