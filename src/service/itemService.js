// Imports for external dependencies
const jwt = require('jsonwebtoken');
const { Storage } = require('@google-cloud/storage');
const { Readable } = require('stream');

// Imports for internal dependencies
const Item = require('../models/Item');
const User = require('../models/User');

// Dotenv config
require('dotenv').config();

// Global GCS Constants
const storage = new Storage();
const bucketName = process.env.GOOGLE_BUCKET_NAME;

const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded._id });
        return user;
    } catch (err) {
        return false;
    }
};

const getItems = async (id, next) => {
    try {
        return Item.find({ userId: id });
    } catch (err) {
        next(new Error('Failed to get items from MongoDB'));
    }
    return null;
};

const addItem = async (userId, { name, cost, purchaseByDate, linkToProduct }, itemURL, next) => {
    try {
        const item = new Item({
            userId,
            name,
            cost,
            dateAdded: new Date(),
            purchaseByDate,
            linkToProduct,
            itemURL
        });
        return item.save();
    } catch (err) {
        next(new Error('Failed to add item to MongoDB'));
    }
    return null;
};

const deleteItem = async (id, next) => {
    try {
        return Item.findByIdAndDelete(id);
    } catch (err) {
        next(new Error('Failed to delete item from MongoDB'));
    }
    return null;
};

const updateItem = async (userId, _id, { name, cost, dateAdded, purchaseByDate, linkToProduct }, next) => {
    try {
        const query = { _id };
        const updatedItem = {
            userId,
            _id,
            name,
            cost,
            dateAdded,
            purchaseByDate,
            linkToProduct
        };
        return Item.findOneAndUpdate(query, updatedItem, { useFindAndModify: false });
    } catch (err) {
        next(new Error('Failed to update item from MongoDB'));
    }
    return null;
};

const addItemImageToGoogleCloud = async (name, file, next) => {
    try {
        const googleUrl = process.env.GOOGLE_URL;
        const bucket = storage.bucket(bucketName);
        const buffer = Buffer.from(file.data, 'base64');
        const readable = new Readable();
        readable._read = () => {};
        readable.push(buffer);
        readable.push(null);
        const fileExtension = file.name.split('.')[1];
        await new Promise((res) => readable
            .pipe(
                bucket.file(`${name}.${fileExtension}`).createWriteStream({
                    resumable: false,
                    gzip: true
                })
            )
            .on('finish', res));
        return `${googleUrl}/${bucketName}/${name}.${fileExtension}`;
    } catch (err) {
        next(new Error('Failed to add image to GCS'));
    }
    return null;
};

const deleteItemImageFromGoogleCloud = async (filePath, next) => {
    try {
        const bucket = storage.bucket(bucketName);
        const deleted = await bucket.file(filePath).delete();
        return deleted;
    } catch (err) {
        next(new Error('Failed to delete item from GCS'));
    }
    return null;
};

module.exports = {
    addItem,
    addItemImageToGoogleCloud,
    authenticateUser,
    deleteItem,
    deleteItemImageFromGoogleCloud,
    getItems,
    updateItem
};