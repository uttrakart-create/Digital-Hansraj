import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc 
} from "firebase/firestore";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  createdAt: string;
  status: "pending" | "responded";
  responseMessage?: string;
  respondedAt?: string;
}

interface Feedback {
  id: string;
  name: string;
  email: string;
  course: string;
  rating: number;
  message: string;
  createdAt: string;
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: "acknowledgment" | "admin_response";
  inquiryId: string;
}

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

interface DB {
  inquiries: Inquiry[];
  feedback: Feedback[];
  emailLogs: EmailLog[];
  faqs?: FAQEntry[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

// Ensure local data folder and fallback file exist with initial data
function initLocalDB(): DB {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const defaultDB: DB = {
    inquiries: [
      {
        id: "inq-1",
        name: "Ayush Sharma",
        email: "ayush.sharma@gmail.com",
        phone: "+91 9812345678",
        course: "Digital Marketing Plus Generative AI",
        message: "Can you please share the weekend class timings and fee structure for the new June batch?",
        createdAt: "2026-05-24T10:15:30Z",
        status: "pending"
      },
      {
        id: "inq-2",
        name: "Neha Goel",
        email: "neha.goel@yahoo.com",
        phone: "+91 7011223344",
        course: "SEO & Search Engine Marketing",
        message: "Is there any placement assistance with this SEO short course? I am a DU commerce student.",
        createdAt: "2026-05-25T14:20:00Z",
        status: "responded",
        responseMessage: "Hello Neha, yes, Hansraj College provides 100% placement support & internship assistance upon successful completion. We will call you tomorrow morning to discuss mock interview schedules.",
        respondedAt: "2026-05-26T09:30:00Z"
      },
      {
        id: "inq-3",
        name: "Rohan Kapoor",
        email: "rohan.kapoor@gmail.com",
        phone: "+91 8800991122",
        course: "Web Designing & UI/UX",
        message: "Do we need prior coding knowledge to join the UI/UX batch starting next week?",
        createdAt: "2026-05-26T16:45:00Z",
        status: "pending"
      }
    ],
    feedback: [
      {
        id: "fb-1",
        name: "Rishi Verma",
        email: "rishi.v@gmail.com",
        course: "Digital Marketing Plus Generative AI",
        rating: 5,
        message: "Absolutely stellar course! Integrating ChatGPT and Midjourney workflows in marketing strategy gave us a massive edge over conventional digital marketing classes. The professors are brilliant and supportive.",
        createdAt: "2026-05-23T11:20:00Z"
      },
      {
        id: "fb-2",
        name: "Jessica Mary",
        email: "jessica.m@outlook.com",
        course: "Social Media Marketing & Branding",
        rating: 4,
        message: "The course was highly practical! Loved the case studies on Indian brands. It would have been perfect with a few more sessions on Meta Ads budget optimization.",
        createdAt: "2026-05-24T09:40:00Z"
      },
      {
        id: "fb-3",
        name: "Vikram Malhotra",
        email: "vikram.malhotra@gmail.com",
        course: "SEO & Search Engine Marketing",
        rating: 5,
        message: "Outstanding value. Learnt Schema markup, core web vitals, and indexation strategies on real websites. Highly recommend to all digital marketing aspirants!",
        createdAt: "2026-05-25T17:15:00Z"
      }
    ],
    emailLogs: [
      {
        id: "email-1",
        recipientEmail: "ayush.sharma@gmail.com",
        recipientName: "Ayush Sharma",
        subject: "We Received Your Inquiry! - Hansraj Digital Academy",
        body: "Dear Ayush Sharma,\n\nThank you for reaching out to Hansraj College Digital Academy regarding our course: Digital Marketing Plus Generative AI.\n\nWe have successfully received your inquiry and our academic consultants will call you within 24 working hours at +91 9812345678.\n\nBest regards,\nHansraj Digital Academy Admissions Desk\nUniversity of Delhi",
        sentAt: "2026-05-24T10:15:35Z",
        type: "acknowledgment",
        inquiryId: "inq-1"
      },
      {
        id: "email-2",
        recipientEmail: "neha.goel@yahoo.com",
        recipientName: "Neha Goel",
        subject: "We Received Your Inquiry! - Hansraj Digital Academy",
        body: "Dear Neha Goel,\n\nThank you for reaching out to Hansraj College Digital Academy regarding our course: SEO & Search Engine Marketing.\n\nWe have successfully received your inquiry and our academic consultants will call you within 24 working hours at +91 7011223344.\n\nBest regards,\nHansraj Digital Academy Admissions Desk\nUniversity of Delhi",
        sentAt: "2026-05-25T14:20:05Z",
        type: "acknowledgment",
        inquiryId: "inq-2"
      },
      {
        id: "email-3",
        recipientEmail: "rohan.kapoor@gmail.com",
        recipientName: "Rohan Kapoor",
        subject: "We Received Your Inquiry! - Hansraj Digital Academy",
        body: "Dear Rohan Kapoor,\n\nThank you for reaching out to Hansraj College Digital Academy regarding our course: Web Designing & UI/UX.\n\nWe have successfully received your inquiry and our academic consultants will call you within 24 working hours at +91 8800991122.\n\nBest regards,\nHansraj Digital Academy Admissions Desk\nUniversity of Delhi",
        sentAt: "2026-05-26T16:45:05Z",
        type: "acknowledgment",
        inquiryId: "inq-3"
      },
      {
        id: "email-4",
        recipientEmail: "neha.goel@yahoo.com",
        recipientName: "Neha Goel",
        subject: "Official Response Regarding Your SEO Short Course Inquiry",
        body: "Hello Neha, yes, Hansraj College provides 100% placement support & internship assistance upon successful completion. We will call you tomorrow morning to discuss mock interview schedules.",
        sentAt: "2026-05-26T09:30:00Z",
        type: "admin_response",
        inquiryId: "inq-2"
      }
    ],
    faqs: [
      {
        id: "faq-1",
        question: "What courses are offered by Hansraj College Digital Academy?",
        answer: "We offer flagship short-term courses including: Digital Marketing Plus Generative AI, SEO & Search Engine Marketing, Social Media Marketing & Branding, Web Designing & UI/UX, Graphic Designing & Creative Layouts, and Data Analytics & Performance Marketing.",
        category: "courses",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-2",
        question: "Are the lectures conducted online or offline?",
        answer: "Our lectures are conducted offline at the Hansraj College campus (University of Delhi). This allows for hands-on classroom lab sessions, team brainstorming, and in-person agency mock drives.",
        category: "courses",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-3",
        question: "Am I eligible to apply if I am in my first or second year at University of Delhi?",
        answer: "Yes! The short courses are deliberately designed with flexible weekend and evening slots, making them fully compatible with regular DU college degrees.",
        category: "admissions",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-4",
        question: "What is the procedure for securing admission?",
        answer: "To secure admission, submit an inquiry form online. Our academic coordinators will contact you to verify your basic educational qualifications, explain the syllabus, and guide you through fee deposit procedures.",
        category: "admissions",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-5",
        question: "What are the fee structures and installment options?",
        answer: "Fees vary from ₹15,000 to ₹25,000 depending on the course length. We provide interest-free installment options (2 easy parts) for deserving students, with additional discounts for Hansraj College students.",
        category: "fees",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-6",
        question: "Are there any hidden costs or lab infrastructure fees?",
        answer: "No, there are zero hidden fees. The program fee covers all study materials, library reference privileges, active lab usage, and certification registration charges.",
        category: "fees",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-7",
        question: "Is this certificate officially recognized by DU?",
        answer: "Yes, the certification is officially issued and signed by Hansraj College, University of Delhi authorities under the short-term professional studies initiative.",
        category: "institution",
        createdAt: "2026-05-27T00:00:00Z"
      },
      {
        id: "faq-8",
        question: "Where is the physical center of the institution located?",
        answer: "Classes are held within the main campus structure of Hansraj College, Mahatma Hans Raj Marg, Malka Ganj, Delhi, 110007 (North Campus, University of Delhi).",
        category: "institution",
        createdAt: "2026-05-27T00:00:00Z"
      }
    ]
  };

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
    return defaultDB;
  }

  try {
    const rawData = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(rawData);
    if (!parsed.faqs) {
      parsed.faqs = defaultDB.faqs;
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read database, resetting with defaults", err);
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), "utf-8");
    return defaultDB;
  }
}

