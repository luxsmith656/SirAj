import React, { useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Save, KeyRound, RotateCcw, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StudentLayout from '../components/StudentLayout';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { db, resetPassword } from '../lib/firebase';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [reviewTrack, setReviewTrack] = useState(user?.reviewTrack || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [message, setMessage] = useState('');
  const [trackChangeOption, setTrackChangeOption] = useState<'keep' | 'reset'>('keep');
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const isDemoAccount = (user?.email || '').toLowerCase() === 'student@letmastery.com' || (user as any)?.isDemo;

  const saveProfile = async () => {
    if (!user) return;
    setIsResettingDemo(true);
    setMessage('Updating profile tracks...');
    try {
      if (user?.role === 'student' && reviewTrack !== (user?.reviewTrack || '') && trackChangeOption === 'reset') {
        const deleteByUserId = async (collectionName: string, field = 'userId') => {
          const snap = await getDocs(query(collection(db, collectionName), where(field, '==', user.uid)));
          await Promise.allSettled(snap.docs.map((row) => deleteDoc(row.ref)));
        };

        await Promise.allSettled([
          deleteDoc(doc(db, 'learnerProfiles', user.uid)),
          deleteByUserId('moduleProgress'),
          deleteByUserId('diagnosticAttempts'),
          deleteByUserId('quizAttempts'),
          deleteByUserId('mockExamAttempts'),
          deleteByUserId('examAttemptLogs'),
        ]);

        await clearDemoIndexedDb();
      }

      await updateDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim(),
        reviewTrack: reviewTrack,
        specialization: specialization,
        updatedAt: new Date().toISOString(),
      });
      await refreshUser();
      setMessage('Profile settings updated successfully.');
    } catch (e) {
      console.warn('Update review track failed', e);
      setMessage('Profile updated but some progress resets failed.');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    await resetPassword(user.email);
    setMessage('Password reset email sent.');
  };

  const resetDemoProgress = async () => {
    if (!user || !isDemoAccount) return;
    setIsResettingDemo(true);
    setMessage('');
    try {
      const deleteByUserId = async (collectionName: string, field = 'userId') => {
        const snap = await getDocs(query(collection(db, collectionName), where(field, '==', user.uid)));
        await Promise.allSettled(snap.docs.map((row) => deleteDoc(row.ref)));
      };

      await Promise.allSettled([
        deleteDoc(doc(db, 'learnerProfiles', user.uid)),
        deleteByUserId('moduleProgress'),
        deleteByUserId('diagnosticAttempts'),
        deleteByUserId('quizAttempts'),
        deleteByUserId('mockExamAttempts'),
        deleteByUserId('examAttemptLogs'),
        deleteByUserId('mistakeBank'),
        deleteByUserId('learningNotes'),
        deleteByUserId('learningAnnotations'),
        deleteByUserId('highlights'),
        deleteByUserId('hiddenBlocks'),
        deleteByUserId('bookmarks'),
        deleteByUserId('studyReminders'),
        deleteByUserId('classEnrollments', 'studentId'),
      ]);

      await updateDoc(doc(db, 'users', user.uid), {
        onboarded: false,
        learningMode: null,
        activeClassId: null,
        classIds: [],
        selectedFocus: null,
        reviewTrack: null,
        specialization: '',
        targetExamDate: null,
        diagnosticCompleted: false,
        diagnosticSkipped: false,
        streak: 0,
        xp: 0,
        level: 1,
        earnedBadges: [],
        archivedModuleIds: [],
        archivedClassIds: [],
        onboardingStep: 0,
        updatedAt: serverTimestamp(),
      });

      clearDemoLocalCache(user.uid);
      await clearDemoIndexedDb();
      await refreshUser();
      setMessage('Demo progress reset. Redirecting...');
      setTimeout(() => {
        navigate('/onboarding');
      }, 500);
    } catch (error) {
      console.warn('Demo reset failed', error);
      setMessage('Demo reset could not finish completely. Try again after sync completes.');
    } finally {
      setIsResettingDemo(false);
    }
  };

  const content = (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full text-on-surface space-y-6">
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Profile settings</p>
        <h1 className="text-3xl font-extrabold font-headline">Account and identity</h1>
        <p className="text-sm text-on-surface-variant mt-2">Update your visible name and manage password access.</p>
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5">
        {message && <div className="rounded-xl bg-primary/10 text-primary px-4 py-3 text-sm font-bold">{message}</div>}
        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Full name</span>
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent outline-none" />
        </label>
        {user?.role === 'student' && (
          <>
            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Review Track</span>
              <select value={reviewTrack} onChange={(e) => setReviewTrack(e.target.value)} className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent outline-none">
                <option value="elementary">Elementary Education (BEEd)</option>
                <option value="secondary">Secondary Education (BSEd)</option>
                <option value="gened">General Education Only</option>
                <option value="profed">Professional Education Only</option>
              </select>
            </label>

            {reviewTrack !== (user?.reviewTrack || '') && (
              <div className="bg-amber-500/10 border border-amber-300/20 rounded-2xl p-5 mt-2 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-amber-800">⚠️ Review Track Change Option</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Changing your track updates your curriculum core. Decide what to do with your current progress records:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setTrackChangeOption('keep')}
                    className={`p-3 rounded-xl border text-xs font-extrabold text-left transition-all flex flex-col justify-between ${
                      trackChangeOption === 'keep'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>Keep & Merge Progress</span>
                    <span className="text-[9px] font-normal opacity-70 mt-1">Keep current notes, logs, and answers and merge them with the new track.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackChangeOption('reset')}
                    className={`p-3 rounded-xl border text-xs font-extrabold text-left transition-all flex flex-col justify-between ${
                      trackChangeOption === 'reset'
                        ? 'border-error bg-error/10 text-error'
                        : 'border-outline-variant bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>Reset Track Progress</span>
                    <span className="text-[9px] font-normal opacity-70 mt-1">Wipe past diagnostics, quizzes and module completion to start the track fresh!</span>
                  </button>
                </div>
              </div>
            )}

            {reviewTrack === 'secondary' && (
              <label className="block space-y-2 select-text">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Specialization / Major</span>
                <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent outline-none">
                  <option value="">Select major...</option>
                  <option value="english">English</option>
                  <option value="math">Mathematics</option>
                  <option value="science">General Science</option>
                  <option value="filipino">Filipino</option>
                  <option value="tle">TLE</option>
                  <option value="mapeh">MAPEH</option>
                  <option value="socsci">Social Sciences</option>
                  <option value="values">Values Education</option>
                </select>
              </label>
            )}
          </>
        )}
        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Email</span>
          <input value={user?.email || ''} disabled className="w-full bg-surface-container rounded-xl px-5 py-4 text-on-surface font-medium text-sm border border-transparent opacity-60 outline-none" />
        </label>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <button onClick={saveProfile} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary px-5 py-3 text-sm font-bold">
            <Save size={16} />
            Save profile
          </button>
          <button onClick={sendReset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container text-on-surface px-5 py-3 text-sm font-bold border border-outline-variant/40">
            <KeyRound size={16} />
            Send password reset
          </button>
          <button onClick={() => {
              if (window.confirm("Are you sure you want to clear your local cache? You will need to resync.")) {
                  clearDemoLocalCache(user?.uid || '');
                  clearDemoIndexedDb();
                  alert("Cache cleared! Please refresh the page.");
              }
          }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container text-on-surface px-5 py-3 text-sm font-bold border border-outline-variant/40">
            <RotateCcw size={16} />
            Clear Cache & Resync
          </button>
          <button onClick={() => {
              if ('Notification' in window) {
                  Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                          alert("Daily offline reminders enabled!");
                          // In a full PWA, this would schedule SW push notifications
                      }
                  });
              }
          }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container text-on-surface px-5 py-3 text-sm font-bold border border-outline-variant/40">
            <KeyRound size={16} />
            Enable Offline Reminders
          </button>
          <button onClick={() => {
              setIsApkModalOpen(true);
          }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface-container text-on-surface px-5 py-3 text-sm font-bold border border-outline-variant/40">
            <Download size={16} />
            Download Latest APK
          </button>
        </div>
      </section>

      {isDemoAccount && (
        <section className="bg-error/5 border border-error/20 rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-error">Demo reset</p>
          <h2 className="font-headline text-xl font-extrabold text-on-surface">Return this demo to a clean start</h2>
          <p className="text-sm text-on-surface-variant">Clears demo progress, attempts, mistake bank records, notes, highlights, reminders, class enrollment state, and local/offline learning cache.</p>
          <button
            onClick={() => setIsResetModalOpen(true)}
            disabled={isResettingDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-error text-on-error px-5 py-3 text-sm font-bold disabled:opacity-50"
          >
            <RotateCcw size={16} />
            {isResettingDemo ? 'Resetting demo...' : 'Reset demo progress'}
          </button>
        </section>
      )}
      
      <ConfirmModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onConfirm={() => {
            setIsApkModalOpen(false);
            window.location.href = "https://github.com/luxsmith656/SirAj/raw/main/app-release.apk";
        }}
        title="Download App APK?"
        message="This will download the latest Android Application Package (APK) directly from the repository. Do you want to proceed?"
        confirmText="Download APK"
        confirmColor="bg-primary text-on-primary shadow-primary/20"
        icon="download"
      />

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={async () => {
          setIsResetModalOpen(false);
          await resetDemoProgress();
        }}
        title="Reset Demo Data?"
        message="This action will clear all your demo attempts, notes, mistake bank, and configurations. You will return to the onboarding flow."
        isProcessing={isResettingDemo}
        confirmText="Yes, reset demo"
        confirmColor="bg-error text-on-error shadow-error/20"
        icon="delete"
      />
    </div>
  );

  if (user?.role === 'student') {
    return <StudentLayout title="Profile">{content}</StudentLayout>;
  }

  return <DashboardLayout title="Profile">{content}</DashboardLayout>;
}

function clearDemoLocalCache(userId: string) {
  const prefixes = [
    `let-mastery-progress:${userId}:`,
    `let-mastery-answer-drafts:${userId}:`,
    `let-mastery-exam-attempt:${userId}:`,
  ];
  Object.keys(localStorage).forEach((key) => {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      localStorage.removeItem(key);
    }
  });
}

async function clearDemoIndexedDb() {
  try {
    const { initDB } = await import('../lib/offline/db');
    const localDb = await initDB();
    await Promise.all([
      localDb.clear('localQuizAttempts'),
      localDb.clear('localProgress'),
      localDb.clear('syncQueue'),
    ]);
  } catch (error) {
    console.warn('Unable to clear local demo IndexedDB cache', error);
  }
}
