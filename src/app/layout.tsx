import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GymProManager — Salud & Fuerza',
  description: 'Gestión del gimnasio Salud & Fuerza: miembros, pagos y asistencias.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
