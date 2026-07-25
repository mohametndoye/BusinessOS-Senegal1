/**
 * Intégration Wave Checkout API
 * Documentation officielle : https://docs.wave.com/checkout
 *
 * Wave expose une API simple à clé unique (une clé = un wallet marchand) :
 *   POST https://api.wave.com/v1/checkout/sessions
 *   Auth : Authorization: Bearer <WAVE_API_KEY>
 *
 * En l'absence de WAVE_API_KEY (mode démo, avant obtention d'un compte
 * marchand Wave Business), le service simule une session pour permettre
 * de tester le parcours complet sans clé réelle.
 */

import crypto from "crypto";

const WAVE_BASE_URL = "https://api.wave.com/v1";

export function isWaveConfigured() {
  return Boolean(process.env.WAVE_API_KEY);
}

export async function createWaveCheckoutSession({ amount, clientReference, successUrl, errorUrl }) {
  if (!isWaveConfigured()) {
    // Mode démonstration : aucune clé Wave fournie.
    const fakeId = "demo-cos-" + Math.random().toString(36).slice(2, 12);
    return {
      demo: true,
      id: fakeId,
      wave_launch_url: null,
      checkout_status: "open",
    };
  }

  const res = await fetch(`${WAVE_BASE_URL}/checkout/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
    },
    body: JSON.stringify({
      amount: String(Math.round(amount)),
      currency: "XOF",
      client_reference: clientReference,
      success_url: successUrl,
      error_url: errorUrl,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.message || "Erreur lors de la création de la session Wave.";
    throw new Error(message);
  }
  return { demo: false, ...data };
}

export async function getWaveCheckoutSession(sessionId) {
  if (!isWaveConfigured()) return null;
  const res = await fetch(`${WAVE_BASE_URL}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Vérifie la signature d'un webhook Wave.
 * En-tête attendu : Wave-Signature: t=<timestamp>,v1=<hmac_sha256>
 * Signature = HMAC-SHA256(secret, timestamp + rawBody)
 */
export function verifyWaveSignature({ rawBody, signatureHeader, secret }) {
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [(k || "").trim(), (v || "").trim()];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(ageSeconds) || ageSeconds > 300) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
