const mongoose = require('mongoose');

const requiredString = {
    type: String,
    required: true
};
const requiredNumber = {
    type: Number,
    required: true
};
const requiredDate = {
    type: Date,
    required: true
};

const ItemSchema = mongoose.Schema({
    userId: requiredString,
    name: requiredString,
    cost: requiredNumber,
    dateAdded: requiredDate,
    purchaseByDate: requiredDate,
    linkToProduct: requiredString,
    itemURL: requiredString
});

module.exports = mongoose.model('items', ItemSchema);
