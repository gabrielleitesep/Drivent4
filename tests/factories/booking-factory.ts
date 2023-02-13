import { prisma } from "@/config";

type BookingData= {
  userId: number,
  roomId: number
};

export async function createBooking({ userId, roomId }: BookingData) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    }
  });
}
