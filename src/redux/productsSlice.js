import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Estado inicial
const initialState = {
  items: [],
  status: "idle", // Estado de la carga
  error: null, // Error en caso de que ocurra
};

// Definimos el Thunk asíncrono
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts", // Nombre del Thunk
  async () => {
    const response = await fetch(
      "https://fullstack-test2024-production.up.railway.app/products"
    );

    // Verificación de respuesta
    if (!response.ok) {
      // Si no es una respuesta exitosa, lanza un error con un mensaje
      throw new Error("Failed to fetch products");
    }
    // Suponemos que la respuesta es JSON
    return response.json();
  }
);

// Reducer para manejar el estado de productos
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Manejo del estado cuando la solicitud está pendiente
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading"; // Se está cargando
      })
      // Manejo cuando la solicitud es exitosa
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded"; // Carga completada con éxito
        state.items = action.payload; // Guardamos los productos en el estado
      })
      // Manejo de error si la solicitud falla
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed"; // Estado de fallo
        state.error = action.error.message; // Guardamos el mensaje de error
      });
  },
});

export default productsSlice.reducer;
