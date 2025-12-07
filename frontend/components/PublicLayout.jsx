import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Layout for public pages
 * Includes Header (navigation bar) and Footer
 * Used by: /, /menu, /reservations, /offers, /locations, /about, /contact, /login
 */
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
