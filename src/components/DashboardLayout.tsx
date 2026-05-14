import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import InstructorLayout from './InstructorLayout';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();
  
  if (user?.role === 'instructor') {
    return <InstructorLayout title={title}>{children}</InstructorLayout>;
  }
  
  // Default to Admin Layout
  return <AdminLayout title={title}>{children}</AdminLayout>;
}
