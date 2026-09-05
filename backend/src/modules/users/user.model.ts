import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword } from '../../utils/password';

export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MEMBER = 'MEMBER',
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: [true, 'Le prénom est requis'], trim: true, maxlength: 50 },
    lastName: { type: String, required: [true, 'Le nom est requis'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: null },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    passwordResetToken: { type: String, default: undefined, select: false },
    passwordResetExpires: { type: Date, default: undefined, select: false },
  },
  { timestamps: true }
);

userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete (ret as { password?: string }).password;
    return ret;
  },
});

userSchema.pre('save', async function (this: UserDocument, next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = function (this: UserDocument, plain: string): Promise<boolean> {
  return import('../../utils/password').then(({ comparePassword }) =>
    comparePassword(plain, this.password)
  );
};

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
export default UserModel;