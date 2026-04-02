const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Book = require('./Book');
const Borrower = require('./Borrower');

const Borrowing = sequelize.define('Borrowing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  checkoutDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'returned', 'overdue'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['dueDate'] },
    { fields: ['bookId'] },
    { fields: ['borrowerId'] }
  ]
});

// Associations
Borrowing.belongsTo(Book, { foreignKey: 'bookId', onDelete: 'RESTRICT' });
Borrowing.belongsTo(Borrower, { foreignKey: 'borrowerId', onDelete: 'RESTRICT' });
Book.hasMany(Borrowing);
Borrower.hasMany(Borrowing);

module.exports = Borrowing;