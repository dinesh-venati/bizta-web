'use client';

import { useState } from 'react';
import { useConversations } from '@/lib/hooks/useDashboard';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useConversations(page, pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Failed to load conversations. Please try again.
      </div>
    );
  }

  const filter = searchParams?.get('filter');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
          <p className="text-gray-600 mt-1">
            {data?.total || 0} total conversations
            {filter === 'requiresHuman' && ' (requires human attention)'}
          </p>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {data?.items && data.items.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {data.items.map((conv) => (
              <Link
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conv.customerName || conv.customerPhone}
                        </h3>
                        {conv.requiresHuman && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                            Requires Human
                          </span>
                        )}
                        {conv.hasPendingFollowup && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                            Followup Scheduled
                          </span>
                        )}
                      </div>
                      
                      {!conv.customerName && (
                        <p className="text-sm text-gray-500 mt-1">{conv.customerPhone}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {conv.intent && (
                          <span>Intent: <span className="font-medium">{conv.intent}</span></span>
                        )}
                        {conv.subIntent && (
                          <span>• {conv.subIntent}</span>
                        )}
                        {conv.leadScore !== null && (
                          <span>• Lead Score: <span className="font-medium">{conv.leadScore}/100</span></span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      <div>{formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}</div>
                      <div className="text-xs text-gray-400 mt-1">{conv.channel}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            No conversations found
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {data.page} of {data.totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
