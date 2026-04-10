const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', medicineController.getMedicines);
router.post('/', medicineController.createMedicine);
router.put('/:id', medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);
router.post('/:id/taken', medicineController.markTaken);

module.exports = router;