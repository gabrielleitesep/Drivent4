import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import httpStatus from "http-status";

export async function getBooking(req:AuthenticatedRequest, res:Response) {

    try {
        const { userId } = req;
        const result = await bookingService.getBooking(userId)
    
        return res.status(httpStatus.OK).send({ id:result.id, Room:result.roomId})
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.FORBIDDEN);
      }
}

export async function postBooking(req:AuthenticatedRequest, res:Response) {

    try {
      const { userId } = req;
      const {roomId} = req.body;

      const createBooking = await bookingService.postBooking(userId, roomId);
      return res.status(httpStatus.OK).send(createBooking);
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.FORBIDDEN);
      }
}


export async function putBooking(req:AuthenticatedRequest, res:Response) {
    
    try {
       
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.FORBIDDEN);
      }
}