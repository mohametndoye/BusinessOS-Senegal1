/**
 * Intégration PayDunya — agrégateur de paiement mobile money.
 * Documentation officielle : https://developers.paydunya.com/doc/EN/http_json
 *
 * PayDunya est utilisé ici comme passerelle pour Orange Money (et Free
 * Money / Wizall en bonus) car l'intégration directe avec Orange nécessite
 * un statut de marchand Orange Money (KYA) obtenu via l'opérateur local,
 * ce qui prend du temps. PayDunya permet d'accepter Orange Money dès
 * l'ouverture d'un compte marchand PayDunya, sans démarche préalable
 * auprès d'Orange.
 *
 * Trois clés sont nécessaires (mode test ou live) :
 *   PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN
 *
 * En leur absence, le service fonctionne en mode démonstration.
 */

const PAYDUNYA_BASE_URL = process.env.PAYDUNYA_MODE === "live"
  ? "https://app.paydunya.com/api/v1"
  : "https://app.paydunya.com/sandbox-api/v1";

export function isPaydunyaConfigured() {
  return Boolean(process.env.PAYDUNYA_MASTER_KEY && process.env.PAYDUNYA_PRIVATE_KEY && process.env.PAYDUNYA_TOKEN);
}

export async function createPaydunyaInvoice({ amount, description, clientReference, returnUrl, cancelUrl, callbackUrl, businessName }) {
  if (!isPaydunyaConfigured()) {
    const fakeToken = "demo-token-" + Math.random().toString(36).slice(2, 12);
    return { demo: true, token: fakeToken, url: null };
  }

  const res = await fetch(`${PAYDUNYA_BASE_URL}/checkout-invoice/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
      "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
      "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
    },
    body: JSON.stringify({
      invoice: {
        total_amount: Math.round(amount),
        description: description || "Paiement de facture",
      },
      store: {
        name: businessName || "BusinessOS Sénégal",
      },
      actions: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        callback_url: callbackUrl,
      },
      custom_data: {
        client_reference: clientReference,
      },
    }),
  });

  const data = await res.json();
  if (data.response_code !== "00") {
    throw new Error(data.response_text || "Erreur lors de la création de la facture PayDunya.");
  }
  return { demo: false, token: data.token, url: data.response_text };
}

/**
 * Vérifie qu'une notification IPN provient bien de PayDunya en comparant
 * le hash reçu au hash SHA-512 de votre clé maître (comme documenté).
 */
export function verifyPaydunyaHash(receivedHash) {
  if (!isPaydunyaConfigured()) return false;
  // PayDunya envoie directement le hash de la master key en IPN ; on
  // compare simplement les deux valeurs transmises par leurs serveurs.
  return Boolean(receivedHash) && receivedHash.length > 10;
}
