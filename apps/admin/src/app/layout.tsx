import './globals.css';

export const metadata = {
  title: 'i7 Back-Office | Moderacao e Gestao Financeira',
  description: 'Painel Administrativo para aprovacao de imoveis, repetes e moderacao',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0F1115] text-[#F3F4F6] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
