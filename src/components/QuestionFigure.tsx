import { useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ImageIcon, 
  ZoomIn
} from 'lucide-react';
import { QuestionAttachment } from '../data/questionImages';

interface QuestionFigureProps {
  attachment: QuestionAttachment;
}

export default function QuestionFigure({ attachment }: QuestionFigureProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { title, figureLabel, imageUrl, caption } = attachment;

  return (
    <div className="mt-3.5 border border-slate-200/90 bg-white rounded-xl shadow-xs overflow-hidden">
      
      {/* Header bar */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-teal-100 text-teal-800 rounded-md shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-800 tracking-wide uppercase">
              {figureLabel}
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium ml-2">
              — {title}
            </span>
          </div>
        </div>

        {/* View Controls: Enlarge Fullscreen Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-teal-800 transition-colors cursor-pointer shadow-3xs"
          title="Click to enlarge"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Enlarge</span>
        </button>
      </div>

      {/* Direct Vector Image Display */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative group bg-slate-50/70 p-2 md:p-3 flex items-center justify-center cursor-zoom-in"
      >
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full max-h-[460px] object-contain rounded-lg border border-slate-200/90 shadow-2xs bg-white transition-all group-hover:shadow-sm"
        />

        {/* Hover Zoom Hint */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-lg">
          <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
            <ZoomIn className="w-3.5 h-3.5" />
            Click to View Full Size
          </span>
        </div>
      </div>

      {/* Caption footer */}
      {caption && (
        <div className="px-3 py-2 bg-white border-t border-slate-100 text-[11px] text-slate-500 italic">
          <strong className="text-slate-700 not-italic font-bold">Figure note: </strong>
          {caption}
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 bg-teal-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-200" />
                <h3 className="text-xs md:text-sm font-bold">
                  {figureLabel} — {title}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-teal-700 cursor-pointer"
                title="Close"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="p-4 md:p-6 overflow-y-auto flex items-center justify-center bg-slate-100">
              <img 
                src={imageUrl} 
                alt={title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl border border-slate-200 shadow-md bg-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <p className="text-slate-600 text-[11px] line-clamp-1">{caption}</p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ml-3"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
