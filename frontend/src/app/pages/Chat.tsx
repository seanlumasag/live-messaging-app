import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageList, Message } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import {
  ChatMessageResponse,
  createRoom,
  deleteRoom,
  joinRoomByName,
  listMessages,
  listRooms,
  sendMessage,
} from '../lib/api';

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
};

const createAvatar = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  const letters = parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0]?.slice(0, 2) ?? 'CH';
  return letters.toUpperCase();
};

const formatTimestamp = (value?: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const toMessage = (message: ChatMessageResponse, currentUserName: string): Message => ({
  id: message.id,
  text: message.content,
  sender: message.sender,
  timestamp: new Date(message.timestamp),
  isCurrentUser: message.sender === currentUserName,
});

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomActionError, setRoomActionError] = useState<string | null>(null);
  const [isRoomActionLoading, setIsRoomActionLoading] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const currentUserName = localStorage.getItem('userName') || 'You';
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearAuth = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
  };

  const handleUnauthorized = (err: unknown) => {
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      if (status === 401) {
        clearAuth();
        navigate('/auth');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rooms = await listRooms();
      const mapped = rooms.map((room) => ({
        id: room.id,
        name: room.name,
        avatar: createAvatar(room.name),
        lastMessage: 'No messages yet',
        timestamp: formatTimestamp(room.createdAt),
        online: true,
      }));

      setConversations(mapped);
      setActiveConversationId((current) => {
        if (current && rooms.some((room) => room.id === current)) {
          return current;
        }
        return rooms[0]?.id ?? null;
      });
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: string }).message));
      } else {
        setError('Unable to load rooms. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      setError(null);
      try {
        const apiMessages = await listMessages(activeConversationId);
        const mapped = apiMessages.map((message) => toMessage(message, currentUserName));
        setMessages(mapped);

        const last = apiMessages[apiMessages.length - 1];
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === activeConversationId
              ? {
                  ...conversation,
                  lastMessage: last?.content ?? 'No messages yet',
                  timestamp: last ? formatTimestamp(last.timestamp) : conversation.timestamp,
                }
              : conversation,
          ),
        );
      } catch (err) {
        if (handleUnauthorized(err)) {
          return;
        }
        if (err && typeof err === 'object' && 'message' in err) {
          setError(String((err as { message: string }).message));
        } else {
          setError('Unable to load messages. Please try again.');
        }
      }
    };

    loadMessages();
  }, [activeConversationId, currentUserName]);

  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) {
      return;
    }

    setError(null);
    try {
      const sent = await sendMessage(activeConversationId, { content: text });
      const mapped = toMessage(sent, currentUserName);
      setMessages((prev) => [...prev, mapped]);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                lastMessage: sent.content,
                timestamp: formatTimestamp(sent.timestamp),
              }
            : conversation,
        ),
      );
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as { message: string }).message));
      } else {
        setError('Unable to send message. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const handleCreateRoom = async (name: string) => {
    setRoomActionError(null);
    setIsRoomActionLoading(true);
    try {
      await createRoom({ name });
      await loadRooms();
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setRoomActionError(String((err as { message: string }).message));
      } else {
        setRoomActionError('Unable to create room. Please try again.');
      }
    } finally {
      setIsRoomActionLoading(false);
    }
  };

  const handleJoinRoom = async (name: string) => {
    setRoomActionError(null);
    setIsRoomActionLoading(true);
    try {
      await joinRoomByName({ name });
      await loadRooms();
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setRoomActionError(String((err as { message: string }).message));
      } else {
        setRoomActionError('Unable to join room. Please try again.');
      }
    } finally {
      setIsRoomActionLoading(false);
    }
  };

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    // In a real app, you would load messages for this conversation
  };

  const handleDeleteRoom = async () => {
    if (!activeConversationId) {
      return;
    }
    const target = conversations.find((room) => room.id === activeConversationId);
    const confirmed = window.confirm(
      `Delete "${target?.name ?? 'this room'}" and all chat history? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setRoomActionError(null);
    setIsDeletingRoom(true);
    try {
      await deleteRoom(activeConversationId);
      await loadRooms();
      setMessages([]);
    } catch (err) {
      if (handleUnauthorized(err)) {
        return;
      }
      if (err && typeof err === 'object' && 'message' in err) {
        setRoomActionError(String((err as { message: string }).message));
      } else {
        setRoomActionError('Unable to delete room. Please try again.');
      }
    } finally {
      setIsDeletingRoom(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId ?? ''}
        onConversationSelect={handleConversationSelect}
        onLogout={handleLogout}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isRoomActionLoading={isRoomActionLoading}
        roomActionError={roomActionError}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-semibold">
                {activeConversation?.avatar ?? 'CH'}
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {activeConversation?.name ?? 'Select a room'}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeConversation?.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            {activeConversation && (
              <button
                type="button"
                onClick={handleDeleteRoom}
                disabled={isDeletingRoom}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeletingRoom ? 'Deleting...' : 'Delete Room'}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="px-4 pt-4">
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}
          {isLoading && (
            <div className="px-4 pt-4 text-sm text-gray-500">Loading messages...</div>
          )}
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
