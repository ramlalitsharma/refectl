'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface SchemaField {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface ContentSchema {
  id: string;
  name: string;
  key: string;
  description?: string;
  version: number;
  fields: SchemaField[];
  updatedAt?: string;
}

export function SchemaManager({ initialSchemas }: { initialSchemas: ContentSchema[] }) {
  const [schemas, setSchemas] = useState<ContentSchema[]>(initialSchemas);
  const [selectedId, setSelectedId] = useState<string | null>(schemas[0]?.id || null);
  const [jsonDraft, setJsonDraft] = useState('');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSchema = useMemo(() => schemas.find((schema) => schema.id === selectedId) || null, [schemas, selectedId]);

  useEffect(() => {
    if (!selectedSchema) {
      setJsonDraft('');
      setName('');
      setKey('');
      setDescription('');
      return;
    }
    setJsonDraft(JSON.stringify(selectedSchema.fields, null, 2));
    setName(selectedSchema.name);
    setKey(selectedSchema.key);
    setDescription(selectedSchema.description || '');
  }, [selectedSchema]);

  const resetForm = () => {
    setSelectedId(null);
    setJsonDraft(JSON.stringify([], null, 2));
    setName('');
    setKey('');
    setDescription('');
    setError(null);
    setFeedback(null);
  };

  const saveSchema = async () => {
    setError(null);
    setFeedback(null);

    if (!name.trim() || !key.trim()) {
      setError('Name and key are required.');
      return;
    }

    let parsedFields: SchemaField[];
    try {
      parsedFields = JSON.parse(jsonDraft || '[]');
      if (!Array.isArray(parsedFields)) throw new Error('Fields JSON must be an array.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Invalid JSON: ${msg}`);
      return;
    }

    setLoading(true);
    try {
      if (selectedId) {
        const res = await fetch(`/api/admin/schemas/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), description: description.trim(), fields: parsedFields }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update schema');
        setSchemas((prev) => prev.map((schema) => (schema.id === selectedId ? data.schema : schema)));
        setFeedback('Schema updated successfully.');
      } else {
        const res = await fetch('/api/admin/schemas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), key: key.trim(), description: description.trim(), fields: parsedFields }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create schema');
        setSchemas((prev) => [data.schema, ...prev]);
        setSelectedId(data.schema.id);
        setFeedback('Schema created successfully.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchema = async (schema: ContentSchema) => {
    if (!confirm(`Delete schema “${schema.name}”?`)) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/schemas/${schema.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete schema');
      setSchemas((prev) => prev.filter((item) => item.id !== schema.id));
      if (selectedId === schema.id) resetForm();
      setFeedback('Schema deleted successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Content Schemas</h2>
            <p className="text-sm text-slate-500">Define reusable field groups to power future studios.</p>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm}>
            + New Schema
          </Button>
        </div>

        {feedback && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div>}
        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Schemas</h3>
            {schemas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No schemas yet. Create one to start defining dynamic forms.
              </div>
            ) : (
              <div className="space-y-2">
                {schemas.map((schema) => {
                  const isActive = schema.id === selectedId;
                  return (
                    <div
                      key={schema.id}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
                        isActive ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedId(schema.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">{schema.name}</div>
                        <Badge variant="default" size="sm">
                          v{schema.version}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">{schema.key}</div>
                      <div className="text-xs text-slate-400">
                        {schema.updatedAt ? new Date(schema.updatedAt).toLocaleString() : ''}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="info" size="sm">{schema.fields.length} fields</Badge>
                        <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); deleteSchema(schema); }}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Schema Editor</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Course schema"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Key
                <input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="course"
                  disabled={Boolean(selectedId)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-slate-600">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Fields (JSON)
              <textarea
                value={jsonDraft}
                onChange={(e) => setJsonDraft(e.target.value)}
                className="h-64 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                placeholder={`[
  {
    "id": "title",
    "name": "title",
    "label": "Title",
    "type": "text",
    "required": true
  }
]`}
              />
            </label>
            <div className="flex gap-3">
              <Button onClick={saveSchema} disabled={loading}>
                {loading ? 'Saving…' : selectedId ? 'Update schema' : 'Create schema'}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
