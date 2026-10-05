export interface QuestionAttachment {
  occurrenceKey: string;
  title: string;
  figureLabel: string;
  imageUrl: string;
  caption?: string;
}

export const questionAttachments: Record<string, QuestionAttachment> = {
  // 1. December 2017 & March 2019 Q11
  "q11, december 2017": {
    occurrenceKey: "Q11, December 2017",
    title: "Clinical Trial of New Tranquilizer vs. Placebo in Psychoneurotic Patients (N = 9)",
    figureLabel: "December 2017 • Question 11 Examination Table",
    imageUrl: "/images/clinical_trial_table_svg.svg",
    caption: "Verbatim clinical trial examination dataset from Community Medicine Paper II."
  },

  // 2. January 2016 Q12
  "q12, january 2016": {
    occurrenceKey: "Q12, January 2016",
    title: "Comparative Blood Pressure Trial: Digital vs. Mercury Sphygmomanometer (N = 9)",
    figureLabel: "2016 (January) • Question 12 Examination Table",
    imageUrl: "/images/sphygmomanometer_table_2016_q12.svg",
    caption: "Verbatim examination table from Community Medicine Paper II (2016) comparing systolic blood pressure readings (mmHg) across 9 patients."
  },

  // 3. September 2022 Q11
  "q11, september 2022": {
    occurrenceKey: "Q11, September 2022",
    title: "2×2 Screening Matrix for Pulmonary Tuberculosis (N = 3,000)",
    figureLabel: "September 2022 • Question 11 Examination Table",
    imageUrl: "/images/screening_tb_table_2022_q11.svg",
    caption: "Verbatim 2×2 contingency table for chest X-ray screening vs. gold standard active pulmonary TB status across 3,000 screened subjects."
  },

  // 4. February 2019 Q6 & 600L End of Posting Q11
  "q6, february 2019": {
    occurrenceKey: "Q6, February 2019",
    title: "10-Year Prospective Cohort Table: Smoking vs. Coronary Heart Disease (N = 6,000)",
    figureLabel: "February 2019 • Question 6 Examination Table",
    imageUrl: "/images/cohort_smoking_chd_table_2019_q6.svg",
    caption: "Verbatim 2×2 prospective cohort study matrix evaluating 10-year incidence of CHD between 2,000 smokers and 4,000 non-smokers."
  },

  // 5. 600L End of Posting Q12
  "q12, 600l end of posting": {
    occurrenceKey: "Q12, 600L End of Posting",
    title: "2×2 Clinical Trial Table: Antihypertensive Drug vs. Placebo Mortality (N = 100)",
    figureLabel: "600L Clinical End of Posting • Question 12 Table",
    imageUrl: "/images/rct_hypertension_table_600l_q12.svg",
    caption: "Verbatim 2×2 clinical trial contingency table evaluating survival vs. mortality between active drug (N=65) and placebo (N=35)."
  },

  // 6. August 2014 LAQ 11 / Q11
  "laq 11, august 2014": {
    occurrenceKey: "LAQ 11, August 2014",
    title: "Term Infant Birth Weights Comparison: Males vs. Females (N = 20)",
    figureLabel: "August 2014 • Section II (Biostatistics) Question 11 Table",
    imageUrl: "/images/birth_weight_table_2014_q11.svg",
    caption: "Verbatim sample dataset comparing birth weights of 10 male and 10 female term infants delivered at a maternity center."
  },

  // 7. October 2015 Q7
  "q7, october 2015": {
    occurrenceKey: "Q7, October 2015",
    title: "Neonatal Serum HDL Cholesterol Observations (N = 10)",
    figureLabel: "October 2015 • Question 7 Examination Table",
    imageUrl: "/images/neonatal_hdl_table_2015_q7.svg",
    caption: "Verbatim examination observations of neonatal serum HDL (mmol/L) across 10 neonates in a region."
  }
};

export function getQuestionAttachment(occOrQ: string): QuestionAttachment | null {
  if (!occOrQ) return null;
  const clean = occOrQ.toLowerCase().replace(/\s+/g, " ").trim();
  
  // Direct match
  if (questionAttachments[clean]) {
    return questionAttachments[clean];
  }
  
  // Substring match for December 2017 & March 2019 Q11
  if (clean.includes("q11") && (clean.includes("2017") || clean.includes("march 2019") || clean.includes("december"))) {
    return questionAttachments["q11, december 2017"];
  }

  // Substring match for 2016 Q12 / Q12a / Q12b
  if (clean.includes("q12") && clean.includes("2016")) {
    return questionAttachments["q12, january 2016"];
  }

  // Substring match for September 2022 Q11 (TB Screening)
  if (clean.includes("q11") && clean.includes("2022")) {
    return questionAttachments["q11, september 2022"];
  }

  // Substring match for February 2019 Q6 (Smoking vs CHD cohort)
  if ((clean.includes("q6") || clean.includes("q6c")) && clean.includes("2019") && clean.includes("feb")) {
    return questionAttachments["q6, february 2019"];
  }

  // Substring match for 600L End of Posting Q11 (Smoking vs CHD cohort)
  if (clean.includes("q11") && clean.includes("600l")) {
    return questionAttachments["q6, february 2019"];
  }

  // Substring match for 600L End of Posting Q12 (RCT hypertension)
  if (clean.includes("q12") && clean.includes("600l")) {
    return questionAttachments["q12, 600l end of posting"];
  }

  // Substring match for August 2014 LAQ 11 / Q11 (Birth weights)
  if ((clean.includes("11") || clean.includes("laq 11")) && clean.includes("2014") && clean.includes("aug")) {
    return questionAttachments["laq 11, august 2014"];
  }

  // Substring match for October 2015 Q7 (Neonatal HDL)
  if (clean.includes("q7") && clean.includes("2015") && clean.includes("oct")) {
    return questionAttachments["q7, october 2015"];
  }
  
  return null;
}
