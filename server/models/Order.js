const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    // Human-readable reference an admin can set, e.g. "ORD-1042". Shown wherever
    // the order is identified, in place of the tail of `_id`. Empty means never
    // customised, so existing orders keep their derived label with no migration.
    // See utils/orderNumber.js for validation and how the label is chosen.
    orderNumber: {
        type: String,
        trim: true,
        default: '',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        zipCode: { type: String, required: true },
        phone: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Easypaisa', 'JazzCash', 'Bank'],
        required: true
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    paymentConfirmation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentConfirmation',
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    deliveredAt: {
        type: Date,
    },
    reviewPromptSnoozedUntil: {
        type: Date,
    },
    reviewsSkippedAt: {
        type: Date,
    },
}, {
    timestamps: true
});

// Two orders sharing a number would make the label useless for looking one up.
// Partial, so the many orders with no custom number do not all collide on ''.
// The controller also checks case-insensitively; this is the backstop for a race.
OrderSchema.index(
    { orderNumber: 1 },
    { unique: true, partialFilterExpression: { orderNumber: { $gt: '' } } }
);

module.exports = mongoose.model('Order', OrderSchema);
