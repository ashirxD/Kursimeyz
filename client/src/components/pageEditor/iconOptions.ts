import type { IconOption } from '@/components/IconPicker';

/**
 * Icon vocabularies for the page editors, kept apart from the furniture-category
 * shortlist IconPicker falls back to. Passed to it as `options`.
 */

/**
 * Values, promises, craft and ways to get in touch. Used by the About page cards
 * and contact buttons, and by the dashboard hero's hover badges.
 */
export const CONTENT_ICON_OPTIONS: IconOption[] = [
    // Values and promises
    { name: 'eco', keywords: 'eco green sustainable leaf nature' },
    { name: 'recycling', keywords: 'recycle sustainable green circular' },
    { name: 'forest', keywords: 'forest trees wood timber nature' },
    { name: 'spa', keywords: 'spa calm relax wellness comfort' },
    { name: 'handshake', keywords: 'handshake trust deal partner craft' },
    { name: 'favorite', keywords: 'heart love care passion' },
    { name: 'volunteer_activism', keywords: 'care giving heart hands community' },
    { name: 'diversity_3', keywords: 'people community team together family' },
    { name: 'groups', keywords: 'team people group customers community' },
    { name: 'verified', keywords: 'verified quality trust guarantee check' },
    { name: 'workspace_premium', keywords: 'premium quality award badge medal' },
    { name: 'military_tech', keywords: 'award medal quality excellence' },
    { name: 'star', keywords: 'star rating quality favourite' },
    { name: 'thumb_up', keywords: 'like approve satisfaction happy' },
    { name: 'shield', keywords: 'shield warranty protection guarantee safe' },
    { name: 'lightbulb', keywords: 'idea design innovation thinking' },
    { name: 'rocket_launch', keywords: 'launch growth fast start mission' },
    { name: 'verified_user', keywords: 'secure trust safe verified user' },

    // Craft and making
    { name: 'carpenter', keywords: 'carpentry wood tools handmade craft' },
    { name: 'handyman', keywords: 'tools repair build craft handmade' },
    { name: 'design_services', keywords: 'design draw custom bespoke' },
    { name: 'palette', keywords: 'colour palette design finish paint' },
    { name: 'straighten', keywords: 'measure size custom dimensions ruler' },
    { name: 'factory', keywords: 'factory workshop production making' },
    { name: 'storefront', keywords: 'shop store showroom retail' },

    // Service and delivery
    { name: 'local_shipping', keywords: 'delivery shipping truck freight' },
    { name: 'inventory', keywords: 'stock inventory packing orders' },
    { name: 'assignment_return', keywords: 'returns refund exchange policy' },
    { name: 'support_agent', keywords: 'support help service agent contact' },
    { name: 'schedule', keywords: 'hours time opening schedule clock' },
    { name: 'payments', keywords: 'payment pay price money' },
    { name: 'savings', keywords: 'savings value affordable price piggy' },

    // Getting in touch
    { name: 'email', keywords: 'email mail contact message' },
    { name: 'phone', keywords: 'phone call telephone contact' },
    { name: 'chat', keywords: 'chat message talk whatsapp contact' },
    { name: 'sms', keywords: 'sms text message contact' },
    { name: 'location_on', keywords: 'location address map pin visit' },
    { name: 'public', keywords: 'website world global online' },
    { name: 'send', keywords: 'send submit message telegram' },
    { name: 'link', keywords: 'link url website external' },
    { name: 'home', keywords: 'home house back start' },
];


/** What belongs on a call-to-action button. */
export const CTA_ICON_OPTIONS: IconOption[] = [
    { name: 'arrow_forward', keywords: 'arrow forward next go right' },
    { name: 'arrow_right_alt', keywords: 'arrow right long next' },
    { name: 'east', keywords: 'arrow east right next' },
    { name: 'chevron_right', keywords: 'arrow chevron right next' },
    { name: 'keyboard_double_arrow_right', keywords: 'arrow double right fast' },
    { name: 'shopping_bag', keywords: 'shop bag buy purchase' },
    { name: 'shopping_cart', keywords: 'cart shop buy basket' },
    { name: 'local_mall', keywords: 'shop bag mall buy' },
    { name: 'storefront', keywords: 'shop store browse collection' },
    { name: 'explore', keywords: 'explore discover browse compass' },
    { name: 'visibility', keywords: 'view see look browse' },
    { name: 'chat', keywords: 'chat message contact whatsapp' },
    { name: 'call', keywords: 'call phone contact ring' },
    { name: 'bolt', keywords: 'fast quick instant energy' },
    { name: 'local_offer', keywords: 'offer deal sale tag discount' },
];