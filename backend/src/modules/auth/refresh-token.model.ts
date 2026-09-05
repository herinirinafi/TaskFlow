import mongoose, { Schema, Document } from 'mongoose';

export interface RefreshTokenDocument extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  sessionId: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    token: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema
);
export default RefreshTokenModel;