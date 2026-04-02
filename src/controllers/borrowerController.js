const borrowerService = require('../services/borrowerService');

class BorrowerController {
  async registerBorrower(req, res, next) {
    try {
      const borrower = await borrowerService.registerBorrower(req.body);
      res.status(201).json({
        success: true,
        data: borrower,
        message: 'Borrower registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateBorrower(req, res, next) {
    try {
      const borrower = await borrowerService.updateBorrower(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: borrower,
        message: 'Borrower updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteBorrower(req, res, next) {
    try {
      const result = await borrowerService.deleteBorrower(req.params.id);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
  
  async listBorrowers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await borrowerService.listBorrowers(parseInt(page), parseInt(limit), search);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BorrowerController();