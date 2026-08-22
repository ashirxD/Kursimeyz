import type { SocialPlatform } from '@/hooks/useFooter';

/**
 * Display names for the networks the footer can link to, in the order the admin
 * picker offers them. Kept out of SocialIcon.tsx so that file exports only its
 * component.
 */
export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    pinterest: 'Pinterest',
    linkedin: 'LinkedIn',
    x: 'X',
};

export const SOCIAL_PLATFORMS = Object.keys(SOCIAL_LABELS) as SocialPlatform[];
