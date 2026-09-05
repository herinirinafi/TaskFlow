import mongoose, { Schema, Document } from 'mongoose';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ChecklistItem {
  _id: mongoose.Types.ObjectId;
  text: string;
  completed: boolean;
}

export interface TaskDocument extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  tags: string[];
  checklist: ChecklistItem[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const checklistItemSchema = new Schema<ChecklistItem>(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: false }
);

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: [true, 'Le titre est requis'], trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.TODO },
    priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.MEDIUM },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    checklist: { type: [checklistItemSchema], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

taskSchema.set('toJSON', { versionKey: false });

export const TaskModel = mongoose.model<TaskDocument>('Task', taskSchema);
export default TaskModel;