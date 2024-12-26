import { useState, useEffect } from "react";
import ImageChip from "../images/chip.png";
import delivery from "../images/delivery.svg";
import car from "../images/car.svg";
import axios from "axios"; // Si prefieres axios en lugar de fetch

// Funciones de validación para VISA y MasterCard
const isVisa = (cardNumber) => /^4\d{12,18}$/.test(cardNumber); // VISA: Empieza con 4 y 13-16 dígitos
const isMasterCard = (cardNumber) => /^5\d{15}$/.test(cardNumber); // MasterCard: Empieza con 5 y 16 dígitos

export const CreditCardModal = ({
  isOpen,
  closeModal,
  product,
  onPagoExitoso,
}) => {
  const [cardNumber, setCardNumber] = useState(Array(4).fill("")); // Inicializa un array con 4 elementos vacíos (para 4 bloques de 4 dígitos)
  useEffect(() => {
    if (localStorage.getItem("cardNumber")) {
      setCardNumber(JSON.parse(localStorage.getItem("cardNumber")));

      const fullCardNumber = JSON.parse(
        localStorage.getItem("cardNumber")
      ).join("");

      if (isVisa(fullCardNumber)) {
        setCardType("VISA");
      } else if (isMasterCard(fullCardNumber)) {
        setCardType("MasterCard");
      } else {
        setCardType(null); // Si no es ni VISA ni MasterCard
      }
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("expiryDate")) {
      setExpiryDate(JSON.parse(localStorage.getItem("expiryDate")));
    } else {
      setExpiryDate("");
    }
    if (localStorage.getItem("cvv")) {
      setCvv(JSON.parse(localStorage.getItem("cvv")));
    } else {
      setCvv("");
    }
    if (localStorage.getItem("shippingAddress")) {
      setShippingAddress(JSON.parse(localStorage.getItem("shippingAddress")));
    } else {
      setShippingAddress("");
    }
    if (localStorage.getItem("name")) {
      setName(JSON.parse(localStorage.getItem("name")));
    } else {
      setName("");
    }
  }, [closeModal]);

  // console.log(cardNumber);
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState(null); // Guardará el tipo de tarjeta
  const [shippingAddress, setShippingAddress] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1); // Paso actual del formulario (1: formulario, 2: resumen)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false); // Controla el mensaje de confirmación
  const [showInfoDelivery, setShowInfoDelivery] = useState(false); // Controla el mensaje de confirmación
  const [showInfoPayment, setShowInfoPayment] = useState(false); // Controla el mensaje de confirmación
  const [paymentIsLoading, setPaymentIsLoading] = useState(false); // Controla el mensaje de confirmación
  const [infoDelivery, setInfoDelivery] = useState(); // Controla el mensaje de confirmación
  const [showError, setShowError] = useState({
    numeroTarjeta: "",
    expiryDate: "",
    cvv: "",
    direccion: "",
    name: "",
  }); // Controla el mensaje de confirmación

  // Datos de resumen de pago en Pesos Colombianos (COP)
  const baseFee = 40000; // Tarifa base agregada siempre en COP
  const shippingFee = 20000; // Tarifa de envío en COP
  useEffect(() => {}, [showInfoDelivery, showInfoPayment]);

  // Resetear el formulario cuando la modal se cierre
  useEffect(() => {
    if (!isOpen) {
      // Limpiar los campos cuando la modal se cierre
      setCardNumber(Array(4).fill(""));
      setExpiryDate("");
      setCvv("");
      setCardType(null);
      setName("");
      setShippingAddress("");
      setStep(1);
      setShowCancelConfirmation(false);
      setShowInfoDelivery(false);

      localStorage.setItem("expiryDate", "");
      localStorage.setItem("cvv", "");
      localStorage.setItem("cardNumber", "");
      localStorage.setItem("selectedProduct", "");
      localStorage.setItem("shippingAddress", "");
    }

    if (isOpen) {
      localStorage.setItem("isModalOpen", "true");
    } else {
      localStorage.setItem("isModalOpen", "false");
    }
  }, [isOpen]);

  // Nueva funcionalidad para enviar los datos al backend
  const sendTransactionToBackend = async (transactionData) => {
    try {
      const response = await axios.post(
        "https://fullstack-test2024-production.up.railway.app/transactions",
        transactionData
      ); // URL del endpoint
      console.log("Transacción exitosa:", response);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error en la transacción:", error);
      return { success: false, error: error.response?.data || error.message };
    }
  };

  // Completar el modal
  const handlePaymentConfirmation = async () => {
    const transactionData = {
      cardNumber: cardNumber.join(""), // Número completo de la tarjeta
      expiryDate,
      cvv,
      shippingAddress,
      productName:
        product?.name ||
        JSON.parse(localStorage.getItem("selectedProduct"))?.name,
      productPrice:
        product?.price ||
        JSON.parse(localStorage.getItem("selectedProduct"))?.price,
      baseFee,
      shippingFee,
      totalAmount:
        (product?.price ||
          JSON.parse(localStorage.getItem("selectedProduct"))?.price) +
        baseFee +
        shippingFee,
      cardType,
      namePerson: name,
    };

    setPaymentIsLoading(true);
    setShowInfoPayment(false);
    // setShowInfoDelivery(false);
    // paymentIsLoading(false);
    // Llamar al backend
    const result = await sendTransactionToBackend(transactionData);

    if (result.success) {
      setPaymentIsLoading(false);
      setInfoDelivery(result.data);
      // Limpiar los campos cuando la modal se cierre
      setCardNumber(Array(4).fill(""));
      setExpiryDate("");
      setCvv("");
      setCardType(null);
      setName("");
      setShippingAddress("");
      setShowInfoDelivery(true);
      setShowInfoPayment(false);
      localStorage.setItem("expiryDate", "");
      localStorage.setItem("cvv", "");
      localStorage.setItem("cardNumber", "");
      localStorage.setItem("selectedProduct", "");
      localStorage.setItem("name", "");
      localStorage.setItem("shippingAddress", "");

      const newDelivery = result.data;
      let deliveries = JSON.parse(localStorage.getItem("delivery")) || [];
      if (!Array.isArray(deliveries)) {
        deliveries = [];
      }

      deliveries.push(newDelivery);

      localStorage.setItem("delivery", JSON.stringify(deliveries));

      setTimeout(() => {
        setShowInfoDelivery(false);
        closeModal();
      }, 4000);
      // closeModal();
      onPagoExitoso();
      // alert("Pago realizado con éxito");
      // closeModal(); // Cierra el modal después de un pago exitoso
    } else {
      alert("Error en el procesamiento del pago: " + result.error);
    }
  };

  // Función para ocultar los errores después de 4 segundos
  const hideErrors = () => {
    setTimeout(() => {
      setShowError({
        numeroTarjeta: "",
        expiryDate: "",
        cvv: "",
        direccion: "",
        name: "",
      });
    }, 4000);
  };

  // Handle cambio en los inputs de número de tarjeta
  const handleCardNumberChange = (e, index) => {
    const value = e.target.value;
    const newCardNumber = [...cardNumber];

    if (value.length <= 4 && /^[0-9]*$/.test(value)) {
      newCardNumber[index] = value;
      setCardNumber(newCardNumber);
      localStorage.setItem("cardNumber", JSON.stringify(newCardNumber));

      const fullCardNumber = newCardNumber.join("");
      if (isVisa(fullCardNumber)) {
        setCardType("VISA");
      } else if (isMasterCard(fullCardNumber)) {
        setCardType("MasterCard");
      } else {
        setCardType(null); // Si no es ni VISA ni MasterCard
      }

      // Mover al siguiente input si el actual está lleno
      if (value.length === 4 && index < cardNumber.length - 1) {
        document.getElementById(`card-input-${index + 1}`).focus();
      }
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, ""); // Eliminar cualquier carácter no numérico
    if (value.length <= 4) {
      if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`; // Inserta el '/' después de los dos primeros números
      }
      setExpiryDate(value);
      localStorage.setItem("expiryDate", JSON.stringify(value));
    }
  };
  const handleCvv = (e) => {
    setCvv(e.target.value);
    localStorage.setItem("cvv", JSON.stringify(e.target.value));
  };

  const handleShippingAddress = (e) => {
    setShippingAddress(e.target.value);
    localStorage.setItem("shippingAddress", JSON.stringify(e.target.value));
  };
  const handleName = (e) => {
    setName(e.target.value);
    localStorage.setItem("name", JSON.stringify(e.target.value));
  };

  // Handle envío del formulario con validación de campos
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de los campos
    if (!cardNumber.every((block) => block !== "")) {
      setShowError((prevState) => ({
        ...prevState, // Mantener los valores previos
        numeroTarjeta:
          "Por favor, complete todos los bloques del número de tarjeta.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }
    if (cardType === null) {
      console.log(cardType);
      setShowError((prevState) => ({
        ...prevState, // Mantener los valores previos
        numeroTarjeta: "Por favor, el numero de tarjeta es incorrecto.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }

    if (!expiryDate) {
      setShowError((prevState) => ({
        ...prevState,
        expiryDate: "Por favor, ingrese la fecha de expiración.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }

    if (!cvv) {
      setShowError((prevState) => ({
        ...prevState,
        cvv: "Por favor, ingrese el CVV.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }

    if (!shippingAddress) {
      setShowError((prevState) => ({
        ...prevState,
        direccion: "Por favor, ingrese la dirección de envío.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }
    if (!name) {
      setShowError((prevState) => ({
        ...prevState,
        name: "Por favor, ingrese su nombre.",
      }));
      hideErrors(); // Ocultar errores después de 4 segundos
      return;
    }

    setShowInfoPayment(true);
    setStep(2); // Cambiar al paso del resumen si todos los campos son válidos
  };

  // Maneja el cierre de la modal con confirmación
  const handleCloseModal = () => {
    if (step === 2) {
      setStep(1); // Volver al formulario si estamos en el paso de resumen
    } else {
      setShowCancelConfirmation(true); // Mostrar confirmación de cancelación
    }
  };

  // Maneja la confirmación de cancelación
  const handleCancelPurchase = (confirm) => {
    if (confirm) {
      closeModal(); // Cerrar la modal si el usuario confirma
    }
    setShowCancelConfirmation(false); // Cerrar el cuadro de confirmación
  };

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Mostrar resumen de pago si el paso es 2
  if (step === 2) {
    const totalAmount = product.price + baseFee + shippingFee;

    return (
      <>
        <div className="modal-overlay">
          {showInfoPayment && (
            <div className="modal">
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
              <h3>Resumen de Pago</h3>
              <div className="summary-item">
                <span>Producto:</span>
                <span>{product.name}</span>
              </div>
              <div className="summary-item">
                <span>Precio del Producto:</span>
                <span>${product.price.toLocaleString("es-CO")}</span>
              </div>
              <div className="summary-item">
                <span>Fecha de Expiración:</span>
                <span>{expiryDate}</span>
              </div>
              <div className="summary-item">
                <span>CVV:</span>
                <span>{cvv}</span>
              </div>
              <div className="summary-item">
                <span>Dirección de Envío:</span>
                <span>{shippingAddress}</span>
              </div>

              {/* Detalles de costos */}
              <div className="summary-item">
                <span>Monto del producto:</span>
                <span>${product.price.toLocaleString("es-CO")}</span>
              </div>
              <div className="summary-item">
                <span>Tarifa base:</span>
                <span>${baseFee.toLocaleString("es-CO")}</span>
              </div>
              <div className="summary-item">
                <span>Tarifa de envío:</span>
                <span>${shippingFee.toLocaleString("es-CO")}</span>
              </div>
              <div className="summary-item total">
                <span>Total a pagar:</span>
                <span>${totalAmount.toLocaleString("es-CO")}</span>
              </div>

              <button
                className="btn-submit"
                onClick={handlePaymentConfirmation}
              >
                Confirmar Pago
              </button>
            </div>
          )}

          {paymentIsLoading && (
            <section
              className="modal deliveryContent"
              style={{
                display: paymentIsLoading ? "block" : "none",
              }}
            >
              <h1>Procesando pedido</h1>
              <img src={delivery} alt="" className="deliveryImg" />
              <div className="carretera">
                <img src={car} alt="" className="car" />
                <div className="circle">STOP</div>
                <div className="line"></div>
                <div className="lineYellow"></div>
                <div className="lineYellow"></div>
                <div className="lineYellow"></div>
                <div className="lineYellow"></div>
                <div className="lineYellow"></div>
                <div className="lineYellow"></div>
              </div>
            </section>
          )}
          {console.log(showInfoDelivery)}
          {showInfoDelivery && (
            <section className="modal infoDelivery">
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
              <h1>Datos del pedido</h1>
              <p>Direccion: {infoDelivery.address}</p>
              <p>Fecha: {infoDelivery.deliveryDate}</p>
              <p>Producto: {infoDelivery.product}</p>
              <p>Estado: {infoDelivery.status}</p>
            </section>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={handleCloseModal}>
          ×
        </button>
        {showCancelConfirmation && (
          <div className="cancel-confirmation">
            <p>¿Seguro que deseas cancelar la compra?</p>
            <button
              className="btn-yes"
              onClick={() => handleCancelPurchase(true)}
            >
              Sí
            </button>
            <button
              className="btn-no"
              onClick={() => handleCancelPurchase(false)}
            >
              No
            </button>
          </div>
        )}
        {/* <h3>Información de tarjeta de crédito</h3> */}
        <form onSubmit={handleSubmit} style={{ margin: "0 auto" }}>
          {/* Input para cada bloque de 4 dígitos */}
          <section
            className={`content-card ${
              cardType === "VISA"
                ? "visa"
                : cardType === "MasterCard"
                ? "mastercard"
                : ""
            }`}
            style={{
              backgroundColor:
                cardType === "VISA"
                  ? "#004C99" // Azul para VISA
                  : cardType === "MasterCard"
                  ? "#414E5E" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                  : "#D1D3D8", // Gris claro por defecto
              boxShadow:
                cardType === "VISA"
                  ? "0 4px 6px rgba(0, 76, 153, 0.9)"
                  : cardType === "MasterCard"
                  ? "0 4px 6px rgba(65, 78, 94, 0.9)"
                  : "0 2px 4px rgba(0, 0, 0, 0.4)",
              display: showCancelConfirmation ? "none" : "block",
            }}
          >
            {console.log(cardType)}
            {cardType === "VISA" ? (
              <h2 className="title-card">Visa</h2>
            ) : cardType === "MasterCard" ? (
              <h2 className="title-card">Mastercard</h2>
            ) : (
              <h2></h2>
            )}
            <img src={ImageChip} alt="" className="chip" />
            <div className="card-number-inputs">
              {cardNumber.map((block, index) => (
                <input
                  key={index}
                  id={`card-input-${index}`} // ID único para cada input
                  type="text"
                  value={block}
                  onChange={(e) => handleCardNumberChange(e, index)}
                  maxLength="4"
                  placeholder={`XXXX`}
                  style={{
                    backgroundColor:
                      cardType === "VISA"
                        ? "transparent" // Azul para VISA
                        : cardType === "MasterCard"
                        ? "transparent" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                        : "white", // Gris claro por defecto
                    border:
                      cardType === "VISA"
                        ? "1px solid rgb(33, 117, 200)" // Azul para VISA
                        : cardType === "MasterCard"
                        ? "1px solid rgba(166, 166, 166, 0.3)" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                        : "1px solid gray", // Gris claro por defecto
                    boxShadow:
                      cardType === "VISA"
                        ? "none" // Azul para VISA
                        : cardType === "MasterCard"
                        ? "none" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                        : "0 0 8px rgba(52, 152, 219, 0.6)", // Gris claro por defecto
                    color:
                      cardType === "VISA"
                        ? "white" // Azul para VISA
                        : cardType === "MasterCard"
                        ? "white" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                        : "black", // Gris claro por defecto
                  }}
                />
              ))}
            </div>

            <div className="expiryDate">
              <div
                className="label-expiryDate"
                style={{
                  color:
                    cardType === "VISA"
                      ? "white" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "white" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "black", // Gris claro por defecto
                }}
              >
                <small>VALIDO</small>
                <br />
                <small className="smallDos">HASTA</small>
              </div>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/AA"
                maxLength="5"
                style={{
                  backgroundColor:
                    cardType === "VISA"
                      ? "transparent" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "transparent" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "white",
                  boxShadow:
                    cardType === "VISA"
                      ? "none" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "none" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "none", // Gris claro por defecto
                  color:
                    cardType === "VISA"
                      ? "white" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "white" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "black", // Gris claro por defecto
                  outline:
                    cardType === "VISA"
                      ? "none" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "none" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "none", // Gris claro por defecto
                  border:
                    cardType === "VISA"
                      ? "none" // Azul para VISA
                      : cardType === "MasterCard"
                      ? "none" // Naranja para MasterCard (puedes ajustarlo según lo que prefieras)
                      : "none", // Gris claro por defecto
                }}
              />
            </div>
            {showError.numeroTarjeta && (
              <p
                style={{
                  color: "red",
                  marginBottom: "8px",
                  fontSize: "15px",
                  display: "block",
                }}
              >
                {showError.numeroTarjeta}
              </p>
            )}
            {showError.expiryDate && (
              <p
                style={{
                  color: "red",
                  marginBottom: "8px",
                  fontSize: "15px",
                  display: "block",
                }}
              >
                {showError.expiryDate}
              </p>
            )}

            {/* Logotipo de la tarjeta debajo de los inputs */}
            {cardType && (
              <div className="card-type">
                <img
                  src={`src/images/${cardType.toLowerCase()}-logo.png`} // Logotipo de tarjeta (ajusta la ruta según tu estructura)
                  alt={cardType}
                  width="40"
                />
              </div>
            )}
          </section>

          {/* Inputs para fecha de expiración, CVV y dirección de envío */}

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="text"
              value={cvv}
              onChange={(e) => handleCvv(e)}
              placeholder="CVV"
              maxLength="3"
              style={{
                marginBottom: "8px",
                width: "58px",
                marginRight: "8px",
                marginTop: "18px",
                display: showCancelConfirmation ? "none" : "block",
              }}
            />
            {showError.cvv && (
              <p
                style={{
                  color: "red",
                  fontSize: "15px",
                  display: "block",
                }}
              >
                {showError.cvv}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => handleShippingAddress(e)}
              placeholder="Dirección de Envío"
              style={{
                width: "153px",
                display: showCancelConfirmation ? "none" : "block",
              }}
            />
            {showError.direccion && (
              <p
                style={{
                  color: "red",
                  fontSize: "15px",
                  display: "block",
                }}
              >
                {showError.direccion}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "8px",
            }}
          >
            <input
              type="text"
              value={name}
              onChange={(e) => handleName(e)}
              placeholder="Nombre"
              style={{
                width: "153px",
                display: showCancelConfirmation ? "none" : "block",
              }}
            />
            {showError.name && (
              <p
                style={{
                  color: "red",
                  fontSize: "15px",
                  display: "block",
                }}
              >
                {showError.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
            style={{
              display:
                showCancelConfirmation ||
                showError.numeroTarjeta ||
                showError.expiryDate ||
                showError.direccion ||
                showError.cvv
                  ? "none"
                  : "block",
            }}
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
};
