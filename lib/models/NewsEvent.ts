import { ObjectId } from 'mongodb';

export type NewsEventScope = 'global' | 'country';
export type NewsEventStatus = 'draft' | 'published';

export interface NewsEventMetric {
  label: string;
  value: string;
  cta?: string;
}

export interface NewsEvent {
  _id?: ObjectId;
  slug: string;
  title: string;
  summary?: string;
  eventType?: string;
  scope: NewsEventScope;
  country?: string;
  status: NewsEventStatus;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  bannerLeftLabel?: string;
  bannerLeftValue?: string;
  bannerRightLabel?: string;
  bannerRightValue?: string;
  bannerCenterText?: string;
  badgeText?: string;
  metrics?: NewsEventMetric[];
  metaTitle?: string;
  metaDescription?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

