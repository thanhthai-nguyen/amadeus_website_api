const mongoose = require('mongoose');

const cartItemtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },

    count: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }

}, {timestamps: true});


mongoose.set('useFindAndModify', false);
module.exports = mongoose.model('CartItem', cartItemtSchema);