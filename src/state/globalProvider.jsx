import PropTypes from 'prop-types';
GlobalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
import { useState } from 'react';
import GlobalContext from "./globalContext";

function GlobalProvider(props) {
  const [cart, setCart] = useState([]);
  const [user, _setUser] = useState({ name: "Barney" });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Function to add a product to the cart
  const addProductToCart = (product) => {
    console.log('Adding to cart:', JSON.stringify(product, null, 2));
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: product.quantity || (item.quantity + 1) }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: product.quantity || 1 }];
      }
    });
  };

  // Function to clear the cart
  const clearCart = () => {
    setCart([]);
  };

  // Function to remove a product from the cart
  const removeProductFromCart = (productId) => {
    console.log("Removing ", productId);
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };

  // Function to update the quantity of a cart item
  const updateCartItemQuantity = (productId, newQuantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // Cart open/close handlers
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <GlobalContext.Provider value={{
      cart: cart,
      user: user,
      addProductToCart: addProductToCart,
      clearCart: clearCart,
      removeProductFromCart: removeProductFromCart,
      updateCartItemQuantity: updateCartItemQuantity,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {props.children}
    </GlobalContext.Provider>
  );
}

export default GlobalProvider;