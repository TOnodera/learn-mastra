"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" })
  });

  const handleSubmit = () => {
    if (!input.trim()) {
      return;
    }
    sendMessage({ text: input });
    setInput("");
  };
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <Card className="flex-1 overflow-y-auto p-4 mb-4">
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={cn("flex", m.role === "user" && "justify-end")}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2 max-w-[80%]",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {m.parts?.map((part, i) =>
                  part.type === "text" ? <span key={i}>{part.text}</span> : null
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="メッセージを入力..."
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={status !== "ready"}>
          送信
        </Button>
      </div>
    </div>
  );
}
