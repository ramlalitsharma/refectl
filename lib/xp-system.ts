// XP System Utilities
// Handles level calculation, XP requirements, and rewards

export interface XPReward {
    action: string;
    baseXP: number;
    multiplier?: number;
}

export interface LevelInfo {
    level: number;
    title: string;
    color: string;
    minXP: number;
    maxXP: number;
}

// XP required for each level (exponential growth: 100 * 1.5^(level-1))
export function getXPForLevel(level: number): number {
    if (level <= 0) return 0;
    return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Calculate level from total XP
export function getLevelFromXP(totalXP: number): number {
    let level = 1;
    while (totalXP >= getXPForLevel(level + 1)) {
        level++;
    }
    return level;
}

// Get tier title based on level
export function getLevelTitle(level: number): string {
    if (level >= 50) return '🏆 Grandmaster';
    if (level >= 40) return '💎 Master';
    if (level >= 30) return '👑 Expert';
    if (level >= 20) return '⭐ Advanced';
    if (level >= 10) return '🔥 Intermediate';
    return '🌱 Beginner';
}

// Get gradient color for level
export function getLevelColor(level: number): string {
    if (level >= 50) return 'from-yellow-400 to-orange-500';
    if (level >= 40) return 'from-purple-400 to-pink-500';
    if (level >= 30) return 'from-blue-400 to-indigo-500';
    if (level >= 20) return 'from-green-400 to-teal-500';
    if (level >= 10) return 'from-orange-400 to-red-500';
    return 'from-slate-400 to-slate-500';
}

// Calculate XP reward for various actions
export function calculateXPReward(action: string, metadata?: any): number {
    const rewards: Record<string, number> = {
        'complete_quiz': 50,
        'perfect_score': 100,
        'daily_streak': 25,
        'finish_course': 200,
        'watch_video': 10,
        'read_lesson': 15,
        'complete_quest': 30,
        'earn_badge': 75,
    };

    let baseXP = rewards[action] || 0;

    // Apply multipliers
    if (metadata?.streak && metadata.streak >= 7) {
        baseXP *= 1.5; // 50% bonus for 7+ day streaks
    }

    if (metadata?.difficulty === 'hard') {
        baseXP *= 1.25; // 25% bonus for hard content
    }

    return Math.floor(baseXP);
}

// Get level info for current and next level
export function getLevelInfo(totalXP: number): {
    current: LevelInfo;
    next: LevelInfo;
    progressPercent: number;
    xpToNext: number;
} {
    const currentLevel = getLevelFromXP(totalXP);
    const nextLevel = currentLevel + 1;

    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(nextLevel);
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForNext = nextLevelXP - currentLevelXP;

    return {
        current: {
            level: currentLevel,
            title: getLevelTitle(currentLevel),
            color: getLevelColor(currentLevel),
            minXP: currentLevelXP,
            maxXP: nextLevelXP,
        },
        next: {
            level: nextLevel,
            title: getLevelTitle(nextLevel),
            color: getLevelColor(nextLevel),
            minXP: nextLevelXP,
            maxXP: getXPForLevel(nextLevel + 1),
        },
        progressPercent: (xpInCurrentLevel / xpNeededForNext) * 100,
        xpToNext: xpNeededForNext - xpInCurrentLevel,
    };
}

// Check if user leveled up after XP award
export function checkLevelUp(oldXP: number, newXP: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
} {
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    return {
        leveledUp: newLevel > oldLevel,
        oldLevel,
        newLevel,
    };
}
