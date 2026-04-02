const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Borrower = sequelize.define('Borrower', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  registeredDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['name'] }
  ]
});

module.exports = Borrower;