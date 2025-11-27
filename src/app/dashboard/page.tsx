'use client';

import { useState } from 'react';
import { useTodaySummary } from '@/lib/hooks/useDashboard';
import Link from 'next/link';

type DateRange = 'today' | 'yesterday' | 'dayBeforeYesterday';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<DateRange>('today');
  const { data: summary, isLoading, error } = useTodaySummary(selectedDate);

  const dateLabels: Record<DateRange, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    dayBeforeYesterday: 'Day Before Yesterday',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Monitor your AI assistant&apos;s performance</p>
      </div>

      {/* Date Range Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['today', 'yesterday', 'dayBeforeYesterday'] as DateRange[]).map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              selectedDate === date
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {dateLabels[date]}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Conversations"
          value={summary?.totalConversationsToday || 0}
          description="Conversations with activity"
          color="blue"
        />
        <StatCard
          title="New Conversations"
          value={summary?.newConversationsToday || 0}
          description="First-time customers"
          color="green"
        />
        <StatCard
          title="Requires Human"
          value={summary?.conversationsNeedingHuman || 0}
          description="Needs manual attention"
          color="orange"
          link="/dashboard/conversations?filter=requiresHuman"
        />
        <StatCard
          title="Pending Followups"
          value={summary?.pendingFollowupsToday || 0}
          description="Scheduled messages"
          color="purple"
        />
      </div>

      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Messages</h3>
          <p className="text-3xl font-bold text-blue-600">{summary?.totalMessagesFromCustomersToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Received {dateLabels[selectedDate].toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bizta Messages</h3>
          <p className="text-3xl font-bold text-green-600">{summary?.totalMessagesFromBiztaToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Sent {dateLabels[selectedDate].toLowerCase()}</p>
        </div>
      </div>

      {/* Top Intents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customer Intents</h3>
        {summary?.topIntents && summary.topIntents.length > 0 ? (
          <div className="space-y-3">
            {summary.topIntents.map((item) => (
              <div key={item.intent} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">
                    {item.intent || 'Unknown'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.count} conversations</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data for {dateLabels[selectedDate].toLowerCase()}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/conversations?filter=requiresHuman"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-1">Review Human Requests</h4>
            <p className="text-sm text-gray-600">
              Check conversations that need your attention
            </p>
          </Link>
          <Link
            href="/dashboard/conversations"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-1">All Conversations</h4>
            <p className="text-sm text-gray-600">
              Browse all customer interactions
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  color,
  link,
}: {
  title: string;
  value: number;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  link?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  const content = (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      </div>
      <div className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </div>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </>
  );

  if (link) {
    return (
      <Link
        href={link}
        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {content}
    </div>
  );
}
