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
import { CalendarEntry, CalendarStats } from '../types/calendar';

const CALENDAR_COLLECTION = 'calendarEntries';
const CALENDAR_RT_PATH = 'calendarEntries';

export const calendarService = {
  // Add calendar entry
  async addCalendarEntry(entryData: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const entryWithTimestamp = {
        ...entryData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, CALENDAR_COLLECTION), {
        ...entryWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${CALENDAR_RT_PATH}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...entryWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding calendar entry:', error);
      throw error;
    }
  },

  // Get all calendar entries
  async getAllCalendarEntries(): Promise<CalendarEntry[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, CALENDAR_COLLECTION), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as CalendarEntry[];
    } catch (error) {
      console.error('Error fetching calendar entries:', error);
      // Fallback to Realtime Database
      try {
        const snapshot = await get(ref(realtimeDb, CALENDAR_RT_PATH));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.values(data) as CalendarEntry[];
        }
        return [];
      } catch (rtError) {
        console.error('Error fetching from RT DB:', rtError);
        return [];
      }
    }
  },

  // Get calendar entries by student
  async getStudentCalendarEntries(studentId: string): Promise<CalendarEntry[]> {
    try {
      const q = query(
        collection(db, CALENDAR_COLLECTION),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as CalendarEntry[];
      
      // Sort by date in JavaScript to avoid composite index requirement
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching student calendar entries:', error);
      return [];
    }
  },

  // Get calendar entries by date
  async getCalendarEntriesByDate(date: string): Promise<CalendarEntry[]> {
    try {
      const q = query(
        collection(db, CALENDAR_COLLECTION),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as CalendarEntry[];
    } catch (error) {
      console.error('Error fetching calendar entries by date:', error);
      return [];
    }
  },

  // Get calendar data for specific month
  async getAllCalendarData(year: number, month: number): Promise<CalendarEntry[]> {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      // Get all entries and filter by date range in JavaScript
      const allEntries = await this.getAllCalendarEntries();
      return allEntries.filter(entry => entry.date >= startDate && entry.date <= endDate);
    } catch (error) {
      console.error('Error fetching calendar data for month:', error);
      return [];
    }
  },

  // Get student calendar data for specific month
  async getStudentCalendarData(studentId: string, year: number, month: number): Promise<CalendarEntry[]> {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const studentEntries = await this.getStudentCalendarEntries(studentId);
      return studentEntries.filter(entry => entry.date >= startDate && entry.date <= endDate);
    } catch (error) {
      console.error('Error fetching student calendar data for month:', error);
      return [];
    }
  },

  // Update calendar entry
  async updateCalendarEntry(entryId: string, updates: Partial<CalendarEntry>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const entryRef = doc(db, CALENDAR_COLLECTION, entryId);
      await updateDoc(entryRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${CALENDAR_RT_PATH}/${entryId}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating calendar entry:', error);
      throw error;
    }
  },

  // Delete calendar entry
  async deleteCalendarEntry(entryId: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, CALENDAR_COLLECTION, entryId));

      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${CALENDAR_RT_PATH}/${entryId}`));
    } catch (error) {
      console.error('Error deleting calendar entry:', error);
      throw error;
    }
  },

  // Calculate calendar statistics
  async calculateCalendarStats(studentId: string, year: number, month: number): Promise<CalendarStats> {
    try {
      const entries = await this.getStudentCalendarData(studentId, year, month);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const stats: CalendarStats = {
        totalDays: daysInMonth,
        presentDays: entries.filter(e => e.attendanceStatus === 'Present').length,
        absentDays: entries.filter(e => e.attendanceStatus === 'Absent').length,
        lateDays: entries.filter(e => e.attendanceStatus === 'Late').length,
        completedHomework: entries.filter(e => e.homeworkStatus === 'completed').length,
        incompleteHomework: entries.filter(e => e.homeworkStatus === 'incomplete').length,
        diaryBrought: entries.filter(e => e.diaryStatus === 'brought').length,
        diaryNotBrought: entries.filter(e => e.diaryStatus === 'not_brought').length,
        holidays: entries.filter(e => e.isHoliday).length,
        attendancePercentage: entries.length > 0 ? Math.round((entries.filter(e => e.attendanceStatus === 'Present').length / entries.length) * 100) : 0,
        homeworkCompletionRate: entries.filter(e => e.homeworkStatus !== null).length > 0 ? 
          Math.round((entries.filter(e => e.homeworkStatus === 'completed').length / entries.filter(e => e.homeworkStatus !== null).length) * 100) : 0,
        diaryComplianceRate: entries.filter(e => e.diaryStatus !== null).length > 0 ? 
          Math.round((entries.filter(e => e.diaryStatus === 'brought').length / entries.filter(e => e.diaryStatus !== null).length) * 100) : 0
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating calendar stats:', error);
      throw error;
    }
  }
};