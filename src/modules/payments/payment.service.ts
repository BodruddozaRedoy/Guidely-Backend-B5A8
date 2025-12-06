// src/modules/payments/payment.service.ts
import { stripe } from "../../config/stripe";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

export const payForBooking = async (bookingId: string, customerId?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: true },
  });
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status !== "CONFIRMED") {
    throw new ApiError(400, "Only confirmed bookings can be paid");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.totalPrice, // in smallest currency unit
    currency: "usd",
    customer: customerId,
    metadata: {
      bookingId: booking.id,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      stripePaymentIntent: paymentIntent.id,
      amount: booking.totalPrice,
      currency: "usd",
      status: "PENDING",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};
