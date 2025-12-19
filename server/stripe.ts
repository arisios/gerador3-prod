// Integração com Stripe para pagamentos
import Stripe from "stripe";
import { addCredits, updateStripeCustomerId, getUserCredits } from "./db";

// Inicializar Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

// Pacotes de créditos disponíveis
export const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 30,
    priceInCents: 3990, // R$39,90
    description: "Ideal para começar",
  },
  {
    id: "popular",
    name: "Popular",
    credits: 100,
    priceInCents: 9990, // R$99,90
    description: "Melhor custo-benefício",
    isFeatured: true,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 300,
    priceInCents: 24990, // R$249,90
    description: "Para uso intensivo",
  },
];

// Criar sessão de checkout do Stripe
export async function createCheckoutSession(
  userId: number,
  userEmail: string,
  packageId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    throw new Error("Pacote não encontrado");
  }

  // Verificar ou criar customer no Stripe
  let customerId: string | undefined;
  const userCredits = await getUserCredits(userId);
  
  if (userCredits?.stripeCustomerId) {
    customerId = userCredits.stripeCustomerId;
  } else {
    // Criar novo customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId: userId.toString(),
      },
    });
    customerId = customer.id;
    await updateStripeCustomerId(userId, customerId!);
  }

  // Criar sessão de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${pkg.name} - ${pkg.credits} Créditos`,
            description: pkg.description,
          },
          unit_amount: pkg.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId.toString(),
      packageId: pkg.id,
      credits: pkg.credits.toString(),
    },
  });

  return {
    sessionId: session.id,
    url: session.url || "",
  };
}

// Processar webhook do Stripe
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ success: boolean; message: string }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("[Stripe] Webhook secret not configured");
    return { success: false, message: "Webhook secret not configured" };
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err);
    return { success: false, message: "Invalid signature" };
  }

  // Processar evento
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = parseInt(session.metadata?.userId || "0");
      const credits = parseInt(session.metadata?.credits || "0");
      const packageId = session.metadata?.packageId || "";
      
      if (userId && credits) {
        await addCredits(
          userId,
          credits,
          `Compra de pacote ${packageId}`,
          session.id,
          session.payment_intent as string
        );
        console.log(`[Stripe] Added ${credits} credits to user ${userId}`);
      }
      break;
    }

    case "payment_intent.succeeded": {
      console.log("[Stripe] Payment succeeded:", event.data.object.id);
      break;
    }

    case "payment_intent.payment_failed": {
      console.log("[Stripe] Payment failed:", event.data.object.id);
      break;
    }

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return { success: true, message: "Webhook processed" };
}

// Obter histórico de pagamentos do usuário
export async function getPaymentHistory(userId: number): Promise<Stripe.PaymentIntent[]> {
  const userCredits = await getUserCredits(userId);
  
  if (!userCredits?.stripeCustomerId) {
    return [];
  }

  const paymentIntents = await stripe.paymentIntents.list({
    customer: userCredits.stripeCustomerId,
    limit: 20,
  });

  return paymentIntents.data;
}

// Verificar se Stripe está configurado
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}
