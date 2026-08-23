const mongoose = require('mongoose');

// Singleton document — only one record ever exists in this collection.
// Read with HomePage.findOne(), write with findOneAndUpdate({}, data, { upsert: true }).
//
// Holds the dashboard hero the admin authors: its copy, colours, photo and hover
// badges. The shape mirrors DEFAULT_HOME_CONTENT in utils/homeContent.js, which is
// also what validates every write — this schema documents and types the document,
// the normaliser decides whether a value is allowed through.

// No _id on the sub-documents: these are ordered value lists the admin replaces
// wholesale, not rows anything else references.
const HeadlineLineSchema = new mongoose.Schema(
    {
        text: { type: String, trim: true, default: '' },
        color: { type: String, trim: true, default: '#1a2f1a' },
    },
    { _id: false }
);

const HeroBadgeSchema = new mongoose.Schema(
    {
        // Material Symbols ligature name.
        icon: { type: String, trim: true, default: 'eco' },
        // Tints the pill, its border and the glyph.
        color: { type: String, trim: true, default: '#ffffff' },
        position: {
            type: String,
            enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            default: 'top-left',
        },
    },
    { _id: false }
);

const HomePageSchema = new mongoose.Schema(
    {
        hero: {
            enabled: { type: Boolean, default: true },
            kicker: {
                text: { type: String, trim: true, default: '' },
                dotColor: { type: String, trim: true, default: '#ff311b' },
                textColor: { type: String, trim: true, default: '#1a2f1a' },
            },
            headlineLines: { type: [HeadlineLineSchema], default: [] },
            subtitle: { type: String, trim: true, default: '' },
            subtitleColor: { type: String, trim: true, default: '#1a2f1a' },
            cta: {
                enabled: { type: Boolean, default: true },
                label: { type: String, trim: true, default: '' },
                icon: { type: String, trim: true, default: 'arrow_forward' },
                // 'scroll' jumps to the collections grid; 'link' follows href.
                action: { type: String, enum: ['scroll', 'link'], default: 'scroll' },
                href: { type: String, trim: true, default: '' },
                backgroundColor: { type: String, trim: true, default: '#ff311b' },
                textColor: { type: String, trim: true, default: '#ffffff' },
            },
            image: {
                url: { type: String, trim: true, default: '' },
                alt: { type: String, trim: true, default: '' },
                // The tilted panel behind the photo.
                backdropColor: { type: String, trim: true, default: '#f8fafc' },
            },
            badges: {
                enabled: { type: Boolean, default: true },
                items: { type: [HeroBadgeSchema], default: [] },
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('HomePage', HomePageSchema);
