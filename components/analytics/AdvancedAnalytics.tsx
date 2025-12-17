'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface AdvancedAnalyticsProps {
  data: {
    overview: {
      totalUsers: number;
      totalCourses: number;
      totalEnrollments: number;
      totalRevenue: number;
    };
    recentPayments: Array<{
      id: string;
      amount: number;
      currency: string;
      courseId?: string;
      userId: string;
      createdAt: string;
    }>;
    coursePerformance: Array<{
      title: string;
      slug: string;
      enrollmentCount: number;
    }>;
    userEngagement: {
      avgQuizzesPerUser: number;
      avgScore: number;
    };
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      count: number;
    }>;
  };
}

export function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');

  const handleExport = async () => {
    // Export functionality would be implemented here
    alert(`Exporting analytics data as ${exportFormat.toUpperCase()}...`);
  };

  // Calculate MRR (Monthly Recurring Revenue) - simplified
  const mrr = data.monthlyRevenue[data.monthlyRevenue.length - 1]?.revenue || 0;
  const arr = mrr * 12; // Annual Recurring Revenue

  // Calculate churn rate (simplified - would need more data)
  const churnRate = 0; // Placeholder

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mrr.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${arr.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Annual Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-500 mt-1">Monthly churn</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Revenue</CardTitle>
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2} />
              <Line type="monotone" dataKey="count" stroke="#64748b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.coursePerformance.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrollmentCount" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-600">Average Quizzes per User</div>
                <div className="text-2xl font-bold">{data.userEngagement.avgQuizzesPerUser.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Average Score</div>
                <div className="text-2xl font-bold">{data.userEngagement.avgScore.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.recentPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-slate-200">
                  <div>
                    <div className="text-sm font-medium">${payment.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

