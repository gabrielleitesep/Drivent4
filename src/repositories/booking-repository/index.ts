import { prisma } from "@/config";

async function getBooking(userId: number) {

    return prisma.booking.findFirst({ where: { userId } });
}

async function postBooking() {
  
}

async function putBooking() {
  
}

const bookingRepository = {
  getBooking,
  postBooking,
  putBooking
};

export default bookingRepository;