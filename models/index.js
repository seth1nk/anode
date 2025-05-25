const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://uxlnpg4ykz3j9bcpxmiy:JvSeEcRrqQL3iYSG59FJaR0QQusd8e@bsuedgclroq7zxra2qkr-postgresql.services.clever-cloud.com:50013/bsuedgclroq7zxra2qkr', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    }
});

const User = require('./User')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const Parfume = require('./Parfume')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Order,
    Parfume
};