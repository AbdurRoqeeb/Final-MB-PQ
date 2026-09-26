import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, 
  HelpCircle, 
  Sparkles, 
  BookMarked, 
  Copy, 
  Check, 
  CheckCircle,
  Calendar, 
  Search, 
  Filter, 
  Activity, 
  Scissors, 
  Users, 
  Brain
} from 'lucide-react';
import { database } from '../data/database';
import { getQuestionText } from '../data/pastQuestionsText';

export type DepartmentKey = "Internal Medicine" | "Surgery" | "Community Medicine" | "Psychiatry";

interface DepartmentMeta {
  key: DepartmentKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Activity;
}

export const DEPARTMENTS: DepartmentMeta[] = [
  {
    key: "Internal Medicine",
    label: "Internal Medicine",
    shortLabel: "Medicine",
    description: "Cardiology, Endocrinology, Nephrology, Pulmonology, Neurology, Gastroenterology, Dermatology",
    icon: Activity,
  },
  {
    key: "Surgery",
    label: "Surgery & Surgical Specialties",
    shortLabel: "Surgery",
    description: "General Surgery, Orthopaedics, Urology, Neurosurgery, ENT, Ophthalmology, Plastics, Anaesthesia",
    icon: Scissors,
  },
  {
    key: "Community Medicine",
    label: "Community Medicine & Public Health",
    shortLabel: "Community Med",
    description: "Epidemiology, Biostatistics, Occupational Health, Environmental Health, Maternal & Child Health",
    icon: Users,
  },
  {
    key: "Psychiatry",
    label: "Psychiatry & Behavioral Sciences",
    shortLabel: "Psychiatry",
    description: "Clinical Psychiatry, Psychopharmacology, Forensic Psychiatry, Addiction Medicine",
    icon: Brain,
  },
];

export interface ChronologicalQuestion {
  questionId: string;
  occurrence: string;
  topic: string;
  subspecialty: string;
  departmentKey: DepartmentKey;
  session: string;
  text?: string;
}

interface ChronologicalBrowseProps {
  bookmarkedTopics: string[];
  revisedTopics: string[];
  toggleBookmark: (topicName: string, e?: React.SyntheticEvent) => void;
  toggleRevised: (topicName: string, e?: React.SyntheticEvent) => void;
  handleStudyTopic: (specialty: string, subspecialty: string, topicName: string) => void;
  activeSpecialty?: string;
  // Optional backwards compatibility props if needed
  chronologicalIndex?: any;
  sortedYearsList?: string[];
  selectedYear?: string;
  setSelectedYear?: (year: string) => void;
}

// Score parsing helper for sorting years reverse chronologically
const parseYearToScore = (yearStr: string) => {
  const s = yearStr.toLowerCase().trim();
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  
  const yearMatch = s.match(/\d{4}/);
  if (!yearMatch) {
    if (s.includes("finals paper")) return 201700;
    if (s.includes("600l")) return 200600;
    return 0;
  }
  const year = parseInt(yearMatch[0], 10);
  
  let monthIndex = 0;
  months.forEach((m, idx) => {
    if (s.includes(m)) {
      monthIndex = idx + 1;
    }
  });
  
  return year * 100 + monthIndex;
};

// Natural question ordering helper: LAQs first, Qs, SAQs, numerical order
const parseQNumber = (s: string) => {
  const isLAQ = /laq/i.test(s);
  const isSAQ = /saq/i.test(s);
  const numMatch = s.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 999;
  const subMatch = s.match(/[a-zA-Z]$/);
  const sub = subMatch ? subMatch[0].toLowerCase() : "";
  const typeOrder = isLAQ ? 0 : (isSAQ ? 2 : 1);
  return { typeOrder, num, sub };
};

