// Imports for external dependencies
const jwt = require('jsonwebtoken');
const { Storage } = require('@google-cloud/storage');
const { Readable } = require('stream');

// Imports for internal dependencies
const Item = require('../models/Item');
const User = require('../models/User');

// Dotenv config
require('dotenv').config();

const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded._id });
        return user;
    } catch (err) {
        return false;
    }
};

const findItems = async (id) => Item.find({ userId: id });

const addItem = async (userId, { name, cost, purchaseByDate, linkToProduct }, itemURL) => {
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
};

const deleteItem = async (id) => Item.findByIdAndDelete(id);

const updateItem = async (userId, _id, { name, cost, dateAdded, purchaseByDate, linkToProduct }) => {
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
};

const addItemImageToGoogleCloud = async (name, file) => {
    const storage = new Storage();
    const googleUrl = process.env.GOOGLE_URL;
    const bucketName = process.env.GOOGLE_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    const buffer = Buffer.from(file.data, 'base64');
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    await new Promise((res) => readable
        .pipe(
            bucket.file(`${name}_${file.name}`).createWriteStream({
                resumable: false,
                gzip: true
            })
        )
        .on('finish', res));
    return `${googleUrl}/${bucketName}/${name}_${file.name}`;
};

module.exports = {
    addItem,
    addItemImageToGoogleCloud,
    authenticateUser,
    deleteItem,
    findItems,
    updateItem
};