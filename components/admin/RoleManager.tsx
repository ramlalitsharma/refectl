'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PERMISSION_OPTIONS, PermissionKey } from '@/lib/permissions';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

interface UserSummary {
  id: string;
  name?: string;
  email?: string;
  roleIds?: string[];
}

interface RoleManagerProps {
  initialRoles: Role[];
  users: UserSummary[];
}

type RoleForm = {
  name: string;
  description: string;
  permissions: Set<PermissionKey>;
};

const defaultForm: RoleForm = {
  name: '',
  description: '',
  permissions: new Set<PermissionKey>(['admin:access']),
};

export function RoleManager({ initialRoles, users }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [form, setForm] = useState<RoleForm>(defaultForm);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const selectedUserRoles = useMemo(() => {
    const user = users.find((item) => item.id === selectedUserId);
    return new Set(user?.roleIds || []);
  }, [users, selectedUserId]);

  const permissionOptions = PERMISSION_OPTIONS;

  const resetForm = () => {
    setForm(defaultForm);
    setEditingRoleId(null);
  };

  const togglePermission = (key: PermissionKey) => {
    setForm((prev) => {
      const permissions = new Set(prev.permissions);
      if (permissions.has(key)) {
        permissions.delete(key);
      } else {
        permissions.add(key);
      }
      return { ...prev, permissions };
    });
  };

  const startEdit = (role: Role) => {
    setEditingRoleId(role.id);
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: new Set(role.permissions || []),
    });
    setFeedback(null);
    setError(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name.trim()) {
      setError('Role name is required');
      return;
    }
    setLoading(true);
    setError(null);
    setFeedback(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: Array.from(form.permissions),
    };

    try {
      const res = await fetch(
        editingRoleId ? `/api/admin/roles/${editingRoleId}` : '/api/admin/roles',
        {
          method: editingRoleId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save role');
      }

      if (editingRoleId) {
        setRoles((prev) =>
          prev.map((role) => (role.id === editingRoleId ? { ...role, ...payload } : role)),
        );
        setFeedback('Role updated successfully');
      } else {
        setRoles((prev) => [
          data.role,
          ...prev,
        ]);
        setFeedback('Role created successfully');
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Unable to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      setError('System roles cannot be deleted');
      return;
    }
    if (!confirm(`Delete role "${role.name}"?`)) return;

    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete role');
      }
      setRoles((prev) => prev.filter((item) => item.id !== role.id));
      setFeedback('Role deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Unable to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRolesSave = async (roleIds: string[]) => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user roles');
      }
      setFeedback('User roles updated');
    } catch (err: any) {
      setError(err.message || 'Unable to update user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleToggle = (roleId: string) => {
    const updated = new Set(selectedUserRoles);
    if (updated.has(roleId)) {
      updated.delete(roleId);
    } else {
      updated.add(roleId);
    }
    handleUserRolesSave(Array.from(updated));
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Roles</h2>
            <p className="text-sm text-slate-500">
              Define reusable permission sets and assign them to team members.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm}>
            + New Role
          </Button>
        </div>

        {feedback && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {feedback}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              {editingRoleId ? 'Edit role' : 'Create new role'}
            </h3>
            <label className="block text-sm">
              Role name
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Content Manager"
              />
            </label>
            <label className="block text-sm">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                placeholder="Allows managing content publishing workflow."
              />
            </label>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-700">Permissions</div>
              <div className="grid gap-2 md:grid-cols-2">
                {permissionOptions.map((option) => (
                  <label key={option.key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.permissions.has(option.key)}
                      onChange={() => togglePermission(option.key)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold text-slate-800">{option.label}</span>
                      <span className="block text-xs text-slate-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateOrUpdate} disabled={loading}>
                {loading ? 'Saving…' : editingRoleId ? 'Update role' : 'Create role'}
              </Button>
              {editingRoleId && (
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Existing roles</h3>
            <div className="space-y-3">
              {roles.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No roles yet. Create a role to get started.
                </div>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{role.name}</div>
                        {role.description && <div className="text-xs text-slate-500">{role.description}</div>}
                      </div>
                      {role.isSystem && <Badge variant="info">System</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.permissions.length === 0 ? (
                        <Badge variant="warning" size="sm">No permissions</Badge>
                      ) : (
                        role.permissions.map((perm) => {
                          const option = permissionOptions.find((item) => item.key === perm);
                          return (
                            <Badge key={perm} variant="info" size="sm">
                              {option?.label || perm}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(role)}>
                        Edit
                      </Button>
                      {!role.isSystem && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(role)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Assign roles to users</h2>
            <p className="text-sm text-slate-500">
              Select a user and toggle roles to update their access in real time.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            Select user
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || user.id}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 md:grid-cols-2">
            {roles.map((role) => {
              const assigned = selectedUserRoles.has(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleUserRoleToggle(role.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    assigned ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{role.name}</span>
                    {assigned && <Badge variant="success" size="sm">Assigned</Badge>}
                  </div>
                  {role.description && <div className="text-xs text-slate-500 mt-1">{role.description}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
