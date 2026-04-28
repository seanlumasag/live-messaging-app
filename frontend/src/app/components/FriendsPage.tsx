import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Clock, MessageCircle, Search, UserPlus, Users, X } from "lucide-react";
import {
  FriendRequestResponse,
  FriendResponse,
  acceptFriendRequest,
  createDirectConversation,
  declineFriendRequest,
  listFriends,
  listIncomingRequests,
  listSentRequests,
  searchFriend,
  sendFriendRequest,
} from "../lib/api";

const initials = (value: string) => value.slice(0, 2).toUpperCase();

export function FriendsPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<FriendResponse | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"friends" | "incoming" | "sent" | "add">("friends");

  const refresh = useCallback(async () => {
    const [friendData, incomingData, sentData] = await Promise.all([
      listFriends(),
      listIncomingRequests(),
      listSentRequests(),
    ]);
    setFriends(friendData);
    setIncomingRequests(incomingData);
    setSentRequests(sentData);
  }, []);

  useEffect(() => {
    refresh().catch(() => setError("Unable to load friends."));
  }, [refresh]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setError(null);
    setRequestSent(false);
    try {
      setSearchResult(await searchFriend(searchQuery.trim()));
    } catch (err) {
      setSearchResult(null);
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "User not found.");
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    try {
      await sendFriendRequest(searchResult.username);
      setRequestSent(true);
      await refresh();
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to send request.");
    }
  };

  const handleMessage = async (username: string) => {
    try {
      await createDirectConversation(username);
      navigate("/chat");
    } catch (err) {
      setError(err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Unable to start chat.");
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/chat")} className="p-2 hover:bg-[#2c2c2e] rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl text-white">Friends</h1>
            <p className="text-gray-400">Manage your friends and requests</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-[#1c1c1e] rounded-xl border border-gray-800 overflow-x-auto">
          {[
            ["friends", `My Friends (${friends.length})`],
            ["incoming", `Incoming (${incomingRequests.length})`],
            ["sent", `Sent (${sentRequests.length})`],
            ["add", "Add Friend"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-[#2c2c2e] text-white" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 min-h-[400px]">
          {activeTab === "friends" && (
            <div className="p-6">
              {friends.length === 0 ? (
                <EmptyState icon={<Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />} title="No friends yet" body="Search for a username to send your first friend request" />
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-[#2c2c2e] rounded-xl">
                      <PersonAvatar label={friend.displayName || friend.username} username={friend.username} online={friend.online} />
                      <button onClick={() => handleMessage(friend.username)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "incoming" && (
            <div className="p-6">
              {incomingRequests.length === 0 ? (
                <EmptyState icon={<UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />} title="No incoming requests" body="Friend requests will appear here" />
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-[#2c2c2e] rounded-xl">
                      <PersonAvatar label={request.displayName || request.username} username={request.username} />
                      <div className="flex items-center gap-2">
                        <button onClick={async () => { await acceptFriendRequest(request.id); await refresh(); }} className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button onClick={async () => { await declineFriendRequest(request.id); await refresh(); }} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20">
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="p-6">
              {sentRequests.length === 0 ? (
                <EmptyState icon={<Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />} title="No pending requests" body="Requests you send will appear here" />
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-[#2c2c2e] rounded-xl">
                      <PersonAvatar label={request.displayName || request.username} username={request.username} />
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "add" && (
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Search by username</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 bg-[#2c2c2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button onClick={handleSearch} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {searchResult ? (
                <div className="p-4 bg-[#2c2c2e] rounded-xl flex items-center justify-between">
                  <PersonAvatar label={searchResult.displayName || searchResult.username} username={searchResult.username} />
                  {requestSent ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#3a3a3c] text-gray-400 rounded-lg">
                      <Check className="w-4 h-4" />
                      Request Sent
                    </div>
                  ) : (
                    <button onClick={handleSendRequest} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                      <UserPlus className="w-4 h-4" />
                      Send Friend Request
                    </button>
                  )}
                </div>
              ) : (
                <EmptyState icon={<Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />} title="Search for friends by username" body="Enter a username above to find and add friends" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonAvatar({ label, username, online }: { label: string; username: string; online?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
          <span>{initials(label)}</span>
        </div>
        {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2c2c2e]"></div>}
      </div>
      <div>
        <p className="text-white">{label}</p>
        <p className="text-xs text-gray-400">@{username}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="text-center py-16">
      {icon}
      <p className="text-gray-400 mb-2">{title}</p>
      <p className="text-sm text-gray-500">{body}</p>
    </div>
  );
}
