import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, X, Minimize2, Calendar } from 'lucide-react';
import { toggleChat, addMessage, setLoading } from '../../store/slices/chatSlice';

const ChatWidget = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { messages, isOpen, loading } = useSelector((state) => state.chat);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = (userMessage) => {
    const responses = {
      pregnancy: [
        "Pregnancy concerns are completely normal. If you think you might be pregnant, the most reliable way to know is through a pregnancy test. These are available at pharmacies and are most accurate when taken after a missed period.",
        "For pregnancy prevention, there are many effective contraceptive options including condoms, birth control pills, and IUDs. I'd recommend speaking with a healthcare provider to find the best option for you."
      ],
      contraception: [
        "There are many contraceptive options available, each with different effectiveness rates and considerations. Condoms are the only method that also protect against STIs, while hormonal methods like pills, patches, and IUDs are highly effective for pregnancy prevention.",
        "The best contraceptive method depends on your individual needs, health history, and preferences. A healthcare provider can help you choose the most suitable option."
      ],
      sti: [
        "STI prevention involves using barrier methods like condoms consistently and correctly, getting regular testing, and having open communication with partners about sexual health.",
        "Many STIs are treatable, especially when caught early. Regular testing is important because many STIs can be asymptomatic. Most healthcare providers offer confidential STI testing."
      ],
      periods: [
        "Menstrual cycles typically range from 21-35 days and can vary from person to person. Some irregularity is normal, especially during adolescence and approaching menopause.",
        "If you're experiencing significant changes in your menstrual cycle, severe pain, or other concerning symptoms, it's worth discussing with a healthcare provider."
      ],
      default: [
        "I understand you have questions about sexual health. While I can provide general information, it's always best to consult with a healthcare professional for personalized advice.",
        "Sexual health is an important part of overall wellness. If you have specific concerns or need medical advice, I'd recommend speaking with a qualified healthcare provider.",
        "Your question is important. For the most accurate and personalized information, consider booking a consultation with one of our healthcare professionals."
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy')) {
      return responses.pregnancy[Math.floor(Math.random() * responses.pregnancy.length)];
    } else if (lowerMessage.includes('contraception') || lowerMessage.includes('birth control') || lowerMessage.includes('condom')) {
      return responses.contraception[Math.floor(Math.random() * responses.contraception.length)];
    } else if (lowerMessage.includes('sti') || lowerMessage.includes('std') || lowerMessage.includes('infection')) {
      return responses.sti[Math.floor(Math.random() * responses.sti.length)];
    } else if (lowerMessage.includes('period') || lowerMessage.includes('menstruation') || lowerMessage.includes('cycle')) {
      return responses.periods[Math.floor(Math.random() * responses.periods.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    dispatch(addMessage(userMessage));

    // Clear input and show loading
    const userInput = inputMessage;
    setInputMessage('');
    dispatch(setLoading(true));

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        message: simulateAIResponse(userInput),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      dispatch(addMessage(aiResponse));
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
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => dispatch(toggleChat())}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">{t('chat.title')}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(toggleChat())}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch(toggleChat())}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Ask any question about sexual health.</p>
                <p className="text-xs mt-1">Your conversation is private and anonymous.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Connect to Doctor Button */}
          <div className="p-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm mb-3">
              <Calendar className="h-4 w-4 mr-2" />
              {t('chat.connect_doctor')}
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.placeholder')}
                className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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