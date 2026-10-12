import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { ref, set, push, get, update, remove } from 'firebase/database';
import { db, realtimeDb } from '../config/firebase';
import { Student } from '../types';

const STUDENTS_COLLECTION = 'students';
const STUDENTS_RT_PATH = 'students';

export const studentService = {
  // Add new student to both Firestore and Realtime Database
  async addStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const studentWithTimestamp = {
        ...studentData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, STUDENTS_COLLECTION), {
        ...studentWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${STUDENTS_RT_PATH}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...studentWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  // Get all students from Firestore
  async getAllStudents(): Promise<Student[]> {
    try {
      // Get students without ordering to avoid index requirements
      const querySnapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
      
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        joiningDate: doc.data().joiningDate || new Date().toISOString().split('T')[0]
      })) as Student[];
      
      // Sort by createdAt in JavaScript instead of Firestore
      return students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching students:', error);
      // If there's a permission error, try to fetch from Realtime Database as fallback
      try {
        console.log('Trying Realtime Database as fallback...');
        return await this.getAllStudentsRT();
      } catch (rtError) {
        console.error('Error fetching from Realtime Database:', rtError);
        // Return empty array instead of throwing to prevent app crash
        return [];
      }
    }
  },

  // Get all students from Realtime Database
  async getAllStudentsRT(): Promise<Student[]> {
    try {
      const snapshot = await get(ref(realtimeDb, STUDENTS_RT_PATH));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.values(data) as Student[];
      }
      return [];
    } catch (error) {
      console.error('Error fetching students from RT DB:', error);
      throw error;
    }
  },

  // Get students by board
  async getStudentsByBoard(board: string): Promise<Student[]> {
    try {
      const q = query(
        collection(db, STUDENTS_COLLECTION),
        where('schoolType', '==', board),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
    } catch (error) {
      console.error('Error fetching students by board:', error);
      throw error;
    }
  },

  // Update student in both databases
  async updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
      await updateDoc(studentRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${STUDENTS_RT_PATH}/${studentId}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Delete student from both databases
  async deleteStudent(studentId: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, STUDENTS_COLLECTION, studentId));

      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${STUDENTS_RT_PATH}/${studentId}`));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};