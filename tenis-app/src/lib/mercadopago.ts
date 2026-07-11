import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export const preference = new Preference(client);
export const mpPayment = new MPPayment(client);

export function getMPClient() {
  return client;
}
