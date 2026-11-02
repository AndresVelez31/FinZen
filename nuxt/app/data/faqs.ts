// Internal imports
import type { FaqInterface } from '~/interfaces/FaqInterface';

// Exports
export const FAQS: FaqInterface[] = [
  {
    question: '¿Qué es una cuenta en FinZen?',
    answer:
      'Una cuenta representa un lugar donde guardas tu dinero: una cuenta de ahorros, una billetera digital o el efectivo. Su saldo se calcula a partir de las transacciones que registras.',
  },
  {
    question: '¿Qué son las actividades?',
    answer:
      'Las actividades son presupuestos de gasto y metas de ahorro. Te permiten comparar lo que planeaste con lo que realmente gastaste o ahorraste.',
  },
  {
    question: '¿Cómo registro una transacción?',
    answer:
      'Desde la sección de transacciones eliges la cuenta, el tipo (ingreso o gasto), el monto y la fecha. Si quieres, la asocias a una actividad para llevar el control de tu presupuesto.',
  },
  {
    question: '¿Mis datos son privados?',
    answer:
      'Sí. Cada usuario solo puede ver y modificar sus propias cuentas, transacciones y actividades; un registro ajeno responde como si no existiera.',
  },
  {
    question: '¿Puedo cambiar el tema de la aplicación?',
    answer:
      'Sí. FinZen tiene un tema claro y uno oscuro, y puedes alternar entre ellos desde la barra superior.',
  },
];
