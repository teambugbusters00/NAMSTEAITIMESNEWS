import { User } from '../models/User.model.js';
import admin from '../config/firebase.js';

export const syncUserProfile = async (req, res) => {
  try {
    // Verify Firebase token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Use verified token data instead of trusting client
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = req.body.name || decodedToken.name || email.split('@')[0];
    const persona = req.body.persona || 'reader';

    let user = await User.findOne({ firebaseUid });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'User profile already exists',
        user
      });
    }

    user = new User({
      firebaseUid,
      name,
      email,
      persona: persona || 'reader',
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User profile synced to database successfully',
      user
    });

  } catch (error) {
    console.error('Error syncing user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving user profile.' 
    });
  }
};

export default { syncUserProfile };
