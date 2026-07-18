import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  Bot,
  User,
  Shield,
  FileText,
  Home,
  Users,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

function Chatbot() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick replies for common questions
  const quickReplies = [
    { label: 'What is Kastom Ledger?', value: 'what is kastom ledger' },
    { label: 'How do I create an estate?', value: 'how to create an estate' },
    { label: 'What is a Digital Will?', value: 'what is a digital will' },
    { label: 'How do beneficiaries work?', value: 'how do beneficiaries work' },
    { label: 'Is my data secure?', value: 'is my data secure' },
    { label: 'What is SevisPass?', value: 'what is sevispass' }
  ];

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: '👋 Welcome to Kastom Ledger! I\'m here to help you with any questions about digital estate planning, inheritance, and legacy preservation. How can I assist you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const response = generateBotResponse(input);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const generateBotResponse = (query) => {
    const lowerQuery = query.toLowerCase();

    // Estate related
    if (lowerQuery.includes('estate') || lowerQuery.includes('create estate')) {
      return '📋 To create an estate, go to your Dashboard and click "Create Estate" or navigate to the "My Estate" page. You\'ll need to provide a title and description for your estate. Once created, you can add assets, nominate beneficiaries, and create your Digital Will. Would you like me to guide you through the process?';
    }

    // Digital Will related
    if (lowerQuery.includes('will') || lowerQuery.includes('digital will')) {
      return '📝 A Digital Will is a legally-informed document that records your wishes for asset distribution. You can create one by going to "Digital Will" in your dashboard. The process includes adding an introduction, executor notes, personal messages, and audio recordings. You\'ll also need at least 2 witnesses to verify your will.';
    }

    // Beneficiary related
    if (lowerQuery.includes('beneficiary') || lowerQuery.includes('heir')) {
      return '👤 Beneficiaries are individuals nominated to receive your assets. You can add beneficiaries through the "Beneficiaries" page in your dashboard. If a beneficiary doesn\'t have a SevisPass account, the system will send them an invitation via email. As a beneficiary, you\'ll have view-only access to inherited estates and assets.';
    }

    // Security related
    if (lowerQuery.includes('security') || lowerQuery.includes('safe') || lowerQuery.includes('tamper')) {
      return '🔒 Your data is protected by military-grade encryption and a tamper-evident ledger using SHA-256 hashing. Every action is recorded in the ledger, creating an immutable audit trail. The system also uses JWT authentication, rate limiting, and role-based access control to ensure only authorized individuals can access your information.';
    }

    // SevisPass related
    if (lowerQuery.includes('sevispass') || lowerQuery.includes('sevis wallet') || lowerQuery.includes('sevisdex')) {
      return '🔐 SevisPass is Papua New Guinea\'s official digital identity system. It provides secure authentication for Kastom Ledger. SevisDEx is the data exchange bridge that connects Kastom Ledger to government agencies like the Department of Lands. When you verify an asset, SevisDEx securely queries the government registry for verified information.';
    }

    // Assets related
    if (lowerQuery.includes('asset') || lowerQuery.includes('property') || lowerQuery.includes('land')) {
      return '🏠 You can add various assets to your estate including land, vehicles, businesses, savings, and investments. For land assets, you can verify ownership through SevisDEx by entering the title number. The system will then query the Department of Lands registry and return verified information about your property.';
    }

    // Witness related
    if (lowerQuery.includes('witness')) {
      return '👁️ Witnesses play a crucial role in verifying important decisions. You can request a witness for your Digital Will or other important documents. Witnesses can review and approve or reject requests through their dashboard. At least 2 witnesses are required for a Digital Will.';
    }

    // FAQ / General
    if (lowerQuery.includes('faq') || lowerQuery.includes('help') || lowerQuery.includes('how does')) {
      return '📖 You can find answers to common questions on our FAQ page. Visit the FAQ section for detailed explanations about estate management, digital wills, beneficiaries, security, and more. Is there something specific you\'d like to know about?';
    }

    // Greeting
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return `Hello${user ? ' ' + user.name : ''}! 👋 How can I help you today? You can ask me about creating an estate, digital wills, beneficiaries, security, or anything else about Kastom Ledger.`;
    }

    // Default response
    return `I understand you're asking about "${query}". Let me help you with that. Could you please be more specific about what you'd like to know? You can ask about:

• 📋 Creating and managing estates
• 📝 Digital Wills
• 👤 Beneficiaries and heirs
• 🔒 Security and the tamper-evident ledger
• 🔐 SevisPass and SevisDEx
• 🏠 Assets and property verification

Or you can visit our FAQ page for more information!`;
  };

  const handleQuickReply = (value) => {
    setInput(value);
    // Auto-send after a short delay
    setTimeout(() => {
      const sendEvent = new Event('submit');
      document.getElementById('chat-form')?.dispatchEvent(sendEvent);
    }, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-kastom-green text-white shadow-premium-xl hover:bg-kastom-green-light transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed z-50 ${
        isMinimized ? 'bottom-6 right-6 w-72' : 'bottom-6 right-6 w-96 h-[600px]'
      } bg-white rounded-2xl shadow-premium-xl border border-kastom-border/50 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="bg-kastom-green text-white p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Kastom Assistant</h3>
            <p className="text-xs text-white/80">Online • Ready to help</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-kastom-cream/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-kastom-green text-white rounded-br-none'
                      : 'bg-white border border-kastom-border/50 text-kastom-dark rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-kastom-border/50 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-kastom-muted animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-kastom-muted animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-kastom-muted animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length < 4 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply.value)}
                  className="text-xs px-3 py-1.5 rounded-full bg-kastom-cream border border-kastom-border/50 hover:border-kastom-green/50 hover:bg-kastom-green-bg transition-colors text-kastom-dark"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            id="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-kastom-border/50 flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2 bg-kastom-cream border border-kastom-border rounded-xl focus:outline-none focus:ring-2 focus:ring-kastom-green focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-kastom-green text-white hover:bg-kastom-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}

      {isMinimized && (
        <div className="p-4 flex items-center justify-between">
          <p className="text-sm text-kastom-muted">Click to expand chat</p>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-kastom-green hover:underline text-sm"
          >
            Open
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default Chatbot;