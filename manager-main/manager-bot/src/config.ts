import dotenv from "dotenv";

dotenv.config();

const { CLIENT, CHANNEL, GUILD, TOKEN, OWNERS, DATABASE, MERCADOPAGO } = process.env;

if (!CLIENT || !CHANNEL || !GUILD || !TOKEN || !OWNERS || !DATABASE || !MERCADOPAGO)
  throw new Error("Missing environment variables");

const config: Record<string, string> = {
  CLIENT,
  CHANNEL,
  GUILD,
  TOKEN,
  OWNERS,
  DATABASE,
  MERCADOPAGO,
};

export default config;
