const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'Quantity cannot be less than 1.'],
            },
        },
    ],
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Cart', CartSchema);
