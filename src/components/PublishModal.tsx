import React, { useState } from 'react';
import { Sparkles, X, Users, Globe } from 'lucide-react';

export default function PublishModal({ 
  isOpen, 
  onClose, 
  onPublish, 
  module 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onPublish: (scope: 'public' | 'classes', classIds: string[]) => void;
  module: any;
}) {
  const [scope, setScope] = useState<'public' | 'classes'>(module.publishScope || 'public');
  const [classIds, setClassIds] = useState<string[]>(module.classIds || []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl border border-outline-variant p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-headline font-black text-on-surface flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            Publish Module
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant"><X size={20} /></button>
        </div>

        <div className="space-y-4 mb-8">
           <button 
             onClick={() => setScope('public')}
             className={`w-full p-4 rounded-xl border flex gap-4 ${scope === 'public' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
           >
             <Globe size={20} className={scope === 'public' ? 'text-primary' : 'text-on-surface-variant'} />
             <div className="text-left">
                <p className="font-bold text-sm">Public</p>
                <p className="text-xs text-on-surface-variant">Visible to all students assigned to this track.</p>
             </div>
           </button>
           <button 
             onClick={() => setScope('classes')}
             className={`w-full p-4 rounded-xl border flex gap-4 ${scope === 'classes' ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
           >
             <Users size={20} className={scope === 'classes' ? 'text-primary' : 'text-on-surface-variant'} />
             <div className="text-left">
                <p className="font-bold text-sm">Class-Specific</p>
                <p className="text-xs text-on-surface-variant">Visible only to selected classes.</p>
             </div>
           </button>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-bold text-xs text-on-surface-variant">Cancel</button>
          <button onClick={() => onPublish(scope, classIds)} className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:shadow-lg">Publish</button>
        </div>
      </div>
    </div>
  );
}
