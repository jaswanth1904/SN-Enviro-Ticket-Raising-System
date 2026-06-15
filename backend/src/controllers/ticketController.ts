import { Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import Station from '../models/Station';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new ticket
// @route   POST /api/v1/tickets
// @access  Private
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stationId, subject, description, s3ImageUrl, assignedTo } = req.body;

    const station = await Station.findById(stationId);
    if (!station) {
      res.status(404);
      return next(new Error('Station not found'));
    }

    const ticket = await Ticket.create({
      stationId,
      creatorId: req.user?._id,
      assignedTo: assignedTo || null,
      subject,
      description,
      s3ImageUrl,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets
// @route   GET /api/v1/tickets
// @access  Private
export const getTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let query = {};

    // If not admin, only show tickets created by them or assigned to them
    if (req.user?.role !== 'admin') {
      query = {
        $or: [{ creatorId: req.user?._id }, { assignedTo: req.user?._id }],
      };
    }

    const tickets = await Ticket.find(query)
      .populate('stationId', 'stationNumber industryName location')
      .populate('creatorId', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket
// @route   PATCH /api/v1/tickets/:id
// @access  Private
export const updateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, assignedTo, notes } = req.body;

    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404);
      return next(new Error('Ticket not found'));
    }

    // Check permissions: 
    // Admin can update anything.
    // Assignee or Creator can update status and notes.
    if (
      req.user?.role !== 'admin' &&
      ticket.creatorId.toString() !== req.user?._id?.toString() &&
      ticket.assignedTo?.toString() !== req.user?._id?.toString()
    ) {
      res.status(403);
      return next(new Error('Not authorized to update this ticket'));
    }

    if (status) ticket.status = status;
    if (notes) ticket.notes = notes;
    
    // Only admin can reassign tickets generally, but let's allow it if explicitly handled
    if (assignedTo && req.user?.role === 'admin') {
      ticket.assignedTo = assignedTo;
    }

    const updatedTicket = await ticket.save();

    res.json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};
