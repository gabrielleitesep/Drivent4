import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError } from "@/errors";

async function getBooking(userId: number) {

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const userBooking = await bookingRepository.getBooking(userId);
  if (!userBooking) {
    throw notFoundError();
  }

  return userBooking;
}

async function postBooking(userId: number) {

}

async function putBooking(userId: number) {

}

const bookingService = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingService;
