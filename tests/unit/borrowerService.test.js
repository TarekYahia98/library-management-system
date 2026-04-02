const borrowerService = require('../../src/services/borrowerService');
const Borrower = require('../../src/models/Borrower');
const Borrowing = require('../../src/models/Borrowing');

jest.mock('../../src/models/Borrower');
jest.mock('../../src/models/Borrowing');

describe('BorrowerService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerBorrower', () => {
    it('should register a new borrower successfully', async () => {
      const borrowerData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const expectedBorrower = { id: '123-uuid', ...borrowerData, registeredDate: new Date() };

      Borrower.findOne.mockResolvedValue(null);
      Borrower.create.mockResolvedValue(expectedBorrower);

      const result = await borrowerService.registerBorrower(borrowerData);

      expect(result).toEqual(expectedBorrower);
      expect(Borrower.findOne).toHaveBeenCalledWith({ where: { email: borrowerData.email } });
      expect(Borrower.create).toHaveBeenCalledWith(borrowerData);
    });

    it('should throw error if email already exists', async () => {
      const borrowerData = {
        name: 'John Doe',
        email: 'existing@example.com'
      };

      Borrower.findOne.mockResolvedValue({ id: 'existing', email: 'existing@example.com' });

      await expect(borrowerService.registerBorrower(borrowerData))
        .rejects
        .toThrow('Borrower with this email already exists');
    });

    it('should throw error if email format is invalid', async () => {
      const invalidBorrowerData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      Borrower.create.mockRejectedValue(new Error('Validation error'));

      await expect(borrowerService.registerBorrower(invalidBorrowerData))
        .rejects
        .toThrow();
    });
  });

  describe('updateBorrower', () => {
    it('should update borrower successfully', async () => {
      const borrowerId = '123-uuid';
      const updateData = { name: 'Jane Doe', email: 'jane@example.com' };
      const existingBorrower = {
        id: borrowerId,
        name: 'John Doe',
        email: 'john@example.com',
        update: jest.fn().mockResolvedValue({ ...updateData, id: borrowerId })
      };

      Borrower.findByPk.mockResolvedValue(existingBorrower);
      Borrower.findOne.mockResolvedValue(null); // No existing email conflict

      const result = await borrowerService.updateBorrower(borrowerId, updateData);

      expect(existingBorrower.update).toHaveBeenCalledWith(updateData);
      expect(result).toBeDefined();
    });

    it('should throw error if email already in use by another borrower', async () => {
      const borrowerId = '123-uuid';
      const updateData = { email: 'taken@example.com' };
      const existingBorrower = {
        id: borrowerId,
        email: 'old@example.com',
        update: jest.fn()
      };

      Borrower.findByPk.mockResolvedValue(existingBorrower);
      Borrower.findOne.mockResolvedValue({ id: 'different-id', email: 'taken@example.com' });

      await expect(borrowerService.updateBorrower(borrowerId, updateData))
        .rejects
        .toThrow('Email already in use');
    });

    it('should throw error if borrower not found', async () => {
      const borrowerId = 'non-existent-id';
      const updateData = { name: 'Updated Name' };

      Borrower.findByPk.mockResolvedValue(null);

      await expect(borrowerService.updateBorrower(borrowerId, updateData))
        .rejects
        .toThrow('Borrower not found');
    });
  });

  describe('deleteBorrower', () => {
    it('should delete borrower successfully when no active borrowings', async () => {
      const borrowerId = '123-uuid';
      const mockBorrower = {
        id: borrowerId,
        destroy: jest.fn().mockResolvedValue(true)
      };

      Borrower.findByPk.mockResolvedValue(mockBorrower);
      Borrowing.count.mockResolvedValue(0);

      const result = await borrowerService.deleteBorrower(borrowerId);

      expect(result.message).toBe('Borrower deleted successfully');
      expect(mockBorrower.destroy).toHaveBeenCalled();
    });

    it('should throw error if borrower has active borrowings', async () => {
      const borrowerId = '123-uuid';
      const mockBorrower = {
        id: borrowerId,
        destroy: jest.fn()
      };

      Borrower.findByPk.mockResolvedValue(mockBorrower);
      Borrowing.count.mockResolvedValue(3);

      await expect(borrowerService.deleteBorrower(borrowerId))
        .rejects
        .toThrow('Cannot delete borrower with active borrowings');
      expect(mockBorrower.destroy).not.toHaveBeenCalled();
    });
  });

  describe('listBorrowers', () => {
    it('should return paginated borrowers', async () => {
      const mockBorrowers = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
      ];

      Borrower.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBorrowers
      });

      const result = await borrowerService.listBorrowers(1, 10);

      expect(result.borrowers).toEqual(mockBorrowers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });
});