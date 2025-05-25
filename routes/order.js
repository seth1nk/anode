const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Order } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', 'orders');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-orders', authRequired, (req, res) => {
    res.redirect('/orders/index.html');
});

router.get('/api/orders', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Order.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'customer_name', 'customer_email', 'total_amount', 'status', 'payment_method', 'delivery_method', 'shipping_address', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedOrders = rows.map(item => ({
            id: item.id,
            customer_name: item.customer_name,
            customer_email: item.customer_email,
            total_amount: item.total_amount,
            status: item.status,
            payment_method: item.payment_method,
            delivery_method: item.delivery_method,
            shipping_address: item.shipping_address,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            orders: formattedOrders,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-order/:id', authRequired, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            attributes: ['id', 'customer_name', 'customer_email', 'total_amount', 'status', 'payment_method', 'delivery_method', 'shipping_address', 'photo'],
        });
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        const formattedOrder = {
            id: order.id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total_amount: order.total_amount,
            status: order.status,
            payment_method: order.payment_method,
            delivery_method: order.delivery_method,
            shipping_address: order.shipping_address,
            photo: order.photo ? order.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedOrder);
    } catch (error) {
        console.error('Ошибка при получении заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/orders', authRequired, async (req, res) => {
    try {
        const { customer_name, customer_email, total_amount, status, payment_method, delivery_method, shipping_address, photo } = req.body;
        const order = await Order.create({
            customer_name,
            customer_email,
            total_amount,
            status,
            payment_method,
            delivery_method,
            shipping_address,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedOrder = {
            id: order.id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total_amount: order.total_amount,
            status: order.status,
            payment_method: order.payment_method,
            delivery_method: order.delivery_method,
            shipping_address: order.shipping_address,
            photo: order.photo,
        };
        res.status(201).json(formattedOrder);
    } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-order', authRequired, upload.single('photo'), async (req, res) => {
    let order;
    try {
        const requiredFields = ['customer_name', 'customer_email', 'total_amount', 'status', 'payment_method', 'shipping_address'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { customer_name, customer_email, total_amount, status, payment_method, delivery_method, shipping_address } = req.body;
        order = await Order.create({
            customer_name: customer_name.trim(),
            customer_email: customer_email.trim(),
            total_amount: parseFloat(total_amount),
            status: status.trim(),
            payment_method: payment_method.trim(),
            delivery_method: delivery_method ? delivery_method.trim() : null,
            shipping_address: shipping_address.trim(),
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'orders', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/orders/${req.file.originalname}`;
            await order.update({ photo: photoPath });
        }

        res.redirect('/orders/index.html');
    } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        if (order) await order.destroy();
        res.status(500).send(`Ошибка при создании заказа: ${error.message}`);
    }
});

router.put('/api/orders/:id', authRequired, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        const { customer_name, customer_email, total_amount, status, payment_method, delivery_method, shipping_address, photo } = req.body;
        await order.update({
            customer_name,
            customer_email,
            total_amount,
            status,
            payment_method,
            delivery_method,
            shipping_address,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedOrder = {
            id: order.id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total_amount: order.total_amount,
            status: order.status,
            payment_method: order.payment_method,
            delivery_method: order.delivery_method,
            shipping_address: order.shipping_address,
            photo: order.photo,
        };
        res.json(formattedOrder);
    } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-order/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).send('Заказ не найден');
        }
        const { customer_name, customer_email, total_amount, status, payment_method, delivery_method, shipping_address } = req.body;
        let photoPath = order.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'orders', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/orders/${req.file.originalname}`;
        }
        await order.update({
            customer_name: customer_name.trim(),
            customer_email: customer_email.trim(),
            total_amount: parseFloat(total_amount),
            status: status.trim(),
            payment_method: payment_method.trim(),
            delivery_method: delivery_method ? delivery_method.trim() : null,
            shipping_address: shipping_address.trim(),
            photo: photoPath,
        });
        res.redirect('/orders/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении заказа:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-order/:id', authRequired, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        await order.destroy();
        res.json({ message: 'Заказ удален' });
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;