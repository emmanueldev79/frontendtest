import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/productsSlice";
import { CreditCardModal } from "./CreditCardModal"; // Importa el modal

export const ContainerProducts = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.products);

  // Lee el estado inicial de localStorage o usa false si no existe
  const storedModalState = localStorage.getItem("isModalOpen") === "true";
  const storedProduct = localStorage.getItem("selectedProduct");
  const [isModalOpen, setIsModalOpen] = useState(storedModalState);
  const [selectedProduct, setSelectedProduct] = useState(
    storedProduct ? JSON.parse(storedProduct) : null
  ); // Recupera el producto seleccionado de localStorage, si existe

  // Callback para actualizar la lista de productos después de un pago exitoso
  const handlePagoExitoso = () => {
    dispatch(fetchProducts());
  };

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Al abrir o cerrar el modal, guardamos el estado en localStorage
  useEffect(() => {
    localStorage.setItem("isModalOpen", isModalOpen); // Almacena el estado en localStorage
  }, [isModalOpen]);

  // Guardar el producto seleccionado en localStorage cuando cambie
  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));
    }
  }, [selectedProduct]);

  const openModal = (product) => {
    setSelectedProduct(product); // Establece el producto seleccionado
    setIsModalOpen(true); // Abre el modal
  };
  const closeModal = () => {
    setIsModalOpen(false); // Cierra el modal
    localStorage.removeItem("selectedProduct"); // Elimina el producto seleccionado de localStorage cuando se cierra el modal
  };

  if (status === "loading") {
    return (
      <section className="container-products">
        <header>
          <h2>Products</h2>
        </header>
        <div className="grid-products">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (status === "failed") {
    return (
      <section className="container-products">
        <header>
          <h2>Products</h2>
        </header>
        <div className="grid-products">
          <p>Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-products">
      <header>
        <h2>Products</h2>
      </header>
      <div className="grid-products">
        {items.length === 0 ? (
          <p>No products available</p>
        ) : (
          items.map((product) => (
            <article key={product.id} className="product">
              <h4>{product.name}</h4>
              <small>{product.description}</small>
              <p>Stock: {product.stock}</p>
              <p className="price">$ {product.price} COP</p>
              <button
                className="btn-payment"
                onClick={() => openModal(product)}
              >
                Pagar con tarjeta de crédito
              </button>
            </article>
          ))
        )}
      </div>

      {/* Renderiza el modal */}
      <CreditCardModal
        isOpen={isModalOpen}
        closeModal={closeModal}
        onPagoExitoso={handlePagoExitoso} // Pasamos el callback
        product={selectedProduct} // Pasa el producto seleccionado
      />
    </section>
  );
};
