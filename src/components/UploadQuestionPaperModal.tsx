import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  FolderPlus,
  Check,
  History,
  ArrowRight
} from 'lucide-react';
import {
  ParsedQuestionItem,
  ParsedPaperResult,
  saveUploadedQuestions,
  getUploadHistory,
  clearCustomDatabase,
  UploadHistoryItem,
} from '../data/customQuestionsStore';

const DEPARTMENT_OPTIONS = [
  'Internal Medicine',
  'Surgery',
  'Community Medicine',
  'Psychiatry',
];

const SUBSPECIALTIES_BY_DEPT: Record<string, string[]> = {
  'Internal Medicine': [
    'Cardiology',
    'Endocrinology',
    'Nephrology',
    'Neurology',
    'Gastroenterology',
    'Pulmonology',
    'Dermatology',
    'Medical Ethics',
    'Oncology',
    'Infectious Diseases',
    'Rheumatology',
    'Hematology',
  ],
  Surgery: [
    'General Surgery',
    'Orthopaedics',
    'Urology',
    'Plastics',
    'Anaesthesia',
    'Otolaryngology / ENT',
    'Ophthalmology',
    'Neurosurgery',
    'Pediatric Surgery',
    'Cardiothoracic Surgery',
    'Radiology',
  ],
  'Community Medicine': [
    'Epidemiology',
    'Biostatistics',
    'Occupational Health',
    'Environmental Health',
    'Health Management',
    'Primary Health Care',
    'Demographics',
    'Social & Rehabilitative Medicine',
    'Medical Ethics',
  ],
  Psychiatry: [
    'Clinical Psychiatry',
    'Psychopharmacology',
    'Forensic Psychiatry',
    'Psychological Interventions',
    'Addiction Medicine',
  ],
};

interface UploadQuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsSaved: (result: {
    occurrencesAdded: string[];
    departmentsAffected: string[];
    targetSpecialty?: string;
    targetDiet?: string;
  }) => void;
}

