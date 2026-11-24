import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Terminal,
  ArrowUpRight,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  MessageSquare,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Mail,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ChatMessage, ChatThread, SuggestedPrompt, ToolExecution } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { formatTime, formatCurrency } from '../utils/formatters';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export const AssistantPage: React.FC = () => {
  const { profile } = useUser();
  const { toast } = useToast();
  const location = useLocation();
  const queuedPrompt = (location.state as { initialPrompt?: string } | null)?.initialPrompt;
  const lastHandledPrompt = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('th_daily_brief');
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiService.getChatThreads(),
      apiService.getChatMessages(activeThreadId),
      apiService.getSuggestedPrompts(),
    ]).then(
      ([threadsData, messagesData, promptsData]) => {
        if (!active) return;
        setThreads(threadsData);
        setMessages(messagesData);
        setSuggestedPrompts(promptsData);
      },
      (error) => { if (active) console.error('Failed to load chat data', error); },
    );
    return () => { active = false; };
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isThinking) return;

    setInputMessage('');
    setIsThinking(true);

    try {
      await apiService.sendMessage(activeThreadId, text);
      const updatedMessages = await apiService.getChatMessages(activeThreadId);
      setMessages(updatedMessages);
      toast({
        title: 'Task executed',
        description: 'Homingo processed response with verified context.',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to send message', err);
      toast({ title: 'Error processing message', type: 'critical' });
    } finally {
      setIsThinking(false);
    }
  };

  const sendQueuedPrompt = useEffectEvent((prompt: string) => {
    if (isThinking) setInputMessage(prompt);
    else void handleSend(prompt);
  });

  useEffect(() => {
    if (!queuedPrompt || lastHandledPrompt.current === location.key) return;
    lastHandledPrompt.current = location.key;
    sendQueuedPrompt(queuedPrompt);
  }, [location.key, queuedPrompt]);

  const toggleToolExpand = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVoice = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      toast({ title: 'Voice Input Active', description: 'Listening...', type: 'info' });
      setTimeout(() => {
        setInputMessage('Check my important emails and find my pending refunds.');
        setIsVoiceActive(false);
      }, 1800);
    } else {
      setIsVoiceActive(false);
    }
  };

  return (
    <div className="flex min-h-[480px] h-[calc(100dvh-7.25rem)] flex-col lg:flex-row gap-3 overflow-hidden">
      {threads.length > 0 && (
        <div className="flex items-center gap-2 lg:hidden">
          <label htmlFor="chat-conversation" className="shrink-0 text-xs font-semibold">Conversation</label>
          <select
            id="chat-conversation"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={activeThreadId}
            onChange={(event) => setActiveThreadId(event.target.value)}
          >
            {threads.map((thread) => <option key={thread.id} value={thread.id}>{thread.title}</option>)}
          </select>
        </div>
      )}

      {/* 1. Left Sidebar: Conversation Threads */}
      <div className="hidden lg:flex w-72 flex-col rounded-2xl border transition-all p-3.5 bg-white border-slate-200/90 shadow-sm dark:bg-slate-900/60 dark:border-slate-800/80 dark:backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 px-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Conversations
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            onClick={() => {
              toast({ title: 'New Conversation Created', type: 'info' });
            }}
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            New
          </Button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 pr-1">
          {threads.map((thread) => {
            const isActive = activeThreadId === thread.id;
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold shadow-xs dark:bg-slate-800 dark:text-white dark:border-slate-700'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs truncate">{thread.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatTime(thread.updatedAt)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {thread.lastMessageSnippet}
                </p>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. Main Chat Workspace */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border transition-all overflow-hidden bg-white border-slate-200/90 shadow-sm dark:bg-slate-900/60 dark:border-slate-800/80 dark:backdrop-blur-md">
        {/* Chat Header */}
        <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Homingo Assistant
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
Ask about your shop’s mail, bills and calendar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm" dot>
              Ready
            </Badge>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id || index} className="flex justify-center my-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-400">
                    <Terminal className="w-3 h-3 text-indigo-500" />
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-500/40 dark:text-indigo-400 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[75%] space-y-2 ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm shadow-indigo-600/20'
                        : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs dark:bg-slate-800/90 dark:border-slate-700/70 dark:text-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>

                  {/* Inline Tool Execution Cards */}
                  {!isUser && msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                    <div className="w-full space-y-1.5 pt-1">
                      {msg.toolsExecuted.map((tool, tIdx) => {
                        const toolKey = `${msg.id}_tool_${tIdx}`;
                        const isExpanded = expandedTools[toolKey];
                        return (
                          <div
                            key={tIdx}
                            className="rounded-xl border text-[11px] overflow-hidden bg-white border-slate-200 dark:bg-slate-900/90 dark:border-slate-800"
                          >
                            <button
                              type="button"
                              onClick={() => toggleToolExpand(toolKey)}
                              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span className="font-mono text-indigo-700 dark:text-indigo-300 font-medium">
                                  {tool.toolName}
                                </span>
                                <Badge variant="success" size="sm">
                                  {tool.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                                {tool.durationMs && <span>{tool.durationMs}ms</span>}
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="p-3 border-t font-mono text-[10px] space-y-2 bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800/80">
                                {tool.input && (
                                  <div>
                                    <span className="text-slate-400 block mb-0.5">Input:</span>
                                    <pre className="text-slate-700 dark:text-slate-300 overflow-x-auto p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                      {JSON.stringify(tool.input, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {tool.output && (
                                  <div>
                                    <span className="text-slate-400 block mb-0.5">Output:</span>
                                    <pre className="text-emerald-700 dark:text-emerald-300 overflow-x-auto p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                      {JSON.stringify(tool.output, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-mono px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Streaming Indicator */}
          {isThinking && (
            <div className="flex gap-3 items-center text-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-500/40 dark:text-indigo-400">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/60">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="font-mono text-xs text-indigo-700 dark:text-indigo-300">
                  Homingo is analyzing context and consulting connected services...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              Suggested:
            </span>
            {suggestedPrompts.map((sug) => (
              <button
                key={sug.id}
                type="button"
                onClick={() => handleSend(sug.prompt)}
                className="shrink-0 px-3 py-1 rounded-full border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60 dark:hover:text-white"
              >
                <span>{sug.title}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                aria-label="Message Homingo"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Homingo (e.g., 'Check my important emails', 'Find my pending refunds')..."
                className="w-full rounded-2xl border px-4 py-3 pr-12 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all bg-slate-50 border-slate-300/80 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-100 dark:placeholder:text-slate-500"
                disabled={isThinking}
              />
              <button
                type="button"
                onClick={toggleVoice}
                title={isVoiceActive ? 'Stop listening' : 'Start voice input'}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                  isVoiceActive
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputMessage.trim() || isThinking}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="h-11 sm:px-5"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
