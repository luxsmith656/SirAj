import React, { useState, useRef } from 'react';
import InstructorLayout from '../components/InstructorLayout';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  CloudUpload, 
  Download, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function BulkUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Layout = user?.role === 'admin' ? AdminLayout : InstructorLayout;
  const layoutTitle = "Bulk Content Import";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        let successCount = 0;
        let failCount = 0;
        const errorDetails: string[] = [];

        try {
          const { serverTimestamp } = await import('firebase/firestore');
          
          // Pre-fetch all mapping data
          const catSnap = await getDocs(collection(db, 'categories'));
          const topSnap = await getDocs(collection(db, 'topics'));
          const skillSnap = await getDocs(collection(db, 'skills'));
          const existingQs = await getDocs(collection(db, 'questions'));
          
          const categoryMap: Record<string, string> = {};
          catSnap.forEach(s => categoryMap[s.data().title.toLowerCase()] = s.id);
          
          const topicMap: Record<string, string> = {};
          topSnap.forEach(s => topicMap[s.data().title.toLowerCase()] = s.id);

          const skillMap: Record<string, string> = {};
          skillSnap.forEach(s => skillMap[s.data().title.toLowerCase()] = s.id);

          const existingStems = new Set(existingQs.docs.map(d => d.data().stem.toLowerCase().trim()));

          for (const [index, row] of (data as any[]).entries()) {
            try {
              const { 
                Stem, 
                'Option A': optA, 
                'Option B': optB, 
                'Option C': optC, 
                'Option D': optD, 
                'Correct Option': correct, 
                'Explanation': explanation,
                'Category': catName,
                'Topic': topicName,
                'Skills': skillsStr,
                'Difficulty': difficulty,
                'Type': type 
              } = row;

              const cleanStem = Stem?.trim();
              if (!cleanStem || !optA || !correct || !catName || !topicName) {
                throw new Error(`Row ${index + 2}: Missing required fields (Stem, Options, Correct, Category, Topic).`);
              }

              if (existingStems.has(cleanStem.toLowerCase())) {
                throw new Error(`Row ${index + 2}: Duplicate question stem.`);
              }

              let categoryId = categoryMap[catName.toLowerCase()];
              if (!categoryId) {
                const newCatRef = doc(collection(db, 'categories'));
                await setDoc(newCatRef, { title: catName, description: 'Auto-created' });
                categoryId = newCatRef.id;
                categoryMap[catName.toLowerCase()] = categoryId;
              }

              let topicId = topicMap[topicName.toLowerCase()];
              if (!topicId) {
                const newTopRef = doc(collection(db, 'topics'));
                await setDoc(newTopRef, { title: topicName, categoryId, description: 'Auto-created' });
                topicId = newTopRef.id;
                topicMap[topicName.toLowerCase()] = topicId;
              }

              const skillIds: string[] = [];
              if (skillsStr) {
                const skillsArr = skillsStr.split(',').map((s: string) => s.trim());
                for (const sName of skillsArr) {
                  let sId = skillMap[sName.toLowerCase()];
                  if (!sId) {
                    const newSkillRef = doc(collection(db, 'skills'));
                    await setDoc(newSkillRef, { title: sName, topicId, categoryId });
                    sId = newSkillRef.id;
                    skillMap[sName.toLowerCase()] = sId;
                  }
                  skillIds.push(sId);
                }
              }

              const qRef = doc(collection(db, 'questions'));
              await setDoc(qRef, {
                stem: cleanStem,
                options: [
                  { id: 'A', text: optA },
                  { id: 'B', text: optB },
                  { id: 'C', text: optC },
                  { id: 'D', text: optD }
                ],
                correctOptionId: correct.toUpperCase().trim(),
                explanation: explanation || '',
                categoryId,
                topicId,
                skillIds,
                difficulty: difficulty || 'Average',
                type: type || 'practice',
                approved: true,
                isPublished: true,
                aiGenerated: false,
                createdBy: user?.uid,
                version: 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              
              existingStems.add(cleanStem.toLowerCase());
              successCount++;
            } catch (err: any) {
              failCount++;
              errorDetails.push(err.message);
              if (errorDetails.length > 50) break;
            }
          }
        } catch (globalErr: any) {
          errorDetails.push('System error: ' + globalErr.message);
        }

        setResults({ 
          success: successCount, 
          failed: failCount, 
          errors: errorDetails 
        });
        setUploading(false);
        setFile(null);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "Stem,Option A,Option B,Option C,Option D,Correct Option,Explanation,Category,Topic,Skills,Difficulty,Type\n" +
      "\"Who is the father of Filipino language?\",\"Manuel L. Quezon\",\"Jose Rizal\",\"Andres Bonifacio\",\"Emilio Aguinaldo\",\"A\",\"Manuel L. Quezon is the Ama ng Wikang Pambansa.\",\"General Education\",\"History\",\"General Knowledge,Language\",\"Easy\",\"practice\"";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "let_mastery_questions_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title={layoutTitle}>
      <div className="p-8 max-w-4xl mx-auto w-full text-on-surface">
        <div className="flex items-center gap-2 text-primary mb-6">
          <CloudUpload size={24} />
          <h1 className="text-2xl font-black font-headline tracking-tight">Bulk Content Import</h1>
        </div>
        
        <p className="text-on-surface-variant/60 font-medium mb-10">Upload your curriculum data using our standard CSV format. This will instantly populate the global question bank.</p>

        {!results ? (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-outline-variant/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">Question Bank CSV</h3>
                    <p className="text-xs text-on-surface-variant/40 font-medium italic">Supports board exam question structures</p>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 px-3 py-2 rounded-lg transition-all"
                >
                  <Download size={16} /> Template
                </button>
              </div>

              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container/20 hover:bg-surface-container/40 hover:border-primary/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${dragActive ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant/40 shadow-sm border border-outline-variant/50'}`}>
                  {uploading ? <Loader2 size={32} className="animate-spin" /> : <CloudUpload size={32} />}
                </div>
                
                {file ? (
                  <div className="text-center">
                    <p className="font-bold text-on-surface text-lg mb-1">{file.name}</p>
                    <p className="text-xs text-on-surface-variant/40">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold font-headline text-lg mb-1 text-on-surface">Drag and drop file here</h4>
                    <p className="text-sm text-on-surface-variant/40 font-medium">or <span className="text-primary font-bold">browse files</span></p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-sm border border-outline-variant/50">
                <Info size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-primary text-sm">Validation Guard</h4>
                <p className="text-xs text-on-surface-variant/70 leading-relaxed font-medium">
                  Categories will be auto-created if they don't exist. Each row must have a unique stem to avoid duplicates. Correct options must be 'A', 'B', 'C', or 'D'.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setFile(null)}
                disabled={uploading || !file}
                className="px-6 py-3 rounded-xl text-on-surface-variant bg-surface-container border border-outline-variant/50 hover:bg-surface-container/80 transition-colors font-bold text-sm disabled:opacity-50"
              >
                Clear
              </button>
              <button 
                onClick={processUpload}
                disabled={uploading || !file}
                className="px-8 py-3 rounded-xl text-on-primary bg-primary shadow-lg shadow-primary/20 font-bold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Start Import Process'}
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-3xl p-10 border border-outline-variant shadow-xl shadow-surface-dim/10 text-center"
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${results.failed === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {results.failed === 0 ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h2 className="text-3xl font-black font-headline text-on-surface mb-2">Import Finished</h2>
            <p className="text-on-surface-variant/60 font-medium mb-10">We processed your file and updated the curriculum data banks.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Success</p>
                  <p className="text-2xl font-black text-emerald-500">{results.success}</p>
               </div>
               <div className="bg-error/10 border border-error/20 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Failed</p>
                  <p className="text-2xl font-black text-error">{results.failed}</p>
               </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-surface-container/30 rounded-2xl p-6 mb-10 text-left border border-outline-variant/10">
                <h4 className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> Error Logs
                </h4>
                <div className="space-y-2">
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-xs text-error font-medium flex items-start gap-2">
                      <XCircle size={14} className="shrink-0 mt-0.5" />
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setResults(null)}
              className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-lg shadow-primary/20 transition-all shadow-md"
            >
              Back to Import
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
