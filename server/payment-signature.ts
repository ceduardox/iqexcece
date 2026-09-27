import { createHmac, timingSafeEqual } from "crypto";
export function sortPaymentPayload(value: any): any {
  if (Array.isArray(value)) return value.map(sortPaymentPayload);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k, sortPaymentPayload(value[k])]));
  return value;
}
export function verifyPaymentSignature(payload: any, signature: string, secret: string) {
  if (!secret || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac("sha512", secret).update(JSON.stringify(sortPaymentPayload(payload))).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
