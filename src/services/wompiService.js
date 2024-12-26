import axios from "axios";

const BASE_URL = "https://api-sandbox.co.uat.wompi.dev/v1"; // Usar la URL de sandbox o producción según sea el caso.

export const createPayment = async (amount, currency = "COP", email) => {
  try {
    const response = await axios.post(`${BASE_URL}/payment_sessions`, {
      amount_in_cents: amount * 100, // Wompi usa centavos
      currency,
      reference: `order_${Date.now()}`,
      email,
    });

    return response.data;
  } catch (error) {
    console.error("Error al crear la sesión de pago:", error);
    throw error;
  }
};
