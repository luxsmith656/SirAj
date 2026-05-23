import React from 'react';
import StudentLayout from '../components/StudentLayout';
import { BookOpen, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentCourses() {
  const navigate = useNavigate();
  // Mock courses for demonstration as part of the redesign
  const courses = [
    { id: '1', title: 'Foundations of Education', progress: 45, type: 'Core', instructor: 'Dr. Santos' },
    { id: '2', title: 'Child & Adolescent Development', progress: 0, type: 'Core', instructor: 'Dr. Santos' },
    { id: '3', title: 'Assessment of Learning', progress: 100, type: 'Elective', instructor: 'Prof. Reyes' },
  ];

  return (
    <StudentLayout title="My Courses">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h1 className="text-2xl font-extrabold font-headline">Enrolled Curriculum</h1>
           <div className="flex items-center gap-2">
             <div className="bg-surface-container flex items-center px-3 py-2 rounded-xl">
                <Search size={16} className="text-on-surface-variant/50 mr-2" />
                <input type="text" placeholder="Search courses..." className="bg-transparent border-none outline-none text-sm w-48 text-on-surface" />
             </div>
             <button className="bg-surface-container p-2 rounded-xl text-on-surface-variant hover:text-on-surface">
                <Filter size={20} />
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
             <div key={course.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group hover:border-primary/30" onClick={() => navigate('/library')}>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                   <BookOpen size={24} />
                </div>
                <div className="mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{course.type}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-xs text-on-surface-variant mb-6">{course.instructor}</p>
                
                <div>
                   <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-on-surface">Progress</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{course.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
