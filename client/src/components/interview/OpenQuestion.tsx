import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined, RightOutlined } from '@ant-design/icons';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-4 rounded-3xl bg-gray-200 shadow-md max-w-fit">
    {[0, 0.2, 0.4].map((delay, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-gray-600 rounded-full"
        style={{
          animation: 'pulse-dots 1s infinite ease-in-out',
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

const ChatMessage = ({ text, isUser }) => {
  const messageStyle = {
    padding: '12px 18px',
    borderRadius: '22px',
    maxWidth: '75%',
    wordWrap: 'break-word',
    fontSize: '15px',
    backgroundColor: isUser ? '#f0f2f5' : '#e6e6e6',
    color: '#333',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div style={messageStyle}>{text}</div>
    </div>
  );
};

export default function OpenQuestion() {
  const [messages, setMessages] = useState([]);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showNextQuestionButton, setShowNextQuestionButton] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const hasFetchedInitial = useRef(false); // ✅ evita doble carga

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-dots {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchInitialQuestion = async () => {
      if (hasFetchedInitial.current) return;
      hasFetchedInitial.current = true;

      setIsBotTyping(true);
      await getQuestion();
      setIsBotTyping(false);
    };
    fetchInitialQuestion();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getQuestion = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}${import.meta.env.VITE_CHATINT_URL}`);
      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.question }]);
    } catch (e) {
      console.error(e);
    }
  };
  const sendAnswer = async (question, answer, topic) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL}${import.meta.env.VITE_CHATINT_ADVICE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, topic }),
      });
      return await response.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isInputDisabled) return;

    const lastQuestion = messages[messages.length - 1]?.text || '';
    const userMessage = { sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsInputDisabled(true);
    setIsBotTyping(true);

    const resp = await sendAnswer(lastQuestion, userMessage.text, 'fisica');
    setIsBotTyping(false);

    const botResponse = {
      sender: 'bot',
      text: resp?.coaching_advice || 'Hubo un problema.',
    };
    setMessages(prev => [...prev, botResponse]);
    setShowNextQuestionButton(true);
  };

  const handleNextQuestionClick = async () => {
    setMessages([]);
    setShowNextQuestionButton(false);
    setIsInputDisabled(true);
    setIsBotTyping(true);

    await getQuestion();
    setIsBotTyping(false);
    setIsInputDisabled(false);
  };

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {messages.map((msg, index) => (
          <ChatMessage key={index + msg.text} text={msg.text} isUser={msg.sender === 'user'} />
        ))}
        {isBotTyping && (
          <div className="flex justify-start mb-3">
            <TypingIndicator />
          </div>
        )}
        {showNextQuestionButton && (
          <div className="flex justify-center mt-4">
            <Button
              type="primary"
              size="large"
              onClick={handleNextQuestionClick}
              style={{
                borderRadius: '25px',
                height: '48px',
                padding: '0 24px',
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              Siguiente Pregunta <RightOutlined />
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!showNextQuestionButton && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              placeholder="Escribe tu respuesta..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
              disabled={isInputDisabled}
              size="large"
              style={{ borderRadius: '25px', marginRight: '15px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              style={{
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
