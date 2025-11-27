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
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2 text-base">Monitor your AI assistant&apos;s performance</p>
      </div>

      {/* Date Range Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {(['today', 'yesterday', 'dayBeforeYesterday'] as DateRange[]).map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all ${
                selectedDate === date
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {dateLabels[date]}
            </button>
          ))}
        </div>
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
        <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Messages</h3>
          <p className="text-4xl font-bold text-blue-600">{summary?.totalMessagesFromCustomersToday || 0}</p>
          <p className="text-sm font-medium text-gray-600 mt-2">Received {dateLabels[selectedDate].toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md border-2 border-green-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Bizta Messages</h3>
          <p className="text-4xl font-bold text-green-600">{summary?.totalMessagesFromBiztaToday || 0}</p>
          <p className="text-sm font-medium text-gray-600 mt-2">Sent {dateLabels[selectedDate].toLowerCase()}</p>
        </div>
      </div>

      {/* Top Intents */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Customer Intents</h3>
        {summary?.topIntents && summary.topIntents.length > 0 ? (
          <div className="space-y-3">
            {summary.topIntents.map((item) => (
              <div key={item.intent} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span className="text-base font-semibold text-gray-800">
                    {item.intent || 'Unknown'}
                  </span>
                </div>
                <span className="text-base font-bold text-gray-700 bg-blue-100 px-3 py-1 rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-base font-medium">No data for {dateLabels[selectedDate].toLowerCase()}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/conversations?filter=requiresHuman"
            className="p-5 border-2 border-orange-300 bg-orange-50 rounded-lg hover:border-orange-500 hover:bg-orange-100 transition-all hover:shadow-md"
          >
            <h4 className="font-bold text-gray-900 mb-2 text-base">Review Human Requests</h4>
            <p className="text-sm font-medium text-gray-700">
              Check conversations that need your attention
            </p>
          </Link>
          <Link
            href="/dashboard/conversations"
            className="p-5 border-2 border-blue-300 bg-blue-50 rounded-lg hover:border-blue-500 hover:bg-blue-100 transition-all hover:shadow-md"
          >
            <h4 className="font-bold text-gray-900 mb-2 text-base">All Conversations</h4>
            <p className="text-sm font-medium text-gray-700">
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
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  const borderClasses = {
    blue: 'border-blue-200',
    green: 'border-green-200',
    orange: 'border-orange-200',
    purple: 'border-purple-200',
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className={`text-4xl font-bold ${colorClasses[color].split(' ')[0]} mb-2`}>
        {value}
      </div>
      <p className="text-sm font-medium text-gray-600">{description}</p>
    </>
  );

  if (link) {
    return (
      <Link
        href={link}
        className={`bg-white rounded-lg shadow-md border-2 ${borderClasses[color]} p-6 hover:shadow-xl transition-all hover:scale-105`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${borderClasses[color]} p-6`}>
      {content}
    </div>
  );
}
