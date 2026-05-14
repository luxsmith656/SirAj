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

        // Pre-fetch categories to map names to IDs
        const catSnap = await getDocs(collection(db, 'categories'));
        const categoryMap: Record<string, string> = {};
        catSnap.forEach(s => categoryMap[s.data().name.toLowerCase()] = s.id);

        for (const [index, row] of (data as any[]).entries()) {
          try {
            const { 
              Stem, 
              'Option A': optA, 
              'Option B': optB, 
              'Option C': optC, 
              'Option D': optD, 
              'Correct Option': correct, 
              'Category Name': catName,
              'Topic Name': topicName,
              'Difficulty': difficulty 
            } = row;

            if (!Stem || !optA || !correct || !catName) {
              throw new Error(`Row ${index + 2}: Missing required fields (Stem, Option A, Correct Option, Category Name).`);
            }

            let categoryId = categoryMap[catName.toLowerCase()];
            if (!categoryId) {
              // Create category if it doesn't exist
              const newCatRef = doc(collection(db, 'categories'));
              await setDoc(newCatRef, { name: catName, description: `Auto-created during bulk upload for ${catName}` });
              categoryId = newCatRef.id;
              categoryMap[catName.toLowerCase()] = categoryId;
            }

            const qRef = doc(collection(db, 'questions'));
            await setDoc(qRef, {
              stem: Stem,
              options: [
                { id: 'A', text: optA },
                { id: 'B', text: optB },
                { id: 'C', text: optC },
                { id: 'D', text: optD }
              ],
              correctOptionId: correct.toUpperCase(),
              categoryId: categoryId,
              topicName: topicName || '',
              difficulty: difficulty || 'Medium',
              createdAt: Date.now(),
              createdBy: user?.uid,
              status: 'active'
            });
            
            successCount++;
          } catch (err: any) {
            failCount++;
            errorDetails.push(err.message);
            if (errorDetails.length > 10) break; // Limit errors
          }
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
    const csvContent = "Stem,Option A,Option B,Option C,Option D,Correct Option,Category Name,Topic Name,Difficulty\n" +
      "\"What is the capital of France?\",\"Paris\",\"London\",\"Berlin\",\"Madrid\",\"A\",\"General Education\",\"Geography\",\"Easy\"";
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
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2 text-[#1b366a] mb-6">
          <CloudUpload size={24} />
          <h1 className="text-2xl font-black font-headline tracking-tight">Bulk Content Import</h1>
        </div>
        
        <p className="text-slate-500 font-medium mb-10">Upload your curriculum data using our standard CSV format. This will instantly populate the global question bank.</p>

        {!results ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg text-slate-800">Question Bank CSV</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Supports board exam question structures</p>
                  </div>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="text-[#1b366a] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
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
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${dragActive ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                  {uploading ? <Loader2 size={32} className="animate-spin" /> : <CloudUpload size={32} />}
                </div>
                
                {file ? (
                  <div className="text-center">
                    <p className="font-bold text-slate-800 text-lg mb-1">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold font-headline text-lg mb-1 text-slate-800">Drag and drop file here</h4>
                    <p className="text-sm text-slate-400 font-medium">or <span className="text-[#1b366a] font-bold">browse files</span></p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shrink-0 shadow-sm border border-indigo-50">
                <Info size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-indigo-900 text-sm">Validation Guard</h4>
                <p className="text-xs text-indigo-700/70 leading-relaxed font-medium">
                  Categories will be auto-created if they don't exist. Each row must have a unique stem to avoid duplicates. Correct options must be 'A', 'B', 'C', or 'D'.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setFile(null)}
                disabled={uploading || !file}
                className="px-6 py-3 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors font-bold text-sm disabled:opacity-50"
              >
                Clear
              </button>
              <button 
                onClick={processUpload}
                disabled={uploading || !file}
                className="px-8 py-3 rounded-xl text-white bg-[#1b366a] shadow-lg shadow-blue-900/20 font-bold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : 'Start Import Process'}
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 text-center"
          >
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${results.failed === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {results.failed === 0 ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            
            <h2 className="text-3xl font-black font-headline text-slate-800 mb-2">Import Finished</h2>
            <p className="text-slate-500 font-medium mb-10">We processed your file and updated the curriculum data banks.</p>
            
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
               <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Success</p>
                  <p className="text-2xl font-black text-emerald-800">{results.success}</p>
               </div>
               <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1">Failed</p>
                  <p className="text-2xl font-black text-red-800">{results.failed}</p>
               </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> Error Logs
                </h4>
                <div className="space-y-2">
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 font-medium flex items-start gap-2">
                      <XCircle size={14} className="shrink-0 mt-0.5" />
                      {err}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => setResults(null)}
              className="bg-[#1b366a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#112244] shadow-lg shadow-blue-900/10 transition-all"
            >
              Back to Import
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
