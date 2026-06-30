import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiApi } from '../../services/api/aiApi';
import DashboardLayout from '../../layouts/DashboardLayout';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    try {
      let fullResponse = '';
      await aiApi.streamChat(userMsg, (token) => {
        fullResponse += token;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 'Sorry, there was an error communicating with Beatly AI.';
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-4 w-full">
      <div className="flex-1 overflow-y-auto bg-[#181818] rounded-xl p-6 mb-4 shadow-xl hide-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-4">🤖</span>
            <h2 className="text-xl font-bold text-white mb-2">Beatly AI Chat</h2>
            <p>Ask anything about your music taste, top genres, or listening streaks!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-[#1DB954] text-white rounded-br-none' : 'bg-[#282828] text-gray-200 rounded-bl-none'}`}>
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.role === 'assistant' && isStreaming && idx === messages.length - 1 && (
                    <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder="Ask Beatly AI..."
          className="flex-1 bg-[#282828] text-white rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#1DB954] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="bg-[#1DB954] text-black font-bold rounded-full px-8 py-4 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {isStreaming ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
