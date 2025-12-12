import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

export const metadata = {
  title: "Bocatto Restaurant",
  description: "Deliciosa comida para todos los gustos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
