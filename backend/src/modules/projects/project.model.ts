import mongoose, { Schema, Document } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProjectDocument extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  team?: mongoose.Types.ObjectId;
  status: ProjectStatus;
  startDate?: Date;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: [true, 'Le nom du projet est requis'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    status: { type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.PLANNING },
    startDate: { type: Date },
    deadline: { type: Date },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, status: 1 });

projectSchema.set('toJSON', { virtuals: true, versionKey: false });

export const ProjectModel = mongoose.model<ProjectDocument>('Project', projectSchema);
export default ProjectModel;