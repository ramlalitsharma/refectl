export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  const provider = (process.env.EMAIL_PROVIDER || 'none').toLowerCase();
  if (provider === 'resend') {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not set');
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Refectl <onboarding@resend.dev>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Resend error: ${res.status} ${txt}`);
    }
    return true;
  }
  // No-op provider
  return false;
}

export function renderCompletionEmail(courseTitle?: string) {
  const { BRAND_NAME } = require('./brand');
  return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
      <h2>🎉 Congratulations!</h2>
      <p>You completed ${courseTitle || 'your course'} on ${BRAND_NAME}.</p>
      <p>Keep up the momentum—new lessons and adaptive quizzes await.</p>
      <p style="margin-top:24px;color:#6b7280;font-size:12px">© ${BRAND_NAME}</p>
    </div>
  `;
}


