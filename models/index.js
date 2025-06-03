const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://ujjqvrrnvzdiuiuodt3z:8MLdU9s1BxciYFb0DxkbnlHmGFV7sW@bcvucojp6i3gosgzcvqr-postgresql.services.clever-cloud.com:50013/bcvucojp6i3gosgzcvqr', {
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
