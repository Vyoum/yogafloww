
import React, { useState, useRef, useEffect } from 'react';
import { Reveal } from './Reveal';
import { Search, Plus, MessageSquare, Users, Settings, Info, Send, Smile, Paperclip, X, FileText } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
  attachment?: { name: string; type: string };
}

interface Conversation {
  id: string;
  author: string;
  avatar: string;
  lastText: string;
  time: string;
  unreadCount?: number;
  isGroup?: boolean;
  members?: number;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: '1', author: 'Sarah Johnson', avatar: 'SJ', lastText: 'Of course! What would you like...', time: '1h', unreadCount: 1 },
  { id: '2', author: "Beginner's Circle", avatar: 'BC', lastText: 'I use the Manduka PROlite and...', time: '1h', unreadCount: 2, isGroup: true, members: 5 },
  { id: '3', author: 'Raj Patel', avatar: 'RP', lastText: "Keep practicing and you'll mast...", time: '2h' },
  { id: '4', author: 'Meditation & Mindfuln...', avatar: 'MM', lastText: 'I find guided meditations really...', time: '2h', unreadCount: 1, isGroup: true, members: 6 },
  { id: '5', author: 'Aradhna (Instructor)', avatar: 'AU', lastText: 'Great form today, everyone!', time: '4h' },
  { id: '6', author: 'Morning Flow Group', avatar: 'MF', lastText: 'Who is joining the 6:30 AM class?', time: '5h', isGroup: true, members: 12 },
];

