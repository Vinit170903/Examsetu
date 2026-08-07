import React, { useState } from 'react';
import { CLASSES_LIST } from '../data/ncertData';
import { School, CheckCircle2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ClassSelectionScreenProps {
  onSaveClasses: (classes: string[]) => void;
  initialSelected?: string[];
}

export const ClassSelectionScreen: React.FC<ClassSelectionScreenProps> = ({ onSaveClasses, initialSelected = [] }) => {
  const { showToast } = useToast();
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set(initialSelected));

  const toggleClass = (classLabel: string) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classLabel)) {
      newSelected.delete(classLabel);
    } else {
      newSelected.add(classLabel);
    }
    setSelectedClasses(newSelected);
  };

  const handleSave = () => {
    if (selectedClasses.size === 0) {
      showToast("Please select at least one class.", "error");
      return;
    }
    onSaveClasses(Array.from(selectedClasses));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FBF7EE] min-h-screen">
      <div className="w-full max-w-[800px] bg-white px-[40px] py-[44px] shadow-[0_20px_50px_-24px_rgba(20,33,61,0.2)] rounded-[20px] relative">

        {/* Side Cutouts */}
        <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-[120px] -left-[13px]" />
        <div className="absolute w-[26px] h-[26px] bg-[#FBF7EE] rounded-full top-[120px] -right-[13px]" />

        {/* Header Section */}
        <div className="flex items-start gap-[20px] border-b border-dashed border-[#E4DCC8] pb-[24px] mb-[28px]">
          <div className="w-[48px] h-[48px] rounded-full border-2 border-dashed border-[#E29B2A] flex items-center justify-center shrink-0">
            <span className="text-[20px]">🏫</span>
          </div>
          <div>
            <div className="flex items-center gap-2 border border-[#2F7A52]/30 bg-[#2F7A52]/5 text-[#2F7A52] px-[12px] py-[4px] rounded-full w-fit mb-[12px]">
              <span className="w-[4px] h-[4px] rounded-full bg-[#2F7A52]" />
              <span className="font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-[0.05em] uppercase">
                Step 2 of 3 · Classroom Setup
              </span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-[26px] font-bold text-[#14213D] mb-[4px] tracking-tight">
              Which classes do you teach?
            </h1>
            <p className="font-['Inter'] text-[14px] text-[#8A8272]">
              Select the classes you want to manage. <span className="text-[#14213D] underline underline-offset-2 decoration-[#14213D]/30 font-medium">You can always change this later. </span>
            </p>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[16px] mb-[32px]">
          {CLASSES_LIST.map((cls) => {
            const isSelected = selectedClasses.has(cls.label);
            const classNum = cls.label.replace(/class/i, '').trim();

            return (
              <button
                key={cls.id}
                onClick={() => toggleClass(cls.label)}
                className={`relative rounded-[12px] p-[20px_16px] flex flex-col items-center justify-center transition-all cursor-pointer ${isSelected
                  ? 'bg-white border-[1.5px] border-[#E29B2A] shadow-[0_8px_20px_-8px_rgba(226,155,42,0.4)]'
                  : 'bg-[#FBF7EE] border-[1.5px] border-transparent hover:border-[#E4DCC8] hover:-translate-y-[2px]'
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-[8px] right-[10px] flex items-center gap-[4px] font-['IBM_Plex_Mono'] text-[#E29B2A] text-[8.5px] font-bold uppercase tracking-wide">
                    <CheckCircle2 className="w-[10px] h-[10px]" />
                    <span>SELECTED</span>
                  </div>
                )}

                <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center font-['Space_Grotesk'] font-bold text-[17px] mb-[12px] transition-colors shadow-sm ${isSelected ? 'bg-[#E29B2A] text-white' : 'bg-white text-[#14213D]'
                  }`}>
                  {classNum}
                </div>

                <h3 className="font-['Inter'] font-semibold text-[14.5px] text-[#14213D]">
                  {cls.label}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-[24px] border-t border-dashed border-[#E4DCC8]">
          <div className="font-['IBM_Plex_Mono'] text-[12px]">
            <span className="font-bold text-[#14213D]">{selectedClasses.size}</span>
            <span className="text-[#8A8272] ml-[6px]">classes selected</span>
          </div>

          <button
            onClick={handleSave}
            disabled={selectedClasses.size === 0}
            className="font-['Space_Grotesk'] font-bold text-[15px] px-[24px] py-[12px] rounded-[10px] bg-[#E29B2A] text-[#14213D] shadow-[0_10px_22px_-10px_rgba(226,155,42,0.6)] hover:-translate-y-[1px] hover:shadow-[0_12px_24px_-10px_rgba(226,155,42,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
          >
            Save & Continue →
          </button>
        </div>

      </div>
    </div>
  );
};
