'use client';

import { useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useConversationDetail, useSendReply, useTakeoverConversation, useReleaseConversation, useCancelFollowup, useScheduleFollowup } from '@/lib/hooks/useDashboard';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.id as string;

  const { data: conversation, isLoading, error } = useConversationDetail(conversationId);
  const sendReply = useSendReply(conversationId);
  const takeoverMutation = useTakeoverConversation(conversationId);
  const releaseMutation = useReleaseConversation(conversationId);
  const cancelFollowupMutation = useCancelFollowup(conversationId);
  const scheduleFollowupMutation = useScheduleFollowup(conversationId);

  const [replyMessage, setReplyMessage] = useState('');
  const [showFollowupOptions, setShowFollowupOptions] = useState(false);

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
            {/* Task 10: AI Status Badge */}
            {conversation.inHumanHandling ? (
              <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded">
                🙋 Human Handling
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded">
                🤖 AI Active
              </span>
            )}
            
            {conversation.requiresHuman && (
              <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded">
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

        {/* Task 10: Takeover/Release Controls */}
        <div className="mt-6 flex gap-3">
          {conversation.inHumanHandling ? (
            <button
              onClick={() => releaseMutation.mutate()}
              disabled={releaseMutation.isPending}
              className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {releaseMutation.isPending ? 'Releasing...' : '✅ Release to AI'}
            </button>
          ) : (
            <button
              onClick={() => takeoverMutation.mutate()}
              disabled={takeoverMutation.isPending}
              className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {takeoverMutation.isPending ? 'Taking over...' : '🙋 Take Over as Human'}
            </button>
          )}
          
          {(takeoverMutation.isSuccess || releaseMutation.isSuccess) && (
            <div className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {takeoverMutation.isSuccess && '✓ You are now handling this conversation. AI has been paused.'}
              {releaseMutation.isSuccess && '✓ AI resumed for this conversation.'}
            </div>
          )}
        </div>

        {/* Followup Controls - Only show when human is handling */}
        {conversation.inHumanHandling && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Followup Management</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {conversation.followup.hasPending 
                    ? `Scheduled for ${format(new Date(conversation.followup.nextScheduledAt!), 'MMM d, h:mm a')}`
                    : 'No followup scheduled'}
                </p>
              </div>
              <button
                onClick={() => setShowFollowupOptions(!showFollowupOptions)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showFollowupOptions ? 'Hide' : 'Manage'}
              </button>
            </div>

            {showFollowupOptions && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200">
                {conversation.followup.hasPending && (
                  <button
                    onClick={() => cancelFollowupMutation.mutate()}
                    disabled={cancelFollowupMutation.isPending}
                    className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelFollowupMutation.isPending ? 'Cancelling...' : '❌ Cancel Followup'}
                  </button>
                )}
                
                <button
                  onClick={() => scheduleFollowupMutation.mutate(24)}
                  disabled={scheduleFollowupMutation.isPending}
                  className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scheduleFollowupMutation.isPending ? 'Scheduling...' : '📅 Schedule 24h'}
                </button>

                <button
                  onClick={() => scheduleFollowupMutation.mutate(48)}
                  disabled={scheduleFollowupMutation.isPending}
                  className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📅 Schedule 48h
                </button>

                <button
                  onClick={() => scheduleFollowupMutation.mutate(72)}
                  disabled={scheduleFollowupMutation.isPending}
                  className="px-4 py-2 text-sm font-medium bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📅 Schedule 3 days
                </button>

                {(cancelFollowupMutation.isSuccess || scheduleFollowupMutation.isSuccess) && (
                  <div className="w-full mt-2 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded">
                    {cancelFollowupMutation.isSuccess && '✓ Followup cancelled'}
                    {scheduleFollowupMutation.isSuccess && '✓ Followup scheduled successfully'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Send Human Reply</h3>
        
        <form onSubmit={handleSendReply} className="space-y-4">
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            className="w-full px-4 py-3 text-base font-medium text-gray-800 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/50 placeholder:text-gray-400 placeholder:font-normal"
            required
          />
          
          {sendReply.isError && (
            <div className="p-4 text-sm font-semibold text-red-800 bg-red-50 border-2 border-red-200 rounded-xl">
              Failed to send message. Please try again.
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sendReply.isPending || !replyMessage.trim()}
              className="px-8 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {sendReply.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
