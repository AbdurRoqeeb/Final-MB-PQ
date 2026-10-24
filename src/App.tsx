import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookMarked, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Award,
  Stethoscope,
  BookOpen,
  Filter,
  Flame,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { database, SpecialtyData } from './data/database';
import { getQuestionText } from './data/pastQuestionsText';
import { getQuestionAttachment } from './data/questionImages';
import QuestionFigure from './components/QuestionFigure';
import ChronologicalBrowse, { DEPARTMENTS } from './components/ChronologicalBrowse';

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
  const [copiedOccurrence, setCopiedOccurrence] = useState<string | null>(null);

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

  // Copy verbatim question text to clipboard with feedback
  const handleCopyQuestion = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedOccurrence(id);
      setTimeout(() => setCopiedOccurrence(null), 2000);
    }
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
    const index: { [year: string]: { [specialty: string]: { questionId: string; subspecialty: string; topic: string; occurrence: string }[] } } = {};

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
              topic: t.topic,
              occurrence: occ
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
    const list: { specialty: string; subspecialty: string; topic: string; occurrences: string[]; frequency: number }[] = [];

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
          specialty: selectedSpecialty,
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

    if (t.includes("amputation")) {
      return {
        keyConcepts: [
          "Definition: Surgical removal of all or part of an extremity or digit through a bone (distinguished from disarticulation, which is removal through a joint).",
          "Indications for Major Amputation (Dead, Deadly, Damn Nuisance): 1. Dead/Non-viable limb (irreversible peripheral vascular gangrene, extensive crush trauma, severe frostbite). 2. Deadly conditions (spreading necrotizing fasciitis/gas gangrene, malignant bone/soft-tissue tumors e.g., osteosarcoma, life-threatening septic shock). 3. Damn nuisance/Severe functional impairment (severe fixed deformities, chronic osteomyelitis with intractable pain, paraplegic limb with intractable ulcers).",
          "Lower Limb Amputation Classification: Minor (toe amputation, trans-metatarsal, Ray amputation, Lisfranc, Chopart) vs Major (Syme's disarticulation, Below-Knee Amputation / Burgess posterior flap, Through-Knee / Gritti-Stokes, Above-Knee Amputation / equal anterior-posterior flaps, Hip disarticulation, Hemipelvectomy).",
          "Complications: Immediate/Early (primary/reactionary/secondary hemorrhage, hematoma, stump infection/gas gangrene, flap ischemia/necrosis, DVT/PE), Late (phantom limb sensation and pain, neuromas/stump pain, flexion contractures, bone spurs, stump breakdown/ulceration, prosthetic misfit)."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — Amputations and Artificial Limbs",
          "Apley & Solomon's System of Orthopaedics and Trauma — Principles of Amputation"
        ],
        priority: "HIGH YIELD — Frequently tested in Orthopaedics/Vascular surgery essays with high recurrence."
      };
    }

    if (t.includes("pressure ulcer") || t.includes("decubitus")) {
      return {
        keyConcepts: [
          "Definition & Pathogenesis: Localized injury to the skin and underlying tissue, usually over a bony prominence, resulting from sustained pressure alone or pressure combined with shear and/or friction. Sustained pressure exceeding capillary closing pressure (32 mmHg) causes microvascular occlusion, tissue ischemia, anoxia, cell necrosis, and ulceration.",
          "Etiological Factors: Extrinsic (unrelieved pressure, shear forces, friction, excess moisture/maceration from incontinence or perspiration). Intrinsic (advanced age, immobility/bedbound status, sensory loss/neuropathy, severe malnutrition/hypoalbuminemia, anemia, dehydration, peripheral vascular disease).",
          "Staging (NPUAP/EPUAP): Stage I (non-blanchable erythema of intact skin), Stage II (partial-thickness skin loss with exposed dermis/blister), Stage III (full-thickness skin loss with visible subcutaneous fat), Stage IV (full-thickness skin and tissue loss with exposed fascia, muscle, tendon, or bone), Unstageable (slough/eschar obscuring depth), Deep Tissue Pressure Injury (persistent non-blanchable deep red/maroon/purple discoloration).",
          "Prevention in High-Risk Patients: 1. Risk assessment (Waterlow or Braden scale). 2. Regular 2-hourly repositioning (30-degree tilt). 3. Pressure-relieving surfaces (alternating-pressure dynamic air mattress, gel cushions). 4. Skin hygiene and moisture barriers (barrier creams, prompt incontinence care). 5. Nutritional support (high protein, vitamin C, zinc). 6. Avoid friction/shear (sliding sheets, avoid dragging, keep head of bed ≤30 degrees unless contraindicated)."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — Plastic and Reconstructive Surgery: Pressure sores",
          "NPUAP/EPUAP/PPPIA International Clinical Practice Guideline on Prevention and Treatment of Pressure Ulcers"
        ],
        priority: "HIGH YIELD — Core General/Plastic surgery essay topic with repeated occurrence across examination diets."
      };
    }

    if (t.includes("leg ulcer") || t.includes("cutaneous ulcer") || t.includes("marjolin")) {
      return {
        keyConcepts: [
          "Chronic Leg Ulcers Classification & Etiologies: Venous Ulcers (70-80%, located at medial gaiter area, irregular margins, shallow pink base with slough, surrounding lipodermatosclerosis, haemosiderin staining, aching relieved by elevation). Arterial Ulcers (10-15%, pressure points/distal toes/lateral malleolus, deep punched-out base, pale necrotic floor, severe pain worse with elevation, cold limb, diminished pulses, ABPI <0.8). Neuropathic/Diabetic Ulcers (weight-bearing plantar surfaces, painless, punched out with surrounding callus).",
          "Marjolin's Ulcer: Aggressive squamous cell carcinoma developing in a long-standing chronic non-healing wound, burn scar, or chronic osteomyelitis sinus. Features: everted/rolled edges, foul-smelling exophytic granulation, rapidly enlarging ulcer, regional lymphadenopathy. Diagnostic gold standard: edge wedge incisional biopsy including both ulcer edge and healthy skin.",
          "Management Strategy (Plastic & Reconstructive Surgery): 1. Investigation: Edge biopsy (exclude malignancy/Marjolin's), wound swab for C&S, plain X-ray (exclude osteomyelitis/periosteal reaction), Doppler ultrasound & ABPI assessment (normal ABPI 0.9-1.2; multi-layer compression strictly contraindicated if ABPI <0.8). 2. Wound Bed Preparation (TIME principle: Tissue debridement, Infection control, Moisture balance, Epithelial edge). 3. Venous ulcer treatment: Graduated 4-layer compression bandaging (40 mmHg at ankle) + limb elevation. 4. Surgical reconstruction: Split-thickness skin grafting (STSG / Thiersch graft), full-thickness skin graft, or local/fasciocutaneous flap coverage after clean granulating bed achieved."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — Plastic and Reconstructive Surgery: Skin Ulcers and Grafts",
          "Grabb and Smith's Plastic Surgery — Principles of Wound Healing, Skin Grafts and Flaps"
        ],
        priority: "HIGH YIELD — Essential Plastic & Reconstructive Surgery essay question repeatedly tested in clinical exams."
      };
    }

    if (t.includes("dysphagia") || t.includes("esophageal")) {
      return {
        keyConcepts: [
          "Definitions: Dysphagia is subjective difficulty in swallowing liquids or solids. Odynophagia is painful swallowing, signifying severe mucosal inflammation or ulceration (infectious esophagitis e.g. Candida/CMV, caustic ingestion, or invasive esophageal ulcer/carcinoma).",
          "Dysphagia Grading: Grade 1 (able to swallow solid foods with difficulty), Grade 2 (able to swallow semi-solids/pureed food only), Grade 3 (able to swallow liquids only), Grade 4 (complete aphagia / unable to swallow saliva). Progressive dysphagia from solids to liquids in an older smoker/drinker is classic for esophageal carcinoma until proven otherwise.",
          "Diagnostic Workup: 1. Flexible upper GI endoscopy (esophagoscopy) with multiple targeted biopsies (histopathologic confirmation of squamous cell carcinoma vs adenocarcinoma). 2. Contrast barium swallow (pathognomonic rat-tail or apple-core irregular stricture, shoulders, mucosal disruption). 3. Contrast CT scan of neck, chest, and abdomen (TNM staging, locoregional invasion, mediastinal lymphadenopathy, liver metastases). 4. Endoscopic Ultrasound (EUS) for precise T-depth and N-nodal staging.",
          "Endoscopic & Palliative Procedures (ENT / Upper GI): 1. Endoscopic Self-Expanding Metal Stenting (SEMS) — rapid restoration of luminal patency. 2. Endoscopic balloon dilatation. 3. Laser ablation or Argon Plasma Coagulation (APC) of fungating endoluminal tumor. 4. Palliative enteral access: Percutaneous Endoscopic Gastrostomy (PEG) or feeding jejunostomy. 5. Palliative external beam radiotherapy / brachytherapy to reduce tumor bulk."
        ],
        studyReferences: [
          "Scott-Brown's Otorhinolaryngology, Head & Neck Surgery — The Oesophagus & Dysphagia",
          "Bailey & Love's Short Practice of Surgery — Oesophagus: Malignant Tumours and Endoscopic Interventions"
        ],
        priority: "HIGH YIELD — Direct 3-time consecutive repeat question (April 2024, December 2024, January 2025)."
      };
    }

    if (t.includes("rheumatic") || t.includes("valvular")) {
      return {
        keyConcepts: [
          "Primary Diagnosis: Chronic Rheumatic Heart Disease (RHD) with predominant Mitral Stenosis / mixed mitral valve disease, in acute decompensated heart failure with cardioembolic ischemic stroke.",
          "Complications in this vignette: 1. Biventricular / Left-sided Congestive Heart Failure with pulmonary congestion (paroxysmal cough/PND, bibasal crepitations, Kerley B lines on CXR, pedal edema). 2. Atrial Fibrillation with rapid ventricular response and significant pulse deficit (HR 116 bpm vs PR 96/min; pulse deficit = 20 bpm). 3. Acute Cardioembolic Ischemic Stroke / Left Hemiparesis (mural thrombus from a dilated left atrium/appendage embolizing to the right middle cerebral artery territory). 4. Risk of secondary Infective Endocarditis.",
          "Principles of Management: 1. Resuscitation & Decongestion: Propped up at 45–90°, high-flow humidified oxygen, IV Loop diuretic (Furosemide 40-80 mg IV bolus) to relieve pulmonary venous hypertension. 2. Heart rate control for AF: Digoxin (preferred in acute decompensated HF with hypotension BP 100/60) or cardioselective beta-blocker/non-DHP calcium channel blocker once stable. 3. Anticoagulation: Therapeutic anticoagulation with unfractionated/LMW heparin bridging to Warfarin (target INR 2.0–3.0; DOACs currently not approved for moderate-to-severe rheumatic mitral stenosis). 4. Stroke care: Neurological monitoring, head elevation, glycemic and temperature control, early neuro-rehabilitation and secondary neurovascular protection. 5. Definitive Valvular Evaluation & Intervention: Transthoracic and transesophageal echocardiography (assess Wilkins score, valve area, LA thrombus); evaluate for Percutaneous Mitral Balloon Valvotomy (PMBV) or surgical Mitral Valve Replacement (MVR).",
          "Preventive Strategies: 1. Primary Prevention: Prompt diagnosis and treatment of Group A Beta-Hemolytic Streptococcal (GABHS) pharyngitis with a single dose of IM Benzathine Penicillin G (1.2 million units) or oral Penicillin V / Amoxicillin for 10 days to abort acute rheumatic fever. 2. Secondary Prevention: Continuous long-term antibiotic prophylaxis to prevent recurrent streptococcal infections and worsening valvular lesions using IM Benzathine Penicillin G 1.2 million units every 3 to 4 weeks (or oral penicillin/erythromycin daily) for at least 10 years or until age 21/40 (lifelong in patients with severe valvular disease or prosthetic valves). 3. Tertiary Prevention: Regular echocardiographic surveillance, medical optimization of heart failure, infective endocarditis education, and pre-pregnancy cardiac counseling. 4. Primordial Prevention: Alleviating socioeconomic deprivation, reducing household overcrowding, and expanding access to primary healthcare."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Cardiovascular Disease: Rheumatic Fever & Valvular Heart Disease",
          "WHO Technical Report Series — Rheumatic Fever and Rheumatic Heart Disease Guidelines",
          "AHA/ACC Guideline for the Management of Patients With Valvular Heart Disease"
        ],
        priority: "CRITICAL HIGH YIELD — Core cardiology essay linking acute rheumatic history, valvular failure, atrial fibrillation, and embolic stroke."
      };
    }

    if (t.includes("polycystic") || t.includes("adpkd")) {
      return {
        keyConcepts: [
          "Definitive Diagnosis & Genetics: Autosomal Dominant Polycystic Kidney Disease (ADPKD). Caused by mutations in PKD1 (chromosome 16p13.3, encoding Polycystin-1, ~85% of cases, earlier onset and faster progression) and PKD2 (chromosome 4q21, encoding Polycystin-2, ~15% of cases).",
          "Extra-renal Manifestations: 1. Polycystic liver disease (hepatic cysts, most common extra-renal site), pancreatic cysts, splenic and arachnoid cysts. 2. Intracranial saccular berry aneurysms (circle of Willis, risk of subarachnoid hemorrhage — family history of stroke is a major clue!). 3. Cardiovascular: Mitral valve prolapse (MVP), aortic root dilatation, left ventricular hypertrophy. 4. Colonic diverticular disease and abdominal/inguinal wall hernias.",
          "Acute Flank Pain Causes: Cyst hemorrhage/rupture, nephrolithiasis (uric acid/calcium oxalate stones in 20-30%), acute cyst infection / pyelonephritis, or renal cell carcinoma.",
          "Management Strategy: 1. Strict blood pressure control (target BP <120/80 mmHg; ACE inhibitors or ARBs are first-line). 2. High fluid intake (>2.5-3 L/day to suppress endogenous vasopressin). 3. Disease-modifying therapy: Tolvaptan (selective vasopressin V2 receptor antagonist to slow cyst growth and eGFR decline in rapidly progressing ADPKD). 4. Screening: MRA brain for intracranial aneurysms if family history of aneurysm/stroke or high-risk occupations. 5. Renal replacement therapy (hemodialysis, peritoneal dialysis, renal transplantation)."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Kidney and Urinary Tract Diseases: Inherited Cystic Diseases",
          "KDIGO Clinical Practice Guideline on Autosomal Dominant Polycystic Kidney Disease"
        ],
        priority: "CRITICAL HIGH YIELD — Core nephrology genetics and clinical essay (June 2018 Paper 2)."
      };
    }

    if (t.includes("sclerosis") || t.includes("scleroderma")) {
      return {
        keyConcepts: [
          "Diagnosis & Clinical Features: Systemic Sclerosis (Scleroderma). Limited cutaneous (CREST: Calcinosis, Raynaud's, Esophageal dysmotility, Sclerodactyly, Telangiectasia) vs Diffuse cutaneous (widespread skin thickening, early visceral fibrosis). Common cutaneous signs: sclerodactyly, microstomia (radial furrowing/pursing), digital pitting scars/ulcers, salt-and-pepper hyper/hypopigmentation, calcinosis cutis, telangiectasia.",
          "Scleroderma Renal Crisis (SRC): Life-threatening complication characterized by acute onset of severe accelerated/malignant hypertension (often >180/120 mmHg), rapidly progressive oliguric renal failure, microangiopathic hemolytic anemia (MAHA with schistocytes), and elevated plasma renin activity. Triggered or worsened by high-dose corticosteroids!",
          "Diagnostic Investigations: 1. Autoantibody serologies: Anti-Scl-70 (anti-topoisomerase I, marker for diffuse disease and pulmonary fibrosis), Anti-centromere (marker for limited cutaneous / CREST), Anti-RNA polymerase III (strongly associated with high risk of Scleroderma Renal Crisis). 2. Serum creatinine, urea, electrolytes, urinalysis (mild proteinuria, granular casts). 3. High-resolution chest CT (interstitial lung disease) & Echocardiogram (pulmonary arterial hypertension).",
          "Management of SRC: Immediate prompt initiation of ACE Inhibitors (Captopril short-acting titrated rapidly to full dose, irrespective of baseline creatinine elevation; lifesaving cornerstone). Additional agents: IV vasodilators (Prostacyclin analogues, Nitroprusside) if needed. Strict avoidance of high-dose corticosteroids."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Rheumatology and Bone Disease: Systemic Sclerosis",
          "EULAR/ACR Recommendations for the Management of Systemic Sclerosis"
        ],
        priority: "HIGH YIELD — Distinctive rheumatology presentation linking cutaneous changes, Raynaud's, and emergency renal crisis."
      };
    }

    if (t.includes("snake") || t.includes("envenomation") || t.includes("elapidae")) {
      return {
        keyConcepts: [
          "Clinical Cyanosis & Pathophysiology: Bluish discoloration of the skin and mucous membranes caused by an excess of reduced/deoxygenated hemoglobin (>5 g/dL or >3.1 mmol/L) in capillary blood. Central cyanosis reflects inadequate arterial oxygenation (visible on warm tongue/oral mucosa).",
          "Hypoventilation Causes in Elapid Snakebite: Post-synaptic neurotoxins (alpha-neurotoxins) bind irreversibly to nicotinic acetylcholine receptors at the neuromuscular junction, causing flaccid paralysis of respiratory muscles (diaphragm and intercostal muscles). Expected arterial blood gas: Type 2 Respiratory Failure (Hypoxemia PaO2 <60 mmHg + Hypercapnia PaCO2 >45-50 mmHg with respiratory acidosis pH <7.35).",
          "Anti-Snake Venom (ASV) Dosing Rule: Snake venom dose injected is an absolute amount (not dependent on patient body weight). Therefore, a 3-year-old child receives THE SAME INITIAL DOSE of anti-snake venom as an adult (in fact, children suffer greater toxicity due to higher venom concentration per kilogram body weight).",
          "Complications & ICU Level Care: Complete respiratory arrest/failure, aspiration pneumonia, cardiac arrhythmias, extensive local tissue necrosis/compartment syndrome, acute kidney injury. Mandatory management in the Intensive Care Unit (ICU) for continuous multiparameter monitoring, mechanical ventilation capability, and immediate resuscitation."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Environmental Medicine & Envenomation",
          "WHO Guidelines for the Management of Snakebites in Africa"
        ],
        priority: "CRITICAL HIGH YIELD — Core emergency toxicology question examined in March 2019 Paper 2."
      };
    }

    if (t.includes("dissection") || t.includes("aortic")) {
      return {
        keyConcepts: [
          "Acute Aortic Dissection Presentation: Sudden onset, maximally severe 'tearing' or 'ripping' chest pain radiating to the interscapular back and jaw. Marked asymmetry in blood pressures between upper limbs (>20 mmHg), new aortic regurgitation murmur (decrescendo early diastolic), and neurological deficits (syncope, paraplegia, stroke).",
          "Key Differentials: Acute ST-elevation Myocardial Infarction (ACS), Pulmonary Embolism, Tension Pneumothorax, Acute Pericarditis, Esophageal Rupture (Boerhaave's syndrome).",
          "Stanford Classification: Type A (involves ascending aorta; emergency surgical replacement of ascending aorta/hemiarch) vs Type B (involves descending aorta distal to left subclavian artery; initial medical therapy with strict BP/rate control, or thoracic endovascular aortic repair TEVAR).",
          "Emergency Medical Management: 1. Immediate anti-impulse therapy: IV Beta-blockers (Labetalol or Esmolol) targeting heart rate <60 bpm, followed by vasodilators (IV Sodium Nitroprusside or Nicardipine) targeting systolic BP 100-120 mmHg. 2. Urgent diagnostic confirmation: CT Angiography of the aorta (CTA — gold standard/test of choice), Transesophageal Echocardiography (TEE in hemodynamically unstable patients)."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Cardiovascular Disease: Diseases of the Aorta",
          "ESC Guidelines on the Diagnosis and Treatment of Aortic Diseases"
        ],
        priority: "HIGH YIELD — Life-threatening cardiovascular emergency with contrasting management compared to thrombolytic ACS."
      };
    }

    if (t.includes("leprosy") || t.includes("hansen") || t.includes("lepromatous")) {
      return {
        keyConcepts: [
          "Diagnosis & Pathogen: Leprosy (Hansen's Disease) caused by Mycobacterium leprae / M. lepromatosis. Ridley-Jopling Spectrum: Tuberculoid (TT), Borderline Tuberculoid (BT), Mid-borderline (BB), Borderline Lepromatous (BL), Lepromatous Leprosy (LL). Symmetric nodules, plaques, facial skin infiltration ('leonine facies'), earlobe thickening, and glove-and-stocking sensory loss are classic for LL.",
          "Type 2 Lepra Reaction (Erythema Nodosum Leprosum - ENL): Immune-complex mediated (Type III hypersensitivity) reaction seen in BL/LL patients. Sudden appearance of crops of painful, tender erythematous papules, nodules, and ulcerated plaques associated with fever, arthralgia, iritis, dactylitis, and orchitis.",
          "Common Causes of Medical Ward Ulcers: 1. Diabetic neuropathic foot ulcers. 2. Venous stasis ulcers. 3. Arterial/Ischemic ulcers. 4. Pressure/Decubitus ulcers. 5. Tropical infective ulcers (Buruli ulcer / M. ulcerans, Cutaneous Tuberculosis, Syphilitic gumma, Leprotic trophic ulcers).",
          "Treatment Regimens: WHO Multi-Drug Therapy (MDT for multibacillary leprosy, 12 months duration): Rifampicin (600 mg once monthly supervised), Clofazimine (300 mg once monthly supervised + 50 mg daily self-administered), Dapsone (100 mg daily self-administered). Treatment for ENL reaction: Thalidomide (drug of choice for severe ENL, strictly contraindicated in pregnancy) or high-dose systemic corticosteroids (Prednisolone) and high-dose Clofazimine."
        ],
        studyReferences: [
          "Davidson's Principles and Practice of Medicine — Tropical Medicine and Infectious Diseases: Leprosy",
          "WHO Guidelines for the Diagnosis, Treatment and Prevention of Leprosy"
        ],
        priority: "HIGH YIELD — Classic dermatology and infectious diseases vignette tested in March 2019."
      };
    }

    if (t.includes("papilloedema") || t.includes("papillitis")) {
      return {
        keyConcepts: [
          "Definitions: Papilloedema is non-inflammatory, passive swelling of the optic nerve head (optic disc) secondary to raised intracranial pressure (ICP), classically bilateral. Papillitis (anterior optic neuritis) is active inflammation and swelling of the optic nerve head, typically unilateral.",
          "Etiologies of Papilloedema: Space-occupying intracranial lesions (brain tumors, abscess, subdural/extradural hematoma), Impaired CSF dynamics (hydrocephalus, dural venous sinus thrombosis), Idiopathic Intracranial Hypertension (pseudotumor cerebri), Meningitis/Encephalitis, Malignant hypertension.",
          "Etiologies of Papillitis: Demyelinating disease (Multiple Sclerosis, neuromyelitis optica), Autoimmune/Systemic vasculitis (SLE, sarcoidosis, giant cell arteritis), Post-viral / Infectious demyelination (measles, mumps, varicella, syphilis, tuberculosis, cat scratch disease/Bartonella), Toxic/Metabolic (methanol, ethambutol).",
          "Key Clinical Differences: Visual Acuity (severely impaired early in papillitis; preserved/normal early with transient visual obscurations in papilloedema). Laterality (papillitis usually unilateral; papilloedema usually bilateral). Afferent Pupillary Defect (RAPD/Marcus Gunn pupil present in unilateral papillitis; absent in symmetric papilloedema). Pain (ocular/retrobulbar pain aggravated by eye movements in papillitis; painless in papilloedema). Visual field (central scotoma in papillitis; enlarged blind spot in papilloedema)."
        ],
        studyReferences: [
          "Kanski's Clinical Ophthalmology — Neuro-Ophthalmology: The Optic Nerve",
          "American Academy of Ophthalmology (AAO) BCSC — Neuro-Ophthalmology: Disc Edema vs Optic Neuritis"
        ],
        priority: "HIGH YIELD — Direct repeat question appearing in both Mock and Final 2024 surgery examination papers."
      };
    }

    if (t.includes("bph") || t.includes("benign prostatic hyperplasia")) {
      return {
        keyConcepts: [
          "IPSS Staging & Evaluation: International Prostate Symptom Score: 0–7 (Mild), 8–19 (Moderate), 20–35 (Severe). Quality of life score (0-6). Objective assessment with post-void residual (PVR) volume (>100–200 mL is abnormal), uroflowmetry (Qmax <10 mL/s indicates obstruction), DRE, urinalysis, serum PSA, and renal ultrasound.",
          "Treatment Modalities: 1. Watchful waiting/Lifestyle modifications (fluid restriction before bedtime, avoid caffeine/alcohol, stop decongestants/anticholinergics). 2. Medical pharmacotherapy (Alpha-1 blockers e.g., Tamsulosin, Alfuzosin; 5-Alpha reductase inhibitors e.g., Finasteride, Dutasteride; Combination therapy). 3. Surgical intervention: Transurethral Resection of the Prostate (TURP — gold standard), Laser enucleation (HoLEP), Open prostatectomy (Millin's retropubic or Freyer's transvesical for very large glands >80-100g).",
          "Adverse Effects of the Most Appropriate Option (TURP Complications): 1. TURP syndrome (dilutional hyponatremia, fluid overload, cerebral edema from absorption of glycine irrigant). 2. Retrograde ejaculation (in 70-80% of patients due to bladder neck damage). 3. Post-operative hematuria and clot retention. 4. Urethral stricture or bladder neck contracture. 5. Transient or permanent urinary incontinence (<1-2%). 6. Erectile dysfunction (5-10%). 7. Epididymo-orchitis or urinary tract infection."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — The Prostate and Seminal Vesicles",
          "European Association of Urology (EAU) Guidelines on the Management of Non-neurogenic Male LUTS"
        ],
        priority: "HIGH YIELD — Examined identically in multiple diets; essential knowledge for urological surgery."
      };
    }

    if (t.includes("computed tomography") || t.includes("radiographic densities") || t.includes("mri")) {
      return {
        keyConcepts: [
          "Radiographic Densities (5 Basic Densities from lowest to highest attenuation): 1. Air/Gas (appears black/radiolucent e.g., lungs, bowel gas). 2. Fat (dark gray e.g., subcutaneous/retroperitoneal fat). 3. Soft tissue/Fluid (intermediate gray/water density e.g., heart, liver, bladder, blood). 4. Bone/Calcium (white/radiopaque e.g., cortical bone, calculus). 5. Metal/Contrast material (dense stark white e.g., barium, bullet fragment, surgical clips).",
          "CT Advantages: Rapid acquisition time (ideal in acute trauma/resuscitation), superior bone/cortical detail and acute intracranial hemorrhage detection, widely available, lower cost compared to MRI, compatible with cardiac pacemakers/ferromagnetic implants.",
          "CT Disadvantages: Ionizing radiation exposure (carcinogenic risk, contraindicated in pregnancy), potential adverse reactions to iodinated contrast media (contrast-induced nephropathy, anaphylactoid reactions), poorer soft tissue contrast resolution compared to MRI, streak artifacts from dense bone or metallic hardware.",
          "MRI Advantages: Excellent multiplanar soft tissue contrast resolution (ideal for brain, spinal cord, ligaments, cartilage, pelvis), no ionizing radiation (safe in pregnant patients), non-contrast vascular imaging (MRA/MRV), functional and diffusion-weighted sequences (DWI for acute ischemic stroke within minutes).",
          "MRI Disadvantages: Long scan duration (motion artifacts), contraindication in patients with non-MRI compatible ferromagnetic implants/pacemakers/metallic foreign bodies in the eye, claustrophobia, loud acoustic noise, high capital/maintenance cost, nephrogenic systemic fibrosis (NSF) risk with gadolinium contrast in severe renal failure (eGFR <30 mL/min)."
        ],
        studyReferences: [
          "Sutton's Textbook of Radiology and Imaging — Principles of CT and MRI",
          "Armstrong & Wastie's Diagnostic Imaging — Technical Principles of Cross-Sectional Imaging"
        ],
        priority: "HIGH YIELD — Directly tested across 2024 surgery papers in the radiology specialty section."
      };
    }

    if (t.includes("extradural") || t.includes("head trauma") || t.includes("traumatic brain")) {
      return {
        keyConcepts: [
          "Extradural (Epidural) Haemorrhage Pathophysiology: Bleeding into the potential space between the inner table of the skull and the outer endosteal layer of the dura mater, most commonly due to traumatic rupture of the middle meningeal artery or vein associated with a temporoparietal skull fracture across the pterion.",
          "Clinical Presentation: Classical 'lucid interval' (initial brief loss of consciousness from concussion, followed by temporary mental clarity, then progressive deterioration of consciousness as the hematoma expands). Ipsilateral pupil dilatation (compression of the 3rd cranial nerve by uncal herniation) and contralateral hemiparesis (compression of the cerebral peduncle). Cushing's triad (hypertension, bradycardia, irregular respirations) indicates life-threatening raised ICP.",
          "Emergency Management: 1. Trauma ABCDE resuscitation (secure airway with endotracheal intubation if GCS ≤8, maintain PaO2 >60 mmHg and PaCO2 35-40 mmHg, target MAP ≥80 mmHg to preserve cerebral perfusion pressure CPP = MAP - ICP). 2. Immediate non-contrast CT brain (characteristic biconvex/hyperdense lens-shaped lenticular hematoma limited by cranial sutures). 3. Medical ICP lowering (IV Mannitol 0.25-1 g/kg or 3% Hypertonic saline, 30-degree head-of-bed elevation, seizure prophylaxis). 4. Emergency surgical decompression: Urgent craniotomy or burr-hole evacuation of the clot and bipolar coagulation of the bleeding middle meningeal vessels."
        ],
        studyReferences: [
          "Bailey & Love's Short Practice of Surgery — Head and Spinal Cord Injuries",
          "Advanced Trauma Life Support (ATLS) Student Course Manual — Head Trauma",
          "Brain Trauma Foundation Guidelines for the Management of Severe Traumatic Brain Injury"
        ],
        priority: "CRITICAL HIGH YIELD — Core neurosurgical emergency with distinct radiographic and clinical presentation."
      };
    }

    if (t.includes("electroconvulsive") || t.includes("ect")) {
      return {
        keyConcepts: [
          "Indications for ECT: Severe life-threatening depression (catatonia, severe psychomotor retardation, acute psychotic depression, acute high suicide risk, refusal to eat or drink with starvation/dehydration), severe treatment-resistant mania, neuroleptic malignant syndrome (NMS), refractory schizophrenia.",
          "Pre-ECT Medical Workup: Comprehensive pre-anesthetic clearance (cardiorespiratory evaluation), FBC, serum electrolytes, urea, creatinine, 12-lead ECG (screen for arrhythmias/recent MI), chest X-ray, and neuroimaging (CT/MRI brain) if intracranial mass lesion is suspected. (Absolute contraindication: space-occupying cerebral lesions with raised intracranial pressure due to herniation risk).",
          "Modified ECT Technique (Step-by-Step): 1. Pre-procedure: NPO for 6–8 hours, remove dentures/jewelry, establish IV access. 2. Pre-oxygenation: 100% O2 via bag-valve-mask. 3. Anticholinergic agent: IV Glycopyrrolate or Atropine to prevent vagally mediated severe bradycardia/asystole and reduce bronchial secretions. 4. Anesthetic agent: Short-acting IV hypnotic (Methohexital 0.75-1 mg/kg or Propofol). 5. Muscle relaxant: IV Succinylcholine 0.5-1 mg/kg to mitigate peripheral musculoskeletal trauma and fractures. 6. Airway protection: Insert bite block to protect teeth and tongue.",
          "Seizure Duration & Monitoring: Cuff technique (blood pressure cuff inflated above systolic pressure on one lower limb before succinylcholine injection to observe motor seizure). Minimum motor seizure duration: 20-25 seconds; minimum EEG seizure duration: 25-30 seconds. Inadequate seizures (<15 seconds) lack clinical therapeutic efficacy; prolonged seizures (>120-180 seconds) should be aborted with IV Diazepam or Midazolam.",
          "Electrode Placement & Adverse Effects: Bilateral/Bitemporal (faster and more robust response, higher incidence of cognitive side effects) vs Right Unilateral (d'Elia placement, significantly reduced retrograde amnesia). Common adverse effects: retrograde and anterograde amnesia (usually resolves within weeks), post-ictal delirium/confusion, headache, nausea, transient hypertension or bradycardia."
        ],
        studyReferences: [
          "Gelder, Cowen & Harrison — Oxford Textbook of Psychiatry: Somatic and Biological Treatments",
          "American Psychiatric Association (APA) Task Force Report on Electroconvulsive Therapy"
        ],
        priority: "CRITICAL HIGH YIELD — Direct question in June 2025 asking for a detailed description of an observed ECT session."
      };
    }

    if (t.includes("mood stabilizer") || t.includes("lithium") || t.includes("ebstein")) {
      return {
        keyConcepts: [
          "5 Established Mood Stabilizers: 1. Lithium Carbonate. 2. Sodium Valproate / Divalproex. 3. Carbamazepine. 4. Lamotrigine. 5. Atypical Antipsychotics with mood stabilizing efficacy (e.g., Olanzapine, Quetiapine, Aripiprazole).",
          "5 Essential Pre-Lithium Investigations: 1. Renal Function Tests (Serum Urea, Creatinine, eGFR) — Lithium is exclusively eliminated by glomerular filtration. 2. Thyroid Function Tests (TSH, Free T4) — Risk of lithium-induced goitre and hypothyroidism. 3. 12-lead ECG — Lithium can suppress sinus node activity causing T-wave flattening/inversion, bradyarrhythmias, or sinus arrest. 4. Pregnancy test (beta-hCG) in women of childbearing potential — Teratogenic risk. 5. Serum Electrolytes (especially Sodium) — Hyponatremia promotes proximal tubular reabsorption of lithium, inducing toxic levels. Also check Serum Calcium (risk of hyperparathyroidism).",
          "Ebstein's Anomaly Pathophysiology: A congenital cyanotic/acyanotic cardiac defect classically associated with first-trimester in utero maternal lithium exposure (~1 in 1,000 live births vs 1 in 20,000 baseline). Characterized by apical/downward displacement of the tricuspid valve's septal and posterior leaflets into the right ventricle, resulting in an 'atrialized' portion of the right ventricle, severe tricuspid regurgitation, right atrial enlargement, and accessory conduction pathways (Wolff-Parkinson-White syndrome in 20-30%).",
          "Therapeutic Drug Monitoring (TDM) & Toxicity Management: Target trough level 0.6–1.0 mEq/L (maintenance) or 0.8–1.2 mEq/L (acute mania), drawn exactly 12 hours post-dose. Toxicity signs: Mild (>1.5 mEq/L: coarse tremors, nausea, vomiting, ataxia); Severe (>2.0–2.5 mEq/L: coarse tremor, myoclonus, hyperreflexia, convulsions, stupor, coma). Emergency treatment: aggressive IV 0.9% saline hydration to promote excretion; emergency hemodialysis if levels >4.0 mEq/L (or >2.5 mEq/L with severe neurologic compromise or renal impairment)."
        ],
        studyReferences: [
          "Kaplan & Sadock's Synopsis of Psychiatry — Mood Stabilizers and Lithium",
          "Stahl's Essential Psychopharmacology — Bipolar Spectrum and Mood Stabilizing Agents"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q1 on June 2025 examination paper; mandatory psychopharmacology viva/essay material."
      };
    }

    if (t.includes("tarasoff") || t.includes("duty to protect")) {
      return {
        keyConcepts: [
          "Forensic Concept (Tarasoff Principle): Established in Tarasoff v. Regents of the University of California (1976). Dictates that when a mental health clinician determines, or should reasonably determine, that a patient poses a serious, credible threat of imminent physical violence against a specific, identifiable victim, the protective privilege of doctor-patient confidentiality ends. The clinician has an affirmative legal and ethical 'Duty to Protect / Duty to Warn'.",
          "2 Actions Clinician Must Take: 1. Immediately notify and warn the intended identifiable third party/victim. 2. Notify local law enforcement authorities and arrange emergency involuntary psychiatric assessment/admission under the Mental Health Act to secure the patient.",
          "2 Drawbacks of the Concept: 1. Destroys the therapeutic alliance and patient confidentiality, causing patients to conceal homicidal or paranoid thoughts or drop out of care. 2. High false-positive rate: psychiatric clinical prediction of future violence has modest statistical sensitivity and specificity, risking unnecessary alarm, civil liberties restriction, and stigmatization.",
          "4 Core Items in Assessing Mental Capacity / Competency: 1. Understanding: Can the patient understand the relevant nature, purpose, benefits, and risks of the condition and proposed decision? 2. Retaining: Can the patient retain the information long enough to make an effective decision? 3. Weighing / Reasoning: Can the patient weigh and balance the information as part of a rational deliberation? 4. Communicating: Can the patient clearly communicate their chosen decision (by speech, writing, or sign)?"
        ],
        studyReferences: [
          "American Academy of Psychiatry and the Law (AAPL) Practice Guideline for Forensic Psychiatric Evaluation of Violence",
          "British Medical Association (BMA) & Mental Capacity Act Guidelines: Capacity and Confidentiality"
        ],
        priority: "CRITICAL HIGH YIELD — Direct repeat question appearing on both January 2025 and June 2025 psychiatry papers."
      };
    }

    if (t.includes("catatonia")) {
      return {
        keyConcepts: [
          "Clinical Syndrome & Etiologies: Neuropsychiatric condition characterized by prominent motor, behavioral, and volition disturbances. Etiologies: Affective disorders (bipolar mania/depression, unipolar major depression — most common), Schizophrenia, General medical conditions (anti-NMDA receptor encephalitis, SLE, Wilson's disease, central nervous system infections), Drug-induced / withdrawal.",
          "Clinical Subtypes: 1. Retarded/Stuporous: Immobility, mutism, staring, stupor, posturing, catalepsy / waxy flexibility, negativism. 2. Excited: Purposeless motor agitation, severe hyperactivity, delirium. 3. Malignant (Lethal) Catatonia: Medical emergency marked by fever, autonomic instability (labile BP, tachycardia, diaphoresis), extreme lead-pipe rigidity, elevated CK, and high risk of rhabdomyolysis / death.",
          "Bush-Francis Catatonia Rating Scale (BFCRS): 23-item clinical rating scale (first 14 items used for rapid screening). Characteristic signs: Catalepsy (maintaining postures against gravity), Waxy Flexibility (smooth resistance to positioning like bending a wax candle), Gegenhalten (opposition to passive movements with force proportional to strength applied), Ambitendency, Echolalia, Echopraxia.",
          "Management Protocol: 1. Lorazepam Challenge Test: Administer 1–2 mg IV/IM Lorazepam; marked relief of mutism and immobility within 30 minutes confirms catatonia. 2. High-dose Benzodiazepine regimen: Lorazepam 6–16 mg/day in divided doses. 3. Electroconvulsive Therapy (ECT): First-line therapy for malignant catatonia, acute exhausted state, or cases refractory to high-dose lorazepam after 48–72 hours. 4. Strictly avoid standard antipsychotics (which may aggravate rigidity and precipitate malignant catatonia / NMS)."
        ],
        studyReferences: [
          "Fink & Taylor — Catatonia: A Clinician's Guide to Diagnosis and Treatment",
          "DSM-5-TR: Catatonia Associated with Another Mental Disorder"
        ],
        priority: "HIGH YIELD — Q4 short note topic in June 2025; essential psychiatric emergency management."
      };
    }

    if (t.includes("enuresis")) {
      return {
        keyConcepts: [
          "Definition & Diagnostic Threshold: Involuntary voiding of urine into clothes or bed occurring at least twice weekly for a minimum of 3 consecutive months, in a child who is chronologically and developmentally at least 5 years of age, without organic urinary pathology.",
          "Classification: Primary Enuresis (continence never achieved for ≥6 months; delayed neurological bladder maturation, nocturnal polyuria, high arousal threshold) vs Secondary Enuresis (recurrence after ≥6 months of dry period; often triggered by emotional distress, family disruption, birth of sibling, school stress, sexual abuse, or organic causes like UTI, diabetes mellitus/insipidus). Monosymptomatic (no daytime lower urinary tract symptoms) vs Non-monosymptomatic (daytime urgency, frequency, urge incontinence, encopresis).",
          "Evaluation: 3-day voiding/fluid diary, physical examination (inspect spine for dysraphism, neurological lower limb reflexes, palpate abdomen for full bladder/fecal loading), and urinalysis (dipstick for glucose, protein, leukocyte esterase, nitrites).",
          "Management Strategy: 1. First-line behavioral interventions: Demystification, avoid punitive parental reactions, positive reinforcement reward charts, evening fluid restriction (no liquids 2 hours before bed), avoid caffeine-containing beverages, void immediately before sleeping. 2. Enuresis Alarm (Conditioning Therapy): Most effective long-term treatment with lowest relapse rate (~70% cure rate); moisture sensor triggers buzzer, waking child. Requires 2–3 months of consistent use. 3. Pharmacotherapy: Desmopressin (oral lyophilisate / MELT, synthetic ADH analogue; rapid onset, restricts nocturia; must restrict evening fluids to prevent hyponatremia/water intoxication). Second-line: Imipramine (TCA, requires baseline ECG; risk of fatal overdose) or Anticholinergics (Oxybutynin for daytime urge/small capacity bladder)."
        ],
        studyReferences: [
          "NICE Clinical Guideline [CG111] — Bedwetting in Children and Young People",
          "Nelson Textbook of Pediatrics — Elimination Disorders: Enuresis"
        ],
        priority: "HIGH YIELD — Direct question on child & adolescent psychiatry in June 2025 examination paper."
      };
    }

    if (t.includes("biopsychosocial") || (t.includes("bipolar") && t.includes("formulation"))) {
      return {
        keyConcepts: [
          "Diagnosis: Bipolar I Disorder, current or recurrent mood episodes (alternating mania with severe depression), with comorbid poorly controlled Hypertension, poorly controlled Type 2 Diabetes Mellitus, and Alcohol/Tobacco Use Disorder.",
          "Predisposing Factors (4Ps Biopsychosocial Formulation): Biological: Strong genetic vulnerability (mother with recurrent affective disorder/sadness, paternal severe alcohol dependence). Psychological: Adverse childhood experiences, chronic domestic violence exposure, poor coping strategies. Social: Chaotic upbringing, generational trauma.",
          "Precipitating Factors: Biological: Uncontrolled vascular and metabolic disease (HTN, T2DM) causing cerebrovascular/subcortical white matter ischemia. Psychological: Severe psychological trauma and distress from losing ancestral land and cocoa investments to fraud. Social: Acute financial ruin, unemployment, loss of socioeconomic status.",
          "Perpetuating (Maintaining) Factors: Biological: Non-adherence to antihypertensive, hypoglycemic, and mood stabilizer medications ('bitter taste', pill burden, lack of perceived efficacy); daily alcohol and heavy tobacco consumption. Psychological: Denial, feelings of worthlessness, demoralization, learned helplessness. Social: Unemployment, economic instability, lack of supportive family infrastructure.",
          "Holistic Management Plan: 1. Acute psychiatric stabilization: Inpatient admission if severe risk of harm or self-neglect; initiate mood stabilizer (Lithium or Sodium Valproate) + atypical antipsychotic (Olanzapine/Quetiapine) for mood stabilization. 2. Medical co-management: Consult endocrinology/internal medicine to rationalize diabetes (target HbA1c <7.0%) and hypertension (target BP <130/80) with simplified once-daily regimens. 3. Addiction medicine: Alcohol cessation support, thiamine supplementation, smoking cessation program. 4. Psychosocial: Psychoeducation, Cognitive Behavioral Therapy (CBT), Social welfare support, vocational rehabilitation, and family engagement."
        ],
        studyReferences: [
          "Kaplan & Sadock's Synopsis of Psychiatry — Mood Disorders & Biopsychosocial Formulation",
          "NICE Clinical Guideline [CG185] — Bipolar Disorder: Assessment and Management"
        ],
        priority: "CRITICAL HIGH YIELD — Core multi-system clinical vignette repeated across January 2025 and June 2025 papers."
      };
    }

    if (t.includes("hazard control") || t.includes("hierarchy of hazard")) {
      return {
        keyConcepts: [
          "Hierarchy of Hazard Control (5 Levels in Strict Order of Effectiveness):",
          "1. Elimination: Physically and completely remove the hazard from the workplace (most effective, e.g., stopping manual lifting of heavy loads with overhead cranes, eliminating hazardous toxic chemical solvents).",
          "2. Substitution: Replace the hazard with a safer, non-toxic alternative (e.g., using water-based paints instead of organic lead-based solvents, using fiberglass instead of asbestos).",
          "3. Engineering Controls: Isolate workers from the physical hazard (e.g., installing Local Exhaust Ventilation [LEV] at sawmill/chemical workstations, physical machine safety guards, acoustic noise enclosures, interlock switches).",
          "4. Administrative Controls: Modify the way work is organized and performed (e.g., job rotation to limit daily exposure time, standard operating procedures [SOPs], regular safety training, hazard warning signs, statutory pre-employment and periodic medical examinations).",
          "5. Personal Protective Equipment (PPE): Protect the individual worker with protective equipment (least effective; dependent on human compliance and fit e.g., respirators, safety goggles, earmuffs, heavy-duty gloves, steel-toed boots)."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Occupational Health: Occupational Hazards and Safety Measures",
          "National Institute for Occupational Safety and Health (NIOSH) — Hierarchy of Controls Framework"
        ],
        priority: "CRITICAL HIGH YIELD — Direct 10-mark question in October 2026 Mock Community Medicine paper."
      };
    }

    if (t.includes("population pyramid") || (t.includes("pyramid") && t.includes("demograph"))) {
      return {
        keyConcepts: [
          "Pyramid Identification: Expansive / Rapidly Growing Population Pyramid (characterized by a broad base, a narrow middle, and a progressively narrowing apex). Represents Stage 1 or early Stage 2 of the Demographic Transition Model.",
          "Representative Countries: Developing countries in Sub-Saharan Africa and South Asia (e.g., Nigeria, Niger, Uganda, Mali, Afghanistan).",
          "3 Demographic Characteristics: 1. High Crude Birth Rate (CBR) and high Total Fertility Rate (TFR >5.0 children per woman). 2. High Infant and Under-5 Mortality Rate with low life expectancy at birth. 3. Young age-structure with a very high youth dependency ratio (40% to 45% of total population under 15 years old).",
          "Health Service Planning Implications: 1. Disproportionate requirement for Maternal, Newborn, and Child Health (MNCH) services, labor wards, pediatric hospital beds, and childhood malnutrition clinics. 2. Heavy resource allocation needed for Expanded Programme on Immunization (EPI) vaccines, cold-chain infrastructure, school health programs, and primary education.",
          "Major Health Need & Public Health Intervention: High burden of vaccine-preventable diseases and infant undernutrition; intervention is the Comprehensive Child Survival Strategy (GOBI-FFF: Growth monitoring, Oral rehydration therapy, Breastfeeding promotion, Immunization, Female education, Family planning, and Food supplementation)."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Demography and Family Planning: Population Pyramids",
          "Lucas and Gilles — Short Textbook of Public Health Medicine for the Tropics: Demography"
        ],
        priority: "CRITICAL HIGH YIELD — Direct question on October 2026 Mock paper and core demographic analysis."
      };
    }

    if (t.includes("epidemiological study design") || (t.includes("cohort") && t.includes("case-control"))) {
      return {
        keyConcepts: [
          "Scenario 1 (Long-term radiation in 150 radiographers): Cohort Study (Prospective or Retrospective Occupational Cohort). Justification: Defined exposure (ionizing radiation), specific occupational cohort (150 radiographers) followed forward/backward in time to detect multiple disease outcomes (e.g., thyroid cancer, leukemia, cataracts). Direct temporal sequence (exposure precedes outcome); calculates true incidence rates, Relative Risk (RR), and Attributable Risk (AR). Disadvantages: expensive, prolonged follow-up, loss to follow-up (attrition bias).",
          "Scenario 2 (Outbreak of rare neurological disorder with 50 affected individuals): Case-Control Study. Justification: Rare disease condition with a small, defined case population (50 affected individuals) needing urgent investigation to rapidly identify multiple unknown or suspected antecedent exposures. Compares exposure history in cases vs disease-free matched controls; calculates Odds Ratio (OR). Advantages: quick, inexpensive, ideal for rare conditions with long latency. Disadvantages: cannot directly calculate incidence or relative risk, highly vulnerable to recall bias and selection bias.",
          "Cohort vs Case-Control Rules: Cohort starts with EXPOSURE status and looks forward for DISEASE; Case-Control starts with DISEASE status and looks backward for EXPOSURE."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Principles of Epidemiology and Epidemiologic Methods",
          "Gordis Epidemiology — Study Designs: Cohort and Case-Control Studies"
        ],
        priority: "CRITICAL HIGH YIELD — LAQ 1 on October 2026 Community Medicine Mock examination paper."
      };
    }

    if (t.includes("statistical calculation") || (t.includes("chi-square") && t.includes("attributable risk"))) {
      return {
        keyConcepts: [
          "Cohort Study 2x2 Risk Calculations: 1. Incidence in Exposed (Ie) = a / (a + b) = 300 / 500 = 0.60 (60%). 2. Incidence in Unexposed (Iu) = c / (c + d) = 100 / 500 = 0.20 (20%). 3. Relative Risk (RR) = Ie / Iu = 0.60 / 0.20 = 3.0 (Women taking exogenous estrogen have 3 times the risk of developing breast cancer compared to unexposed).",
          "Statistical Significance via Chi-Square: Expected values E11=200, E12=300, E21=200, E22=300. Chi-Square statistic = Sum of ((O - E)^2 / E) = 50 + 33.33 + 50 + 33.33 = 166.67. With 1 degree of freedom, critical value at p=0.05 is 3.84. Since 166.67 >> 3.84, the association is statistically significant at p < 0.001.",
          "Attributable Risk (AR / Risk Difference): AR = Ie - Iu = 0.60 - 0.20 = 0.40 (40 excess breast cancer cases per 100 exposed women are directly caused by estrogen therapy).",
          "Attributable Risk Percent (AR% / Etiologic Fraction): AR% = ((Ie - Iu) / Ie) * 100% = (0.40 / 0.60) * 100% = 66.67% (or [RR - 1] / RR = 2/3 = 66.7%). Interpretation: 66.7% of breast cancer cases among estrogen users could be prevented if estrogen exposure were eliminated."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Epidemiology: Association and Causation",
          "Gordis Epidemiology — Estimating Risk: Relative Risk, Odds Ratio, and Attributable Risk"
        ],
        priority: "CRITICAL HIGH YIELD — Direct 20-mark LAQ 2 calculation problem on October 2026 Community Medicine Mock."
      };
    }

    if (t.includes("type i") || t.includes("biostatistical definition") || t.includes("type ii error")) {
      return {
        keyConcepts: [
          "Type I Error (Alpha / False Positive): Rejecting the null hypothesis (H0) when it is true (concluding a difference or treatment effect exists when none actually does). Implication: Marketing or prescribing an ineffective, potentially toxic, or expensive drug. Curtailed by: Setting a stricter significance level (e.g., alpha = 0.01 instead of 0.05).",
          "Type II Error (Beta / False Negative): Failing to reject the null hypothesis (H0) when it is false (concluding no treatment effect exists when the treatment is genuinely beneficial). Implication: Abandoning an effective, lifesaving therapeutic agent. Curtailed by: Increasing study sample size (N), boosting statistical power (Power = 1 - Beta >= 80%), and improving measurement precision.",
          "Relationship: Alpha and Beta are inversely related for a fixed sample size. The only way to decrease both simultaneously is to increase the total sample size!"
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Basic Biostatistics: Tests of Significance and Errors",
          "Bland — An Introduction to Medical Statistics: Hypothesis Testing and Power"
        ],
        priority: "HIGH YIELD — Direct 10-mark SAQ 2 on October 2026 Community Medicine Mock."
      };
    }

    if (t.includes("community participation") || (t.includes("primary health care") && t.includes("principles"))) {
      return {
        keyConcepts: [
          "Core Principle of PHC (Alma-Ata Declaration 1978): Process by which individuals, families, and communities assume active responsibility for their own health and welfare, participating in decision-making, planning, implementation, and evaluation.",
          "5 Essential Community Stakeholders: 1. Traditional Rulers / Community Heads (Baale, Emir, Oba). 2. Ward Development Committees (WDC) and Village Development Committees (VDC). 3. Women Leaders / Market Women Associations (Iyaloja). 4. Religious and Faith-Based Leaders. 5. Youth Associations and Community-Based Organizations (CBOs).",
          "Types of Community Participation: 1. Passive (people are told what will happen). 2. Participation in Information Giving (answering surveys). 3. Participation by Consultation (consulted by external agents who define problems). 4. Participation for Material Incentives (participate in exchange for food/cash). 5. Functional Participation (forming committees to achieve predetermined project goals). 6. Interactive / Self-Mobilization (joint analysis, empowerment, and community initiatives).",
          "5 Advantages of Community Participation: 1. Promotes community ownership and long-term project sustainability. 2. Ensures health interventions are culturally acceptable and relevant. 3. Mobilizes and leverages local community resources (labor, land, funds). 4. Empowers community members and fosters self-reliance. 5. Improves health service utilization and coverage."
        ],
        studyReferences: [
          "Park's Textbook of Preventive and Social Medicine — Primary Health Care in Nigeria",
          "National Primary Health Care Development Agency (NPHCDA) — Ward Health System Guidelines"
        ],
        priority: "HIGH YIELD — Direct 10-mark SAQ 4 on October 2026 Community Medicine Mock."
      };
    }

    if (t.includes("delirium tremens") || t.includes("alcohol withdrawal") || (t.includes("alcohol") && t.includes("complication"))) {
      return {
        keyConcepts: [
          "Diagnosis & Onset: Delirium Tremens (DTs) — the most severe manifestation of alcohol withdrawal, developing 48–96 hours after cessation or significant reduction of chronic heavy alcohol intake. Characterized by gross tremor, severe agitation, vivid visual/tactile hallucinations (zoopsia e.g. snakes, scorpions, insects crawling), disorientation, fluctuating consciousness, autonomic hyperactivity (sweating, tachycardia, hypertension, fever), and withdrawal seizures ('rum fits').",
          "Comprehensive Management Protocol: 1. Environment: Quiet, well-lit single room to minimize sensory illusions/hallucinations and prevent accidental injury (fracture care and splinting). 2. Benzodiazepine Regimen: Cornerstone of therapy. Diazepam (10–20 mg PO/IV titrated every 1–2 hours using symptom-triggered CIWA-Ar protocol) or Chlordiazepoxide; use Lorazepam (1–2 mg) in severe hepatic impairment or elderly patients. 3. High-dose Parenteral Thiamine (Vitamin B1): 200–500 mg IV/IM TDS (e.g., IV Pabrinex) administered BEFORE any intravenous glucose or carbohydrate infusion to prevent precipitating acute Wernicke's Encephalopathy. 4. Supportive: Fluid and electrolyte repletion (correct hypokalemia, hypomagnesemia, and hypoglycemia), multivitamin supplementation, adequate analgesia and orthopedic immobilization for femoral fracture.",
          "5 Neurological Complications of Chronic Alcoholism: 1. Wernicke's Encephalopathy (classic triad: global confusion/delirium, ophthalmoplegia/nystagmus, and cerebellar ataxia). 2. Korsakoff's Amnestic Syndrome (severe anterograde and retrograde amnesia with confabulation and lack of insight). 3. Alcohol Withdrawal Seizures (generalized tonic-clonic 'rum fits' occurring 6–48 hours post-cessation). 4. Alcoholic Peripheral Neuropathy (distal symmetric 'glove-and-stocking' sensorimotor polyneuropathy, burning feet). 5. Alcoholic Cerebellar Degeneration (progressive truncal ataxia, broad-based dyspraxic gait, intention tremor). (Also: Marchiafava-Bignami disease, Central Pontine Myelinolysis, and Alcoholic Dementia)."
        ],
        studyReferences: [
          "Gelder, Cowen & Harrison — Oxford Textbook of Psychiatry: Substance Use and Alcohol-Related Disorders",
          "Kaplan & Sadock's Synopsis of Psychiatry — Alcohol-Induced Disorders: Delirium Tremens",
          "NICE Clinical Guideline [CG115] — Alcohol-Use Disorders: Diagnosis and Management of Physical Complications"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q1 on April 2024 Psychiatry paper; clinical emergency uniting surgical admission, alcohol withdrawal delirium, and neurological pathology."
      };
    }

    if (t.includes("neuroleptic malignant") || t.includes("nms")) {
      return {
        keyConcepts: [
          "Diagnosis: Neuroleptic Malignant Syndrome (NMS) — life-threatening idiosyncratic reaction to dopamine receptor antagonists (especially high-potency first-generation antipsychotics like Haloperidol, Fluphenazine). Cardinal Tetrad: 1. Hyperthermia (severe fever ≥38–40°C). 2. Severe Generalized Muscle Rigidity ('lead-pipe' rigidity, akinesia). 3. Altered Mental Status (delirium, agitation, catatonic stupor, coma). 4. Autonomic Instability (tachycardia, labile/fluctuating blood pressure, diaphoresis, tachypnea, sialorrhea).",
          "2 Key Laboratory Findings: 1. Markedly Elevated Serum Creatine Kinase (CK / CPK, often >1,000 to >100,000 IU/L) due to extensive skeletal muscle rhabdomyolysis. 2. Leukocytosis (WBC count 10,000–40,000/mm³ with left shift). (Also: elevated serum creatinine/urea from acute tubular necrosis, metabolic acidosis, myoglobinuria, and hyperkalemia).",
          "5 Differential Diagnoses: 1. Serotonin Syndrome (hyperreflexia, clonus, shivering, tremor, gastrointestinal hypermotility/diarrhea rather than lead-pipe rigidity; caused by serotonergic agents). 2. Malignant Hyperthermia (triggered by volatile halogenated anesthetics and succinylcholine; Ryanodine receptor RYR1 mutation). 3. Lethal / Malignant Catatonia (prominent past affective history, waxy flexibility, mutism, responsive to lorazepam). 4. Central Nervous System Infection (meningitis, viral encephalitis, brain abscess). 5. Anticholinergic Toxicity / Toxidrome ('hot as a hare, blind as a bat, dry as a bone, red as a beet, mad as a hatter' — marked anhidrosis/dry skin and dilated sluggish pupils). (Also: Sepsis, Heat stroke, Thyroid storm).",
          "Management Strategy: 1. Immediate cessation: Discontinue Haloperidol and all antipsychotic/dopamine-blocking agents immediately. 2. Medical ICU care: Aggressive external and internal cooling (cooling blankets, ice packs to axillae/groin, cold IV saline infusions); vigorous IV hydration (0.9% normal saline at 200–300 mL/hr to maintain high urinary output and prevent pigment nephropathy/renal shutdown); correct acidosis and electrolyte derangements. 3. Specific Pharmacotherapy: Dopamine agonists (Bromocriptine 2.5–5 mg PO/NG 3–4 times daily, or Amantadine 100–200 mg BD) to overcome central D2 blockade; Direct skeletal muscle relaxant (IV Dantrolene sodium 1–2.5 mg/kg bolus, up to 10 mg/kg/day) to inhibit sarcoplasmic calcium release. 4. Refractory cases: Electroconvulsive Therapy (ECT). 5. Re-challenge rule: Wait at least 2 weeks after full clinical resolution before restarting antipsychotics; choose a low-potency atypical agent with low D2 affinity (e.g. Quetiapine) with slow, careful titration."
        ],
        studyReferences: [
          "Kaplan & Sadock's Synopsis of Psychiatry — Psychopharmacology: Adverse Effects of Antipsychotics",
          "Stahl's Essential Psychopharmacology — Antipsychotic Agents & Neuroleptic Malignant Syndrome",
          "American Psychiatric Association (APA) Practice Guidelines for the Treatment of Patients With Schizophrenia"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q2 on April 2024 and Q1 on January 2025 Psychiatry papers."
      };
    }

    if (t.includes("personality disorder") || t.includes("projective")) {
      return {
        keyConcepts: [
          "Definition: An enduring, rigid, and pervasive pattern of inner experience and behavior that deviates markedly from the expectations of the individual's culture, manifests across cognitive, affective, interpersonal, and impulse control domains, is inflexible and stable over time, has an onset during adolescence or early adulthood, and leads to significant distress or socio-occupational impairment.",
          "DSM-5 / ICD Personality Clusters & Examples: 1. Cluster A ('Odd / Eccentric'): Paranoid (distrust, suspiciousness), Schizoid (detachment from social relationships, restricted affect), Schizotypal (eccentric behavior, magical thinking, cognitive distortions). 2. Cluster B ('Dramatic / Emotional / Erratic'): Antisocial (disregard for rights of others, deceit, lack of remorse), Borderline / Emotionally Unstable (instability in relationships, self-image, affect, marked impulsivity and suicidal gestures), Histrionic (excessive emotionality and attention seeking), Narcissistic (grandiosity, need for admiration, lack of empathy). 3. Cluster C ('Anxious / Fearful'): Avoidant (social inhibition, feelings of inadequacy, hypersensitivity to negative evaluation), Dependent (submissive and clinging behavior, need to be taken care of), Obsessive-Compulsive / Anankastic (preoccupation with orderliness, perfectionism, mental/interpersonal control).",
          "4 Examples of Projective Personality Assessment Tests: 1. Rorschach Inkblot Test (10 standardized symmetrical inkblots interpreted by subject; assesses unconscious personality dynamics, perception, and emotional functioning). 2. Thematic Apperception Test (TAT) (series of ambiguous pictures depicting interpersonal situations; subject creates stories revealing underlying motives, conflicts, and needs). 3. Rotter Incomplete Sentence Blank (Sentence Completion Test) (subject completes unfinished sentence stems revealing attitudes and inner conflicts). 4. Draw-A-Person Test (DAP) / House-Tree-Person (HTP) projective drawing tests. (Also: Children's Apperception Test [CAT] and Rosenzweig Picture-Frustration Study)."
        ],
        studyReferences: [
          "Kaplan & Sadock's Synopsis of Psychiatry — Personality Disorders & Psychological Assessment",
          "DSM-5-TR — Personality Disorders Classification",
          "Anastasi & Urbina — Psychological Testing: Projective Techniques"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q3 on April 2024 Psychiatry paper."
      };
    }

    if (t.includes("clozapine") || t.includes("atypical antipsychotic")) {
      return {
        keyConcepts: [
          "Pharmacological Profile & Unique Indications: Prototype atypical second-generation antipsychotic with potent 5-HT2A antagonism, high D4 and alpha-adrenergic affinity, but weak D2 striatal blockade (negligible extrapyramidal symptoms and no tardive dyskinesia). Indications: 1. Treatment-resistant schizophrenia (failure to respond to adequate trials of at least two different antipsychotics, including at least one atypical, each for ≥6–8 weeks at therapeutic doses). 2. Persistent suicidality or aggressive behavior in schizophrenia / schizoaffective disorder.",
          "Black Box Warnings & Critical Monitoring: 1. Agranulocytosis (1–2% risk): Mandatory regular monitoring of Full Blood Count (WBC ≥3,500/mm³ and Absolute Neutrophil Count ANC ≥2,000/mm³; monitored weekly for first 18 weeks, every 2 weeks for weeks 19–52, then monthly indefinitely). Clozapine must be withheld immediately if ANC drops <1,500/mm³ and stopped permanently if ANC <1,000/mm³. 2. Myocarditis and Cardiomyopathy: Baseline and serial monitoring of troponin, CRP, and 12-lead ECG; monitor for tachycardia, chest pain, and heart failure signs. 3. Dose-dependent Seizures: Significant reduction in seizure threshold at doses >450–600 mg/day (add prophylactic Sodium Valproate if needed). 4. Severe Constipation & Gastrointestinal Hypomotility: Can progress to fatal paralytic ileus / toxic megacolon; prophylactic stool softeners/laxatives are standard. 5. Severe Metabolic Derangement: Marked weight gain, dyslipidemia, and new-onset Type 2 diabetes mellitus.",
          "Distinguishing Side Effects: Nocturnal hypersalivation (sialorrhea, managed with sublingual ipratropium spray or hyoscine), orthostatic hypotension, sedation, and absence of hyperprolactinemia."
        ],
        studyReferences: [
          "Kaplan & Sadock's Synopsis of Psychiatry — Clozapine & Second-Generation Antipsychotics",
          "Stahl's Essential Psychopharmacology — Clozapine: Efficacy and Risk Management",
          "Maudsley Prescribing Guidelines in Psychiatry — Clozapine Treatment and Monitoring"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q4c short note on April 2024 Psychiatry paper."
      };
    }

    if (t.includes("fitness to plead") || (t.includes("criminal responsibility") && t.includes("capacity"))) {
      return {
        keyConcepts: [
          "Legal Definition & Doctrine: A fundamental common law doctrine determining whether an accused person undergoing criminal trial possesses the present mental capacity to comprehend the trial proceedings, instruct defense counsel, and make a proper legal defense. Governed by the **Pritchard Criteria (R v Pritchard, 1836)**.",
          "Core Pritchard Criteria (6 Key Components): 1. Capacity to understand the nature of the charge/indictment. 2. Capacity to plead to the indictment (guilty or not guilty). 3. Capacity to challenge a juror without cause. 4. Capacity to comprehend the evidence presented in court. 5. Capacity to follow and understand the course of courtroom proceedings. 6. Capacity to properly instruct legal counsel for defense.",
          "Difference from Criminal Responsibility (Insanity Defense / M'Naghten Rules): Fitness to plead evaluates mental state AT THE TIME OF TRIAL (present capacity), whereas criminal responsibility / insanity assesses the accused's mental state AT THE TIME OF THE ALLEGED OFFENSE.",
          "Legal Consequence of Unfitness: If determined unfit to plead by the court (usually following forensic psychiatric evaluation and testimony by two medical practitioners), the trial is adjourned, and the accused is remanded to a secure forensic psychiatric hospital (under the Criminal Procedure Act / Mental Health Act) for inpatient treatment until mental fitness is restored."
        ],
        studyReferences: [
          "Bluglass & Bowden — Principles and Practice of Forensic Psychiatry: Fitness to Plead",
          "Kaplan & Sadock's Synopsis of Psychiatry — Forensic Psychiatry & Legal Competency",
          "R v Pritchard (1836) 7 C & P 303 & Modern Criminal Procedure Guidelines"
        ],
        priority: "HIGH YIELD — Direct Q4a short note on April 2024 and recurring forensic psychiatry topic."
      };
    }

    if (t.includes("psychoactive substance") || (t.includes("classification") && t.includes("substance"))) {
      return {
        keyConcepts: [
          "Definition: Chemical substances that, when taken into the body, cross the blood-brain barrier to alter mental processes, cognition, mood, perception, consciousness, and behavior.",
          "Pharmacological Classification (by Major CNS Effects): 1. CNS Depressants: Suppress central neural activity, enhance GABA transmission (Alcohol, Benzodiazepines, Barbiturates, GHB). Effects: sedation, anxiolysis, muscle relaxation, respiratory depression in overdose. 2. CNS Stimulants: Increase dopaminergic/noradrenergic activity, block reuptake or stimulate release (Amphetamines, Methamphetamine, Cocaine, MDMA/Ecstasy, Nicotine, Caffeine, Khat). Effects: euphoria, increased arousal, alertness, anorexia, tachycardia, paranoid psychosis. 3. Opioids / Narcotics: Bind mu-opioid receptors, analgesia and euphoria (Morphine, Heroin, Codeine, Tramadol, Methadone, Fentanyl, Pentazocine, Pethidine). Triad of toxicity: pinpoint pupils (miosis), respiratory depression, unconsciousness. 4. Hallucinogens / Psychedelics: 5-HT2A receptor agonists causing profound distortions in sensory perception (LSD, Psilocybin, Mescaline, DMT). 5. Cannabinoids: Agonists at CB1 and CB2 cannabinoid receptors (Cannabis / Marijuana, Hashish, synthetic cannabinoids / Spice). 6. Dissociative Anesthetics: NMDA receptor antagonists (Ketamine, Phencyclidine [PCP]). 7. Volatile Inhalants: Rapid CNS absorption (Glue, Toluene, Gasoline/Petrol, Nitrous Oxide).",
          "Dependence Syndrome Criteria (ICD-10): Diagnosed if ≥3 of the following occur together over the past year: Strong desire/compulsion to use ('craving'); Difficulties in controlling substance-taking behavior; Physiological withdrawal state upon reduction; Evidence of tolerance (requiring increased doses); Progressive neglect of alternative pleasures/interests; Persistent use despite clear evidence of harmful consequences."
        ],
        studyReferences: [
          "WHO Lexicon of Alcohol and Drug Terms & ICD-10 Classification of Mental Disorders",
          "Kaplan & Sadock's Synopsis of Psychiatry — Substance Use Disorders",
          "Stahl's Essential Psychopharmacology — Disorders of Reward and Drugs of Abuse"
        ],
        priority: "HIGH YIELD — Direct Q4d short note on April 2024 Psychiatry paper."
      };
    }

    if (t.includes("psychiatric emergenc") || (t.includes("agitation") && t.includes("violence"))) {
      return {
        keyConcepts: [
          "Definition: Acute behavioral, cognitive, or affective disturbances requiring immediate medical and psychiatric assessment and intervention to prevent imminent death, serious bodily injury, or irreversible harm to the patient or others.",
          "Major Examples: 1. Acute Agitation and Violent Behavior (psychotic excitement, mania, intoxication). 2. Acute Suicidal Crisis / Severe Intentional Self-Harm. 3. Neuroleptic Malignant Syndrome (NMS) & Malignant Catatonia. 4. Delirium / Acute Confusional State with underlying organic etiology. 5. Severe Alcohol Withdrawal (Delirium Tremens) and acute substance intoxications/overdoses. 6. Acute Dystonic Reaction (laryngospasm, oculogyric crisis). 7. Severe Panic Attack.",
          "Management Principles & De-escalation Protocol: 1. Safety & Environment: Ensure safety of staff and patient; remove dangerous objects, maintain clear unhindered exit, do not corner the patient, call security if armed. 2. Verbal De-escalation: Calm, respectful, non-confrontational communication; listen actively, validate distress, maintain comfortable personal space. 3. Rapid Tranquilization (when verbal de-escalation fails): Oral route preferred (Lorazepam 1–2 mg PO + Haloperidol 2.5–5 mg PO). If uncooperative/parenteral required: IM Lorazepam (1–2 mg) and/or IM Haloperidol (2.5–5 mg) or IM Olanzapine (5–10 mg). (Warning: Never administer IM Olanzapine and IM Lorazepam concomitantly due to fatal cardiorespiratory collapse and hypotension!). 4. Physical Restraint: Extreme measure of last resort; requires multi-person trained team, supine positioning with 30° head elevation (never prone, risk of positional asphyxia), continuous 15-minute nursing checks (vitals, circulation, hydration), and immediate release once calm."
        ],
        studyReferences: [
          "Oxford Handbook of Psychiatry — Psychiatric Emergencies",
          "NICE Clinical Guideline [NG10] — Violence and Aggression: Short-Term Management in Mental Health",
          "Kaplan & Sadock's Synopsis of Psychiatry — Psychiatric Emergencies"
        ],
        priority: "HIGH YIELD — Direct Q4e short note on April 2024 Psychiatry paper."
      };
    }

    if (t.includes("psychology") || t.includes("freud") || t.includes("conditioning") || t.includes("theoretical approaches")) {
      return {
        keyConcepts: [
          "5 Theoretical Approaches to Psychology & Major Thinkers: 1. Psychodynamic Approach (Sigmund Freud, Carl Jung) — Emphasizes unconscious mental processes, childhood experiences, internal psychic conflict (id, ego, superego), and defense mechanisms. 2. Behavioral Approach (John B. Watson, B.F. Skinner, Ivan Pavlov) — Focuses on observable, measurable behavior learned via environmental stimulus-response contingencies, classical conditioning, and operant reinforcement. 3. Cognitive Approach (Jean Piaget, Aaron Beck, Ulric Neisser) — Focuses on internal mental operations: perception, memory, thinking, schemas, and cognitive appraisals. 4. Humanistic Approach (Carl Rogers, Abraham Maslow) — Emphasizes human agency, free will, innate potential for self-actualization, and unconditional positive regard in person-centered counseling. 5. Biological / Neuropsychological Approach (Donald Hebb, Alexander Luria) — Focuses on physiological substrates: brain neuroanatomy, neurochemical transmission, genetic predispositions, and endocrine functions.",
          "Sigmund Freud's Psychosexual Stages of Development (OAPLG): 1. Oral Stage (Birth to 18 months): Erogenous zone is the mouth (sucking, biting, feeding). Fixation causes oral dependency, overeating, smoking, or nail-biting. 2. Anal Stage (18 months to 3 years): Erogenous zone is the anus (toilet training, bowel control). Fixation causes anal-retentive (excessive cleanliness, rigidity, stinginess) or anal-expulsive (messiness, disorganization). 3. Phallic Stage (3 to 6 years): Erogenous zone is the genitals. Key conflicts: Oedipus complex (boys) and Electra complex (girls); resolved by identification with the same-sex parent and internalization of moral standards (superego). 4. Latency Stage (6 years to puberty): Sexual drives become dormant; energy sublimated into academic learning, peer social interactions, and sports. 5. Genital Stage (Puberty through adulthood): Erogenous zone is adult mature genitals; focus on establishing mature romantic relationships, emotional intimacy, and creative productivity.",
          "Classical vs Operant Conditioning (2 Examples Each): Classical Conditioning (Pavlovian stimulus-stimulus association): Example 1: Pavlov's Dog Experiment — pairing a ringing bell (conditioned stimulus) with meat powder (unconditioned stimulus) until the bell alone evokes salivation (conditioned response). Example 2: Chemotherapy Anticipatory Nausea — pairing the sight/smell of an oncology clinic with nausea-inducing cytotoxic drugs, leading the hospital environment alone to trigger severe nausea. Operant Conditioning (Skinnerian response-consequence learning): Example 1: Token Economy in Psychiatric Rehabilitation (Positive Reinforcement) — patients earn tokens for performing self-care (bathing, bed-making), redeemable for telephone calls or recreational privileges. Example 2: Time-Out in Child Behavioral Therapy (Negative Punishment) — briefly removing a child from an enjoyable social activity following aggressive behavior to decrease tantrums. (Also: Skinner Box lever pressing to avoid electric shocks [negative reinforcement])."
        ],
        studyReferences: [
          "Passer & Smith — Psychology: The Science of Mind and Behavior",
          "Kaplan & Sadock's Synopsis of Psychiatry — Theories of Personality & Psychopathology",
          "Freud, Sigmund — Three Essays on the Theory of Sexuality & Introductory Lectures on Psychoanalysis"
        ],
        priority: "CRITICAL HIGH YIELD — Direct Q5 on April 2024 Psychiatry paper."
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
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-teal-100 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 md:w-6 md:h-6 text-teal-800" />
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
          {/* 1. Top Department Navigation Bar (Matching Year Tab Design) */}
          <div className="bg-white border-b border-slate-200 px-3 md:px-8 py-2.5 shrink-0 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* Department Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mr-1 hidden lg:inline">
                  Department:
                </span>
                
                {DEPARTMENTS.map((dept) => {
                  const Icon = dept.icon;
                  const isSelected = selectedSpecialty === dept.key;
                  const deptData = database[dept.key] || {};
                  const topicCount = Object.values(deptData).reduce((sum, list) => sum + list.length, 0);
                  const questionCount = Object.values(deptData).reduce(
                    (sum, list) => sum + list.reduce((s2, t) => s2 + t.occurrences.length, 0),
                    0
                  );

                  return (
                    <button
                      key={dept.key}
                      id={`tab-${dept.key.toLowerCase().split(' ')[0]}`}
                      onClick={() => handleSpecialtyChange(dept.key)}
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
                        {topicCount} topics ({questionCount} Qs)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Input Filter */}
              <div className="relative w-full sm:w-64 md:w-72 lg:w-80 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${selectedSpecialty.replace("Internal ", "")} topics or keywords...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                    title="Clear search"
                  >
                    <span className="text-xs font-bold leading-none px-1">×</span>
                  </button>
                )}
              </div>

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
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-100">
          
          <div className="flex-1 p-2 md:p-3.5 flex flex-col gap-2 overflow-y-auto min-w-0">
            {/* Slim Header Description & Yield Legend (Ultra-compact for maximum question real estate) */}
            <div className="flex flex-row items-center justify-between gap-2 bg-white px-3 py-1.5 md:py-2 rounded-lg border border-slate-200/80 shadow-2xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-xs md:text-sm font-extrabold text-slate-800 tracking-tight truncate">
                  {selectedSubspecialty === "All" ? `${selectedSpecialty} Overview` : `${selectedSubspecialty} Analysis`}
                </h2>
                <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0">
                  {processedTopicsList.length} Topics
                </span>
                <span className="text-[11px] text-slate-400 hidden xl:inline truncate font-normal">
                  • Click any topic to view verbatim questions
                </span>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 block shrink-0"></span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">High Yield (≥3x)</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider sm:hidden">≥3x</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500 block shrink-0"></span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Common (2x)</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider sm:hidden">2x</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300 block shrink-0"></span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Single (1x)</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider sm:hidden">1x</span>
                </div>
              </div>
            </div>

          {/* Quick Filters Panel (Extremely Compact) */}
          <div className="bg-white px-3 py-1.5 md:py-2 rounded-lg border border-slate-200/70 shadow-2xs shrink-0">
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
                        <div className="col-span-6 md:col-span-3 flex items-center justify-between gap-1.5 pt-2 md:pt-0">
                          <div className="flex flex-wrap gap-1 items-center">
                            {itemObj.occurrences.map((occ, idx) => (
                              <code 
                                key={idx} 
                                className="text-[9px] font-mono bg-slate-50 border border-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded shadow-2xs whitespace-nowrap"
                              >
                                {occ}
                              </code>
                            ))}
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 hidden sm:block ${isExpanded ? "rotate-90 text-teal-600" : "group-hover:translate-x-0.5"}`} />
                        </div>

                      </div>

                      {/* Expandable study details panel */}
                      {isExpanded && (
                        <div className="bg-slate-50/80 border-t border-slate-100 p-4 md:p-5 text-xs md:text-sm space-y-4 animate-fadeIn">
                          
                          {/* Verbatim Past Examination Questions Panel */}
                          <div className="space-y-3 bg-white p-3.5 md:p-4 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-100">
                              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wide">
                                <FileText className="w-4 h-4 text-teal-700" />
                                Verbatim Past Examination Questions ({itemObj.occurrences.length})
                              </h4>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Exact essay prompts from every tested exam year
                              </span>
                            </div>

                            <div className="space-y-3 pt-1">
                              {itemObj.occurrences.map((occ, occIdx) => {
                                const qText = getQuestionText(occ, itemObj.topic, itemObj.specialty);
                                const isCopied = copiedOccurrence === `${itemObj.topic}-${occ}`;

                                return (
                                  <div 
                                    key={occIdx}
                                    className="p-3.5 bg-slate-50/90 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all relative pl-8 border-l-4 border-l-teal-600 shadow-3xs"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="absolute left-2.5 top-2.5 text-teal-500/80 font-serif text-2xl font-black select-none leading-none">&ldquo;</span>
                                    
                                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="bg-teal-100 text-teal-900 font-mono font-extrabold px-2.5 py-0.5 rounded text-[11px] shrink-0 border border-teal-200">
                                          {occ}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-semibold">
                                          {occ.toLowerCase().includes("mock") || occ.toLowerCase().includes("october 2026") || occ.toLowerCase().includes("march 2024") || occ.toLowerCase().includes("december 2024")
                                            ? "Part IV Mock Examination"
                                            : "Part IV Final MBBS Examination"}
                                        </span>
                                      </div>

                                      {qText && (
                                        <button
                                          onClick={(e) => handleCopyQuestion(qText, `${itemObj.topic}-${occ}`, e)}
                                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-teal-800 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-3xs"
                                          title="Copy question text"
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
                                      )}
                                    </div>

                                    {qText ? (
                                      <div className="text-xs md:text-[13px] text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                                        {qText}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-slate-400 italic">
                                        Clinical vignette or short note question indexed under {occ}.
                                      </div>
                                    )}

                                    {/* Question Figure / Dataset Attachment if present */}
                                    {(() => {
                                      const attachment = getQuestionAttachment(occ, itemObj.specialty);
                                      return attachment ? <QuestionFigure attachment={attachment} /> : null;
                                    })()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

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

          </div>

          {/* Solid grounded footer docked at bottom */}
          <footer className="shrink-0 bg-white border-t border-slate-200 px-3 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium z-10 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-slate-600">Built by <strong className="font-semibold text-slate-800">Ismail Abdur-Roqeeb</strong> for <strong className="font-bold text-teal-700">The Dilectus</strong></span>
              <span className="h-3 w-px bg-slate-200 hidden sm:inline-block"></span>
              <button 
                onClick={() => setShowMethodology(true)}
                className="underline text-slate-400 hover:text-teal-700 transition-colors cursor-pointer text-[10px]"
              >
                Methodology Guide
              </button>
            </div>
            
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
              Showing {processedTopicsList.length} of {Object.values(activeSpecialtyData).reduce((sum, item) => sum + item.length, 0)} modules
            </div>
          </footer>

        </main>
      </div>
      </>
      ) : (
        <ChronologicalBrowse
          bookmarkedTopics={bookmarkedTopics}
          revisedTopics={revisedTopics}
          toggleBookmark={toggleBookmark}
          toggleRevised={toggleRevised}
          handleStudyTopic={handleStudyTopic}
          activeSpecialty={selectedSpecialty}
          onSpecialtyChange={(dept) => setSelectedSpecialty(dept)}
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
