export interface Topic {
  topic: string;
  occurrences: string[];
}

export interface SpecialtyData {
  [subspecialty: string]: Topic[];
}

export interface FullDatabase {
  [specialty: string]: SpecialtyData;
}

export const database: FullDatabase = {
  "Internal Medicine": {
    "Endocrinology": [
      { topic: "Type 2 Diabetes Mellitus Comprehensive Cardiovascular & Glycemic Management", occurrences: ["Q1a, September 2022"] },
      { topic: "Diabetic Ketoacidosis (DKA) Pathophysiology & Management Protocols", occurrences: ["Q1b, September 2022"] },
      { topic: "Diabetes Cutaneous Manifestations, Ulcers & Necrobiosis Lipoidica", occurrences: ["Q2A, January 2025"] },
      { topic: "Addison's Disease (Adrenal Insufficiency) & Postural Hypotension", occurrences: ["Q6, January 2025"] }
    ],
    "Nephrology": [
      { topic: "Acute Kidney Injury (AKI) secondary to Herbal Remedies & NSAIDs (ATN)", occurrences: ["Q1, February 2020"] },
      { topic: "Chronic Kidney Disease & Hypertensive Nephrosclerosis", occurrences: ["Q3, April 2016"] },
      { topic: "Urinary Tract Infections: Acute Cystitis & Pyelonephritis Pathogenesis & Management", occurrences: ["Q3B, January 2025"] }
    ],
    "Neurology": [
      { topic: "Parkinson's Disease Presentation, Risk Factors & Treatment", occurrences: ["Q1, April 2016"] },
      { topic: "Acute Ischemic Stroke Diagnosis & Thrombolysis Guidelines", occurrences: ["Q3A, January 2025"] }
    ],
    "Cardiology": [
      { topic: "Acute Decompensated Heart Failure & Pulmonary Embolism Co-existence", occurrences: ["Q2, September 2022"] },
      { topic: "Congestive Heart Failure (CHF) Etiology & Pharmacotherapy", occurrences: ["Q2, February 2020", "Q4, January 2025"] },
      { topic: "Hypertensive Emergency, Malignant Hypertension & Organ Damage", occurrences: ["Q3, September 2022"] },
      { topic: "Ischemic Heart Disease & Diabetic Cardiomyopathy", occurrences: ["Q2, April 2016"] },
      { topic: "Deep Vein Thrombosis (DVT) Diagnosis & Therapeutic Management", occurrences: ["Q5, January 2025"] }
    ],
    "Dermatology": [
      { topic: "Stevens-Johnson Syndrome (SJS) & Toxic Epidermal Necrolysis (TEN)", occurrences: ["Q4, September 2022"] },
      { topic: "Lichen Planus Variants, Oral Wickham's Striae & Management", occurrences: ["Q3, February 2020"] },
      { topic: "HIV Associated Pruritic Papular Eruption & Oral Hairy Leukoplakia", occurrences: ["Q2B, January 2025"] }
    ],
    "Gastroenterology": [
      { topic: "Paracetamol Poisoning, Drug-Induced Acute Liver Failure & NAC Protocol", occurrences: ["Q6, September 2022"] },
      { topic: "Bleeding Peptic Ulcer Disease Pathophysiology & Management", occurrences: ["Q4, April 2016"] },
      { topic: "Decompensated Liver Cirrhosis, Portal Hypertension & Ascites", occurrences: ["Q1, January 2025"] }
    ],
    "Pulmonology": [
      { topic: "Silicotuberculosis, Occupational Dust Exposure & Restrictive Spirometry", occurrences: ["Q4, February 2020"] },
      { topic: "Asbestosis, Mesothelioma & Pulmonary Fibrosis", occurrences: ["Q5, April 2016"] },
      { topic: "Miliary Tuberculosis vs Metastatic Lung Disease Evaluation", occurrences: ["Q5, September 2022"] }
    ],
    "Medical Ethics": [
      { topic: "Informed Consent, Medical Malpractice & Professional Negligence Elements", occurrences: ["Q7, September 2022"] }
    ],
    "Oncology": [
      { topic: "Primary Prevention of Cancer & Global Cancer Burden", occurrences: ["Q7, September 2022", "Q7, January 2025"] }
    ]
  },
  "Psychiatry": {
    "Clinical Psychiatry": [
      { topic: "Clinical Syndromes: Depression Variants, Schizophrenia & Affective Disorders", occurrences: ["Q1, February 2020 (Psychiatry)"] },
      { topic: "Anxiety Disorders, PTSD, Coping Mechanisms & Grief Reactions", occurrences: ["Q2, February 2020 (Psychiatry)"] },
      { topic: "Suicide Risk Assessment, Sociological Types & CSF Bio-markers", occurrences: ["Q3, February 2020 (Psychiatry)"] },
      { topic: "Suicide Attempt Evaluation, Associated Disorders & Intent High-Yield Features", occurrences: ["Q1, September 2022 (Psychiatry)"] },
      { topic: "Personality Disorders: DSM Classification Clusters & Clinical Features", occurrences: ["Q4, September 2022 (Psychiatry)"] },
      { topic: "Biopsychosocial Formulation of Bipolar/Depressive Illness & Co-morbidities", occurrences: ["Q5, January 2025 (Psychiatry)"] }
    ],
    "Psychopharmacology": [
      { topic: "Neuroleptic Malignant Syndrome (NMS) Diagnosis & Therapeutic Management", occurrences: ["Q1, January 2025 (Psychiatry)"] },
      { topic: "Acute Dystonic Reaction, Extrapyramidal Side Effects & Antidotes", occurrences: ["Q2, September 2022 (Psychiatry)"] },
      { topic: "Antidepressant Classification & Serotonin Syndrome Differentials", occurrences: ["Q5, September 2022 (Psychiatry)"] },
      { topic: "Consultation-Liaison Psychiatry & Lithium Monitoring/Toxicity Guidelines", occurrences: ["Q3, January 2025 (Psychiatry)"] }
    ],
    "Forensic Psychiatry": [
      { topic: "Forensic Psychiatry: Criminal Responsibility, Capacity & Fitness to Plead", occurrences: ["Q5, February 2020 (Psychiatry)"] },
      { topic: "Forensic Duty to Protect (Tarasoff), Risk of Violence & Competency Assessment", occurrences: ["Q2, January 2025 (Psychiatry)"] }
    ],
    "Psychological Interventions": [
      { topic: "De-escalation Techniques & Physical Restraints in Acute Psychosis", occurrences: ["Q4, February 2020 (Psychiatry)"] },
      { topic: "Psychotherapy: Operant Conditioning, CBT & Psychological Modalities", occurrences: ["Q4, January 2025 (Psychiatry)"] }
    ],
    "Addiction Medicine": [
      { topic: "Alcohol Dependence: Stages of Change & Neurological Complications", occurrences: ["Q3, September 2022 (Psychiatry)"] }
    ]
  },
  "Surgery": {
    "General Surgery": [
      { topic: "Breast Cancer Evaluation, TNM Staging & Surgical Mastectomy", occurrences: ["LAQ 2, January 2025", "Q8, June 2018", "Q2, September 2022", "SAQ 4, December 2024"] },
      { topic: "Generalized Peritonitis in Pediatrics & Pre-operative Preparation", occurrences: ["SAQ 10, December 2024", "Q1, June 2018", "SAQ 10, January 2025"] },
      { topic: "Blood Transfusion Indications, Procedures & Complications", occurrences: ["LAQ 1, January 2025", "Q5, May 2018", "Q1, February 2020"] },
      { topic: "Esophageal Carcinoma, Dysphagia Grading & Palliative Interventions", occurrences: ["SAQ 6, December 2024", "SAQ 6, January 2025"] },
      { topic: "Gastric Outflow Obstruction & Gastric Cancer Management", occurrences: ["LAQ 1, December 2024"] },
      { topic: "Obstructive Jaundice Assessment & Pre-operative Preparation", occurrences: ["Q1, September 2022"] },
      { topic: "Splenectomy Indications, Techniques & Post-splenectomy Sepsis", occurrences: ["SAQ 3, January 2020"] },
      { topic: "Chronic Leg Ulcers, Venous Insufficiency & Marjolin's Ulcer", occurrences: ["Q2, May 2018"] },
      { topic: "Bowel Preparation & Abdomino-perineal Resection for Rectal Tumors", occurrences: ["SAQ 3, February 2020"] },
      { topic: "Diabetic Foot Ulcer Grading (Meggit-Wagner) & Management", occurrences: ["SAQ 5, December 2024", "SAQ 5, January 2025"] }
    ],
    "Plastics": [
      { topic: "Burns, Thermal/Chemical Trauma & Inhalational Airway Injury", occurrences: ["Q10, June 2018", "Q5, September 2022"] }
    ],
    "Orthopaedics": [
      { topic: "Talipes Equinovarus (Clubfoot) Deformities & Correction Order", occurrences: ["SAQ 7, December 2024", "SAQ 7, January 2025"] },
      { topic: "Septic Arthritis vs Osteomyelitis in Pediatric Hip & Limb", occurrences: ["Q1, May 2018"] },
      { topic: "Open Tibial Fractures and Gustilo-Anderson Classification", occurrences: ["Q3, September 2022"] },
      { topic: "Angular Knee Deformities & Pediatric Genu Valgum", occurrences: ["Q7, June 2018"] }
    ],
    "Urology": [
      { topic: "Metastatic Prostate Cancer & Emergency Clot/Urinary Retention", occurrences: ["SAQ 8, December 2024", "Q3, May 2018", "SAQ 8, January 2025"] },
      { topic: "Hematuria Causes in Elderly Males", occurrences: ["Q4, September 2022"] },
      { topic: "Testicular Torsion Presentation & Emergency Detorsion", occurrences: ["SAQ 6, January 2020"] }
    ],
    "Cardiothoracic Surgery": [
      { topic: "Empyema Thoracis Classification, Causes & Surgical Interventions", occurrences: ["Q12, September 2022"] }
    ],
    "Neurosurgery": [
      { topic: "Spinal Cord Injury Emergency Stabilization & Care", occurrences: ["SAQ 1, December 2024", "SAQ 1, January 2025", "Q3, September 2022"] },
      { topic: "Raised Intracranial Pressure (ICP) Assessment & Management Steps", occurrences: ["Q9, June 2018"] },
      { topic: "Brain CT / MRI Interpretation in Acute Head Trauma & Subdural Haematoma", occurrences: ["SAQ 4, January 2025", "Q3, June 2018"] }
    ],
    "Paediatric Surgery": [
      { topic: "Ruptured Pediatric Appendicitis & Emergency Management", occurrences: ["SAQ 2, December 2024"] }
    ],
    "Trauma/Emergency Surgery": [
      { topic: "Hemorrhagic Shock & Rapid Trauma Resuscitation", occurrences: ["LAQ 2, December 2024", "Q2, June 2018"] },
      { topic: "Abdominal Trauma Secondary to Road Traffic Accidents", occurrences: ["SAQ 9, January 2020"] }
    ],
    "ENT": [
      { topic: "Foreign Body Ingestion/Inhalation & Rigid Bronchoscopy / Esophagoscopy", occurrences: ["SAQ 9, December 2024", "Q1, February 2019", "Q6, June 2018"] },
      { topic: "Epistaxis Bedside Management & Diagnosis", occurrences: ["Q2, February 2019", "SAQ 9, January 2025"] },
      { topic: "Vocal Cord Pathology, Hoarseness & Clinic Laryngoscopy", occurrences: ["Q3, February 2019"] },
      { topic: "Insect in Ear Removal & Complications", occurrences: ["SAQ 8, January 2020"] }
    ],
    "Radiology": [
      { topic: "MRI Basic Sequences (T1 vs T2 comparison)", occurrences: ["SAQ 4, January 2025"] },
      { topic: "Brain CT Scanning in Acute Head Trauma", occurrences: ["Q3, June 2018"] }
    ],
    "Anaesthesiology": [
      { topic: "Anaesthetic Breathing Circuits & Mapleson Classification", occurrences: ["SAQ 2, December 2024"] },
      { topic: "Post-Dural Puncture Headache (PDPH) & Spinal Anesthesia Complications", occurrences: ["SAQ 2, January 2025"] },
      { topic: "Local Anesthetic Systemic Toxicity (LAST) Symptoms & Management", occurrences: ["Q5, June 2018"] }
    ],
    "Ophthalmology": [
      { topic: "Cataract Etiology, Refractive Media & Contributing Factors", occurrences: ["SAQ 3, December 2024", "SAQ 3, January 2025"] },
      { topic: "Glaucoma, Optic Disc Cupping & Irreversible Blindness", occurrences: ["SAQ 3, January 2025", "Q4, June 2018", "Q10, September 2022"] }
    ]
  },
  "Community Medicine": {
    "Epidemiology": [
      {
        topic: "Epidemiological Study Designs (Cohort vs Case-Control)",
        occurrences: ["Q4b, May 2010", "Q6a, February 2019", "Q6b, February 2019", "Q11, February 2019"]
      },
      {
        topic: "Screening Parameters (Sensitivity, Specificity, PPV & NPV)",
        occurrences: ["Q11a, September 2022", "Q11b, September 2022", "Q11a, May 2010", "Q11b, May 2010"]
      },
      {
        topic: "Levels of Disease Prevention (Primordial, Primary, Secondary & Tertiary)",
        occurrences: ["Q6a, February 2015", "Q10a, June 2013", "Q11a, September 2022"]
      },
      {
        topic: "Emerging/Re-emerging Infections & Lassa Fever Outbreaks",
        occurrences: ["Q7a, January 2016", "Q7b, January 2016", "Q9, March 2019"]
      },
      {
        topic: "Meningitis Control & Vaccine Campaigns",
        occurrences: ["Q6, April 2017"]
      },
      {
        topic: "Notifiable Diseases & Public Health Emergencies of International Concern (PHEIC)",
        occurrences: ["Q2a, January 2016", "Q2b, January 2016", "Q4a, February 2019", "Q4b, February 2019", "Q4b, February 2015"]
      },
      {
        topic: "Zoonotic Diseases (Epidemiology, Vectors & Reservoirs)",
        occurrences: ["Q13, December 2017", "Q4a, February 2015"]
      },
      {
        topic: "Disease Elimination vs Eradication Criteria",
        occurrences: ["Q3, December 2007"]
      },
      {
        topic: "Cancer Epidemiology in Africa & Prevention Recommendations",
        occurrences: ["Q11, February 2019"]
      },
      {
        topic: "HIV/AIDS, Tropical Diseases (TDR) & Care of Vulnerable Populations (PLWHA)",
        occurrences: ["Q3a, May 2014", "Q3b, May 2014", "Q6a, May 2014", "Q6b, May 2014"]
      },
      {
        topic: "Non-Communicable Diseases (NCDs): Risk Factors (Sugar, Obesity) & Public Health Control",
        occurrences: ["Q5, June 2013"]
      },
      {
        topic: "Epidemic Curve Definition, Types, Characteristics & Public Health Application",
        occurrences: ["SAQ 1, January 2025 (Comm. Med)"]
      },
      {
        topic: "Waterborne Outbreaks: Cholera Epidemiology, Pathogenesis, Transmission & Outbreak Control",
        occurrences: ["LAQ 11, January 2025 (Comm. Med)"]
      }
    ],
    "Occupational Health": [
      {
        topic: "Occupational Health Physician Roles & Clinical Functions",
        occurrences: ["Q1, September 2022", "Q5a, February 2015", "Q1a, May 2010", "Q1b, May 2010", "Q5a, October 2015", "Q5b, October 2015", "Q4a, September 2019", "Q4b, September 2019", "Q6a, June 2013", "SAQ 4, January 2025 (Comm. Med)"]
      },
      {
        topic: "Ergonomics, Posture at Work & PPE Use",
        occurrences: ["Q7a, April 2017", "Q7b, April 2017", "Q9a, January 2016"]
      },
      {
        topic: "Occupational Hazards: Principles of Control, Industry-Specific Risks & Sawmill Workers",
        occurrences: ["Q7a, December 2017", "Q7b, December 2017", "Q5a, January 2016", "Q5b, January 2016"]
      },
      {
        topic: "Occupational Hazards in Mining Industries",
        occurrences: ["Q1a, March 2019", "Q1b, March 2019"]
      },
      {
        topic: "Occupational Hazards in Agriculture & Farming",
        occurrences: ["Q6b, June 2013", "Q3, August 2014"]
      },
      {
        topic: "Occupational Medicine Services in Large Industrial Settings",
        occurrences: ["Q1, September 2022"]
      },
      {
        topic: "Hospital Hazards, Waste Exposure & Biosafety for Health Workers",
        occurrences: ["Q3, May 2010"]
      }
    ],
    "Environmental Health": [
      {
        topic: "Water Quality, Water Sampling & Low-Water Sewage Systems",
        occurrences: ["Q2b, June 2013", "Q7a, August 2014", "Q7b, August 2014", "Q13, March 2019", "Q2b, February 2015"]
      },
      {
        topic: "Healthful Housing Criteria, Goals & Structural Standards",
        occurrences: ["Q2ii, December 2017", "Q9a, September 2022", "Q9b, September 2022", "Q2a, February 2015"]
      },
      {
        topic: "Air Pollution, Common Contaminants & Health Risks",
        occurrences: ["Q2i, December 2017", "Q9a, January 2016", "SAQ 5, January 2025 (Comm. Med)"]
      },
      {
        topic: "Municipal Solid Waste & Sewage Disposal: Composting, Incineration & Sanitary Landfills",
        occurrences: ["Q2iv, December 2017", "Q2v, December 2017", "Q11, January 2016", "Q2a, September 2019", "Q2b, September 2019", "Q2a, October 2015"]
      },
      {
        topic: "Healthcare Waste Management, Separation & Safety",
        occurrences: ["Q11, January 2016", "Q9a, June 2013"]
      },
      {
        topic: "Environmental Sanitation, Food Premises & Market Hygiene",
        occurrences: ["Q2iii, December 2017", "Q2a, June 2013", "Q9b, January 2016", "Q9c, January 2016", "Q8b, March 2019", "Q8a, March 2019"]
      },
      {
        topic: "Environmental Impact Assessment (EIA) for Industrial Siting",
        occurrences: ["Q5, February 2019"]
      },
      {
        topic: "Climate Change, Flooding Events & Environmental Control Measures",
        occurrences: ["Q13a, September 2022", "Q13b, September 2022", "Q7d, August 2014", "Q13, May 2014"]
      },
      {
        topic: "Vector Biology, Vector-Borne Diseases & Integrated Vector Control Methods",
        occurrences: ["Q5, February 2019", "Q8, September 2019", "Q3b, June 2013", "Q2b, October 2015"]
      }
    ],
    "Health Management": [
      {
        topic: "Primary Health Care (PHC) Principles, Components & Implementation Challenges in Nigeria",
        occurrences: ["Q5a, December 2017", "Q1a, January 2016", "Q1b, January 2016", "Q12, February 2019", "Q6, September 2019", "Q5a, April 2017", "Q5b, April 2017", "Q6a, January 2016", "Q6b, February 2015", "Q9a, May 2010", "SAQ 9, January 2025 (Comm. Med)"]
      },
      {
        topic: "Referral Systems in PHC Structures & Integration",
        occurrences: ["Q10a, September 2022", "Q10b, September 2022", "Q3, October 2015", "Q3b, October 2015"]
      },
      {
        topic: "Medical Officer of Health (MOH) Roles & Administrative Functions",
        occurrences: ["Q5b, December 2017"]
      },
      {
        topic: "Drug Management Cycle in Primary Care Units",
        occurrences: ["Q2v, September 2022"]
      },
      {
        topic: "Total Quality Management (TQM) & Quality Improvement in Health Care",
        occurrences: ["Q2ii, September 2022"]
      },
      {
        topic: "Health Administration, Organisation Principles & Governance Frameworks in Nigeria",
        occurrences: ["Q7, September 2019", "Q8a, February 2015", "Q8b, February 2015", "Q10a, May 2010", "Q10b, May 2010"]
      },
      {
        topic: "Health Program Planning Cycle, Situation Analysis & Priority Setting",
        occurrences: ["Q12, September 2022", "Q1a, June 2013", "Q1b, June 2013", "LAQ 12, January 2025 (Comm. Med)"]
      },
      {
        topic: "Supervision, Monitoring & Program Evaluation Techniques",
        occurrences: ["Q12, March 2019", "Q8b, February 2019", "Q4, May 2014"]
      },
      {
        topic: "Modern Health Service Underutilization in Rural Populations",
        occurrences: ["Q13, August 2014"]
      }
    ],
    "Health Economics": [
      {
        topic: "Healthcare Financing Mechanisms (Community Insurance, User Fees, Out-of-Pocket)",
        occurrences: ["Q2i, September 2022", "Q2iii, September 2022", "Q6b, January 2016", "Q6c, January 2016", "Q8, December 2017", "Q7, March 2019", "Q4a, August 2014", "Q4b, August 2014", "Q16a, May 2010", "Q16b, May 2010", "Q8b, October 2015", "Q8c, October 2015"]
      }
    ],
    "International Health": [
      {
        topic: "Global Agencies Promoting Health (Bilateral & Multilateral)",
        occurrences: ["Q1a, December 2017", "Q3a, March 2019", "Q3b, March 2019", "Q2a, May 2010", "Q2b, May 2010", "SAQ 8, January 2025 (Comm. Med)"]
      },
      {
        topic: "International Health Certificates & Vaccinations",
        occurrences: ["Q1b, December 2017", "Q5b, February 2015", "Q5b, September 2019", "Q5b, October 2015"]
      },
      {
        topic: "World Health Organization (WHO) Strategy & Regional Offices",
        occurrences: ["Q2b, May 2010", "SAQ 8, January 2025 (Comm. Med)"]
      }
    ],
    "Family & Reproductive Health": [
      {
        topic: "Maternal Mortality, Safe Motherhood & Focused Antenatal Care",
        occurrences: ["Q3a, September 2022", "Q3b, September 2022", "Q3c, September 2022", "Q6, October 2015", "Q10, September 2019", "Q13, February 2019"]
      },
      {
        topic: "Family Planning Methods, Unmet Need & Contraceptive Counseling",
        occurrences: ["Q9a, December 2017", "Q9b, December 2017", "Q2, March 2019", "Q6a, August 2014", "Q6b, August 2014", "Q8c, June 2013", "Q8a, October 2015", "Q8b, October 2015", "LAQ 13, January 2025 (Comm. Med)"]
      },
      {
        topic: "Child Survival Interventions & Vulnerable Child Care (GOBI-FFF, Immunization, Motherless Babies)",
        occurrences: ["Q3, April 2017", "Q13, March 2019", "Q8a, June 2013", "Q8b, June 2013", "Q7a, February 2015"]
      },
      {
        topic: "Adolescent Health, Classification & Friendly Clinical Services",
        occurrences: ["Q6a, September 2022", "Q6b, September 2022"]
      },
      {
        topic: "Reproductive Health Indicators & Determinants of General Fertility",
        occurrences: ["Q1a, February 2015", "Q1b, February 2015", "Q8, May 2010"]
      }
    ],
    "Health Education": [
      {
        topic: "Health Education Communication Methods & Behavior Adoption Theories",
        occurrences: ["Q1a, April 2017", "Q1b, April 2017", "Q10a, December 2017", "Q10b, December 2017", "Q10, January 2016", "Q10a, March 2019", "Q10b, March 2019", "Q3b, October 2015", "Q4b, June 2013", "SAQ 10, January 2025 (Comm. Med)"]
      },
      {
        topic: "Behavior Change Communication (BCC) Implementation & Patient Charter",
        occurrences: ["Q10a, August 2014", "Q10b, August 2014"]
      }
    ],
    "Public Health Nutrition": [
      {
        topic: "Nutritional Status Assessment: Anthropometry (BMI, Under-Five Surveys & Shakir's Strip)",
        occurrences: ["Q7a, September 2022", "Q7b, September 2022", "Q11, May 2010", "Q2a, February 2019", "Q2b, February 2019", "Q1c, October 2015", "Q3, September 2019"]
      },
      {
        topic: "Nutritional Vulnerability in Pregnancy, Lactation & Child Weaning",
        occurrences: ["Q13, January 2016", "Q1a, October 2015", "Q1b, October 2015", "Q12, December 2017"]
      },
      {
        topic: "Aged & Elderly: Health Problems, Social Welfare & Nutritional Needs",
        occurrences: ["Q2, April 2017", "Q8b, January 2016", "Q7b, February 2015", "Q1, August 2014"]
      },
      {
        topic: "Protein Energy Malnutrition (PEM) Prevention & Clinical Signs",
        occurrences: ["Q3, May 2010"]
      },
      {
        topic: "Micronutrient Deficiencies (Vitamin A, Iodine, Iron) & National Programs",
        occurrences: ["Q10, February 2015", "SAQ 7, January 2025 (Comm. Med)"]
      },
      {
        topic: "Applied Nutrition: Food Pyramid, Fortification & Complementary Feeding Guidelines",
        occurrences: ["SAQ 7, January 2025 (Comm. Med)"]
      }
    ],
    "Biostatistics": [
      {
        topic: "Statistical Calculations: t-Tests, Chi-Square & Confidence Intervals",
        occurrences: ["Q11, December 2017", "Q12, January 2016", "Q12b, May 2010", "Q7, October 2015", "Q8b, May 2010", "Q6c, February 2019"]
      },
      {
        topic: "Sampling Methods (Probability & Simple Random Techniques)",
        occurrences: ["Q1a, February 2019", "Q1b, February 2019", "Q5a, September 2019", "Q5b, September 2019", "Q9b, February 2015", "Q7, May 2010", "Q7b, June 2013", "SAQ 3, January 2025 (Comm. Med)"]
      },
      {
        topic: "Biostatistical Definitions (p-value, SEM, Type I & II errors, Power)",
        occurrences: ["Q12a, January 2016", "Q11a, August 2014", "Q12a, May 2010"]
      },
      {
        topic: "Biomedical Research Design, Proposals & Methodological Types",
        occurrences: ["Q9a, February 2015", "Q9, May 2010", "Q9a, June 2013", "Q9b, June 2013", "Q9, August 2014"]
      },
      {
        topic: "Normal Distribution Curve and Probability Characteristics",
        occurrences: ["Q8a, May 2010", "Q7a, June 2013", "SAQ 3, January 2025 (Comm. Med)"]
      },
      {
        topic: "Epidemiological Bias vs Confounding Control Methods",
        occurrences: ["Q8a, September 2022", "Q8b, September 2022"]
      }
    ],
    "Demographics": [
      {
        topic: "Demographic Transition Theory & Phases",
        occurrences: ["Q4b, September 2022", "Q9b, February 2019", "Q4a, June 2013"]
      },
      {
        topic: "Demographic Data Sources & Demographic Structure Dynamics",
        occurrences: ["Q4a, September 2022", "Q3b, December 2017", "Q9c, February 2019", "Q7, May 2014"]
      },
      {
        topic: "Population Pyramid Construction & Significance",
        occurrences: ["Q4a, January 2016", "Q3a, February 2015"]
      },
      {
        topic: "Population Census Formats & De Facto/De Jure Enumeration",
        occurrences: ["Q4, October 2015", "Q4b, October 2015"]
      }
    ],
    "Social & Rehabilitative Medicine": [
      {
        topic: "Health Problems of Internally Displaced Persons (IDPs)",
        occurrences: ["Q4, April 2017"]
      },
      {
        topic: "Prison Health Care Services & Rehabilitative Measures",
        occurrences: ["Q8a, January 2016", "Q1, September 2019"]
      },
      {
        topic: "Socioeconomic Welfare Services, Challenges & Infrastructure in Nigeria",
        occurrences: ["Q7a, February 2019", "Q7b, February 2019", "Q5a, March 2019", "Q5b, March 2019"]
      },
      {
        topic: "Health Problems of Destitutes & Homeless Populations",
        occurrences: ["Q6, December 2017"]
      },
      {
        topic: "Handicapping Conditions, Impairments, Disabilities & Rehabilitative Management",
        occurrences: ["SAQ 6, January 2025 (Comm. Med)"]
      }
    ],
    "Medical Ethics": [
      {
        topic: "Principles of Medical Ethics & Professional Medical Negligence",
        occurrences: ["Q3a, December 2017", "Q5a, September 2022", "Q5b, September 2022", "Q4b, January 2016", "Q6, March 2019", "Q9a, September 2019", "Q9b, September 2019", "SAQ 2, January 2025 (Comm. Med)"]
      },
      {
        topic: "Ethics Codes & Declarations (Nuremberg, Helsinki, Tokyo, Geneva, etc.)",
        occurrences: ["Q7, May 2010", "Q10, October 2015", "Q10a, October 2015", "Q10b, October 2015", "Q10c, October 2015"]
      }
    ]
  }
};
