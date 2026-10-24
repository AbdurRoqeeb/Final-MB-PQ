import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware with high limits for base64-encoded question paper images
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Vision OCR and Medical Question Categorization Endpoint
  app.post('/api/parse-question-image', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', fileName } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'No image data provided.' });
      }

      // Strip potential data URL prefix if sent
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY environment variable is not configured on the server.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are an expert medical academic registrar, consultant educator, and syllabus curator for the Final MB.BS / MB.ChB (Bachelor of Medicine, Bachelor of Surgery) examinations.
Your task is to transcribe and accurately structure and categorize medical examination question papers from uploaded photos or scans.

Allowed Departments (must pick the closest one):
1. "Internal Medicine"
2. "Surgery"
3. "Community Medicine"
4. "Psychiatry"

Allowed Subspecialties:
- For Internal Medicine: "Cardiology", "Endocrinology", "Nephrology", "Neurology", "Pulmonology", "Gastroenterology", "Dermatology", "Medical Ethics", "Oncology", "Infectious Diseases", "Rheumatology", "Hematology"
- For Surgery: "General Surgery", "Plastics", "Orthopaedics", "Urology", "Pediatric Surgery", "Neurosurgery", "Cardiothoracic Surgery", "Otolaryngology / ENT", "Ophthalmology", "Anaesthesia", "Radiology"
- For Community Medicine: "Epidemiology", "Biostatistics", "Occupational Health", "Environmental Health", "Health Management", "Primary Health Care", "Demographics", "Social & Rehabilitative Medicine", "Medical Ethics"
- For Psychiatry: "Clinical Psychiatry", "Psychopharmacology", "Forensic Psychiatry", "Psychological Interventions", "Addiction Medicine"

For each question found on the paper:
1. questionNumber: Identify the exact label (e.g., "LAQ 1", "LAQ 2", "SAQ 3", "SAQ 4", "Q1", "Q2a").
2. department: Select one of the 4 official departments.
3. subspecialty: Select the clinical subspecialty.
4. topic: Formulate a standard, high-yield topic title matching medical curriculum standards (e.g., "Blood Transfusion Indications, Procedures & Complications", "Diabetic Foot Ulcer Grading & Management", "Burns, Thermal/Chemical Trauma & Inhalational Airway Injury", "Local Anaesthetic Systemic Toxicity (LAST) Symptoms & Lipid Emulsion Protocol", "Amputation: Indications, Classification of Lower Limb Amputations & Complications", "Benign Prostatic Hyperplasia & Acute Urinary Retention Management").
5. fullQuestionText: Transcribe the complete question text verbatim, including clinical vignettes and all sub-parts (a, b, c, d) and any marks shown.
6. marks: Allocated marks if specified in the text (e.g. "15 marks", "20%"), or empty string if not mentioned.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Please transcribe and categorize all questions from this medical examination paper. Identify the examination session / date, whether it is a mock exam or main exam, the paper type, and extract every single question with its precise syllabus segment (Department, Subspecialty, Topic).`,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              examTitle: {
                type: Type.STRING,
                description: 'Full exam header or institution title visible on the paper',
              },
              examDiet: {
                type: Type.STRING,
                description: 'Month and Year e.g. "October 2026", "April 2024", "January 2025"',
              },
              isMockExam: {
                type: Type.BOOLEAN,
                description: 'True if specified as Mock Examination',
              },
              paperType: {
                type: Type.STRING,
                description: 'e.g. "Paper I", "Paper II (Theory)", "LAQ", "SAQ", "Theory"',
              },
              department: {
                type: Type.STRING,
                description: 'Dominant department of this paper: "Internal Medicine", "Surgery", "Community Medicine", or "Psychiatry"',
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: {
                      type: Type.STRING,
                      description: 'Question identifier e.g. "LAQ 1", "SAQ 3", "Q1", "Q5"',
                    },
                    department: {
                      type: Type.STRING,
                      description: '"Internal Medicine", "Surgery", "Community Medicine", or "Psychiatry"',
                    },
                    subspecialty: {
                      type: Type.STRING,
                      description: 'Specific subspecialty, e.g. "General Surgery", "Endocrinology", "Plastics"',
                    },
                    topic: {
                      type: Type.STRING,
                      description: 'Comprehensive high-yield syllabus topic title',
                    },
                    fullQuestionText: {
                      type: Type.STRING,
                      description: 'Verbatim transcribed question text including clinical stem, subquestions, and marks',
                    },
                    marks: {
                      type: Type.STRING,
                      description: 'Allocated marks or weighting if visible, e.g. "15 marks"',
                    },
                  },
                  required: ['questionNumber', 'department', 'subspecialty', 'topic', 'fullQuestionText'],
                },
              },
            },
            required: ['examTitle', 'examDiet', 'questions'],
          },
        },
      });

      const rawText = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        return res.status(502).json({
          error: 'Failed to parse Gemini response as JSON',
          rawResponse: rawText,
        });
      }

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch (err: any) {
      console.error('Error processing question image:', err);
      return res.status(500).json({
        error: err.message || 'Internal server error processing question image',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'final-mb-backend' });
  });

  // Integrate Vite for development or serve built files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    // In Express 5 / path-to-regexp, wildcard '*' throws PathError.
    // Use an unmatched route handler middleware to serve index.html for SPA client-side routing.
    app.use((req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
