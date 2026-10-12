export interface CalendarEntry {
  id?: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD format
  attendanceStatus: 'Present' | 'Absent' | 'Late';
  homeworkStatus: 'completed' | 'incomplete' | null;
  diaryStatus: 'brought' | 'not_brought' | null;
  isHoliday: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  completedHomework: number;
  incompleteHomework: number;
  diaryBrought: number;
  diaryNotBrought: number;
  holidays: number;
  attendancePercentage: number;
  homeworkCompletionRate: number;
  diaryComplianceRate: number;
}