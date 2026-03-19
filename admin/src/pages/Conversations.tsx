import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Phone, Globe, Clock, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  id: number;
  session_id: string;
  history: Message[];
  created_at: string;
}

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/conversations`);
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversation List */}
      <div className="w-1/3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-card-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recent Logs
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {conversations.map((convo) => {
            const isVoice = convo.session_id.startsWith('voice_');
            const messageCount = convo.history?.length || 0;
            const isSelected = selectedConvo?.id === convo.id;
            
            return (
              <button
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-primary/5 border-primary shadow-sm' 
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {isVoice ? <Phone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    {isVoice ? 'Voice Call' : 'Web Chat'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(convo.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground truncate">
                  {convo.session_id}
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {messageCount} messages
                </div>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Conversation Details */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {selectedConvo ? (
          <>
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-card-foreground">Transcript Details</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedConvo.session_id}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                {new Date(selectedConvo.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
              {selectedConvo.history?.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-card border border-border text-card-foreground rounded-tl-sm'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wider">
                      {msg.role === 'user' ? 'Student' : 'AI Agent'}
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {(!selectedConvo.history || selectedConvo.history.length === 0) && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No messages in this transcript.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>Select a conversation from the list to view the transcript</p>
          </div>
        )}
      </div>
    </div>
  );
}