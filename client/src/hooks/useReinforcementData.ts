import { useState, useRef, useEffect } from "react";
import apiClient from "../api/apiClient";
import useClasses from "./useClasses";

interface Message {
  text: string;
  sender: "user" | "bot";
}

interface ChatWithIARequest {
  question: string;
}

export const useChatLogic = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?",
            sender: "bot",
          },
        ]);
        setIsTyping(false);
      }, 3000);
    }
  }, [isChatOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatClick = () => {
    setIsChatOpen(true);
  };

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length < 1) {
      console.warn("El mensaje debe tener al menos 1 carácter.");
      return;
    }
    const userMessage: Message = { text: trimmed, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    try {
      const response = await apiClient.post(
        "/chat",
        { question: trimmed } as ChatWithIARequest
      );
      setMessages(prev => [
        ...prev,
        { text: response.data.answer, sender: "bot" },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          text: "Lo siento, hubo un error al obtener la respuesta.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return {
    isChatOpen,
    handleChatClick,
    setIsChatOpen,
    isTyping,
    messages,
    inputValue,
    messagesEndRef,
    handleSendMessage,
    setInputValue,
    handleKeyPress,
  };
};

interface ProgressData {
  subjectName: string;
  lastExamDate: string;
  successRate: number;
  lastExamScore: number;
  trendData: number[];
}

export function useProgressData(classId?: string): ProgressData {
  const { actualClass, fetchClassById } = useClasses();

  const fallbackData: ProgressData = {
    subjectName: "Materia de prueba",
    lastExamDate: "14/08/2025",
    successRate: 80,
    lastExamScore: 80,
    trendData: [60, 85, 95, 75, 88, 92, 80, 70, 90, 82, 98, 87],
  };

  const [data, setData] = useState<ProgressData>(fallbackData);

  useEffect(() => {
    if (!classId) return;
    fetchClassById(classId);
  }, [classId, fetchClassById]);

  useEffect(() => {
    if (!classId) return;
    const name = actualClass?.name?.trim();
    if (name) {
      setData({
        subjectName: name,
        lastExamDate: "14/08/2025",
        successRate: 80,
        lastExamScore: 80,
        trendData: [60, 85, 95, 75, 88, 92, 80, 70, 90, 82, 98, 87],
      });
    } else {
      setData(fallbackData);
    }
  }, [actualClass, classId]);

  return data;
}
