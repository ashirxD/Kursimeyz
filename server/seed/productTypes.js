const ProductType = require('../models/ProductType');

// The three types the shop shipped with, back when they were a hardcoded enum
// and a page file each. Slugs match the `category` values already on existing
// products, so seeding these needs no data migration. Copy, colour presets and
// card layout are lifted verbatim from the old pages so nothing looks different.
const BUILT_IN_TYPES = [
  {
    name: 'Chair',
    pluralName: 'Chairs',
    slug: 'chair',
    pluralSlug: 'chairs',
    icon: 'chair',
    coverImage:
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800',
    heroTitle: 'Find your perfect seat',
    heroSubtitle:
      'Handcrafted from sustainable materials for your sanctuary. Designed to bring peace and comfort to your living space.',
    tagline: 'Handcrafted Comfort',
    colorPresets: ['#3a4d39', '#d27d53', '#8a9a5b', '#4b3621', '#f5f0e6'],
    cardLayout: 'compact',
    defaultMaxPrice: 1500,
    order: 0,
  },
  {
    name: 'Table',
    pluralName: 'Tables',
    slug: 'table',
    pluralSlug: 'tables',
    icon: 'table_restaurant',
    coverImage:
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800',
    heroTitle: 'Find your perfect table',
    heroSubtitle:
      'Large-scale wood carvings for dining and work. Built from solid timber and finished by hand.',
    tagline: 'Modern Elegance',
    colorPresets: ['#4b3621', '#8b4513', '#d2b48c', '#deb887', '#3a4d39'],
    cardLayout: 'wide',
    defaultMaxPrice: 2000,
    order: 1,
  },
  {
    name: 'Sofa',
    pluralName: 'Sofas',
    slug: 'sofa',
    pluralSlug: 'sofas',
    icon: 'weekend',
    coverImage:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
    heroTitle: 'Find your perfect sofa',
    heroSubtitle:
      'Luxurious and comfortable sofas designed for relaxation. Choose from a variety of styles and premium fabrics.',
    tagline: 'Luxurious Lounging',
    colorPresets: ['#4b3621', '#2c3e50', '#8e44ad', '#c0392b', '#27ae60', '#f1c40f'],
    cardLayout: 'wide',
    defaultMaxPrice: 5000,
    order: 2,
  },
];

/**
 * Runs on boot. Only seeds into an empty collection, so an admin who renames or
 * deletes a built-in type does not get it silently resurrected on the next
 * restart.
 */
const seedProductTypes = async () => {
  try {
    const existing = await ProductType.estimatedDocumentCount();
    if (existing > 0) return;

    await ProductType.insertMany(BUILT_IN_TYPES);
    console.log(`Seeded ${BUILT_IN_TYPES.length} built-in product types`);
  } catch (error) {
    console.error('Failed to seed product types:', error.message);
  }
};

module.exports = { seedProductTypes, BUILT_IN_TYPES };
