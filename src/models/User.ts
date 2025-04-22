import mongoose, { Schema } from 'mongoose';

export interface IUserInput {
  name: string;
  surname: string;
  email: string;
  password: string;
  bio: string;
  phoneNumber: string;
}

export interface IUser extends IUserInput {
  _id: string;
  isVerified: Boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    surname: { 
      type: String, 
      required: true, 
      trim: true 
    },
    bio: { 
      type: String, 
      trim: true 
    },
    phoneNumber: { 
      type: String, 
      trim: true 
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { 
    timestamps: true 
  }
);


export const User = mongoose.model<IUser>('User', userSchema);