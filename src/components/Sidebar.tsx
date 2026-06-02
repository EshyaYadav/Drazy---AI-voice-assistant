import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, AssistantId, AppTheme } from '../types';
import { ASSISTANTS } from '../lib/assistants';
import { AssistantAvatar } from './AssistantAvatar';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  assistantId: AssistantId;
  theme: AppTheme;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onAssistantChange: (id: AssistantId) => void;
  onToggleTheme: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  assistantId,
  theme,
  onSelect,
  onNew,
  onDelete,
  onAssistantChange,
  onToggleTheme,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState<string | null>(null);

  return (
    <motion.div
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-black/30 border-r border-white/8 overflow-hidden shrink-0"
    >
      <div className="flex items-center justify-between px-3 pt-4 pb-2 gap-2">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-semibold text-white/80 pl-1 truncate"
          >
            Conversations
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex gap-1.5 p-1 rounded-xl bg-white/5">
            {(Object.keys(ASSISTANTS) as AssistantId[]).map((id) => {
              const a = ASSISTANTS[id];
              return (
                <button
                  key={id}
                  onClick={() => onAssistantChange(id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200',
                    assistantId === id
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/8',
                  )}
                >
                  <AssistantAvatar assistantId={id} size="sm" className="w-5 h-5 text-xs" />
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-2 pb-2">
        <button
          onClick={onNew}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200',
            collapsed && 'justify-center px-0',
          )}
          title="New conversation"
        >
          <Plus size={16} className="shrink-0" />
          {!collapsed && <span>New conversation</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        <AnimatePresence initial={false}>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'group relative flex items-center gap-2 px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
                activeId === conv.id
                  ? 'bg-white/12 text-white'
                  : 'text-white/50 hover:bg-white/6 hover:text-white/80',
                collapsed && 'justify-center',
              )}
              onClick={() => onSelect(conv.id)}
              onMouseEnter={() => setHoveredDelete(conv.id)}
              onMouseLeave={() => setHoveredDelete(null)}
            >
              <MessageSquare size={14} className="shrink-0 opacity-60" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-xs truncate leading-snug">{conv.title}</span>
                  {hoveredDelete === conv.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="shrink-0 p-1 rounded-md hover:bg-white/15 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className={cn('px-2 py-3 border-t border-white/8 flex', collapsed ? 'justify-center' : 'justify-end')}>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </motion.div>
  );
}
