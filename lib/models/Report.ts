// Report Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type ReportTargetType = 'user' | 'activity' | 'comment';
export type ReportReason = 'harassment' | 'hate_speech' | 'spam' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
    _id?: ObjectId;
    reporterId: string;        // Who sent the report
    reportedId: string;        // Who/What is being reported (userId or contentId)
    targetType: ReportTargetType;
    reason: ReportReason;
    description?: string;      // Optional details
    status: ReportStatus;
    resolution?: string;       // Notes from admin
    resolvedBy?: string;       // Admin ID
    createdAt: Date;
    resolvedAt?: Date;
}

// Collection name
export const REPORTS_COLLECTION = 'reports';
