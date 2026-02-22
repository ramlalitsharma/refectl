export const EmailTemplates = {
  welcome: (name: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4F46E5;">Welcome to AdaptiQ! 🚀</h1>
      </div>
      <p>Hi ${name},</p>
      <p>We are thrilled to have you on board. AdaptiQ is designed to help you master any subject through Gamified Learning and AI Tutoring.</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>Here is what you can do next:</strong>
        <ul>
          <li>🏆 Take your first Quiz to earn XP</li>
          <li>🔥 Start a Daily Streak</li>
          <li>🤖 Chat with Prof. AI</li>
        </ul>
      </div>
      <p>Happy Learning,</p>
      <p>The AdaptiQ Team</p>
    </div>
  `,

  levelUp: (name: string, level: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; border-top: 4px solid #F59E0B;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #F59E0B;">Level Up! 🎉</h1>
      </div>
      <p>Congratulations ${name}!</p>
      <p>Your hard work is paying off. You just reached <strong>Level ${level}</strong>.</p>
      <p>Keep the momentum going to unlock more badges and climb the leaderboard.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:3000/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Continue Learning</a>
      </div>
    </div>
  `,

  weeklyReport: (name: string, xp: number, quizzes: number) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #111827;">Weekly Summary for ${name} 📊</h2>
      <p>Here is how you performed this week:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total XP Earned</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #4F46E5; font-weight: bold;">+${xp} XP</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Quizzes Completed</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${quizzes}</td>
        </tr>
      </table>
      <p>You are doing great! See you on the leaderboard.</p>
    </div>
  `,

  referralSuccess: (name: string, friendName: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; border-left: 4px solid #10B981;">
      <h2 style="color: #10B981;">Referral Success! 🤝</h2>
      <p>Hi ${name},</p>
      <p>Great news! Your friend <strong>${friendName}</strong> just joined AdaptiQ using your referral link.</p>
      <p>We've added <strong>100 Bonus XP</strong> to your account as a thank you.</p>
      <div style="text-align: center; margin-top: 20px;">
         <a href="http://localhost:3000/dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Check Your Progress</a>
      </div>
    </div>
    `,

  marketingSequence: (name: string, step: number) => {
    const content = [
      {
        title: "Ready to accelerate your learning? ⚡",
        body: "AdaptiQ uses spaced-repetition and AI to help you learn 2x faster. Have you taken your first diagnostic quiz yet?"
      },
      {
        title: "Deep Dive: Mastering complex topics 🧠",
        body: "Did you know you can chat with Prof. AI anytime? Try asking about a difficult concept in your latest course."
      }
    ][step - 1] || { title: "Level Up with AdaptiQ", body: "Keep learning and reaching new heights!" };

    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #111827;">${content.title}</h2>
          <p>Hi ${name},</p>
          <p>${content.body}</p>
          <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4B5563;">"Education is the most powerful weapon which you can use to change the world."</p>
          </div>
          <p>Best,<br/>The AdaptiQ Team</p>
        </div>
        `;
  },
  newsApprovalDigest: (items: { title: string; category: string; id: string }[]) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #B91C1C;">Pending News Approval Queue 🗞️</h2>
      <p>The following articles were auto-generated and are awaiting your review:</p>
      <div style="background-color: #FEF2F2; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <ul style="padding-left: 20px;">
          ${items.map(item => `
            <li style="margin-bottom: 15px;">
              <strong style="color: #111827;">${item.title}</strong><br/>
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase; font-weight: bold;">${item.category}</span><br/>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/news/edit/${item.id}" style="color: #B91C1C; font-size: 12px; font-weight: bold; text-decoration: none;">Review & Publish →</a>
            </li>
          `).join('')}
        </ul>
      </div>
      <p style="font-size: 12px; color: #9CA3AF;">This is an automated intelligence briefing from Terai Times News Ultra.</p>
    </div>
  `
};
