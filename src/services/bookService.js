const { Op } = require('sequelize');
const Book = require('../models/Book');
const Borrowing = require('../models/Borrowing');

class BookService {
  async createBook(bookData) {
    const existingBook = await Book.findOne({ where: { isbn: bookData.isbn } });
    if (existingBook) {
      throw new Error('Book with this ISBN already exists');
    }
    return await Book.create(bookData);
  }

  async updateBook(id, updateData) {
    const book = await Book.findByPk(id);
    if (!book) {
      throw new Error('Book not found');
    }
    await book.update(updateData);
    return book;
  }

  async deleteBook(id) {
    const book = await Book.findByPk(id);
    if (!book) {
      throw new Error('Book not found');
    }
    
    const activeBorrowings = await Borrowing.count({
      where: {
        bookId: id,
        status: 'active'
      }
    });
    
    if (activeBorrowings > 0) {
      throw new Error('Cannot delete book with active borrowings');
    }
    
    await book.destroy();
    return { message: 'Book deleted successfully' };
  }

  async listBooks(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const where = search ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};
    
    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return {
      books: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async searchBook(searchTerm) {
    return await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { author: { [Op.iLike]: `%${searchTerm}%` } },
          { isbn: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      limit: 50
    });
  }
}

module.exports = new BookService();