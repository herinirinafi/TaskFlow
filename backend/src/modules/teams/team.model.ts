import mongoose, { Schema, Document } from 'mongoose';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface TeamDocument extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: TeamStatus;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<TeamDocument>(
  {
    name: { type: String, required: [true, 'Le nom de la team est requis'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: Object.values(TeamStatus), default: TeamStatus.ACTIVE },
  },
  { timestamps: true }
);

teamSchema.set('toJSON', { virtuals: true, versionKey: false });

export const TeamModel = mongoose.model<TeamDocument>('Team', teamSchema);
export default TeamModel;