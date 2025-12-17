// Moderation Service - Tools for managing reports and user safety

import { getDatabase } from './mongodb';
import {
    Report,
    REPORTS_COLLECTION,
    ReportStatus,
    ReportReason,
    ReportTargetType
} from './models/Report';
import { toggleUserBan } from './admin-service'; // Reuse existing ban logic

/**
 * Create a new report (User action)
 */
export async function createReport(input: {
    reporterId: string;
    reportedId: string;
    targetType: ReportTargetType;
    reason: ReportReason;
    description?: string;
}) {
    const db = await getDatabase();

    // Prevent duplicate pending reports from same user for same target
    const existing = await db.collection(REPORTS_COLLECTION).findOne({
        reporterId: input.reporterId,
        reportedId: input.reportedId,
        status: 'pending'
    });

    if (existing) {
        throw new Error('You have already reported this item.');
    }

    const report: Report = {
        reporterId: input.reporterId,
        reportedId: input.reportedId,
        targetType: input.targetType,
        reason: input.reason,
        description: input.description,
        status: 'pending',
        createdAt: new Date()
    };

    await db.collection(REPORTS_COLLECTION).insertOne(report);
    return report;
}

/**
 * Get moderation queue (Admin action)
 */
export async function getModerationQueue(
    status: ReportStatus = 'pending',
    limit: number = 20,
    offset: number = 0
) {
    const db = await getDatabase();

    const reports = await db.collection(REPORTS_COLLECTION)
        .find({ status })
        .sort({ createdAt: 1 }) // Oldest first (FIFO)
        .skip(offset)
        .limit(limit)
        .toArray();

    const total = await db.collection(REPORTS_COLLECTION).countDocuments({ status });

    return { reports, total };
}

/**
 * Get report history for a specific user (as the reported party)
 */
export async function getUserReportHistory(userId: string) {
    const db = await getDatabase();

    // Find reports WHERE reportedId = userId AND targetType = 'user'
    // Or potentially reports on their content. For now, focus on direct user reports.
    const reports = await db.collection(REPORTS_COLLECTION)
        .find({ reportedId: userId })
        .sort({ createdAt: -1 })
        .toArray();

    return reports;
}

/**
 * Resolve a report (Admin action)
 */
export async function resolveReport(input: {
    reportId: string;
    adminId: string;
    action: 'dismiss' | 'warn' | 'ban';
    resolutionNotes?: string;
}) {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');

    const report = await db.collection(REPORTS_COLLECTION).findOne({
        _id: new ObjectId(input.reportId)
    });

    if (!report) throw new Error('Report not found');

    const updateData: Partial<Report> = {
        status: input.action === 'dismiss' ? 'dismissed' : 'resolved',
        resolvedBy: input.adminId,
        resolvedAt: new Date(),
        resolution: `Action: ${input.action}. Notes: ${input.resolutionNotes || 'None'}`
    };

    // Perform action
    if (input.action === 'ban' && report.targetType === 'user') {
        // Ban the user
        await toggleUserBan(
            input.adminId,
            report.reportedId,
            true,
            `Banned via Report Resolution: ${input.resolutionNotes}`
        );
    }

    // Update report
    await db.collection(REPORTS_COLLECTION).updateOne(
        { _id: new ObjectId(input.reportId) },
        { $set: updateData }
    );

    return { success: true, action: input.action };
}