export default function UploadQuestionPaperModal({
  isOpen,
  onClose,
  onQuestionsSaved,
}: UploadQuestionPaperModalProps) {
  // Tabs: 'upload' | 'review' | 'history'
  const [modalTab, setModalTab] = useState<'upload' | 'review' | 'history'>('upload');

  // Upload input state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Loading & Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgressStage, setScanProgressStage] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Review & Edit state
  const [paperTitle, setPaperTitle] = useState('');
  const [paperDiet, setPaperDiet] = useState('');
  const [isMockExam, setIsMockExam] = useState(true);
  const [paperType, setPaperType] = useState('Paper II (Theory)');
  const [dominantDept, setDominantDept] = useState('Surgery');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestionItem[]>([]);

  // Success state
  const [saveSuccessInfo, setSaveSuccessInfo] = useState<{
    count: number;
    departments: string[];
    diet: string;
  } | null>(null);

  // Upload history
  const [historyList, setHistoryList] = useState<UploadHistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistoryList(getUploadHistory());
      setScanError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle file select
  const handleFileChange = (file: File) => {
    setImageFile(file);
    setScanError(null);
    setSaveSuccessInfo(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Preload sample paper photo
  const handleLoadSample = async () => {
    try {
      setScanError(null);
      const sampleUrl = '/assets/aistudio/IMG_20261022_022022_b731f14c.jpg';
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], 'Mock_Exam_Surgery_Oct2026.jpg', { type: 'image/jpeg' });
      handleFileChange(file);
    } catch (err: any) {
      setScanError('Could not load sample image: ' + err.message);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Run Gemini Vision OCR & Categorization
  const handleStartScan = async () => {
    if (!imagePreview) {
      setScanError('Please select or take a photo of an exam paper first.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanProgressStage(1);

    // Simulate progressive status ticks for smooth UX while network request completes
    const timer1 = setTimeout(() => setScanProgressStage(2), 2200);
    const timer2 = setTimeout(() => setScanProgressStage(3), 4800);

    try {
      const payload = {
        imageBase64: imagePreview,
        mimeType: imageFile?.type || 'image/jpeg',
        fileName: imageFile?.name || 'question_paper.jpg',
      };

      const res = await fetch('/api/parse-question-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Scan failed with HTTP status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Invalid response from vision service');
      }

      const data: ParsedPaperResult = json.data;

      // Populate review state
      setPaperTitle(data.examTitle || 'Medical Examination Paper');
      setPaperDiet(data.examDiet || 'October 2026');
      setIsMockExam(data.isMockExam ?? true);
      setPaperType(data.paperType || 'Paper II (Theory)');
      setDominantDept(data.department || 'Surgery');

      const mappedQuestions: ParsedQuestionItem[] = (data.questions || []).map((q: any, idx: number) => ({
        id: `q_${Date.now()}_${idx}`,
        questionNumber: q.questionNumber || `Q${idx + 1}`,
        department: q.department || data.department || 'Surgery',
        subspecialty: q.subspecialty || 'General Surgery',
        topic: q.topic || 'Clinical Evaluation and Management',
        fullQuestionText: q.fullQuestionText || '',
        marks: q.marks || '',
      }));

      setParsedQuestions(mappedQuestions);
      setModalTab('review');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(
        err.message ||
          'Failed to scan image. Please verify your connection or ensure image text is legible.'
      );
    } finally {
      setIsScanning(false);
      setScanProgressStage(0);
    }
  };

  // Modify individual question in review table
  const handleUpdateQuestion = (index: number, updates: Partial<ParsedQuestionItem>) => {
    setParsedQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      // If department changed, update subspecialty to first suggestion of that department
      if (updates.department && updates.department !== prev[index].department) {
        const availableSubs = SUBSPECIALTIES_BY_DEPT[updates.department] || [];
        if (availableSubs.length > 0 && !availableSubs.includes(next[index].subspecialty)) {
          next[index].subspecialty = availableSubs[0];
        }
      }
      return next;
    });
  };

  // Add empty manual question
  const handleAddQuestion = () => {
    const defaultDept = dominantDept || 'Surgery';
    const defaultSubs = SUBSPECIALTIES_BY_DEPT[defaultDept] || ['General Surgery'];
    const newQ: ParsedQuestionItem = {
      id: `q_manual_${Date.now()}`,
      questionNumber: `Q${parsedQuestions.length + 1}`,
      department: defaultDept,
      subspecialty: defaultSubs[0] || 'General',
      topic: 'New Clinical Topic',
      fullQuestionText: '',
      marks: '',
    };
    setParsedQuestions((prev) => [...prev, newQ]);
  };

  // Delete question from review list
  const handleDeleteQuestion = (index: number) => {
    setParsedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Commit & Save parsed questions to the application database
  const handleConfirmSave = () => {
    if (parsedQuestions.length === 0) {
      setScanError('Please include at least one question to save.');
      return;
    }

    const result = saveUploadedQuestions(
      {
        examTitle: paperTitle,
        examDiet: paperDiet,
        isMockExam: isMockExam,
        paperType: paperType,
        imagePreview: imagePreview || undefined,
      },
      parsedQuestions
    );

    // Update history list in modal
    setHistoryList(getUploadHistory());

    setSaveSuccessInfo({
      count: parsedQuestions.length,
      departments: result.departmentsAffected,
      diet: paperDiet,
    });

    onQuestionsSaved({
      occurrencesAdded: result.occurrencesAdded,
      departmentsAffected: result.departmentsAffected,
      targetSpecialty: dominantDept,
      targetDiet: paperDiet,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-700/60 rounded-xl border border-teal-600/40 shadow-xs">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide flex items-center gap-2">
                Upload Question Paper
                <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-600/60 px-2 py-0.5 rounded-full text-teal-100 border border-teal-500/40">
                  AI Auto-Sort
                </span>
              </h2>
              <p className="text-xs text-teal-200/90 font-medium">
                Photo OCR with automatic medical specialty, subspecialty & topic sorting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalTab(modalTab === 'history' ? 'upload' : 'history')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                modalTab === 'history'
                  ? 'bg-teal-700 text-white border border-teal-500/50'
                  : 'text-teal-200 hover:bg-teal-700/50'
              }`}
              title="View Upload History"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History ({historyList.length})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/60">
          
          {/* TAB 1: UPLOAD & SCAN */}
          {modalTab === 'upload' && !saveSuccessInfo && (
            <div className="space-y-4">
              
              {/* Informational banner */}
              <div className="bg-teal-50 border border-teal-200/80 rounded-xl p-3 flex items-start gap-3">
                <FileText className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-900 leading-relaxed">
                  <span className="font-bold">How it works:</span> Take or select a photo of a printed or handwritten past question paper. The system will transcribe each question, determine its clinical syllabus topic, and place it into the correct Department (Medicine, Surgery, Community Med, or Psychiatry) for immediate frequency tracking.
                </div>
              </div>

              {/* Upload Dropzone */}
              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all bg-white flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs border border-teal-100">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Drop question paper image here, or{' '}
                      <span className="text-teal-700 underline font-extrabold">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (camera photos, scans, screenshots)
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Select Image
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                      Take Photo
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Try Mock Paper Sample (Oct 2026)
                    </button>
                  </div>
                </div>
              ) : (
                /* Image Preview & Scan trigger */
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* Thumbnail preview with relative overlay */}
                    <div className="relative w-full md:w-56 h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group">
                      <img
                        src={imagePreview}
                        alt="Question paper preview"
                        className="w-full h-full object-contain"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 bg-teal-900/30 backdrop-blur-2xs flex flex-col items-center justify-center">
                          <div className="w-full h-1 bg-teal-400 absolute top-0 animate-pulse shadow-lg shadow-teal-400/80" />
                          <RefreshCw className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Paper info and scanning controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Ready for AI Processing
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 mt-1">
                            {imageFile?.name || 'Medical Question Paper Photo'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB • ` : ''}
                            Gemini 3.8 Flash Vision Model
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isScanning}
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>

                      {/* Scanning stages display */}
                      {isScanning ? (
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5 text-teal-800">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                              Analyzing question paper...
                            </span>
                            <span className="text-[11px] text-teal-700 font-semibold">
                              {scanProgressStage === 1 && 'Step 1/3: Reading image text'}
                              {scanProgressStage === 2 && 'Step 2/3: Medical OCR transcription'}
                              {scanProgressStage === 3 && 'Step 3/3: Auto-sorting syllabus topics'}
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                              style={{
                                width:
                                  scanProgressStage === 1
                                    ? '35%'
                                    : scanProgressStage === 2
                                    ? '70%'
                                    : '90%',
                              }}
                            />
                          </div>

                          <p className="text-[11px] text-slate-500 italic">
                            Examining font, subquestions, and clinical themes to determine specialty and high-yield topic segments...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Click <span className="font-bold text-slate-800">Start AI Extraction</span>. The Gemini engine will parse every question, assign the appropriate department, subspecialty, and syllabus topic, and let you review each entry before adding it to the tracker.
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleStartScan}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-teal-200" />
                              Start AI Extraction & Auto-Sort
                            </button>

                            <button
                              type="button"
                              onClick={handleLoadSample}
                              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                              title="Switch to October 2026 Mock Sample Paper"
                            >
                              Load Sample Paper
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error display */}
              {scanError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Extraction notice:</span> {scanError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEW & EDIT PARSED QUESTIONS */}
          {modalTab === 'review' && !saveSuccessInfo && (
            <div className="space-y-4">
              
              {/* Top Banner with Exam Metadata */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                      Step 2: Review & Confirm Auto-Sorted Questions ({parsedQuestions.length} Found)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalTab('upload')}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    ← Rescan / Choose different image
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-teal-600"
                      placeholder="e.g. Mock Examination in Surgery"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Exam Diet / Session
                    </label>
                    <input
                      type="text"
                      value={paperDiet}
                      onChange={(e) => setPaperDiet(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-teal-600"
                      placeholder="e.g. October 2026, April 2024"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Paper Type
                    </label>
                    <input
                      type="text"
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-teal-600"
                      placeholder="e.g. Paper II (Theory)"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isMockExam}
                        onChange={(e) => setIsMockExam(e.target.checked)}
                        className="rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                      />
                      <span>Is Mock Exam</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {parsedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-2.5 transition-all hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={q.questionNumber}
                          onChange={(e) => handleUpdateQuestion(idx, { questionNumber: e.target.value })}
                          className="w-20 text-xs font-black px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-teal-900 focus:outline-teal-600"
                          placeholder="e.g. LAQ 1"
                        />
                        {q.marks && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {q.marks}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Department selector */}
                        <select
                          value={q.department}
                          onChange={(e) => handleUpdateQuestion(idx, { department: e.target.value })}
                          className="text-xs font-bold px-2 py-1 rounded bg-teal-50 border border-teal-200 text-teal-900 focus:outline-teal-600 cursor-pointer"
                        >
                          {DEPARTMENT_OPTIONS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>

                        {/* Subspecialty selector */}
                        <select
                          value={q.subspecialty}
                          onChange={(e) => handleUpdateQuestion(idx, { subspecialty: e.target.value })}
                          className="text-xs font-medium px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 focus:outline-teal-600 cursor-pointer max-w-[150px] truncate"
                        >
                          {(SUBSPECIALTIES_BY_DEPT[q.department] || []).map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                          <option value="General">General</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove this question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Syllabus Topic Mapping */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Syllabus Topic Categorization
                      </label>
                      <input
                        type="text"
                        value={q.topic}
                        onChange={(e) => handleUpdateQuestion(idx, { topic: e.target.value })}
                        className="w-full text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-teal-600"
                        placeholder="e.g. Blood Transfusion Indications, Procedures & Complications"
                      />
                    </div>

                    {/* Verbatim Question Text */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Transcribed Verbatim Question Text (Editable)
                      </label>
                      <textarea
                        rows={3}
                        value={q.fullQuestionText}
                        onChange={(e) => handleUpdateQuestion(idx, { fullQuestionText: e.target.value })}
                        className="w-full text-xs text-slate-800 leading-relaxed p-2 bg-slate-50/70 border border-slate-200 rounded focus:outline-teal-600 font-mono"
                        placeholder="Question text..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add question manually button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-teal-500 text-xs font-bold text-slate-700 hover:text-teal-800 transition-colors flex items-center gap-1.5 bg-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  Add Another Question
                </button>

                <div className="text-xs text-slate-500">
                  Ready to sort <span className="font-bold text-slate-800">{parsedQuestions.length}</span> question{parsedQuestions.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {saveSuccessInfo && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Questions Successfully Sorted & Saved!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
                  {saveSuccessInfo.count} past questions from{' '}
                  <span className="font-bold text-teal-800">{saveSuccessInfo.diet}</span> have been automatically integrated into the syllabus frequency matrix and by-year index.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {saveSuccessInfo.departments.map((d) => (
                  <span
                    key={d}
                    className="text-xs font-extrabold bg-teal-50 text-teal-900 border border-teal-200 px-3 py-1 rounded-full"
                  >
                    ✓ {d} Updated
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessInfo(null);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  View in Question Bank
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessInfo(null);
                    setImageFile(null);
                    setImagePreview(null);
                    setParsedQuestions([]);
                    setModalTab('upload');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
                >
                  Upload Another Paper
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD HISTORY */}
          {modalTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Uploaded Question Papers ({historyList.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Papers added to this session (stored in local browser database)
                  </p>
                </div>

                {historyList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all custom uploaded papers and reset to the base syllabus?')) {
                        clearCustomDatabase();
                        setHistoryList([]);
                        onQuestionsSaved({
                          occurrencesAdded: [],
                          departmentsAffected: ['Surgery', 'Internal Medicine', 'Community Medicine', 'Psychiatry'],
                        });
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset Custom Uploads
                  </button>
                )}
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No custom question papers uploaded yet. Upload a photo or scan to add new questions!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.imagePreview ? (
                          <img
                            src={item.imagePreview}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 font-bold text-xs">
                            DOC
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-800">{item.examTitle}</h5>
                            {item.isMockExam && (
                              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                Mock
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Diet: <span className="font-semibold text-slate-700">{item.examDiet}</span> •{' '}
                            {item.questionCount} Questions indexed •{' '}
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.departments.map((dept) => (
                              <span
                                key={dept}
                                className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Indexed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {modalTab === 'upload' && 'Select an image or take a photo to begin.'}
            {modalTab === 'review' && 'Review each question and edit categorization if desired.'}
            {modalTab === 'history' && 'Uploaded papers persist in your browser storage.'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {modalTab === 'review' && !saveSuccessInfo && (
              <>
                <button
                  type="button"
                  onClick={() => setModalTab('upload')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-teal-200" />
                  Save & Sort into Question Bank
                </button>
              </>
            )}

            {(modalTab === 'upload' || modalTab === 'history' || saveSuccessInfo) && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
