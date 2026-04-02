const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  shelfLocation: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['isbn'] }
  ]
});

module.exports = Book;