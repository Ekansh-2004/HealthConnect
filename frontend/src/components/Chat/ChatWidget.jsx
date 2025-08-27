import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Send, X, Minimize2, Calendar } from 'lucide-react';
import { toggleChat, addMessage, setLoading } from '../../store/slices/chatSlice';

const ChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, isOpen, loading } = useSelector(state => state.chat);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAIResponse = (userMessage) => {
    const responses = {
      pregnancy: [
        "Pregnancy concerns are normal. The most reliable way is a test after a missed period.",
        "Many contraceptive options exist. Consult a provider for the best method."
      ],
      contraception: [
        "Condoms protect against STIs, hormonal methods prevent pregnancy effectively.",
        "A healthcare provider can help choose the best contraceptive method."
      ],
      sti: [
        "STI prevention involves condoms, regular testing, and open communication.",
        "Early detection is key. Most STIs are treatable."
      ],
      periods: [
        "Cycles vary 21-35 days; irregularity can be normal.",
        "Seek a provider if experiencing severe changes or pain."
      ],
      default: [
        "I can provide general info, but consult a healthcare professional for personalized advice.",
        "Sexual health is important; consider professional guidance."
      ]
    };

    const msg = userMessage.toLowerCase();
    if (msg.includes('pregnant') || msg.includes('pregnancy')) return responses.pregnancy[Math.floor(Math.random() * responses.pregnancy.length)];
    if (msg.includes('contraception') || msg.includes('birth control') || msg.includes('condom')) return responses.contraception[Math.floor(Math.random() * responses.contraception.length)];
    if (msg.includes('sti') || msg.includes('std') || msg.includes('infection')) return responses.sti[Math.floor(Math.random() * responses.sti.length)];
    if (msg.includes('period') || msg.includes('menstruation') || msg.includes('cycle')) return responses.periods[Math.floor(Math.random() * responses.periods.length)];
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    dispatch(addMessage(userMessage));
    const userInput = inputMessage;
    setInputMessage('');
    dispatch(setLoading(true));

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        message: simulateAIResponse(userInput),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      dispatch(addMessage(aiMessage));
      dispatch(setLoading(false));
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => dispatch(toggleChat())}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Sexual Health Chat</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => dispatch(toggleChat())} className="p-1 hover:bg-blue-700 rounded">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={() => dispatch(toggleChat())} className="p-1 hover:bg-blue-700 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Ask any question about sexual health.</p>
                <p className="text-xs mt-1">Your conversation is private and anonymous.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Connect to Doctor */}
          <div className="p-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm mb-3">
              <Calendar className="h-4 w-4 mr-2" />
              Connect with a Doctor
            </button>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
