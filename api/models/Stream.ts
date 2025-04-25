import mongoose, { Schema } from 'mongoose';

export interface IStream {
  userId: string;
  eventId: string;
  streamStart: Date;
}

const streamSchema = new Schema<IStream>(
  {
    userId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    eventId: { 
      type: String, 
      required: true, 
      trim: true 
    },
    streamStart: { 
      type: Date, 
      required: true, 
    },
  }
);


export const Stream = mongoose.model<IStream>('Stream', streamSchema);