module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID заказа' },
        customer_name: { type: DataTypes.STRING, allowNull: false, comment: 'Имя клиента' },
        customer_email: { type: DataTypes.STRING, allowNull: false, comment: 'Email клиента' },
        total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: 'Общая сумма заказа' },
        status: { type: DataTypes.STRING, allowNull: false, comment: 'Статус заказа (например, новый, в обработке, завершен)' },
        payment_method: { type: DataTypes.STRING, allowNull: false, comment: 'Метод оплаты' },
        delivery_method: { type: DataTypes.STRING, allowNull: true, comment: 'Метод доставки' },
        shipping_address: { type: DataTypes.STRING, allowNull: false, comment: 'Адрес доставки' },
        photo: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к изображению (например, фото чека)' }
    }, {
        tableName: 'orders',
        timestamps: false
    });
    return Order;
};