import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice";

const store = configureStore({
  reducer: {
    products: productsReducer,
  },
  // Si deseas añadir DevTools de manera explícita (aunque Redux Toolkit lo maneja por defecto)
});

export default store;
