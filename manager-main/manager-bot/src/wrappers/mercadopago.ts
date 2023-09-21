import mercadopago from "mercadopago";
import config from "../config";

interface IMercadoPago {
  status: string;
  id: number;
  qr_code: string;
  qr_code_base64: string
}

class MercadoPago {
  constructor() {
    mercadopago.configure({ access_token: config.MERCADOPAGO });
  }

  async create(first_name: string, value: number, description: string): Promise<IMercadoPago> {
    try {
      const payment_data = {
        transaction_amount: value,
        description: description,
        payment_method_id: "pix",
        payer: {
          email: "emailquaquer@sla.com",
          first_name: first_name,
        },
      };

      const request = await mercadopago.payment.create(payment_data as any);

      return {
        status: request.body.status,
        id: request.body.id,
        qr_code: request.body.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: request.body.point_of_interaction.transaction_data.qr_code_base64,
      };
    } catch (e) {
      return { 
        status: "error", 
        id: 0, 
        qr_code: "", 
        qr_code_base64: "" 
      };
    }
  }

  async status(id: number): Promise<string> {
    try {
      const request = await mercadopago.payment.get(id);
      return request.body.status;
    } catch (e) {
      return "error";
    }
  }

  async cancel(id: number): Promise<string> {
    try {
      const request = await mercadopago.payment.cancel(id);
      return request.body.status;
    } catch (e) {
      return "error";
    }
  }
}

export default new MercadoPago();
