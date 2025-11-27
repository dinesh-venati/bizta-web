'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConversationDetail, useSendReply, useTakeoverConversation, useReleaseConversation, useCancelFollowup, useScheduleFollowup, useUpdateRequiresHuman } from '@/lib/hooks/useDashboard';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.id as string;

  const { data: conversation, isLoading, error } = useConversationDetail(conversationId);
  const sendReply = useSendReply(conversationId);
  const takeoverMutation = useTakeoverConversation(conversationId);
  const releaseMutation = useReleaseConversation(conversationId);
  const cancelFollowupMutation = useCancelFollowup(conversationId);
  const scheduleFollowupMutation = useScheduleFollowup(conversationId);
  const updateRequiresHumanMutation = useUpdateRequiresHuman(conversationId);

  const [replyMessage, setReplyMessage] = useState('');
  const [selectedFollowup, setSelectedFollowup] = useState<'none' | 24 | 48 | 72>('none');
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showReleaseConfirmation, setShowReleaseConfirmation] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      // Auto-takeover when human sends reply
      if (!conversation?.inHumanHandling) {
        await takeoverMutation.mutateAsync();
      }
      
      await sendReply.mutateAsync(replyMessage);
      setReplyMessage('');
      setHasSentMessage(true); // Mark that human sent a message
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  const handleReleaseClick = () => {
    // If conversation requires human and human hasn't sent a message, show confirmation
    if (conversation?.requiresHuman && !hasSentMessage) {
      setShowReleaseConfirmation(true);
    } else {
      // Direct release if no confirmation needed
      releaseMutation.mutate();
    }
  };

  const handleReleaseConfirmation = async (contacted: boolean) => {
    try {
      // Update requiresHuman based on whether human contacted customer
      await updateRequiresHumanMutation.mutateAsync(!contacted);
      // Then release to AI
      await releaseMutation.mutateAsync();
      setShowReleaseConfirmation(false);
    } catch (err) {
      console.error('Failed to release conversation:', err);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    // If conversation requires human and human is handling, show confirmation
    if (conversation?.requiresHuman && conversation?.inHumanHandling) {
      e.preventDefault();
      setShowExitConfirmation(true);
    }
  };

  const handleExitConfirmation = async (contacted: boolean) => {
    try {
      // Update requiresHuman based on whether human contacted customer
      await updateRequiresHumanMutation.mutateAsync(!contacted);
      setShowExitConfirmation(false);
      setIsNavigatingAway(true);
      router.push('/dashboard/conversations');
    } catch (err) {
      console.error('Failed to update conversation:', err);
    }
  };

  // Auto-apply followup changes when selection changes
  useEffect(() => {
    if (!conversation || isNavigatingAway) return;
    
    const applyFollowupChange = async () => {
      if (selectedFollowup === 'none') {
        // If "No Followup" is selected, cancel any existing followups
        if (conversation?.followup.hasPending) {
          await cancelFollowupMutation.mutateAsync();
        }
      } else {
        // Schedule followup with selected delay
        await scheduleFollowupMutation.mutateAsync(selectedFollowup);
      }
    };

    // Debounce the followup scheduling
    const timer = setTimeout(() => {
      applyFollowupChange();
    }, 500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFollowup]);

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
      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Did you contact the customer?</h3>
            <p className="text-gray-600 mb-6">
              Before leaving, please confirm if you were able to connect with the customer.
              This helps us track which conversations still need attention.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleExitConfirmation(true)}
                disabled={updateRequiresHumanMutation.isPending}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
              >
                ✓ Yes, I contacted them
              </button>
              <button
                onClick={() => handleExitConfirmation(false)}
                disabled={updateRequiresHumanMutation.isPending}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
              >
                ✗ No, still needs attention
              </button>
            </div>
            <button
              onClick={() => setShowExitConfirmation(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Release Confirmation Modal */}
      {showReleaseConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Did you contact the customer?</h3>
            <p className="text-gray-600 mb-6">
              Before releasing this conversation back to AI, please confirm if you were able to connect with the customer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleReleaseConfirmation(true)}
                disabled={updateRequiresHumanMutation.isPending || releaseMutation.isPending}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
              >
                ✓ Yes, I contacted them
              </button>
              <button
                onClick={() => handleReleaseConfirmation(false)}
                disabled={updateRequiresHumanMutation.isPending || releaseMutation.isPending}
                className="flex-1 px-4 py-3 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
              >
                ✗ No, still needs attention
              </button>
            </div>
            <button
              onClick={() => setShowReleaseConfirmation(false)}
              className="mt-4 w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href="/dashboard/conversations"
          onClick={handleBackClick}
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
              onClick={handleReleaseClick}
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
          <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-1">⏰ Followup Management</h3>
              <p className="text-sm text-gray-600">
                Choose when to follow up with this customer. Changes are saved automatically.
              </p>
            </div>

            <div className="space-y-3">
              {/* No Followup Option - Default */}
              <label className="flex items-start p-4 bg-white border-2 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="radio"
                  name="followup"
                  value="none"
                  checked={selectedFollowup === 'none'}
                  onChange={() => setSelectedFollowup('none')}
                  className="mt-1 w-4 h-4 text-gray-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">🚫 No Followup Needed</div>
                  <div className="text-xs text-gray-600 mt-0.5">Customer issue resolved or no followup required</div>
                </div>
              </label>

              {/* 24 Hours Option */}
              <label className="flex items-start p-4 bg-white border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                <input
                  type="radio"
                  name="followup"
                  value="24"
                  checked={selectedFollowup === 24}
                  onChange={() => setSelectedFollowup(24)}
                  className="mt-1 w-4 h-4 text-purple-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">📅 Follow up in 24 hours</div>
                  <div className="text-xs text-gray-600 mt-0.5">Tomorrow</div>
                </div>
              </label>

              {/* 48 Hours Option */}
              <label className="flex items-start p-4 bg-white border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                <input
                  type="radio"
                  name="followup"
                  value="48"
                  checked={selectedFollowup === 48}
                  onChange={() => setSelectedFollowup(48)}
                  className="mt-1 w-4 h-4 text-purple-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">📅 Follow up in 48 hours</div>
                  <div className="text-xs text-gray-600 mt-0.5">In 2 days</div>
                </div>
              </label>

              {/* 72 Hours Option */}
              <label className="flex items-start p-4 bg-white border-2 rounded-lg cursor-pointer hover:border-purple-400 transition-colors">
                <input
                  type="radio"
                  name="followup"
                  value="72"
                  checked={selectedFollowup === 72}
                  onChange={() => setSelectedFollowup(72)}
                  className="mt-1 w-4 h-4 text-purple-600"
                />
                <div className="ml-3 flex-1">
                  <div className="text-sm font-semibold text-gray-900">📅 Follow up in 3 days</div>
                  <div className="text-xs text-gray-600 mt-0.5">In 72 hours</div>
                </div>
              </label>
            </div>

            {/* Status Message */}
            {(cancelFollowupMutation.isSuccess || scheduleFollowupMutation.isSuccess) && (
              <div className="mt-3 px-4 py-2.5 text-sm font-medium text-green-800 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>
                  {cancelFollowupMutation.isSuccess && 'Followup cancelled successfully'}
                  {scheduleFollowupMutation.isSuccess && 'Followup scheduled successfully'}
                </span>
              </div>
            )}

            {(cancelFollowupMutation.isPending || scheduleFollowupMutation.isPending) && (
              <div className="mt-3 px-4 py-2.5 text-sm font-medium text-blue-800 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>Updating followup...</span>
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
