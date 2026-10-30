import { createContext, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState([]);


    function addToCart(event) {

        setCartItems(function (previousItems) {

            return [

                ...previousItems,
                event

            ];

        });

    }


    return (

        <CartContext.Provider
            value={{
                cartItems,
                addToCart
            }}
        >

            {children}

        </CartContext.Provider>

    );

}