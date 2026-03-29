import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  persona: { 
    type: String, 
    required: true,
    default: 'reader'
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

export { userSchema };
export const User = mongoose.model('User', userSchema);
