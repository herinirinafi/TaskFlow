import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { useTaskStore } from '@/store/task.store';
import { PRIORITY_STYLES, STATUS_LABELS } from '@/utils/constants';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar() {
  const navigate = useNavigate();
  const { tasks, loading, fetch } = useTaskStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    void fetch({ limit: 200 });
  }, [fetch]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const due = new Date(task.dueDate);
      const key = `${due.getFullYear()}-${due.getMonth()}-${due.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return map;
  }, [tasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const today = new Date();

  const goToToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  const shift = (delta: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendrier</h1>
          <p className="mt-1 text-sm text-slate-500">Visualisez toutes vos échéances mois par mois.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={goToToday}>Aujourd'hui</button>
          <button className="btn-secondary p-2" onClick={() => shift(-1)} aria-label="Mois précédent">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-32 text-center text-base font-semibold text-slate-800">{MONTHS[month]} {year}</span>
          <button className="btn-secondary p-2" onClick={() => shift(1)} aria-label="Mois suivant">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <InlineLoader label="Chargement du calendrier…" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
            {WEEKDAYS.map((d) => (
              <div key={d} className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                {d}
              </div>
            ))}

            {cells.map((date, i) =>
              date === null ? (
                <div key={`blank-${i}`} className="min-h-32 bg-white p-1.5" />
              ) : (
                <div
                  key={date.toISOString()}
                  className={`min-h-32 bg-white p-1.5 ${
                    isSameDay(date, today) ? 'bg-primary-50/60' : ''
                  }`}
                >
                  <p className={`text-xs font-semibold ${isSameDay(date, today) ? 'text-primary-700' : 'text-slate-500'}`}>
                    {date.getDate()}
                  </p>
                  <div className="mt-1 space-y-1">
                    {(tasksByDay.get(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`) ?? []).slice(0, 3).map((task) => (
                      <button
                        key={task._id}
                        onClick={() => navigate(`/tasks?task=${task._id}`)}
                        className={`block w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}
                        title={`${task.title} — ${STATUS_LABELS[task.status]}`}
                      >
                        {task.title}
                      </button>
                    ))}
                    {(tasksByDay.get(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)?.length ?? 0) > 3 && (
                      <p className="px-1 text-[10px] text-slate-400">
                        +{(tasksByDay.get(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)?.length ?? 0) - 3} autres
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {tasks.length === 0 && (
            <EmptyState
              icon={CalendarDays}
              title="Aucune échéance"
              message="Créez des tâches avec une date d'échéance pour les voir ici."
            />
          )}
        </>
      )}
    </div>
  );
}