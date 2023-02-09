import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import httpStatus from "http-status";

export async function getBooking(req:AuthenticatedRequest, res:Response) {

    try {
       
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      }
}

export async function postBooking(req:AuthenticatedRequest, res:Response) {

    try {
      
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      }
}

export async function putBooking(req:AuthenticatedRequest, res:Response) {
    
    try {
       
      } catch (error) {
        if (error.name === "NotFoundError") {
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
      }
}