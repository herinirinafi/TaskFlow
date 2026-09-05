import {
  Calendar,
  CheckSquare,
  Flag,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { commentService } from '@/services';
import { useTaskStore } from '@/store/task.store';
import { useUiStore } from '@/store/ui.store';
import { formatDateTime, isOverdue, timeAgo } from '@/utils/format';
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS } from '@/utils/constants';
import type { Comment, Task } from '@/types';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  canManage: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskDetailModal({ task, onClose, canManage, onEdit, onDelete }: TaskDetailModalProps) {
  const updateStatus = useTaskStore((s) => s.updateStatus);
  const addChecklistItem = useTaskStore((s) => s.addChecklistItem);
  const updateChecklistItem = useTaskStore((s) => s.updateChecklistItem);
  const removeChecklistItem = useTaskStore((s) => s.removeChecklistItem);
  const toast = useUiStore((s) => s.toast);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [newItem, setNewItem] = useState('');
  const [busy, setBusy] = useState(false);

  const assignee =
    task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo : null;
  const creator = task.createdBy && typeof task.createdBy === 'object' ? task.createdBy : null;

  useEffect(() => {
    commentService
      .list(task._id)
      .then((r) => setComments(r.items))
      .catch(() => setComments([]));
  }, [task._id]);

  const handleStatus = async (status: string) => {
    try {
      await updateStatus(task._id, status);
      toast('success', `Tâche déplacée vers « ${STATUS_LABELS[status]} »`);
    } catch {
      toast('error', 'Impossible de mettre à jour le statut');
    }
  };

  const toggleChecklist = async (itemId: string, completed: boolean) => {
    try {
      await updateChecklistItem(task._id, itemId, { completed });
    } catch {
      toast('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      await addChecklistItem(task._id, newItem.trim());
      setNewItem('');
    } catch {
      toast('error', 'Erreur lors de l’ajout');
    }
  };

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || busy) return;
    setBusy(true);
    try {
      const created = await commentService.create(task._id, commentText.trim());
      setComments((c) => [created, ...c]);
      setCommentText('');
    } catch {
      toast('error', 'Impossible d’ajouter le commentaire');
    } finally {
      setBusy(false);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await commentService.remove(id);
      setComments((c) => c.filter((x) => x._id !== id));
    } catch {
      toast('error', 'Impossible de supprimer le commentaire');
    }
  };

  const doneCount = task.checklist.filter((c) => c.completed).length;
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <Modal open onClose={onClose} title={task.title} size="lg">
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={PRIORITY_STYLES[task.priority]}>
            <Flag size={11} className="mr-1" />
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          <StatusSelect value={task.status} onChange={(s) => void handleStatus(s)} disabled={!canManage} />
          {task.tags?.map((tag) => (
            <span key={tag} className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span>
              Échéance :{' '}
              <span className={overdue ? 'font-semibold text-red-600' : ''}>
                {formatDateTime(task.dueDate)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {assignee ? (
              <>
                <Avatar firstName={assignee.firstName} lastName={assignee.lastName} size={24} />
                <span>{assignee.firstName} {assignee.lastName}</span>
              </>
            ) : (
              <span className="text-slate-400">Non assigné</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-slate-400" />
            <span>{comments.length} commentaire(s)</span>
          </div>
        </div>

        {task.description && (
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <p className="mb-1 font-medium text-slate-800">Description</p>
            <p className="whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Checklist */}
        {task.checklist.length > 0 || canManage ? (
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
              <CheckSquare size={15} className="text-slate-400" />
              Checklist ({doneCount}/{task.checklist.length})
            </p>
            <div className="space-y-1.5">
              {task.checklist.map((item) => (
                <div key={item._id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => void toggleChecklist(item._id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                    disabled={!canManage}
                  />
                  <span className={`flex-1 text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.text}
                  </span>
                  {canManage && (
                    <button
                      onClick={() => {
                        void removeChecklistItem(task._id, item._id).catch(() =>
                          toast('error', 'Erreur lors de la suppression')
                        );
                      }}
                      className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {canManage && (
              <form onSubmit={(e) => void handleAddItem(e)} className="mt-2 flex gap-2">
                <input
                  className="input"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Ajouter un élément…"
                />
                <button type="submit" className="btn-secondary shrink-0 px-3">
                  <Plus size={15} />
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* Commentaires */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-800">Discussion</p>
          <form onSubmit={(e) => void handleComment(e)} className="mb-4 flex gap-2">
            <input
              className="input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire…"
            />
            <button type="submit" className="btn-primary shrink-0 px-3" disabled={busy || !commentText.trim()}>
              <Send size={15} />
            </button>
          </form>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Aucun commentaire pour le moment.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar firstName={comment.author?.firstName} lastName={comment.author?.lastName} size={32} />
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {comment.author?.firstName} {comment.author?.lastName}
                        <span className="ml-2 text-xs font-normal text-slate-400">{timeAgo(comment.createdAt)}</span>
                      </p>
                      <button
                        onClick={() => void deleteComment(comment._id)}
                        className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 hover:opacity-100"
                        aria-label="Supprimer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="text-xs text-slate-400">
              Créée {creator ? `par ${creator.firstName}` : ''}{' '}
              {task.createdAt ? `le ${formatDateTime(task.createdAt)}` : ''}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button className="btn-secondary" onClick={() => onEdit(task)}>
                  <Pencil size={14} /> Modifier
                </button>
              )}
              {onDelete && (
                <button className="btn-danger" onClick={() => onDelete(task)}>
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function StatusSelect({ value, onChange, disabled }: { value: string; onChange: (s: string) => void; disabled?: boolean }) {
  const styles: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-700 border-slate-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
    DONE: 'bg-green-100 text-green-700 border-green-300',
  };
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none ${styles[value]} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {Object.entries(STATUS_LABELS)
        .filter(([k]) => ['TODO', 'IN_PROGRESS', 'DONE'].includes(k))
        .map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
    </select>
  );
}