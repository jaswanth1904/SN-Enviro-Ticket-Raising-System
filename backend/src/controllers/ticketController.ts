import { Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import Station from '../models/Station';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { getIo } from '../socket';
import { sendEmail } from '../services/emailService';

// @desc    Create a new ticket
// @route   POST /api/v1/tickets
// @access  Private
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stationId, subject, description, s3ImageUrl, assignedTo } = req.body;

    let station = await Station.findById(stationId).catch(() => null);
    if (!station) {
      // Look up by human-readable string (e.g., STN-260)
      station = await Station.findOne({ stationNumber: stationId });
      
      // If it still doesn't exist, create a dummy station to ensure the ticket never drops
      if (!station) {
        station = await Station.create({
          stationNumber: stationId,
          industryName: 'Unknown Field Location',
          location: { lat: 0, lng: 0 }
        });
      }
    }

    const ticket = await Ticket.create({
      stationId: station._id,
      creatorId: req.user?._id,
      assignedTo: assignedTo || null,
      subject,
      description,
      s3ImageUrl,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('stationId', 'stationNumber industryName location')
      .populate('creatorId', 'name email')
      .populate('assignedTo', 'name email');

    // Emit Socket Event
    getIo().emit('ticket_created', populatedTicket);

    let emailSent = false;
    // If assigned immediately, send email to assignee
    if (assignedTo && populatedTicket?.assignedTo) {
      const assignee: any = populatedTicket.assignedTo;
      try {
        await sendEmail(
          assignee.email,
          `New Ticket Assigned: ${ticket.ticketId}`,
          `<h2>New Ticket Assignment</h2><p>You have been assigned to ticket <b>${ticket.ticketId}</b>: ${subject}</p>`
        );
        emailSent = true;
      } catch (emailErr) {
        console.error('Non-fatal: Failed to send assignment email', emailErr);
      }
    } else {
      // Send urgent alert to the admin so they can assign it
      try {
        await sendEmail(
          'admin@snenviro.com',
          `URGENT: New Field Ticket Raised - ${ticket.ticketId}`,
          `<h2>New Ticket Raised by Field Team</h2>
           <p><b>Station:</b> ${station.stationNumber} - ${station.industryName}</p>
           <p><b>Subject:</b> ${subject}</p>
           <p><b>Description:</b> ${description}</p>
           <br/>
           <p>Please log in to the dashboard to assign a technician immediately.</p>`
        );
        emailSent = true;
      } catch (emailErr) {
        console.error('Non-fatal: Failed to send admin notification email', emailErr);
      }
    }

    res.status(201).json({
      success: true,
      emailSent,
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
    
    // Only admin can reassign tickets generally
    if (assignedTo && req.user?.role === 'admin') {
      let finalAssignedTo = assignedTo;
      
      // If the payload is an email address string instead of an ObjectId
      if (typeof assignedTo === 'string' && assignedTo.includes('@')) {
        let userByEmail = await User.findOne({ email: assignedTo });
        if (!userByEmail) {
          // Create dummy user for the technician
          userByEmail = await User.create({
            name: assignedTo.split('@')[0],
            email: assignedTo,
            password: 'generated-password-123',
            role: 'technician'
          });
        }
        finalAssignedTo = userByEmail._id;
      }
      
      ticket.assignedTo = finalAssignedTo;
    }

    const updatedTicket = await ticket.save();

    const populatedTicket = await Ticket.findById(updatedTicket._id)
      .populate('stationId', 'stationNumber industryName location')
      .populate('creatorId', 'name email')
      .populate('assignedTo', 'name email');

    // Emit Socket Event
    getIo().emit('ticket_updated', populatedTicket);

    let emailSent = false;
    // Send emails based on actions
    if (assignedTo && populatedTicket?.assignedTo) {
      const assignee: any = populatedTicket.assignedTo;
      try {
        await sendEmail(
          assignee.email,
          `Ticket Assigned: ${updatedTicket.ticketId}`,
          `<h2>Ticket Assignment Update</h2><p>You have been assigned to ticket <b>${updatedTicket.ticketId}</b>.</p>`
        );
        emailSent = true;
      } catch (emailErr) {
        console.error('Non-fatal: Failed to send assignment email', emailErr);
      }
    }

    if (status === 'Resolved' && populatedTicket?.creatorId) {
      const creator: any = populatedTicket.creatorId;
      try {
        await sendEmail(
          creator.email,
          `Ticket Resolved: ${updatedTicket.ticketId}`,
          `<h2>Ticket Resolved</h2><p>Ticket <b>${updatedTicket.ticketId}</b> has been marked as resolved.</p><p><b>Notes:</b> ${notes || 'No notes provided.'}</p>`
        );
        emailSent = true;
      } catch (emailErr) {
        console.error('Non-fatal: Failed to send resolution email', emailErr);
      }
    }

    res.json({
      success: true,
      emailSent,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};
