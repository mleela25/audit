import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { Student } from '../../types';

interface AIInsightsDashboardProps {
  isAdmin: boolean;
  currentStudent?: Student | null;
  students: Student[];
}

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ts: number;
};

export default function AIInsightsDashboard({ isAdmin, currentStudent, students }: AIInsightsDashboardProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm1',
      role: 'assistant',
      content: isAdmin
        ? 'Hi! I am your AI Insights assistant. Ask me about attendance, tests, or quick student summaries.'
        : `Hi${currentStudent ? ` ${currentStudent.name}` : ''}! I can help you understand your progress and upcoming tasks.`,
      ts: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const studentIndexById = useMemo(() => {
    const map: Record<string, Student> = {};
    students.forEach(s => { map[s.id] = s; });
    return map;
  }, [students]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const addMessage = (role: ChatMessage['role'], content: string) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role, content, ts: Date.now() }
    ]);
  };

  const callServerAI = async (prompt: string) => {
    try {
      const messages = [{ role: 'user', content: prompt }];
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
  
      // If not ok, read text and throw it so it surfaces in UI or console
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
  
      const data = await res.json();
      if (data?.content) return data.content as string;
      throw new Error('Invalid payload from server');
    } catch (err) {
      console.error('callServerAI error:', err);
      // fallback to local simulation if server not running or error
      return await simulateAIResponse(prompt);
    }
  };
  

  const simulateAIResponse = async (prompt: string) => {
    // Very simple heuristic responses for demo purposes
    const lower = prompt.toLowerCase();

    // Example: summary for a specific student
    const matchByName = students.find(s => lower.includes(s.name.toLowerCase()));
    if (matchByName) {
      return `Summary for ${matchByName.name} (Grade ${matchByName.grade}, ${matchByName.school}):\n- Attendance: good (demo)\n- Upcoming tests: 2 (demo)\n- Focus areas: Algebra, Reading comprehension (demo)`;
    }

    // Example: general summary
    if (lower.includes('summary') || lower.includes('overview')) {
      return `Currently tracking ${students.length} students.\nTop notes (demo):\n- Average attendance trending up this week\n- 3 tests scheduled in the next 7 days\n- Paper checks pending in 2 batches`;
    }

    // Example: attendance question
    if (lower.includes('attendance')) {
      return `Attendance insights (demo):\n- Overall: 92% this week\n- Notable dips: Friday last week\n- Suggestion: Send reminders for first period classes`;
    }

    // Example: tests
    if (lower.includes('test') || lower.includes('exam')) {
      return `Test insights (demo):\n- 2 upcoming tests: Science (Tue), Math (Fri)\n- Avg. last score: 78%\n- Suggestion: Practice papers for weak areas`;
    }

    // Fallback generic
    return "I'm here to help with student summaries, attendance, tests, and quick insights. Ask me something like: 'Give me a summary for Riya', or 'attendance insights this week'.";
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setSending(true);

    // Simulated latency
    await new Promise(r => setTimeout(r, 600));
    const reply = await callServerAI(userText);
    addMessage('assistant', reply);
    setSending(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Intro Banner */}
      <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-200 rounded-2xl flex items-start">
        <div className="mr-3 p-2 bg-purple-600 rounded-lg text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
          <p className="text-sm text-gray-600 mt-1">Chat with an assistant to get quick summaries, attendance trends, and recommendations.</p>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={
                m.role === 'user'
                  ? 'max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow'
                  : 'max-w-[75%] bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-200'
              }>
                <div className="flex items-center mb-1 text-xs opacity-80">
                  {m.role === 'user' ? <UserIcon className="h-3.5 w-3.5 mr-1" /> : <Bot className="h-3.5 w-3.5 mr-1" />}
                  <span>{m.role === 'user' ? (isAdmin ? 'Admin' : 'You') : 'AI'}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-[75%] bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-200">
                <div className="flex items-center mb-1 text-xs opacity-80">
                  <Bot className="h-3.5 w-3.5 mr-1" />
                  <span>AI</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="mt-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a summary, attendance, or tests..."
            className="flex-1 px-3 py-2 rounded-xl focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="ml-2 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2"></p>
      </div>
    </div>
  );
}


