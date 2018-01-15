'use strict';
import mongoose from 'mongoose'
const Schema = mongoose.Schema;
const Ticker = new Schema({
    Market: String,
    Time: String,
    Bid: Number,
    Ask: Number,
    Last: Number,
    Buy: [{
        Quantity: Number,
        Rate: Number
    }],
    Sell: [{
        Quantity: Number,
        Rate: Number
    }]
}, { versionKey: false });

module.exports = mongoose.model('ticker', Ticker);