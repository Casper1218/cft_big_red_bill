import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  items: [{
    name: String,
    price: Number,
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  tip: {
    type: Number,
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Bill', billSchema); 