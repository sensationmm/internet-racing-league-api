import { Request, Response } from "express";
import { Events, IEvent } from "../models/Event";

export class EventController {
  static async test(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      status: 'success',
      message: 'Event Route available',
    });
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, eventDate }: IEvent = req.body;

      const event = await Events.create({
        name,
        eventDate
      });

      res.status(200).json({
        status: 'success',
        message: 'Event created',
        data: event
      });
    } catch (error) {
      console.error('Event create error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error creating Event',
      });
    }
  }
}