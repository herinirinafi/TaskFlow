import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMMENTED = 'TASK_COMMENTED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DEADLINE = 'TASK_DEADLINE',
  PROJECT_INVITE = 'PROJECT_INVITE',
  SYSTEM = 'SYSTEM',
}

export interface NotificationDocument extends Document {
  recipient: mongoose.Types.ObjectId;
  actor?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  task?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 500 },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

notificationSchema.set('toJSON', { virtuals: true, versionKey: false });

export const NotificationModel = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema
);
export default NotificationModel;