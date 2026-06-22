const mongoose = require('mongoose');

// Singleton document — only one record ever exists in this collection.
// Read with PaymentSettings.findOne(), write with findOneAndUpdate({}, data, { upsert: true }).
const PaymentSettingsSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        trim: true,
        default: '',
    },
    easypaisaAccountNumber: {
        type: String,
        trim: true,
        default: '',
    },
    easypaisaRedirectUrl: {
        type: String,
        trim: true,
        default: '',
    },
    jazzcashAccountNumber: {
        type: String,
        trim: true,
        default: '',
    },
    jazzcashRedirectUrl: {
        type: String,
        trim: true,
        default: '',
    },
    bankAccountNumber: {
        type: String,
        trim: true,
        default: '',
    },
    bankName: {
        type: String,
        trim: true,
        default: '',
    },
    bankAccountTitle: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PaymentSettings', PaymentSettingsSchema);
