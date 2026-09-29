import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloating } from '@/components/WhatsAppFloating';

export const metadata = {
  title: 'i7 Proptech | Imóveis em Sorocaba e Região',
  description: 'Encontre apartamentos, casas e studios para alugar e comprar em Sorocaba e região. Visitas online, aprovação sem fiador e contratos 100% digitais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text-primary min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <WhatsAppFloating />
      </body>
    </html>
  );
}

