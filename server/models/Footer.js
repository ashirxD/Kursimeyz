const mongoose = require('mongoose');

// Singleton document — only one record ever exists in this collection.
// Read with Footer.findOne(), write with findOneAndUpdate({}, data, { upsert: true }).
//
// Holds the storefront footer the admin authors: its blurb, link columns,
// contact details, social profiles and colours. The shape mirrors
// DEFAULT_FOOTER_CONTENT in utils/footerContent.js, which is also what validates
// every write — this schema documents and types the document, the normaliser
// decides whether a value is allowed through.

// No _id on the sub-documents: these are ordered value lists the admin replaces
// wholesale, not rows anything else references.
const FooterLinkSchema = new mongoose.Schema(
    {
        label: { type: String, trim: true, default: '' },
        href: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const FooterColumnSchema = new mongoose.Schema(
    {
        heading: { type: String, trim: true, default: '' },
        links: { type: [FooterLinkSchema], default: [] },
    },
    { _id: false }
);

const SocialLinkSchema = new mongoose.Schema(
    {
        // One of SOCIAL_PLATFORMS; decides which brand mark is drawn.
        platform: { type: String, trim: true, default: 'whatsapp' },
        href: { type: String, trim: true, default: '' },
    },
    { _id: false }
);

const FooterSchema = new mongoose.Schema(
    {
        enabled: { type: Boolean, default: true },
        theme: {
            backgroundColor: { type: String, trim: true, default: '#1a2f1a' },
            accentColor: { type: String, trim: true, default: '#ff6b35' },
            textColor: { type: String, trim: true, default: '#ffffff' },
        },
        brand: {
            showLogo: { type: Boolean, default: true },
            tagline: { type: String, trim: true, default: '' },
        },
        // Built from the admin's product types rather than stored links, so only
        // the heading and whether to show it live here.
        collections: {
            enabled: { type: Boolean, default: true },
            heading: { type: String, trim: true, default: 'Collections' },
        },
        columns: { type: [FooterColumnSchema], default: [] },
        contact: {
            enabled: { type: Boolean, default: true },
            heading: { type: String, trim: true, default: '' },
            // The shop's street address, and an optional maps link for it.
            address: { type: String, trim: true, default: '' },
            mapUrl: { type: String, trim: true, default: '' },
            phone: { type: String, trim: true, default: '' },
            email: { type: String, trim: true, default: '' },
            hours: { type: String, trim: true, default: '' },
        },
        social: {
            enabled: { type: Boolean, default: true },
            items: { type: [SocialLinkSchema], default: [] },
        },
        bottom: {
            // '{year}' is replaced with the current year when the footer renders.
            copyright: { type: String, trim: true, default: '' },
            links: { type: [FooterLinkSchema], default: [] },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Footer', FooterSchema);
