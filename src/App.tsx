import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookMarked, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Award,
  BookOpen,
  Filter,
  Flame,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { database, SpecialtyData } from './data/database';
import ChronologicalBrowse from './components/ChronologicalBrowse';

export default function App() {
  // View mode switcher: "frequency" | "chronological"
  const [activeTab, setActiveTab] = useState<string>("frequency");
  
  // Selected year for chronological tab
  const [selectedYear, setSelectedYear] = useState<string>("Jan 2025");

  // Navigation & Specialty Tabs
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Internal Medicine");
  const [selectedSubspecialty, setSelectedSubspecialty] = useState<string>("All");
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHighYieldOnly, setShowHighYieldOnly] = useState<boolean>(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);
  const [showRevisedOnly, setShowRevisedOnly] = useState<boolean>(false);
  
  // Interactive Revision & Bookmark states (persisted offline via LocalStorage)
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [revisedTopics, setRevisedTopics] = useState<string[]>([]);
  
  // Accordion Expandable state (Expanded topic name)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Mobile layout and custom modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showMethodology, setShowMethodology] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Load persistence states
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem("final_mb_bookmarks");
      if (savedBookmarks) {
        setBookmarkedTopics(JSON.parse(savedBookmarks));
      }
      
      const savedRevised = localStorage.getItem("final_mb_revised");
      if (savedRevised) {
        setRevisedTopics(JSON.parse(savedRevised));
      }
    } catch (e) {
      console.error("Could not load tracking data from localStorage", e);
    }
  }, []);

  // Save changes to bookmarks
  const toggleBookmark = (topicName: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const updated = bookmarkedTopics.includes(topicName)
      ? bookmarkedTopics.filter(t => t !== topicName)
      : [...bookmarkedTopics, topicName];
    setBookmarkedTopics(updated);
    localStorage.setItem("final_mb_bookmarks", JSON.stringify(updated));
  };

  // Save changes to revised status
  const toggleRevised = (topicName: string, e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const updated = revisedTopics.includes(topicName)
      ? revisedTopics.filter(t => t !== topicName)
      : [...revisedTopics, topicName];
    setRevisedTopics(updated);
    localStorage.setItem("final_mb_revised", JSON.stringify(updated));
  };

  // Clear tracking progress helper
  const resetProgress = () => {
    setShowResetConfirm(true);
  };

  const confirmResetProgress = () => {
    setBookmarkedTopics([]);
    setRevisedTopics([]);
    localStorage.removeItem("final_mb_bookmarks");
    localStorage.removeItem("final_mb_revised");
    setShowResetConfirm(false);
  };

  // Switch specialty tab and reset subspecialty filter
  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSelectedSubspecialty("All");
    setExpandedTopic(null);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Switch subspecialty filter
  const handleSubspecialtyChange = (sub: string) => {
    setSelectedSubspecialty(sub);
    setExpandedTopic(null);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Switch to frequency tracker and open specific topic
  const handleStudyTopic = (specialty: string, subspecialty: string, topicName: string) => {
    setSelectedSpecialty(specialty);
    setSelectedSubspecialty(subspecialty);
    setExpandedTopic(topicName);
    setActiveTab("frequency");
  };

  // Dynamic Chronological Index of Questions
  const chronologicalIndex = useMemo(() => {
    const index: { [year: string]: { [specialty: string]: { questionId: string; subspecialty: string; topic: string }[] } } = {};

    Object.entries(database).forEach(([specialty, subData]) => {
      Object.entries(subData).forEach(([subspecialty, topics]) => {
        topics.forEach((t) => {
          t.occurrences.forEach((occ) => {
            let questionId = "Q";
            let yearOrPaper = occ.trim();

            if (occ.includes(",")) {
              const parts = occ.split(",");
              questionId = parts[0].trim();
              yearOrPaper = parts.slice(1).join(",").trim();
            } else {
              const match = occ.match(/^([QLSAQ]+\s*\d+[a-z]?)\s+(.+)$/i);
              if (match) {
                questionId = match[1].trim();
                yearOrPaper = match[2].trim();
              }
            }

            if (!index[yearOrPaper]) {
              index[yearOrPaper] = {};
            }
            if (!index[yearOrPaper][specialty]) {
              index[yearOrPaper][specialty] = [];
            }

            index[yearOrPaper][specialty].push({
              questionId,
              subspecialty,
              topic: t.topic
            });
          });
        });
      });
    });

    return index;
  }, []);

  // Sort years chronologically (descending)
  const sortedYearsList = useMemo(() => {
    const years = Object.keys(chronologicalIndex);
    
    const parseYearToScore = (yearStr: string) => {
      const s = yearStr.toLowerCase().trim();
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      
      const yearMatch = s.match(/\d{4}/);
      if (!yearMatch) return 0;
      const year = parseInt(yearMatch[0], 10);
      
      let monthIndex = 0;
      months.forEach((m, idx) => {
        if (s.includes(m)) {
          monthIndex = idx + 1;
        }
      });
      
      return year * 100 + monthIndex;
    };

    return years.sort((a, b) => {
      const scoreA = parseYearToScore(a);
      const scoreB = parseYearToScore(b);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return a.localeCompare(b);
    });
  }, [chronologicalIndex]);

  // Handle self-healing year selection
  useEffect(() => {
    if (sortedYearsList.length > 0 && !sortedYearsList.includes(selectedYear)) {
      setSelectedYear(sortedYearsList[0]);
    }
  }, [sortedYearsList, selectedYear]);

  // Get active specialty data
  const activeSpecialtyData: SpecialtyData = useMemo(() => {
    return database[selectedSpecialty] || {};
  }, [selectedSpecialty]);

  // Compute total occurrences in the database for overall stats
  const totalOccurrencesInDatabase = useMemo(() => {
    let total = 0;
    Object.values(database).forEach((specData) => {
      Object.values(specData).forEach((topics) => {
        topics.forEach((topic) => {
          total += topic.occurrences.length;
        });
      });
    });
    return total;
  }, []);

  // Compute list of subspecialties for the active specialty with frequency counts
  const subspecialtiesWithStats = useMemo(() => {
    const list: { name: string; topicCount: number; testCount: number }[] = [];
    
    Object.entries(activeSpecialtyData).forEach(([name, topics]) => {
      const topicCount = topics.length;
      const testCount = topics.reduce((acc, t) => acc + t.occurrences.length, 0);
      list.push({ name, topicCount, testCount });
    });
    
    // Sort alphabetically by subspecialty name
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [activeSpecialtyData]);

  // Comprehensive Search & Filter Logic
  const processedTopicsList = useMemo(() => {
    const list: { subspecialty: string; topic: string; occurrences: string[]; frequency: number }[] = [];

    Object.entries(activeSpecialtyData).forEach(([subName, topics]) => {
      // If we filtered by subspecialty and it's not "All", match exactly
      if (selectedSubspecialty !== "All" && selectedSubspecialty !== subName) {
        return;
      }

      topics.forEach((t) => {
        const matchesQuery = 
          t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.occurrences.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()));

        const isHighYield = t.occurrences.length >= 3;
        const isBookmarked = bookmarkedTopics.includes(t.topic);
        const isRevised = revisedTopics.includes(t.topic);

        if (!matchesQuery) return;
        if (showHighYieldOnly && !isHighYield) return;
        if (showBookmarkedOnly && !isBookmarked) return;
        if (showRevisedOnly && !isRevised) return;

        list.push({
          subspecialty: subName,
          topic: t.topic,
          occurrences: t.occurrences,
          frequency: t.occurrences.length
        });
      });
    });

    // Sort by frequency (descending) by default, then alphabetically
    return list.sort((a, b) => b.frequency - a.frequency || a.topic.localeCompare(b.topic));
  }, [activeSpecialtyData, selectedSubspecialty, searchQuery, showHighYieldOnly, showBookmarkedOnly, showRevisedOnly, bookmarkedTopics, revisedTopics]);

  // Analytics for Active Selection
  const activeAnalytics = useMemo(() => {
    const totalTopics = processedTopicsList.length;
    const highYieldCount = processedTopicsList.filter(t => t.frequency >= 3).length;
    const totalTestedCount = processedTopicsList.reduce((acc, t) => acc + t.frequency, 0);
    const revisedCount = processedTopicsList.filter(t => revisedTopics.includes(t.topic)).length;
    const yieldPercentage = totalTopics > 0 ? Math.round((highYieldCount / totalTopics) * 100) : 0;

    return {
      totalTopics,
      highYieldCount,
      totalTestedCount,
      revisedCount,
      yieldPercentage
    };
  }, [processedTopicsList, revisedTopics]);

  // Study focus generator helper based on topic keywords
  const generateStudyGuide = (topic: string) => {
    const t = topic.toLowerCase();
    
    if (t.includes("diab") || t.includes("glycemic") || t.includes("ketoacidosis") || t.includes("dka")) {
      return {
        keyConcepts: [
          "DKA clinical triad: hyperglycemia (>11 mmol/L or 250 mg/dL), ketonemia (ketones >3 mmol/L or ketonuria 2+), and metabolic acidosis (bicarbonate <15 mmol/L or pH <7.3).",
          "Fluid Resuscitation Protocol: Aggressive isotonic saline (0.9% NaCl) infusion: 1L in 1st hour, 1L in next 2 hours, then 1L every 4 hours. Introduce 5% Dextrose when blood glucose drops below 14 mmol/L (250 mg/dL).",
          "Low-Dose Continuous Insulin Infusion: Fixed-rate IV soluble insulin infusion (0.1 units/kg/hour). Continue until pH >7.3, bicarbonate >15 mmol/L, and patient can eat.",
          "Potassium Correction Rule: Insulin drives K+ intracellularly. If K+ <3.3 mmol/L, hold insulin and replace potassium first. If K+ 3.3-5.5, add 20-40 mmol K+ per bag of fluids. If K+ >5.5, do not supplement but monitor.",
          "Monitor blood glucose, ketones, and electrolytes hourly. Watch out for complications: cerebral edema, acute respiratory distress syndrome, hypokalemia."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Endocrinology: Diabetes mellitus metabolic crises",
          "Joint British Diabetes Societies (JBDS) Guidelines for the Management of DKA"
        ],
        priority: "CRITICAL HIGH YIELD — Tested frequently on physiology, presentation, and management protocols."
      };
    }
    
    if (t.includes("kidney") || t.includes("aki") || t.includes("nephrosclerosis") || t.includes("nephrology")) {
      return {
        keyConcepts: [
          "Acute Kidney Injury (AKI) etiology: Pre-renal (hypovolemia, shock, NSAIDs vasoconstriction), Renal/Intrinsic (ATN, acute glomerulonephritis, nephrotoxins), Post-renal (prostatic hypertrophy, bilateral stones, pelvic malignancy).",
          "KDIGO Staging Criteria: Based on Serum Creatinine increases (Stage 1: 1.5–1.9x baseline; Stage 2: 2.0–2.9x; Stage 3: ≥3.0x baseline or initiation of RRT) and hourly Urine Output.",
          "Medical management steps: Correct underlying cause, stop nephrotoxic drugs (NSAIDs, ACE inhibitors, aminoglycosides), optimize hemodynamic status with fluids or diuretics, and monitor fluid balance.",
          "Indications for Emergency Dialysis (AEIOU): Acidosis (refractory pH <7.1), Electrolytes (severe refractory hyperkalemia >6.5 mmol/L), Ingestion of dialyzable toxins (salicylates, ethylene glycol, lithium), Overload of fluid causing refractory pulmonary edema, and Uremia (uremic pericarditis, encephalopathy, or neuropathy)."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Kidney and Urinary Tract Disease",
          "KDIGO Clinical Practice Guideline for Acute Kidney Injury"
        ],
        priority: "HIGH YIELD — Core nephrology scenario involving fluid chart tracking and metabolic emergency."
      };
    }

    if (t.includes("breast") || t.includes("cancer") || t.includes("mammography")) {
      return {
        keyConcepts: [
          "Triple Assessment of Breast Lumps: 1. Clinical Examination (inspect symmetry, skin changes like peau d'orange, nipple retraction, palpate lump characteristics and axillary nodes). 2. Imaging (Ultrasound for patients <35 years old; Sonomammography/Mammography for patients ≥35 years). 3. Pathology (Fine Needle Aspiration Cytology [FNAC] or Core Needle Biopsy for tissue diagnosis).",
          "Staging and Prognosis: AJCC TNM classification (Tumor size, Node involvement, distant Metastasis). Histological grade (Nottingham Grading System) and hormone receptor status (ER, PR, HER2).",
          "Surgical management strategies: Breast-Conserving Surgery (BCS / Lumpectomy) + adjuvant radiotherapy (ideal for early stage, single focal lesion) vs. Modified Radical Mastectomy (MRM) where breast tissue & axillary lymph nodes levels I & II are cleared.",
          "Systemic therapy guidance: Tamoxifen (selective estrogen receptor modulator for ER+ premenopausal women), Aromatase Inhibitors (Anastrazole/Letrozole for ER+ postmenopausal women), Trastuzumab (anti-HER2 monoclonal antibody for HER2 amplified tumours), and chemotherapy protocols (anthracyclines/taxanes)."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — The Breast chapter: Benign & malignant conditions",
          "NCCN Clinical Practice Guidelines in Oncology: Breast Cancer"
        ],
        priority: "CRITICAL HIGH YIELD — The most frequently examined surgical oncology essay topic. Memorize triple assessment completely!"
      };
    }

    if (t.includes("burn") || t.includes("thermal") || t.includes("inhalational")) {
      return {
        keyConcepts: [
          "Airway assessment & early protection: Check for signs of upper airway inhalational burn (facial burns, singed eyebrows/nasal hair, soot in mouth or sputum, stridor, hoarse voice, carbonaceous sputum). Secure the airway with proactive endotracheal intubation before progressive laryngeal edema develops.",
          "Surface Area Estimation (TBSA): Apply Wallace's Rule of Nines (Head & Neck 9%, each Upper Limb 9%, Anterior Trunk 18%, Posterior Trunk 18%, each Lower Limb 18%, Perineum 1%). Do not count superficial first-degree erythema.",
          "Fluid Resuscitation (Parkland Formula): Calculate total crystalloid requirement for the first 24 hours: 4 mL × Body Weight (kg) × % TBSA. Administer Ringers Lactate. Give 50% of the calculated volume in the first 8 hours (from the exact time of the burn injury), and the remaining 50% over the next 16 hours.",
          "Monitoring targets: Insertion of a urinary catheter is mandatory. Target adult urine output of 0.5 to 1.0 mL/kg/hour as the primary guide for adjusting resuscitation fluid rates."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — Burns and plastic surgery: Resuscitation protocols",
          "Advanced Trauma Life Support (ATLS) Student Course Manual — Thermal Injuries chapter"
        ],
        priority: "HIGH YIELD — Regular emergency surgery essay. Be prepared to perform Parkland volume calculations."
      };
    }

    if (t.includes("prostate") || t.includes("ca ") || t.includes("urology") || t.includes("retention")) {
      return {
        keyConcepts: [
          "Prostate Cancer clinical triad/features: Lower Urinary Tract Symptoms (LUTS) like hesitancy, poor stream, nocturia, combined with bony pelvic pain or hematuria in metastatic stages.",
          "Diagnostic assessment: Digital Rectal Examination (DRE) revealing a hard, asymmetrical, nodular prostate with loss of the median sulcus, combined with serum PSA level >4 ng/mL, followed by transrectal ultrasound (TRUS) guided biopsy.",
          "Gleason Grading System: Scoring based on the glandular architecture. Sum of primary and secondary patterns (e.g., Gleason 3+4=7 or 4+5=9). Categorized into ISUP Grade Groups 1-5.",
          "Therapeutic pathways: Active surveillance or radical prostatectomy/radiotherapy for localized disease. Androgen Deprivation Therapy (ADT) using bilateral orchidectomy or LHRH agonists (Goserelin) for advanced/metastatic disease.",
          "Emergency Clot Retention: Urgent urethral catheterization with a large-gauge 3-way catheter. Initiate saline continuous bladder irrigation to prevent recurrences of blood clots, and perform manual clot evacuation using a catheter syringe if blocked."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — The prostate and seminal vesicles chapter",
          "European Association of Urology (EAU) Guidelines on Prostate Cancer"
        ],
        priority: "HIGH YIELD — Extremely common senior-level surgical essay and bedside clinical scenario."
      };
    }

    if (t.includes("appendicitis") || t.includes("peritonitis") || t.includes("perforation")) {
      return {
        keyConcepts: [
          "Acute Appendicitis presentation: Classical migrating pain starting periumbilically (visceral, T10 dermotome) and shifting to the right iliac fossa (somatic, localized peritonitis). Supported by positive signs: McBurney's point tenderness, Rovsing's sign, Psoas sign, and Obturator sign.",
          "Pathophysiology of Typhoid Perforation: Salmonella typhi invades Peyer's patches in the terminal ileum. Hyperplasia leads to necrosis, sloughing, and longitudinal antimesenteric bowel perforation, usually occurring in the 2nd/3rd week of enteric fever.",
          "Surgical Peritonitis management principles: 1. Resuscitation (aggressive IV fluids, broad-spectrum antibiotics covering aerobes/anaerobes). 2. Laparotomy (emergency midline incision). 3. Source control (appendectomy, peritoneal toilet with warm normal saline, primary repair or exteriorization/ileostomy of perforated typhoid segment). 4. Post-op nutrition and wound care."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — The vermiform appendix / Peritonitis chapters",
          "WSES Guidelines for the Management of Intra-abdominal Infections"
        ],
        priority: "CRITICAL HIGH YIELD — Classic abdominal emergency essay. Memorize pathophysiology and fluid management."
      };
    }

    if (t.includes("epidemiological study") || t.includes("cohort") || t.includes("case-control")) {
      return {
        keyConcepts: [
          "Cohort Study design: Analytical, observational, longitudinal study. Begins with exposure status (exposed vs. unexposed) and proceeds prospectively to measure the development of disease/outcome. Calculates Incidence rates, Relative Risk (RR = Incidence in exposed / Incidence in unexposed), and Attributable Risk.",
          "Case-Control Study design: Retrospective, analytical observational study. Starts with outcome status (diseased 'cases' vs. healthy 'controls') and looks backward in time to determine exposure histories. Calculates the Odds Ratio (OR) as an estimate of relative risk. Highly efficient for rare diseases or long latency periods.",
          "Key experimental parameters: Randomization (prevents selection bias, ensures equal baseline distribution of confounders), Blinding (Single, double, or triple blinding to eliminate observer/responder bias)."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Epidemiology: Principles and Study Designs",
          "Gordis Epidemiology — Chapter on Cohort and Case-Control Studies"
        ],
        priority: "CRITICAL HIGH YIELD — Found in almost every Community Medicine examination paper. Practice drawing study flowcharts."
      };
    }

    if (t.includes("screening") || t.includes("sensitivity") || t.includes("specificity") || t.includes("ppv")) {
      return {
        keyConcepts: [
          "Sensitivity: Probability that the screening test is positive when the disease is present: True Positives / (True Positives + False Negatives). Ideal for ruling out disease (high sensitivity = low false negatives).",
          "Specificity: Probability that the screening test is negative when the disease is absent: True Negatives / (True Negatives + False Positives). Ideal for confirming/ruling in disease (high specificity = low false positives).",
          "Positive Predictive Value (PPV): Probability that a person has the disease given a positive screening test: True Positives / (True Positives + False Positives). Strongly affected by disease prevalence: higher prevalence increases PPV.",
          "Negative Predictive Value (NPV): Probability that a person is healthy given a negative test: True Negatives / (True Negatives + False Negatives). Decreased prevalence increases NPV."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Screening for Disease chapter",
          "Basic Epidemiological Calculations Reference Guides"
        ],
        priority: "CRITICAL HIGH YIELD — Typically includes a mandatory 10-20 mark calculation grid. Always double-check your math!"
      };
    }

    if (t.includes("occupational health") || t.includes("hazards") || t.includes("ergonomics")) {
      return {
        keyConcepts: [
          "Definition of Occupational Hazards: Physical (noise, heat, vibration, radiation), Chemical (dusts, toxic vapors, heavy metals), Biological (pathogens, tuberculosis, needle stick injuries), Ergonomic (repetitive strain, poor posture, heavy lifting), Psychosocial (work stress, harassment).",
          "Sawmill Workers specific hazards: Physical (noise trauma, machinery cuts, splinters), Chemical (inhalation of wood dust leading to allergic alveolitis, asthma, or adenocarcinoma of nasal sinuses; exposure to chemical wood preservatives), Ergonomic (heavy log lifting causing chronic low back pain/disc herniation).",
          "Hierarchial Controls: 1. Elimination (remove hazard). 2. Substitution (replace with safer alternative). 3. Engineering controls (local exhaust ventilation, machine guards). 4. Administrative controls (shift rotation, safety education). 5. Personal Protective Equipment (PPE: masks, earplugs, safety boots, goggles)."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Occupational Health chapter",
          "ILO Guidelines on Occupational Safety and Health Management"
        ],
        priority: "HIGH YIELD — Common community medicine essay. Understand sawmill, farming, and hospital hazards in detail."
      };
    }

    if (t.includes("maternal") || t.includes("mortality") || t.includes("antenatal")) {
      return {
        keyConcepts: [
          "Maternal Mortality Ratio (MMR): Number of maternal deaths per 100,000 live births. Represents obstetric risk. Main direct causes in developing countries: obstetric hemorrhage (postpartum/antepartum), sepsis, pre-eclampsia/eclampsia, obstructed labor, and unsafe abortions.",
          "Focused Antenatal Care (FANC): WHO model recommending customized, goal-directed visits rather than routine scheduled visits. Emphasizes individual counseling, tetanus toxoid immunization, iron/folate supplementation, malaria chemoprevention (IPTp with Sulfadoxine-Pyrimethamine), and birth preparedness plans.",
          "Safe Motherhood Pillars: Family planning, focused antenatal care, clean/safe delivery services, and essential obstetric newborn care."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Maternal and Child Health services",
          "WHO Guidelines on Antenatal Care for a Positive Pregnancy Experience"
        ],
        priority: "HIGH YIELD — Fundamental obstetric public health topic. Understand maternal mortality definitions vs. rates."
      };
    }

    // Generic Clinical Study Guide
    return {
      keyConcepts: [
        `Understand the clinical presentation, diagnostic criteria, and risk factors of ${topic}.`,
        "Formulate a structured management plan: immediate resuscitation (ABCDE), targeted medical/pharmacological interventions, surgical options, and supportive care.",
        "Acknowledge critical red flags, dangerous complications, and indications for specialty referral or intensive monitoring.",
        "Incorporate ethical, preventive, or rehabilitation dimensions: explain informed consent, disease prevention, screening criteria, or lifestyle counseling where applicable."
      ],
      studyReferences: [
        "Clinical textbooks (Davidson's Medicine, Bailey & Love's Surgery, Park's Community Medicine)",
        "Standard guidelines from professional bodies (WHO, Royal Colleges, NICE, Local Ministries of Health)"
      ],
      priority: "IMPORTANT CURRICULUM REVIEW — Standard exam syllabus topic. Focus on high-yield clinical points."
    };
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* Top Navigation Bar with Integrated Tabs */}
      <nav className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 bg-teal-800 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="p-1 md:p-1.5 bg-teal-100 rounded-md shrink-0">
            <Award className="w-5 h-5 md:w-6 md:h-6 text-teal-800" />
          </div>
          <div>
            <h1 className="text-xs md:text-base lg:text-lg font-bold leading-tight uppercase tracking-wide">Final MB</h1>
            <p className="text-[9px] opacity-80 uppercase tracking-widest font-medium hidden sm:block">Syllabus Frequency Tracker</p>
          </div>
        </div>

        {/* Integrated Segmented View Switcher */}
        <div className="flex bg-teal-900/80 p-0.5 md:p-1 rounded-lg border border-teal-700/50">
          <button
            onClick={() => setActiveTab("frequency")}
            className={`px-2.5 md:px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 md:gap-1.5 rounded-md cursor-pointer focus:outline-none ${
              activeTab === "frequency"
                ? "bg-white text-teal-900 shadow-xs font-extrabold"
                : "text-teal-100 hover:bg-teal-850"
            }`}
          >
            <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5 text-teal-600" />
            <span className="hidden xs:inline">Frequency</span>
            <span className="xs:hidden">Freq</span>
          </button>
          <button
            onClick={() => setActiveTab("chronological")}
            className={`px-2.5 md:px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 md:gap-1.5 rounded-md cursor-pointer focus:outline-none ${
              activeTab === "chronological"
                ? "bg-white text-teal-900 shadow-xs font-extrabold"
                : "text-teal-100 hover:bg-teal-850"
            }`}
          >
            <BookOpen className="w-3 md:w-3.5 h-3 md:h-3.5 text-teal-600" />
            <span className="hidden xs:inline">By Year</span>
            <span className="xs:hidden">Year</span>
          </button>
        </div>
        
        {/* Stats badges visible on larger screens only */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-teal-900/60 rounded-full border border-teal-700/50">
            <span className="block w-2 h-2 bg-orange-400 rounded-full animate-pulse shrink-0"></span>
            <span className="text-xs font-semibold whitespace-nowrap text-teal-100">Updated: Jan 2025</span>
          </div>
          <span className="text-xs font-bold bg-teal-900/60 px-2.5 py-1 rounded-md border border-teal-700/30 text-teal-50">
            {totalOccurrencesInDatabase} Questions Indexed
          </span>
        </div>
      </nav>

      {activeTab === "frequency" ? (
        <>
          {/* Specialty Navigation and Search Bar (Optimized for Mobile) */}
          <div className="bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-8 py-2 md:py-3 gap-2 shrink-0">
            
            {/* Specialty Selector Tabs */}
            <div className="flex p-0.5 bg-slate-100 rounded-lg w-full sm:w-auto">
              {["Internal Medicine", "Surgery", "Community Medicine"].map((spec) => (
                <button
                  key={spec}
                  id={`tab-${spec.toLowerCase().split(' ')[0]}`}
                  onClick={() => handleSpecialtyChange(spec)}
                  className={`flex-1 sm:flex-initial px-2.5 md:px-4 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all duration-150 cursor-pointer text-center whitespace-nowrap ${
                    selectedSpecialty === spec
                      ? "bg-white text-teal-800 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {spec.replace("Internal ", "")}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search topic or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all h-8"
              />
            </div>
          </div>

          {/* Horizontally Scrollable Subspecialties + Heatmap on Mobile (<lg) */}
          <div className="lg:hidden bg-slate-50 border-b border-slate-200/60 px-3 py-1.5 flex items-center justify-between shrink-0 gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pr-2 flex-1">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest shrink-0">
                Subspecialty:
              </span>
              {/* All Option */}
              <button
                onClick={() => handleSubspecialtyChange("All")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 cursor-pointer focus:outline-none ${
                  selectedSubspecialty === "All"
                    ? "bg-teal-700 text-white font-bold"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                All ({Object.values(activeSpecialtyData).reduce((sum, item) => sum + item.length, 0)})
              </button>
              {/* Subspecialties List */}
              {subspecialtiesWithStats.map(({ name, topicCount }) => (
                <button
                  key={name}
                  onClick={() => handleSubspecialtyChange(name)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 cursor-pointer focus:outline-none ${
                    selectedSubspecialty === name
                      ? "bg-teal-700 text-white font-bold"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  {name} ({topicCount})
                </button>
              ))}
            </div>
            
            {/* Heatmap Percentage Badge */}
            <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200 text-[10px] font-bold text-orange-600 whitespace-nowrap bg-orange-50/60 px-2 py-0.5 rounded-md border border-orange-100">
              <TrendingUp className="w-3 h-3 text-orange-500 shrink-0" />
              <span>{activeAnalytics.yieldPercentage}% Yield</span>
            </div>
          </div>

          {/* Main Responsive Grid Layout */}
          <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
            
            {/* Left Sidebar: Subspecialties and Yield Analytics */}
            <aside className={`w-full lg:w-64 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 shrink-0 overflow-y-auto ${
              isSidebarOpen ? "block animate-fadeIn" : "hidden lg:flex"
            } max-h-[300px] lg:max-h-none flex flex-col`}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Specialties</p>
            {selectedSubspecialty !== "All" && (
              <button 
                onClick={() => handleSubspecialtyChange("All")} 
                className="text-[10px] font-bold text-teal-700 hover:underline hover:text-teal-900"
              >
                Clear Filter
              </button>
            )}
          </div>
          
          <div className="space-y-1 overflow-y-auto pr-1 flex-1 min-h-[80px]">
            {/* Show All option */}
            <button
              onClick={() => handleSubspecialtyChange("All")}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-left w-full text-xs font-medium ${
                selectedSubspecialty === "All"
                  ? "bg-teal-50 text-teal-900 font-bold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>All Specialties</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                selectedSubspecialty === "All" ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
              }`}>
                {Object.values(activeSpecialtyData).reduce((sum, item) => sum + item.length, 0)}
              </span>
            </button>

            {/* Specialty List */}
            {subspecialtiesWithStats.map(({ name, topicCount }) => (
              <button
                key={name}
                onClick={() => handleSubspecialtyChange(name)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-md transition-colors text-left w-full text-xs font-medium ${
                  selectedSubspecialty === name
                    ? "bg-teal-50 text-teal-900 font-bold border-l-2 border-l-teal-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="truncate pr-2">{name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  selectedSubspecialty === name ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {topicCount}
                </span>
              </button>
            ))}
          </div>

          {/* Yield Concentration Meter */}
          <div className="mt-4 pt-4 border-t border-slate-200 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
              Yield Heatmap Index
            </p>
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium truncate">
                  {selectedSubspecialty === "All" ? "Overall High Yield" : selectedSubspecialty}
                </span>
                <span className="text-[11px] font-bold text-orange-600">{activeAnalytics.yieldPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-orange-500 transition-all duration-500" 
                  style={{ width: `${activeAnalytics.yieldPercentage}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Percentage of topics with <strong>3+ occurrences</strong>. Focus heavily on these modules.
              </p>
            </div>
          </div>

          {/* Reset study progress utility button */}
          {(bookmarkedTopics.length > 0 || revisedTopics.length > 0) && (
            <button
              onClick={resetProgress}
              className="mt-4 text-center w-full py-1.5 border border-dashed border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md text-[10px] font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Clear Study Progress ({bookmarkedTopics.length + revisedTopics.length})
            </button>
          )}
        </aside>

        {/* Main Content Area (Optimized Padding and Gaps for Mobile) */}
        <main className="flex-1 p-2 md:p-6 flex flex-col gap-2 md:gap-4 overflow-y-auto min-w-0">
          
          {/* Header Description & Yield Legend (Compact and responsive) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 md:p-4 rounded-xl border border-slate-200/80 shadow-xs shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-xl font-extrabold text-slate-800 tracking-tight">
                  {selectedSubspecialty === "All" ? `${selectedSpecialty} Overview` : `${selectedSubspecialty} Analysis`}
                </h2>
                <span className="bg-slate-100 text-slate-600 text-[9px] md:text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  {processedTopicsList.length} Topics
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Syllabus tracker showing question recurrences from clinical essay exams. Click any topic to study key clinical focus points.
              </p>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2.5 sm:self-center shrink-0">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 block"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">High Yield (≥3x)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 block"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Common (2x)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 block"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Single (1x)</span>
              </div>
            </div>
          </div>

          {/* Quick Filters Panel (Extremely Compact) */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider px-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Filters:
                </span>
                
                {/* High Yield toggle */}
                <button
                  onClick={() => setShowHighYieldOnly(!showHighYieldOnly)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer focus:outline-none ${
                    showHighYieldOnly
                      ? "bg-orange-50 border-orange-200 text-orange-700 font-extrabold shadow-3xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>High Yield ({activeAnalytics.highYieldCount})</span>
                </button>

                {/* Bookmarked toggle */}
                <button
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer focus:outline-none ${
                    showBookmarkedOnly
                      ? "bg-amber-50 border-amber-200 text-amber-700 font-extrabold shadow-3xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <BookMarked className="w-3 h-3 text-amber-500" />
                  <span>Bookmarked ({bookmarkedTopics.filter(t => processedTopicsList.some(item => item.topic === t)).length})</span>
                </button>

                {/* Revised toggle */}
                <button
                  onClick={() => setShowRevisedOnly(!showRevisedOnly)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer focus:outline-none ${
                    showRevisedOnly
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold shadow-3xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Revised ({activeAnalytics.revisedCount})</span>
                </button>
              </div>

              {/* Progress indicators (Compact) */}
              {processedTopicsList.length > 0 && (
                <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-slate-100 pt-1.5 sm:pt-0">
                  <span className="text-slate-400">Revised Progress:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 bg-slate-200 rounded-full h-1 overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${Math.round((activeAnalytics.revisedCount / processedTopicsList.length) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-700 font-bold text-[10px]">
                      {activeAnalytics.revisedCount}/{processedTopicsList.length} ({Math.round((activeAnalytics.revisedCount / processedTopicsList.length) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data List Container */}
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Table Headings (Hidden on mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2 bg-slate-200/60 rounded-t-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-6">Topic Description</div>
              <div className="col-span-2 text-center">Frequency</div>
              <div className="col-span-3">Exam Occurrences</div>
            </div>

            {/* Scrollable list of topics */}
            <div className="flex-1 overflow-y-auto space-y-2 border border-t-0 border-slate-200 rounded-b-lg bg-slate-50/30 p-2 md:p-3 min-h-[200px]">
              {processedTopicsList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm my-4">
                  <HelpCircle className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">No matching topics found</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    Adjust your search keywords, clear filter selection, or try switching specialties.
                  </p>
                  {(showHighYieldOnly || showBookmarkedOnly || showRevisedOnly || searchQuery) && (
                    <button
                      onClick={() => {
                        setShowHighYieldOnly(false);
                        setShowBookmarkedOnly(false);
                        setShowRevisedOnly(false);
                        setSearchQuery("");
                        setSelectedSubspecialty("All");
                      }}
                      className="mt-4 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                processedTopicsList.map((itemObj) => {
                  const isHighYield = itemObj.frequency >= 3;
                  const isMediumYield = itemObj.frequency === 2;
                  const isBookmarked = bookmarkedTopics.includes(itemObj.topic);
                  const isRevised = revisedTopics.includes(itemObj.topic);
                  const isExpanded = expandedTopic === itemObj.topic;
                  const studyGuide = generateStudyGuide(itemObj.topic);

                  // Set border & icon styles depending on severity
                  let rowBorderColor = "border-l-slate-300";
                  let freqBadgeColor = "bg-slate-100 text-slate-600";
                  
                  if (isHighYield) {
                    rowBorderColor = "border-l-orange-500";
                    freqBadgeColor = "bg-orange-100 text-orange-700";
                  } else if (isMediumYield) {
                    rowBorderColor = "border-l-teal-500";
                    freqBadgeColor = "bg-teal-100 text-teal-700";
                  }

                  return (
                    <div 
                      key={itemObj.topic}
                      onClick={() => setExpandedTopic(isExpanded ? null : itemObj.topic)}
                      className={`group border-l-4 ${rowBorderColor} bg-white rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
                        isExpanded ? "ring-1 ring-teal-500/30" : ""
                      }`}
                    >
                      {/* main row content */}
                      <div className="grid grid-cols-12 gap-3 md:gap-4 items-center px-4 md:px-5 py-4">
                        
                        {/* Progress Checklist actions */}
                        <div className="col-span-2 md:col-span-1 flex items-center justify-start gap-1">
                          <button
                            title={isRevised ? "Mark as unread" : "Mark as revised"}
                            onClick={(e) => toggleRevised(itemObj.topic, e)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-emerald-600"
                          >
                            <CheckCircle 
                              className={`w-5 h-5 ${
                                isRevised ? "text-emerald-500 fill-emerald-100" : "text-slate-300"
                              }`} 
                            />
                          </button>
                          
                          <button
                            title={isBookmarked ? "Remove bookmark" : "Add to Study List"}
                            onClick={(e) => toggleBookmark(itemObj.topic, e)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-amber-500"
                          >
                            <BookMarked 
                              className={`w-4 h-4 ${
                                isBookmarked ? "text-amber-500 fill-amber-100" : "text-slate-300"
                              }`} 
                            />
                          </button>
                        </div>

                        {/* Topic Information */}
                        <div className="col-span-10 md:col-span-6 flex flex-col">
                          <span className="text-xs md:text-sm font-bold text-slate-800 leading-snug group-hover:text-teal-800 transition-colors">
                            {itemObj.topic}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest flex items-center gap-1.5">
                            <span>{itemObj.subspecialty}</span>
                            {isRevised && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                Revised
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Frequency Badge */}
                        <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center gap-1.5 pt-2 md:pt-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide shrink-0 ${freqBadgeColor}`}>
                            {itemObj.frequency.toString().padStart(2, '0')}x
                          </span>
                          
                          {isHighYield && (
                            <span className="bg-orange-500 text-white text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0 shadow-sm">
                              🔥 High Yield
                            </span>
                          )}
                        </div>

                        {/* Exam Occurrences */}
                        <div className="col-span-6 md:col-span-3 flex flex-wrap gap-1 items-center pt-2 md:pt-0">
                          {itemObj.occurrences.map((occ, idx) => (
                            <code 
                              key={idx} 
                              className="text-[9px] font-mono bg-slate-50 border border-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap"
                            >
                              {occ.split(',').pop()?.trim() || occ}
                            </code>
                          ))}
                        </div>

                      </div>

                      {/* Expandable study details panel */}
                      {isExpanded && (
                        <div className="bg-slate-50/80 border-t border-slate-100 p-4 md:p-5 text-xs md:text-sm space-y-4 animate-fadeIn">
                          
                          {/* Alert priority */}
                          <div className="flex items-start gap-2 bg-white px-3 py-2.5 rounded-lg border border-slate-200 shadow-3xs">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-800 font-bold">Clinical Priority Rating:</strong>
                              <span className="text-slate-600 text-[11px] ml-1">{studyGuide.priority}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Key Concepts list */}
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-700 flex items-center gap-1 text-xs uppercase tracking-wide">
                                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                                Key Study Objectives
                              </h4>
                              <ul className="space-y-2 pr-2">
                                {studyGuide.keyConcepts.map((concept, i) => (
                                  <li key={i} className="flex gap-2 text-slate-600 leading-relaxed text-[11px] md:text-xs">
                                    <span className="text-teal-600 font-black shrink-0">•</span>
                                    <span>{concept}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Textbook & Guideline references */}
                            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                              <h4 className="font-bold text-slate-700 flex items-center gap-1 text-xs uppercase tracking-wide">
                                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                                Recommended Literature
                              </h4>
                              <ul className="space-y-1.5">
                                {studyGuide.studyReferences.map((ref, i) => (
                                  <li key={i} className="flex items-center gap-2 text-slate-500 text-[11px] font-medium italic">
                                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{ref}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Candidate study checklist */}
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action Plan</p>
                                <div className="space-y-1">
                                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 cursor-pointer hover:text-slate-800">
                                    <input 
                                      type="checkbox" 
                                      checked={isRevised} 
                                      onChange={(e) => toggleRevised(itemObj.topic, e)}
                                      className="rounded text-teal-600 focus:ring-teal-500 h-3 w-3 border-slate-300"
                                    />
                                    <span>Summarize management protocol in revision log</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 cursor-pointer hover:text-slate-800">
                                    <input 
                                      type="checkbox"
                                      checked={isBookmarked}
                                      onChange={(e) => toggleBookmark(itemObj.topic, e)}
                                      className="rounded text-teal-600 focus:ring-teal-500 h-3 w-3 border-slate-300"
                                    />
                                    <span>Add to active revision calendar bookmark</span>
                                  </label>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Footer Status Panel */}
          <footer className="flex items-center justify-between py-1.5 px-2 text-[10px] text-slate-400 font-medium shrink-0 gap-2">
            <div className="flex items-center gap-2">
              <span>&copy; Clinical Curriculum Analyst</span>
              <span className="h-3 w-px bg-slate-200"></span>
              <button 
                onClick={() => setShowMethodology(true)}
                className="underline text-slate-400 hover:text-teal-700 transition-colors cursor-pointer"
              >
                Methodology Guide
              </button>
            </div>
            
            <div className="font-bold uppercase tracking-wider text-teal-700 hidden xs:block">
              Showing {processedTopicsList.length} of {Object.values(activeSpecialtyData).reduce((sum, item) => sum + item.length, 0)} modules
            </div>
          </footer>

        </main>
      </div>
      </>
      ) : (
        <ChronologicalBrowse
          chronologicalIndex={chronologicalIndex}
          sortedYearsList={sortedYearsList}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          bookmarkedTopics={bookmarkedTopics}
          revisedTopics={revisedTopics}
          handleStudyTopic={handleStudyTopic}
        />
      )}

      {/* Methodology Guide Modal Overlay */}
      {showMethodology && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all duration-200"
          onClick={() => setShowMethodology(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="p-1.5 bg-teal-50 rounded-lg text-teal-700">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-850">
                Methodology Guide
              </h3>
            </div>
            
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                This application aggregates and normalizes past essay examination papers for medicine, surgery, and community medicine syllabi.
              </p>
              <p>
                <strong>Frequency weight</strong> represents total tested years. High-yield items are those tested 3 or more times.
              </p>
              <p>
                <strong>Personal study tools:</strong> Bookmarks and "Revised" checkboxes allow you to track your personalized progress. Your checklist states and progress data are kept private and saved locally in your browser storage.
              </p>
            </div>
            
            <button 
              onClick={() => setShowMethodology(false)}
              className="w-full mt-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Reset Progress Confirmation Dialog */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all duration-200"
          onClick={() => setShowResetConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                <RefreshCw className="w-5 h-5 animate-spin-once" />
              </div>
              <h3 className="text-base font-bold text-slate-850">
                Reset Progress?
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Are you sure you want to clear your entire revision checklist progress and study bookmarks? This action is permanent and cannot be undone.
            </p>
            
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmResetProgress}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
