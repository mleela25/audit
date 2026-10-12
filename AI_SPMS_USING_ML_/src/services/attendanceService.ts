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
import { AttendanceRecord, MonthlyAttendanceReport } from '../types';

const ATTENDANCE_COLLECTION = 'attendance';
const ATTENDANCE_RT_PATH = 'attendance';

export const attendanceService = {
  // Add attendance record
  async addAttendance(attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const attendanceWithTimestamp = {
        ...attendanceData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
        ...attendanceWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${ATTENDANCE_RT_PATH}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...attendanceWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  // Get all attendance records
  async getAllAttendance(): Promise<AttendanceRecord[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as AttendanceRecord[];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  // Get attendance by student
  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  },

  // Get attendance by date
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      
      // Sort by timeSlot in JavaScript to avoid composite index requirement
      return records.sort((a, b) => {
        if (a.timeSlot < b.timeSlot) return -1;
        if (a.timeSlot > b.timeSlot) return 1;
        return 0;
      });
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  },

  // Update attendance record
  async updateAttendance(attendanceId: string, updates: Partial<AttendanceRecord>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const attendanceRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
      await updateDoc(attendanceRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${ATTENDANCE_RT_PATH}/${attendanceId}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  // Delete attendance record
  async deleteAttendance(attendanceId: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, ATTENDANCE_COLLECTION, attendanceId));

      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${ATTENDANCE_RT_PATH}/${attendanceId}`));
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },

  // Generate monthly attendance report
  async generateMonthlyReport(month: number, year: number): Promise<MonthlyAttendanceReport[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      const attendanceRecords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];

      // Group by student
      const studentAttendance = attendanceRecords.reduce((acc, record) => {
        if (!acc[record.studentId]) {
          acc[record.studentId] = {
            studentName: record.studentName,
            timeSlot: record.timeSlot,
            records: []
          };
        }
        acc[record.studentId].records.push(record);
        return acc;
      }, {} as any);

      // Calculate monthly reports
      const reports: MonthlyAttendanceReport[] = Object.entries(studentAttendance).map(([studentId, data]: [string, any]) => {
        const records = data.records;
        const totalDays = records.length;
        const presentDays = records.filter((r: AttendanceRecord) => r.status === 'Present').length;
        const absentDays = records.filter((r: AttendanceRecord) => r.status === 'Absent').length;
        const lateDays = records.filter((r: AttendanceRecord) => r.status === 'Late').length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        return {
          studentId,
          studentName: data.studentName,
          month: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' }),
          year,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage,
          timeSlot: data.timeSlot
        };
      });

      return reports;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }
};
// Get attendance report for a specific student
export const getAttendanceReport = async (
  studentId: string,
  month: number,
  year: number
): Promise<AttendanceRecord[]> => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(q);
    const allRecords = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by month/year in JavaScript instead of Firestore
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return allRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    return []; // Return empty array instead of throwing error
  }
};

// Export attendance report as CSV
export const exportAttendanceReport = async (
  reportData: any[],
  month: number,
  year: number,
  timeSlot: string
): Promise<void> => {
  try {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Create CSV headers
    const headers = [
      'Student Name',
      'Email',
      'Time Slot',
      'Total Days',
      'Present Days',
      'Absent Days',
      'Late Days',
      'Attendance Percentage',
      'Performance'
    ];
    
    // Create CSV rows
    const rows = reportData.map(report => [
      report.student.name,
      report.student.email,
      report.student.timeSlot,
      report.totalDays.toString(),
      report.presentDays.toString(),
      report.absentDays.toString(),
      report.lateDays.toString(),
      `${report.percentage}%`,
      report.percentage >= 90 ? 'Excellent' : report.percentage >= 75 ? 'Good' : 'Poor'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${months[month]}-${year}-${timeSlot === 'all' ? 'all-slots' : timeSlot.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting attendance report:', error);
    throw error;
  }
};
