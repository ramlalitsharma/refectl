import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail, renderCompletionEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if ((process.env.AUTH_PROVIDER || 'clerk').toLowerCase() !== 'lucia') {
      return NextResponse.json({ error: 'Lucia auth not enabled' }, { status: 400 });
    }

    const body = await req.json();
    const { email, action, token, newPassword } = body as {
      email?: string;
      action: 'request' | 'reset';
      token?: string;
      newPassword?: string;
    };

    const db = await getDatabase();
    const users = db.collection('users');
    const tokens = db.collection('passwordResetTokens');

    if (action === 'request') {
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
      const user: any = await users.findOne({ email: email.toLowerCase() });
      if (!user) return NextResponse.json({ ok: true }); // Don't reveal if email exists

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await tokens.insertOne({
        userId: String(user._id),
        token: resetToken,
        expiresAt,
        createdAt: new Date(),
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      const html = `
        <div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetUrl}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Reset Password</a></p>
          <p style="color:#6b7280;font-size:12px">This link expires in 1 hour.</p>
          <p style="margin-top:24px;color:#6b7280;font-size:12px">© Refectl</p>
        </div>
      `;

      try {
        await sendEmail({ to: email, subject: 'Reset your Refectl password', html });
      } catch (e) {
        console.warn('Failed to send reset email:', e);
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'reset') {
      if (!token || !newPassword) return NextResponse.json({ error: 'token and newPassword required' }, { status: 400 });
      const resetDoc: any = await tokens.findOne({ token });
      if (!resetDoc || new Date(resetDoc.expiresAt).getTime() < Date.now()) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
      }

      const hash = await bcrypt.hash(newPassword, 11);
      await users.updateOne({ _id: resetDoc.userId }, { $set: { passwordHash: hash, updatedAt: new Date() } });
      await tokens.deleteOne({ token });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Password reset failed' }, { status: 500 });
  }
}

