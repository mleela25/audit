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

export interface ExamResult {
  id?: string;
  studentId: string;
  studentName: string;
  subject: string;
  examType: 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Unit Test' | 'Pre-Board' | 'Board Exam';
  chapter: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  percentage: number;
  date: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

const EXAMS_COLLECTION = 'examResults';
const EXAMS_RT_PATH = 'examResults';

export const examService = {
  // Add exam result to both databases
  async addExamResult(examData: Omit<ExamResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const examWithTimestamp = {
        ...examData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, EXAMS_COLLECTION), {
        ...examWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${EXAMS_RT_PATH}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...examWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding exam result:', error);
      throw error;
    }
  },

  // Get all exam results from Firestore
  async getAllExamResults(): Promise<ExamResult[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, EXAMS_COLLECTION), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as ExamResult[];
    } catch (error) {
      console.error('Error fetching exam results:', error);
      throw error;
    }
  },

  // Get exam results by student
  async getExamResultsByStudent(studentId: string): Promise<ExamResult[]> {
    try {
      const q = query(
        collection(db, EXAMS_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamResult[];
    } catch (error) {
      console.error('Error fetching student exam results:', error);
      throw error;
    }
  },

  // Update exam result in both databases
  async updateExamResult(examId: string, updates: Partial<ExamResult>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const examRef = doc(db, EXAMS_COLLECTION, examId);
      await updateDoc(examRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${EXAMS_RT_PATH}/${examId}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating exam result:', error);
      throw error;
    }
  },

  // Delete exam result from both databases
  async deleteExamResult(examId: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, EXAMS_COLLECTION, examId));

      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${EXAMS_RT_PATH}/${examId}`));
    } catch (error) {
      console.error('Error deleting exam result:', error);
      throw error;
    }
  }
};