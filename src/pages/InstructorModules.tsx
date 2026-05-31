import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronUp,
  ClipboardList,
  Copy,
  FileQuestion,
  Award,
  Eye,
  EyeOff,
  GripVertical,
  Layers3,
  Maximize2,
  MessageCircle,
  Minimize2,
  Monitor,
  MoreVertical,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Smartphone,
  Tablet,
  Target,
  Trash2,
  Trophy,
  Wand2,
  X,
  Clock,
  Cloud,
  CloudOff,
  Users,
  Undo2,
  Redo2,
} from 'lucide-react';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, setDoc, where } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import PublishModal from '../components/PublishModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { JourneyModulePart, JourneyQuestion, SourceDocumentMeta, journeyModules, journeySubjects } from '../lib/learningJourney';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { createNotification, getClassRecipientIds } from '../lib/notifications';

interface BuilderModule {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  topicId: string;
  level: number;
  duration: string;
  isPublished: boolean;
  publishScope: 'public' | 'classes';
  classIds: string[];
  dueAt?: string;
  antiCheatEnabled: boolean;
  recordFirstAttemptOnly: boolean;
  authorName?: string;
  authorEmail?: string;
  isTemplate?: boolean;
  templateSourceId?: string;
  prerequisiteModuleIds: string[];
  competencies: { id: string; label: string; description?: string }[];
  rubric: { criterion: string; points: number; description: string }[];
  unlockRules: { minScorePercent: number; requireAllParts: boolean; motivationalQuote: string };
  examBlueprint: {
    questionCount: number;
    sectionDistribution: Record<string, number>;
    competencyDistribution: Record<string, number>;
    difficultyMix: Record<'easy' | 'medium' | 'hard', number>;
  };
  certificateEnabled: boolean;
  certificateTemplateId?: string;
  certificateRequirementNote?: string;
  sourceDocument?: SourceDocumentMeta | null;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  sourceConfidence?: 'high' | 'medium' | 'needs_review';
  sourceReviewRequired?: boolean;
  attemptPolicy: {
    maxAttempts: number;
    scoreMode: 'first' | 'highest' | 'latest';
    showAnswersAfterSubmit: boolean;
    answerRevealMode: 'immediate' | 'after_deadline' | 'never';
    timeLimitMinutes: number;
    randomizeQuestions: boolean;
    randomizeChoices: boolean;
    questionPoolSize: number;
    attemptLogs: boolean;
    integrityLevel: 'open_practice' | 'light_protection' | 'standard_protection' | 'strict_exam_mode' | 'basic' | 'advanced';
  };
  flowItems: { id: string; type: 'textbook' | 'lesson' | 'quiz' | 'activity' | 'exam'; refId: string; title: string }[];
  parts: JourneyModulePart[];
  finalExam: JourneyQuestion[];
  editHighlights?: Record<string, { updatedBy: string; name: string; email: string; updatedAt: number }>;
  updatedBy?: string;
}

type FlowItem = BuilderModule['flowItems'][number];
type SimulatorDevice = 'wide' | 'laptop' | 'ipad' | 'phone';

const defaultUnlockRules = {
  minScorePercent: 85,
  requireAllParts: true,
  motivationalQuote: 'Master the idea before you chase the score.',
};

const defaultExamBlueprint = {
  questionCount: 10,
  sectionDistribution: {},
  competencyDistribution: {},
  difficultyMix: { easy: 30, medium: 50, hard: 20 },
};

const defaultAttemptPolicy = {
  maxAttempts: 1,
  scoreMode: 'first' as const,
  showAnswersAfterSubmit: false,
  answerRevealMode: 'never' as const,
  timeLimitMinutes: 0,
  randomizeQuestions: false,
  randomizeChoices: false,
  questionPoolSize: 0,
  attemptLogs: true,
  integrityLevel: 'basic' as const,
};

const blankQuestion = (id: string): JourneyQuestion => ({
  id,
  type: 'multiple_choice',
  stem: 'Write the question stem here.',
  options: [
    { id: 'A', text: 'Option A' },
    { id: 'B', text: 'Option B' },
    { id: 'C', text: 'Option C' },
    { id: 'D', text: 'Option D' },
  ],
  correctOptionId: 'A',
  explanation: 'Explain why the answer is correct.',
});

const blankPart = (index: number): JourneyModulePart => ({
  id: `part-${index + 1}`,
  title: `Part ${index + 1}: New learning part`,
  objective: 'What should students be able to do after this part?',
  textbookSection: {
    title: 'Textbook section title',
    body: 'Write the reading section here. Keep it focused and connected to the mini lesson.',
    estimatedReadMinutes: 8,
    mediaUrl: '',
  },
  lessonBlocks: [
    { type: 'heading', content: 'Mini lesson heading' },
    { type: 'text', content: 'Explain the concept in short, clear paragraphs.' },
    { type: 'callout', content: 'Add a board-exam tip or common misconception here.' },
  ],
  miniQuiz: [blankQuestion(`part-${index + 1}-q1`)],
});

function buildDefaultFlow(parts: JourneyModulePart[], finalExam: JourneyQuestion[]): FlowItem[] {
  const flow = parts.flatMap((part, index) => {
    const base: FlowItem[] = [
      { id: `${part.id}-textbook`, type: 'textbook' as const, refId: part.id, title: getFlowTitle('textbook', part, index) },
      { id: `${part.id}-lesson`, type: 'lesson' as const, refId: part.id, title: getFlowTitle('lesson', part, index) },
      { id: `${part.id}-quiz`, type: 'quiz' as const, refId: part.id, title: getFlowTitle('quiz', part, index) },
    ];
    if (part.activity?.prompt) base.push({ id: `${part.id}-activity`, type: 'activity' as const, refId: part.id, title: getFlowTitle('activity', part, index) });
    return base;
  });
  flow.push({ id: 'final-exam', type: 'exam', refId: 'finalExam', title: `Final exam (${finalExam.length || 1} items)` });
  return flow;
}

function getFlowTitle(type: FlowItem['type'], part: JourneyModulePart, partIndex: number, finalExamCount = 1) {
  if (type === 'exam') return `Final exam (${finalExamCount || 1} items)`;
  if (type === 'textbook') return `Part ${partIndex + 1} reading: ${part.textbookSection.title}`;
  if (type === 'lesson') return `Part ${partIndex + 1} lesson: ${part.title}`;
  if (type === 'quiz') return `Part ${partIndex + 1} mini quiz`;
  return `Part ${partIndex + 1} activity`;
}

function patchForQuestionType(question: JourneyQuestion, type: JourneyQuestion['type']): Partial<JourneyQuestion> {
  if (type === 'true_false') {
    return {
      type,
      options: [{ id: 'A', text: 'True' }, { id: 'B', text: 'False' }],
      correctOptionId: question.correctOptionId === 'B' ? 'B' : 'A',
      acceptedAnswers: [],
      expectedAnswer: '',
    };
  }

  if (type === 'multiple_choice') {
    const fallback = blankQuestion(question.id);
    return {
      type,
      options: question.options?.length ? question.options : fallback.options,
      correctOptionId: question.correctOptionId || fallback.correctOptionId,
      acceptedAnswers: [],
      expectedAnswer: '',
    };
  }

  return {
    type,
    options: [],
    correctOptionId: '',
    acceptedAnswers: question.acceptedAnswers?.length ? question.acceptedAnswers : ['Key idea from the reading'],
    expectedAnswer: question.expectedAnswer || 'Expected answer based on the textbook reading.',
  };
}

