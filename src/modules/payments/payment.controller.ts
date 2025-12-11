import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as paymentService from "./payment.service";
import { prisma } from "../../config/prisma";
import { stripe } from "../../config/stripe";

export const payForBooking = catchAsync(async (req, res) => {
  const data = await paymentService.payForBooking(
    req.user!,
    req.body.bookingId
  );
  return sendSuccess(res, data, "Payment initiated");
});

export const webhookHandler = (req, res) => {
  // Stripe sends raw body = required
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const bookingId = event.data.object.metadata.bookingId;

    prisma.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });
  }

  res.json({ received: true });
};

