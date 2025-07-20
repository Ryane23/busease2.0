import { Router } from 'express';
import db from '../models'; // Adjust the path as necessary

const router = Router();

// CRUD endpoints for Admins collection

// Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await db.Admin.findAll({ attributes: ['id', 'name', 'email'] });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Create new admin
router.post('/admins', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newAdmin = await db.Admin.create({ name, email, password });
    res.status(201).json({ id: newAdmin.id, name: newAdmin.name, email: newAdmin.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Update admin
router.put('/admins/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await db.Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    admin.name = name;
    admin.email = email;
    if (password) admin.password = password;
    await admin.save();
    res.json({ id: admin.id, name: admin.name, email: admin.email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

// Delete admin
router.delete('/admins/:id', async (req, res) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    await admin.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

export default router;