function isChoiceEditorQuestion(question: JourneyQuestion) {
  return !question.type || question.type === 'multiple_choice' || question.type === 'true_false';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

function formatSourceDocumentForPrompt(documentMeta: SourceDocumentMeta) {
  const chunks = documentMeta.chunks || [];
  return chunks.map((chunk, index) => {
    const locator = chunk.sourcePage
      ? `page ${chunk.sourcePage}`
      : chunk.sourceSlide
        ? `slide ${chunk.sourceSlide}`
        : chunk.sourcePart || `chunk ${index + 1}`;
    return `[${locator}] ${chunk.text}`;
  }).join('\n\n');
}

function groundAIPart(part: any, index: number, sourceDocument?: SourceDocumentMeta | null): JourneyModulePart {
  const fallback = blankPart(index);
  const chunk = sourceDocument?.chunks?.[index % Math.max(sourceDocument.chunks.length, 1)];
  const textbookSection = {
    ...fallback.textbookSection,
    ...(part.textbookSection || {}),
    sourceDocumentId: part.textbookSection?.sourceDocumentId || sourceDocument?.sourceDocumentId || chunk?.id?.split('-chunk-')[0] || '',
    sourcePage: part.textbookSection?.sourcePage || chunk?.sourcePage,
    sourceSlide: part.textbookSection?.sourceSlide || chunk?.sourceSlide,
    sourceTextSnippet: part.textbookSection?.sourceTextSnippet || chunk?.sourceTextSnippet || chunk?.text?.slice(0, 320) || '',
    aiConfidence: part.textbookSection?.aiConfidence || sourceDocument?.confidence || 'medium',
  };

  return {
    ...fallback,
    ...part,
    id: part.id || `ai-part-${index + 1}-${Date.now()}`,
    textbookSection,
    lessonBlocks: part.lessonBlocks?.length ? part.lessonBlocks : fallback.lessonBlocks,
    miniQuiz: part.miniQuiz?.length ? part.miniQuiz : [blankQuestion(`ai-part-${index + 1}-q1`)],
    activity: part.activity?.prompt ? part.activity : fallback.activity,
  };
}

const emptyModule: BuilderModule = {
  id: '',
  title: '',
  description: '',
  subjectId: journeySubjects[0].id,
  topicId: journeySubjects[0].topics[0].id,
  level: 1,
  duration: '45 min',
  isPublished: false,
  publishScope: 'public',
  classIds: [],
  dueAt: '',
  antiCheatEnabled: true,
  recordFirstAttemptOnly: true,
  authorName: '',
  authorEmail: '',
  isTemplate: false,
  templateSourceId: '',
  prerequisiteModuleIds: [],
  competencies: [{ id: 'competency-1', label: 'Core understanding', description: 'Explain the key idea in your own words.' }],
  rubric: [{ criterion: 'Concept accuracy', points: 10, description: 'Answer matches the textbook concept and uses correct terms.' }],
  unlockRules: defaultUnlockRules,
  examBlueprint: defaultExamBlueprint,
  certificateEnabled: false,
  certificateTemplateId: '',
  certificateRequirementNote: 'Issue a certificate after this module is completed and the final assessment is passed.',
  sourceDocument: null,
  sourceDocumentId: '',
  sourceDocumentName: '',
  sourceConfidence: undefined,
  sourceReviewRequired: false,
  attemptPolicy: defaultAttemptPolicy,
  flowItems: buildDefaultFlow([blankPart(0)], [blankQuestion('final-q1')]),
  parts: [blankPart(0)],
  finalExam: [blankQuestion('final-q1')],
};

function fromSeedModule(module: (typeof journeyModules)[number]): BuilderModule {
  return {
    id: module.id,
    title: module.title,
    description: module.description,
    subjectId: module.subjectId,
    topicId: module.topicId,
    level: module.level,
    duration: module.duration,
    isPublished: module.status !== 'locked',
    publishScope: 'public',
    classIds: [],
    dueAt: '',
    antiCheatEnabled: true,
    recordFirstAttemptOnly: true,
    authorName: 'Preset curriculum',
    authorEmail: '',
    isTemplate: false,
    templateSourceId: '',
    prerequisiteModuleIds: module.prerequisiteModuleIds || [],
    competencies: module.competencies?.length ? module.competencies : emptyModule.competencies,
    rubric: module.rubric?.length ? module.rubric : emptyModule.rubric,
    unlockRules: { ...defaultUnlockRules, ...(module.unlockRules || {}) },
    examBlueprint: { ...defaultExamBlueprint, ...(module.examBlueprint || {}) },
    certificateEnabled: !!(module as any).certificateEnabled,
    certificateTemplateId: (module as any).certificateTemplateId || '',
    certificateRequirementNote: (module as any).certificateRequirementNote || emptyModule.certificateRequirementNote,
    sourceDocument: (module as any).sourceDocument || null,
    sourceDocumentId: (module as any).sourceDocumentId || '',
    sourceDocumentName: (module as any).sourceDocumentName || '',
    sourceConfidence: (module as any).sourceConfidence || undefined,
    sourceReviewRequired: !!(module as any).sourceReviewRequired,
    attemptPolicy: { ...defaultAttemptPolicy, ...((module as any).attemptPolicy || {}) },
    parts: module.parts?.length ? module.parts : [blankPart(0)],
    finalExam: module.finalExam?.length ? module.finalExam : module.questions.slice(0, 2),
    flowItems: module.flowItems?.length ? module.flowItems : buildDefaultFlow(module.parts?.length ? module.parts : [blankPart(0)], module.finalExam?.length ? module.finalExam : module.questions.slice(0, 2)),
  };
}

function fromFirestoreModule(id: string, data: any): BuilderModule {
  const legacyPart = data.lessonBlocks?.length
    ? {
        ...blankPart(0),
        title: 'Part 1: Lesson',
        objective: data.description || 'Study the lesson and complete the check.',
        lessonBlocks: data.lessonBlocks,
        textbookSection: {
          title: `${data.title || 'Module'} reading`,
          body: data.lessonBlocks.map((block: any) => block.content).join('\n\n'),
          estimatedReadMinutes: 8,
        },
      }
    : blankPart(0);

  const parts = data.parts?.length ? data.parts : [legacyPart];
  const finalExam = data.finalExam?.length ? data.finalExam : [blankQuestion('final-q1')];
  return {
    id,
    title: data.title || 'Untitled module',
    description: data.description || '',
    subjectId: data.subjectId || data.categoryId || journeySubjects[0].id,
    topicId: data.topicId || journeySubjects[0].topics[0].id,
    level: data.level || 1,
    duration: data.duration || '45 min',
    isPublished: data.isPublished ?? false,
    publishScope: data.publishScope || (data.classIds?.length ? 'classes' : 'public'),
    classIds: data.classIds || [],
    dueAt: data.dueAt || '',
    antiCheatEnabled: data.antiCheatEnabled ?? true,
    recordFirstAttemptOnly: data.recordFirstAttemptOnly ?? true,
    authorName: data.authorName || data.createdByName || data.instructorName || 'Instructor',
    authorEmail: data.authorEmail || '',
    isTemplate: !!data.isTemplate,
    templateSourceId: data.templateSourceId || '',
    prerequisiteModuleIds: data.prerequisiteModuleIds || [],
    competencies: data.competencies?.length ? data.competencies : emptyModule.competencies,
    rubric: data.rubric?.length ? data.rubric : emptyModule.rubric,
    unlockRules: { ...defaultUnlockRules, ...(data.unlockRules || {}) },
    examBlueprint: { ...defaultExamBlueprint, ...(data.examBlueprint || {}) },
    certificateEnabled: !!data.certificateEnabled,
    certificateTemplateId: data.certificateTemplateId || '',
    certificateRequirementNote: data.certificateRequirementNote || emptyModule.certificateRequirementNote,
    sourceDocument: data.sourceDocument || null,
    sourceDocumentId: data.sourceDocumentId || data.sourceDocument?.sourceDocumentId || '',
    sourceDocumentName: data.sourceDocumentName || data.sourceDocument?.fileName || '',
    sourceConfidence: data.sourceConfidence || data.sourceDocument?.confidence || undefined,
    sourceReviewRequired: !!(data.sourceReviewRequired || data.sourceDocument?.reviewRequired),
    attemptPolicy: { ...defaultAttemptPolicy, ...(data.attemptPolicy || {}) },
    parts,
    finalExam,
    flowItems: data.flowItems?.length ? data.flowItems : buildDefaultFlow(parts, finalExam),
    editHighlights: data.editHighlights || {},
    updatedBy: data.updatedBy || '',
  };
}

const builderSteps = [
  { id: 'outline', label: 'Outline' },
  { id: 'parts', label: 'Parts' },
  { id: 'assessments', label: 'Quizzes' },
  { id: 'design', label: 'Design' },
  { id: 'publish', label: 'Publish' },
] as const;

type BuilderStep = typeof builderSteps[number]['id'];

export default function InstructorModules() {
  const { user } = useAuth();
  const [modules, setModules] = useState<BuilderModule[]>(journeyModules.map(fromSeedModule));
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState(journeyModules[0].id);
  const [draft, setDraft] = useState<BuilderModule>(fromSeedModule(journeyModules[0]));
  const [activeStep, setActiveStep] = useState<BuilderStep>('outline');
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantSource, setAssistantSource] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<'all' | 'published' | 'published_public' | 'published_class' | 'draft'>('all');
  const [builderMode, setBuilderMode] = useState<'edit' | 'preview'>('edit');
  const [moduleRailCollapsed, setModuleRailCollapsed] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'module' | 'part' | null>(null);
  const [pendingPartDeleteIndex, setPendingPartDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const handlePublish = async (scope: 'public' | 'classes', classIds: string[]) => {
    try {
      await updateDoc(doc(db, 'modules', selectedModuleId), {
        isPublished: true,
        publishScope: scope,
        classIds: scope === 'classes' ? classIds : [],
        updatedAt: serverTimestamp(),
      });
      setIsPublishModalOpen(false);
      setToastMsg('Module published successfully!');
      setShowToast(true);
      setDraft(prev => ({ ...prev, isPublished: true, publishScope: scope, classIds: classIds }));
    } catch (err) {
      console.error('Error publishing:', err);
      setToastMsg('Error publishing module.');
      setShowToast(true);
    }
  };

  // Collaborative & Google Docs States
  const [studioLayoutMode, setStudioLayoutMode] = useState<'docs' | 'multistep'>('docs');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [activeEditors, setActiveEditors] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [past, setPast] = useState<BuilderModule[]>([]);
  const [future, setFuture] = useState<BuilderModule[]>([]);
  const isLocalChangeRef = useRef(false);

  // Undo/Redo Logic
  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture([draft, ...future]);
    setDraft(previous);
    setPast(newPast);
    isLocalChangeRef.current = true;
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast([...past, draft]);
    setDraft(next);
    setFuture(newFuture);
    isLocalChangeRef.current = true;
  };

  // Modify updateDraft to manage undo/redo history
  const updateDraft = (field: keyof BuilderModule, value: any, keyPath?: string) => {
    isLocalChangeRef.current = true;
    setPast((prev) => [...prev, draft]);
    setFuture([]); // Clear future on new change
    setDraft((current) => {
      const nextHighlights = { ...(current.editHighlights || {}) };
      if (keyPath && user) {
        nextHighlights[keyPath] = {
          updatedBy: user.uid,
          name: user.fullName || user.email || 'Instructor',
          email: user.email || '',
          updatedAt: Date.now(),
        };
      }
      if (field === 'subjectId') {
        const nextSubject = journeySubjects.find((subject) => subject.id === value) || journeySubjects[0];
        return { ...current, subjectId: nextSubject.id, topicId: nextSubject.topics[0].id, editHighlights: nextHighlights };
      }
      return { ...current, [field]: value, editHighlights: nextHighlights };
    });
  };
  useEffect(() => {
    if (!user || !selectedModuleId) return;

    const presenceId = `${user.uid}_${selectedModuleId}`;
    const presenceRef = doc(db, 'studioPresence', presenceId);
    
    const updatePresence = async () => {
      try {
        await setDoc(presenceRef, {
          userId: user.uid,
          userName: user.fullName || user.email || 'Instructor',
          userEmail: user.email,
          avatarInitials: (user.fullName || user.email || 'I')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase(),
          moduleId: selectedModuleId,
          lastActiveAt: Date.now(),
        });
      } catch (e) {
        // Silent error
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 8000);

    const streamQuery = query(
      collection(db, 'studioPresence'),
      where('moduleId', '==', selectedModuleId)
    );
    const unsubscribeStream = onSnapshot(streamQuery, (snapshot) => {
      const list = snapshot.docs.map((docItem) => docItem.data());
      const activeList = list.filter(
        (member) => member.lastActiveAt && member.lastActiveAt > Date.now() - 30000
      );
      setActiveEditors(activeList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'studioPresence');
    });

    return () => {
      clearInterval(interval);
      deleteDoc(presenceRef).catch(() => {});
      unsubscribeStream();
    };
  }, [user, selectedModuleId]);

  // 2. Fetch versions
  useEffect(() => {
    if (!selectedModuleId) {
      setVersions([]);
      return;
    }
    const versionsQuery = query(
      collection(db, 'contentVersions'),
      where('contentId', '==', selectedModuleId),
      orderBy('versionedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(versionsQuery, (snapshot) => {
      const list = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));
      setVersions(list);
    }, (err) => {
      console.warn('Error fetching versions:', err);
    });

    return () => unsubscribe();
  }, [selectedModuleId]);

  const persistDraft = async (currentDraft: BuilderModule) => {
    setAutoSaveStatus('saving');
    try {
      const payload = {
        title: currentDraft.title.trim(),
        description: currentDraft.description.trim(),
        subjectId: currentDraft.subjectId,
        categoryId: currentDraft.subjectId,
        topicId: currentDraft.topicId,
        level: currentDraft.level,
        duration: currentDraft.duration,
        isPublished: currentDraft.isPublished,
        publishScope: currentDraft.publishScope,
        classIds: currentDraft.publishScope === 'classes' ? currentDraft.classIds : [],
        dueAt: currentDraft.dueAt || '',
        antiCheatEnabled: currentDraft.antiCheatEnabled,
        recordFirstAttemptOnly: currentDraft.recordFirstAttemptOnly,
        isTemplate: !!currentDraft.isTemplate,
        templateSourceId: currentDraft.templateSourceId || '',
        prerequisiteModuleIds: currentDraft.prerequisiteModuleIds,
        competencies: currentDraft.competencies,
        rubric: currentDraft.rubric,
        unlockRules: currentDraft.unlockRules,
        examBlueprint: {
          ...currentDraft.examBlueprint,
          questionCount: currentDraft.finalExam.length || currentDraft.examBlueprint.questionCount,
        },
        certificateEnabled: currentDraft.certificateEnabled,
        certificateTemplateId: currentDraft.certificateTemplateId || '',
        certificateRequirementNote: currentDraft.certificateRequirementNote || '',
        sourceDocument: currentDraft.sourceDocument || null,
        sourceDocumentId: currentDraft.sourceDocumentId || currentDraft.sourceDocument?.sourceDocumentId || '',
        sourceDocumentName: currentDraft.sourceDocumentName || currentDraft.sourceDocument?.fileName || '',
        sourceConfidence: currentDraft.sourceConfidence || currentDraft.sourceDocument?.confidence || '',
        sourceReviewRequired: !!(currentDraft.sourceReviewRequired || currentDraft.sourceDocument?.reviewRequired),
        attemptPolicy: currentDraft.attemptPolicy,
        flowItems: currentDraft.flowItems,
        updatedBy: user?.uid || '',
        updatedByEmail: user?.email || '',
        editHighlights: currentDraft.editHighlights || {},
        parts: currentDraft.parts,
        finalExam: currentDraft.finalExam,
        lessonBlocks: currentDraft.parts.flatMap((part) => part.lessonBlocks),
        resources: currentDraft.flowItems.map((item) => ({ id: item.id, type: item.type === 'lesson' ? 'textbook' : item.type, title: item.title, meta: item.type === 'exam' ? `${currentDraft.finalExam.length} items` : 'Studio sequence' })),
        updatedAt: serverTimestamp(),
      };

      const moduleRef = doc(db, 'modules', selectedModuleId);
      
      // Versioning
      const previous = await getDoc(moduleRef);
      if (previous.exists() && versions.length === 0) {
        await addDoc(collection(db, 'contentVersions'), {
          contentType: 'module',
          contentId: selectedModuleId,
          title: previous.data().title || currentDraft.title,
          snapshot: previous.data(),
          changedBy: user?.uid || '',
          changedByEmail: user?.email || '',
          changedByName: user?.fullName || user?.email || 'Instructor',
          versionedAt: serverTimestamp(),
        });
      }

      await updateDoc(moduleRef, payload);
      setDraft(prev => ({ ...prev, ...payload } as BuilderModule));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('saved'), 3000); 
    } catch (err) {
      console.error('Error saving:', err);
      setAutoSaveStatus('error');
    }
  };

  // 3. Debounced Auto-save
  useEffect(() => {
    if (!selectedModuleId) return;
    
    // Auto-save timer
    const timer = setTimeout(async () => {
      if (!isLocalChangeRef.current) return;
      isLocalChangeRef.current = false;
      await persistDraft(draft);
    }, 500);

    // Save on unmount or moduleId change
    return () => {
      clearTimeout(timer);
      if (isLocalChangeRef.current) {
        persistDraft(draft);
      }
    };
  }, [draft, selectedModuleId, user]);

  const restoreVersion = async (version: any) => {
    if (!version.snapshot) return;
    
    const restoredDraft = fromFirestoreModule(selectedModuleId, version.snapshot);
    setDraft(restoredDraft);
    isLocalChangeRef.current = true;
    
    await addDoc(collection(db, 'activityLogs'), {
      action: 'restore_module_version',
      category: 'modules',
      description: `Restored module "${version.title || draft.title}" to version from ${new Date(version.versionedAt?.seconds ? version.versionedAt.seconds * 1000 : version.versionedAt).toLocaleString()}`,
      userId: user?.uid,
      userEmail: user?.email,
      userName: user?.fullName || user?.email,
      timestamp: serverTimestamp(),
    });
    
    setToastMsg('Module version restored successfully!');
    setShowToast(true);
  };

  useEffect(() => {
    const modulesQuery = query(collection(db, 'modules'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(
      modulesQuery,
      (snapshot) => {
        const remoteModules = snapshot.docs.map((moduleDoc) => fromFirestoreModule(moduleDoc.id, moduleDoc.data()));
        const remoteIds = new Set(remoteModules.map((module) => module.id));
        const seedModules = journeyModules.map(fromSeedModule).filter((module) => !remoteIds.has(module.id));
        const nextModules = [...remoteModules, ...seedModules];
        setModules(nextModules);

        // Docs real-time sync check: if edited by someone else, merge remote snapshot
        const currentRemote = remoteModules.find((m) => m.id === selectedModuleId);
        if (currentRemote && currentRemote.updatedBy && currentRemote.updatedBy !== user?.uid) {
          setDraft(currentRemote);
        }

        if (!isCreatingNew && !nextModules.some((module) => module.id === selectedModuleId)) {
          setSelectedModuleId(nextModules[0]?.id || '');
          setDraft(nextModules[0] || emptyModule);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'modules');
      },
    );

    return () => unsubscribe();
  }, [selectedModuleId, isCreatingNew, user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const rows = snapshot.docs.map((classDoc) => ({ id: classDoc.id, ...classDoc.data() }));
      setClasses(rows.filter((classItem: any) => (
        user.role === 'admin' ||
        classItem.instructorId === user.uid ||
        classItem.instructorEmail === user.email
      )));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'classes');
    });
    return () => unsubscribe();
  }, [user]);

  const selectedSubject = journeySubjects.find((subject) => subject.id === draft.subjectId) || journeySubjects[0];
  const activePart = draft.parts[Math.min(activePartIndex, Math.max(draft.parts.length - 1, 0))];

  const filteredModules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return modules.filter((module) => {
      // New: Filter by track and subject
      if (selectedTrackId && module.subjectId !== selectedTrackId) return false;
      if (selectedSubjectId && module.topicId !== selectedSubjectId) return false;

      if (moduleFilter === 'published' && !module.isPublished) return false;
      if (moduleFilter === 'published_public' && (!module.isPublished || module.publishScope !== 'public')) return false;
      if (moduleFilter === 'published_class' && (!module.isPublished || module.publishScope !== 'classes')) return false;
      if (moduleFilter === 'draft' && module.isPublished) return false;
      if (!term) return true;
      const subject = journeySubjects.find((item) => item.id === module.subjectId);
      const topic = subject?.topics.find((item) => item.id === module.topicId);
      return (
        module.title.toLowerCase().includes(term) ||
        module.description.toLowerCase().includes(term) ||
        subject?.title.toLowerCase().includes(term) ||
        topic?.title.toLowerCase().includes(term)
      );
    });
  }, [modules, searchTerm, moduleFilter, selectedTrackId, selectedSubjectId]);


  const updatePart = (patch: Partial<JourneyModulePart>, highlightField?: string) => {
    isLocalChangeRef.current = true;
    const highlightPath = highlightField ? `parts.${activePartIndex}.${highlightField}` : undefined;
    updateDraft('parts', draft.parts.map((part, index) => index === activePartIndex ? { ...part, ...patch } : part), highlightPath);
  };

  const updatePartAtIndex = (partIndex: number, patch: Partial<JourneyModulePart>, highlightField?: string) => {
    isLocalChangeRef.current = true;
    const highlightPath = highlightField ? `parts.${partIndex}.${highlightField}` : undefined;
    updateDraft('parts', draft.parts.map((part, index) => index === partIndex ? { ...part, ...patch } : part), highlightPath);
  };

  const updateMiniQuestionAtPart = (partIndex: number, patch: Partial<JourneyQuestion>, highlightField?: string) => {
    const part = draft.parts[partIndex];
    const currentQuestion = part?.miniQuiz?.[0] || blankQuestion(`${part?.id || `part-${partIndex + 1}`}-q1`);
    updatePartAtIndex(partIndex, { miniQuiz: [{ ...currentQuestion, ...patch }] }, highlightField ? `miniQuiz.${highlightField}` : undefined);
  };

  const updateMiniOptionAtPart = (partIndex: number, optionId: string, text: string) => {
    const part = draft.parts[partIndex];
    const currentQuestion = part?.miniQuiz?.[0] || blankQuestion(`${part?.id || `part-${partIndex + 1}`}-q1`);
    updateMiniQuestionAtPart(partIndex, {
      options: currentQuestion.options.map((option) => option.id === optionId ? { ...option, text } : option),
    }, `miniQuiz.option-${optionId}`);
  };

  const updatePartLessonBlock = (blockIndex: number, content: string) => {
    updatePart({
      lessonBlocks: activePart.lessonBlocks.map((block, index) => index === blockIndex ? { ...block, content } : block),
    }, `lessonBlocks.${blockIndex}.content`);
  };

  const updateMiniQuestion = (patch: Partial<JourneyQuestion>, highlightField?: string) => {
    const currentQuestion = activePart.miniQuiz[0] || blankQuestion(`${activePart.id}-q1`);
    updatePart({ miniQuiz: [{ ...currentQuestion, ...patch }] }, highlightField ? `miniQuiz.${highlightField}` : undefined);
  };

  const updateMiniOption = (optionId: string, text: string) => {
    const currentQuestion = activePart.miniQuiz[0] || blankQuestion(`${activePart.id}-q1`);
    updateMiniQuestion({
      options: currentQuestion.options.map((option) => option.id === optionId ? { ...option, text } : option),
    });
  };

  const updateFinalQuestion = (questionIndex: number, patch: Partial<JourneyQuestion>) => {
    updateDraft('finalExam', draft.finalExam.map((question, index) => index === questionIndex ? { ...question, ...patch } : question));
  };

  const updateFinalOption = (questionIndex: number, optionId: string, text: string) => {
    const question = draft.finalExam[questionIndex];
    updateFinalQuestion(questionIndex, {
      options: question.options.map((option) => option.id === optionId ? { ...option, text } : option),
    });
  };

  const selectModule = (module: BuilderModule) => {
    setIsCreatingNew(false);
    setSelectedModuleId(module.id);
    setDraft(module);
    setActiveStep('outline');
    setActivePartIndex(0);
    setBuilderMode('preview');
  };

  const createNewDraft = (options?: { silent?: boolean }) => {
    const topicId = selectedSubject.topics[0]?.id || journeySubjects[0].topics[0].id;
    const parts = [blankPart(0)];
    const finalExam = [blankQuestion('final-q1')];
    setIsCreatingNew(true);
    setSelectedModuleId('');
    setSearchTerm('');
    setDraft({ ...emptyModule, title: '', description: '', subjectId: selectedSubject.id, topicId, parts, finalExam, flowItems: buildDefaultFlow(parts, finalExam), isTemplate: false, templateSourceId: '' });
    setActiveStep('outline');
    setActivePartIndex(0);
    setBuilderMode('preview');
    if (!options?.silent) {
      setToastMsg('New module draft created. Fill Step 1, then save it.');
      setShowToast(true);
    }
  };

  const startStudioTour = () => {
    const topicId = selectedSubject.topics[0]?.id || journeySubjects[0].topics[0].id;
    const guidedParts: JourneyModulePart[] = [
      {
        ...blankPart(0),
        id: 'tour-part-1',
        title: 'Part 1: Set the reading purpose',
        objective: 'Identify exactly what a LET passage question is asking before reading.',
        textbookSection: {
          title: 'Communication Foundations: Reading for Purpose',
          body: 'A passage item becomes easier when the learner first names the task. Main idea questions ask for the controlling thought. Inference questions ask for a supported conclusion. Evidence questions ask which detail proves a claim.',
          estimatedReadMinutes: 8,
        },
        miniQuiz: [{
          ...blankQuestion('tour-part-1-q1'),
          stem: 'What should a learner identify first when answering a passage item?',
          correctOptionId: 'B',
          options: [
            { id: 'A', text: 'The longest answer' },
            { id: 'B', text: 'The exact task asked by the question' },
            { id: 'C', text: 'The most technical word' },
            { id: 'D', text: 'The final sentence only' },
          ],
          explanation: 'Knowing the task guides what evidence to look for in the passage.',
        }],
      },
      {
        ...blankPart(1),
        id: 'tour-part-2',
        title: 'Part 2: Check every option against evidence',
        objective: 'Use textual evidence to remove distractors before choosing an answer.',
        textbookSection: {
          title: 'Evidence Beats Familiarity',
          body: 'A choice may sound familiar but still fail if the passage does not support it. Strong readers return to the line, compare each option, and choose the answer with direct evidence.',
          estimatedReadMinutes: 7,
        },
      },
    ];
    const guidedExam = [
      {
        ...blankQuestion('tour-final-q1'),
        stem: 'Why should students compare each answer option with the passage evidence?',
        correctOptionId: 'C',
        options: [
          { id: 'A', text: 'It makes the test shorter' },
          { id: 'B', text: 'It removes the need to read' },
          { id: 'C', text: 'It helps reject attractive but unsupported choices' },
          { id: 'D', text: 'It guarantees every option is correct' },
        ],
      },
    ];

    setIsCreatingNew(true);
    setSelectedModuleId('');
    setModuleRailCollapsed(false);
    setAiOpen(false);
    setDraft({
      ...emptyModule,
      id: '',
      title: 'Guided Studio Practice Module',
      description: 'A guided draft used by the interactive tour to teach the Instructor Studio workflow.',
      subjectId: selectedSubject.id,
      topicId,
      parts: guidedParts,
      finalExam: guidedExam,
      flowItems: buildDefaultFlow(guidedParts, guidedExam),
      authorName: user?.fullName || user?.email || 'Instructor',
      authorEmail: user?.email || '',
    });
    setBuilderMode('preview');
    setActiveStep('parts');
    setActivePartIndex(0);
    setTourStep(0);
    setToastMsg('Interactive guide started with a safe practice draft.');
    setShowToast(true);
  };

  const goToTourStep = (nextStep: number | null) => {
    if (nextStep == null) {
      setTourStep(null);
      return;
    }
    setTourStep(nextStep);
    if (nextStep <= 1) {
      setModuleRailCollapsed(false);
    }
    if (nextStep >= 2 && nextStep <= 8) {
      setBuilderMode('preview');
      setModuleRailCollapsed(true);
    }
    if (nextStep === 9) {
      setAiOpen(true);
    }
    if (nextStep >= 10) {
      setBuilderMode('edit');
      setActiveStep('publish');
      setAiOpen(false);
    }
  };

  const addPart = () => {
    const nextParts = [...draft.parts, blankPart(draft.parts.length)];
    setDraft((current) => ({ ...current, parts: nextParts, flowItems: buildDefaultFlow(nextParts, current.finalExam) }));
    setActivePartIndex(nextParts.length - 1);
    setActiveStep('parts');
    setToastMsg('New module part added.');
    setShowToast(true);
  };

  const removePart = (indexToRemove: number) => {
    const nextParts = draft.parts.filter((_part, index) => index !== indexToRemove);
    const safeParts = nextParts.length ? nextParts : [blankPart(0)];
    setDraft((current) => ({ ...current, parts: safeParts, flowItems: buildDefaultFlow(safeParts, current.finalExam) }));
    setActivePartIndex(Math.max(0, indexToRemove - 1));
    setToastMsg('Module part removed.');
    setShowToast(true);
  };

  const requestRemovePart = (indexToRemove: number) => {
    setPendingPartDeleteIndex(indexToRemove);
    setDeleteTarget('part');
  };

  const addFinalQuestion = () => {
    updateDraft('finalExam', [...draft.finalExam, blankQuestion(`final-q${draft.finalExam.length + 1}`)]);
  };

  const reorderPart = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= draft.parts.length) return;
    const nextParts = [...draft.parts];
    const [movedPart] = nextParts.splice(fromIndex, 1);
    nextParts.splice(toIndex, 0, movedPart);
    setDraft((current) => ({ ...current, parts: nextParts }));
    setActivePartIndex(toIndex);
  };

  const duplicatePart = (partIndex: number) => {
    const source = draft.parts[partIndex] || blankPart(0);
    const copy: JourneyModulePart = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      title: `${source.title} copy`,
      miniQuiz: (source.miniQuiz || []).map((question, index) => ({ ...question, id: `${question.id}-copy-${Date.now()}-${index}` })),
    };
    const nextParts = [...draft.parts];
    nextParts.splice(partIndex + 1, 0, copy);
    setDraft((current) => ({ ...current, parts: nextParts, flowItems: buildDefaultFlow(nextParts, current.finalExam) }));
    setActivePartIndex(partIndex + 1);
  };

  const reorderFlowItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= draft.flowItems.length) return;
    const nextFlow = [...draft.flowItems];
    const [moved] = nextFlow.splice(fromIndex, 1);
    nextFlow.splice(toIndex, 0, moved);
    updateDraft('flowItems', nextFlow);
  };

  const resetFlowOrder = () => {
    updateDraft('flowItems', buildDefaultFlow(draft.parts, draft.finalExam));
  };

  const uploadSourceDocument = async (file: File) => {
    if (file.size > 18 * 1024 * 1024) {
      setToastMsg('Document is too large. Use a file under 18MB for now.');
      setShowToast(true);
      return;
    }

    setIsDrafting(true);
    try {
      const fileData = await fileToBase64(file);
      const response = await fetch('/api/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileData,
        }),
      });
      const data = await response.json();
      if (!data.success || !data.document) throw new Error(data.error || 'Document extraction failed');

      const documentMeta = data.document as SourceDocumentMeta;
      setDraft((current) => ({
        ...current,
        sourceDocument: documentMeta,
        sourceDocumentId: documentMeta.sourceDocumentId,
        sourceDocumentName: documentMeta.fileName,
        sourceConfidence: documentMeta.confidence,
        sourceReviewRequired: documentMeta.reviewRequired,
      }));
      setAssistantSource(formatSourceDocumentForPrompt(documentMeta));
      setAssistantPrompt((current) => current || `Convert ${file.name} into an editable LET learning module`);
      setAiOpen(true);
      setToastMsg(documentMeta.reviewRequired
        ? 'Document extracted. Review is required before publishing.'
        : 'Document extracted and ready for AI module drafting.');
      setShowToast(true);
    } catch (error) {
      console.warn('Document extraction failed', error);
      setToastMsg('Unable to extract this document. Try PDF, DOCX, PPTX, TXT, or Markdown.');
      setShowToast(true);
    } finally {
      setIsDrafting(false);
    }
  };

  const deleteModule = async () => {
    if (user?.role === 'instructor') {
      setToastMsg('Instructors are not permitted to delete tracks, subjects or modules.');
      setShowToast(true);
      return;
    }
    if (!draft.id || isCreatingNew) {
      createNewDraft();
      return;
    }
    if (journeyModules.some((module) => module.id === draft.id)) {
      setToastMsg('Preset sample modules cannot be deleted. Create or edit your own module instead.');
      setShowToast(true);
      return;
    }
    setDeleteTarget('module');
  };

  const confirmDeleteAction = async () => {
    try {
      setIsDeleting(true);
      if (deleteTarget === 'part' && pendingPartDeleteIndex != null) {
        removePart(pendingPartDeleteIndex);
        return;
      }
      if (deleteTarget === 'module' && draft.id) {
        await deleteDoc(doc(db, 'modules', draft.id));
        setToastMsg('Module deleted.');
        setShowToast(true);
        createNewDraft({ silent: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `modules/${draft.id}`);
      setToastMsg('Unable to delete. Please try again.');
      setShowToast(true);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setPendingPartDeleteIndex(null);
    }
  };

  const duplicateModule = () => {
    setDraft({
      ...draft,
      id: '',
      title: `${draft.title || 'Untitled module'} copy`,
      isPublished: false,
      isTemplate: false,
      templateSourceId: draft.id || draft.templateSourceId || '',
      parts: draft.parts.map((part, partIndex) => ({
        ...part,
        id: `part-${partIndex + 1}-${Date.now()}`,
        miniQuiz: (part.miniQuiz || []).map((question, questionIndex) => ({ ...question, id: `part-${partIndex + 1}-q${questionIndex + 1}-${Date.now()}` })),
      })),
      finalExam: draft.finalExam.map((question, index) => ({ ...question, id: `final-q${index + 1}-${Date.now()}` })),
    });
    setSelectedModuleId('');
    setIsCreatingNew(true);
    setBuilderMode('preview');
    setToastMsg('Module duplicated as an unpublished draft.');
    setShowToast(true);
  };

  const saveAsTemplate = async () => {
    const templateDraft = {
      ...draft,
      id: '',
      title: `${draft.title || 'Untitled'} template`,
      isPublished: false,
      isTemplate: true,
      templateSourceId: draft.id || draft.templateSourceId || '',
    };
    setDraft(templateDraft);
    setSelectedModuleId('');
    setIsCreatingNew(true);
    setToastMsg('Template draft prepared. Save it to store this reusable journey pattern.');
    setShowToast(true);
  };

  const generateAIDraft = async (promptOverride?: string) => {
    const prompt = promptOverride?.trim() || assistantPrompt.trim() || draft.title || 'LET review module';
    const sourceDocument = draft.sourceDocument || null;
    const sourceChunks = sourceDocument?.chunks || [];
    setIsDrafting(true);
    try {
      const response = await fetch('/api/course-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: prompt,
          sourceText: assistantSource,
          sourceDocument,
          sourceChunks,
          subject: selectedSubject.title,
          partCount: Math.max(2, draft.parts.length || 2),
        }),
      });
      const data = await response.json();
      if (!data.success || !data.module) throw new Error(data.error || 'AI course builder returned no module');
      const aiModule = data.module;

      const nextTitle = draft.title || prompt;
      setDraft((current) => ({
        ...current,
        title: current.title || aiModule.title || nextTitle,
        description: current.description || aiModule.description || `Guided module for ${prompt}.`,
        competencies: aiModule.competencies?.length ? aiModule.competencies : current.competencies,
        prerequisiteModuleIds: aiModule.prerequisiteTopics || current.prerequisiteModuleIds,
        examBlueprint: aiModule.examBlueprint || current.examBlueprint,
        sourceDocument: current.sourceDocument,
        sourceDocumentId: current.sourceDocumentId,
        sourceDocumentName: current.sourceDocumentName,
        sourceConfidence: current.sourceConfidence,
        sourceReviewRequired: current.sourceReviewRequired,
        parts: aiModule.parts?.length ? aiModule.parts.map((part: any, index: number) => groundAIPart(part, index, sourceDocument)) : current.parts,
        finalExam: aiModule.finalExam?.length ? aiModule.finalExam : current.finalExam,
      }));
      setToastMsg('AI Course Builder drafted a module. Review and approve by saving/publishing.');
    } catch (error) {
      console.warn('AI draft failed, using local template', error);
      setDraft((current) => ({
        ...current,
        title: current.title || prompt,
        description: current.description || `Guided module for ${prompt}.`,
        parts: [blankPart(0), blankPart(1)],
      }));
      setToastMsg('AI service unavailable. Added editable template instead.');
    } finally {
      setIsDrafting(false);
      setShowToast(true);
      setActiveStep('parts');
    }
  };

  const rewriteActiveReading = async (mode: 'proofread' | 'paraphrase', instructionOverride?: string) => {
    if (!activePart?.textbookSection?.body?.trim()) {
      setToastMsg('Add reading text first, then ask AI to improve it.');
      setShowToast(true);
      return;
    }

    setIsDrafting(true);
    try {
      const response = await fetch('/api/rewrite-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          text: activePart.textbookSection.body,
          instruction: instructionOverride || assistantPrompt,
        }),
      });
      const data = await response.json();
      if (!data.text) throw new Error(data.error || 'No rewritten text returned');
      updatePart({ textbookSection: { ...activePart.textbookSection, body: data.text } });
      setToastMsg(data.fallback
        ? (mode === 'proofread' ? 'Reading proofread locally while AI is unavailable.' : 'Reading paraphrased locally while AI is unavailable.')
        : (mode === 'proofread' ? 'Reading proofread by AI.' : 'Reading paraphrased by AI.'));
    } catch (error) {
      console.warn('AI rewrite failed', error);
      setToastMsg('AI rewrite unavailable. Try again later.');
    } finally {
      setIsDrafting(false);
      setShowToast(true);
    }
  };

  const saveModule = async () => {
    if (!draft.title.trim()) {
      setToastMsg('Module title is required');
      setShowToast(true);
      return;
    }

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      subjectId: draft.subjectId,
      categoryId: draft.subjectId,
      topicId: draft.topicId,
      level: draft.level,
      duration: draft.duration,
      isPublished: draft.isPublished,
      publishScope: draft.publishScope,
      classIds: draft.publishScope === 'classes' ? draft.classIds : [],
      dueAt: draft.dueAt || '',
      antiCheatEnabled: draft.antiCheatEnabled,
      recordFirstAttemptOnly: draft.recordFirstAttemptOnly,
      isTemplate: !!draft.isTemplate,
      templateSourceId: draft.templateSourceId || '',
      prerequisiteModuleIds: draft.prerequisiteModuleIds,
      competencies: draft.competencies,
      rubric: draft.rubric,
      unlockRules: draft.unlockRules,
      examBlueprint: {
        ...draft.examBlueprint,
        questionCount: draft.finalExam.length || draft.examBlueprint.questionCount,
      },
      certificateEnabled: draft.certificateEnabled,
      certificateTemplateId: draft.certificateTemplateId || '',
      certificateRequirementNote: draft.certificateRequirementNote || '',
      sourceDocument: draft.sourceDocument || null,
      sourceDocumentId: draft.sourceDocumentId || draft.sourceDocument?.sourceDocumentId || '',
      sourceDocumentName: draft.sourceDocumentName || draft.sourceDocument?.fileName || '',
      sourceConfidence: draft.sourceConfidence || draft.sourceDocument?.confidence || '',
      sourceReviewRequired: !!(draft.sourceReviewRequired || draft.sourceDocument?.reviewRequired),
      attemptPolicy: draft.attemptPolicy,
      flowItems: draft.flowItems,
      createdBy: user?.uid || 'instructor',
      authorId: user?.uid || 'instructor',
      authorName: user?.fullName || user?.email || 'Instructor',
      authorEmail: user?.email || '',
      updatedBy: user?.uid || '',
      updatedByEmail: user?.email || '',
      editHighlights: draft.editHighlights || {},
      parts: draft.parts,
      finalExam: draft.finalExam,
      lessonBlocks: draft.parts.flatMap((part) => part.lessonBlocks),
      resources: draft.flowItems.map((item) => ({ id: item.id, type: item.type === 'lesson' ? 'textbook' : item.type, title: item.title, meta: item.type === 'exam' ? `${draft.finalExam.length} items` : 'Studio sequence' })),
      updatedAt: serverTimestamp(),
    };

    try {
      let savedModuleId = draft.id;
      if (draft.id && !journeyModules.some((module) => module.id === draft.id)) {
        const moduleRef = doc(db, 'modules', draft.id);
        const previous = await getDoc(moduleRef);
        if (previous.exists()) {
          await addDoc(collection(db, 'contentVersions'), {
            contentType: 'module',
            contentId: draft.id,
            title: previous.data().title || draft.title,
            snapshot: previous.data(),
            changedBy: user?.uid || '',
            changedByEmail: user?.email || '',
            changedByName: user?.fullName || user?.email || 'Instructor',
            versionedAt: serverTimestamp(),
          });
        }
        await updateDoc(moduleRef, payload);
        setToastMsg('Module updated');
      } else {
        const newDoc = await addDoc(collection(db, 'modules'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        savedModuleId = newDoc.id;
        setSelectedModuleId(newDoc.id);
        setDraft((current) => ({ ...current, id: newDoc.id }));
        setIsCreatingNew(false);
        setToastMsg('Module created');
      }
      if (draft.isPublished && draft.publishScope === 'classes' && draft.classIds.length) {
        await Promise.all(draft.classIds.map(async (classId) => {
          const recipientIds = await getClassRecipientIds(classId);
          if (!recipientIds.length) return;
          await createNotification({
            title: `Module published: ${draft.title}`,
            body: `A module is available in your class journey${draft.dueAt ? ` and is due ${new Date(draft.dueAt).toLocaleString()}` : ''}.`,
            type: 'module_published',
            targetLink: `/quest?moduleId=${savedModuleId}`,
            recipientIds,
            classId,
            createdBy: user?.uid,
            createdByEmail: user?.email,
          });
        }));
      }
      setShowToast(true);
    } catch (error) {
      handleFirestoreError(error, draft.id ? OperationType.UPDATE : OperationType.CREATE, 'modules');
      setToastMsg('Unable to save module');
      setShowToast(true);
    }
  };

  const moduleStats = [
    { label: 'Modules', value: modules.length, icon: Layers3 },
    { label: 'Published', value: modules.filter((module) => module.isPublished).length, icon: CheckCircle2 },
    { label: 'Templates', value: modules.filter((module) => module.isTemplate).length, icon: Copy },
  ];

  return (
    <DashboardLayout title="Instructor Studio">
      <PublishModal 
        isOpen={isPublishModalOpen} 
        onClose={() => setIsPublishModalOpen(false)} 
        onPublish={handlePublish}
        module={draft}
      />
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full text-on-surface space-y-6">
        <section data-tour="studio-overview" className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Instructor Studio</p>
              <h1 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Design learning journeys, not upload folders.</h1>
              <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
                Create modules with textbook sections, quizzes, competencies, rubrics, unlock rules, blueprints, templates, and a student preview beside an AI course builder.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 min-w-full xl:min-w-[360px]">
              {moduleStats.map((stat) => (
                <div key={stat.label} className="bg-surface-container rounded-xl p-4 border border-outline-variant/40">
                  <stat.icon className="text-primary mb-2" size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{stat.label}</p>
                  <p className="text-2xl font-black text-on-surface mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`grid grid-cols-1 gap-6 transition-[grid-template-columns] duration-200 ${moduleRailCollapsed ? 'xl:grid-cols-[72px_1fr]' : 'xl:grid-cols-[320px_1fr]'}`}>
          <aside className="space-y-4">
            {moduleRailCollapsed ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-3 shadow-sm flex xl:flex-col items-center gap-3">
                <button
                  onClick={() => setModuleRailCollapsed(false)}
                  className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                  title="Expand modules"
                >
                  <PanelLeftOpen size={18} />
                </button>
                <button
                  onClick={() => createNewDraft()}
                  className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center"
                  title="Create module"
                >
                  <Plus size={18} />
                </button>
                <div className="hidden xl:flex min-h-[160px] items-center justify-center">
                  <p className="rotate-90 whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    {filteredModules.length} modules
                  </p>
                </div>
              </div>
            ) : (
              <div data-tour="module-rail" className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-extrabold text-lg">Modules</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setModuleRailCollapsed(true)} className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant border border-outline-variant/30 flex items-center justify-center" title="Collapse modules">
                      <PanelLeftClose size={18} />
                    </button>
                    <button onClick={() => createNewDraft()} className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center" title="Create module">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  <select 
                    value={selectedTrackId} 
                    onChange={e => { setSelectedTrackId(e.target.value); setSelectedSubjectId(''); }} 
                    className="bg-surface-container border border-outline-variant/30 rounded-xl py-2 px-3 text-xs font-bold outline-none text-on-surface"
                  >
                    <option value="">All Tracks</option>
                    {journeySubjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                  {selectedTrackId && (
                    <select 
                      value={selectedSubjectId} 
                      onChange={e => setSelectedSubjectId(e.target.value)} 
                      className="bg-surface-container border border-outline-variant/30 rounded-xl py-2 px-3 text-xs font-bold outline-none text-on-surface"
                    >
                      <option value="">All Subjects in Track</option>
                      {journeySubjects.find(s => s.id === selectedTrackId)?.topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                  )}
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search module, subject, topic"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 pl-10 pr-3 text-sm font-medium outline-none focus:border-primary/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 xl:grid-cols-5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'published', label: 'Published' },
                    { id: 'published_public', label: 'Public' },
                    { id: 'published_class', label: 'Class' },
                    { id: 'draft', label: 'Drafts' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setModuleFilter(filter.id as typeof moduleFilter)}
                      className={`rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest border ${
                        moduleFilter === filter.id ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {!selectedModuleId && (
                    <button className="w-full text-left rounded-xl border p-4 transition-all border-primary bg-primary/10">
                      <p className="font-extrabold text-on-surface leading-tight">{draft.title || 'Blank new module'}</p>
                      <p className="text-[11px] text-on-surface-variant/60 mt-1 line-clamp-2">Unsaved blank module / Step 1 ready</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">Fill the outline, parts, quizzes, then save</p>
                    </button>
                  )}
                  {filteredModules.map((module) => {
                    const subject = journeySubjects.find((item) => item.id === module.subjectId);
                    const topic = subject?.topics.find((item) => item.id === module.topicId);
                    const isSelected = selectedModuleId === module.id;

                    return (
                      <button
                        key={module.id}
                        onClick={() => selectModule(module)}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface-container/30 hover:border-primary/40'
                        }`}
                      >
                        <p className="font-extrabold text-on-surface leading-tight">{module.title}</p>
                        <p className="text-[11px] text-on-surface-variant/60 mt-1 line-clamp-2">{subject?.title || 'Subject'} / {topic?.title || 'Topic'}</p>
                        <p className="text-[11px] text-on-surface-variant/50 mt-1 line-clamp-1">Author: {module.authorName || 'Instructor'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-2">
                          {module.parts.length} parts / {module.finalExam.length} exam items / {module.isPublished ? `Published ${module.publishScope === 'classes' ? 'to class' : 'public'}` : 'Draft'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>

          <main data-tour="studio-workspace" className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[85vh] relative">
            {/* COLLABORATIVE HEADER / TOP BAR (Google Docs style) */}
            <div className="border-b border-outline-variant bg-surface-container-lowest p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-primary/10 text-primary p-2 rounded-xl">
                  <FileQuestion size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft('title', e.target.value, 'title')}
                      className="text-lg font-black font-headline text-on-surface bg-transparent focus:outline-none focus:bg-surface-container/30 rounded px-2 py-0.5 border-b border-transparent focus:border-primary/40 min-w-[200px]"
                      placeholder="Name this module..."
                    />
                    
                    {/* AUTO-SAVE STATUS CHROME */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container border border-outline-variant/40">
                      {autoSaveStatus === 'saved' && (
                        <>
                          <Cloud size={13} className="text-emerald-500" />
                          <span className="text-on-surface-variant/70 text-[10px]">Saved to Cloud</span>
                        </>
                      )}
                      {autoSaveStatus === 'saving' && (
                        <>
                          <span className="w-2 h-2 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                          <span className="text-primary text-[10px]">Saving...</span>
                        </>
                      )}
                      {autoSaveStatus === 'error' && (
                        <>
                          <CloudOff size={13} className="text-error" />
                          <span className="text-error text-[10px]">Offline / Retrying</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant/70 ml-2">
                    {selectedSubject?.title || 'No Subject'} • {draft.duration || 'Study course'}
                  </p>
                </div>
              </div>

              {/* LIVE ACTIVE EDITORS ICON TRAY & TOOLBAR CONTROLS */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Active Editors Overlapping Avatars (Google Docs Presence) */}
                {activeEditors.length > 0 && (
                  <div className="flex items-center -space-x-2 mr-2">
                    {activeEditors.map((editor, i) => {
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                      let sum = 0;
                      const email = editor.userEmail || '';
                      for (let charIndex = 0; charIndex < email.length; charIndex++) {
                        sum += email.charCodeAt(charIndex);
                      }
                      const color = colors[sum % colors.length];
                      const isMe = editor.userId === user?.uid;

                      return (
                        <div
                          key={editor.userId}
                          className="relative group cursor-pointer"
                          onClick={() => {
                            setToastMsg(`Collaborator: ${editor.userName} is online editing right now.`);
                            setShowToast(true);
                          }}
                        >
                          <div className={`w-8 h-8 rounded-full ${color} text-white font-extrabold text-[11px] flex items-center justify-center border-2 border-surface-container-lowest shadow-sm hover:scale-110 transition-transform`}>
                            {editor.avatarInitials}
                          </div>
                          
                          {/* Rich Google Docs hover card */}
                          <div className="absolute right-0 top-9 bg-surface text-on-surface text-xs rounded-xl p-3 shadow-xl border border-outline-variant/50 hidden group-hover:block z-30 min-w-[200px]">
                            <p className="font-extrabold">{editor.userName} {isMe && '(You)'}</p>
                            <p className="text-[10px] text-on-surface-variant line-clamp-1">{editor.userEmail}</p>
                            <div className="flex items-center gap-1 mt-2 text-[9px] text-primary font-black uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                              Active now
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SIMPIFIED VIEW VS ORIGINAL STATS TAB SELECTOR */}
                <div className="flex rounded-xl bg-surface-container p-0.5 border border-outline-variant/30 text-xs font-semibold">
                  <button
                    onClick={() => { setStudioLayoutMode('docs'); setBuilderMode('edit'); }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      studioLayoutMode === 'docs' && builderMode === 'edit' ? 'bg-surface-container-lowest text-primary font-black shadow-sm' : 'text-on-surface-variant'
                    }`}
                  >
                    <BookOpen size={14} />
                    Docs View
                  </button>
                  <button
                    onClick={() => { setStudioLayoutMode('multistep'); setBuilderMode('edit'); }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      studioLayoutMode === 'multistep' && builderMode === 'edit' ? 'bg-surface-container-lowest text-primary font-black shadow-sm' : 'text-on-surface-variant'
                    }`}
                  >
                    <Layers3 size={14} />
                    Multistep Tab
                  </button>
                </div>

                {/* VERSION HISTORY BUTTON WITH LOG BADGE */}
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className={`w-10 h-10 rounded-xl relative flex items-center justify-center border transition-colors ${
                    historyOpen ? 'bg-primary/15 text-primary border-primary/30' : 'bg-surface-container border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                  }`}
                  title="Version history"
                >
                  <Clock size={18} />
                  {versions.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-on-primary font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-sm scale-90">
                      {versions.length}
                    </span>
                  )}
                </button>

                {/* UNDO/REDO */}
                <div className="flex gap-1">
                  <button onClick={undo} disabled={past.length === 0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-lowest text-on-surface-variant disabled:opacity-30" title="Undo">
                    <Undo2 size={16} />
                  </button>
                  <button onClick={redo} disabled={future.length === 0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-lowest text-on-surface-variant disabled:opacity-30" title="Redo">
                    <Redo2 size={16} />
                  </button>
                </div>

                {/* SAVE STATUS */}
                <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant">
                  {autoSaveStatus === 'saved' && <><Check size={12} className="text-emerald-500" /> Saved</>}
                  {autoSaveStatus === 'saving' && <><Clock size={12} className="animate-spin text-amber-500" /> Saving...</>}
                  {autoSaveStatus === 'error' && <><X size={12} className="text-error" /> Error</>}
                </div>

                {/* PUBLISH */}
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 hover:shadow-lg transition-all"
                >
                  <Sparkles size={14} />
                  Publish
                </button>

                {/* ORIGINAL TOOLBAR ATTEMPTS AND ACTIONS */}
                <div className="h-6 w-px bg-outline-variant/40" />

                <button
                  onClick={() => setBuilderMode(builderMode === 'preview' ? 'edit' : 'preview')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold text-xs border transition-colors ${
                    builderMode === 'preview' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface border-outline-variant/40'
                  }`}
                >
                  <Eye size={14} />
                  Playground mode
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={deleteModule}
                    className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center border border-error/20 hover:bg-error/15"
                    title="Delete module"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* LIVE MODULE COLLABORATION EDITORS BANNER */}
            {activeEditors.filter(e => e.userId !== user?.uid).length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex items-center gap-2 text-amber-800">
                <Users size={14} className="animate-bounce" />
                <span>
                  Others are currently editing: <strong>{activeEditors.filter(e => e.userId !== user?.uid).map(e => e.userName).join(', ')}</strong>. Edits sync in real-time.
                </span>
              </div>
            )}

            {/* VERSION HISTORY DRAW SIDEBAR & RESTORES */}
            {historyOpen && (
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface border-l border-outline-variant z-40 p-4 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <h3 className="font-extrabold text-sm">Version History</h3>
                  </div>
                  <button onClick={() => setHistoryOpen(false)} className="text-on-surface-variant/60 hover:text-on-surface p-1 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
                
                <p className="text-[11px] text-on-surface-variant/70 mb-4 leading-relaxed">
                  Go back to explore previously saved drafts and roll back edits gracefully. Clicking "Restore" will apply that version instantly.
                </p>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {versions.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-on-surface-variant/60">No history snapshots recorded yet.</p>
                      <p className="text-[10px] text-on-surface-variant/40 mt-1">Make changes or wait for autosave snapshots to populate.</p>
                    </div>
                  ) : (
                    versions.map((version) => {
                      const versionDate = version.versionedAt?.seconds 
                        ? new Date(version.versionedAt.seconds * 1000) 
                        : new Date(version.versionedAt || Date.now());

                      return (
                        <div key={version.id} className="bg-surface-container rounded-xl p-3 border border-outline-variant/30 space-y-2 hover:border-primary/20 transition-all">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-extrabold text-on-surface line-clamp-1">{version.title || 'Saved module snapshot'}</p>
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{versionDate.toLocaleString()}</p>
                            </div>
                            <span className="bg-primary/10 text-primary font-black text-[9px] px-2 py-0.5 rounded-full scale-90 select-none">
                              v{versions.length - versions.indexOf(version)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant-60">
                            <span className="w-4 h-4 rounded-full bg-primary text-on-primary font-black text-[8px] flex items-center justify-center uppercase">
                              {(version.changedByName || 'I')[0]}
                            </span>
                            <span className="truncate">{version.changedByName || 'Instructor'}</span>
                          </div>

                          <div className="flex items-center gap-1 pt-1.5 border-t border-outline-variant/20">
                            <button
                              onClick={() => restoreVersion(version)}
                              className="text-xs font-black text-primary hover:underline flex items-center gap-1 w-full justify-center bg-primary/10 hover:bg-primary/15 py-1 rounded-lg"
                            >
                              Restore this version
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* PRIMARY BODY CONTAINER */}
            <div className="flex-1 overflow-y-auto bg-surface-container/25">
              {/* STUDENT PLAYING SIMULATOR PLAYGROUND */}
              {builderMode === 'preview' && (
                <div className="p-5">
                  <ModuleStudentPreview
                    draft={draft}
                    updateDraft={updateDraft}
                    updatePartAtIndex={updatePartAtIndex}
                    updateMiniQuestionAtPart={updateMiniQuestionAtPart}
                    updateMiniOptionAtPart={updateMiniOptionAtPart}
                    updateFinalQuestion={updateFinalQuestion}
                    updateFinalOption={updateFinalOption}
                    reorderFlowItem={reorderFlowItem}
                    resetFlowOrder={resetFlowOrder}
                    onSave={saveModule}
                    onOpenAI={() => setAiOpen(true)}
                    tourStep={tourStep}
                  />
                </div>
              )}

              {/* SIMPLIFIED GOOGLE DOCS WORKSPACE MODE */}
              {builderMode === 'edit' && studioLayoutMode === 'docs' && (
                <div className="flex flex-col lg:flex-row h-full min-h-[75vh]">
                  {/* Google Docs Outline Left Side Panel */}
                  <aside className="w-full lg:w-64 bg-surface border-r border-outline-variant p-4 space-y-6 select-none shrink-0 hidden lg:block sticky top-0 self-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Document Outline</p>
                      <p className="text-xs text-on-surface-variant/60">Smooth-scroll to specific sections of your workbook.</p>
                    </div>
                    
                    <nav className="space-y-1">
                      {[
                        { id: 'docs-cover', label: '1. Cover Outline' },
                        { id: 'docs-meta', label: '2. Taxonomy & Track' },
                        { id: 'docs-parts', label: '3. Lesson Readings' },
                        { id: 'docs-quizzes', label: '4. Checkpoint Quizzes' },
                        { id: 'docs-exam', label: '5. Final Exam Blueprint' },
                        { id: 'docs-blueprint', label: '6. Quality Blueprint' },
                        { id: 'docs-settings', label: '7. Lock Rules & Badges' },
                        { id: 'notes-instructor', label: '8. Author Settings' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const dom = document.getElementById(item.id);
                            if (dom) dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="w-full text-left text-xs font-semibold px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>

                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 text-xs text-primary leading-relaxed">
                      💡 <strong>Tip:</strong> Any changes save instantly to our Cloud Database. Collaborative edits show faint amber markers.
                    </div>
                  </aside>

                  {/* Active Centered Paper Editor Layout */}
                  <div className="flex-1 p-4 md:p-8">
                    <div id="docs-editor-container" className="bg-white text-slate-800 shadow-xl border border-neutral-200/55 rounded-xl p-6 md:p-12 max-w-4xl mx-auto space-y-12 min-h-[900px] leading-relaxed relative">
                      
                      {/* HIGHLIGHT RENDERER HELPERS */}
                      {(() => {
                        const getHighlight = (path: string) => {
                          const h = draft.editHighlights?.[path];
                          if (!h || h.updatedBy === user?.uid) return null;
                          return h;
                        };

                        const borderClass = (path: string) => {
                          const h = getHighlight(path);
                          if (!h) return '';
                          return 'border-amber-400/80 bg-amber-50/20 ring-1 ring-amber-300';
                        };

                        const highlightBadge = (path: string) => {
                          const h = getHighlight(path);
                          if (!h) return null;
                          return (
                            <div className="absolute right-2 -top-2 bg-amber-500 text-white font-black uppercase text-[8px] tracking-wider px-1.5 py-0.5 rounded-md shadow-sm z-10 pointer-events-none">
                              ✏️ {h.name}
                            </div>
                          );
                        };

                        return (
                          <>
                            {/* Section 1: COVER COVER OUTLINE */}
                            <section id="docs-cover" className="space-y-4 pt-4 border-b border-outline-variant/20 pb-8">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">1. Cover Header</span>
                              
                              <div className="relative group space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Document Main Title</label>
                                <input
                                  type="text"
                                  value={draft.title}
                                  onChange={(e) => updateDraft('title', e.target.value, 'title')}
                                  className={`w-full text-3xl font-extrabold text-slate-900 border-none outline-none focus:bg-slate-50 p-2 rounded-lg leading-tight ${borderClass('title')}`}
                                  placeholder="Untitled Module Title"
                                />
                                {highlightBadge('title')}
                              </div>

                              <div className="relative group space-y-1 pt-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Document Description & Abstract</label>
                                <textarea
                                  value={draft.description}
                                  onChange={(e) => updateDraft('description', e.target.value, 'description')}
                                  rows={3}
                                  className={`w-full text-slate-600 font-medium text-sm border-none outline-none focus:bg-slate-50 p-2 rounded-lg leading-relaxed ${borderClass('description')}`}
                                  placeholder="Write a clear module description summarizing lesson objectives, contents, coverage, and review targets..."
                                />
                                {highlightBadge('description')}
                              </div>
                            </section>

                            {/* Section 2: TAXONOMY & CODES */}
                            <section id="docs-meta" className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-outline-variant/20 pb-8 pt-4">
                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full block w-fit">2. Subject Category</span>
                                <p className="text-xs text-slate-500 mt-1">Assign module to major subject path</p>
                                <select
                                  value={draft.subjectId}
                                  onChange={(e) => updateDraft('subjectId', e.target.value, 'subjectId')}
                                  className="w-full font-bold bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 outline-none focus:border-primary/50"
                                >
                                  {journeySubjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.title}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full block w-fit">Estimated Study Duration</span>
                                <p className="text-xs text-slate-500 mt-1">Time expected for student completion</p>
                                <input
                                  type="text"
                                  value={draft.duration}
                                  onChange={(e) => updateDraft('duration', e.target.value, 'duration')}
                                  className="w-full font-bold bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 outline-none focus:border-primary/50"
                                  placeholder="e.g. 45 min"
                                />
                              </div>
                            </section>

                            {/* Section 3: PARTS READING */}
                            <section id="docs-parts" className="space-y-8 border-b border-outline-variant/20 pb-8 pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">3. Lesson textbook content</span>
                                  <p className="text-xs text-slate-500 mt-1.5">Core textbook sections containing key knowledge concepts</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={addPart}
                                  className="rounded-xl px-3 py-1.5 text-xs font-black bg-primary text-on-primary flex items-center gap-1.5 shadow-sm"
                                >
                                  <Plus size={14} /> Add Part
                                </button>
                              </div>

                              <div className="space-y-8 mt-4">
                                {draft.parts.map((p, partIndex) => (
                                  <div key={p.id || partIndex} className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <p className="font-extrabold text-sm text-slate-800">Part {partIndex + 1}: Lesson Module Content</p>
                                      {draft.parts.length > 1 && (
                                        <button
                                          onClick={() => requestRemovePart(partIndex)}
                                          className="text-error/80 hover:text-error text-xs font-bold"
                                        >
                                          Remove Part
                                        </button>
                                      )}
                                    </div>

                                    {/* Part Title */}
                                    <div className="relative group space-y-1">
                                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block">Part Header Title</label>
                                      <input
                                        type="text"
                                        value={p.title}
                                        onChange={(e) => {
                                          const up = [...draft.parts];
                                          up[partIndex].title = e.target.value;
                                          updateDraft('parts', up, `parts.${partIndex}.title`);
                                        }}
                                        className={`w-full bg-white border border-slate-200 text-slate-800 font-extrabold text-xs rounded-xl p-2 px-3 outline-none focus:border-primary/50 ${borderClass(`parts.${partIndex}.title`)}`}
                                      />
                                      {highlightBadge(`parts.${partIndex}.title`)}
                                    </div>

                                    {/* Textbook Reading Material */}
                                    <div className="relative group space-y-1">
                                      <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block">Concept & Study Material Textbook section</label>
                                      <textarea
                                        value={p.textbookSection?.body || p.lessonBlocks?.[0]?.content || ''}
                                        onChange={(e) => {
                                          const up = [...draft.parts];
                                          
                                          // Update both data formats to keep backend robust
                                          if (up[partIndex].textbookSection) {
                                            up[partIndex].textbookSection.body = e.target.value;
                                          } else {
                                            up[partIndex].textbookSection = {
                                              title: p.title + ' Reading',
                                              body: e.target.value,
                                              estimatedReadMinutes: 5
                                            };
                                          }
                                          if (up[partIndex].lessonBlocks?.[0]) {
                                            up[partIndex].lessonBlocks[0].content = e.target.value;
                                          } else {
                                            up[partIndex].lessonBlocks = [{ type: 'text' as const, content: e.target.value }];
                                          }
                                          
                                          updateDraft('parts', up, `parts.${partIndex}.textbookBody`);
                                        }}
                                        rows={8}
                                        className={`w-full bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-xl p-3 outline-none focus:border-primary/50 leading-relaxed font-mono ${borderClass(`parts.${partIndex}.textbookBody`)}`}
                                        placeholder="Paste or write detailed curriculum lectures, topics review, or explanations here..."
                                      />
                                      {highlightBadge(`parts.${partIndex}.textbookBody`)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>

                            {/* Section 4: CHECKPOINT QUIZZES */}
                            <section id="docs-quizzes" className="space-y-6 border-b border-outline-variant/20 pb-8 pt-4">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">4. Checkpoint quizzes</span>
                                <p className="text-xs text-slate-500 mt-1.5">Single formative assessment test item at end of each learning part</p>
                              </div>

                              <div className="space-y-6 mt-4">
                                {draft.parts.map((p, partIndex) => {
                                  const quiz = p.miniQuiz?.[0] || blankQuestion(`${p.id || `part-${partIndex + 1}`}-q1`);
                                  
                                  return (
                                    <div key={p.id || partIndex} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-200/50 space-y-4">
                                      <p className="font-extrabold text-xs text-slate-600">Checkpoint Quiz {partIndex + 1} (End of Part {partIndex + 1})</p>
                                      
                                      {/* Quiz Stem */}
                                      <div className="relative group space-y-1">
                                        <label className="text-xs text-slate-500 font-semibold block">Question Stem</label>
                                        <input
                                          type="text"
                                          value={quiz.stem}
                                          onChange={(e) => {
                                            const up = [...draft.parts];
                                            const subQuiz = { ...quiz, stem: e.target.value };
                                            up[partIndex].miniQuiz = [subQuiz];
                                            updateDraft('parts', up, `parts.${partIndex}.miniQuiz.stem`);
                                          }}
                                          className={`w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 outline-none focus:border-primary/50 ${borderClass(`parts.${partIndex}.miniQuiz.stem`)}`}
                                        />
                                        {highlightBadge(`parts.${partIndex}.miniQuiz.stem`)}
                                      </div>

                                      {/* Choices Option list */}
                                      <div className="space-y-2 pt-1 border-t border-slate-100">
                                        <label className="text-xs text-slate-500 font-semibold block">Answer Options & Correct Answer Selected</label>
                                        {quiz.options.map((opt) => (
                                          <div key={opt.id} className="flex items-center gap-2">
                                            <button
                                              onClick={() => {
                                                const up = [...draft.parts];
                                                const subQuiz = { ...quiz, correctOptionId: opt.id };
                                                up[partIndex].miniQuiz = [subQuiz];
                                                updateDraft('parts', up, `parts.${partIndex}.miniQuiz.correctOptionId`);
                                              }}
                                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                                                quiz.correctOptionId === opt.id
                                                  ? 'bg-primary text-on-primary'
                                                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                              }`}
                                            >
                                              {opt.id.toUpperCase()}
                                            </button>
                                            
                                            <div className="relative group flex-1">
                                              <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => {
                                                  const up = [...draft.parts];
                                                  const nextQuiz = {
                                                    ...quiz,
                                                    options: quiz.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o)
                                                  };
                                                  up[partIndex].miniQuiz = [nextQuiz];
                                                  updateDraft('parts', up, `parts.${partIndex}.miniQuiz.option-${opt.id}`);
                                                }}
                                                className={`w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2 outline-none focus:border-primary/50 ${borderClass(`parts.${partIndex}.miniQuiz.option-${opt.id}`)}`}
                                              />
                                              {highlightBadge(`parts.${partIndex}.miniQuiz.option-${opt.id}`)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Rationalization */}
                                      <div className="relative group space-y-1">
                                        <label className="text-xs text-slate-500 font-semibold block">Answer Rationalization & Explanation</label>
                                        <textarea
                                          value={quiz.explanation || ''}
                                          onChange={(e) => {
                                            const up = [...draft.parts];
                                            const subQuiz = { ...quiz, explanation: e.target.value };
                                            up[partIndex].miniQuiz = [subQuiz];
                                            updateDraft('parts', up, `parts.${partIndex}.miniQuiz.explanation`);
                                          }}
                                          rows={2}
                                          className={`w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 outline-none focus:border-primary/50 ${borderClass(`parts.${partIndex}.miniQuiz.explanation`)}`}
                                          placeholder="Explain why the chosen correct key A-D is correct and outline why details differ..."
                                        />
                                        {highlightBadge(`parts.${partIndex}.miniQuiz.explanation`)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </section>

                            {/* Section 5: FINAL MODULE EXAM BLUEPRINT */}
                            <section id="docs-exam" className="space-y-6 border-b border-outline-variant/20 pb-8 pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">5. Final Module exam builder</span>
                                  <p className="text-xs text-slate-500 mt-1.5">Summative final test to unlock the subject completion certificate</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={addFinalQuestion}
                                  className="rounded-xl px-3 py-1.5 text-xs font-black bg-primary text-on-primary flex items-center gap-1.5 shadow-sm"
                                >
                                  <Plus size={14} /> Add Exam Question
                                </button>
                              </div>

                              <div className="space-y-6 mt-4">
                                {draft.finalExam.map((quiz, quizIndex) => (
                                  <div key={quiz.id || quizIndex} className="bg-slate-50/40 rounded-2xl p-5 border border-slate-200 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200/55 pb-2">
                                      <p className="font-extrabold text-xs text-slate-700">Exam Question Item #{quizIndex + 1}</p>
                                      {draft.finalExam.length > 2 && (
                                        <button
                                          onClick={() => {
                                            const nextExam = draft.finalExam.filter((_, idx) => idx !== quizIndex);
                                            updateDraft('finalExam', nextExam);
                                          }}
                                          className="text-error/80 hover:text-error text-[10px] font-black uppercase"
                                        >
                                          Delete Question
                                        </button>
                                      )}
                                    </div>

                                    {/* Question stem */}
                                    <div className="relative group space-y-1">
                                      <label className="text-xs text-slate-500 font-semibold block">Stem</label>
                                      <input
                                        type="text"
                                        value={quiz.stem}
                                        onChange={(e) => {
                                          const next = [...draft.finalExam];
                                          next[quizIndex].stem = e.target.value;
                                          updateDraft('finalExam', next, `finalExam.${quizIndex}.stem`);
                                        }}
                                        className={`w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 outline-none focus:border-primary/50 ${borderClass(`finalExam.${quizIndex}.stem`)}`}
                                      />
                                      {highlightBadge(`finalExam.${quizIndex}.stem`)}
                                    </div>

                                    {/* Exam Choice option items A-D */}
                                    <div className="space-y-2">
                                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Choices Options</label>
                                      {quiz.options.map((opt) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                          <button
                                            onClick={() => {
                                              const next = [...draft.finalExam];
                                              next[quizIndex].correctOptionId = opt.id;
                                              updateDraft('finalExam', next, `finalExam.${quizIndex}.correctOptionId`);
                                            }}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                                              quiz.correctOptionId === opt.id
                                                ? 'bg-primary text-on-primary font-black shadow-inner'
                                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                          >
                                            {opt.id.toUpperCase()}
                                          </button>
                                          <div className="relative group flex-1">
                                            <input
                                              type="text"
                                              value={opt.text}
                                              onChange={(e) => {
                                                const next = [...draft.finalExam];
                                                next[quizIndex].options = next[quizIndex].options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o);
                                                updateDraft('finalExam', next, `finalExam.${quizIndex}.option-${opt.id}`);
                                              }}
                                              className={`w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl p-2 outline-none focus:border-primary/50 ${borderClass(`finalExam.${quizIndex}.option-${opt.id}`)}`}
                                            />
                                            {highlightBadge(`finalExam.${quizIndex}.option-${opt.id}`)}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* rationalization */}
                                    <div className="relative group space-y-1">
                                      <label className="text-xs text-slate-500 font-semibold block">Explanation & Rationale info</label>
                                      <textarea
                                        value={quiz.explanation || ''}
                                        onChange={(e) => {
                                          const next = [...draft.finalExam];
                                          next[quizIndex].explanation = e.target.value;
                                          updateDraft('finalExam', next, `finalExam.${quizIndex}.explanation`);
                                        }}
                                        className={`w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 outline-none focus:border-primary/50 ${borderClass(`finalExam.${quizIndex}.explanation`)}`}
                                        rows={2}
                                        placeholder="Outline rationalization checkpoints..."
                                      />
                                      {highlightBadge(`finalExam.${quizIndex}.explanation`)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>

                            {/* Section 6: QUALITY DISTRIBUTION AND BLUEPRINT CHROME */}
                            <section id="docs-blueprint" className="space-y-4 border-b border-outline-variant/20 pb-8 pt-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">6. Core Quality Blueprint Specs</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-50 rounded-xl p-4 border border-outline-variant/30 space-y-1">
                                  <p className="text-xs font-bold text-slate-600">Question Volume count</p>
                                  <p className="text-slate-900 font-headline font-black text-xl leading-none">{draft.finalExam.length} assessment items</p>
                                  <p className="text-[10px] text-slate-500 mt-1">Sourced in this active session workbook.</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4 border border-outline-variant/30 space-y-1">
                                  <p className="text-xs font-bold text-slate-600">Distribution metrics</p>
                                  <p className="text-slate-900 font-headline font-black text-xl leading-none">Complete Coverage</p>
                                  <p className="text-[10px] text-slate-500 mt-1">Matches the global core LET Board review tracks.</p>
                                </div>
                              </div>
                            </section>

                            {/* Section 7: GRADING, UNLOCK RULES, AND BADGES */}
                            <section id="docs-settings" className="space-y-6 pt-4 border-b border-outline-variant/20 pb-8">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full block w-fit">7. Grading, unlock Rules & badges settings</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600 tracking-wide block">Passing Assessment Threshold Percentage</label>
                                  <input
                                    type="number"
                                    value={draft.unlockRules?.minScorePercent || 75}
                                    onChange={(e) => updateDraft('unlockRules', { ...draft.unlockRules, minScorePercent: Number(e.target.value) }, 'unlockRules.minScorePercent')}
                                    className="w-full font-bold bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 outline-none focus:border-primary/50"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-slate-600 block">Certificate distribution state</p>
                                  <label className="flex items-center gap-2 pt-3 text-xs font-semibold text-slate-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={draft.certificateEnabled}
                                      onChange={(e) => updateDraft('certificateEnabled', e.target.checked, 'certificateEnabled')}
                                      className="rounded text-primary border-slate-300 focus:ring-primary focus:ring-opacity-20"
                                    />
                                    <span>Award fully generated certificate on success</span>
                                  </label>
                                </div>
                              </div>
                            </section>

                            {/* Section 8: NOTES FOR THE AUTHOR */}
                            <section id="notes-instructor" className="pt-4 space-y-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full block w-fit">8. Author Settings</span>
                              <div className="bg-slate-50 p-4 rounded-xl border border-outline-variant/30 text-xs">
                                <p className="font-semibold text-slate-700">Document authored by: <span className="text-slate-900 font-extrabold">{draft.authorName || 'No creator'}</span></p>
                                {draft.authorEmail && <p className="text-[10px] text-slate-500 mt-1">Author email: {draft.authorEmail}</p>}
                                <p className="text-[10px] text-slate-500 mt-2">To publish this module to student dashboard classes, navigate to 'Lock Rules & Badges' and choose enrollment criteria.</p>
                              </div>
                            </section>
                          </>
                        );
                      })()}

                    </div>
                  </div>
                </div>
              )}

              {/* ORIGINAL RECTANGLE TAB LAYOUT SWITCHER */}
              {builderMode === 'edit' && studioLayoutMode === 'multistep' && (
                <div className="p-5 md:p-6 space-y-6">
                  {activeStep === 'outline' && (
                    <OutlineStep draft={draft} selectedSubject={selectedSubject} updateDraft={updateDraft} />
                  )}

                  {activeStep === 'parts' && (
                    <PartsStep
                      draft={draft}
                      activePartIndex={activePartIndex}
                      setActivePartIndex={setActivePartIndex}
                      activePart={activePart}
                      updatePart={updatePart}
                      updatePartLessonBlock={updatePartLessonBlock}
                      addPart={addPart}
                      removePart={removePart}
                      requestRemovePart={requestRemovePart}
                      reorderPart={reorderPart}
                      duplicatePart={duplicatePart}
                    />
                  )}

                  {activeStep === 'assessments' && (
                    <AssessmentsStep
                      draft={draft}
                      activePartIndex={activePartIndex}
                      setActivePartIndex={setActivePartIndex}
                      activePart={activePart}
                      updateMiniQuestion={updateMiniQuestion}
                      updateMiniOption={updateMiniOption}
                      updateFinalQuestion={updateFinalQuestion}
                      updateFinalOption={updateFinalOption}
                      addFinalQuestion={addFinalQuestion}
                    />
                  )}

                  {activeStep === 'design' && (
                    <LearningDesignStep draft={draft} updateDraft={updateDraft} />
                  )}

                  {activeStep === 'publish' && (
                    <PublishStep draft={draft} classes={classes} updateDraft={updateDraft} saveModule={saveModule} />
                  )}
                </div>
              )}
            </div>
          </main>
        </section>
      </div>

      <Toast
        isVisible={showToast}
        message={toastMsg}
        onClose={() => setShowToast(false)}
        type={toastMsg.includes('Unable') || toastMsg.includes('required') ? 'error' : 'success'}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setPendingPartDeleteIndex(null);
        }}
        onConfirm={confirmDeleteAction}
        title={deleteTarget === 'module' ? 'Delete module?' : 'Remove this part?'}
        message={deleteTarget === 'module'
          ? `This will remove "${draft.title || 'this module'}" from assigned classes and student journeys.`
          : 'This removes the selected learning part, its reading, mini lesson, quiz, and flow item.'}
        isDeleting={isDeleting}
      />

      {tourStep != null && (
        <StudioTourOverlay
          step={tourStep}
          onBack={() => goToTourStep(Math.max(0, tourStep - 1))}
          onNext={() => {
            const nextStep = tourStep + 1;
            goToTourStep(nextStep > studioTourSteps.length - 1 ? null : nextStep);
          }}
          onClose={() => goToTourStep(null)}
        />
      )}

      <FloatingAIHelper
        isOpen={aiOpen}
        setIsOpen={setAiOpen}
        prompt={assistantPrompt}
        setPrompt={setAssistantPrompt}
        sourceText={assistantSource}
        setSourceText={setAssistantSource}
        isWorking={isDrafting}
        onUploadDocument={uploadSourceDocument}
        onDraft={generateAIDraft}
        onProofread={(instruction) => rewriteActiveReading('proofread', instruction)}
        onParaphrase={(instruction) => rewriteActiveReading('paraphrase', instruction)}
      />
    </DashboardLayout>
  );
}

const studioTourSteps = [
  {
    icon: ClipboardList,
    title: 'Practice draft created',
    body: 'The guide starts with a safe unpublished module so you can learn the Studio without touching a real class module.',
    target: 'studio-overview',
  },
  {
    icon: Layers3,
    title: 'Module library',
    body: 'This rail is where instructors pick an existing module, filter drafts or published modules, and create a blank module.',
    target: 'module-rail',
  },
  {
    icon: Eye,
    title: 'Student view first',
    body: 'Student view is the default authoring surface. It keeps the lesson flow and live simulator connected while you edit.',
    target: 'student-preview',
  },
  {
    icon: GripVertical,
    title: 'Drag the learning flow',
    body: 'The focused workspace opens now. Drag these real flow cards to reorder what learners see: textbook, lesson, quiz, activity, and final exam.',
    target: 'focused-flow-rail',
  },
  {
    icon: Settings2,
    title: 'Change a selected card',
    body: 'Click a card like Mini Quiz and its own menu appears. Change it to text content, lesson, activity, final exam, or remove it from the flow.',
    target: 'flow-card-type-menu',
  },
  {
    icon: BookOpen,
    title: 'Edit textbook content',
    body: 'This card edits the actual student-facing title, reading text, read time, and video or Canva link for the selected part.',
    target: 'text-content-card',
  },
  {
    icon: FileQuestion,
    title: 'Edit the mini quiz',
    body: 'Mini quizzes live beside the reading part. Edit the stem, answer choices, key terms, and feedback without leaving the focused workspace.',
    target: 'mini-quiz-card',
  },
  {
    icon: FileQuestion,
    title: 'Switch question type',
    body: 'The guide changes this mini quiz to an essay once, then highlights the question type menu. Instructors can choose multiple choice, true/false, enumeration, short answer, or essay.',
    target: 'question-type-select',
  },
  {
    icon: Trophy,
    title: 'Final exam editor',
    body: 'Final exam questions are edited with the same controls, but they gate completion and should cover the whole module.',
    target: 'final-exam-card',
  },
  {
    icon: Bot,
    title: 'AI helper chat',
    body: 'The helper can proofread, paraphrase, fix grammar, upload old modules, and draft course sections. It proposes; the instructor approves.',
    target: 'ai-helper-panel',
  },
  {
    icon: CheckCircle2,
    title: 'Publish with rules',
    body: 'Pick public or class release, due dates, attempt rules, certificate settings, and save only when the module is ready.',
    target: 'publish-settings',
  },
  {
    icon: Save,
    title: 'Save changes',
    body: 'Saving stores the editable draft or published update. The module remains instructor-controlled until it is explicitly published.',
    target: 'save-module-button',
  },
] as const;

function StudioTourOverlay({
  step,
  onBack,
  onNext,
  onClose,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const current = studioTourSteps[step] || studioTourSteps[0];
  const Icon = current.icon;
  const isLast = step >= studioTourSteps.length - 1;
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    let frame = 0;
    let timeout = 0;
    let retries = 0;
    const findTarget = () => {
      const elements = Array.from(document.querySelectorAll(`[data-tour="${current.target}"]`)) as HTMLElement[];
      const visible = elements.filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      });
      return (
        visible.find((element) => element.closest('[data-tour-scope="focused-studio"]')) ||
        visible[0] ||
        null
      );
    };
    const measure = () => {
      const element = findTarget();
      if (!element) {
        if (retries < 8) {
          retries += 1;
          timeout = window.setTimeout(measure, 140);
          return;
        }
        setRect(null);
        return;
      }
      element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      timeout = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => setRect(element.getBoundingClientRect()));
      }, 260);
    };
    measure();
    const handleUpdate = () => {
      const element = findTarget();
      setRect(element ? element.getBoundingClientRect() : null);
    };
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [current.target]);

  const highlight = rect
    ? {
        left: Math.max(8, rect.left - 8),
        top: Math.max(8, rect.top - 8),
        width: Math.min(window.innerWidth - 16, rect.width + 16),
        height: Math.min(window.innerHeight - 16, rect.height + 16),
      }
    : null;
  const cardWidth = 380;
  const cardTop = rect
    ? (rect.bottom + 18 + 280 < window.innerHeight ? rect.bottom + 18 : Math.max(20, rect.top - 300))
    : undefined;
  const cardLeft = rect
    ? (
        rect.right + 18 + cardWidth < window.innerWidth
          ? rect.right + 18
          : Math.min(window.innerWidth - cardWidth - 20, Math.max(20, rect.left))
      )
    : undefined;

  return (
    <>
      {highlight && (
        <div
          className="pointer-events-none fixed z-[94] rounded-2xl border-2 border-primary bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.62),0_18px_50px_rgba(15,23,42,0.35)]"
          style={highlight}
        />
      )}
      <div
        className="fixed z-[95] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-2xl"
        style={rect ? { top: cardTop, left: cardLeft } : { bottom: 24, left: 24 }}
      >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Interactive Studio Guide {step + 1}/{studioTourSteps.length}</p>
          <h3 className="mt-1 font-headline text-lg font-black text-on-surface">{current.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{current.body}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button onClick={onClose} className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container">Close</button>
        <div className="flex items-center gap-2">
          <button disabled={step === 0} onClick={onBack} className="rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs font-black uppercase tracking-widest text-on-surface disabled:opacity-40">Back</button>
          <button onClick={onNext} className="rounded-xl bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-on-primary">{isLast ? 'Finish' : 'Next'}</button>
        </div>
      </div>
      </div>
    </>
  );
}

function OutlineStep({
  draft,
  selectedSubject,
  updateDraft,
}: {
  draft: BuilderModule;
  selectedSubject: typeof journeySubjects[number];
  updateDraft: (field: keyof BuilderModule, value: any) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionTitle icon={BookOpen} title="Step 1: Outline the module" body="Start with where this module belongs and what learners should master." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Field label="Module title">
          <input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="e.g. Constructive Alignment" className="input" />
        </Field>
        <Field label="Duration">
          <input value={draft.duration} onChange={(event) => updateDraft('duration', event.target.value)} placeholder="e.g. 45 min" className="input" />
        </Field>
        <Field label="Subject">
          <select value={draft.subjectId} onChange={(event) => updateDraft('subjectId', event.target.value)} className="input font-bold">
            {journeySubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
          </select>
        </Field>
        <Field label="Topic">
          <select value={draft.topicId} onChange={(event) => updateDraft('topicId', event.target.value)} className="input font-bold">
            {selectedSubject.topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
          </select>
        </Field>
        <Field label="Level">
          <input type="number" min={1} max={10} value={draft.level} onChange={(event) => updateDraft('level', Number(event.target.value))} className="input" />
        </Field>
      </div>
      <Field label="Student-facing description">
        <textarea value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} rows={4} placeholder="What will the learner master in this module?" className="input resize-none" />
      </Field>
    </div>
  );
}

function ModuleStudentPreview({
  draft,
  updateDraft,
  updatePartAtIndex,
  updateMiniQuestionAtPart,
  updateMiniOptionAtPart,
  updateFinalQuestion,
  updateFinalOption,
  reorderFlowItem,
  resetFlowOrder,
  onSave,
  onOpenAI,
  tourStep,
}: {
  draft: BuilderModule;
  updateDraft: (field: keyof BuilderModule, value: any) => void;
  updatePartAtIndex: (partIndex: number, patch: Partial<JourneyModulePart>) => void;
  updateMiniQuestionAtPart: (partIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateMiniOptionAtPart: (partIndex: number, optionId: string, text: string) => void;
  updateFinalQuestion: (questionIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateFinalOption: (questionIndex: number, optionId: string, text: string) => void;
  reorderFlowItem: (fromIndex: number, toIndex: number) => void;
  resetFlowOrder: () => void;
  onSave: () => void;
  onOpenAI: () => void;
  tourStep: number | null;
}) {
  const [dragFlowIndex, setDragFlowIndex] = useState<number | null>(null);
  const [activeFlowItemId, setActiveFlowItemId] = useState(draft.flowItems[0]?.id || '');
  const [device, setDevice] = useState<SimulatorDevice>('laptop');
  const [showSimulator, setShowSimulator] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const appliedTourSteps = useRef(new Set<number>());

  useEffect(() => {
    if (!draft.flowItems.length) return;
    if (!draft.flowItems.some((item) => item.id === activeFlowItemId)) {
      setActiveFlowItemId(draft.flowItems[0].id);
    }
  }, [activeFlowItemId, draft.flowItems]);

  const activeFlowIndex = Math.max(0, draft.flowItems.findIndex((item) => item.id === activeFlowItemId));
  const activeItem = draft.flowItems[activeFlowIndex] || draft.flowItems[0];
  const resolvedPartIndex = activeItem?.refId === 'finalExam' ? -1 : draft.parts.findIndex((part) => part.id === activeItem?.refId);
  const activePartIndex = resolvedPartIndex >= 0 ? resolvedPartIndex : 0;
  const activePart = draft.parts[activePartIndex] || blankPart(0);

  useEffect(() => {
    if (tourStep == null) return;
    if (tourStep >= 3 && tourStep <= 8) setIsFocusOpen(true);
    if (tourStep >= 9) setIsFocusOpen(false);
    if (tourStep === 4 || tourStep === 5) {
      const textbook = draft.flowItems.find((item) => item.type === 'textbook');
      if (textbook) setActiveFlowItemId(textbook.id);
    }
    if (tourStep === 6 || tourStep === 7) {
      const quiz = draft.flowItems.find((item) => item.type === 'quiz');
      if (quiz) setActiveFlowItemId(quiz.id);
    }
    if (tourStep === 8) {
      const exam = draft.flowItems.find((item) => item.type === 'exam');
      if (exam) setActiveFlowItemId(exam.id);
    }
    if (tourStep === 7 && !appliedTourSteps.current.has(tourStep)) {
      appliedTourSteps.current.add(tourStep);
      const quiz = draft.flowItems.find((item) => item.type === 'quiz');
      const quizPartIndex = Math.max(0, draft.parts.findIndex((part) => part.id === quiz?.refId));
      const quizPart = draft.parts[quizPartIndex];
      const question = quizPart?.miniQuiz?.[0];
      if (question && question.type !== 'essay') {
        updateMiniQuestionAtPart(quizPartIndex, patchForQuestionType(question, 'essay'));
      }
    }
  }, [draft.flowItems, draft.parts, tourStep, updateMiniQuestionAtPart]);

  const updatePartForFlowType = (partIndex: number, type: FlowItem['type']) => {
    if (type === 'exam') return;
    const part = draft.parts[partIndex];
    if (!part) return;
    const patch: Partial<JourneyModulePart> = {};
    if (type === 'quiz' && (!part.miniQuiz || part.miniQuiz.length === 0)) {
      patch.miniQuiz = [blankQuestion(`${part.id}-q1`)];
    }
    if (type === 'activity' && !part.activity?.prompt) {
      patch.activity = { title: 'Practice activity', prompt: 'Describe what students should submit or reflect on for this part.' };
    }
    if (type === 'lesson' && (!part.lessonBlocks || part.lessonBlocks.length === 0)) {
      patch.lessonBlocks = blankPart(partIndex).lessonBlocks;
    }
    if (Object.keys(patch).length) updatePartAtIndex(partIndex, patch);
  };

  const changeActiveFlowType = (type: FlowItem['type']) => {
    if (!activeItem) return;
    const targetPartIndex = activeItem.refId === 'finalExam' ? activePartIndex : Math.max(0, draft.parts.findIndex((part) => part.id === activeItem.refId));
    const targetPart = draft.parts[targetPartIndex] || activePart;
    if (type !== 'exam') updatePartForFlowType(targetPartIndex, type);
    const nextFlow = draft.flowItems
      .filter((item) => type !== 'exam' || item.type !== 'exam' || item.id === activeItem.id)
      .map((item) => item.id === activeItem.id ? {
        ...item,
        type,
        refId: type === 'exam' ? 'finalExam' : targetPart.id,
        title: getFlowTitle(type, targetPart, targetPartIndex, draft.finalExam.length || 1),
      } : item);
    if (!nextFlow.some((item) => item.type === 'exam')) {
      nextFlow.push({ id: 'final-exam', type: 'exam', refId: 'finalExam', title: getFlowTitle('exam', targetPart, targetPartIndex, draft.finalExam.length || 1) });
    }
    updateDraft('flowItems', nextFlow);
  };

  const removeFlowItem = (itemId: string) => {
    const item = draft.flowItems.find((flowItem) => flowItem.id === itemId);
    if (!item || item.type === 'exam') return;
    const itemIndex = draft.flowItems.findIndex((flowItem) => flowItem.id === itemId);
    const nextFlow = draft.flowItems.filter((flowItem) => flowItem.id !== itemId);
    updateDraft('flowItems', nextFlow);
    setActiveFlowItemId(nextFlow[Math.max(0, itemIndex - 1)]?.id || nextFlow[0]?.id || '');
  };

  if (!draft.flowItems.length) {
    return (
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container/30 p-6 text-center">
        <p className="font-headline text-xl font-extrabold text-on-surface">No student flow yet</p>
        <p className="mt-2 text-sm text-on-surface-variant">Add at least one part to generate the student simulator.</p>
      </div>
    );
  }

  return (
    <div data-tour="student-preview" className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
      <div className="flex flex-col gap-3 border-b border-outline-variant/40 bg-surface-container-lowest p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live editor + student simulator</p>
          <h3 className="font-headline text-xl font-extrabold text-on-surface">{draft.title || 'Untitled module'}</h3>
          <p className="mt-1 text-xs text-on-surface-variant">Edit the module in the top workspace and watch the student view update below.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSimulator((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface"
          >
            {showSimulator ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSimulator ? 'Hide simulator' : 'Show simulator'}
          </button>
          <button onClick={() => setIsFocusOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface">
            <Maximize2 size={16} />
            Focus simulator
          </button>
          <button onClick={resetFlowOrder} className="rounded-xl border border-outline-variant/40 bg-surface-container px-4 py-2.5 text-xs font-black uppercase tracking-widest text-on-surface-variant">
            Reset flow
          </button>
        </div>
      </div>

      <section className="grid min-h-[620px] grid-cols-1 xl:grid-cols-[280px_1fr]">
        <aside className="border-b border-outline-variant/40 bg-surface-container/40 xl:border-b-0 xl:border-r">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest px-4 py-3">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Student flow</p>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Drag to reorder</span>
          </div>
          <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
            {draft.flowItems.map((item, index) => {
              const isActive = item.id === activeItem?.id;
              return (
                <button
                  key={item.id}
                  draggable
                  onClick={() => setActiveFlowItemId(item.id)}
                  onDragStart={() => setDragFlowIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragFlowIndex != null) reorderFlowItem(dragFlowIndex, index);
                    setDragFlowIndex(null);
                    setActiveFlowItemId(item.id);
                  }}
                  className={`flex w-full cursor-grab items-start gap-3 rounded-xl border p-3 text-left shadow-sm transition-colors active:cursor-grabbing ${
                    isActive
                      ? 'border-primary bg-primary/10 text-on-surface ring-1 ring-primary/30'
                      : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
                  }`}
                >
                  <GripVertical size={15} className={isActive ? 'mt-1 shrink-0 text-primary' : 'mt-1 shrink-0 text-on-surface-variant/40'} />
                  <span className="min-w-0">
                    <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                      {index + 1}. {item.type}
                    </span>
                    <span className="line-clamp-2 text-sm font-extrabold text-on-surface">{item.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <LiveFlowEditor
            draft={draft}
            activeItem={activeItem}
            activeItemIndex={activeFlowIndex}
            activePart={activePart}
            activePartIndex={activePartIndex}
            updateDraft={updateDraft}
            updatePartAtIndex={updatePartAtIndex}
            updateMiniQuestionAtPart={updateMiniQuestionAtPart}
            updateMiniOptionAtPart={updateMiniOptionAtPart}
            updateFinalQuestion={updateFinalQuestion}
            updateFinalOption={updateFinalOption}
          />
        </div>
      </section>

      {showSimulator ? (
        <section className="border-t-4 border-primary/15 bg-surface">
          <div className="flex flex-col gap-3 bg-slate-900 px-4 py-3 text-slate-200 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Live preview
              </span>
              <span className="text-sm font-bold text-slate-300">Student View Simulator</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl bg-slate-800 p-1">
                {([
                  ['wide', Monitor, 'Wide'],
                  ['laptop', Monitor, 'Laptop'],
                  ['ipad', Tablet, 'iPad'],
                  ['phone', Smartphone, 'Phone'],
                ] as const).map(([mode, Icon, label]) => (
                  <button
                    key={mode}
                    onClick={() => setDevice(mode)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold ${device === mode ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                    title={`${label} preview`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSimulator(false)} className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white">
                <Minimize2 size={14} />
                Minimize
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-surface p-4 sm:p-6 lg:p-8">
            <StudentSimulatorFrame
              draft={draft}
              activeItem={activeItem}
              activePart={activePart}
              activePartIndex={activePartIndex}
              flowItems={draft.flowItems}
              activeItemIndex={activeFlowIndex}
              device={device}
            />
          </div>
        </section>
      ) : (
        <button
          onClick={() => setShowSimulator(true)}
          className="flex w-full items-center justify-between border-t border-outline-variant/40 bg-slate-900 px-4 py-3 text-left text-sm font-bold text-slate-200"
        >
          <span className="inline-flex items-center gap-2">
            <Eye size={16} />
            Student simulator minimized
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Show preview</span>
        </button>
      )}

      {isFocusOpen && (
        <FocusedSimulatorOverlay
          draft={draft}
          activeItem={activeItem}
          activeItemIndex={activeFlowIndex}
          activePart={activePart}
          activePartIndex={activePartIndex}
          flowItems={draft.flowItems}
          onClose={() => setIsFocusOpen(false)}
          onSelectFlowItem={setActiveFlowItemId}
          onReorderFlowItem={reorderFlowItem}
          onChangeFlowItemType={changeActiveFlowType}
          onRemoveFlowItem={removeFlowItem}
          onSave={onSave}
          onOpenAI={onOpenAI}
          updateDraft={updateDraft}
          updatePartAtIndex={updatePartAtIndex}
          updateMiniQuestionAtPart={updateMiniQuestionAtPart}
          updateMiniOptionAtPart={updateMiniOptionAtPart}
          updateFinalQuestion={updateFinalQuestion}
          updateFinalOption={updateFinalOption}
        />
      )}
    </div>
  );
}

function LiveFlowEditor({
  draft,
  activeItem,
  activeItemIndex,
  activePart,
  activePartIndex,
  updateDraft,
  updatePartAtIndex,
  updateMiniQuestionAtPart,
  updateMiniOptionAtPart,
  updateFinalQuestion,
  updateFinalOption,
}: {
  draft: BuilderModule;
  activeItem: FlowItem;
  activeItemIndex: number;
  activePart: JourneyModulePart;
  activePartIndex: number;
  updateDraft: (field: keyof BuilderModule, value: any) => void;
  updatePartAtIndex: (partIndex: number, patch: Partial<JourneyModulePart>) => void;
  updateMiniQuestionAtPart: (partIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateMiniOptionAtPart: (partIndex: number, optionId: string, text: string) => void;
  updateFinalQuestion: (questionIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateFinalOption: (questionIndex: number, optionId: string, text: string) => void;
}) {
  const isExam = activeItem.type === 'exam';

  return (
    <div className="max-h-[720px] overflow-y-auto bg-surface p-5 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 border-b border-outline-variant/30 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              {activeItemIndex + 1}. {activeItem.type} live edit
            </p>
            <h3 className="mt-2 font-headline text-2xl font-extrabold text-on-surface">
              {isExam ? 'Final module exam' : activePart.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="rounded-full bg-surface-container px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              Student-facing
            </span>
            <MoreVertical size={18} />
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50">Module header</p>
          <input
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
            placeholder="Untitled module"
            className="mt-2 w-full border-0 border-b border-transparent bg-transparent p-0 font-headline text-2xl font-extrabold text-on-surface outline-none focus:border-primary/40 focus:ring-0"
          />
          <textarea
            value={draft.description}
            onChange={(event) => updateDraft('description', event.target.value)}
            rows={2}
            placeholder="Student-facing description"
            className="mt-3 w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface-variant outline-none focus:border-primary/40"
          />
        </div>

        {isExam ? (
          <FinalExamLiveEditor
            questions={draft.finalExam}
            updateFinalQuestion={updateFinalQuestion}
            updateFinalOption={updateFinalOption}
            variant="split"
          />
        ) : (
          <PartLiveEditorCards
            part={activePart}
            partIndex={activePartIndex}
            activeItem={activeItem}
            updatePartAtIndex={updatePartAtIndex}
            updateMiniQuestionAtPart={updateMiniQuestionAtPart}
            updateMiniOptionAtPart={updateMiniOptionAtPart}
            variant="split"
          />
        )}
      </div>
    </div>
  );
}

function PartLiveEditorCards({
  part,
  partIndex,
  activeItem,
  updatePartAtIndex,
  updateMiniQuestionAtPart,
  updateMiniOptionAtPart,
  variant,
}: {
  part: JourneyModulePart;
  partIndex: number;
  activeItem: FlowItem;
  updatePartAtIndex: (partIndex: number, patch: Partial<JourneyModulePart>) => void;
  updateMiniQuestionAtPart: (partIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateMiniOptionAtPart: (partIndex: number, optionId: string, text: string) => void;
  variant: 'split' | 'focus';
}) {
  const question = part.miniQuiz[0] || blankQuestion(`${part.id}-live`);
  const updatePart = (patch: Partial<JourneyModulePart>) => updatePartAtIndex(partIndex, patch);
  const updateTextbook = (patch: Partial<JourneyModulePart['textbookSection']>) => {
    updatePart({ textbookSection: { ...part.textbookSection, ...patch } });
  };
  const cardTone = variant === 'focus' ? 'rounded-xl' : 'rounded-2xl';

  return (
    <div className="space-y-8">
      <LiveEditorCard
        icon={<Target size={17} className="text-primary" />}
        title="Learning Objective"
        className={cardTone}
        tourId="objective-card"
      >
        <textarea
          value={part.objective}
          onChange={(event) => updatePart({ objective: event.target.value })}
          rows={2}
          className="w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-4 text-base font-medium leading-relaxed text-on-surface outline-none focus:border-primary/40"
        />
      </LiveEditorCard>

      <LiveEditorCard
        icon={<BookOpen size={17} className="text-primary" />}
        title="Text Content"
        meta={activeItem.type === 'textbook' || activeItem.type === 'lesson' ? 'Editing current flow item' : undefined}
        className={cardTone}
        tourId="text-content-card"
      >
        <input
          value={part.title}
          onChange={(event) => updatePart({ title: event.target.value })}
          className="w-full border-0 border-b border-transparent bg-transparent p-0 text-xl font-extrabold text-on-surface outline-none focus:border-primary/40 focus:ring-0"
        />
        <input
          value={part.textbookSection.title}
          onChange={(event) => updateTextbook({ title: event.target.value })}
          className="mt-5 w-full border-0 border-b border-transparent bg-transparent p-0 text-base font-extrabold text-on-surface outline-none focus:border-primary/40 focus:ring-0"
        />
        <textarea
          value={part.textbookSection.body}
          onChange={(event) => updateTextbook({ body: event.target.value })}
          rows={variant === 'focus' ? 6 : 5}
          className="mt-4 w-full resize-y rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-4 text-sm leading-relaxed text-on-surface-variant outline-none focus:border-primary/40"
        />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px]">
          <input
            value={part.textbookSection.mediaUrl || ''}
            onChange={(event) => updateTextbook({ mediaUrl: event.target.value })}
            placeholder="Video or Canva embed link"
            className="rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium outline-none focus:border-primary/40"
          />
          <input
            type="number"
            min={1}
            value={part.textbookSection.estimatedReadMinutes}
            onChange={(event) => updateTextbook({ estimatedReadMinutes: Number(event.target.value) })}
            className="rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-bold outline-none focus:border-primary/40"
            aria-label="Estimated read minutes"
          />
        </div>
      </LiveEditorCard>

      {activeItem.type === 'activity' && (
        <LiveEditorCard icon={<ClipboardList size={17} className="text-primary" />} title="Activity" className={cardTone}>
          <input
            value={part.activity?.title || ''}
            onChange={(event) => updatePart({ activity: { title: event.target.value, prompt: part.activity?.prompt || '' } })}
            placeholder="Activity title"
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-bold outline-none focus:border-primary/40"
          />
          <textarea
            value={part.activity?.prompt || ''}
            onChange={(event) => updatePart({ activity: { title: part.activity?.title || 'Practice activity', prompt: event.target.value } })}
            rows={4}
            placeholder="What should students do?"
            className="mt-3 w-full resize-y rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary/40"
          />
        </LiveEditorCard>
      )}

      <LiveEditorCard
        icon={<FileQuestion size={17} className="text-primary" />}
        title="Mini Quiz"
        meta={question.type?.replace('_', ' ') || 'multiple choice'}
        className={cardTone}
        tourId="mini-quiz-card"
      >
        <QuestionLiveEditor
          question={question}
          onQuestion={(patch) => updateMiniQuestionAtPart(partIndex, patch)}
          onOption={(optionId, text) => updateMiniOptionAtPart(partIndex, optionId, text)}
        />
      </LiveEditorCard>
    </div>
  );
}

function LiveEditorCard({
  icon,
  title,
  meta,
  className = 'rounded-2xl',
  tourId,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  meta?: string;
  className?: string;
  tourId?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-tour={tourId} className={`${className} overflow-hidden border border-outline-variant/40 bg-surface-container-lowest shadow-sm`}>
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container/40 px-5 py-4">
        <h4 className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
          {icon}
          {title}
        </h4>
        <div className="flex items-center gap-3 text-xs font-medium capitalize text-on-surface-variant">
          {meta && <span>{meta}</span>}
          <MoreVertical size={16} className="text-on-surface-variant/60" />
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function QuestionLiveEditor({
  question,
  onQuestion,
  onOption,
}: {
  question: JourneyQuestion;
  onQuestion: (patch: Partial<JourneyQuestion>) => void;
  onOption: (optionId: string, text: string) => void;
}) {
  const questionType = question.type || 'multiple_choice';

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Question type</span>
        <select
          data-tour="question-type-select"
          value={questionType}
          onChange={(event) => onQuestion(patchForQuestionType(question, event.target.value as JourneyQuestion['type']))}
          className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-primary/40"
        >
          <option value="multiple_choice">Multiple choice</option>
          <option value="true_false">True / False</option>
          <option value="enumeration">Enumeration</option>
          <option value="short_answer">Short answer</option>
          <option value="essay">Essay</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Question</span>
        <textarea
          value={question.stem}
          onChange={(event) => onQuestion({ stem: event.target.value })}
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-bold text-on-surface outline-none focus:border-primary/40"
        />
      </label>

      {isChoiceEditorQuestion(question) ? (
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Options</p>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {(question.options || []).map((option) => {
              const isCorrect = question.correctOptionId === option.id;
              return (
                <label key={option.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${isCorrect ? 'border-primary bg-primary/10 ring-1 ring-primary/30' : 'border-outline-variant/30 bg-surface-container'}`}>
                  <input
                    type="radio"
                    checked={isCorrect}
                    onChange={() => onQuestion({ correctOptionId: option.id })}
                    className="h-4 w-4 accent-primary"
                  />
                  <input
                    value={option.text}
                    onChange={(event) => onOption(option.id, event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-on-surface outline-none focus:ring-0"
                  />
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Expected answer / rubric</span>
            <textarea
              value={question.expectedAnswer || ''}
              onChange={(event) => onQuestion({ expectedAnswer: event.target.value })}
              rows={4}
              className="mt-2 w-full resize-y rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Accepted answers / key terms</span>
            <textarea
              value={(question.acceptedAnswers || []).join('\n')}
              onChange={(event) => onQuestion({ acceptedAnswers: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}
              rows={4}
              placeholder="One accepted answer or key term per line"
              className="mt-2 w-full resize-y rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary/40"
            />
          </label>
        </div>
      )}

      <label className="block">
        <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Rationale shown after answer</span>
        <textarea
          value={question.explanation}
          onChange={(event) => onQuestion({ explanation: event.target.value })}
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium text-on-surface-variant outline-none focus:border-primary/40"
        />
      </label>
    </div>
  );
}

function FinalExamLiveEditor({
  questions,
  updateFinalQuestion,
  updateFinalOption,
  variant,
}: {
  questions: JourneyQuestion[];
  updateFinalQuestion: (questionIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateFinalOption: (questionIndex: number, optionId: string, text: string) => void;
  variant: 'split' | 'focus';
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Final exam blueprint</p>
        <p className="mt-1 text-sm text-on-surface-variant">These questions gate module completion and should cover all important parts.</p>
      </div>
      {questions.map((question, questionIndex) => (
        <LiveEditorCard
          key={question.id}
          icon={<FileQuestion size={17} className="text-primary" />}
          title={`Final exam question ${questionIndex + 1}`}
          meta={question.difficulty || 'medium'}
          className={variant === 'focus' ? 'rounded-xl' : 'rounded-2xl'}
          tourId={questionIndex === 0 ? 'final-exam-card' : undefined}
        >
          <QuestionLiveEditor
            question={question}
            onQuestion={(patch) => updateFinalQuestion(questionIndex, patch)}
            onOption={(optionId, text) => updateFinalOption(questionIndex, optionId, text)}
          />
        </LiveEditorCard>
      ))}
    </div>
  );
}

function StudentSimulatorFrame({
  draft,
  activeItem,
  activePart,
  activePartIndex,
  flowItems,
  activeItemIndex,
  device,
}: {
  draft: BuilderModule;
  activeItem: FlowItem;
  activePart: JourneyModulePart;
  activePartIndex: number;
  flowItems: FlowItem[];
  activeItemIndex: number;
  device: SimulatorDevice;
}) {
  const widthClass = {
    wide: 'max-w-[1380px]',
    laptop: 'max-w-[1120px]',
    ipad: 'w-[760px] max-w-[86vw]',
    phone: 'w-[390px] max-w-[78vw]',
  }[device];
  const isPhone = device === 'phone';
  const frameScaleClass = device === 'phone' ? 'scale-[0.82] sm:scale-[0.88]' : device === 'ipad' ? 'scale-[0.9] xl:scale-100' : '';
  const shell = device === 'phone' ? 'android' : device === 'ipad' ? 'ios' : 'windows';
  const isTouchShell = shell === 'ios' || shell === 'android';
  const progressPercent = Math.min(100, Math.round(((activeItemIndex + 1) / Math.max(flowItems.length, 1)) * 100));
  const quiz = activePart.miniQuiz[0] || blankQuestion(`${activePart.id}-simulator`);
  const subtitle = activeItem.type === 'exam'
    ? 'Final module exam'
    : `${activeItem.type === 'textbook' ? 'Textbook' : activeItem.type === 'lesson' ? 'Lesson' : activeItem.type === 'quiz' ? 'Mini quiz' : 'Activity'} ${activePartIndex + 1}`;

  return (
    <div className={`mx-auto origin-top transition-all duration-200 ${widthClass} ${frameScaleClass}`}>
      <div className={`${isTouchShell ? 'rounded-[2rem] bg-slate-950 p-2 shadow-2xl shadow-slate-400/40' : 'rounded-2xl border border-slate-300 bg-white shadow-2xl shadow-slate-300/40 dark:border-outline-variant dark:bg-surface-container-lowest dark:shadow-black/30'} overflow-hidden`}>
        <div className={`${isTouchShell ? 'rounded-[1.5rem] overflow-hidden bg-surface dark:bg-surface' : 'bg-surface-container-lowest'}`}>
          <div className={`${isTouchShell ? 'bg-slate-950 px-5 py-3 text-white' : shell === 'windows' ? 'bg-slate-900 px-4 py-3 text-slate-200' : 'border-b border-slate-200 bg-slate-50 px-5 py-3 text-slate-500'} flex items-center gap-3`}>
            {shell === 'windows' && <span className="h-3 w-3 rounded-sm bg-primary" />}
            {isTouchShell && <div className="mx-auto h-1.5 w-20 rounded-full bg-white/30" />}
            {!isTouchShell && (
              <div className="mx-auto hidden w-full max-w-md items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-400 sm:flex dark:border-outline-variant dark:bg-surface-container dark:text-on-surface-variant">
                letmastery.edu/learn/module
              </div>
            )}
            {shell === 'android' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </div>

          <div className={`max-h-[720px] overflow-y-auto bg-slate-50 dark:bg-surface ${isPhone ? 'px-4 py-5' : 'px-6 py-8 lg:px-10 lg:py-10'}`}>
            <header className={`mx-auto mb-6 flex max-w-6xl items-start justify-between gap-4 ${isPhone ? 'flex-col' : 'flex-row'}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-outline-variant dark:bg-surface-container dark:text-on-surface">
                  <ArrowLeft size={18} />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-black leading-tight text-slate-950 dark:text-on-surface">{draft.title || 'Untitled module'}</h2>
                  <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-on-surface-variant/70">{subtitle}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm dark:bg-surface-container dark:text-on-surface-variant">
                <Save size={13} />
                Reviewing
              </span>
            </header>

            <div className={`mx-auto grid max-w-6xl gap-5 ${isPhone || device === 'ipad' ? 'grid-cols-1' : 'grid-cols-[300px_1fr]'}`}>
              <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-outline-variant dark:bg-surface-container-lowest">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-on-surface-variant/70">Topic book</p>
                  <span className="text-xs font-black text-primary">{progressPercent}%</span>
                </div>
                <div className="space-y-2">
                  {draft.parts.map((part, index) => {
                    const isActivePart = activeItem.refId === part.id;
                    const isDone = index < activePartIndex || activeItem.type === 'exam';
                    return (
                      <div key={part.id} className={`rounded-xl border p-3 ${isActivePart ? 'border-primary bg-primary/10' : 'border-slate-200 bg-slate-50 dark:border-outline-variant dark:bg-surface-container'}`}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isDone || isActivePart ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}`}>
                            <CheckCircle2 size={13} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-on-surface-variant/60">Lesson {index + 1}</p>
                            <p className="line-clamp-2 text-sm font-black text-slate-950 dark:text-on-surface">{part.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-on-surface-variant">{part.textbookSection.title}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className={`rounded-xl border p-3 ${activeItem.type === 'exam' ? 'border-primary bg-primary/10' : 'border-slate-200 bg-slate-50 dark:border-outline-variant dark:bg-surface-container'}`}>
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
                        <Award size={13} />
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-on-surface-variant/60">Gate</p>
                        <p className="text-sm font-black text-slate-950 dark:text-on-surface">Final module exam</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-on-surface-variant">Pass at {draft.unlockRules.minScorePercent}% to unlock next module</p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <main className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-outline-variant dark:bg-surface-container-lowest">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-on-surface-variant/70">Module path</p>
                    <span className="text-xs font-black text-primary">{progressPercent}%</span>
                  </div>
                  <div className="flex gap-2">
                    {flowItems.map((item) => (
                      <div key={item.id} className={`h-2 flex-1 rounded-full ${item.id === activeItem.id || flowItems.findIndex((flow) => flow.id === item.id) < activeItemIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-surface-container'}`} />
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-outline-variant dark:bg-surface-container-lowest">
                  {activeItem.type === 'exam' ? (
                    <div className="space-y-5">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Final assessment</p>
                      <h3 className="font-headline text-2xl font-black text-slate-950 dark:text-on-surface">Final module exam</h3>
                      {(draft.finalExam || []).slice(0, 3).map((question, index) => (
                        <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-outline-variant dark:bg-surface-container">
                          <p className="text-sm font-black text-slate-900 dark:text-on-surface">{index + 1}. {question.stem}</p>
                          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {(question.options || []).map((option) => (
                              <div key={option.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 dark:border-outline-variant dark:bg-surface-container-lowest dark:text-on-surface-variant">{option.text}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Part {activePartIndex + 1} {activeItem.type}</p>
                        <h3 className="mt-3 font-headline text-2xl font-black text-slate-950 dark:text-on-surface">{activePart.textbookSection.title}</h3>
                        <p className="mt-2 text-sm font-semibold text-slate-400 dark:text-on-surface-variant/70">{activePart.textbookSection.estimatedReadMinutes} min read</p>
                      </div>
                      {activeItem.type !== 'quiz' && (
                        <>
                          <div className="rounded-xl border-l-4 border-primary bg-primary/10 px-5 py-4 text-base font-bold text-primary">{activePart.objective}</div>
                          <p className="whitespace-pre-line text-base leading-8 text-slate-700 dark:text-on-surface-variant">{activePart.textbookSection.body}</p>
                        </>
                      )}
                      {activeItem.type === 'lesson' && activePart.lessonBlocks.length > 0 && (
                        <div className="space-y-3">
                          {activePart.lessonBlocks.map((block, index) => (
                            <div key={`${block.type}-${index}`} className={block.type === 'callout' ? 'rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200' : 'text-base leading-7 text-slate-600 dark:text-on-surface-variant'}>
                              {block.content}
                            </div>
                          ))}
                        </div>
                      )}
                      {activeItem.type === 'activity' && activePart.activity?.prompt && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-outline-variant dark:bg-surface-container">
                          <p className="font-black text-slate-950 dark:text-on-surface">{activePart.activity.title || 'Practice activity'}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-on-surface-variant">{activePart.activity.prompt}</p>
                        </div>
                      )}
                      {(activeItem.type === 'quiz' || activeItem.type === 'lesson') && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-outline-variant dark:bg-surface-container">
                          <p className="text-xs font-black uppercase tracking-widest text-primary">Mini quiz</p>
                          <p className="mt-3 text-base font-black text-slate-900 dark:text-on-surface">{quiz.stem}</p>
                          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {(quiz.options || []).map((option) => (
                              <div key={option.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-outline-variant dark:bg-surface-container-lowest dark:text-on-surface-variant">{option.text}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 dark:bg-surface-container dark:text-on-surface-variant">Bookmark</button>
                        <button className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white">Save notes</button>
                      </div>
                      <button className="flex w-full items-center justify-between rounded-xl bg-primary px-5 py-4 text-left font-black text-white">
                        Continue to next step
                        <ChevronUp size={18} className="rotate-90" />
                      </button>
                    </div>
                  )}
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusedSimulatorOverlay({
  draft,
  activeItem,
  activeItemIndex,
  activePart,
  activePartIndex,
  flowItems,
  onClose,
  onSelectFlowItem,
  onReorderFlowItem,
  onChangeFlowItemType,
  onRemoveFlowItem,
  onSave,
  onOpenAI,
  updateDraft,
  updatePartAtIndex,
  updateMiniQuestionAtPart,
  updateMiniOptionAtPart,
  updateFinalQuestion,
  updateFinalOption,
}: {
  draft: BuilderModule;
  activeItem: FlowItem;
  activeItemIndex: number;
  activePart: JourneyModulePart;
  activePartIndex: number;
  flowItems: FlowItem[];
  onClose: () => void;
  onSelectFlowItem: (id: string) => void;
  onReorderFlowItem: (fromIndex: number, toIndex: number) => void;
  onChangeFlowItemType: (type: FlowItem['type']) => void;
  onRemoveFlowItem: (id: string) => void;
  onSave: () => void;
  onOpenAI: () => void;
  updateDraft: (field: keyof BuilderModule, value: any) => void;
  updatePartAtIndex: (partIndex: number, patch: Partial<JourneyModulePart>) => void;
  updateMiniQuestionAtPart: (partIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateMiniOptionAtPart: (partIndex: number, optionId: string, text: string) => void;
  updateFinalQuestion: (questionIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateFinalOption: (questionIndex: number, optionId: string, text: string) => void;
}) {
  const isExam = activeItem.type === 'exam';

  return (
    <div data-tour-scope="focused-studio" className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-surface text-on-surface">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest/95 px-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button onClick={onClose} className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container" title="Back to split workspace">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Focused module workspace</p>
            <input
              value={draft.title}
              onChange={(event) => updateDraft('title', event.target.value)}
              className="w-full border-0 bg-transparent p-0 font-headline text-lg font-black text-on-surface outline-none focus:ring-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenAI} className="hidden items-center gap-2 rounded-xl bg-surface-container px-4 py-2 text-sm font-bold text-on-surface sm:inline-flex">
            <Bot size={16} />
            AI
          </button>
          <button onClick={onClose} className="hidden items-center gap-2 rounded-xl bg-surface-container px-4 py-2 text-sm font-bold text-on-surface sm:inline-flex">
            <Eye size={16} />
            Split view
          </button>
          <button data-tour="save-module-button" onClick={onSave} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary shadow-sm">
            <Save size={16} />
            Save changes
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto pb-36">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_1fr] lg:py-12">
          <FocusedFlowRail
            activeItem={activeItem}
            activeItemIndex={activeItemIndex}
            flowItems={flowItems}
            onSelect={(item) => onSelectFlowItem(item.id)}
            onReorder={onReorderFlowItem}
            onChangeType={onChangeFlowItemType}
            onRemove={onRemoveFlowItem}
          />

          <div className="min-w-0">
            <div className="mb-10 text-center">
              <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant/70">
                {activeItemIndex + 1}. {activeItem.type} live edit
              </p>
              {isExam ? (
                <h2 className="mt-3 font-headline text-4xl font-black tracking-tight text-on-surface">Final module exam</h2>
              ) : (
                <input
                  value={activePart.title}
                  onChange={(event) => updatePartAtIndex(activePartIndex, { title: event.target.value })}
                  className="mx-auto mt-3 w-full max-w-3xl border-0 bg-transparent p-0 text-center font-headline text-4xl font-black tracking-tight text-on-surface outline-none focus:ring-0"
                />
              )}
            </div>

            {isExam ? (
              <FinalExamLiveEditor
                questions={draft.finalExam}
                updateFinalQuestion={updateFinalQuestion}
                updateFinalOption={updateFinalOption}
                variant="focus"
              />
            ) : (
              <PartLiveEditorCards
                part={activePart}
                partIndex={activePartIndex}
                activeItem={activeItem}
                updatePartAtIndex={updatePartAtIndex}
                updateMiniQuestionAtPart={updateMiniQuestionAtPart}
                updateMiniOptionAtPart={updateMiniOptionAtPart}
                variant="focus"
              />
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3">
        <button data-tour="ai-helper-button" onClick={onOpenAI} className="flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant shadow-lg" title="AI edit helper">
          <Bot size={20} />
        </button>
        <button onClick={onSave} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl" title="Save changes">
          <Check size={24} />
        </button>
      </div>
    </div>
  );
}

function FocusedFlowRail({
  activeItem,
  activeItemIndex,
  flowItems,
  onSelect,
  onReorder,
  onChangeType,
  onRemove,
}: {
  activeItem: FlowItem;
  activeItemIndex: number;
  flowItems: FlowItem[];
  onSelect: (item: FlowItem) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onChangeType: (type: FlowItem['type']) => void;
  onRemove: (id: string) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const nextItem = flowItems[activeItemIndex + 1];
  const editableTypes: FlowItem['type'][] = ['textbook', 'lesson', 'quiz', 'activity', 'exam'];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div data-tour="focused-flow-rail" className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Student flow</p>
            <h3 className="font-headline text-lg font-black text-on-surface">What comes next</h3>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{activeItemIndex + 1}/{flowItems.length}</span>
        </div>

        <div className="space-y-2 pr-1">
          {flowItems.map((item, index) => {
            const isActive = item.id === activeItem.id;
            const isDone = index < activeItemIndex;
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex != null) onReorder(dragIndex, index);
                  setDragIndex(null);
                  onSelect(item);
                }}
                data-tour={isActive ? 'flow-card-active' : undefined}
                className={`rounded-xl border transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-on-surface ring-1 ring-primary/30'
                    : 'border-outline-variant/30 bg-surface-container hover:border-primary/40'
                }`}
              >
                <button onClick={() => onSelect(item)} className="flex w-full items-start gap-3 p-3 text-left">
                  <GripVertical size={15} className={isActive ? 'mt-1 shrink-0 text-primary' : 'mt-1 shrink-0 text-on-surface-variant/40'} />
                  <span className="min-w-0">
                    <span className={`block text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                      {isDone ? 'Done' : index + 1}. {item.type}
                    </span>
                    <span className="line-clamp-2 text-sm font-extrabold text-on-surface">{item.title}</span>
                  </span>
                </button>
                {isActive && (
                  <div className="border-t border-primary/20 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Change this card</p>
                    <select
                      data-tour="flow-card-type-menu"
                      value={item.type}
                      onChange={(event) => onChangeType(event.target.value as FlowItem['type'])}
                      className="mt-2 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs font-black uppercase tracking-widest text-on-surface outline-none"
                    >
                      {editableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button
                      disabled={item.type === 'exam'}
                      onClick={() => onRemove(item.id)}
                      className="mt-2 w-full rounded-lg bg-error/10 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-error disabled:opacity-40"
                    >
                      Remove this card
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {nextItem && (
          <button onClick={() => onSelect(nextItem)} className="mt-4 w-full rounded-xl border border-primary/20 bg-primary/10 p-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Next part</p>
            <p className="mt-1 line-clamp-2 text-sm font-extrabold text-on-surface">{nextItem.type}: {nextItem.title}</p>
          </button>
        )}
      </div>
    </aside>
  );
}

function FlowNavigatorBubble({
  activeItem,
  flowItems,
  onSelect,
}: {
  activeItem: FlowItem;
  flowItems: FlowItem[];
  onSelect: (item: FlowItem) => void;
}) {
  return (
    <div className="group fixed bottom-7 left-1/2 z-[90] -translate-x-1/2">
      <div className="invisible absolute bottom-16 left-1/2 mb-2 w-80 -translate-x-1/2 translate-y-2 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-2 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <p className="border-b border-outline-variant/20 px-3 py-2 text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Jump to</p>
        <div className="mt-2 max-h-72 space-y-1 overflow-y-auto">
          {flowItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold ${activeItem.id === item.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="truncate">{index + 1}. {item.type}: {item.title}</span>
              {activeItem.id === item.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-3 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-2xl">
        <Layers3 size={17} />
        <span className="max-w-[260px] truncate">{activeItem.type}: {activeItem.title}</span>
        <ChevronUp size={15} className="text-white/60" />
      </button>
    </div>
  );
}

function FloatingAIHelper({
  isOpen,
  setIsOpen,
  prompt,
  setPrompt,
  sourceText,
  setSourceText,
  isWorking,
  onUploadDocument,
  onDraft,
  onProofread,
  onParaphrase,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  sourceText: string;
  setSourceText: (value: string) => void;
  isWorking: boolean;
  onUploadDocument: (file: File) => void | Promise<void>;
  onDraft: (instruction?: string) => void | Promise<void>;
  onProofread: (instruction?: string) => void | Promise<void>;
  onParaphrase: (instruction?: string) => void | Promise<void>;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    { role: 'assistant', text: 'Tell me what to do with this module. I can proofread, paraphrase, fix grammar, or draft a full module from an uploaded document.' },
  ]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ pointerX: number; pointerY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setOffset({ x: 0, y: 0 });
  }, [isOpen]);

  useEffect(() => {
    if (!dragStart) return;
    const handleMove = (event: PointerEvent) => {
      setOffset({
        x: dragStart.originX + event.clientX - dragStart.pointerX,
        y: dragStart.originY + event.clientY - dragStart.pointerY,
      });
    };
    const handleUp = () => setDragStart(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragStart]);

  const addMessage = (role: 'assistant' | 'user', text: string) => {
    setMessages((current) => [...current.slice(-5), { role, text }]);
  };

  const runChatAction = async () => {
    const text = message.trim();
    if (!text || isWorking) return;
    const lower = text.toLowerCase();
    setMessage('');
    setPrompt(text);
    addMessage('user', text);

    try {
      if (text.length > 260 && !sourceText.trim()) {
        setSourceText(text);
      }

      if (lower.includes('proof') || lower.includes('grammar') || lower.includes('correct') || lower.includes('fix spelling')) {
        addMessage('assistant', 'I will clean up the active reading section and keep the meaning intact.');
        await Promise.resolve(onProofread(text));
        addMessage('assistant', 'Proofreading request sent. Review the active text before saving.');
        return;
      }

      if (lower.includes('paraphrase') || lower.includes('rewrite') || lower.includes('simplify') || lower.includes('make it clearer')) {
        addMessage('assistant', 'I will rewrite the active reading section in a clearer student-friendly style.');
        await Promise.resolve(onParaphrase(text));
        addMessage('assistant', 'Paraphrase request sent. Check the updated section before publishing.');
        return;
      }

      if (lower.includes('draft') || lower.includes('generate') || lower.includes('convert') || lower.includes('build') || lower.includes('module') || lower.includes('quiz') || lower.includes('exam')) {
        addMessage('assistant', 'I will create an editable draft using your prompt and any uploaded source document. You still approve and publish.');
        await Promise.resolve(onDraft(text));
        addMessage('assistant', 'Draft request sent. The Studio will keep it editable.');
        return;
      }

      addMessage('assistant', 'I can help if you ask things like “proofread this part,” “paraphrase the reading,” or “generate a module from the uploaded PDF.”');
    } catch (error) {
      console.warn('AI helper action failed', error);
      addMessage('assistant', 'I could not complete that request. Try a shorter instruction or upload the source document again.');
    }
  };

  return (
    <div
      className="fixed right-6 bottom-24 z-[90]"
      style={isOpen ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
    >
      {isOpen && (
        <div data-tour="ai-helper-panel" className="mb-3 flex h-[min(620px,calc(100vh-8rem))] w-[min(390px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
          <div
            className="flex cursor-grab items-center justify-between border-b border-outline-variant/40 bg-surface-container px-4 py-3 active:cursor-grabbing"
            onPointerDown={(event) => {
              setDragStart({ pointerX: event.clientX, pointerY: event.clientY, originX: offset.x, originY: offset.y });
            }}
          >
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <MessageCircle size={16} />
              AI module chat
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg hover:bg-surface-container-lowest text-on-surface-variant"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}>
                  {item.text}
                </div>
              </div>
            ))}
            {sourceText.trim() && (
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs font-semibold text-primary">
                Source context is ready. Ask me to convert, generate quizzes, or build a module from it.
              </div>
            )}
          </div>

          <div className="border-t border-outline-variant/40 p-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  runChatAction();
                }
              }}
              rows={3}
              placeholder="Ask: proofread this part, paraphrase the reading, or generate a module from the uploaded PDF..."
              className="w-full resize-none rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-sm font-medium outline-none focus:border-primary/40"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container px-3 py-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">
                <Paperclip size={14} />
                Upload
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    addMessage('user', `Uploaded ${file.name}`);
                    await onUploadDocument(file);
                    addMessage('assistant', 'I extracted the document. Tell me how you want it converted into the module draft.');
                    event.currentTarget.value = '';
                  }}
                  className="hidden"
                />
              </label>
              <button
                onClick={runChatAction}
                disabled={isWorking || !message.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
              >
                {isWorking ? <Sparkles size={15} /> : <Send size={15} />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      {!isOpen && (
        <button
          data-tour="ai-helper-button"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center"
          title="AI edit helper"
        >
          <Bot size={24} />
        </button>
      )}
    </div>
  );
}

function PartsStep({
  draft,
  activePartIndex,
  setActivePartIndex,
  activePart,
  updatePart,
  updatePartLessonBlock,
  addPart,
  removePart,
  requestRemovePart,
  reorderPart,
  duplicatePart,
}: {
  draft: BuilderModule;
  activePartIndex: number;
  setActivePartIndex: (index: number) => void;
  activePart: JourneyModulePart;
  updatePart: (patch: Partial<JourneyModulePart>) => void;
  updatePartLessonBlock: (blockIndex: number, content: string) => void;
  addPart: () => void;
  removePart: (index: number) => void;
  requestRemovePart: (index: number) => void;
  reorderPart: (fromIndex: number, toIndex: number) => void;
  duplicatePart: (partIndex: number) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      <SectionTitle icon={Layers3} title="Step 2: Build the parts" body="Each part becomes one stop in the learner journey: reading, lesson, quiz, optional activity." />
      <div className="flex flex-wrap gap-2">
        {draft.parts.map((part, index) => (
          <div
            key={part.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex != null) reorderPart(dragIndex, index);
              setDragIndex(null);
            }}
            className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${activePartIndex === index ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'}`}
          >
            <GripVertical size={14} className="cursor-grab" />
            <button onClick={() => setActivePartIndex(index)}>Part {index + 1}</button>
          </div>
        ))}
        <button onClick={addPart} className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary/10 text-primary inline-flex items-center gap-2">
          <Plus size={14} />
          Add part
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-5">
        <div className="space-y-5">
          <Field label="Part title">
            <input value={activePart.title} onChange={(event) => updatePart({ title: event.target.value })} className="input" />
          </Field>
          <Field label="Learning objective">
            <textarea value={activePart.objective} onChange={(event) => updatePart({ objective: event.target.value })} rows={2} className="input resize-none" />
          </Field>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px] gap-4">
            <Field label="Textbook section title">
              <input value={activePart.textbookSection.title} onChange={(event) => updatePart({ textbookSection: { ...activePart.textbookSection, title: event.target.value } })} className="input" />
            </Field>
            <Field label="Read minutes">
              <input type="number" min={1} value={activePart.textbookSection.estimatedReadMinutes} onChange={(event) => updatePart({ textbookSection: { ...activePart.textbookSection, estimatedReadMinutes: Number(event.target.value) } })} className="input" />
            </Field>
          </div>
          <Field label="Video or Canva embed link">
            <input
              value={activePart.textbookSection.mediaUrl || ''}
              onChange={(event) => updatePart({ textbookSection: { ...activePart.textbookSection, mediaUrl: event.target.value } })}
              placeholder="Paste a YouTube, Canva, or slide embed URL without uploading the file"
              className="input"
            />
          </Field>
          <Field label="Textbook reading body">
            <textarea value={activePart.textbookSection.body} onChange={(event) => updatePart({ textbookSection: { ...activePart.textbookSection, body: event.target.value } })} rows={7} className="input resize-y leading-relaxed" />
          </Field>
          {activePart.textbookSection.sourceTextSnippet && (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
                Source reference / {activePart.textbookSection.sourcePage ? `Page ${activePart.textbookSection.sourcePage}` : activePart.textbookSection.sourceSlide ? `Slide ${activePart.textbookSection.sourceSlide}` : 'Document chunk'} / {activePart.textbookSection.aiConfidence || 'medium'}
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">{activePart.textbookSection.sourceTextSnippet}</p>
            </div>
          )}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Mini lesson blocks</p>
            {activePart.lessonBlocks.map((block, index) => (
              <textarea key={index} value={block.content} onChange={(event) => updatePartLessonBlock(index, event.target.value)} rows={block.type === 'text' ? 3 : 2} className="input resize-y" />
            ))}
          </div>
        </div>

        <aside className="rounded-2xl bg-surface-container/40 border border-outline-variant/40 p-4 h-fit">
          <p className="text-sm font-extrabold text-on-surface">Part checklist</p>
          <ChecklistItem done={!!activePart.textbookSection.body} label="Textbook section" />
          <ChecklistItem done={activePart.lessonBlocks.length > 0} label="Mini lesson" />
          <ChecklistItem done={activePart.miniQuiz.length > 0} label="Mini quiz" />
          <ChecklistItem done={!!activePart.activity?.prompt} label="Optional activity" />
          <button onClick={() => requestRemovePart(activePartIndex)} className="w-full mt-4 rounded-xl bg-error/10 text-error px-4 py-3 text-xs font-bold inline-flex items-center justify-center gap-2">
            <Trash2 size={14} />
            Remove part
          </button>
          <button onClick={() => duplicatePart(activePartIndex)} className="w-full mt-2 rounded-xl bg-surface-container text-on-surface px-4 py-3 text-xs font-bold border border-outline-variant/40 inline-flex items-center justify-center gap-2">
            <Copy size={14} />
            Duplicate part
          </button>
        </aside>
      </div>
    </div>
  );
}

function AssessmentsStep({
  draft,
  activePartIndex,
  setActivePartIndex,
  activePart,
  updateMiniQuestion,
  updateMiniOption,
  updateFinalQuestion,
  updateFinalOption,
  addFinalQuestion,
}: {
  draft: BuilderModule;
  activePartIndex: number;
  setActivePartIndex: (index: number) => void;
  activePart: JourneyModulePart;
  updateMiniQuestion: (patch: Partial<JourneyQuestion>) => void;
  updateMiniOption: (optionId: string, text: string) => void;
  updateFinalQuestion: (questionIndex: number, patch: Partial<JourneyQuestion>) => void;
  updateFinalOption: (questionIndex: number, optionId: string, text: string) => void;
  addFinalQuestion: () => void;
}) {
  const miniQuestion = activePart.miniQuiz[0] || blankQuestion(`${activePart.id}-q1`);

  return (
    <div className="space-y-8">
      <SectionTitle icon={FileQuestion} title="Step 3: Add checks and final exam" body="Mini quizzes teach inside each part. The final exam gates module completion." />

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {draft.parts.map((_part, index) => (
            <button key={index} onClick={() => setActivePartIndex(index)} className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest ${activePartIndex === index ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
              Mini quiz part {index + 1}
            </button>
          ))}
        </div>
        <QuestionEditor
          title={`Mini quiz for ${activePart.title}`}
          question={miniQuestion}
          onQuestion={(patch) => updateMiniQuestion(patch)}
          onOption={(optionId, text) => updateMiniOption(optionId, text)}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline font-extrabold text-xl">Final module exam</h3>
          <button onClick={addFinalQuestion} className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2">
            <Plus size={14} />
            Add exam item
          </button>
        </div>
        {draft.finalExam.map((question, index) => (
          <QuestionEditor
            key={question.id}
            title={`Final exam question ${index + 1}`}
            question={question}
            onQuestion={(patch) => updateFinalQuestion(index, patch)}
            onOption={(optionId, text) => updateFinalOption(index, optionId, text)}
          />
        ))}
      </section>
    </div>
  );
}

function LearningDesignStep({
  draft,
  updateDraft,
}: {
  draft: BuilderModule;
  updateDraft: (field: keyof BuilderModule, value: any) => void;
}) {
  const updateCompetency = (index: number, patch: Partial<BuilderModule['competencies'][number]>) => {
    updateDraft('competencies', draft.competencies.map((competency, itemIndex) => itemIndex === index ? { ...competency, ...patch } : competency));
  };
  const updateRubric = (index: number, patch: Partial<BuilderModule['rubric'][number]>) => {
    updateDraft('rubric', draft.rubric.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  return (
    <div className="space-y-8">
      <SectionTitle icon={Settings2} title="Step 4: Design rules and competencies" body="Define what mastery means before learners see the module." />

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline font-extrabold text-xl">Competencies</h3>
          <button
            onClick={() => updateDraft('competencies', [...draft.competencies, { id: `competency-${draft.competencies.length + 1}`, label: 'New competency', description: '' }])}
            className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-xs font-black uppercase tracking-widest"
          >
            Add competency
          </button>
        </div>
        <div className="space-y-3">
          {draft.competencies.map((competency, index) => (
            <div key={competency.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_auto] gap-3">
              <input value={competency.label} onChange={(event) => updateCompetency(index, { label: event.target.value })} className="input" />
              <input value={competency.description || ''} onChange={(event) => updateCompetency(index, { description: event.target.value })} className="input" placeholder="What students must demonstrate" />
              <button onClick={() => updateDraft('competencies', draft.competencies.filter((_item, itemIndex) => itemIndex !== index))} className="rounded-xl bg-error/10 text-error px-4 py-2 text-xs font-bold">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-headline font-extrabold text-xl">Rubric</h3>
          <button
            onClick={() => updateDraft('rubric', [...draft.rubric, { criterion: 'New criterion', points: 5, description: '' }])}
            className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-xs font-black uppercase tracking-widest"
          >
            Add rubric row
          </button>
        </div>
        <div className="space-y-3">
          {draft.rubric.map((item, index) => (
            <div key={`${item.criterion}-${index}`} className="grid grid-cols-1 lg:grid-cols-[1fr_100px_1.4fr_auto] gap-3">
              <input value={item.criterion} onChange={(event) => updateRubric(index, { criterion: event.target.value })} className="input" />
              <input type="number" min={1} value={item.points} onChange={(event) => updateRubric(index, { points: Number(event.target.value) })} className="input" />
              <input value={item.description} onChange={(event) => updateRubric(index, { description: event.target.value })} className="input" placeholder="How this is judged" />
              <button onClick={() => updateDraft('rubric', draft.rubric.filter((_item, itemIndex) => itemIndex !== index))} className="rounded-xl bg-error/10 text-error px-4 py-2 text-xs font-bold">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
          <h3 className="font-headline font-extrabold text-xl">Unlock rules</h3>
          <Field label="Minimum final score">
            <input
              type="number"
              min={1}
              max={100}
              value={draft.unlockRules.minScorePercent}
              onChange={(event) => updateDraft('unlockRules', { ...draft.unlockRules, minScorePercent: Number(event.target.value) })}
              className="input"
            />
          </Field>
          <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
            <span className="text-sm font-extrabold text-on-surface">Require all parts before final exam</span>
            <input type="checkbox" checked={draft.unlockRules.requireAllParts} onChange={(event) => updateDraft('unlockRules', { ...draft.unlockRules, requireAllParts: event.target.checked })} className="w-5 h-5 accent-primary" />
          </label>
          <Field label="Motivational quote">
            <textarea value={draft.unlockRules.motivationalQuote} onChange={(event) => updateDraft('unlockRules', { ...draft.unlockRules, motivationalQuote: event.target.value })} rows={3} className="input resize-none" />
          </Field>
        </div>

        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
          <h3 className="font-headline font-extrabold text-xl">Exam blueprint</h3>
          <Field label="Question count">
            <input type="number" min={1} value={draft.examBlueprint.questionCount} onChange={(event) => updateDraft('examBlueprint', { ...draft.examBlueprint, questionCount: Number(event.target.value) })} className="input" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <Field key={difficulty} label={`${difficulty} %`}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.examBlueprint.difficultyMix[difficulty]}
                  onChange={(event) => updateDraft('examBlueprint', {
                    ...draft.examBlueprint,
                    difficultyMix: { ...draft.examBlueprint.difficultyMix, [difficulty]: Number(event.target.value) },
                  })}
                  className="input"
                />
              </Field>
            ))}
          </div>
          <Field label="Prerequisite topics or module IDs">
            <textarea
              value={draft.prerequisiteModuleIds.join('\n')}
              onChange={(event) => updateDraft('prerequisiteModuleIds', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
              rows={4}
              className="input resize-none"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary" />
          <h3 className="font-headline font-extrabold text-xl">Certificate unlock</h3>
        </div>
        <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
          <span>
            <span className="block text-sm font-extrabold text-on-surface">Give certificate after this module</span>
            <span className="block text-xs text-on-surface-variant/60">Use this only for final or capstone modules, not every short lesson.</span>
          </span>
          <input type="checkbox" checked={draft.certificateEnabled} onChange={(event) => updateDraft('certificateEnabled', event.target.checked)} className="w-5 h-5 accent-primary" />
        </label>
        {draft.certificateEnabled && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Certificate template ID">
              <input value={draft.certificateTemplateId || ''} onChange={(event) => updateDraft('certificateTemplateId', event.target.value)} className="input" placeholder="Optional template ID from Certificates page" />
            </Field>
            <Field label="Requirement note">
              <textarea value={draft.certificateRequirementNote || ''} onChange={(event) => updateDraft('certificateRequirementNote', event.target.value)} rows={3} className="input resize-none" />
            </Field>
          </div>
        )}
      </section>
    </div>
  );
}

function PublishStep({
  draft,
  classes,
  updateDraft,
  saveModule,
}: {
  draft: BuilderModule;
  classes: any[];
  updateDraft: (field: keyof BuilderModule, value: any) => void;
  saveModule: () => void;
}) {
  const readyChecks = [
    { label: 'Module has a title', done: !!draft.title.trim() },
    { label: 'Description explains the goal', done: !!draft.description.trim() },
    { label: 'At least one learning part', done: draft.parts.length > 0 },
    { label: 'Every part has reading text', done: draft.parts.every((part) => !!part.textbookSection.body.trim()) },
    { label: 'Final exam has at least one item', done: draft.finalExam.length > 0 },
    { label: 'Competencies are defined', done: draft.competencies.length > 0 },
  ];

  const canPublish = readyChecks.every((item) => item.done);

  return (
    <div data-tour="publish-settings" className="space-y-5">
      <SectionTitle icon={CheckCircle2} title="Step 5: Review and publish" body="Publish only when the path is complete enough for learners to follow without confusion." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {readyChecks.map((item) => <ChecklistItem key={item.label} done={item.done} label={item.label} />)}
      </div>
      <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
        <span>
          <span className="block text-sm font-extrabold text-on-surface">Publish to students</span>
          <span className="block text-xs text-on-surface-variant/60">Draft modules stay hidden from the learner journey.</span>
        </span>
        <input type="checkbox" checked={draft.isPublished} disabled={!canPublish} onChange={(event) => updateDraft('isPublished', event.target.checked)} className="w-5 h-5 accent-primary disabled:opacity-40" />
      </label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Field label="Available to">
          <select value={draft.publishScope} onChange={(event) => updateDraft('publishScope', event.target.value)} className="input font-bold">
            <option value="public">Public / self-study learners</option>
            <option value="classes">Specific classes only</option>
          </select>
        </Field>
        <Field label="Due date">
          <input type="datetime-local" value={draft.dueAt || ''} onChange={(event) => updateDraft('dueAt', event.target.value)} className="input" />
        </Field>
      </div>
      {draft.publishScope === 'classes' && (
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container/30 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50 mb-3">Choose classes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {classes.map((classItem) => {
              const checked = draft.classIds.includes(classItem.id);
              return (
                <label key={classItem.id} className="flex items-center gap-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const nextIds = event.target.checked
                        ? [...draft.classIds, classItem.id]
                        : draft.classIds.filter((id) => id !== classItem.id);
                      updateDraft('classIds', nextIds);
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-bold text-on-surface">{classItem.className}</span>
                </label>
              );
            })}
            {classes.length === 0 && <p className="text-sm font-bold text-on-surface-variant/40">No classes yet. Create a class first.</p>}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
          <span>
            <span className="block text-sm font-extrabold text-on-surface">Anti-cheat for exams</span>
            <span className="block text-xs text-on-surface-variant/60">Fullscreen, tab focus, and copy/paste warnings.</span>
          </span>
          <input type="checkbox" checked={draft.antiCheatEnabled} onChange={(event) => updateDraft('antiCheatEnabled', event.target.checked)} className="w-5 h-5 accent-primary" />
        </label>
        <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
          <span>
            <span className="block text-sm font-extrabold text-on-surface">Record first attempt only</span>
            <span className="block text-xs text-on-surface-variant/60">Retakes can practice, but first score remains official.</span>
          </span>
          <input type="checkbox" checked={draft.recordFirstAttemptOnly} onChange={(event) => updateDraft('recordFirstAttemptOnly', event.target.checked)} className="w-5 h-5 accent-primary" />
        </label>
      </div>
      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline font-extrabold text-xl">Academic integrity controls</h3>
            <p className="text-xs text-on-surface-variant/60 mt-1">Default is one take. Basic controls cover fair attempts and timing; advanced adds pools, reveal timing, and attempt logs.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container p-1">
            {(['basic', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => updateDraft('attemptPolicy', { ...draft.attemptPolicy, integrityLevel: level })}
                className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest ${draft.attemptPolicy.integrityLevel === level ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Field label="Allowed attempts">
            <input type="number" min={1} value={draft.attemptPolicy.maxAttempts} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, maxAttempts: Number(event.target.value) })} className="input" />
          </Field>
          <Field label="Score counted">
            <select value={draft.attemptPolicy.scoreMode} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, scoreMode: event.target.value })} className="input font-bold">
              <option value="first">First score</option>
              <option value="highest">Highest score</option>
              <option value="latest">Latest score</option>
            </select>
          </Field>
          <Field label="Time limit minutes">
            <input type="number" min={0} value={draft.attemptPolicy.timeLimitMinutes} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, timeLimitMinutes: Number(event.target.value) })} className="input" />
          </Field>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
            <span>
              <span className="block text-sm font-extrabold text-on-surface">Randomize question order</span>
              <span className="block text-xs text-on-surface-variant/60">Useful when more than one student takes the same exam window.</span>
            </span>
            <input type="checkbox" checked={draft.attemptPolicy.randomizeQuestions} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, randomizeQuestions: event.target.checked })} className="w-5 h-5 accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
            <span>
              <span className="block text-sm font-extrabold text-on-surface">Randomize choices</span>
              <span className="block text-xs text-on-surface-variant/60">Keeps A/B/C/D from becoming memorized positions.</span>
            </span>
            <input type="checkbox" checked={draft.attemptPolicy.randomizeChoices} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, randomizeChoices: event.target.checked })} className="w-5 h-5 accent-primary" />
          </label>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Answer reveal">
            <select
              value={draft.attemptPolicy.answerRevealMode}
              onChange={(event) => {
                const mode = event.target.value as BuilderModule['attemptPolicy']['answerRevealMode'];
                updateDraft('attemptPolicy', { ...draft.attemptPolicy, answerRevealMode: mode, showAnswersAfterSubmit: mode !== 'never' });
              }}
              className="input font-bold"
            >
              <option value="never">Never reveal answers</option>
              <option value="after_deadline">Reveal after due date</option>
              <option value="immediate">Reveal after submission</option>
            </select>
          </Field>
          <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
            <span>
              <span className="block text-sm font-extrabold text-on-surface">Save attempt logs</span>
              <span className="block text-xs text-on-surface-variant/60">Keeps score, timing, warnings, and policy snapshot for instructor review.</span>
            </span>
            <input type="checkbox" checked={draft.attemptPolicy.attemptLogs} onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, attemptLogs: event.target.checked })} className="w-5 h-5 accent-primary" />
          </label>
        </div>
        {draft.attemptPolicy.integrityLevel === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
            <Field label="Question pool size">
              <input
                type="number"
                min={0}
                value={draft.attemptPolicy.questionPoolSize}
                onChange={(event) => updateDraft('attemptPolicy', { ...draft.attemptPolicy, questionPoolSize: Number(event.target.value) })}
                className="input"
                placeholder="0 uses every final exam question"
              />
            </Field>
            <label className="flex items-center justify-between gap-4 bg-surface-container rounded-xl px-4 py-4">
              <span>
                <span className="block text-sm font-extrabold text-on-surface">Fullscreen and focus checks</span>
                <span className="block text-xs text-on-surface-variant/60">Warns on tab switching, copy/paste, and leaving full screen.</span>
              </span>
              <input type="checkbox" checked={draft.antiCheatEnabled} onChange={(event) => updateDraft('antiCheatEnabled', event.target.checked)} className="w-5 h-5 accent-primary" />
            </label>
          </div>
        )}
      </section>
      <button onClick={saveModule} className="rounded-xl bg-primary text-on-primary px-6 py-3 font-bold">Save module</button>
    </div>
  );
}

function QuestionEditor({
  title,
  question,
  onQuestion,
  onOption,
}: {
  title: string;
  question: JourneyQuestion;
  onQuestion: (patch: Partial<JourneyQuestion>) => void;
  onOption: (optionId: string, text: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 p-4 space-y-4">
      <h4 className="font-extrabold text-on-surface">{title}</h4>
      <Field label="Question type">
        <select
          value={question.type || 'multiple_choice'}
          onChange={(event) => {
            const type = event.target.value as JourneyQuestion['type'];
            if (type === 'true_false') {
              onQuestion({
                type,
                options: [{ id: 'A', text: 'True' }, { id: 'B', text: 'False' }],
                correctOptionId: 'A',
              });
            } else if (type === 'multiple_choice') {
              onQuestion({
                type,
                options: question.options?.length ? question.options : blankQuestion(question.id).options,
                correctOptionId: question.correctOptionId || 'A',
              });
            } else {
              onQuestion({
                type,
                options: [],
                correctOptionId: '',
                acceptedAnswers: question.acceptedAnswers?.length ? question.acceptedAnswers : ['Key idea from the reading'],
                expectedAnswer: question.expectedAnswer || 'Expected answer based on the textbook reading.',
              });
            }
          }}
          className="input font-bold"
        >
          <option value="multiple_choice">Multiple choice</option>
          <option value="true_false">True / False</option>
          <option value="enumeration">Enumeration</option>
          <option value="short_answer">Short answer</option>
          <option value="essay">Essay</option>
        </select>
      </Field>
      <Field label="Question stem">
        <textarea value={question.stem} onChange={(event) => onQuestion({ stem: event.target.value })} rows={3} className="input resize-none" />
      </Field>
      {(!question.type || question.type === 'multiple_choice' || question.type === 'true_false') ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <Field key={option.id} label={`Option ${option.id}`}>
                <input value={option.text} onChange={(event) => onOption(option.id, event.target.value)} className="input" />
              </Field>
            ))}
          </div>
          <Field label="Correct answer">
            <select value={question.correctOptionId} onChange={(event) => onQuestion({ correctOptionId: event.target.value })} className="input font-bold">
              {question.options.map((option) => <option key={option.id} value={option.id}>{option.id}</option>)}
            </select>
          </Field>
        </>
      ) : (
        <>
          <Field label="Expected answer / rubric">
            <textarea value={question.expectedAnswer || ''} onChange={(event) => onQuestion({ expectedAnswer: event.target.value })} rows={3} className="input resize-none" />
          </Field>
          <Field label="Accepted answers or key terms">
            <textarea
              value={(question.acceptedAnswers || []).join('\n')}
              onChange={(event) => onQuestion({ acceptedAnswers: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })}
              rows={3}
              className="input resize-none"
              placeholder="One accepted answer or key term per line"
            />
          </Field>
        </>
      )}
      <Field label="Explanation">
        <textarea value={question.explanation} onChange={(event) => onQuestion({ explanation: event.target.value })} rows={2} className="input resize-none" />
      </Field>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-2">
        <Icon size={16} />
        Builder guide
      </div>
      <h2 className="text-2xl font-extrabold font-headline text-on-surface">{title}</h2>
      <p className="text-sm text-on-surface-variant mt-2">{body}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">{label}</span>
      {children}
    </label>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container/40 border border-outline-variant/30 px-4 py-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-container text-on-surface-variant/40'}`}>
        <CheckCircle2 size={16} />
      </div>
      <span className="text-sm font-bold text-on-surface">{label}</span>
    </div>
  );
}
