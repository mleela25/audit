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
import { DailyProgress } from '../types';

const DAILY_PROGRESS_COLLECTION = 'dailyProgress';
const DAILY_PROGRESS_RT_PATH = 'dailyProgress';

export const dailyProgressService = {
  // Add daily progress record
  async addDailyProgress(progressData: Omit<DailyProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const progressWithTimestamp = {
        ...progressData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, DAILY_PROGRESS_COLLECTION), {
        ...progressWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${DAILY_PROGRESS_RT_PATH}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...progressWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding daily progress:', error);
      throw error;
    }
  },

  // Get all daily progress records
  async getAllDailyProgress(): Promise<DailyProgress[]> {
    try {
      const querySnapshot = await getDocs(collection(db, DAILY_PROGRESS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as DailyProgress[];
    } catch (error) {
      console.error('Error fetching daily progress:', error);
      // Fallback to Realtime Database
      try {
        const snapshot = await get(ref(realtimeDb, DAILY_PROGRESS_RT_PATH));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.values(data) as DailyProgress[];
        }
        return [];
      } catch (rtError) {
        console.error('Error fetching from RT DB:', rtError);
        return [];
      }
    }
  },

  // Get daily progress by student
  async getDailyProgressByStudent(studentId: string): Promise<DailyProgress[]> {
    try {
      const q = query(
        collection(db, DAILY_PROGRESS_COLLECTION),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DailyProgress[];
    } catch (error) {
      console.error('Error fetching student daily progress:', error);
      return [];
    }
  },

  // Get daily progress by date
  async getDailyProgressByDate(date: string): Promise<DailyProgress[]> {
    try {
      const q = query(
        collection(db, DAILY_PROGRESS_COLLECTION),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DailyProgress[];
    } catch (error) {
      console.error('Error fetching daily progress by date:', error);
      return [];
    }
  },

  // Update daily progress
  async updateDailyProgress(progressId: string, updates: Partial<DailyProgress>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const progressRef = doc(db, DAILY_PROGRESS_COLLECTION, progressId);
      await updateDoc(progressRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${DAILY_PROGRESS_RT_PATH}/${progressId}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating daily progress:', error);
      throw error;
    }
  },

  // Delete daily progress
  async deleteDailyProgress(progressId: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, DAILY_PROGRESS_COLLECTION, progressId));

      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${DAILY_PROGRESS_RT_PATH}/${progressId}`));
    } catch (error) {
      console.error('Error deleting daily progress:', error);
      throw error;
    }
  },

  // Bulk update daily progress for multiple students
  async bulkUpdateDailyProgress(date: string, progressUpdates: Array<{
    studentId: string;
    studentName: string;
    homeworkStatus: 'completed' | 'incomplete' | null;
    diaryStatus: 'brought' | 'not_brought' | null;
    isHoliday: boolean;
  }>): Promise<void> {
    try {
      // First, get existing records for this date
      const existingRecords = await this.getDailyProgressByDate(date);
      
      for (const update of progressUpdates) {
        const existingRecord = existingRecords.find(r => r.studentId === update.studentId);
        
        if (existingRecord) {
          // Update existing record
          await this.updateDailyProgress(existingRecord.id, {
            homeworkStatus: update.homeworkStatus,
            diaryStatus: update.diaryStatus,
            isHoliday: update.isHoliday
          });
        } else {
          // Create new record
          await this.addDailyProgress({
            studentId: update.studentId,
            studentName: update.studentName,
            date,
            homeworkStatus: update.homeworkStatus,
            diaryStatus: update.diaryStatus,
            isHoliday: update.isHoliday
          });
        }
      }
    } catch (error) {
      console.error('Error bulk updating daily progress:', error);
      throw error;
    }
  }
};