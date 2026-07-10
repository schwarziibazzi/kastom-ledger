import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Mail, 
  User,
  Clock,
  Send,
  Paperclip
} from 'lucide-react';
import { motion } from 'framer-motion';

function BeneficiaryMessages() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/beneficiary/messages');
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post('/beneficiary/messages', { message: newMessage });
      toast.success('Message sent successfully');
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full border-3 border-kastom-green/20 border-t-kastom-green animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-kastom-dark tracking-tight">Messages</h1>
        <p className="text-kastom-muted mt-1">Communicate with estate owners</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="md:col-span-1 card">
          <h2 className="text-lg font-semibold text-kastom-dark mb-4">Inbox</h2>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-kastom-muted mx-auto mb-2" />
              <p className="text-kastom-muted text-sm">No messages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full text-left p-3 rounded-xl transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-kastom-green-bg border-kastom-green/30'
                      : 'hover:bg-kastom-cream'
                  } border border-kastom-border/50`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-kastom-muted" />
                    <p className="font-medium text-kastom-dark text-sm truncate">
                      {message.sender?.name || 'Unknown'}
                    </p>
                  </div>
                  <p className="text-sm text-kastom-muted truncate mt-1">{message.subject}</p>
                  <p className="text-xs text-kastom-muted/60 mt-1">{formatDate(message.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="md:col-span-2 card">
          {selectedMessage ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-kastom-dark">{selectedMessage.subject}</h3>
                <span className="text-xs text-kastom-muted">{formatDate(selectedMessage.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-kastom-muted" />
                <span className="text-sm text-kastom-muted">From: {selectedMessage.sender?.name}</span>
              </div>
              <div className="bg-kastom-cream rounded-xl p-4">
                <p className="text-kastom-dark leading-relaxed">{selectedMessage.content}</p>
              </div>
              {selectedMessage.attachments?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-kastom-dark mb-2">Attachments</p>
                  <div className="space-y-1">
                    {selectedMessage.attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-kastom-green hover:underline cursor-pointer">
                        <Paperclip className="w-4 h-4" />
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <Mail className="w-12 h-12 text-kastom-muted mx-auto mb-4" />
              <p className="text-kastom-muted font-medium">Select a message</p>
              <p className="text-sm text-kastom-muted/60 mt-1">Choose a message from the inbox</p>
            </div>
          )}

          {/* Reply */}
          {selectedMessage && (
            <form onSubmit={handleSendMessage} className="mt-6 pt-6 border-t border-kastom-border/50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 input-field"
                />
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default BeneficiaryMessages;