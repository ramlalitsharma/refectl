// Admin Log Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type AdminActionType = 'ban_user' | 'unban_user' | 'change_role' | 'update_settings' | 'manual_adjustment';
export type TargetType = 'user' | 'system' | 'content';

export interface AdminLog {
    _id?: ObjectId;
    adminId: string;
    adminName: string;
    action: AdminActionType;
    targetId?: string; // userId or objectId affected
    targetType: TargetType;
    details: string;
    metadata?: any;
    ipAddress?: string;
    createdAt: Date;
}

// Collection name
export const ADMIN_LOGS_COLLECTION = 'adminLogs';