// Read the Firebase Web Configuration from the shared JSON file
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));

// Initialize Firebase App and Firestore Instance
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

// Reusable asynchronous helpers to sync with Firestore
async function getFirestoreDB(): Promise<DB> {
  try {
    const faqsSnapshot = await getDocs(collection(firestoreDb, "faqs"));
    const feedbackSnapshot = await getDocs(collection(firestoreDb, "feedback"));
    const inquiriesSnapshot = await getDocs(collection(firestoreDb, "inquiries"));
    const emailLogsSnapshot = await getDocs(collection(firestoreDb, "emailLogs"));

    // If Firestore is empty (such as a fresh project setup), seed all collections with our default dataset
    if (faqsSnapshot.empty && feedbackSnapshot.empty && inquiriesSnapshot.empty) {
      console.log("Firestore is empty, seeding defaults from local DB...");
      const localDB = initLocalDB();
      
      // Seed FAQs
      for (const faq of localDB.faqs || []) {
        await setDoc(doc(firestoreDb, "faqs", faq.id), faq);
      }
      // Seed feedback
      for (const fb of localDB.feedback) {
        await setDoc(doc(firestoreDb, "feedback", fb.id), fb);
      }
      // Seed inquiries
      for (const inq of localDB.inquiries) {
        await setDoc(doc(firestoreDb, "inquiries", inq.id), inq);
      }
      // Seed email logs
      for (const log of localDB.emailLogs) {
        await setDoc(doc(firestoreDb, "emailLogs", log.id), log);
      }

      console.log("Firestore seeding completed successfully.");
      return localDB;
    }

    const faqs: FAQEntry[] = [];
    faqsSnapshot.forEach(d => {
      faqs.push(d.data() as FAQEntry);
    });

    const feedback: Feedback[] = [];
    feedbackSnapshot.forEach(d => {
      feedback.push(d.data() as Feedback);
    });

    const inquiries: Inquiry[] = [];
    inquiriesSnapshot.forEach(d => {
      inquiries.push(d.data() as Inquiry);
    });

    const emailLogs: EmailLog[] = [];
    emailLogsSnapshot.forEach(d => {
      emailLogs.push(d.data() as EmailLog);
    });

    // Sort to keep consistent chronological order
    feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    emailLogs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return { inquiries, feedback, emailLogs, faqs };
  } catch (error) {
    console.error("Failed to query Firestore. Falling back to secure local DB file:", error);
    return initLocalDB();
  }
}

