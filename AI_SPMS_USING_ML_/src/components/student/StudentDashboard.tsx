import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';

interface StudentDashboardProps {
  studentId: string;
  onLogout: () => void;
}

export default function StudentDashboard({ studentId, onLogout }: StudentDashboardProps) {
  return (
    <MainLayout
      isAdmin={false}
      studentId={studentId}
      onLogout={onLogout}
    />
  );
}