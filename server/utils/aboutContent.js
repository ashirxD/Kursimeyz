// The About page is admin-authored: every string, colour, icon and image on it
// comes out of a single settings document. This module owns two things — what
// the page says before anyone edits it, and how an incoming edit is sanitised.
//
// Sanitising happens on the way in *and* on the way out, against the defaults
// below. That means a stored document from an older shape, or one missing a
// field entirely, still renders a complete page instead of breaking the client.

const {
    asObject,
    pickBoolean,
    pickColor,
    pickHref,
    pickIcon,
    pickImage,
    pickList,
    pickParagraph,
    pickString,
} = require('./contentFields');

// Render order, and the only keys a stored order may contain.
const SECTION_KEYS = ['hero', 'values', 'story', 'stats', 'contact', 'backLink'];

// Lifted verbatim from the hand-written page this replaced, so an untouched
// shop looks exactly as it did before the feature landed.
const DEFAULT_ABOUT_CONTENT = {
  theme: {
    // Eyebrow dots, the second title line, value icons, the story badge and the
    // primary contact button.
    accentColor: '#ff6b35',
    // Every heading, plus the stat numbers.
    headingColor: '#1a2f1a',
    // Paragraphs and small labels, each at its own opacity.
    bodyColor: '#1a2f1a',
    // Empty means "inherit the site background" rather than paint over it.
    pageBackground: '',
    cardBackground: '#f4f5f0',
    contactBackground: '#1a2f1a',
  },
  sectionOrder: [...SECTION_KEYS],
  hero: {
    enabled: true,
    eyebrow: 'Our Story',
    titleLine1: 'Crafting Comfort',
    // Rendered in the accent colour under the first line.
    titleLine2: 'Since 2020',
    subtitle:
      'We believe that everyone deserves a space to relax, unwind, and feel truly at home. Our mission is to bring you furniture that transforms houses into sanctuaries.',
  },
  values: {
    enabled: true,
    // Both blank by default — the original page had no heading above the cards.
    eyebrow: '',
    heading: '',
    items: [
      {
        icon: 'eco',
        title: 'Sustainable',
        description:
          'We use eco-friendly materials and sustainable practices to minimize our environmental footprint.',
      },
      {
        icon: 'handshake',
        title: 'Handcrafted',
        description:
          'Each piece is meticulously crafted by skilled artisans who pour their passion into every detail.',
      },
      {
        icon: 'favorite',
        title: 'Made with Love',
        description:
          'We put our heart into every product, ensuring you receive furniture that brings joy for years.',
      },
    ],
  },
  story: {
    enabled: true,
    eyebrow: 'Our Journey',
    heading: 'From a Small Workshop to Your Home',
    paragraphs: [
      'Relaxing Chair Shop started as a small family workshop with a simple dream: to create furniture that people truly love. What began as a passion project has grown into a beloved brand trusted by thousands of customers.',
      'Today, we continue to honor our roots by maintaining the same attention to detail and commitment to quality that defined our first chair. Every piece tells a story of dedication, craftsmanship, and the pursuit of comfort.',
    ],
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=1000',
    imageAlt: 'Craftsman working on furniture',
    // Which side the photo sits on; the text takes the other.
    imagePosition: 'right',
    badgeEnabled: true,
    badgeValue: '4+',
    badgeLabel: 'Years of Excellence',
  },
  stats: {
    enabled: true,
    items: [
      { value: '10K+', label: 'Happy Customers' },
      { value: '50+', label: 'Products' },
      { value: '25+', label: 'Artisans' },
      { value: '15+', label: 'Cities Served' },
    ],
  },
  contact: {
    enabled: true,
    heading: 'Get in Touch',
    subtitle:
      'Have questions? We would love to hear from you. Reach out to our support team.',
    links: [
      {
        icon: 'email',
        label: 'support@relaxingchairshop.com',
        href: 'mailto:support@relaxingchairshop.com',
        style: 'subtle',
      },
      {
        icon: 'phone',
        label: '+92 321 1411478',
        href: 'tel:+923211411478',
        style: 'accent',
      },
    ],
  },
  backLink: {
    enabled: true,
    label: 'Back to Home',
  },
};

// Caps exist so one paste of a novel cannot break the layout for every visitor.
const LIMITS = {
  eyebrow: 60,
  title: 90,
  heading: 120,
  paragraph: 1200,
  label: 80,
  statValue: 12,
  badgeValue: 12,
  href: 400,
  image: 500,
  values: 8,
  stats: 8,
  paragraphs: 8,
  links: 5,
};

// Section order is About-specific — it is validated against this page's own
// section keys — so it stays here rather than moving to contentFields.js.
const pickSectionOrder = (value) => {
  const order = [];

  if (Array.isArray(value)) {
    value.forEach((key) => {
      if (SECTION_KEYS.includes(key) && !order.includes(key)) order.push(key);
    });
  }

  // Sections the stored order never heard of still render, at the end. Adding a
  // key to SECTION_KEYS therefore needs no migration.
  SECTION_KEYS.forEach((key) => {
    if (!order.includes(key)) order.push(key);
  });

  return order;
};

/**
 * Builds a complete, safe content object out of whatever the caller sent.
 *
 * This is a full replacement rather than a patch: any field the body omits falls
 * back to the built-in default, not to what is currently stored. The admin form
 * always submits the whole object, and reads run through here too, so the client
 * is guaranteed every field on every response.
 */
