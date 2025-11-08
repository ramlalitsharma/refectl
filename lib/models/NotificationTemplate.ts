export type NotificationChannel = 'in-app' | 'email' | 'sms';

export interface NotificationTemplate {
  _id?: any;
  name: string;
  category?: string;
  description?: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  variables?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTrigger {
  _id?: any;
  name: string;
  eventKey: string;
  description?: string;
  templateId: string;
  channels: NotificationChannel[];
  enabled: boolean;
  segment?: {
    cohorts?: string[];
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export function serializeTemplate(template: NotificationTemplate & { _id?: any }) {
  return {
    id: template._id ? String(template._id) : undefined,
    name: template.name,
    category: template.category || '',
    description: template.description || '',
    channel: template.channel,
    subject: template.subject || '',
    body: template.body,
    ctaLabel: template.ctaLabel || '',
    ctaUrl: template.ctaUrl || '',
    variables: template.variables || [],
    createdAt: template.createdAt instanceof Date ? template.createdAt.toISOString() : template.createdAt,
    updatedAt: template.updatedAt instanceof Date ? template.updatedAt.toISOString() : template.updatedAt,
  };
}

export function serializeTrigger(trigger: NotificationTrigger & { _id?: any }) {
  return {
    id: trigger._id ? String(trigger._id) : undefined,
    name: trigger.name,
    eventKey: trigger.eventKey,
    description: trigger.description || '',
    templateId: trigger.templateId,
    channels: trigger.channels,
    enabled: trigger.enabled,
    segment: trigger.segment || {},
    createdAt: trigger.createdAt instanceof Date ? trigger.createdAt.toISOString() : trigger.createdAt,
    updatedAt: trigger.updatedAt instanceof Date ? trigger.updatedAt.toISOString() : trigger.updatedAt,
  };
}
