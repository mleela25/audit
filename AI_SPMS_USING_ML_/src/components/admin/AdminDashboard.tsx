import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  return (
    <MainLayout
      isAdmin={true}
      onLogout={onLogout}
    />
  );
}