const normalizeAboutContent = (body) => {
  const source = asObject(body);
  const defaults = DEFAULT_ABOUT_CONTENT;

  const theme = asObject(source.theme);
  const hero = asObject(source.hero);
  const values = asObject(source.values);
  const story = asObject(source.story);
  const stats = asObject(source.stats);
  const contact = asObject(source.contact);
  const backLink = asObject(source.backLink);

  // A half-filled new row still gets a usable icon rather than a blank square.
  const valueIcon = defaults.values.items[0].icon;
  const linkIcon = defaults.contact.links[0].icon;

  return {
    theme: {
      accentColor: pickColor(theme.accentColor, defaults.theme.accentColor),
      headingColor: pickColor(theme.headingColor, defaults.theme.headingColor),
      bodyColor: pickColor(theme.bodyColor, defaults.theme.bodyColor),
      pageBackground: pickColor(theme.pageBackground, defaults.theme.pageBackground, {
        allowEmpty: true,
      }),
      cardBackground: pickColor(theme.cardBackground, defaults.theme.cardBackground),
      contactBackground: pickColor(
        theme.contactBackground,
        defaults.theme.contactBackground
      ),
    },
    sectionOrder: pickSectionOrder(source.sectionOrder),
    hero: {
      enabled: pickBoolean(hero.enabled, defaults.hero.enabled),
      eyebrow: pickString(hero.eyebrow, defaults.hero.eyebrow, LIMITS.eyebrow),
      titleLine1: pickString(hero.titleLine1, defaults.hero.titleLine1, LIMITS.title),
      titleLine2: pickString(hero.titleLine2, defaults.hero.titleLine2, LIMITS.title),
      subtitle: pickParagraph(hero.subtitle, defaults.hero.subtitle, LIMITS.paragraph),
    },
    values: {
      enabled: pickBoolean(values.enabled, defaults.values.enabled),
      eyebrow: pickString(values.eyebrow, defaults.values.eyebrow, LIMITS.eyebrow),
      heading: pickString(values.heading, defaults.values.heading, LIMITS.heading),
      items: pickList({
        value: values.items,
        fallback: defaults.values.items,
        maxItems: LIMITS.values,
        mapItem: (item) => ({
          icon: pickIcon(item.icon, valueIcon),
          title: pickString(item.title, '', LIMITS.label),
          description: pickParagraph(item.description, '', LIMITS.paragraph),
        }),
        isEmpty: (item) => item.title === '' && item.description === '',
      }),
    },
    story: {
      enabled: pickBoolean(story.enabled, defaults.story.enabled),
      eyebrow: pickString(story.eyebrow, defaults.story.eyebrow, LIMITS.eyebrow),
      heading: pickString(story.heading, defaults.story.heading, LIMITS.heading),
      paragraphs: pickList({
        value: story.paragraphs,
        fallback: defaults.story.paragraphs,
        maxItems: LIMITS.paragraphs,
        mapItem: (item) => pickParagraph(item, '', LIMITS.paragraph),
        isEmpty: (item) => item === '',
      }),
      image: pickImage(story.image, defaults.story.image, LIMITS.image),
      imageAlt: pickString(story.imageAlt, defaults.story.imageAlt, LIMITS.label),
      imagePosition: story.imagePosition === 'left' ? 'left' : 'right',
      badgeEnabled: pickBoolean(story.badgeEnabled, defaults.story.badgeEnabled),
      badgeValue: pickString(story.badgeValue, defaults.story.badgeValue, LIMITS.badgeValue),
      badgeLabel: pickString(story.badgeLabel, defaults.story.badgeLabel, LIMITS.label),
    },
    stats: {
      enabled: pickBoolean(stats.enabled, defaults.stats.enabled),
      items: pickList({
        value: stats.items,
        fallback: defaults.stats.items,
        maxItems: LIMITS.stats,
        mapItem: (item) => ({
          value: pickString(item.value, '', LIMITS.statValue),
          label: pickString(item.label, '', LIMITS.label),
        }),
        isEmpty: (item) => item.value === '' && item.label === '',
      }),
    },
    contact: {
      enabled: pickBoolean(contact.enabled, defaults.contact.enabled),
      heading: pickString(contact.heading, defaults.contact.heading, LIMITS.heading),
      subtitle: pickParagraph(contact.subtitle, defaults.contact.subtitle, LIMITS.paragraph),
      links: pickList({
        value: contact.links,
        fallback: defaults.contact.links,
        maxItems: LIMITS.links,
        mapItem: (item) => ({
          icon: pickIcon(item.icon, linkIcon),
          label: pickString(item.label, '', LIMITS.label),
          href: pickHref(item.href, '', LIMITS.href),
          style: item.style === 'accent' ? 'accent' : 'subtle',
        }),
        // A button with no destination, or no words on it, is not worth rendering.
        isEmpty: (item) => item.label === '' || item.href === '',
      }),
    },
    backLink: {
      enabled: pickBoolean(backLink.enabled, defaults.backLink.enabled),
      label: pickString(backLink.label, defaults.backLink.label, LIMITS.label),
    },
  };
};

module.exports = {
  SECTION_KEYS,
  DEFAULT_ABOUT_CONTENT,
  normalizeAboutContent,
};
