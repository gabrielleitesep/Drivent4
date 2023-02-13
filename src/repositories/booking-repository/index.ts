import { prisma } from "@/config";

async function getBooking(userId:number) {

  return prisma.booking.findFirst({ where: { userId } });
}

async function getRoom(roomId:number) {

  return prisma.room.findFirst({ where: { id: roomId }, include: { Booking: true } });
}

async function postBooking(roomId:number, userId:number) {
  
  return prisma.booking.create({ data: { roomId, userId }})
}

async function putBooking(roomId:number, userId:number, bookingId:number) {

  return prisma.booking.update({ where: { id: bookingId }, data: { userId, roomId } });
}

const bookingRepository = {
  getBooking,
  postBooking,
  putBooking,
  getRoom
};

export default bookingRepository;