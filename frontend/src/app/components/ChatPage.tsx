import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  Check,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  API_BASE_URL,
  ChatMessageResponse,
  ConversationResponse,
  FriendResponse,
  clearAuth,
  createDirectConversation,
  createGroupConversation,
  deleteRoom,
  listConversations,
  listFriends,
  listMessages,
  sendMessage,
} from "../lib/api";

const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CH";

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export function ChatPage() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const clientRef = useRef<Client | null>(null);
  const activeRoomRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const currentUser = localStorage.getItem("userName") || "You";
  const selectedChat = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const handleAuthFailure = useCallback((err: unknown) => {
    if (err && typeof err === "object" && "status" in err) {
      const status = (err as { status: number }).status;
      if (status === 401 || status === 403) {
        clearAuth();
        navigate("/");
        return true;
      }
    }
    return false;
  }, [navigate]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listConversations();
      setConversations(data);
      setSelectedId((current) => current && data.some((item) => item.id === current)
        ? current
        : data[0]?.id ?? null);
    } catch (err) {
      if (!handleAuthFailure(err)) {
        setError(err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Unable to load conversations.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthFailure]);

  useEffect(() => {
    loadConversations();
    listFriends().then(setFriends).catch((err) => {
      if (!handleAuthFailure(err)) setFriends([]);
    });
  }, [handleAuthFailure, loadConversations]);

  useEffect(() => {
    const load = async () => {
      if (!selectedId) {
        setMessages([]);
        return;
      }
      try {
        setMessages(await listMessages(selectedId));
      } catch (err) {
        if (!handleAuthFailure(err)) {
          setError(err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Unable to load messages.");
        }
      }
    };
    load();
  }, [handleAuthFailure, selectedId]);

  useEffect(() => {
    activeRoomRef.current = selectedId;
    const client = clientRef.current;
    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;
    if (client?.connected && selectedId) {
      subscriptionRef.current = client.subscribe(`/topic/rooms/${selectedId}`, (message) => {
        const payload = JSON.parse(message.body) as ChatMessageResponse;
        setMessages((current) => current.some((item) => item.id === payload.id)
          ? current
          : [...current, payload]);
      });
    }
  }, [selectedId]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL.replace(/\/$/, "")}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      debug: () => undefined,
    });
    client.onConnect = () => {
      if (activeRoomRef.current) {
        subscriptionRef.current = client.subscribe(`/topic/rooms/${activeRoomRef.current}`, (message) => {
          const payload = JSON.parse(message.body) as ChatMessageResponse;
          setMessages((current) => current.some((item) => item.id === payload.id)
            ? current
            : [...current, payload]);
        });
      }
    };
    client.activate();
    clientRef.current = client;
    return () => {
      subscriptionRef.current?.unsubscribe();
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleFriendSelection = (username: string) => {
    setSelectedFriends((prev) =>
      prev.includes(username) ? prev.filter((id) => id !== username) : [...prev, username],
    );
  };

  const handleCreateGroup = async () => {
    if (selectedFriends.length === 0 || !groupName.trim()) return;
    try {
      const conversation = await createGroupConversation({
        name: groupName.trim(),
        memberUsernames: selectedFriends,
      });
      setShowNewGroupModal(false);
      setSelectedFriends([]);
      setGroupName("");
      await loadConversations();
      setSelectedId(conversation.id);
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to create group.");
    }
  };

  const handleStartDirect = async (username: string) => {
    try {
      const conversation = await createDirectConversation(username);
      setShowNewChatModal(false);
      await loadConversations();
      setSelectedId(conversation.id);
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to start chat.");
    }
  };

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || !selectedId) return;
    setMessageInput("");
    try {
      const client = clientRef.current;
      if (client?.connected) {
        client.publish({
          destination: `/app/rooms/${selectedId}/send`,
          headers: localStorage.getItem("authToken")
            ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            : {},
          body: JSON.stringify({ content }),
        });
        return;
      }
      const sent = await sendMessage(selectedId, { content });
      setMessages((current) => [...current, sent]);
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to send message.");
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedId) return;
    try {
      await deleteRoom(selectedId);
      setMessages([]);
      await loadConversations();
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to delete conversation.");
    }
  };

  return (
    <>
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl text-white">New Direct Message</h3>
              <p className="text-sm text-gray-400 mt-1">You can only message friends.</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No friends yet</p>
                  <p className="text-sm text-gray-500">Add friends to start messaging</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleStartDirect(friend.username)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-[#2c2c2e] rounded-xl transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                        <span className="text-sm">{initials(friend.displayName || friend.username)}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white">{friend.displayName}</p>
                        <p className="text-xs text-gray-400">@{friend.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800">
              <button onClick={() => setShowNewChatModal(false)} className="w-full py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl text-white">New Group Chat</h3>
              <p className="text-sm text-gray-400 mt-1">Only friends can be added to group chats.</p>
            </div>
            <div className="p-6">
              <label className="block text-sm text-gray-400 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 mb-4 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <label className="block text-sm text-gray-400 mb-2">Add Friends ({selectedFriends.length} selected)</label>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriendSelection(friend.username)}
                    className={`w-full p-3 flex items-center gap-3 rounded-xl transition-colors ${
                      selectedFriends.includes(friend.username)
                        ? "bg-blue-500/20 border border-blue-500"
                        : "bg-[#2c2c2e] hover:bg-[#3a3a3c]"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <span className="text-sm">{initials(friend.displayName || friend.username)}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white">{friend.displayName}</p>
                      <p className="text-xs text-gray-400">@{friend.username}</p>
                    </div>
                    {selectedFriends.includes(friend.username) && <Check className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex gap-2">
              <button onClick={() => setShowNewGroupModal(false)} className="flex-1 py-2 text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={selectedFriends.length === 0 || !groupName.trim()}
                className="flex-1 py-2 rounded-xl bg-blue-500 disabled:bg-[#2c2c2e] disabled:text-gray-600 text-white transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-screen bg-[#000000] flex">
        <div className="w-80 bg-[#1c1c1e] border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl text-white">Messages</h2>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowNewChatModal(true)} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors" title="New direct message">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setShowNewGroupModal(true)} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors" title="New group chat">
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => navigate("/friends")} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors" title="Friends">
                  <UserPlus className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => navigate("/settings")} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors" title="Settings">
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search conversations" className="w-full pl-10 pr-4 py-2 bg-[#2c2c2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && <div className="p-4 text-sm text-gray-400">Loading conversations...</div>}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-[#2c2c2e] transition-colors border-b border-gray-800/50 ${
                  selectedId === conv.id ? "bg-[#2c2c2e]" : ""
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${
                  conv.type === "GROUP" ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-blue-500 to-blue-600"
                } flex items-center justify-center text-white`}>
                  {conv.type === "GROUP" ? <Users className="w-6 h-6" /> : <span>{initials(conv.name)}</span>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-white truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTime(conv.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{conv.type === "DIRECT" ? "Direct message" : `${conv.members.length} participants`}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#000000]">
          <div className="h-16 bg-[#1c1c1e] border-b border-gray-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <span className="text-sm">{initials(selectedChat?.name ?? "Chat")}</span>
              </div>
              <div>
                <h3 className="text-white">{selectedChat?.name ?? "Select a conversation"}</h3>
                {selectedChat && <p className="text-xs text-gray-400">{selectedChat.members.length} participants</p>}
              </div>
            </div>
            {selectedChat && (
              <div className="flex items-center gap-2">
                <button onClick={handleDeleteConversation} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
            {messages.map((message) => {
              const isSent = message.sender === currentUser;
              return (
                <div key={message.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md ${isSent ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isSent ? "bg-blue-500 text-white rounded-br-md" : "bg-[#2c2c2e] text-white rounded-bl-md"
                    }`}>
                      {!isSent && <p className="text-xs text-gray-400 mb-1">{message.sender}</p>}
                      <p>{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="bg-[#1c1c1e] border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={!selectedChat}
                  placeholder={selectedChat ? "Type a message..." : "Select a conversation"}
                  className="w-full px-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors disabled:cursor-not-allowed"
                />
              </div>
              <button onClick={handleSend} disabled={!selectedChat || !messageInput.trim()} className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-[#2c2c2e] rounded-xl transition-colors">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
