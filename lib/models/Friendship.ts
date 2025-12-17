// Friendship Model - MongoDB Schema

import { ObjectId } from 'mongodb';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friendship {
    _id?: ObjectId;
    userId: string; // User who sent request
    friendId: string; // User who received request
    status: FriendshipStatus;
    initiatedBy: string; // userId who sent the original request
    createdAt: Date;
    updatedAt: Date;
    acceptedAt?: Date;
}

export interface Friend {
    userId: string;
    name: string;
    avatar?: string;
    level: number;
    currentXP: number;
    status: FriendshipStatus;
    since: Date; // When friendship was accepted
}

// Collection name
export const FRIENDSHIPS_COLLECTION = 'friendships';
