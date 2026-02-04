// src/services/email-sender.ts
import RNSmtpMailer from 'react-native-smtp-mailer';
import type { SmtpConfig, SmsMessage } from '@/types';

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

function formatEmailBody(sms: SmsMessage): string {
  const date = new Date(sms.timestamp);
  const formattedDate = date.toLocaleString();
  const simLabel = sms.simSlot === 0 ? 'SIM 1' : 'SIM 2';

  return `
From: ${sms.sender}
To: ${sms.receiverNumber} (${simLabel})
Time: ${formattedDate}

Message:
${sms.body}
  `.trim();
}

export async function sendEmail(
  config: SmtpConfig,
  password: string,
  sms: SmsMessage
): Promise<SendEmailResult> {
  try {
    const subject = `SMS from ${sms.sender}`;
    const body = formatEmailBody(sms);

    await RNSmtpMailer.sendMail({
      mailhost: config.host,
      port: config.port,
      ssl: config.security === 'ssl',
      username: config.username,
      password: password,
      fromName: 'SMS Mailer',
      replyTo: config.fromEmail,
      recipients: config.toEmail,
      subject: subject,
      htmlBody: `<pre style="font-family: monospace;">${body}</pre>`,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function testConnection(
  config: SmtpConfig,
  password: string
): Promise<SendEmailResult> {
  try {
    await RNSmtpMailer.sendMail({
      mailhost: config.host,
      port: config.port,
      ssl: config.security === 'ssl',
      username: config.username,
      password: password,
      fromName: 'SMS Mailer',
      replyTo: config.fromEmail,
      recipients: config.toEmail,
      subject: 'SMS Mailer - Test Connection',
      htmlBody: '<p>This is a test email from SMS Mailer. Your SMTP settings are working correctly!</p>',
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
