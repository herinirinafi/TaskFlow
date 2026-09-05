import { Calendar, CheckSquare, MessageSquare, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useUiStore } from '@/store/ui.store';
import { formatDate, isOverdue } from '@/utils/format';
import { PRIORITY_LABELS, PRIORITY_STYLES } from '@/utils/constants';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  canManage: boolean;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, canManage, onOpen, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toast = useUiStore((s) => s.toast);

  const assignee =
    task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo : null;
  const projectName =
    task.project && typeof task.project === 'object' ? task.project.name : undefined;

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <div
      onClick={() => onOpen(task)}
      className="group card cursor-pointer p-3 transition hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge className={PRIORITY_STYLES[task.priority]}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        {canManage && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="rounded p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100"
              aria-label="Actions"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-20 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onEdit(task);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Pencil size={14} /> Modifier
                </button>
                <button
                  onClick={() => {
                    toast('info', 'Suppression…');
                    onDelete(task);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 font-medium text-slate-800">{task.title}</p>

      {projectName && <p className="mt-0.5 text-xs text-slate-400">{projectName}</p>}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${overdue ? 'font-medium text-red-500' : ''}`}>
              <Calendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.checklist.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
            </span>
          )}
          {task.tags && <span className="flex items-center gap-1"><MessageSquare size={12} /></span>}
        </div>
        {assignee ? (
          <Avatar firstName={assignee.firstName} lastName={assignee.lastName} size={24} />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-400">
            —
          </span>
        )}
      </div>
    </div>
  );
}