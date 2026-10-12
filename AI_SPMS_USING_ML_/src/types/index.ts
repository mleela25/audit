export interface Student {
  id: string;
  name: string;
  school: string;
  class: string;
  grade: string;
  batch: string;
  parentName: string;
  parentPhone: string;
  email?: string;
  address: string;
  joiningDate: string;
  profilePicture?: string;
  subjects: string[];
  createdAt: string;
  updatedAt: string;
  schoolType: 'CBSE' | 'ICSE' | 'IGCSE' | 'GSEB' | 'IB' | 'Cambridge' | 'State Board';
  examPattern: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Continuous';
}

export interface ClassworkEntry {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  chapter: string;
  topic: string;
  completed: boolean;
  notes?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number; // in minutes
  createdAt: string;
}

export interface UpcomingExam {
  id: string;
  studentId: string;
  subject: string;
  examType: 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
  chapters: string[];
  scheduledDate: string;
  syllabus: string;
  preparationStatus: 'Not Started' | 'In Progress' | 'Completed';
  estimatedPrepTime: number; // in days
  createdAt: string;
}

export interface ExamResult {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ChapterProgress {
  id: string;
  studentId: string;
  subject: string;
  chapter: string;
  startDate: string;
  completedDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  difficulty: number; // 1-5 scale
  timeSpent: number; // in hours
  topics: string[];
  completedTopics: string[];
}

export interface SchoolPattern {
  schoolName: string;
  board: string;
  examFrequency: string;
  chapterPacing: number; // chapters per month
  examStyle: string;
  subjects: string[];
}

export interface PredictionData {
  studentId: string;
  subject: string;
  currentChapter: string;
  nextChapters: string[];
  estimatedCompletionDates: { chapter: string; date: string }[];
  examPredictions: {
    examType: string;
    predictedDate: string;
    chaptersIncluded: string[];
    preparationTime: number;
  }[];
}

export interface AnalyticsData {
  studentId: string;
  monthlyProgress: {
    month: string;
    subjects: {
      [subject: string]: {
        chaptersCompleted: string[];
        totalChapters: number;
        progressPercentage: number;
      };
    };
  }[];
}

export type UserRole = 'admin' | 'student';
export type FilterType = 'all' | 'name' | 'school' | 'batch' | 'subject' | 'board' | 'date';
export type ViewMode = 'grid' | 'list';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  timeSlot: string;
  status: 'Present' | 'Absent' | 'Late';
  checkInTime?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyAttendanceReport {
  studentId: string;
  studentName: string;
  month: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  timeSlot: string;
}

export interface DailyProgress {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  homeworkStatus: 'completed' | 'incomplete' | null;
  diaryStatus: 'brought' | 'not_brought' | null;
  isHoliday: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionSession {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subject: string;
  topic: string;
  chapter: string;
  status: 'completed' | 'in_progress' | 'not_started';
  notes: string;
  timeSpent: number;
  flaggedAsPending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PendingWork {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'completed';
  reminderCount: number;
  lastReminderDate?: string;
  createdAt: string;
  updatedAt: string;
}