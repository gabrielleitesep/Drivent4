import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createHotel,
  createBooking,
  createRoomWithHotelId
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and the booking room ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = createBooking({ roomId: hotelRoom.id, userId: user.id });

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ id: (await booking).id, Room: (await booking).roomId });
    });

    it("should respond with status 404 when user doesn't have a booking ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      await createRoomWithHotelId(hotel.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and post booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: hotelRoom.id });

      expect(response.status).toBe(httpStatus.OK);
    });

    it("should respond with status 403 when roomId is at maximum capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);

      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: hotelRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when enrollment doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createTicketTypeWithHotel();
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
    
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: hotelRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when payment doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: hotelRoom.id });
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when roomId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      await createRoomWithHotelId(hotel.id);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: null });
    
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and change booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking({ userId: user.id, roomId: hotelRoom.id });
      const response = await server.put(`/booking/${ booking.id }`).set("Authorization", `Bearer ${ token }`).send({ oomId: hotelRoom.id });

      expect(response.status).toBe(httpStatus.OK);
    });

    it("should respond with status 403 when roomId is at maximum capacity", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking({ userId: user.id, roomId: hotelRoom.id });

      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
      await createBooking({ roomId: hotelRoom.id, userId: user.id });
    
      const response = await server.put(`/booking/${ booking.id }`).set("Authorization", `Bearer ${ token }`).send({ roomId: hotelRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when enrollment doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createTicketTypeWithHotel();
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking({ userId: user.id, roomId: hotelRoom.id });
    
      const response = await server.put(`/booking/${ booking.id }`).set("Authorization", `Bearer ${ token }`).send({ roomId: hotelRoom.id });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when payment doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking({ userId: user.id, roomId: hotelRoom.id });
      const response = await server.put(`/booking/${ booking.id }`).set("Authorization", `Bearer ${ token }`).send({ roomId: hotelRoom.id });
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when bookingId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking({ userId: user.id, roomId: hotelRoom.id });
      const response = await server.put("/booking/0").set("Authorization", `Bearer ${ token }`).send({ roomId: hotelRoom.id });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when roomId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const hotelRoom = await createRoomWithHotelId(hotel.id);
      await createBooking({ userId: user.id, roomId: hotelRoom.id });
      const booking = await createBooking({ userId: user.id, roomId: hotelRoom.id });
      const response = await server.put(`/booking/${ booking.id }`).set("Authorization", `Bearer ${ token }`).send({ roomId: null });
    
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});
