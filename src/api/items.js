// Imports for external dependencies
const express = require('express');
const router = express.Router();

// Imports for service layer
const { addItem, addItemImageToGoogleCloud, deleteItemImageFromGoogleCloud, authenticateUser, deleteItem, getItems, updateItem } = require('../service/itemService');

router.get('/items', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const items = await getItems(authenticatedUser._id, next);
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
            if (req.files) {
                const itemURL = await addItemImageToGoogleCloud(req.body.name + Math.round(new Date() / 1000), req.files.image, next);
                const savedItem = await addItem(authenticatedUser._id, req.body, itemURL, next);
                res.json({ savedItem, created: true });
            } else {
                res.status(500);
                const errorName = req.body.name === '' || req.body.cost === '' || req.body.purchaseByDate === '' || req.body.linkToProduct === '' ? 'Multiple Form Errors' : 'No image provided';
                next(new Error(errorName));
            }
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
            const item = await deleteItem(req.query.id, next);
            const itemURLSplit = item.itemURL.split('/');
            const deletedFromGoogleCloud = await deleteItemImageFromGoogleCloud(itemURLSplit[itemURLSplit.length - 1], next);
            if (item && deletedFromGoogleCloud) {
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
            const { id } = req.query;
            const savedItem = await updateItem(authenticatedUser._id, req.query.id, req.body, next);
            res.send({ id, savedItem, updated: true });
        } else {
            res.status(401);
            next(new Error('Unauthenticated user'));
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;