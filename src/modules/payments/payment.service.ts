import { prisma } from "../../config/prisma";
import { stripe } from "../../config/stripe";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

export const payForBooking = async (user: AuthUser, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.touristId !== user.id)
    throw new ApiError(403, "You cannot pay for this booking");
  if (booking.status !== "CONFIRMED")
    throw new ApiError(400, "Booking must be confirmed before payment");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.totalPrice * 100,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  // Check existing payment to avoid duplicate
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalPrice,
        currency: "usd",
        stripePaymentIntent: paymentIntent.id,
      },
    });
  }

  return { clientSecret: paymentIntent.client_secret };
};
