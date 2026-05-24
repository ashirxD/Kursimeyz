const mongoose = require('mongoose');

const PaymentConfirmationSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    transactionReference: {
        type: String,
        trim: true,
        default: '',
    },
    paymentDate: {
        type: Date,
    },
    receiptUrl: {
        type: String,
        trim: true,
        default: '',
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    confirmedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PaymentConfirmation', PaymentConfirmationSchema);
