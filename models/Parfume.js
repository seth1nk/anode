module.exports = (sequelize, DataTypes) => {
    const Parfume = sequelize.define('Parfume', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID парфюма' },
        name: { type: DataTypes.STRING, allowNull: false, comment: 'Название парфюма' },
        type: { type: DataTypes.STRING, allowNull: false, comment: 'Тип (например, Eau de Parfum, Eau de Toilette)' },
        volume_ml: { type: DataTypes.INTEGER, allowNull: false, comment: 'Объем (мл)' },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: 'Цена' },
        in_stock: { type: DataTypes.BOOLEAN, defaultValue: true, comment: 'В наличии' },
        description: { type: DataTypes.TEXT, allowNull: true, comment: 'Описание парфюма' },
        gender: { type: DataTypes.STRING, allowNull: true, comment: 'Гендерная принадлежность (например, мужской, женский, унисекс)' },
        photo: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к изображению' }
    }, {
        tableName: 'parfumes',
        timestamps: false
    });
    return Parfume;
};