import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, forbiddenError } from "@/errors";

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);
  if (!userBooking) {
    throw notFoundError();
  }

  return userBooking;
}

async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || !ticket) {
    throw forbiddenError();
  }

  if (!roomId) {
    throw notFoundError();
  }

  const room = await bookingRepository.getRoom(roomId);
  if (room.capacity <= room.Booking.length) {
    throw forbiddenError();
  }

  return bookingRepository.postBooking(roomId, userId);
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || !ticket) {
    throw forbiddenError();
  }

  if (!roomId) {
    throw notFoundError();
  }

  const room = await bookingRepository.getRoom(roomId);
  if (room.capacity <= room.Booking.length) {
    throw forbiddenError();
  }

  if(!bookingId) {
    throw notFoundError();
  }

  const booking = await bookingRepository.getBooking(userId);
  if (!booking) {
    throw notFoundError();
  }

  return bookingRepository.putBooking(roomId, userId, bookingId);
}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
