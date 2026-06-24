import { Response, NextFunction } from 'express';
import Ticket from '../models/Ticket';
import Station from '../models/Station';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import { getIo } from '../socket';
import { sendRegistrationAcknowledgement, sendAssignmentNotification, sendResolutionNotice } from '../services/emailService';

// @desc    Create a new ticket
// @route   POST /api/v1/tickets
// @access  Private
export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { stationId, manualStationName, locationDetails, subject, description, s3ImageUrl, assignedTo, telemetryIssueType, fieldEngineerLocation, contactEmail } = req.body;

    let station;
    if (stationId === 'STN-999' && manualStationName) {
      station = await Station.create({
        stationNumber: `MNL-${Date.now().toString().slice(-4)}`,
        industryName: `Manual: ${manualStationName}`,
        district: locationDetails || 'Manual Entry',
        state: 'Manual Entry',
        deviceTypes: ['Manual Entry'],
        coordinates: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });
    } else {
      station = await Station.findById(stationId).catch(() => null);
      if (!station) {
        // Look up by human-readable string (e.g., STN-260)
        station = await Station.findOne({ stationNumber: stationId });
        
        // If it still doesn't exist, create a dummy station to ensure the ticket never drops
        if (!station) {
          station = await Station.create({
            stationNumber: stationId,
            industryName: 'Unknown Field Location',
            district: 'Unknown',
            state: 'Unknown',
            deviceTypes: ['Unknown'],
            coordinates: {
              type: 'Point',
              coordinates: [0, 0]
            }
          });
        }
      }
    }

    const ticket = await Ticket.create({
      stationId: station._id,
      creatorId: req.user?._id || undefined,
      assignedTo: assignedTo || null,
      subject,
      description,
      s3ImageUrl,
      telemetryIssueType,
      fieldEngineerLocation,
      contactEmail,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('stationId', 'stationNumber industryName location')
      .populate('creatorId', 'name email')
      .populate('assignedTo', 'name email');

    // Emit Socket Event
    getIo().emit('ticket:onNewTicket', populatedTicket);

    let emailSent = false;
    if (assignedTo && populatedTicket?.assignedTo) {
      const assignee: any = populatedTicket.assignedTo;
      const stationData: any = populatedTicket.stationId;
      const stationDetails = stationData ? `${stationData.stationNumber} - ${stationData.industryName}` : 'Unknown Plant';
      
      await sendAssignmentNotification(
        assignee.email, 
        ticket.ticketId, 
        subject,
        ticket.telemetryIssueType || 'General Issue',
        ticket.description,
        stationDetails
      ).catch(console.error);
      emailSent = true;
    }

    // Always send the confirmation to the creator (Field Engineer) asynchronously
    const creator: any = populatedTicket?.creatorId;
    const recipientEmail = contactEmail || creator?.email;
    if (recipientEmail) {
      sendRegistrationAcknowledgement(recipientEmail, ticket.ticketId, subject, description).catch(console.error);
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
            role: 'field_engineer'
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

    let emailSent = true;
    if (assignedTo && populatedTicket?.assignedTo) {
      const assignee: any = populatedTicket.assignedTo;
      const stationData: any = populatedTicket.stationId;
      const stationDetails = stationData ? `${stationData.stationNumber} - ${stationData.industryName}` : 'Unknown Plant';
      
      sendAssignmentNotification(
        assignee.email, 
        updatedTicket.ticketId, 
        updatedTicket.subject,
        updatedTicket.telemetryIssueType || 'General Issue',
        updatedTicket.description,
        stationDetails
      ).catch(console.error);
    }

    if (status === 'Resolved') {
      const creator: any = populatedTicket?.creatorId;
      const recipientEmail = ticket.contactEmail || creator?.email;
      if (recipientEmail) {
        sendResolutionNotice(recipientEmail, updatedTicket.ticketId).catch(console.error);
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
