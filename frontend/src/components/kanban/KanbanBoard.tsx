import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Avatar } from '@/components/ui/Avatar';
import { STATUS_LABELS } from '@/utils/constants';
import type { Task, TaskStatus, User } from '@/types';

interface KanbanBoardProps {
  tasks: Task[];
  canManage: boolean;
  onMove: (taskId: string, status: TaskStatus, order: number) => Promise<void>;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onNewTask?: (status: TaskStatus) => void;
}

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

const COLUMN_STYLES: Record<TaskStatus, { dot: string; header: string }> = {
  TODO: { dot: 'bg-slate-400', header: 'text-slate-600' },
  IN_PROGRESS: { dot: 'bg-blue-500', header: 'text-blue-600' },
  DONE: { dot: 'bg-green-500', header: 'text-green-600' },
};

export function KanbanBoard({ tasks, canManage, onMove, onOpen, onEdit, onDelete, onNewTask }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order)}
          canManage={canManage}
          onMove={onMove}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onNewTask={onNewTask}
        />
      ))}
    </div>
  );
}

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  canManage: boolean;
  onMove: (taskId: string, status: TaskStatus, order: number) => Promise<void>;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onNewTask?: (status: TaskStatus) => void;
}

function KanbanColumn({ status, tasks, canManage, onMove, onOpen, onEdit, onDelete, onNewTask }: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);

    if (listRef.current) {
      const children = Array.from(listRef.current.children) as HTMLElement[];
      let index = tasks.length;
      for (let i = 0; i < children.length; i++) {
        const childRect = children[i].getBoundingClientRect();
        if (e.clientY < childRect.top + childRect.height / 2) {
          index = i;
          break;
        }
      }
      setHoverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setHoverIndex(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const index = hoverIndex ?? tasks.length;
    try {
      await onMove(taskId, status, index);
    } catch {
      // silencieux — les erreurs sont gérées en amont
    }
  };

  const assignees = [
    ...new Map(
      tasks
        .map((t) => t.assignedTo)
        .filter((a): a is User => typeof a === 'object' && a !== null)
        .map((a) => [a.id, a])
    ).values(),
  ];

  return (
    <div
      className={`flex flex-col rounded-xl border bg-slate-100/70 p-3 transition ${
        dragOver ? 'border-primary-400 ring-2 ring-primary-100' : 'border-slate-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={(e) => {
        if (!listRef.current?.contains(e.relatedTarget as Node)) {
          setDragOver(false);
          setHoverIndex(null);
        }
      }}
      onDrop={(e) => void handleDrop(e)}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm font-semibold ${COLUMN_STYLES[status].header}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${COLUMN_STYLES[status].dot}`} />
          {STATUS_LABELS[status]}
          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
            {tasks.length}
          </span>
        </div>

        {onNewTask && (
          <button
            onClick={() => onNewTask(status)}
            disabled={!canManage}
            className="rounded p-1 text-slate-400 transition hover:bg-white hover:text-primary-600 disabled:opacity-40"
            title="Nouvelle tâche"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div ref={listRef} className="min-h-24 flex-1 space-y-2">
        {tasks.map((task) => (
          <div
            key={task._id}
            draggable={canManage}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', task._id);
              e.dataTransfer.effectAllowed = 'move';
              setDraggingId(task._id);
            }}
            onDragEnd={() => setDraggingId(null)}
            className={`transition ${draggingId === task._id ? 'opacity-40' : ''}`}
          >
            <TaskCard
              task={task}
              canManage={canManage}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
        {hoverIndex !== null && (
          <div className="flex h-1 items-center rounded-full bg-primary-400">
            <span className="mx-auto h-3 w-1 rounded-full bg-primary-400" />
          </div>
        )}
        {tasks.length === 0 && !dragOver && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
            Déposez des tâches ici
          </div>
        )}
      </div>

      {assignees.length > 1 && (
        <div className="mt-3 flex -space-x-1.5 pl-1">
          {assignees.slice(0, 5).map((a) => (
            <Avatar key={a.id} firstName={a.firstName} lastName={a.lastName} size={22} className="ring-2 ring-slate-100" />
          ))}
          {assignees.length > 5 && (
            <span className="flex h-[22px] items-center justify-center rounded-full bg-white px-1.5 text-[10px] text-slate-500 ring-2 ring-slate-100">
              +{assignees.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}