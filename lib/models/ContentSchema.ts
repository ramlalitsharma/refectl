import { ObjectId } from 'mongodb';

export interface SchemaFieldOption {
  label: string;
  value: string;
}

export interface SchemaField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'richtext' | 'reference' | 'array' | 'object';
  required?: boolean;
  description?: string;
  defaultValue?: any;
  options?: SchemaFieldOption[];
  of?: SchemaField[]; // for array/object fields
  reference?: {
    collection: string;
    displayField?: string;
  };
}

export interface ContentSchema {
  _id?: ObjectId;
  name: string;
  key: string;
  description?: string;
  fields: SchemaField[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeSchema(schema: ContentSchema & { _id?: any }) {
  return {
    id: schema._id ? String(schema._id) : undefined,
    name: schema.name,
    key: schema.key,
    description: schema.description || '',
    fields: schema.fields || [],
    version: schema.version,
    createdAt: schema.createdAt instanceof Date ? schema.createdAt.toISOString() : schema.createdAt,
    updatedAt: schema.updatedAt instanceof Date ? schema.updatedAt.toISOString() : schema.updatedAt,
  };
}
