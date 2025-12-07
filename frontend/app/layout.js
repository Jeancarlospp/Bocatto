import "./globals.css";

export const metadata = {
  title: "Bocatto Restaurant",
  description: "Deliciosa comida para todos los gustos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
