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
import { 
  TuitionWorkEntry,
  SchoolClassworkHomework,
  TuitionPendingWork,
  TestTrackerEntry,
  PaperCheckEntry,
  DoubtBoxEntry,
  CambridgePaperEntry,
  WorkPoolEntry
} from '../types/modules';

// Generic service factory for all modules
const createModuleService = <T extends { id?: string; createdAt?: string; updatedAt?: string }>(
  collectionName: string,
  rtPath: string
) => ({
  async add(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, collectionName), {
        ...dataWithTimestamp,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Add to Realtime Database
      const rtRef = ref(realtimeDb, `${rtPath}/${docRef.id}`);
      await set(rtRef, {
        id: docRef.id,
        ...dataWithTimestamp
      });

      return docRef.id;
    } catch (error) {
      console.error(`Error adding ${collectionName}:`, error);
      throw error;
    }
  },

  async getAll(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as T[];
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      // Fallback to Realtime Database
      try {
        const snapshot = await get(ref(realtimeDb, rtPath));
        if (snapshot.exists()) {
          const data = snapshot.val();
          return Object.values(data) as T[];
        }
        return [];
      } catch (rtError) {
        console.error(`Error fetching from RT DB:`, rtError);
        return [];
      }
    }
  },

  async getByStudent(studentId: string): Promise<T[]> {
    try {
      const q = query(
        collection(db, collectionName),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as T[];
    } catch (error) {
      console.error(`Error fetching ${collectionName} by student:`, error);
      return [];
    }
  },

  async update(id: string, updates: Partial<T>): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: timestamp
      };

      // Update in Firestore
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updatesWithTimestamp,
        updatedAt: Timestamp.now()
      });

      // Update in Realtime Database
      const rtRef = ref(realtimeDb, `${rtPath}/${id}`);
      await update(rtRef, updatesWithTimestamp);
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, collectionName, id));
      
      // Delete from Realtime Database
      await remove(ref(realtimeDb, `${rtPath}/${id}`));
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      throw error;
    }
  }
});

// Create services for all 8 modules
export const tuitionWorkService = createModuleService<TuitionWorkEntry>('tuitionWork', 'tuitionWork');
export const testTrackerService = createModuleService<TestTrackerEntry>('testTracker', 'testTracker');
export const paperCheckService = createModuleService<PaperCheckEntry>('paperCheck', 'paperCheck');
export const doubtBoxService = createModuleService<DoubtBoxEntry>('doubtBox', 'doubtBox');
export const cambridgePaperService = createModuleService<CambridgePaperEntry>('cambridgePaper', 'cambridgePaper');
export const workPoolService = createModuleService<WorkPoolEntry>('workPool', 'workPool');
export const schoolClassworkService = createModuleService<SchoolClassworkHomework>('schoolClasswork', 'schoolClasswork');

// Utility functions
export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B+';
  if (percentage >= 50) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'O': return 'bg-purple-100 text-purple-800';
    case 'A+': return 'bg-green-100 text-green-800';
    case 'A': return 'bg-blue-100 text-blue-800';
    case 'B+': return 'bg-yellow-100 text-yellow-800';
    case 'B': return 'bg-orange-100 text-orange-800';
    case 'C': return 'bg-red-100 text-red-800';
    case 'F': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
    case 'Done':
    case 'Cleared':
    case 'Checked':
    case 'Feedback Given': return 'bg-green-100 text-green-800';
    case 'In Progress':
    case 'Partially Done':
    case 'Ongoing':
    case 'Attempted': return 'bg-blue-100 text-blue-800';
    case 'Not Started':
    case 'Not Done':
    case 'Still Pending':
    case 'Pending':
    case 'Not Checked':
    case 'Assigned': return 'bg-yellow-100 text-yellow-800';
    case 'Recheck Required': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getDoubtTypeColor = (type: string): string => {
  switch (type) {
    case 'Conceptual': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Careless': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Memory': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Application': return 'bg-green-100 text-green-800 border-green-200';
    case 'Confusion': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};