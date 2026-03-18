// Faithful recreation of Claudette's MessageBubble for hype reel
// Uses exact same Tailwind classes and structure from MessageBubble.tsx

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolCallCard } from "./ToolCallCard";
import type { MockMessage } from "../../mocks/mockData";

interface MessageBubbleProps {
  message: MockMessage;
  isStreaming?: boolean;
  isOldMessage?: boolean;
}

export function MessageBubble({ message, isStreaming, isOldMessage }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const toolCalls = message.toolCalls || [];

  return (
    <div className="flex gap-2 min-w-0">
      <div className="flex-1 min-w-0">
        {isUser ? (
          // User messages - left border accent with subtle background
          <div className="border-l-2 border-blue-500 pl-3 py-1 bg-blue-500/5">
            <p className="whitespace-pre-wrap text-claude-text font-mono text-base pr-8">
              {message.content}
            </p>
          </div>
        ) : (
          // Assistant messages - render content blocks
          <div className="space-y-2">
            {message.interrupted && (
              <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border-l-2 border-amber-500 text-amber-400 text-xs font-mono">
                <span style={{ letterSpacing: '0.05em' }}>INTERRUPTED</span>
              </div>
            )}

            {message.contentBlocks && message.contentBlocks.length > 0 ? (
              message.contentBlocks.map((block, blockIndex) => {
                if (block.type === 'tool_use' && block.toolCallId) {
                  const toolCall = toolCalls.find(tc => tc.id === block.toolCallId);
                  if (toolCall) {
                    return (
                      <ToolCallCard
                        key={toolCall.id}
                        toolCall={toolCall}
                        isStreaming={isStreaming}
                        defaultCollapsed={isOldMessage}
                      />
                    );
                  }
                  return null;
                } else if (block.type === 'text' && block.text) {
                  return (
                    <div key={`text-${blockIndex}`}>
                      <div
                        className="prose prose-invert max-w-none font-mono text-claude-text pr-12 break-words"
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isBlock = String(children).includes('\n') || match;
                              if (isBlock) {
                                return (
                                  <div className="overflow-hidden border border-claude-border my-2" style={{ borderRadius: 0 }}>
                                    {match && (
                                      <div className="px-2 py-1 text-xs font-bold font-mono bg-claude-surface border-b border-claude-border text-claude-text-secondary" style={{ letterSpacing: '0.05em' }}>
                                        {match[1].toUpperCase()}
                                      </div>
                                    )}
                                    <pre className="p-3 bg-claude-bg m-0 whitespace-pre-wrap break-words">
                                      <code className="text-sm font-mono text-claude-text" {...props}>{children}</code>
                                    </pre>
                                  </div>
                                );
                              }
                              return (
                                <code className="px-1 py-0.5 text-sm font-mono bg-claude-surface text-claude-accent" style={{ borderRadius: 0 }} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p({ children }) { return <p className="my-1 leading-relaxed">{children}</p>; },
                            ul({ children }) { return <ul className="my-1 ml-6 pl-0 list-disc list-outside">{children}</ul>; },
                            ol({ children }) { return <ol className="my-1 ml-6 pl-0 list-decimal list-outside">{children}</ol>; },
                            li({ children }) { return <li className="my-0.5 ml-0 pl-1">{children}</li>; },
                            strong({ children }) { return <strong className="font-bold text-claude-text">{children}</strong>; },
                          }}
                        >
                          {block.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              // Fallback: render tool calls then content
              <>
                {toolCalls.map(toolCall => (
                  <ToolCallCard
                    key={toolCall.id}
                    toolCall={toolCall}
                    isStreaming={isStreaming}
                    defaultCollapsed={isOldMessage}
                  />
                ))}
                {message.content && (
                  <div className="prose prose-invert max-w-none font-mono text-claude-text pr-12 break-words" style={{ overflowWrap: 'anywhere' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 font-mono text-claude-text-secondary ${isUser ? 'text-right' : ''}`}>
          {isStreaming ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 animate-pulse bg-claude-accent" style={{ borderRadius: 0 }} />
              <span style={{ letterSpacing: '0.05em' }}>TYPING...</span>
            </span>
          ) : (
            <span style={{ letterSpacing: '0.02em' }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
