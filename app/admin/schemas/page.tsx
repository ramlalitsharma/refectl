import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin, userHasPermission } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { SchemaManager } from '@/components/admin/SchemaManager';
import { serializeSchema } from '@/lib/models/ContentSchema';
import { PermissionKey } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function AdminSchemasPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const allowed = await userHasPermission('schemas:manage' as PermissionKey);
  if (!allowed) {
    redirect('/admin');
  }

  const db = await getDatabase();
  const schemas = await db.collection('contentSchemas').find({}).sort({ updatedAt: -1 }).limit(50).toArray();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-slate-900">Schema Registry</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage reusable field definitions that power future studios.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <SchemaManager initialSchemas={schemas.map((schema) => serializeSchema(schema as any))} />
      </main>
    </div>
  );
}
