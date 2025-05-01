import { Request, Response } from 'express';
import Bill from '../models/Bill';

export const createBill = async (req: Request, res: Response) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create bill' });
  }
};

export const getBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('payer')
      .populate('participants')
      .populate('items.assignedTo');
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Failed to get bill' });
  }
};

export const updateBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('payer')
      .populate('participants')
      .populate('items.assignedTo');

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update bill' });
  }
};

export const deleteBill = async (req: Request, res: Response) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete bill' });
  }
}; 