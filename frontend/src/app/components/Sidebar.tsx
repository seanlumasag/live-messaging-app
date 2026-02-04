import * as React from 'react';
import { MessageCircle, Settings, LogOut, Search, User, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
}

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (id: string) => void;
  onLogout: () => void;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (name: string) => void;
  isRoomActionLoading: boolean;
  roomActionError: string | null;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onConversationSelect,
  onLogout,
  onCreateRoom,
  onJoinRoom,
  isRoomActionLoading,
  roomActionError,
}: SidebarProps) {
  const navigate = useNavigate();
  const [newRoomName, setNewRoomName] = React.useState('');
  const [joinRoomName, setJoinRoomName] = React.useState('');

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = newRoomName.trim();
    if (!trimmed) {
      return;
    }
    onCreateRoom(trimmed);
    setNewRoomName('');
  };

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = joinRoomName.trim();
    if (!trimmed) {
      return;
    }
    onJoinRoom(trimmed);
    setJoinRoomName('');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <span className="font-bold text-lg text-gray-900">LiveChat</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Room Actions */}
        <div className="mt-4 space-y-3">
          {roomActionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {roomActionError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Create room name"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={isRoomActionLoading}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Create Room
            </button>
          </form>
          <form onSubmit={handleJoin} className="space-y-2">
            <input
              type="text"
              value={joinRoomName}
              onChange={(e) => setJoinRoomName(e.target.value)}
              placeholder="Join room by name"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={isRoomActionLoading}
              className="w-full border border-green-500 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No rooms yet.</div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-green-50 transition-colors border-b border-gray-100 ${
                activeConversationId === conversation.id ? 'bg-green-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-semibold">
                  {conversation.avatar}
                </div>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  {conversation.unread && conversation.unread > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {localStorage.getItem('userName') || 'You'}
            </h4>
            <p className="text-sm text-gray-500">Online</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
