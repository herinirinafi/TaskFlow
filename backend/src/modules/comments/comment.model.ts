import mongoose, { Schema, Document } from 'mongoose';

export interface CommentDocument extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    content: { type: String, required: [true, 'Le contenu est requis'], trim: true, maxlength: 2000 },
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

commentSchema.index({ task: 1, createdAt: -1 });

commentSchema.set('toJSON', { virtuals: true, versionKey: false });

export const CommentModel = mongoose.model<CommentDocument>('Comment', commentSchema);
export default CommentModel;