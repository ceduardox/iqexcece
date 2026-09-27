import type { Express } from "express";
import { randomUUID } from "crypto";
import { verifyPaymentSignature } from "./payment-signature";
import fs from "fs";
import { pool } from "./db";
import { billingHistory } from "./billing-history";
import { SERVER_PLANS, buildBillingLedger, isSettled, type ServerPayment } from "../shared/server-billing";

let initialization: Promise<void> | undefined;
export function ensureBillingStorage() {
  if (!initialization) initialization = (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS server_crypto_orders (order_id text PRIMARY KEY, data jsonb NOT NULL)`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS server_crypto_payment_id ON server_crypto_orders ((data->>'paymentId')) WHERE data->>'paymentId' IS NOT NULL`);
    const legacy: ServerPayment[] = fs.existsSync("/tmp/nowpayments_orders.json")
      ? JSON.parse(fs.readFileSync("/tmp/nowpayments_orders.json", "utf8")).orders || [] : [];
    for (const row of [...billingHistory, ...legacy]) {
      await pool.query("INSERT INTO server_crypto_orders(order_id,data) VALUES($1,$2) ON CONFLICT DO NOTHING", [row.orderId, JSON.stringify(row)]);
    }
  })().catch(error => { initialization = undefined; throw error; });
  return initialization;
}
async function listOrders(): Promise<ServerPayment[]> {
  await ensureBillingStorage();
  return (await pool.query("SELECT data FROM server_crypto_orders")).rows.map(r => r.data);
}
export async function applyProviderPayment(payload: any) {
  await ensureBillingStorage();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT data FROM server_crypto_orders WHERE order_id=$1 FOR UPDATE", [String(payload.order_id || "")]);
    const prev: ServerPayment | undefined = result.rows[0]?.data;
    if (!prev) throw new Error("Orden de pago desconocida");
    if (!payload.payment_id || String(payload.price_currency).toLowerCase() !== "usd" ||
        Math.round(Number(payload.price_amount) * 100) !== Math.round(prev.amountUsd * 100) ||
        (prev.invoiceId && String(payload.invoice_id) !== String(prev.invoiceId)) ||
        (prev.paymentId && String(payload.payment_id) !== String(prev.paymentId))) throw new Error("El pago no coincide con la orden");
    // Late/repeated notifications cannot remove or duplicate an already applied credit.
    if (!isSettled(prev.paymentStatus)) {
      const status = String(payload.payment_status || "unknown").toLowerCase();
      const now = new Date().toISOString();
      const next = { ...prev, paymentStatus: status, paymentId: String(payload.payment_id),
        paidAt: isSettled(status) ? (prev.paidAt || payload.updated_at || now) : prev.paidAt,
        updatedAt: now, raw: payload };
      await client.query("UPDATE server_crypto_orders SET data=$2 WHERE order_id=$1", [prev.orderId, JSON.stringify(next)]);
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
let lastRefresh = 0;
let refreshInFlight: Promise<void> | undefined;
async function refreshKnownPayments() {
  if (refreshInFlight) return refreshInFlight;
  if (Date.now() - lastRefresh < 30000) return;
  lastRefresh = Date.now();
  refreshInFlight = (async () => {
    const orders = (await listOrders()).filter(p => p.paymentId && !isSettled(p.paymentStatus) && !["expired", "failed", "refunded"].includes(p.paymentStatus));
    for (const p of orders.slice(0, 20)) {
      try {
        const response = await fetch(`https://api.nowpayments.io/v1/payment/${encodeURIComponent(String(p.paymentId))}`, {
          headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY || "" }, signal: AbortSignal.timeout(8000) });
        if (response.ok) await applyProviderPayment(await response.json());
      } catch (error) { console.error("NOWPayments reconciliation:", p.orderId, error instanceof Error ? error.message : "failed"); }
    }
  })().finally(() => { refreshInFlight = undefined; });
  return refreshInFlight;
}
export function registerNowPayments(app: Express, validAdminTokens: Set<string>) {
  app.post("/api/payments/nowpayments/create", async (req, res) => {
    try {
      const apiKey = process.env.NOWPAYMENTS_API_KEY;
      if (!apiKey) return res.status(503).json({ error: "NOWPayments no configurado" });
      const { planId, billingMode = "mensual" } = req.body || {};
      if (!Object.hasOwn(SERVER_PLANS, planId || "") || !["mensual", "anual"].includes(billingMode)) return res.status(400).json({ error: "Plan o modalidad invalida" });
      const plan = planId as keyof typeof SERVER_PLANS;
      const mode = billingMode as "mensual" | "anual";
      const unit = SERVER_PLANS[plan][mode];
      const amount = req.body.amountUsd == null ? unit : Number(req.body.amountUsd);
      if (!Number.isFinite(amount) || amount < unit || !Number.isInteger(amount / unit) || amount / unit > 120) return res.status(400).json({ error: "Selecciona entre 1 y 120 cuotas completas" });
      await ensureBillingStorage();
      const orderId = `iqx_${plan}_${mode}_${Date.now()}_${randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();
      const row: ServerPayment = { orderId, planId: plan, billingMode: mode, amountUsd: amount, unitPriceUsd: unit,
        paymentStatus: "waiting", payCurrency: "usdtbsc", createdAt: now, updatedAt: now };
      // Save first so that an early notification always finds its order.
      await pool.query("INSERT INTO server_crypto_orders(order_id,data) VALUES($1,$2)", [orderId, JSON.stringify(row)]);
      const callback = process.env.NOWPAYMENTS_IPN_URL || `${process.env.APP_BASE_URL || ""}/api/payments/nowpayments/webhook`;
      const response = await fetch("https://api.nowpayments.io/v1/invoice", { method: "POST", signal: AbortSignal.timeout(20000),
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" }, body: JSON.stringify({
          price_amount: amount, price_currency: "usd", pay_currency: "usdtbsc", order_id: orderId,
          order_description: `IQEx ${plan.toUpperCase()} ${amount / unit} cuota(s) ${mode}`,
          ipn_callback_url: callback, is_fixed_rate: true }) });
      const data = await response.json();
      if (!response.ok) return res.status(502).json({ error: data.message || "No se pudo crear la factura" });
      const extra = { invoiceId: String(data.id), invoiceUrl: data.invoice_url };
      await pool.query("UPDATE server_crypto_orders SET data=data || $2::jsonb WHERE order_id=$1", [orderId, JSON.stringify(extra)]);
      return res.json({ success: true, orderId, paymentUrl: data.invoice_url, invoiceId: data.id, paymentStatus: "waiting", payCurrency: "usdtbsc" });
    } catch (error: any) { return res.status(500).json({ error: error.message || "Error creando pago" }); }
  });
  app.post("/api/payments/nowpayments/webhook", async (req, res) => {
    try {
      const ips = (process.env.NOWPAYMENTS_ALLOWED_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
      const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
      if (ips.length && !ips.includes(ip)) return res.status(403).json({ error: "IP no permitida" });
      const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!verifyPaymentSignature(payload, String(req.headers["x-nowpayments-sig"] || ""), process.env.NOWPAYMENTS_IPN_SECRET || "")) return res.status(401).json({ error: "Firma IPN invalida" });
      await applyProviderPayment(payload);
      return res.json({ received: true });
    } catch (error: any) { console.error("NOWPayments webhook:", error.message); return res.status(500).json({ error: "No se pudo registrar la notificacion" }); }
  });
  app.get("/api/admin/payments/nowpayments", async (req, res) => {
    if (!validAdminTokens.has(String(req.headers.authorization || "").replace("Bearer ", ""))) return res.status(401).json({ error: "No autorizado" });
    try {
      await refreshKnownPayments();
      const orders = await listOrders();
      // Do not expose provider payloads, addresses or credentials to the ledger UI.
      const ledger = buildBillingLedger(orders.map(({ raw, ...row }) => row as ServerPayment));
      res.json({ ...ledger, attempts: orders.filter(p => !isSettled(p.paymentStatus)).map(p => ({ orderId: p.orderId, amountUsd: p.amountUsd, paymentStatus: p.paymentStatus, manualReviewRequired: Boolean(p.manualReviewRequired) })) });
    } catch (error: any) { console.error("NOWPayments ledger:", error.message); res.status(500).json({ error: "No se pudo consultar el historial de pagos" }); }
  });
}
