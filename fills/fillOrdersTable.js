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
const Order = require('../models/Order')(sequelize, DataTypes);
const sampleImages = ['t1.png', 't2.jpg', 't3.jpg', 't4.jpg', 't5.png', 't6.jpg'];

async function fillOrdersTable(count) {
    try {
        await sequelize.sync();
        const statuses = ['новый', 'в обработке', 'завершен', 'отменен'];
        const paymentMethods = ['наличные', 'карта', 'перевод', 'онлайн'];
        const deliveryMethods = ['курьер', 'почта', 'самовывоз', null];

        for (let i = 0; i < count; i++) {
            const order = await Order.create({
                customer_name: faker.person.fullName(),
                customer_email: faker.internet.email(),
                total_amount: faker.number.float({ min: 100, max: 10000, precision: 0.01 }),
                status: faker.helpers.arrayElement(statuses),
                payment_method: faker.helpers.arrayElement(paymentMethods),
                delivery_method: faker.helpers.arrayElement(deliveryMethods),
                shipping_address: faker.location.streetAddress(),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/orders', sampleImage);
            const destPath = path.join(__dirname, '../images/orders', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await order.update({ photo: `/images/orders/${sampleImage}` });
            }

            console.log(`Заказ #${i + 1} успешно создан.`);
        }
        console.log(`${count} заказов успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании заказа:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillOrdersTable(count);
