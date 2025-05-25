const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Parfume } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', 'parfumes');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-parfumes', authRequired, (req, res) => {
    res.redirect('/parfumes/index.html');
});

router.get('/api/parfumes', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Parfume.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'name', 'type', 'volume_ml', 'price', 'in_stock', 'description', 'gender', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedParfumes = rows.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type,
            volume_ml: item.volume_ml,
            price: item.price,
            in_stock: item.in_stock,
            description: item.description,
            gender: item.gender,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            parfumes: formattedParfumes,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении парфюмов:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-parfume/:id', authRequired, async (req, res) => {
    try {
        const parfume = await Parfume.findByPk(req.params.id, {
            attributes: ['id', 'name', 'type', 'volume_ml', 'price', 'in_stock', 'description', 'gender', 'photo'],
        });
        if (!parfume) {
            return res.status(404).json({ error: 'Парфюм не найден' });
        }
        const formattedParfume = {
            id: parfume.id,
            name: parfume.name,
            type: parfume.type,
            volume_ml: parfume.volume_ml,
            price: parfume.price,
            in_stock: parfume.in_stock,
            description: parfume.description,
            gender: parfume.gender,
            photo: parfume.photo ? parfume.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedParfume);
    } catch (error) {
        console.error('Ошибка при получении парфюма:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/parfumes', authRequired, async (req, res) => {
    try {
        const { name, type, volume_ml, price, in_stock, description, gender, photo } = req.body;
        const parfume = await Parfume.create({
            name,
            type,
            volume_ml,
            price,
            in_stock,
            description,
            gender,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedParfume = {
            id: parfume.id,
            name: parfume.name,
            type: parfume.type,
            volume_ml: parfume.volume_ml,
            price: parfume.price,
            in_stock: parfume.in_stock,
            description: parfume.description,
            gender: parfume.gender,
            photo: parfume.photo,
        };
        res.status(201).json(formattedParfume);
    } catch (error) {
        console.error('Ошибка при создании парфюма:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-parfume', authRequired, upload.single('photo'), async (req, res) => {
    let parfume;
    try {
        const requiredFields = ['name', 'type', 'volume_ml', 'price'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { name, type, volume_ml, price, in_stock, description, gender } = req.body;
        parfume = await Parfume.create({
            name: name.trim(),
            type: type.trim(),
            volume_ml: parseInt(volume_ml),
            price: parseFloat(price),
            in_stock: in_stock === 'true' || in_stock === true,
            description: description ? description.trim() : null,
            gender: gender ? gender.trim() : null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'parfumes', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/parfumes/${req.file.originalname}`;
            await parfume.update({ photo: photoPath });
        }

        res.redirect('/parfumes/index.html');
    } catch (error) {
        console.error('Ошибка при создании парфюма:', error);
        if (parfume) await parfume.destroy();
        res.status(500).send(`Ошибка при создании парфюма: ${error.message}`);
    }
});

router.put('/api/parfumes/:id', authRequired, async (req, res) => {
    try {
        const parfume = await Parfume.findByPk(req.params.id);
        if (!parfume) {
            return res.status(404).json({ error: 'Парфюм не найден' });
        }
        const { name, type, volume_ml, price, in_stock, description, gender, photo } = req.body;
        await parfume.update({
            name,
            type,
            volume_ml,
            price,
            in_stock,
            description,
            gender,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedParfume = {
            id: parfume.id,
            name: parfume.name,
            type: parfume.type,
            volume_ml: parfume.volume_ml,
            price: parfume.price,
            in_stock: parfume.in_stock,
            description: parfume.description,
            gender: parfume.gender,
            photo: parfume.photo,
        };
        res.json(formattedParfume);
    } catch (error) {
        console.error('Ошибка при обновлении парфюма:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-parfume/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const parfume = await Parfume.findByPk(req.params.id);
        if (!parfume) {
            return res.status(404).send('Парфюм не найден');
        }
        const { name, type, volume_ml, price, in_stock, description, gender } = req.body;
        let photoPath = parfume.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'parfumes', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/parfumes/${req.file.originalname}`;
        }
        await parfume.update({
            name: name.trim(),
            type: type.trim(),
            volume_ml: parseInt(volume_ml),
            price: parseFloat(price),
            in_stock: in_stock === 'true' || in_stock === true,
            description: description ? description.trim() : null,
            gender: gender ? gender.trim() : null,
            photo: photoPath,
        });
        res.redirect('/parfumes/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении парфюма:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-parfume/:id', authRequired, async (req, res) => {
    try {
        const parfume = await Parfume.findByPk(req.params.id);
        if (!parfume) {
            return res.status(404).json({ error: 'Парфюм не найден' });
        }
        await parfume.destroy();
        res.json({ message: 'Парфюм удален' });
    } catch (error) {
        console.error('Ошибка при удалении парфюма:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;