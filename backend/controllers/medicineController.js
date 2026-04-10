const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const DRUG_INTERACTIONS = {
  'aspirin': ['warfarin', 'heparin', 'ibuprofen'],
  'warfarin': ['aspirin', 'ibuprofen', 'naproxen'],
};

exports.createMedicine = async (req, res) => {
  try {
    const { name } = req.body;
    const existingMedicines = await Medicine.find({ userId: req.userId });
    
    // Simple rule-based interaction check
    const conflicts = [];
    const newDrugLower = name.toLowerCase();
    
    existingMedicines.forEach(med => {
      const existingLower = med.name.toLowerCase();
      if (DRUG_INTERACTIONS[newDrugLower]?.includes(existingLower) || 
          DRUG_INTERACTIONS[existingLower]?.includes(newDrugLower)) {
        conflicts.push(med.name);
      }
    });

    const medicine = new Medicine({ ...req.body, userId: req.userId });
    await medicine.save();
    
    res.status(201).json({
      medicine,
      interactionWarning: conflicts.length > 0 ? `Warning: ${name} may interact with ${conflicts.join(', ')}.` : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markTaken = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { takenToday: true, lastTakenDate: new Date() },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};