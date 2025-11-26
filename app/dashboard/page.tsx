"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  ScrollShadow,
  Avatar,
} from "@heroui/react";
import { ChatbotService, ChatMessage, QUICK_ACTIONS } from "@/lib/chatbot/chatbot-service";
import { useStore } from "@/lib/storage";

export default function DashboardPage() {
  const initialized = useStore((state) => state.initialized);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Qinfinity AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotService = useRef(new ChatbotService());

  useEffect(() => {
    if (!initialized) {
      useStore.getState().initialize();
    }
  }, [initialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (query?: string) => {
    const userQuery = query || input.trim();
    if (!userQuery) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userQuery,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get AI response
    const response = await chatbotService.current.processQuery(userQuery);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    handleSend(query);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .split("\n")
      .map((line) => {
        // Bullet points
        if (line.trim().startsWith("•")) {
          return `<div class="ml-4">${line}</div>`;
        }
        return line || "<br />";
      })
      .join("<br />");
    return formatted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">
            Your AI-powered assistant for all organizational information
          </p>
        </div>
      </div>

      {/* Chatbot Interface */}
      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardBody className="flex flex-col p-0 h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-default-200">
            <div className="flex items-center gap-3">
              <Avatar
                src="https://i.pravatar.cc/150?u=ai"
                className="w-10 h-10"
                name="AI"
              />
              <div>
                <h3 className="font-semibold">Qinfinity AI Assistant</h3>
                <p className="text-xs text-default-500">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollShadow className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar
                    src="https://i.pravatar.cc/150?u=ai"
                    className="w-8 h-8 flex-shrink-0"
                    name="AI"
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-default-100 text-default-900"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content),
                    }}
                    className="text-sm whitespace-pre-wrap"
                  />
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <Avatar
                    className="w-8 h-8 flex-shrink-0"
                    name="You"
                    getInitials={(name) => "U"}
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar
                  src="https://i.pravatar.cc/150?u=ai"
                  className="w-8 h-8 flex-shrink-0"
                  name="AI"
                />
                <div className="bg-default-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-default-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-default-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 bg-default-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollShadow>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 border-t border-default-200 pt-2">
              <p className="text-xs text-default-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.slice(0, 4).map((action) => (
                  <Chip
                    key={action.id}
                    size="sm"
                    variant="flat"
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    {action.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-default-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything..."
                size="md"
                classNames={{
                  input: "text-sm",
                }}
                endContent={
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleSend()}
                    isDisabled={!input.trim() || isLoading}
                    aria-label="Send message"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                }
              />
            </div>
            {/* More Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_ACTIONS.slice(4).map((action) => (
                <Chip
                  key={action.id}
                  size="sm"
                  variant="flat"
                  className="cursor-pointer hover:bg-primary/20 text-xs"
                  onClick={() => handleQuickAction(action.query)}
                >
                  {action.label}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

