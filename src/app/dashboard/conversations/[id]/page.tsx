'use client';

import { useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useConversationDetail, useSendReply } from '@/lib/hooks/useDashboard';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.id as string;

  const { data: conversation, isLoading, error } = useConversationDetail(conversationId);
  const sendReply = useSendReply(conversationId);

  const [replyMessage, setReplyMessage] = useState('');

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      await sendReply.mutateAsync(replyMessage);
      setReplyMessage('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading conversation...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Failed to load conversation. Please try again.
        </div>
        <Link
          href="/dashboard/conversations"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/conversations"
          className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block"
        >
          ← Back to conversations
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {conversation.customerName || conversation.customerPhone}
            </h2>
            {!conversation.customerName && (
              <p className="text-gray-600 mt-1">{conversation.customerPhone}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {conversation.requiresHuman && (
              <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded">
                Requires Human
              </span>
            )}
            {conversation.followup.hasPending && (
              <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded">
                Followup Scheduled
              </span>
            )}
          </div>
        </div>

        {/* Conversation Info */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {conversation.intent && (
            <div>
              <div className="text-xs text-gray-500 uppercase">Intent</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{conversation.intent}</div>
            </div>
          )}
          {conversation.subIntent && (
            <div>
              <div className="text-xs text-gray-500 uppercase">Sub-Intent</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{conversation.subIntent}</div>
            </div>
          )}
          {conversation.leadScore !== null && (
            <div>
              <div className="text-xs text-gray-500 uppercase">Lead Score</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{conversation.leadScore}/100</div>
            </div>
          )}
          {conversation.followup.nextScheduledAt && (
            <div>
              <div className="text-xs text-gray-500 uppercase">Next Followup</div>
              <div className="text-sm font-medium text-gray-900 mt-1">
                {format(new Date(conversation.followup.nextScheduledAt), 'MMM d, h:mm a')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        </div>
        
        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                  msg.direction === 'OUTBOUND'
                    ? msg.handledBy === 'HUMAN'
                      ? 'bg-green-100 text-green-900'
                      : 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                  <span>{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</span>
                  {msg.direction === 'OUTBOUND' && msg.handledBy && (
                    <>
                      <span>•</span>
                      <span>{msg.handledBy === 'HUMAN' ? 'You' : 'AI'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-purple-200 p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">Send Human Reply</h3>
        
        <form onSubmit={handleSendReply} className="space-y-4">
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            className="w-full px-4 py-3 text-base font-medium text-gray-900 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50 placeholder:text-gray-500 placeholder:font-normal"
            required
          />
          
          {sendReply.isError && (
            <div className="p-4 text-sm font-semibold text-red-800 bg-red-100 border-2 border-red-300 rounded-lg">
              Failed to send message. Please try again.
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sendReply.isPending || !replyMessage.trim()}
              className="px-8 py-3 text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {sendReply.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
