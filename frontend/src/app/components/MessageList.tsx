import { formatDistanceToNow } from 'date-fns';

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.isCurrentUser
                ? 'bg-green-400 text-white'
                : 'bg-gray-200 text-gray-900'
            }`}
          >
            {!message.isCurrentUser && (
              <div className="font-semibold text-sm mb-1">{message.sender}</div>
            )}
            <div className="break-words">{message.text}</div>
            <div
              className={`text-xs mt-1 ${
                message.isCurrentUser ? 'text-green-50' : 'text-gray-500'
              }`}
            >
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}