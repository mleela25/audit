import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  User,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
  createdAt: string;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'student';
  createdAt: string;
  emailVerified: boolean;
  studentId?: string;
}
// Helper function to get user-friendly error messages
const getAuthErrorMessage = (error: any): string => {
  const errorCode = error && typeof error === 'object' ? error.code : null;
  switch (errorCode) {
    case 'auth/operation-not-allowed':
      return 'Email/password authentication is not enabled. Please contact the administrator to enable this authentication method in Firebase Console.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please use the Login tab to sign in with your existing credentials, or use a different email address to register a new account.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const authService = {
  // Register new admin
  async registerAdmin(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Save admin data to Firestore using the user's UID as document ID
      const adminData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'admin',
        createdAt: new Date().toISOString(),
        emailVerified: false
      };

      // Save to users collection with proper security rules
      await setDoc(doc(db, 'users', user.uid), adminData);
    } catch (error) {
      console.error('Error registering admin:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Login admin
  async loginAdmin(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Note: Email verification check removed for development
      // Uncomment the following lines for production:
      // if (!user.emailVerified) {
      //   throw new Error('Please verify your email before logging in. Check your inbox for verification link.');
      // }

      // Check if user exists and has admin role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create missing user profile for existing account
        const adminData: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          emailVerified: user.emailVerified
        };
        
        await setDoc(doc(db, 'users', user.uid), adminData);
        return user;
      }

      const userData = userDoc.data() as UserProfile;
      if (userData.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Create student user profile
  async createStudentProfile(studentId: string, email: string, displayName: string): Promise<void> {
    try {
      // Create a temporary password for the student
      const tempPassword = `student${studentId}123`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName });

      // Save student data to Firestore
      const studentData: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'student',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        studentId
      };

      await setDoc(doc(db, 'users', user.uid), studentData);
      
      // Sign out the newly created user so admin can continue
      await signOut(auth);
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Login student
  async loginStudent(email: string, password: string): Promise<{ user: User; studentId: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user exists and has student role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact administrator.');
      }

      const userData = userDoc.data() as UserProfile;
      if (userData.role !== 'student') {
        throw new Error('Access denied. Student account required.');
      }

      if (!userData.studentId) {
        throw new Error('Student ID not found. Please contact administrator.');
      }

      return { user, studentId: userData.studentId };
    } catch (error) {
      console.error('Error logging in student:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    } else {
      throw new Error('No user found or email already verified');
    }
  }
};