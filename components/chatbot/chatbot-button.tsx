"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { Chatbot } from "./chatbot";

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        isIconOnly
        color="primary"
        size="lg"
        className="fixed bottom-6 right-6 z-40 shadow-lg"
        onPress={() => setIsOpen(true)}
        aria-label="Open AI assistant"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </Button>
      <Chatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

