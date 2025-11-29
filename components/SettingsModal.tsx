import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Icons } from './Icon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-6 animate-in zoom-in-95 duration-200 relative overflow-hidden border-[3px] border-black">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
          <Icons.Close size={20} strokeWidth={3} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-doodle font-bold text-black">CUSTOMIZE</h2>
          <p className="text-xs font-bold uppercase tracking-widest bg-yellow-300 inline-block px-1">Make it yours</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
                <label className="block text-[10px] font-bold text-black uppercase mb-1 ml-1">You</label>
                <input
                  type="text"
                  value={formData.name1}
                  onChange={(e) => setFormData({...formData, name1: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold text-black outline-none focus:bg-yellow-50"
                />
            </div>
            <div className="flex-1">
                <label className="block text-[10px] font-bold text-black uppercase mb-1 ml-1">Partner</label>
                <input
                  type="text"
                  value={formData.name2}
                  onChange={(e) => setFormData({...formData, name2: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold text-black outline-none focus:bg-yellow-50"
                />
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-bold text-black uppercase mb-1 ml-1">Tagline</label>
             <input
               type="text"
               value={formData.tagline}
               onChange={(e) => setFormData({...formData, tagline: e.target.value})}
               className="w-full px-3 py-2 bg-gray-50 border-2 border-black rounded-lg text-sm font-bold text-black outline-none focus:bg-yellow-50"
             />
          </div>
          
          <div className="flex items-center justify-between py-2 border-2 border-gray-100 rounded-lg px-2 mt-2">
             <span className="text-sm font-bold text-black font-doodle">DISPLAY DATE</span>
             <button 
              onClick={() => setFormData({...formData, showDate: !formData.showDate})}
              className={`w-10 h-6 rounded-full border-2 border-black transition-colors relative ${formData.showDate ? 'bg-green-400' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white border-2 border-black rounded-full transform transition-transform ${formData.showDate ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <button onClick={handleSave} className="w-full mt-6 py-3 bg-black text-white rounded-xl font-bold font-doodle text-xl border-2 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_#ccc] active:shadow-none active:translate-y-[2px]">
          SAVE CHANGES
        </button>
      </div>
    </div>
  );
};