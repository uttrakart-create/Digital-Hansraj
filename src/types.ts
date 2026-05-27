export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: "acknowledgment" | "admin_response";
  inquiryId: string;
}

export interface Inquiry {
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
  emails?: EmailLog[];
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  course: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalInquiries: number;
  totalFeedback: number;
  avgRating: number;
  respondedCount: number;
  pendingCount: number;
  responseRate: number;
}

export interface CourseStat {
  courseName: string;
  inquiries: number;
  feedback: number;
  avgRating: number;
}

export interface TimelinePoint {
  date: string;
  inquiries: number;
  feedback: number;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  courseStats: CourseStat[];
  timeline: TimelinePoint[];
  rawEmailLogs: EmailLog[];
}
