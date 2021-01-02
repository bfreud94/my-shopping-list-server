// Imports for external dependencies
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Imports for internal dependencies
const Item = require('../models/Item');
const User = require('../models/User');

const authenticateUser = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ _id: decoded._id });
        return user;
    } catch (err) {
        return false;
    }
};

router.get('/items', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const items = await Item.find({ userId: authenticatedUser._id });
            res.send(items);
        } else {
            res.status(401);
            next(new Error('Unauthenticated user'));
        }
    } catch (error) {
        next(error);
    }
});

router.post('/item', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const item = new Item({
                userId: authenticatedUser._id,
                name: req.body.item.name,
                cost: req.body.item.cost,
                dateAdded: new Date(),
                purchaseByDate: req.body.item.purchaseByDate,
                linkToProduct: req.body.item.linkToProduct
            });
            const savedItem = await item.save();
            res.json({ savedItem, created: true });
        } else {
            res.status(401);
            next(new Error('Unauthenticated user'));
        }
    } catch (error) {
        next(error);
    }
});

router.delete('/item', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const { id } = req.query;
            const item = await Item.findByIdAndDelete(id);
            if (item) {
                res.send({ item, deleted: true });
            } else {
                res.status(404);
                next(new Error('Item does not exist'));
            }
        } else {
            res.status(401);
            next(new Error('Unauthenticated user'));
        }
    } catch (error) {
        next(error);
    }
});

router.put('/item', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const query = { _id: req.query.id };
            const updatedItem = {
                userId: authenticatedUser._id,
                _id: req.query.id,
                name: req.body.name,
                cost: req.body.cost,
                dateAdded: req.body.dateAdded,
                purchaseByDate: req.body.purchaseByDate,
                linkToProduct: req.body.linkToProduct
            };
            // eslint-disable-next-line no-unused-vars
            await Item.findOneAndUpdate(query, updatedItem, { useFindAndModify: false }, (error, doc) => {
                if (error) return next(error);
                return res.send({ id: req.query.id, updatedItem, updated: true });
            });
        } else {
            res.status(401);
            next(new Error('Unauthenticated user'));
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;