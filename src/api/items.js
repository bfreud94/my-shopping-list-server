// Imports for external dependencies
const express = require('express');
const router = express.Router();

// Imports for service layer
const { addItem, addItemImageToGoogleCloud, authenticateUser, deleteItem, findItems, updateItem } = require('../service/itemService');

router.get('/items', async (req, res, next) => {
    try {
        const authenticatedUser = await authenticateUser(req.headers.authorization);
        if (authenticatedUser) {
            const items = await findItems(authenticatedUser._id);
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
            const itemURL = await addItemImageToGoogleCloud(req.body.name + Math.round(new Date() / 1000), req.files.image);
            const savedItem = await addItem(authenticatedUser._id, req.body, itemURL);
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
            const item = await deleteItem(req.query.id);
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
            const { id } = req.query;
            const savedItem = await updateItem(authenticatedUser._id, req.query.id, req.body);
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