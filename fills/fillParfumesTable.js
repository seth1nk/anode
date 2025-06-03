const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');
const path = require('path');
const fs = require('fs');
const sequelize = new Sequelize('postgresql://ujjqvrrnvzdiuiuodt3z:8MLdU9s1BxciYFb0DxkbnlHmGFV7sW@bcvucojp6i3gosgzcvqr-postgresql.services.clever-cloud.com:50013/bcvucojp6i3gosgzcvqr', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
const Parfume = require('../models/Parfume')(sequelize, DataTypes);
const sampleImages = ['11.png', '22.jpg', '33.png', '44.jpg', '55.jpg'];

async function fillParfumesTable(count) {
    try {
        await sequelize.sync();
        const types = ['Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Parfum'];
        const genders = ['мужской', 'женский', 'унисекс', null];
        const volumes = [30, 50, 100, 150, 200];

        for (let i = 0; i < count; i++) {
            const parfume = await Parfume.create({
                name: faker.commerce.productName(),
                type: faker.helpers.arrayElement(types),
                volume_ml: faker.helpers.arrayElement(volumes),
                price: faker.number.float({ min: 500, max: 15000, precision: 0.01 }),
                in_stock: faker.datatype.boolean(),
                description: faker.lorem.paragraph(),
                gender: faker.helpers.arrayElement(genders),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/parfumes', sampleImage);
            const destPath = path.join(__dirname, '../images/parfumes', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await parfume.update({ photo: `/images/parfumes/${sampleImage}` });
            }

            console.log(`Парфюм #${i + 1} успешно создан.`);
        }
        console.log(`${count} парфюмов успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании парфюма:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillParfumesTable(count);
