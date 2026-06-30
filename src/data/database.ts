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
      { topic: "Type 2 Diabetes Mellitus Glycemic Control", occurrences: ["Q1a, Sept 2022"] },
      { topic: "Diabetic Ketoacidosis (DKA) Pathophysiology & Management", occurrences: ["Q1b, Sept 2022"] },
      { topic: "Diabetes Cutaneous Manifestations & Necrobiosis Lipoidica", occurrences: ["Q2A, Jan 2025"] },
      { topic: "Addison's Disease / Adrenal Insufficiency & Collapse", occurrences: ["Q6, Surgery Mock Paper"] }
    ],
    "Nephrology": [
      { topic: "Acute Kidney Injury (AKI) secondary to dehydration/NSAIDs", occurrences: ["Q1, Feb 2020"] },
      { topic: "Chronic Kidney Disease & Hypertensive Nephrosclerosis", occurrences: ["Q3, April 2016"] }
    ],
    "Neurology": [
      { topic: "Parkinson's Disease Presentation, Risk Factors & Treatment", occurrences: ["Q1, April 2016"] },
      { topic: "Acute Ischemic Stroke Diagnosis & Thrombolysis", occurrences: ["Q3A, Jan 2025"] }
    ],
    "Cardiology": [
      { topic: "Congestive Heart Failure (CHF) Etiology & Management", occurrences: ["Q2, Sept 2022", "Q2, Feb 2020"] },
      { topic: "Hypertension-Mediated Organ Damage & Optic Retinopathy", occurrences: ["Q3, Sept 2022"] },
      { topic: "Ischemic Heart Disease & Diabetic Cardiomyopathy", occurrences: ["Q2, April 2016"] }
    ],
    "Dermatology": [
      { topic: "Stevens-Johnson Syndrome (SJS) & Toxic Epidermal Necrolysis (TEN)", occurrences: ["Q4, Sept 2022"] },
      { topic: "Lichen Planus Variants & Oral Manifestations", occurrences: ["Q3, Feb 2020"] },
      { topic: "HIV Associated Pruritic Papular Eruption & Oral Hairy Leukoplakia", occurrences: ["Q2B, Jan 2025"] }
    ],
    "Gastroenterology": [
      { topic: "Paracetamol Toxicity & Drug-Induced Acute Liver Failure", occurrences: ["Q6, Sept 2022"] },
      { topic: "Bleeding Peptic Ulcer Disease Pathophysiology & Management", occurrences: ["Q4, April 2016"] },
      { topic: "Decompensated Liver Cirrhosis & Portal Hypertension / Ascites", occurrences: ["Q1, Jan 2025"] }
    ],
    "Pulmonology": [
      { topic: "Silicosis, Occupational Exposure & Restrictive Spirometry Pattern", occurrences: ["Q4, Feb 2020"] },
      { topic: "Asbestosis, Mesothelioma & Pulmonary Fibrosis", occurrences: ["Q5, April 2016"] },
      { topic: "Lung Abscess vs Pulmonary Tuberculosis presentation", occurrences: ["Q5, Sept 2022"] }
    ],
    "Psychiatry": [
      { topic: "Suicide Risk Assessment, Sociological Types & Intent", occurrences: ["Q3, Feb 2020", "Q1, Sept 2022"] },
      { topic: "Bipolar Affective Disorder & Mood Stabilization in Co-morbidities", occurrences: ["Q5, Jan 2025"] },
      { topic: "Neuroleptic Malignant Syndrome (NMS) Diagnosis & Care", occurrences: ["Q1, Jan 2025"] },
      { topic: "Acute Dystonic Reaction, Extrapyramidal Side Effects & Management", occurrences: ["Q2, Sept 2022"] },
      { topic: "Alcohol Dependence Syndrome & Rehabilitation Models", occurrences: ["Q3, Sept 2022"] },
      { topic: "Forensic Psychiatry, Capacity & Competency Assessments", occurrences: ["Q2, Jan 2025"] },
      { topic: "Psychiatry Theory Essays (Mood disorders, Psychosis, CBT, Lithium, etc.)", occurrences: ["Q1, Feb 2020", "Q2, Feb 2020", "Q4, Feb 2020", "Q5, Feb 2020", "Q3, Jan 2025", "Q4, Jan 2025"] }
    ],
    "Medical Ethics": [
      { topic: "Informed Consent, Medical Negligence & Practice Liability", occurrences: ["Q7, Sept 2022"] }
    ]
  },
  "Surgery": {
    "General Surgery": [
      { topic: "Breast Cancer & Sonomammography Diagnosis", occurrences: ["LAQ 2, Surgery Paper 5", "Q8, June 2018", "Q2, Sept 2022", "Q6, Sept 2022", "SAQ 4, Feb 2020", "LAQ 2, Jan 2020"] },
      { topic: "Peritonitis, Appendicitis & Typhoid Perforation Management", occurrences: ["SAQ 10, Surgery Paper 1", "Q1, June 2018", "SAQ 4b, Jan 2020"] },
      { topic: "Blood Transfusion Indications, Complications & Procedures", occurrences: ["LAQ 1, Surgery Paper 5", "Q5, May 2018", "Q1, Feb 2020"] },
      { topic: "Gastric Carcinoma & Outflow Obstruction Presentation", occurrences: ["LAQ 1, Surgery Paper 1"] },
      { topic: "Obstructive Jaundice Assessment & Pre-operative Preparation", occurrences: ["Q1, Sept 2022", "SAQ 10, Jan 2020"] },
      { topic: "Splenectomy Indications, Techniques & Post-splenectomy Sepsis", occurrences: ["SAQ 3, Jan 2020"] },
      { topic: "Chronic Leg Ulcers, Venous Insufficiency & Marjolin's Ulcer", occurrences: ["Q2, May 2018", "SAQ 5, Jan 2020"] },
      { topic: "Bowel Preparation & Abdomino-perineal Resection for Rectal Tumors", occurrences: ["SAQ 3, Feb 2020"] },
      { topic: "Diabetic Foot Ulcer Grading & Management Principles", occurrences: ["SAQ 5, Surgery Paper 1"] }
    ],
    "Plastics": [
      { topic: "Burns, Thermal/Chemical Trauma & Inhalational Airway Injury", occurrences: ["Q10, June 2018", "Q5, Sept 2022", "SAQ 5, Feb 2020"] }
    ],
    "Orthopaedics": [
      { topic: "Talipes Equinovarus (Clubfoot) Deformities & Correction", occurrences: ["SAQ 7, Surgery Paper 1"] },
      { topic: "Septic Arthritis vs Osteomyelitis in Pediatric Hip & Limb", occurrences: ["Q1, May 2018", "Q11, Jan 2020"] },
      { topic: "Open Tibial Fractures and Gustilo-Anderson Classification", occurrences: ["Q3, Sept 2022"] },
      { topic: "Angular Knee Deformities & Pediatric Genu Valgum", occurrences: ["Q7, June 2018"] }
    ],
    "Urology": [
      { topic: "Prostate Cancer Management, Complications & Clot Retention", occurrences: ["SAQ 8, Surgery Paper 1", "Q3, May 2018", "Q11, June 2018"] },
      { topic: "Hematuria Causes in Elderly Males", occurrences: ["Q4, Sept 2022"] },
      { topic: "Testicular Torsion Presentation & Emergency Detorsion", occurrences: ["SAQ 6, Jan 2020"] }
    ],
    "Cardiothoracic Surgery": [
      { topic: "Empyema Thoracis Classification, Causes & Surgical Interventions", occurrences: ["Q12, Sept 2022"] }
    ],
    "Neurosurgery": [
      { topic: "Spinal Cord Injury Emergency Stabilization & Long-term Care", occurrences: ["SAQ 1, Surgery Paper 1", "SAQ 1, Surgery Paper 5", "Q3, Sept 2022"] },
      { topic: "Raised Intracranial Pressure (ICP) Assessment & Management Steps", occurrences: ["Q9, June 2018"] },
      { topic: "Traumatic Brain Injury, Intracranial Hematomas & Brain CT Features", occurrences: ["SAQ 4b, Surgery Paper 5", "Q3, June 2018"] }
    ],
    "Paediatric Surgery": [
      { topic: "Ruptured Pediatric Appendicitis & Emergency Management", occurrences: ["SAQ 2, Surgery Paper 1"] }
    ],
    "Trauma/Emergency Surgery": [
      { topic: "Hemorrhagic Shock & Rapid Resuscitation Protocols", occurrences: ["LAQ 2, Surgery Paper 1", "Q2, June 2018", "LAQ 1, Jan 2020"] },
      { topic: "Abdominal Trauma Secondary to Road Traffic Accidents", occurrences: ["SAQ 9, Jan 2020"] }
    ],
    "ENT": [
      { topic: "Foreign Body Ingestion/Inhalation & Emergency Tracheotomy", occurrences: ["SAQ 9, Surgery Paper 1", "Q1, ENT 2019", "Q6, June 2018"] },
      { topic: "Epistaxis Bedside Management & Diagnosis", occurrences: ["Q2, ENT 2019"] },
      { topic: "Vocal Cord Pathology, Hoarseness & Clinic Laryngoscopy", occurrences: ["Q3, ENT 2019"] },
      { topic: "Insect in Ear Removal & Complications", occurrences: ["SAQ 8, Jan 2020"] }
    ],
    "Radiology": [
      { topic: "MRI Basic Sequences (T1 vs T2 comparison)", occurrences: ["SAQ 4a, Surgery Paper 5"] },
      { topic: "Brain CT Scanning in Acute Head Trauma", occurrences: ["Q3, June 2018"] }
    ],
    "Anaesthesiology": [
      { topic: "Anaesthetic Breathing Circuits & Mapleson Systems", occurrences: ["SAQ 2, Surgery Paper 1"] },
      { topic: "Post-Dural Puncture Headache (PDPH) Characteristics & Treatment", occurrences: ["SAQ 2, Surgery Paper 5"] },
      { topic: "Local Anesthetic Systemic Toxicity (LAST) Symptoms & Management", occurrences: ["Q5, June 2018", "SAQ 6, Feb 2020"] }
    ],
    "Ophthalmology": [
      { topic: "Cataract Definition, Etiology & Treatment Modalities", occurrences: ["SAQ 3, Surgery Paper 1", "SAQ 3a, Surgery Paper 5"] },
      { topic: "Glaucoma, Visual Field Changes & Irreversible Blindness Causes", occurrences: ["SAQ 3b, Surgery Paper 5", "Q4, June 2018", "Q10, Sept 2022", "SAQ 10, Jan 2020"] }
    ]
  },
  "Community Medicine": {
    "Epidemiology": [
      { topic: "Epidemiological Study Designs (Cohort vs Case-Control)", occurrences: ["SAQ 4a, May 2010", "SAQ 6, Feb 2019", "LAQ 11, Feb 2019"] },
      { topic: "Screening Parameters (Sensitivity, Specificity, PPV & NPV)", occurrences: ["LAQ 11, Sept 2022", "SAQ 6, May 2010", "LAQ 11, May 2010"] },
      { topic: "Emerging/Re-emerging Infections & Lassa Fever Outbreaks", occurrences: ["SAQ 7, Jan 2016", "SAQ 9, March 2019"] },
      { topic: "Meningitis Control & Vaccine Campaigns", occurrences: ["SAQ 6, April 2017"] },
      { topic: "Notifiable Diseases Classification", occurrences: ["SAQ 2, Jan 2016"] },
      { topic: "Zoonotic Diseases (Epidemiology, Vectors & Reservoirs)", occurrences: ["LAQ 13, Dec 2017"] },
      { topic: "Disease Elimination vs Eradication Criteria", occurrences: ["SAQ 3, Dec 2007"] },
      { topic: "Cancer Epidemiology in Africa & Prevention Recommendations", occurrences: ["LAQ 11, Feb 2019"] }
    ],
    "Occupational Health": [
      { topic: "Occupational Health Physician Roles & Clinical Functions", occurrences: ["SAQ 5, Feb 2015", "SAQ 1, May 2010", "SAQ 5, Oct 2015", "SAQ 4, Sept 2019"] },
      { topic: "Ergonomics, Posture at Work & PPE Use", occurrences: ["SAQ 7, April 2017", "SAQ 9, Jan 2016", "SAQ 3, Feb 2019"] },
      { topic: "Occupational Hazards of Sawmill Workers", occurrences: ["SAQ 7, Dec 2017", "SAQ 5b, Jan 2016"] },
      { topic: "Occupational Hazards in Mining Industries", occurrences: ["SAQ 1, March 2019"] },
      { topic: "Occupational Hazards in Agriculture & Farming", occurrences: ["SAQ 6, June 2013"] },
      { topic: "Occupational Medicine Services in Large Industrial Settings", occurrences: ["SAQ 1, Sept 2022"] },
      { topic: "Hospital Hazards, Waste Exposure & Biosafety for Health Workers", occurrences: ["SAQ 3, May 2010"] }
    ],
    "Environmental Health": [
      { topic: "Water Quality, Water Sampling & Low-Water Sewage Systems", occurrences: ["SAQ 2, Sept 2019", "SAQ 2, June 2013", "SAQ 7, Aug 2014", "LAQ 13, March 2019"] },
      { topic: "Healthful Housing Criteria, Goals & Structural Standards", occurrences: ["SAQ 2, Dec 2017", "SAQ 9, Sept 2022", "SAQ 2, Feb 2015"] },
      { topic: "Air Pollution, Common Contaminants & Health Risks", occurrences: ["SAQ 2, Dec 2017", "SAQ 9, Jan 2016"] },
      { topic: "Municipal Solid Waste Management & Flocculation Systems", occurrences: ["SAQ 2, Dec 2017", "SAQ 2, Sept 2019"] },
      { topic: "Healthcare Waste Management, Separation & Safety", occurrences: ["LAQ 11, Jan 2016", "SAQ 9, June 2013"] },
      { topic: "Environmental Sanitation & Market Hygiene", occurrences: ["SAQ 9, Jan 2016", "SAQ 8, March 2019"] },
      { topic: "Environmental Impact Assessment (EIA) for Dye/Chemical Industries", occurrences: ["SAQ 5, Jan 2016"] },
      { topic: "Flooding Events, Drainage & Environmental Control Measures", occurrences: ["LAQ 13, Sept 2022"] }
    ],
    "Health Management": [
      { topic: "Primary Health Care (PHC) Implementation Challenges in Nigeria", occurrences: ["SAQ 5, Dec 2017", "SAQ 1, Jan 2016", "LAQ 12, Feb 2019", "SAQ 6, Sept 2019"] },
      { topic: "Referral Systems in PHC Structures & Integration", occurrences: ["SAQ 10, Sept 2022", "SAQ 3, Oct 2015"] },
      { topic: "Medical Officer of Health (MOH) Roles & Administrative Functions", occurrences: ["SAQ 5, Dec 2017"] },
      { topic: "Drug Management Cycle in Primary Care Units", occurrences: ["SAQ 2, Sept 2022"] },
      { topic: "Total Quality Management (TQM) in Tertiary Health Care", occurrences: ["LAQ 11, Jan 2016"] },
      { topic: "Health System Framework, Governance & Ministry Responsibilities", occurrences: ["SAQ 7, Sept 2019"] },
      { topic: "Supervision, Monitoring & Program Evaluation Techniques", occurrences: ["LAQ 12, March 2019"] },
      { topic: "Health Management Information System (HMIS) Challenges", occurrences: ["LAQ 12, May 2010"] },
      { topic: "Modern Health Service Underutilization in Rural Populations", occurrences: ["LAQ 13, Aug 2014"] }
    ],
    "Health Economics": [
      { topic: "Healthcare Financing Mechanisms (Community Insurance, User Fees, Out-of-Pocket)", occurrences: ["SAQ 2, Sept 2022", "SAQ 6, Jan 2016", "SAQ 8, Dec 2017", "SAQ 4, Jan 2016", "SAQ 7, March 2019", "SAQ 4, Aug 2014"] }
    ],
    "International Health": [
      { topic: "Global Agencies Promoting Health (Bilateral & Multilateral)", occurrences: ["SAQ 1, Dec 2017", "SAQ 5, Jan 2016", "SAQ 3, March 2019"] },
      { topic: "International Health Certificates & Vaccinations", occurrences: ["SAQ 1, Dec 2017", "SAQ 5, Feb 2015"] },
      { topic: "World Health Organization (WHO) Strategy & Regional Offices", occurrences: ["SAQ 3, May 2010", "SAQ 1b, May 2010"] },
      { topic: "Port Health Operations & Seaport/Airport Sanitation", occurrences: ["SAQ 9, June 2013"] }
    ],
    "Family & Reproductive Health": [
      { topic: "Maternal Mortality, Safe Motherhood & Focused Antenatal Care", occurrences: ["SAQ 3, Sept 2022", "SAQ 6, Oct 2015", "SAQ 2, Jan 2016", "SAQ 10, Sept 2019"] },
      { topic: "Family Planning Methods, Unmet Need & Contraceptive Counseling", occurrences: ["SAQ 3, 600L End of Posting", "SAQ 9, Dec 2017", "SAQ 2, March 2019", "SAQ 6, Aug 2014"] },
      { topic: "Child Survival Interventions (GOBI-FFF, Immunization, Nutrition)", occurrences: ["SAQ 3, April 2017", "LAQ 13, March 2019", "SAQ 8, June 2013"] },
      { topic: "Adolescent Health, Classification & Friendly Clinical Services", occurrences: ["SAQ 6, Sept 2022", "SAQ 2, Jan 2016"] },
      { topic: "Reproductive Health Indicators & Determinants of General Fertility", occurrences: ["SAQ 1, Feb 2015", "SAQ 8, May 2010"] },
      { topic: "School Health Environment & Waste Disposal Control", occurrences: ["SAQ 7, Jan 2016"] }
    ],
    "Health Education": [
      { topic: "Health Education Communication Methods & Behavior Adoption Theories", occurrences: ["SAQ 1, April 2017", "SAQ 10, Jan 2016", "SAQ 9, Feb 2019", "SAQ 3, Oct 2015", "SAQ 4, June 2013"] },
      { topic: "Behavior Change Communication (BCC) Implementation & Patient Charter", occurrences: ["SAQ 8, Jan 2016", "SAQ 10, Aug 2014"] }
    ],
    "Public Health Nutrition": [
      { topic: "Under-Five Nutritional Status Assessment & Surveys", occurrences: ["SAQ 7, Sept 2022", "LAQ 11, May 2010"] },
      { topic: "Nutritional Vulnerability in Pregnancy, Lactation & Child Weaning", occurrences: ["LAQ 13, Jan 2016", "SAQ 1, Oct 2015"] },
      { topic: "Elderly Nutritional Malnutrition, Socioeconomic Factors & Remedies", occurrences: ["SAQ 2, April 2017"] },
      { topic: "Protein Energy Malnutrition (PEM) Prevention & Clinical Signs", occurrences: ["SAQ 3, May 2010"] },
      { topic: "Micronutrient Deficiencies (Vitamin A, Iodine, Iron) & National Programs", occurrences: ["SAQ 10, Feb 2015", "LAQ 11, May 2010"] }
    ],
    "Biostatistics": [
      { topic: "Statistical Calculations: t-Tests, Chi-Square & Confidence Intervals", occurrences: ["LAQ 12, Jan 2016", "LAQ 11, Dec 2017", "LAQ 12, May 2010", "SAQ 7, Oct 2015", "SAQ 2b, May 2010"] },
      { topic: "Sampling Methods (Probability & Simple Random Techniques)", occurrences: ["SAQ 9, Feb 2015", "SAQ 7, May 2010", "SAQ 1, Feb 2019", "SAQ 5, Sept 2019", "SAQ 2a, May 2010"] },
      { topic: "Biostatistical Definitions (p-value, SEM, Type I & II errors, Power)", occurrences: ["LAQ 12, Jan 2016", "SAQ 8, May 2010", "LAQ 12, Jan 2016", "LAQ 11, Aug 2014"] },
      { topic: "Biomedical Research Design, Proposals & Methodological Types", occurrences: ["SAQ 9, May 2010", "SAQ 9, June 2013", "SAQ 5, Dec 2007", "SAQ 9, Aug 2014"] },
      { topic: "Normal Distribution Curve and Probability Characteristics", occurrences: ["SAQ 8, May 2010", "SAQ 7, June 2013"] },
      { topic: "Epidemiological Bias vs Confounding Control Methods", occurrences: ["SAQ 8, Sept 2022"] }
    ],
    "Demographics": [
      { topic: "Demographic Transition Theory & Phases", occurrences: ["SAQ 4, Sept 2022", "SAQ 9, Feb 2019", "SAQ 4, June 2013", "SAQ 4, Sept 2008"] },
      { topic: "Demographic Data Sources & Demographic Structure Dynamics", occurrences: ["SAQ 3, Dec 2017", "SAQ 4, Sept 2022"] },
      { topic: "Population Pyramid Construction & Significance", occurrences: ["SAQ 4, Jan 2016", "SAQ 3, Feb 2015", "SAQ 4, Sept 2008"] },
      { topic: "Population Census Formats & De Facto/De Jure Enumeration", occurrences: ["SAQ 4, Oct 2015", "SAQ 6, Jan 2016"] }
    ],
    "Social & Rehabilitative Medicine": [
      { topic: "Health Problems of Internally Displaced Persons (IDPs)", occurrences: ["SAQ 4, April 2017", "SAQ 10, Jan 2016"] },
      { topic: "Prison Health Care Services & Rehabilitative Measures", occurrences: ["SAQ 8, Jan 2016", "SAQ 1, Sept 2019", "SAQ 1, Sept 2008"] },
      { topic: "Socioeconomic Welfare Services, Challenges & Infrastructure in Nigeria", occurrences: ["SAQ 7, Feb 2019", "SAQ 5, March 2019"] },
      { topic: "Health Problems of Destitutes & Homeless Populations", occurrences: ["SAQ 6, Dec 2017", "SAQ 5, May 2010"] }
    ],
    "Medical Ethics": [
      { topic: "Principles of Medical Ethics & Professional Medical Negligence", occurrences: ["SAQ 3, Dec 2017", "SAQ 5, Sept 2022", "SAQ 4, Jan 2016", "SAQ 6, March 2019", "SAQ 9, Sept 2019", "SAQ 2, Dec 2007"] },
      { topic: "Ethics Codes & Declarations (Nuremberg, Helsinki, Tokyo, Geneva, etc.)", occurrences: ["SAQ 1, 600L End of Posting", "SAQ 7, May 2010", "SAQ 10, Oct 2015", "SAQ 2, Dec 2007"] }
    ]
  }
};
