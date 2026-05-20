import { TopMenu, Sidebar, Footer } from "@/components";

export default function ShopLayout({
 children
}: {
 children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">

      <TopMenu />

      <Sidebar />

      <div className="px-3 sm:px-10 flex-1">
        { children }
      </div>

      <Footer />

    </main>
  );
}