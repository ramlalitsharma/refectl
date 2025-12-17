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
  `
};
