import { Award, HelpCircle, Sparkles, BookMarked } from 'lucide-react';

interface ChronologicalBrowseProps {
  chronologicalIndex: {
    [year: string]: {
      [specialty: string]: {
        questionId: string;
        subspecialty: string;
        topic: string;
      }[];
    };
  };
  sortedYearsList: string[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  bookmarkedTopics: string[];
  revisedTopics: string[];
  handleStudyTopic: (specialty: string, subspecialty: string, topicName: string) => void;
}

export default function ChronologicalBrowse({
  chronologicalIndex,
  sortedYearsList,
  selectedYear,
  setSelectedYear,
  bookmarkedTopics,
  revisedTopics,
  handleStudyTopic,
}: ChronologicalBrowseProps) {
  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row bg-slate-100">
      
      {/* Left Sidebar: Years / Papers List */}
      <aside className="w-full lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 overflow-y-auto max-h-[200px] sm:max-h-[240px] lg:max-h-none flex flex-col shadow-sm">
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Exam Year / Paper</p>
        </div>
        
        <div className="space-y-1 overflow-y-auto pr-1 flex-1">
          {sortedYearsList.map((year) => {
            const totalInYear = Object.values(chronologicalIndex[year] || {}).reduce((sum, list) => sum + list.length, 0);
            
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left w-full text-xs font-medium ${
                  selectedYear === year
                    ? "bg-teal-50 text-teal-900 font-extrabold border-l-4 border-l-teal-600 shadow-3xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="truncate pr-2">{year}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  selectedYear === year ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {totalInYear}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Area: List of Questions categorized by specialty/course block */}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto min-w-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-teal-700" />
            {selectedYear} Past Paper Examination
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Chronological index of essay questions asked in the {selectedYear} examination, categorized by clinical block. Click <strong>"Study Topic"</strong> to view clinical analysis and revision guidelines.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          {(!chronologicalIndex[selectedYear] || Object.keys(chronologicalIndex[selectedYear]).length === 0) ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
              <HelpCircle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">No questions indexed for this session</h3>
            </div>
          ) : (
            ["Internal Medicine", "Surgery", "Community Medicine"].map((spec) => {
              const questions = chronologicalIndex[selectedYear]?.[spec] || [];
              if (questions.length === 0) return null;

              return (
                <div key={spec} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      {spec} Block
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2.5 py-0.5 rounded-full">
                      {questions.length} Question{questions.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {questions.map((q, idx) => {
                      const isBookmarked = bookmarkedTopics.includes(q.topic);
                      const isRevised = revisedTopics.includes(q.topic);

                      return (
                        <div key={idx} className="p-4 hover:bg-slate-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="bg-teal-100 text-teal-800 font-mono font-extrabold px-2.5 py-0.5 rounded text-xs mt-0.5 shrink-0">
                              {q.questionId}
                            </span>
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                <span>{q.subspecialty}</span>
                                {isRevised && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                    Revised
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-snug">
                                {q.topic}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center shrink-0">
                            {/* Checklist status indicators */}
                            {isBookmarked && (
                              <span title="Bookmarked in Study List" className="p-1 text-amber-500 bg-amber-50 rounded border border-amber-100">
                                <BookMarked className="w-3.5 h-3.5 fill-amber-100" />
                              </span>
                            )}
                            <button
                              onClick={() => handleStudyTopic(spec, q.subspecialty, q.topic)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                              <span>Study Topic</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer status bar specific to chronological browse */}
        <footer className="flex flex-col sm:flex-row items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-400 font-medium shrink-0 gap-2 shadow-3xs">
          <div>
            <span>&copy; Clinical Curriculum Analyst v2.5</span>
          </div>
          <div className="font-bold uppercase tracking-wider text-teal-700">
            Chronological Browse Mode &bull; {selectedYear} Session
          </div>
        </footer>
      </main>
      
    </div>
  );
}