const INITIAL_HISTORIES: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', sender: 'Sarah Johnson', avatar: 'SJ', text: "Hi! I was wondering if you recommend any specific props for the evening Nidra?", time: '12:30 PM', isMe: false },
    { id: 'm2', sender: 'Me', avatar: 'ME', text: "Definitely a bolster and a light eye mask. It makes a huge difference!", time: '12:35 PM', isMe: true },
    { id: 'm3', sender: 'Sarah Johnson', avatar: 'SJ', text: "Of course! What would you like to know about the eye masks?", time: '1:10 PM', isMe: false },
  ],
  '2': [
    { id: 'g1', sender: 'Beginner\'s Circle', avatar: 'BC', text: "Hey everyone, which mat are you all using? I'm looking to upgrade.", time: '1:00 PM', isMe: false },
  ],
};

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Direct' | 'Groups'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [chatHistories, setChatHistories] = useState(INITIAL_HISTORIES);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedId, chatHistories]);

  const handleSendMessage = () => {
    if ((!inputText.trim() && !attachedFile) || !selectedId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      avatar: 'ME',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachment: attachedFile || undefined
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage]
    }));

    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({ name: file.name, type: file.type });
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredConversations = INITIAL_CONVERSATIONS.filter(m => {
    if (activeTab === 'Direct') return !m.isGroup;
    if (activeTab === 'Groups') return m.isGroup;
    return true;
  }).filter(m => m.author.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedConversation = INITIAL_CONVERSATIONS.find(m => m.id === selectedId);
  const currentMessages = selectedId ? (chatHistories[selectedId] || []) : [];

  const commonEmojis = ['🙏', '🧘‍♀️', '✨', '🌿', '🕉️', '🔥', '💧', '🌙', '❤️', '🙌'];

  return (
    <div className="min-h-screen bg-teal-50/30 pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Reveal>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-4">Community</h1>
            <p className="text-slate-500 max-w-xl mx-auto font-light">
              Connect with fellow yogis, share experiences, and grow together.
            </p>
          </Reveal>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-teal-900/5 border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[750px] relative">
          
          {/* Sidebar */}
          <div className="w-full md:w-[320px] border-r border-slate-100 flex flex-col bg-white shrink-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-slate-900">Messages</h2>
                <button className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20">
                  <Plus size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mb-4">
                {(['All', 'Direct', 'Groups'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredConversations.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-4 group ${
                    selectedId === msg.id ? 'bg-teal-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold font-serif ${
                      msg.isGroup ? 'bg-orange-50 text-orange-600' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {msg.avatar}
                    </div>
                    {msg.unreadCount && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">
                        {msg.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{msg.author}</h4>
                      <span className="text-[10px] text-slate-300">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">
                      {msg.lastText}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-slate-50/30 relative">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-serif ${
                      selectedConversation.isGroup ? 'bg-orange-50 text-orange-600' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{selectedConversation.author}</h3>
                      <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">
                        {selectedConversation.isGroup ? 'Community Circle' : 'Direct Message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-300 hover:text-teal-600 transition-colors"><Info size={20} /></button>
                    <button className="p-2 text-slate-300 hover:text-teal-600 transition-colors"><Settings size={20} /></button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                   <div className="flex flex-col items-center mb-8">
                      <span className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today</span>
                   </div>

                   {currentMessages.map((msg) => (
                     <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                          msg.isMe ? 'bg-slate-900 text-white' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {msg.avatar}
                        </div>
                        <div className={`flex flex-col gap-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl border shadow-sm max-w-[85%] md:max-w-[70%] ${
                            msg.isMe 
                              ? 'bg-teal-600 border-teal-500 text-white rounded-tr-none' 
                              : 'bg-white border-slate-100 text-slate-600 rounded-tl-none'
                          }`}>
                            {msg.attachment && (
                              <div className={`flex items-center gap-3 p-3 mb-3 rounded-xl border ${msg.isMe ? 'bg-teal-500/30 border-teal-400/30' : 'bg-slate-50 border-slate-100'}`}>
                                <div className={`p-2 rounded-lg ${msg.isMe ? 'bg-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                                  <FileText size={18} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold truncate">{msg.attachment.name}</p>
                                  <p className={`text-[9px] opacity-60`}>{msg.attachment.type}</p>
                                </div>
                              </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 px-1">{msg.time}</span>
                        </div>
                     </div>
                   ))}
                   <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-slate-100 relative">
                  {/* Emoji Picker Placeholder */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-6 mb-2 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 grid grid-cols-5 gap-3 animate-fade-in-up z-20">
                      {commonEmojis.map(e => (
                        <button 
                          key={e} 
                          onClick={() => addEmoji(e)}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment Preview */}
                  {attachedFile && (
                    <div className="mb-4 flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-xl animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <FileText className="text-teal-600" size={18} />
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{attachedFile.name}</span>
                      </div>
                      <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="relative bg-slate-50 rounded-2xl p-2 flex items-center gap-2">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 transition-colors ${attachedFile ? 'text-teal-600' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                      <Paperclip size={20} />
                    </button>
                    <textarea 
                      rows={1}
                      placeholder="Type your message..." 
                      className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-slate-900 placeholder:text-slate-300 resize-none py-2 max-h-32"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 transition-colors ${showEmojiPicker ? 'text-teal-600' : 'text-slate-400 hover:text-teal-600'}`}
                    >
                      <Smile size={20} />
                    </button>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() && !attachedFile}
                      className={`p-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                        inputText.trim() || attachedFile ? 'bg-teal-600 text-white shadow-teal-600/20 hover:scale-105' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-8">
                  <MessageSquare size={32} className="text-teal-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Welcome to Community Chat</h3>
                <p className="text-slate-400 max-w-sm font-light">
                  Select a conversation from the sidebar to start chatting with fellow practitioners and instructors.
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Context (Desktop only) */}
          <div className="hidden lg:flex w-[280px] border-l border-slate-100 flex-col bg-white overflow-y-auto">
            <div className="p-8 flex flex-col items-center text-center">
              {selectedConversation ? (
                <>
                  <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-2xl font-bold font-serif ${
                    selectedConversation.isGroup ? 'bg-orange-50 text-orange-600' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {selectedConversation.avatar}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">{selectedConversation.author}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">
                    {selectedConversation.isGroup ? `${selectedConversation.members} Members Online` : 'Available to chat'}
                  </p>

                  <div className="w-full space-y-6 text-left pt-6 border-t border-slate-50">
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">About</h4>
                       <p className="text-xs text-slate-500 leading-relaxed">
                         {selectedConversation.isGroup 
                           ? "A collaborative space for all students in the 6-month transformation program to discuss techniques and progress."
                           : "Direct connection with your peer to share personal journey insights and support."
                         }
                       </p>
                    </div>
                    
                    <div className="space-y-3">
                       <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Shared Attachments</h4>
                       <div className="p-3 rounded-xl border border-slate-100 flex items-center gap-3 text-xs text-slate-500 opacity-60">
                          <FileText size={16} /> <span className="truncate">Morning_Routine.pdf</span>
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-20 flex flex-col items-center">
                  <Users size={48} className="text-slate-100 mb-6" />
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Context Panel</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
