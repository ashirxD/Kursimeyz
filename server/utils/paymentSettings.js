// What customers are told about paying: the shop's WhatsApp number and the
// account behind each payment method. Read by the checkout (through the user
// controller) and by the order emails, so both always quote the same details.

const DEFAULT_WHATSAPP_NUMBER = '+923211411478';
const DEFAULT_EASYPAISA_REDIRECT_URL = 'https://easypaisa.onelink.me/cw4d/q9y8ba5v';
const DEFAULT_JAZZCASH_REDIRECT_URL = 'https://www.jazzcash.com.pk/jazzcash-app-aur-bhi-behtar/';

// Fills anything the admin has not set with its default, so callers never have to
// guess which fields can be empty.
const buildPaymentSettingsResponse = (doc) => ({
    whatsappNumber: doc?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
    easypaisaAccountNumber: doc?.easypaisaAccountNumber || '',
    easypaisaRedirectUrl: doc?.easypaisaRedirectUrl || DEFAULT_EASYPAISA_REDIRECT_URL,
    jazzcashAccountNumber: doc?.jazzcashAccountNumber || '',
    jazzcashRedirectUrl: doc?.jazzcashRedirectUrl || DEFAULT_JAZZCASH_REDIRECT_URL,
    bankAccountNumber: doc?.bankAccountNumber || '',
    bankName: doc?.bankName || '',
    bankAccountTitle: doc?.bankAccountTitle || '',
});

module.exports = {
    DEFAULT_WHATSAPP_NUMBER,
    DEFAULT_EASYPAISA_REDIRECT_URL,
    DEFAULT_JAZZCASH_REDIRECT_URL,
    buildPaymentSettingsResponse,
};
