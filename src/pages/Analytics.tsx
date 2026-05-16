import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface MetricData {
  studentCount: number;
  avgPassingScore: number;
}

interface DifficultyStat {
  name: string;
  count: number;
}

interface DomainStat {
  name: string;
  score: number;
}

interface TrendStat {
  date: string;
  score: number;
}

interface ConceptStat {
  stem: string;
  category: string;
  accuracy: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricData>({ studentCount: 0, avgPassingScore: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [instructors, setInstructors] = useState<{uid: string, fullName: string}[]>([]);
  
  // Advanced Analytics State
  const [difficultyData, setDifficultyData] = useState<DifficultyStat[]>([]);
  const [domainData, setDomainData] = useState<DomainStat[]>([]);
  const [userStatusData, setUserStatusData] = useState<UserStatusStat[]>([]);
  const [trendData, setTrendData] = useState<TrendStat[]>([]);
  const [difficultConcepts, setDifficultConcepts] = useState<ConceptStat[]>([]);

  useEffect(() => {
    // 1. Fetch Question Difficulty Breakdown
    const qUnsub = onSnapshot(collection(db, 'questions'), (snap) => {
      const stats: Record<string, number> = { Easy: 0, Average: 0, Difficult: 0 };
      snap.docs.forEach(doc => {
        const diff = doc.data().difficulty || 'Average';
        const key = diff.charAt(0).toUpperCase() + diff.slice(1);
        stats[key] = (stats[key] || 0) + 1;
      });
      setDifficultyData([
        { name: 'Easy', count: stats.Easy },
        { name: 'Average', count: stats.Average },
        { name: 'Difficult', count: stats.Difficult },
      ]);
    });

    // 2. Fetch Domain Performance (Average from Learner Profiles)
    const pUnsub = onSnapshot(collection(db, 'learnerProfiles'), (snap) => {
      const totals: Record<string, { sum: number, count: number }> = {};
      snap.docs.forEach(doc => {
        const profile = doc.data();
        if (profile.masteryByCategory) {
          Object.entries(profile.masteryByCategory).forEach(([catId, score]) => {
            if (!totals[catId]) totals[catId] = { sum: 0, count: 0 };
            totals[catId].sum += (score as number);
            totals[catId].count++;
          });
        }
      });
      // We'll map these IDs to names after fetching categories if possible, 
      // but for now use the keys.
      const domainStats = Object.entries(totals).map(([id, stat]) => ({
        name: id.length > 15 ? (id.substring(0, 10) + '...') : id,
        score: Math.round(stat.sum / stat.count)
      }));
      setDomainData(domainStats);
    });

    // 3. Fetch User Activity Status
    const uUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      let active = 0;
      let inactive = 0;
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      snap.docs.forEach(doc => {
        if (doc.data().role !== 'student') return;
        const lastSeen = doc.data().lastLogin || doc.data().updatedAt || 0;
        const lastSeenTime = typeof lastSeen === 'number' ? lastSeen : lastSeen.toMillis?.() || 0;
        if (lastSeenTime > thirtyDaysAgo) active++;
        else inactive++;
      });

      setUserStatusData([
        { name: 'Active (30d)', value: active },
        { name: 'Inactive', value: inactive }
      ]);
    });

    // 4. Fetch Trends & Difficult Concepts (from attempts)
    const attemptUnsub = onSnapshot(collection(db, 'quizAttempts'), (snap) => {
      const dailyScores: Record<string, { sum: number, count: number }> = {};
      const questionFails: Record<string, { stem: string, cat: string, fails: number, total: number }> = {};

      snap.docs.forEach(doc => {
        const attempt = doc.data();
        const date = attempt.createdAt?.toDate?.() || new Date(attempt.createdAt);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!dailyScores[dateStr]) dailyScores[dateStr] = { sum: 0, count: 0 };
        dailyScores[dateStr].sum += attempt.scorePercent;
        dailyScores[dateStr].count++;

        // Track difficult questions if item-level data exists
        if (attempt.results) {
           attempt.results.forEach((res: any) => {
              if (!questionFails[res.questionId]) {
                questionFails[res.questionId] = { stem: res.stem || 'Question', cat: res.category || 'LET', fails: 0, total: 0 };
              }
              questionFails[res.questionId].total++;
              if (!res.isCorrect) questionFails[res.questionId].fails++;
           });
        }
      });

      const trends = Object.entries(dailyScores)
        .map(([date, stat]) => ({ date, score: Math.round(stat.sum / stat.count) }))
        .sort((a,b) => a.date.localeCompare(b.date))
        .slice(-7);
      setTrendData(trends);

      const concepts = Object.values(questionFails)
        .map(q => ({ stem: q.stem, category: q.cat, accuracy: Math.round(((q.total - q.fails) / q.total) * 100) }))
        .filter(q => q.accuracy < 50)
        .sort((a,b) => a.accuracy - b.accuracy)
        .slice(0, 5);
      setDifficultConcepts(concepts);

      // Average score metric
      if (snap.size > 0) {
        const totalScore = snap.docs.reduce((acc, d) => acc + (d.data().scorePercent || 0), 0);
        setMetrics(prev => ({ ...prev, avgPassingScore: Math.round(totalScore / snap.size) }));
      }
    });

    // Existing logic for instructors 

    // Existing logic for instructors and student counts
    if (user?.role === 'admin') {
      const q = query(collection(db, 'users'), where('role', '==', 'instructor'));
      onSnapshot(q, (snap) => {
        setInstructors(snap.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName || doc.data().email })));
      });
    }

    // Dynamic filtering for metrics
    let q;
    if (user?.role === 'instructor') {
      q = query(collection(db, 'users'), where('instructorId', '==', user.uid), where('role', '==', 'student'));
    } else if (user?.role === 'admin' && instructorFilter !== 'all') {
      q = query(collection(db, 'users'), where('instructorId', '==', instructorFilter), where('role', '==', 'student'));
    } else {
      q = query(collection(db, 'users'), where('role', '==', 'student'));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      setMetrics(prev => ({
        ...prev,
        studentCount: snap.size
      }));
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      qUnsub();
      pUnsub();
      uUnsub();
    };
  }, [user, instructorFilter]);

  const COLORS = ['#1b366a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const STATUS_COLORS = ['#10b981', '#cbd5e1'];

  return (
    <AdminLayout title="Performance Metrics">
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 text-on-surface">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
               <div>
                  <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-2">Performance Insights</h1>
                  <p className="text-on-surface-variant/60 font-medium font-body">Analyze {user?.role === 'instructor' ? 'your assigned students\'' : 'platform-wide'} cohort mastery.</p>
               </div>
               
               {user?.role === 'admin' && (
                 <div className="flex bg-surface-container/50 rounded-xl p-1 border border-outline-variant shadow-sm overflow-hidden">
                    <select 
                      value={instructorFilter}
                      onChange={(e) => setInstructorFilter(e.target.value)}
                      className="bg-transparent border-none outline-none px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary focus:ring-0"
                    >
                      <option value="all" className="bg-surface-container text-on-surface">Global View</option>
                      {instructors.map(inst => (
                        <option key={inst.uid} value={inst.uid} className="bg-surface-container text-on-surface">By: {inst.fullName}</option>
                      ))}
                    </select>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">groups</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">{metrics.studentCount}</h3>
                     <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest">Active Students</p>
                  </div>
               </div>
               
               <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">timer</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">42<span className="text-xl">m</span></h3>
                     <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest">Daily Avg Simulation</p>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">{metrics.avgPassingScore}<span className="text-xl">%</span></h3>
                     <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest">Avg Passing Score</p>
                  </div>
                  <div className="w-full bg-surface-container mt-4 h-1.5 rounded-full overflow-hidden">
                     <div style={{ width: `${metrics.avgPassingScore}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                     </div>
                  </div>
                  <div>
                     <h3 className="text-3xl font-extrabold font-headline text-on-surface mb-1">High</h3>
                     <p className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest">Mastery Level</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-on-surface">Subject Mastery Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={domainData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar
                          name="Avg Score"
                          dataKey="score"
                          stroke="#1b366a"
                          fill="#1b366a"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-on-surface">User Activity Breakdown</h3>
                  <div className="h-[300px] w-full flex flex-col items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {userStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
               <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-on-surface">Question Difficulty Distribution</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }} 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {difficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant">
                  <h3 className="text-xl font-extrabold font-headline mb-6 text-on-surface">Difficult Concepts</h3>
                  <div className="space-y-4">
                     {difficultConcepts.length > 0 ? difficultConcepts.map((concept, i) => (
                       <div key={i} className="flex gap-4 p-4 rounded-xl border border-outline-variant/30 bg-surface-container/30 hover:border-primary/50 transition-all cursor-pointer group">
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border ${concept.accuracy < 30 ? 'bg-error/10 text-error border-error/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                             <span className="text-[9px] uppercase font-bold">Accuracy</span>
                             <span className="text-sm font-black">{concept.accuracy}%</span>
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-xs font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2" title={concept.stem}>{concept.stem}</p>
                             <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">{concept.category}</span>
                          </div>
                       </div>
                     )) : (
                       <div className="text-center py-10">
                          <p className="text-sm text-on-surface-variant/40 font-mediumitalic">Aggregate more data to find difficult concepts.</p>
                       </div>
                     )}
                  </div>
                  <button className="w-full mt-6 py-4 rounded-xl bg-surface-container text-on-surface-variant/40 font-bold text-[11px] uppercase tracking-widest hover:bg-surface-container-high hover:text-on-surface transition-all">
                     View Deep Analysis
                  </button>
               </div>
            </div>
         </div>
    </AdminLayout>
  );
}
