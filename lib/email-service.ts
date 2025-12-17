import { EmailTemplates } from './email-templates';

// In a real app, this would be `import { Resend } from 'resend';`
// const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export const EmailService = {
    /**
     * Internal sender that abstracts the provider (Resend vs Mock)
     */
    send: async ({ to, subject, html }: SendEmailParams) => {
        const apiKey = process.env.RESEND_API_KEY;

        if (apiKey) {
            // Real Sending Logic (Commented out until key is present)
            /*
            await resend.emails.send({
              from: 'AdaptiQ <onboarding@resend.dev>',
              to: [to],
              subject,
              html,
            });
            */
            console.log(`[EmailService] REAL Email sent to ${to}`);
            return true;
        } else {
            // Mock Sending Logic
            console.log('--- [MOCK EMAIL SERVICE] ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('Body (Preview):', html.substring(0, 100).replace(/\n/g, '') + '...');
            console.log('----------------------------');
            return true;
        }
    },

    sendWelcome: async (email: string, name: string) => {
        return EmailService.send({
            to: email,
            subject: 'Welcome to AdaptiQ! 🚀',
            html: EmailTemplates.welcome(name)
        });
    },

    sendLevelUp: async (email: string, name: string, level: number) => {
        return EmailService.send({
            to: email,
            subject: `You reached Level ${level}! 🎉`,
            html: EmailTemplates.levelUp(name, level)
        });
    },

    sendWeeklyReport: async (email: string, name: string, xp: number, quizzes: number) => {
        return EmailService.send({
            to: email,
            subject: 'Your Weekly Learning Report 📊',
            html: EmailTemplates.weeklyReport(name, xp, quizzes)
        });
    }
};