export default function ChronologicalBrowse({
  bookmarkedTopics,
  revisedTopics,
  toggleBookmark,
  toggleRevised,
  handleStudyTopic,
  activeSpecialty = "Internal Medicine"
}: ChronologicalBrowseProps) {

  // Selected Department state (default to activeSpecialty if valid, otherwise Internal Medicine)
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>(() => {
    if (activeSpecialty === "Psychiatry") return "Psychiatry";
    if (activeSpecialty === "Surgery") return "Surgery";
    if (activeSpecialty === "Community Medicine") return "Community Medicine";
    return "Internal Medicine";
  });

  // Build the complete Department-organized index
  const departmentData = useMemo(() => {
    const data: Record<DepartmentKey, Record<string, ChronologicalQuestion[]>> = {
      "Internal Medicine": {},
      "Surgery": {},
      "Community Medicine": {},
      "Psychiatry": {}
    };

    for (const dept of DEPARTMENTS) {
      const subMap = database[dept.key] || {};
      for (const [subspecialty, topics] of Object.entries(subMap)) {
        for (const t of topics) {
          for (const occ of t.occurrences) {
            let qId = "Q";
            let rawSession = occ.trim();
            if (occ.includes(",")) {
              const parts = occ.split(",");
              qId = parts[0].trim();
              rawSession = parts.slice(1).join(",").trim();
            } else {
              const match = occ.match(/^([QLSAQ]+\s*\d+[a-z]?)\s+(.+)$/i);
              if (match) {
                qId = match[1].trim();
                rawSession = match[2].trim();
              }
            }

            // Clean session name by removing redundant department tags
            const cleanSession = rawSession
              .replace(/\s*\((Surgery|Comm\.?\s*Med\.?|Psychiatry)\)/gi, "")
              .trim();

            if (!data[dept.key][cleanSession]) {
              data[dept.key][cleanSession] = [];
            }

            const text = getQuestionText(occ, t.topic, dept.key);

            data[dept.key][cleanSession].push({
              questionId: qId,
              occurrence: occ,
              topic: t.topic,
              subspecialty,
              departmentKey: dept.key,
              session: cleanSession,
              text
            });
          }
        }
      }

      // Sort questions inside each session naturally
      for (const session of Object.keys(data[dept.key])) {
        data[dept.key][session].sort((a, b) => {
          const pa = parseQNumber(a.questionId);
          const pb = parseQNumber(b.questionId);
          if (pa.typeOrder !== pb.typeOrder) return pa.typeOrder - pb.typeOrder;
          if (pa.num !== pb.num) return pa.num - pb.num;
          return pa.sub.localeCompare(pb.sub);
        });
      }
    }

    return data;
  }, []);

  // Sorted list of available years/sessions for the selected department
  const availableSessionsForDept = useMemo(() => {
    const sessions = Object.keys(departmentData[selectedDept] || {});
    return sessions.sort((a, b) => parseYearToScore(b) - parseYearToScore(a));
  }, [departmentData, selectedDept]);

  // Active selected session for the current department
  const [selectedSession, setSelectedSession] = useState<string>("");

  // Keep session selection valid when department changes
  useEffect(() => {
    if (availableSessionsForDept.length > 0) {
      if (!availableSessionsForDept.includes(selectedSession)) {
        setSelectedSession(availableSessionsForDept[0]);
      }
    } else {
      setSelectedSession("");
    }
  }, [availableSessionsForDept, selectedSession]);

  // Search & subspecialty filter within current exam paper
  const [sessionSearchQuery, setSessionSearchQuery] = useState<string>("");
  const [selectedSubspecialtyFilter, setSelectedSubspecialtyFilter] = useState<string>("All");

  // Reset filters on session or department change
  useEffect(() => {
    setSessionSearchQuery("");
    setSelectedSubspecialtyFilter("All");
  }, [selectedDept, selectedSession]);

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Questions in current session
  const currentSessionQuestions = useMemo(() => {
    if (!selectedSession || !departmentData[selectedDept]?.[selectedSession]) {
      return [];
    }
    return departmentData[selectedDept][selectedSession];
  }, [departmentData, selectedDept, selectedSession]);

  // Distinct subspecialties in current session for quick filter
  const distinctSubspecialties = useMemo(() => {
    const set = new Set<string>();
    currentSessionQuestions.forEach((q) => set.add(q.subspecialty));
    return Array.from(set).sort();
  }, [currentSessionQuestions]);

  // Filtered questions based on search & subspecialty pill
  const filteredQuestions = useMemo(() => {
    return currentSessionQuestions.filter((q) => {
      // Subspecialty filter
      if (selectedSubspecialtyFilter !== "All" && q.subspecialty !== selectedSubspecialtyFilter) {
        return false;
      }
      // Search keyword filter
      if (sessionSearchQuery.trim()) {
        const query = sessionSearchQuery.toLowerCase().trim();
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesId = q.questionId.toLowerCase().includes(query);
        const matchesSub = q.subspecialty.toLowerCase().includes(query);
        const matchesText = q.text ? q.text.toLowerCase().includes(query) : false;
        return matchesTopic || matchesId || matchesSub || matchesText;
      }
      return true;
    });
  }, [currentSessionQuestions, selectedSubspecialtyFilter, sessionSearchQuery]);

  // Current session stats
  const sessionStats = useMemo(() => {
    const total = currentSessionQuestions.length;
    const revised = currentSessionQuestions.filter((q) => revisedTopics.includes(q.topic)).length;
    const bookmarked = currentSessionQuestions.filter((q) => bookmarkedTopics.includes(q.topic)).length;
    const percentRevised = total > 0 ? Math.round((revised / total) * 100) : 0;
    return { total, revised, bookmarked, percentRevised };
  }, [currentSessionQuestions, revisedTopics, bookmarkedTopics]);

  // Session badge tag helper
  const getSessionBadge = (sessionName: string) => {
    const s = sessionName.toLowerCase();
    if (s.includes("mock") || s.includes("march 2024")) {
      return { label: "Mock Exam", color: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    if (s.includes("finals paper")) {
      return { label: "Paper II", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    if (s.includes("600l")) {
      return { label: "Posting Exam", color: "bg-purple-100 text-purple-800 border-purple-200" };
    }
    if (s.includes("2025")) {
      return { label: "Latest Diet", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
      
      {/* 1. Top Department Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-3 md:px-8 py-2.5 shrink-0 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1 hidden lg:inline">
              Department:
            </span>
            
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDept === dept.key;
              const sessionCount = Object.keys(departmentData[dept.key] || {}).length;
              const questionCount = Object.values(departmentData[dept.key] || {}).reduce((sum, list) => sum + list.length, 0);

              return (
                <button
                  key={dept.key}
                  onClick={() => setSelectedDept(dept.key)}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${isSelected ? "text-teal-200" : "text-slate-500"}`} />
                  <span className="whitespace-nowrap">{dept.shortLabel}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                    isSelected ? "bg-teal-800/80 text-teal-100" : "bg-slate-200 text-slate-600"
                  }`}>
                    {sessionCount} diets ({questionCount} Qs)
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Organized Chronological Browser</span>
          </div>

        </div>
      </div>

      {/* 2. Main Content Split: Sessions Sidebar (Left) + Questions View (Right) */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row min-h-0">
        
        {/* Mobile Horizontal Sessions Scroller (<lg screens) */}
        <div className="lg:hidden bg-slate-50 border-b border-slate-200/80 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1">
            Exam Diet:
          </span>
          {availableSessionsForDept.map((session) => {
            const count = (departmentData[selectedDept]?.[session] || []).length;
            const isSelected = selectedSession === session;
            const badge = getSessionBadge(session);

            return (
              <button
                key={session}
                onClick={() => setSelectedSession(session)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{session}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? "bg-teal-800 text-teal-100" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
                {badge && (
                  <span className="text-[9px] px-1 rounded font-extrabold bg-amber-400 text-amber-950">
                    {badge.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Sidebar: Sessions / Exam Diets (lg+ screens) */}
        <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0 shadow-xs">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Available Diets
              </h3>
              <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                {availableSessionsForDept.length} Sessions
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
              Select an examination paper to review all essay prompts in order.
            </p>
          </div>

          {/* List of neatly arranged sessions */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {availableSessionsForDept.map((session) => {
              const questions = departmentData[selectedDept]?.[session] || [];
              const isSelected = selectedSession === session;
              const badge = getSessionBadge(session);
              const revisedInSession = questions.filter((q) => revisedTopics.includes(q.topic)).length;
              const isFullyRevised = questions.length > 0 && revisedInSession === questions.length;

              return (
                <button
                  key={session}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? "bg-teal-50 border-teal-600 shadow-2xs ring-1 ring-teal-600/30"
                      : "bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold leading-tight ${isSelected ? "text-teal-900" : "text-slate-800"}`}>
                      {session}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 border border-slate-200/50"
                    }`}>
                      {questions.length} Qs
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      {badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      )}
                      <span>Part IV Final MB</span>
                    </div>

                    {revisedInSession > 0 && (
                      <span className={`flex items-center gap-0.5 font-bold ${
                        isFullyRevised ? "text-emerald-600" : "text-slate-500"
                      }`}>
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        {revisedInSession}/{questions.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Department summary block in sidebar bottom */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">{selectedDept}</span>:{" "}
            {Object.values(departmentData[selectedDept] || {}).reduce((s, list) => s + list.length, 0)} total essay questions indexed.
          </div>
        </aside>

        {/* Main Area: Questions in the Selected Paper */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-100">
          
          <div className="flex-1 p-3 md:p-6 flex flex-col gap-3 md:gap-4 overflow-y-auto min-w-0">
            {/* Paper Overview Header Card */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex flex-col gap-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {selectedDept}
                  </span>
                  {getSessionBadge(selectedSession) && (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSessionBadge(selectedSession)!.color}`}>
                      {getSessionBadge(selectedSession)!.label}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                    &bull; Final MBBS Examination Diet
                  </span>
                </div>

                <h2 className="text-base md:text-xl font-extrabold text-slate-900 mt-1 tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-700 shrink-0" />
                  <span>{selectedSession} Past Examination Paper</span>
                </h2>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Paper Progress
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {sessionStats.revised} of {sessionStats.total} Revised ({sessionStats.percentRevised}%)
                  </span>
                </div>
                <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${sessionStats.percentRevised}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Subspecialties & In-Paper Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-1">
              
              {/* Subspecialty Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Filter:
                </span>
                
                <button
                  onClick={() => setSelectedSubspecialtyFilter("All")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    selectedSubspecialtyFilter === "All"
                      ? "bg-slate-800 text-white shadow-3xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({currentSessionQuestions.length})
                </button>

                {distinctSubspecialties.map((sub) => {
                  const countInSub = currentSessionQuestions.filter((q) => q.subspecialty === sub).length;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubspecialtyFilter(sub)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        selectedSubspecialtyFilter === sub
                          ? "bg-teal-700 text-white shadow-3xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {sub} ({countInSub})
                    </button>
                  );
                })}
              </div>

              {/* In-paper search input */}
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter this paper..."
                  value={sessionSearchQuery}
                  onChange={(e) => setSessionSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

            </div>

          </div>

          {/* List of Questions */}
          <div className="space-y-3 flex-1 min-h-[300px]">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <HelpCircle className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-sm font-bold text-slate-800">No matching questions found</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {sessionSearchQuery
                    ? `No questions matched "${sessionSearchQuery}". Clear your search keyword.`
                    : "No questions recorded for this subspecialty filter."}
                </p>
                {(sessionSearchQuery || selectedSubspecialtyFilter !== "All") && (
                  <button
                    onClick={() => {
                      setSessionSearchQuery("");
                      setSelectedSubspecialtyFilter("All");
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isBookmarked = bookmarkedTopics.includes(q.topic);
                const isRevised = revisedTopics.includes(q.topic);
                const questionText = q.text || getQuestionText(q.occurrence, q.topic, q.departmentKey);
                const isCopied = copiedKey === `${selectedDept}-${selectedSession}-${idx}`;

                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all overflow-hidden p-4 md:p-5 flex flex-col gap-3"
                  >
                    
                    {/* Question Header: Number, Subspecialty, Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-teal-100 text-teal-900 border border-teal-200 font-mono font-black px-2.5 py-0.5 rounded-md text-xs shrink-0 shadow-3xs">
                          {q.questionId}
                        </span>
                        
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {q.subspecialty}
                        </span>

                        {isRevised && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Revised
                          </span>
                        )}

                        {isBookmarked && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BookMarked className="w-3 h-3 text-amber-600 fill-amber-300" />
                            Bookmarked
                          </span>
                        )}
                      </div>

                      {/* Action buttons: Study Topic, Bookmark, Revised */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        <button
                          title={isRevised ? "Mark as unread" : "Mark as revised"}
                          onClick={(e) => toggleRevised(q.topic, e)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isRevised
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isRevised ? "fill-emerald-200 text-emerald-600" : ""}`} />
                        </button>

                        <button
                          title={isBookmarked ? "Remove bookmark" : "Add to study list"}
                          onClick={(e) => toggleBookmark(q.topic, e)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isBookmarked
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : "bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                          }`}
                        >
                          <BookMarked className={`w-4 h-4 ${isBookmarked ? "fill-amber-200 text-amber-600" : ""}`} />
                        </button>

                        <button
                          onClick={() => handleStudyTopic(q.departmentKey, q.subspecialty, q.topic)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer shadow-3xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                          <span>Study Topic</span>
                        </button>
                      </div>
                    </div>

                    {/* Topic Title */}
                    <div>
                      <h4 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                        {q.topic}
                      </h4>
                    </div>

                    {/* Verbatim Question Prompt Block */}
                    {questionText ? (
                      <div className="p-3.5 md:p-4 bg-slate-50 border border-slate-200/90 rounded-xl text-xs md:text-[13px] text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-3xs relative pl-8 border-l-4 border-l-teal-600">
                        <span className="absolute left-2.5 top-2.5 text-teal-500 font-serif text-2xl font-black select-none leading-none">&ldquo;</span>
                        
                        <div className="flex items-center justify-end mb-1.5">
                          <button
                            onClick={(e) => handleCopy(questionText, `${selectedDept}-${selectedSession}-${idx}`, e)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-teal-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-3xs"
                            title="Copy question text to clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>

                        {questionText}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-400 italic">
                        Standard essay format. Click "Study Topic" above to view curriculum study guidelines and key clinical concepts.
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          </div>

          {/* Solid grounded footer docked at bottom */}
          <footer className="shrink-0 bg-white border-t border-slate-200 px-3 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium z-10 shadow-2xs">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-600">Built by <strong className="font-semibold text-slate-800">Ismail Abdur-Roqeeb</strong> for <strong className="font-bold text-teal-700">The Dilectus</strong></span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              {selectedDept} &bull; {selectedSession} ({filteredQuestions.length} Questions)
            </div>
          </footer>

        </main>

      </div>

    </div>
  );
}