async function saveInquiryFirestore(inq: Inquiry) {
  try {
    await setDoc(doc(firestoreDb, "inquiries", inq.id), inq);
  } catch (err) {
    console.error("Firestore inquiries save fail:", err);
  }
}

async function saveFeedbackFirestore(fb: Feedback) {
  try {
    await setDoc(doc(firestoreDb, "feedback", fb.id), fb);
  } catch (err) {
    console.error("Firestore feedback save fail:", err);
  }
}

async function saveEmailLogFirestore(log: EmailLog) {
  try {
    await setDoc(doc(firestoreDb, "emailLogs", log.id), log);
  } catch (err) {
    console.error("Firestore emailLogs save fail:", err);
  }
}

async function saveFAQFirestore(faq: FAQEntry) {
  try {
    await setDoc(doc(firestoreDb, "faqs", faq.id), faq);
  } catch (err) {
    console.error("Firestore faqs save fail:", err);
  }
}

async function deleteFAQFirestore(id: string) {
  try {
    await deleteDoc(doc(firestoreDb, "faqs", id));
  } catch (err) {
    console.error("Firestore faqs delete fail:", err);
  }
}

// In-memory sessions representation
const activeSessions: Record<string, { adminId: string, expiresAt: number }> = {};
// Simple secure admin configuration (Hardcoded credentials for testing/production)
const ADMIN_USER = "admin";
const ADMIN_PASS = "hansraj123"; // Plain text default for easy verification

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to support JSON post payloads
  app.use(express.json());

  // Static helper to load/save database
  const getDB = async (): Promise<DB> => {
    return await getFirestoreDB();
  };
  const saveDB = (db: DB) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  };

  // 1. PUBLIC API: Get dynamic list of courses
  app.get("/api/courses", (req, res) => {
    const courses = [
      "Digital Marketing Plus Generative AI",
      "SEO & Search Engine Marketing",
      "Social Media Marketing & Branding",
      "Web Designing & UI/UX",
      "Graphic Designing & Creative Layouts",
      "Data Analytics & Performance Marketing"
    ];
    res.json(courses);
  });

  // 1b. PUBLIC API: Get dynamic list of FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      const db = await getDB();
      res.json(db.faqs || []);
    } catch (err) {
      console.error("API /api/faqs fail:", err);
      res.status(500).json({ error: "Failed to read FAQs" });
    }
  });

  // 2. PUBLIC API: Submit student feedback (Rating, message, etc.)
  app.post("/api/feedback", async (req, res) => {
    const { name, email, course, rating, message } = req.body;

    if (!name || !email || !course || !rating || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars" });
    }

    try {
      const db = await getDB();
      const newFeedback: Feedback = {
        id: "fb-" + crypto.randomUUID(),
        name,
        email,
        course,
        rating: ratingVal,
        message,
        createdAt: new Date().toISOString()
      };

      db.feedback.unshift(newFeedback);
      saveDB(db);

      // Async save to Firestore in real-time
      await saveFeedbackFirestore(newFeedback);

      res.status(201).json({ success: true, feedback: newFeedback });
    } catch (err) {
      console.error("API /api/feedback fail:", err);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // 3. PUBLIC API: Submit inquiry + Auto Acknowledgment Email triggering logic
  app.post("/api/inquiries", async (req, res) => {
    const { name, email, phone, course, message } = req.body;

    if (!name || !email || !phone || !course || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const db = await getDB();
      const inqId = "inq-" + crypto.randomUUID();
      const newInquiry: Inquiry = {
        id: inqId,
        name,
        email,
        phone,
        course,
        message,
        createdAt: new Date().toISOString(),
        status: "pending"
      };

      // Auto-generate acknowledgment email
      const emailId = "email-" + crypto.randomUUID();
      const emailSubject = `We Received Your Inquiry! - Hansraj Digital Academy`;
      const emailBody = `Dear ${name},

Thank you for reaching out to Hansraj College Digital Academy regarding our flagship course: ${course}.

We have successfully received your inquiry message:
"${message}"

Our experienced academic advisors will call you within 24 working hours at ${phone} to discuss eligibility, syllabus details, and installment options.

Best regards,
Admissions Desk
Hansraj Digital Academy
University of Delhi (DU)
Website: www.hansrajdigital.com`;

      const newEmailLog: EmailLog = {
        id: emailId,
        recipientEmail: email,
        recipientName: name,
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toISOString(),
        type: "acknowledgment",
        inquiryId: inqId
      };

      db.inquiries.unshift(newInquiry);
      db.emailLogs.unshift(newEmailLog);
      saveDB(db);

      // Async sync both models to Firestore in real-time
      await saveInquiryFirestore(newInquiry);
      await saveEmailLogFirestore(newEmailLog);

      res.status(201).json({
        success: true,
        inquiry: newInquiry,
        autoEmailSent: {
          subject: emailSubject,
          recipient: email,
          body: emailBody
        }
      });
    } catch (err) {
      console.error("API /api/inquiries fail:", err);
      res.status(500).json({ error: "Failed to save inquiry" });
    }
  });

  // Middleware for checking admin token session security
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access, authorization token is missing" });
    }

    const token = authHeader.split(" ")[1];
    const session = activeSessions[token];

    if (!session || session.expiresAt < Date.now()) {
      if (session) delete activeSessions[token]; // clean expired
      return res.status(401).json({ error: "Session expired, please login again" });
    }

    // Refresh expiry
    session.expiresAt = Date.now() + 60 * 60 * 1000; // Extend by 1 hour
    next();
  };

  // 4. ADMIN LOGIN API
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = crypto.randomBytes(32).toString("hex");
      activeSessions[token] = {
        adminId: "admin-principal",
        expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour session duration
      };

      return res.json({
        success: true,
        token,
        admin: {
          username: ADMIN_USER,
          role: "Administrator"
        }
      });
    }

    res.status(401).json({ error: "Incorrect username or password" });
  });

  // 5. ADMIN VERIFY SESSION
  app.get("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ authenticated: false });
    }

    const token = authHeader.split(" ")[1];
    const session = activeSessions[token];

    if (!session || session.expiresAt < Date.now()) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      admin: {
        username: ADMIN_USER,
        role: "Administrator"
      }
    });
  });

  // 6. ADMIN API: Get list of Feedback
  app.get("/api/admin/feedback", authMiddleware, async (req, res) => {
    try {
      const db = await getDB();
      res.json(db.feedback);
    } catch (err) {
      console.error("API /api/admin/feedback fail:", err);
      res.status(500).json({ error: "Failed to read feedback database" });
    }
  });

  // 7. ADMIN API: Get list of Inquiries with nested email logs
  app.get("/api/admin/inquiries", authMiddleware, async (req, res) => {
    try {
      const db = await getDB();
      // Return inquiries along with their associated automated and admin logs
      const detailedInquiries = db.inquiries.map(inq => {
        const logs = db.emailLogs.filter(log => log.inquiryId === inq.id);
        return {
          ...inq,
          emails: logs
        };
      });
      res.json(detailedInquiries);
    } catch (err) {
      console.error("API /api/admin/inquiries fail:", err);
      res.status(500).json({ error: "Failed to read inquiries database" });
    }
  });

  // 8. ADMIN API: Respond to Inquiries directly (Simulates/Records outgoing advice email)
  app.post("/api/admin/respond", authMiddleware, async (req, res) => {
    const { inquiryId, responseMessage } = req.body;

    if (!inquiryId || !responseMessage) {
      return res.status(400).json({ error: "Inquiry ID and response message are required" });
    }

    try {
      const db = await getDB();
      const inquiryIndex = db.inquiries.findIndex(ing => ing.id === inquiryId);

      if (inquiryIndex === -1) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      db.inquiries[inquiryIndex].status = "responded";
      db.inquiries[inquiryIndex].responseMessage = responseMessage;
      db.inquiries[inquiryIndex].respondedAt = new Date().toISOString();

      const inquiry = db.inquiries[inquiryIndex];

      // Record admin outgoing reply email log
      const emailId = "email-" + crypto.randomUUID();
      const emailSubject = `Response to your Inquiry - Hansraj Digital Academy`;
      const emailBody = `Dear ${inquiry.name},

Thank you for your patience. This is a follow up response from the administrator of Hansraj Digital Academy regarding your query on ${inquiry.course}:

"${responseMessage}"

If you have any further questions, you can respond directly to this email or call us at (+91) 9811345678.

Best regards,
Administrator,
Hansraj Digital Academy
University of Delhi`;

      const responseEmailLog: EmailLog = {
        id: emailId,
        recipientEmail: inquiry.email,
        recipientName: inquiry.name,
        subject: emailSubject,
        body: emailBody,
        sentAt: new Date().toISOString(),
        type: "admin_response",
        inquiryId: inquiryId
      };

      db.emailLogs.unshift(responseEmailLog);
      saveDB(db);

      // Save updated inquiry status and new email log to live Firestore
      await saveInquiryFirestore(db.inquiries[inquiryIndex]);
      await saveEmailLogFirestore(responseEmailLog);

      res.json({
        success: true,
        inquiry: db.inquiries[inquiryIndex],
        emailSent: responseEmailLog
      });
    } catch (err) {
      console.error("API /api/admin/respond fail:", err);
      res.status(500).json({ error: "Failed to register response" });
    }
  });

  // 9. ADMIN API: Get full database backup or analytics breakdown
  app.get("/api/admin/analytics", authMiddleware, async (req, res) => {
    try {
      const db = await getDB();

      // 1. Total feedback & inquiries
      const totalInquiries = db.inquiries.length;
      const totalFeedback = db.feedback.length;

      // 2. Average rating
      const avgRating = db.feedback.length > 0
        ? Number((db.feedback.reduce((sum, f) => sum + f.rating, 0) / db.feedback.length).toFixed(2))
        : 0;

      // 3. Response rate
      const respondedCount = db.inquiries.filter(i => i.status === "responded").length;
      const responseRate = totalInquiries > 0
        ? Math.round((respondedCount / totalInquiries) * 100)
        : 0;

      // 4. Inquiries & Feedback distribution by course
      const courseStats: Record<string, { inquiries: number; feedback: number; avgRating: number; totalRatingSum: number; ratingCount: number }> = {};
      
      // Setup defaults or populate from data
      const coursesList = [
        "Digital Marketing Plus Generative AI",
        "SEO & Search Engine Marketing",
        "Social Media Marketing & Branding",
        "Web Designing & UI/UX",
        "Graphic Designing & Creative Layouts",
        "Data Analytics & Performance Marketing"
      ];

      coursesList.forEach(c => {
        courseStats[c] = { inquiries: 0, feedback: 0, avgRating: 0, totalRatingSum: 0, ratingCount: 0 };
      });

      db.inquiries.forEach(inq => {
        if (!courseStats[inq.course]) {
          courseStats[inq.course] = { inquiries: 0, feedback: 0, avgRating: 0, totalRatingSum: 0, ratingCount: 0 };
        }
        courseStats[inq.course].inquiries += 1;
      });

      db.feedback.forEach(f => {
        if (!courseStats[f.course]) {
          courseStats[f.course] = { inquiries: 0, feedback: 0, avgRating: 0, totalRatingSum: 0, ratingCount: 0 };
        }
        courseStats[f.course].feedback += 1;
        courseStats[f.course].totalRatingSum += f.rating;
        courseStats[f.course].ratingCount += 1;
      });

      // Calculate final course average ratings
      Object.keys(courseStats).forEach(c => {
        const stats = courseStats[c];
        stats.avgRating = stats.ratingCount > 0 
          ? Number((stats.totalRatingSum / stats.ratingCount).toFixed(1)) 
          : 0;
      });

      // 5. Inquiries over time (grouped by date)
      const inquiriesTimeline: Record<string, number> = {};
      const feedbackTimeline: Record<string, number> = {};

      db.inquiries.forEach(inq => {
        const date = inq.createdAt.substring(0, 10); // YYYY-MM-DD
        inquiriesTimeline[date] = (inquiriesTimeline[date] || 0) + 1;
      });

      db.feedback.forEach(f => {
        const date = f.createdAt.substring(0, 10);
        feedbackTimeline[date] = (feedbackTimeline[date] || 0) + 1;
      });

      // Extract all unique dates, sort them
      const allDates = Array.from(new Set([...Object.keys(inquiriesTimeline), ...Object.keys(feedbackTimeline)])).sort();
      const timelineData = allDates.map(date => ({
        date,
        inquiries: inquiriesTimeline[date] || 0,
        feedback: feedbackTimeline[date] || 0
      }));

      res.json({
        summary: {
          totalInquiries,
          totalFeedback,
          avgRating,
          respondedCount,
          pendingCount: totalInquiries - respondedCount,
          responseRate
        },
        courseStats: Object.keys(courseStats).map(c => ({
          courseName: c,
          ...courseStats[c]
        })),
        timeline: timelineData,
        rawEmailLogs: db.emailLogs
      });
    } catch (err) {
      console.error("API /api/admin/analytics fail:", err);
      res.status(500).json({ error: "Failed to generate analytics data" });
    }
  });

  // 9b. ADMIN API: Add new FAQ
  app.post("/api/admin/faqs", authMiddleware, async (req, res) => {
    const { question, answer, category } = req.body;
    if (!question || !answer || !category) {
      return res.status(400).json({ error: "Question, answer and category are required" });
    }

    try {
      const db = await getDB();
      if (!db.faqs) db.faqs = [];

      const newFAQ: FAQEntry = {
        id: "faq-" + crypto.randomUUID(),
        question,
        answer,
        category,
        createdAt: new Date().toISOString()
      };

      db.faqs.push(newFAQ);
      saveDB(db);

      // Async save to Firestore in real-time
      await saveFAQFirestore(newFAQ);

      res.status(201).json({ success: true, faq: newFAQ });
    } catch (err) {
      console.error("API /api/admin/faqs POST fail:", err);
      res.status(500).json({ error: "Failed to add FAQ to database" });
    }
  });

  // 9c. ADMIN API: Edit an FAQ
  app.put("/api/admin/faqs/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    if (!question || !answer || !category) {
      return res.status(400).json({ error: "Question, answer and category are required" });
    }

    try {
      const db = await getDB();
      if (!db.faqs) db.faqs = [];

      const faqIndex = db.faqs.findIndex(f => f.id === id);
      if (faqIndex === -1) {
        return res.status(404).json({ error: "FAQ entry not found" });
      }

      db.faqs[faqIndex] = {
        ...db.faqs[faqIndex],
        question,
        answer,
        category,
        updatedAt: new Date().toISOString()
      };

      saveDB(db);

      // Async sync to Firestore in real-time
      await saveFAQFirestore(db.faqs[faqIndex]);

      res.json({ success: true, faq: db.faqs[faqIndex] });
    } catch (err) {
      console.error("API /api/admin/faqs PUT fail:", err);
      res.status(500).json({ error: "Failed to edit FAQ in database" });
    }
  });

  // 9d. ADMIN API: Delete an FAQ
  app.delete("/api/admin/faqs/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
      const db = await getDB();
      if (!db.faqs) db.faqs = [];

      const faqIndex = db.faqs.findIndex(f => f.id === id);
      if (faqIndex === -1) {
        return res.status(404).json({ error: "FAQ entry not found" });
      }

      const deleted = db.faqs.splice(faqIndex, 1)[0];
      saveDB(db);

      // Async delete from Firestore in real-time
      await deleteFAQFirestore(id);

      res.json({ success: true, faq: deleted });
    } catch (err) {
      console.error("API /api/admin/faqs DELETE fail:", err);
      res.status(500).json({ error: "Failed to delete FAQ with Firestore sync" });
    }
  });

  // 10. ADMIN LOGOUT API
  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      delete activeSessions[token];
    }
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Load database on start (fires async load + potential seed in background)
  getDB().then(() => {
    console.log("Secure Firestore connection and Fallback DB successfully initialized.");
  }).catch((err) => {
    console.error("Firestore loading task failed during server initialization:", err);
  });

  // Mount Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hansraj Digital Portal running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
