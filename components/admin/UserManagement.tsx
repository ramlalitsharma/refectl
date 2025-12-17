'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student';
  createdAt: string;
  createdBy?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'admin' | 'teacher' | 'student',
    password: '',
  });

  useEffect(() => {
    loadUsers();
    loadCurrentUserRole();
  }, []);

  const loadCurrentUserRole = async () => {
    try {
      const res = await fetch('/api/user/role');
      const data = await res.json();
      if (res.ok) {
        setCurrentUserRole(data.role || 'student');
      }
    } catch (error) {
      console.error('Failed to load current user role:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateForm(false);
        setFormData({ email: '', firstName: '', lastName: '', role: 'student', password: '' });
        loadUsers();
        alert('User created successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to create user: ${msg}`);
    }
  };

  const handleDeleteUser = async (userId: string, userRole: string) => {
    if (!confirm(`Are you sure you want to delete this ${userRole}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        loadUsers();
        alert('User deleted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to delete user: ${msg}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'teacher':
        return 'bg-green-100 text-green-800';
      case 'student':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateAdmin = currentUserRole === 'superadmin';
  const canCreateTeacher = currentUserRole === 'superadmin' || currentUserRole === 'admin';
  const canCreateStudent = currentUserRole === 'superadmin';
  const canDeleteUser = currentUserRole === 'superadmin';

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)) ||
          `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, roleFilter, searchQuery]);

  // Count users by role
  const userCounts = useMemo(() => {
    return {
      all: users.length,
      superadmin: users.filter((u) => u.role === 'superadmin').length,
      admin: users.filter((u) => u.role === 'admin').length,
      teacher: users.filter((u) => u.role === 'teacher').length,
      student: users.filter((u) => u.role === 'student').length,
    };
  }, [users]);

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600 mt-1">
            {currentUserRole === 'superadmin' && 'Create and manage all users: admins, teachers, and students'}
            {currentUserRole === 'admin' && 'Create and manage teachers'}
            {currentUserRole !== 'superadmin' && currentUserRole !== 'admin' && 'View users'}
          </p>
        </div>
        {(canCreateAdmin || canCreateTeacher || canCreateStudent) && (
          <Button variant="inverse" onClick={() => setShowCreateForm(!showCreateForm)}>
            + Create User
          </Button>
        )}
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'teacher' | 'student' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  required
                >
                  {canCreateAdmin && <option value="admin">Admin</option>}
                  {canCreateTeacher && <option value="teacher">Teacher</option>}
                  {canCreateStudent && <option value="student">Student</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password (optional - user will set via email if not provided)
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty for email invitation"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="inverse">
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={roleFilter === 'all' ? 'inverse' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All ({userCounts.all})
              </Button>
              {currentUserRole === 'superadmin' && (
                <Button
                  variant={roleFilter === 'superadmin' ? 'inverse' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('superadmin')}
                >
                  Superadmin ({userCounts.superadmin})
                </Button>
              )}
              <Button
                variant={roleFilter === 'admin' ? 'inverse' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admins ({userCounts.admin})
              </Button>
              <Button
                variant={roleFilter === 'teacher' ? 'inverse' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('teacher')}
              >
                Teachers ({userCounts.teacher})
              </Button>
              <Button
                variant={roleFilter === 'student' ? 'inverse' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('student')}
              >
                Students ({userCounts.student})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {roleFilter === 'all' ? 'All Users' : `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`} ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Created</th>
                  {canDeleteUser && (
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={canDeleteUser ? 5 : 4} className="text-center py-8 text-slate-500">
                      {searchQuery || roleFilter !== 'all' ? 'No users found matching your filters' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      {canDeleteUser && (
                        <td className="py-3 px-4">
                          {user.role !== 'superadmin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.role)}
                              disabled={deletingUserId === user.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
