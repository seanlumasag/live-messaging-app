import { useState, useEffect, useRef } from 'react';
import { MessageList, Message } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { Sidebar } from '../components/Sidebar';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'AJ',
    lastMessage: 'That sounds exciting! I wanted to chat about our upcoming meeting.',
    timestamp: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'SC',
    lastMessage: 'Thanks for the update! See you tomorrow.',
    timestamp: 'Yesterday',
    online: true,
  },
  {
    id: '3',
    name: 'Michael Brown',
    avatar: 'MB',
    lastMessage: 'Can you send me the files?',
    timestamp: 'Monday',
    unread: 1,
    online: false,
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: 'EW',
    lastMessage: 'Great work on the presentation!',
    timestamp: 'Sunday',
    online: false,
  },
  {
    id: '5',
    name: 'David Lee',
    avatar: 'DL',
    lastMessage: 'Let me know when you\'re free to chat.',
    timestamp: 'Saturday',
    online: true,
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    sender: 'Alex',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isCurrentUser: false,
  },
  {
    id: '2',
    text: "I'm doing great! Just working on some new projects. How about you?",
    sender: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    isCurrentUser: true,
  },
  {
    id: '3',
    text: 'That sounds exciting! I wanted to chat about our upcoming meeting.',
    sender: 'Alex',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    isCurrentUser: false,
  },
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'You',
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate a response from the other user
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! I\'ll get back to you soon.',
        sender: activeConversation?.name || 'User',
        timestamp: new Date(),
        isCurrentUser: false,
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    // In a real app, you would load messages for this conversation
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-semibold">
              {activeConversation?.avatar}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{activeConversation?.name}</h1>
              <p className="text-sm text-gray-500">
                {activeConversation?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}