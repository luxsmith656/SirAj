import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { BookOpen, Search, ArrowLeft, Filter, BookText, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

// Mock generation of a massive library
const generateLibrary = (size: number) => {
  const domains = ['General Education', 'Professional Education', 'Major in English', 'Major in Math', 'Major in Science'];
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push({
      id: `book-${i}`,
      title: `Comprehensive Guide to ${domains[i % domains.length]} Vol ${Math.floor(i / 5) + 1}`,
      author: `Dr. Expert ${i}`,
      domain: domains[i % domains.length],
      pages: 150 + (i % 300),
      readTime: `${2 + (i % 5)}h`,
      rating: (4 + (i % 10) / 10).toFixed(1),
    });
  }
  return data;
};

const massiveLibrary = generateLibrary(10000); // 10,000 textbooks without lag

export default function TextbookLibrary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const filteredLibrary = useMemo(() => {
    return massiveLibrary.filter(book => {
      const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDomain = selectedDomain === 'All' || book.domain === selectedDomain;
      return matchSearch && matchDomain;
    });
  }, [searchTerm, selectedDomain]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const book = filteredLibrary[index];
    if (!book) return null;

    return (
      <div style={style} className="pr-4 pb-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-[#1b366a]/30 transition-all group h-[140px] md:h-[100px] overflow-hidden">
           <div className="w-12 h-16 bg-[#1b366a] rounded-lg flex items-center justify-center shrink-0 shadow-inner">
              <BookText className="text-white opacity-80" size={24} />
           </div>
           <div className="flex-1 min-w-0">
             <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-[#1b366a] transition-colors">{book.title}</h3>
             <p className="text-sm text-slate-500 truncate">{book.author} • {book.domain}</p>
             <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">auto_stories</span> {book.pages} pages</span>
               <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {book.readTime}</span>
               <span className="flex items-center gap-1 text-amber-500"><span className="material-symbols-outlined text-[14px] font-variation-fill">star</span> {book.rating}</span>
             </div>
           </div>
           <div className="shrink-0 flex gap-2 w-full md:w-auto mt-2 md:mt-0">
             <button className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-[#1b366a] font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-colors hidden md:flex items-center justify-center gap-2">
               <Download size={14} /> Offline
             </button>
             <button className="flex-1 md:flex-none px-6 py-2 bg-[#1b366a] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#112349] shadow-md shadow-blue-900/20 transition-all text-center">
               Read
             </button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen flex flex-col font-body">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/student/dashboard')} className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
               <h1 className="text-2xl font-black font-headline text-slate-800 tracking-tight">Textbook Library</h1>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{massiveLibrary.length.toLocaleString()} Resources Available</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl w-full flex items-center gap-2">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search books, authors, topics..." 
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b366a]/50 focus:border-[#1b366a]"
               />
            </div>
            <select 
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#1b366a]/50 max-w-[150px] truncate"
            >
              <option value="All">All Domains</option>
              <option value="General Education">Gen Ed</option>
              <option value="Professional Education">Prof Ed</option>
              <option value="Major in English">English</option>
              <option value="Major in Math">Math</option>
              <option value="Major in Science">Science</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 h-[calc(100vh-140px)]">
        {filteredLibrary.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <BookOpen size={48} className="mb-4 opacity-50" />
             <p className="font-bold text-lg">No textbooks found matching your criteria.</p>
          </div>
        ) : (
          <List
            height={window.innerHeight - 180}
            itemCount={filteredLibrary.length}
            itemSize={window.innerWidth < 768 ? 160 : 120} // Adjust size based on rough breakpoint
            width="100%"
            className="no-scrollbar"
          >
            {Row}
          </List>
        )}
      </main>
    </div>
  );
}
