import mongoose, { Schema } from 'mongoose';

export interface IEvent {
  name: string;
  eventDate: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    eventDate: { 
      type: Date, 
      required: true, 
      trim: true 
    },
  },
  { 
    timestamps: true 
  }
);


export const Events = mongoose.model<IEvent>('Event', eventSchema);