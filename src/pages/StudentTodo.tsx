import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, ClipboardList, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { buildStudyPlan, getRecallInsights, StudyPlanItem } from '../lib/learningInsights';

type CalendarMarker = {
  id: string;
  dateKey: string;
  label: string;
  type: 'todo' | 'reminder' | 'study' | 'cooldown';
  targetLink?: string;
};

export default function StudentTodo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [progressByModule, setProgressByModule] = useState<Record<string, any>>({});
  const [profile, setProfile] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [reviewSettings, setReviewSettings] = useState<any>(null);
  const [reminderDraft, setReminderDraft] = useState({ title: '', remindAt: todayInputValue() });
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Tracks the currently selected calendar day (initialized to today's date key)
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => {
    const date = new Date();
    return date.toISOString().slice(0, 10);
  });

  useEffect(() => {
    const moduleQuery = query(collection(db, 'modules'), where('isPublished', '==', true));
    const unsubModules = onSnapshot(moduleQuery, (snapshot) => {
      setModules(snapshot.docs.map((moduleDoc) => ({ id: moduleDoc.id, ...moduleDoc.data() })));
    });
    return () => unsubModules();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProfile = onSnapshot(doc(db, 'learnerProfiles', user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() : null);
    });
    const unsubReviewSettings = onSnapshot(doc(db, 'studentReviewSettings', user.uid), (snapshot) => {
      setReviewSettings(snapshot.exists() ? snapshot.data() : null);
    });
    const progressQuery = query(collection(db, 'moduleProgress'), where('userId', '==', user.uid));
    const unsubProgress = onSnapshot(progressQuery, (snapshot) => {
      const rows: Record<string, any> = {};
      snapshot.docs.forEach((progressDoc) => {
        const data = progressDoc.data();
        rows[data.moduleId] = data;
      });
      setProgressByModule(rows);
    });
    const reminderQuery = query(collection(db, 'studyReminders'), where('userId', '==', user.uid));
    const unsubReminders = onSnapshot(reminderQuery, (snapshot) => {
      setReminders(snapshot.docs.map((reminderDoc) => ({ id: reminderDoc.id, ...reminderDoc.data() })));
    });
    let unsubClass = () => {};
    if (user.activeClassId) {
      unsubClass = onSnapshot(doc(db, 'classes', user.activeClassId), (snapshot) => setClassData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null));
    } else {
      setClassData(null);
    }

    return () => {
      unsubProfile();
      unsubReviewSettings();
      unsubProgress();
      unsubReminders();
      unsubClass();
    };
  }, [user]);

  const todoItems = useMemo(() => modules
    .filter((module) => {
      if ((user as any)?.archivedModuleIds?.includes(module.id)) return false;
      const progress = progressByModule[module.id];
      const assignedModuleIds = new Set(classData?.assignedModuleIds || []);
      if (module.publishScope === 'classes') return user?.activeClassId && (module.classIds?.includes(user.activeClassId) || assignedModuleIds.has(module.id));
      return !!progress;
    })
    .filter((module) => progressByModule[module.id]?.status !== 'completed')
    .sort((a, b) => new Date(a.dueAt || '2999-12-31').getTime() - new Date(b.dueAt || '2999-12-31').getTime()), [modules, progressByModule, user, classData]);

  const weakTopicLabel = profile?.weakTopics?.[0]
    || Object.entries(profile?.masteryByTopic || {}).sort((a: any, b: any) => a[1] - b[1])[0]?.[0]
    || '';
  const studyPlan = buildStudyPlan({
    modules: todoItems.map((module) => ({ ...module, progress: progressByModule[module.id]?.progressPercent || 0 })),
    recallInsights: getRecallInsights(profile),
    weakTopicLabel,
    progressByModule,
  });
  const dueDateItems = useMemo(() => todoItems
    .map((module) => ({
      id: `module-${module.id}`,
      type: 'Module',
      title: module.title,
      dueAt: module.dueAt || '',
      targetLink: `/quest?moduleId=${module.id}`,
    }))
    .filter((item) => item.dueAt)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 6), [todoItems]);
  const mockCooldown = useMemo(() => {
    const lockedUntilMillis = Number(reviewSettings?.mockExamCooldownUntilMillis || 0);
    if (!lockedUntilMillis || lockedUntilMillis <= Date.now()) return null;
    return {
      lockedUntilMillis,
      message: reviewSettings?.mockExamCooldownMessage || 'Full mock access is paused. Review first, then try again.',
    };
  }, [reviewSettings]);

  const calendarDays = useMemo(() => {
    const markers: CalendarMarker[] = [
      ...todoItems
        .filter((module) => module.dueAt)
        .map((module) => ({
          id: `module-${module.id}`,
          dateKey: toDateKey(module.dueAt),
          label: module.title,
          type: 'todo' as const,
          targetLink: `/quest?moduleId=${module.id}`,
        })),
      ...reminders.map((reminder) => ({
        id: `reminder-${reminder.id}`,
        dateKey: toDateKey(reminder.remindAt),
        label: reminder.title,
        type: 'reminder' as const,
      })),
      ...studyPlan.map((item, index) => ({
        id: `study-${index}`,
        dateKey: planItemDateKey(item, index),
        label: item.title,
        type: 'study' as const,
        targetLink: item.targetLink,
      })),
      ...(mockCooldown ? [{
        id: 'mock-cooldown',
        dateKey: toDateKey(mockCooldown.lockedUntilMillis),
        label: 'Full mock unlocks',
        type: 'cooldown' as const,
        targetLink: '/mistake-bank',
      }] : []),
    ];

    return Array.from({ length: 14 }).map((_item, offset) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      const key = toDateKey(date);
      return {
        key,
        date,
        markers: markers.filter((marker) => marker.dateKey === key),
      };
    });
  }, [todoItems, reminders, studyPlan, mockCooldown]);

  const selectedDay = useMemo(() => {
    return calendarDays.find(d => d.key === selectedDayKey) || null;
  }, [calendarDays, selectedDayKey]);

  const addReminder = async () => {
    if (!user || !reminderDraft.title.trim()) {
      setToastMsg('Add a reminder title before saving.');
      setShowToast(true);
      return;
    }
    try {
      await addDoc(collection(db, 'studyReminders'), {
        userId: user.uid,
        title: reminderDraft.title.trim(),
        remindAt: reminderDraft.remindAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setReminderDraft({ title: '', remindAt: todayInputValue() });
      setToastMsg('Reminder saved to your calendar.');
      setShowToast(true);
    } catch (error) {
      console.warn('Unable to save reminder', error);
      setToastMsg('Unable to save reminder.');
      setShowToast(true);
    }
  };

  return (
    <StudentLayout title="Planner">
      <div className="space-y-6 pb-20 md:pb-0">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-primary text-xs font-black uppercase tracking-widest">
            <ClipboardList size={16} />
            Study calendar
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline">Your calendar planner</h1>
          <p className="text-sm text-on-surface-variant mt-2">Module deadlines, generated study tasks, and your own reminders stay together so the week is easier to follow.</p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays size={18} className="text-primary" />
              <h2 className="text-xl font-extrabold font-headline">Next 14 days</h2>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-on-surface-variant/50 uppercase">{d}</div>
              ))}
              {Array.from({ length: new Date().getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map((day) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const isSelected = day.key === selectedDayKey;
                return (
                 <button
                    key={day.key}
                    type="button"
                    onClick={() => setSelectedDayKey(day.key)}
                    className="flex gap-1 flex-col items-center justify-start py-1 relative hover:scale-105 transition-all outline-none"
                 >
                    <div className={`w-8 h-8 flex flex-col items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isToday 
                        ? 'bg-primary text-on-primary ring-2 ring-primary/30 font-black' 
                        : isSelected
                          ? 'bg-primary/20 text-primary border-2 border-primary font-black scale-110'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}>
                       {day.date.getDate()}
                    </div>
                    {day.markers.length > 0 && (
                       <div className="flex flex-wrap gap-0.5 max-w-[20px] justify-center mt-0.5">
                          {day.markers.slice(0,3).map(m => (
                             <span key={m.id} className={`w-1.5 h-1.5 rounded-full ${markerToneCode(m.type)}`} />
                          ))}
                       </div>
                    )}
                 </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-outline-variant/20 pt-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-[16px]">event_note</span>
                  Agenda for {selectedDay ? selectedDay.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Selected Day'}
                  {selectedDay && selectedDay.date.toDateString() === new Date().toDateString() && ' (Today)'}
                </p>
                
                {selectedDay && selectedDay.markers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in text-on-surface">
                    {selectedDay.markers.map((marker, idx) => (
                      <div
                        key={`${marker.id}-${idx}`}
                        className={`rounded-xl p-3.5 border border-outline-variant/10 flex flex-col justify-between ${markerTone(marker.type)} shadow-sm transition-all`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-wider opacity-85 px-1.5 py-0.5 rounded bg-surface/30">{marker.type === 'todo' ? 'Deadline' : marker.type}</span>
                            {marker.type === 'todo' && <span className="w-1.5 h-1.5 rounded-full bg-error" />}
                          </div>
                          <h4 className="font-extrabold text-sm">{marker.label}</h4>
                        </div>
                        {marker.targetLink && (
                          <button
                            onClick={() => navigate(marker.targetLink!)}
                            className="mt-3 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary hover:underline self-start"
                          >
                            Open Task <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container/10">
                    <span className="material-symbols-outlined text-on-surface-variant/20 text-3xl mb-1.5">calendar_today</span>
                    <p className="text-xs text-on-surface-variant/50 font-bold">No tasks or reminders scheduled for this date.</p>
                    <p className="text-[10px] text-on-surface-variant/30 mt-0.5">Click another calendar date above to view, or create a reminder.</p>
                  </div>
                )}
            </div>
            <div className="mt-4 rounded-2xl bg-surface-container/40 border border-outline-variant/30 p-3 text-xs text-on-surface-variant">
              <span className="font-black text-error">To dos</span> are module deadlines. <span className="font-black text-primary">Study</span> is generated from your pace and weak areas. <span className="font-black text-emerald-700">Reminders</span> are made by you.
            </div>
          </div>

          <aside className="space-y-4">
            {mockCooldown && (
              <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 shrink-0 text-on-surface" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Full mock paused</p>
                    <h3 className="font-headline font-extrabold text-lg">Review first</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">{mockCooldown.message}</p>
                    <p className="mt-3 font-mono text-xs font-black text-on-surface">Unlocks {new Date(mockCooldown.lockedUntilMillis).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/mistake-bank')} className="mt-4 w-full rounded-xl bg-primary text-on-primary px-4 py-3 text-sm font-bold">
                  Open mistake bank
                </button>
              </div>
            )}

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CalendarPlus size={18} className="text-primary" />
                <h3 className="font-headline font-extrabold text-lg">Add reminder</h3>
              </div>
              <input value={reminderDraft.title} onChange={(event) => setReminderDraft({ ...reminderDraft, title: event.target.value })} placeholder="Review notes, ask instructor..." className="input" />
              <input type="date" value={reminderDraft.remindAt} onChange={(event) => setReminderDraft({ ...reminderDraft, remindAt: event.target.value })} className="input mt-3" />
              <button onClick={addReminder} className="mt-3 w-full rounded-xl bg-primary text-on-primary px-4 py-3 text-sm font-bold">Save reminder</button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
              <h3 className="font-headline font-extrabold text-lg mb-3">Upcoming due dates</h3>
              <div className="space-y-2">
                {dueDateItems.map((item) => {
                  const dueDate = new Date(item.dueAt);
                  const isOverdue = dueDate.getTime() < Date.now();
                  return (
                    <button key={item.id} onClick={() => navigate(item.targetLink)} className="w-full rounded-xl border border-outline-variant/40 bg-surface-container/30 p-3 text-left hover:border-primary/40 transition-colors">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-error' : 'text-primary'}`}>{item.type} / {isOverdue ? 'Overdue' : 'Due'}</p>
                      <h4 className="font-extrabold text-sm text-on-surface mt-1">{item.title}</h4>
                      <p className="text-[11px] text-on-surface-variant/60 mt-1">{dueDate.toLocaleString()}</p>
                    </button>
                  );
                })}
                {dueDateItems.length === 0 && (
                  <p className="rounded-xl bg-surface-container/30 border border-outline-variant/30 p-3 text-xs font-bold text-on-surface-variant/60">No due dates yet. Reminders and generated study markers will still appear on the calendar.</p>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-3">
          {todoItems.map((module) => {
            const dueDate = module.dueAt ? new Date(module.dueAt) : null;
            const isOverdue = dueDate ? dueDate.getTime() < Date.now() : false;
            return (
              <article key={module.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isOverdue ? 'text-error' : 'text-primary'}`}>
                    {dueDate ? `${isOverdue ? 'Overdue' : 'Due'} ${dueDate.toLocaleString()}` : 'No due date'}
                  </p>
                  <h2 className="text-lg font-extrabold text-on-surface">{module.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">{module.description}</p>
                </div>
                <button onClick={() => navigate(`/quest?moduleId=${module.id}`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-bold">
                  Open
                  <ChevronRight size={16} />
                </button>
              </article>
            );
          })}

          {todoItems.length === 0 && !mockCooldown && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center shadow-sm">
              <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={40} />
              <h2 className="font-extrabold text-on-surface">Nothing due right now.</h2>
              <p className="text-sm text-on-surface-variant mt-2">New class modules and deadlines will show here.</p>
            </div>
          )}
        </section>
      </div>
      <Toast
        isVisible={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        type={toastMsg.includes('Unable') || toastMsg.includes('Add ') ? 'error' : 'success'}
      />
    </StudentLayout>
  );
}

function toDateKey(value: any) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function planItemDateKey(item: StudyPlanItem, index: number) {
  const date = new Date();
  if (item.dayLabel === 'Tomorrow') date.setDate(date.getDate() + 1);
  else if (item.dayLabel === 'Friday') {
    const diff = (5 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + diff);
  } else if (item.dayLabel === 'This week') date.setDate(date.getDate() + Math.min(index + 2, 6));
  return toDateKey(date);
}

function markerToneCode(type: CalendarMarker['type']) {
  if (type === 'todo') return 'bg-error';
  if (type === 'reminder') return 'bg-emerald-500';
  if (type === 'cooldown') return 'bg-warning';
  return 'bg-primary';
}

function markerTone(type: CalendarMarker['type']) {
  if (type === 'todo') return 'bg-error/10 text-error';
  if (type === 'reminder') return 'bg-emerald-500/10 text-emerald-700';
  if (type === 'cooldown') return 'bg-warning/20 text-on-surface';
  return 'bg-primary/10 text-primary';
}
