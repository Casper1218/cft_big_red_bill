import express from 'express';
import {
  createBill,
  getBill,
  updateBill,
  deleteBill
} from '../controllers/billController';

const router = express.Router();

router.post('/', createBill);
router.get('/:id', getBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router; 