import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Layout for public pages (non-admin routes)
 * Includes Header (navigation bar) and Footer
 * This layout wraps all pages EXCEPT /admin routes
 */
export default function PublicPagesLayout({ children }) {
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
