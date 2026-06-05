const PAKISTANI_MOBILE_MESSAGE = 'Please provide a valid Pakistani mobile number starting with +92 or 03';

const normalizePakistaniMobile = (value) => {
    const compact = (value || '').toString().trim().replace(/[\s().-]/g, '');

    if (!/^\+?\d+$/.test(compact)) {
        return '';
    }

    let digits = compact.startsWith('+') ? compact.slice(1) : compact;

    if (digits.startsWith('03') && digits.length === 11) {
        digits = `92${digits.slice(1)}`;
    }

    if (/^923\d{9}$/.test(digits)) {
        return `+${digits}`;
    }

    return '';
};

const isValidPakistaniMobile = (value) => Boolean(normalizePakistaniMobile(value));

const requirePakistaniMobile = (value) => {
    const normalized = normalizePakistaniMobile(value);

    if (!normalized) {
        const error = new Error(PAKISTANI_MOBILE_MESSAGE);
        error.statusCode = 400;
        throw error;
    }

    return normalized;
};

module.exports = {
    PAKISTANI_MOBILE_MESSAGE,
    normalizePakistaniMobile,
    isValidPakistaniMobile,
    requirePakistaniMobile,
};
