import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from '../pages/Dashboard/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO OK LOAD ITEMS FROM ASYNC STORAGE

      const str = await AsyncStorage.getItem('products');

      if (str) {
        const prods = JSON.parse(str);
        prods.filter(value => value.quantity > 0);

        setProducts(prods);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO OK ADD A NEW ITEM TO THE CART

      const productAlreadyAddedToCart = products.find(
        value => value.id === product.id,
      );

      if (!productAlreadyAddedToCart) {
        const productToAdd: Product = {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        };

        const arr = products.slice().concat(productToAdd);
        setProducts(arr);
        await AsyncStorage.setItem('products', JSON.stringify(arr));
      } else {
        increment(productAlreadyAddedToCart.id);
      }
    },
    [products, increment],
  );

  const increment = useCallback(
    async id => {
      // TODO OK INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productFinded = products.find(value => value.id == id);
      if (productFinded) {
        productFinded.quantity += 1;
        const newProducts = products.map(value => {
          if (value.id === id) {
            return productFinded;
          }
          return value;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem('products', JSON.stringify(newProducts));
      }
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO OK DECREMENTS A PRODUCT QUANTITY IN THE CART

      const productFinded = products.find(value => {
        return value.id == id;
      });

      if (productFinded && productFinded.quantity >= 1) {
        productFinded.quantity -= 1;

        const newProducts = products.map(value => {
          if (value.id === id) {
            return productFinded;
          }
          return value;
        });
        setProducts(newProducts);
      }
      await AsyncStorage.setItem('products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
