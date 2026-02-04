// src/types/index.ts

// SMTP Configuration
export interface SmtpConfig {
  host: string;
  port: string;
  security: 'none' | 'tls' | 'ssl';
  username: string;
  password: string;
  fromEmail: string;
  toEmail: string;
}

// SMS Message
export interface SmsMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
  simSlot: number;
  receiverNumber: string;
}

// Queue Item
export interface QueueItem {
  id: string;
  sms: SmsMessage;
  status: 'pending' | 'failed';
  attempts: number;
  lastAttempt: number;
  nextRetry: number;
  error?: string;
}

// Permission Status
export interface PermissionStatus {
  sms: boolean;
  notifications: boolean;
  batteryOptimization: boolean;
}

// Service Status
export interface ServiceStatus {
  isRunning: boolean;
  startedAt: number | null;
}

// History Stats
export interface HistoryStats {
  totalForwarded: number;
  pending: QueueItem[];
  failed: QueueItem[];
}
