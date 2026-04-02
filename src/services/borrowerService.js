const { Op } = require('sequelize');
const Borrower = require('../models/Borrower');
const Borrowing = require('../models/Borrowing');

class BorrowerService {
  async registerBorrower(borrowerData) {
    const existingBorrower = await Borrower.findOne({ 
      where: { email: borrowerData.email } 
    });
    if (existingBorrower) {
      throw new Error('Borrower with this email already exists');
    }
    return await Borrower.create(borrowerData);
  }

  async updateBorrower(id, updateData) {
    const borrower = await Borrower.findByPk(id);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    if (updateData.email && updateData.email !== borrower.email) {
      const existingBorrower = await Borrower.findOne({
        where: { email: updateData.email }
      });
      if (existingBorrower) {
        throw new Error('Email already in use');
      }
    }
    
    await borrower.update(updateData);
    return borrower;
  }

  async deleteBorrower(id) {
    const borrower = await Borrower.findByPk(id);
    if (!borrower) {
      throw new Error('Borrower not found');
    }
    
    const activeBorrowings = await Borrowing.count({
      where: {
        borrowerId: id,
        status: 'active'
      }
    });
    
    if (activeBorrowings > 0) {
      throw new Error('Cannot delete borrower with active borrowings');
    }
    
    await borrower.destroy();
    return { message: 'Borrower deleted successfully' };
  }

  async listBorrowers(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const where = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};
    
    const { count, rows } = await Borrower.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return {
      borrowers: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = new BorrowerService();