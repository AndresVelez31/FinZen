// Internal imports
import type { NavItemInterface } from '~/interfaces/NavItemInterface';
import type { SectionCardInterface } from '~/interfaces/SectionCardInterface';

// Exports
export const NAV_ITEMS: NavItemInterface[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Blog', to: '/blog' },
  { label: 'Cuentas', to: '/accounts' },
  { label: 'Herramientas', to: '/tools' },
];

export const SECTION_CARDS: SectionCardInterface[] = [
  {
    title: 'Blog',
    description: 'Artículos de finanzas personales escritos para el contexto colombiano.',
    to: '/blog',
    renderMode: 'SSG',
  },
  {
    title: 'Cuentas',
    description: 'Tus cuentas y sus saldos, servidos por la API del servidor de Nuxt.',
    to: '/accounts',
    renderMode: 'SSR',
  },
  {
    title: 'Herramientas',
    description: 'Calculadora de ahorro y preguntas frecuentes sobre FinZen.',
    to: '/tools',
    renderMode: 'CSR',
  },
];
