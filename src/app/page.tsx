'use client';

import React, { useState, useEffect } from 'react';
import { useSchoolStore } from '@/store/useSchoolStore';
import LayoutWrapper from '@/components/LayoutWrapper';
import PrincipalDashboard from '@/components/PrincipalDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';
import ParentDashboard from '@/components/ParentDashboard';
import StudentDashboard from '@/components/StudentDashboard';

export default function Home() {
  const { activeRole } = useSchoolStore();
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Synchronize default tab when active role changes externally or on init
  useEffect(() => {
    const nextTab = activeRole === 'Admin' ? 'Students' : 'Dashboard';
    const timer = setTimeout(() => {
      setActiveTab(nextTab);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeRole, setActiveTab]);

  // Render dashboard based on active role preview
  const renderDashboard = () => {
    switch (activeRole) {
      case 'Principal':
        return <PrincipalDashboard />;
      case 'Admin':
        return <AdminDashboard activeTab={activeTab} />;
      case 'Teacher':
        return <TeacherDashboard activeTab={activeTab} />;
      case 'Parent':
        return <ParentDashboard activeTab={activeTab} />;
      case 'Student':
        return <StudentDashboard activeTab={activeTab} />;
      default:
        return <PrincipalDashboard />;
    }
  };

  return (
    <LayoutWrapper activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="w-full">
        {renderDashboard()}
      </div>
    </LayoutWrapper>
  );
}
