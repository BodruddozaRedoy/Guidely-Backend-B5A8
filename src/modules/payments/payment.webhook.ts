import { Router } from "express";
import { stripe } from "../../config/stripe";
import { prisma } from "../../config/prisma";

const router = Router();

// RAW middleware needed
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      console.log("Booking Payment Success:", bookingId);

      // Mark Payment as PAID
      await prisma.payment.update({
        where: { stripePaymentIntent: paymentIntent.id },
        data: { status: "PAID" },
      });

      // Mark Booking as COMPLETED
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      });

      console.log("Booking marked as COMPLETED");
    }

    res.json({ received: true });
  }
);

export { router as paymentWebhookRouter };
