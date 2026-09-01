# Guía de Arquitectura, Código Limpio y Metodología de Trabajo

> Documento de referencia para replicar la organización arquitectónica,
> las convenciones de código y la metodología de trabajo utilizadas en
> el proyecto de Ingeniería de Software para Aplicaciones Web.
>
> **Objetivo:** que cualquier integrante pueda desarrollar una
> funcionalidad nueva sin romper la arquitectura existente ni introducir
> una organización diferente.

------------------------------------------------------------------------

## 1. Propósito y alcance

Esta guía define las reglas que deben seguirse para:

-   tomar decisiones arquitectónicas;
-   organizar carpetas y archivos;
-   separar responsabilidades;
-   diseñar las vistas, componentes, servicios y stores;
-   modelar entidades mediante interfaces y DTOs;
-   trabajar con Vue 3, TypeScript, Vue Router y Pinia;
-   aplicar principios de código limpio;
-   utilizar utilidades, `computed`, `watch` y componentes
    reutilizables;
-   mantener consistencia visual;
-   controlar calidad mediante TypeScript, ESLint/OXLint y Prettier;
-   trabajar colaborativamente mediante GitHub;
-   revisar cambios antes de incorporarlos a la rama principal;
-   documentar las decisiones que afecten la arquitectura.

La regla fundamental es:

> **Una funcionalidad nueva debe adaptarse a la arquitectura existente.
> No se debe modificar la arquitectura para acomodar una implementación
> rápida.**

------------------------------------------------------------------------

# 2. Principios arquitectónicos

## 2.1 Separación de responsabilidades

Cada parte del sistema debe tener una responsabilidad clara.

  -----------------------------------------------------------------------
  Capa                    Responsabilidad         No debe hacer
  ----------------------- ----------------------- -----------------------
  `views/`                Componer páginas y      Contener lógica de
                          coordinar la interfaz   negocio compleja

  `components/`           Encapsular UI           Conocer toda la
                          reutilizable            aplicación

  `services/`             Lógica de negocio y     Renderizar HTML
                          acceso al estado        

  `stores/`               Mantener estado global  Implementar reglas de
                                                  negocio

  `interfaces/`           Definir contratos de    Ejecutar lógica
                          datos                   

  `dtos/`                 Definir datos de        Mantener estado
                          entrada/salida          

  `utils/`                Funciones técnicas      Acceder al store o
                          reutilizables y puras   modificar estado global

  `router/`               Definir navegación y    Implementar lógica de
                          protección de rutas     negocio

  `assets/`               Recursos estáticos y    Contener lógica de
                          CSS de entrada          aplicación
  -----------------------------------------------------------------------

No se debe colocar una función en una carpeta solamente porque "funciona
allí". Debe ubicarse según su responsabilidad.

------------------------------------------------------------------------

## 2.2 Flujo de dependencias del frontend

El frontend utiliza una arquitectura modular por capas.

La dependencia principal es:

``` text
View
  ↓
Service
  ↓
Store
```

Y para tipos:

``` text
View / Component
       ↓
      DTO / Interface
```

Para utilidades:

``` text
View / Component / Service
          ↓
        Utils
```

La regla más importante es:

``` text
VIEW → SERVICE → STORE
```

No:

``` text
VIEW → STORE
```

Las vistas y componentes no deben acceder directamente a los stores
cuando la operación corresponde a lógica de negocio. El Service actúa
como punto de entrada de las operaciones del dominio.

Esta separación fue introducida progresivamente en los tutoriales:
primero se accedía directamente a los datos, posteriormente se introdujo
la capa `services`, y finalmente Pinia como mecanismo de estado
persistente. El tutorial de servicios muestra explícitamente la
sustitución del acceso directo a los datos por `BookService`, y
posteriormente el reemplazo de los datos en `src/data` por stores y
seeders.

------------------------------------------------------------------------

# 3. Decisiones arquitectónicas principales

## ADR-001 --- Vue 3 como framework frontend

### Decisión

El frontend se desarrolla utilizando Vue 3 con Composition API.

### Razones

-   permite construir una SPA;
-   facilita la composición de funcionalidades;
-   proporciona reactividad;
-   permite separar páginas y componentes;
-   se integra naturalmente con Vue Router y Pinia;
-   TypeScript proporciona tipado estático.

Los tutoriales del curso construyen progresivamente una SPA con Vue,
Router, TypeScript, Pinia, servicios, DTOs, componentes, `computed` y
`watch`. fileciteturn4file3

### Regla

No utilizar Options API en el proyecto.

Debe utilizarse:

``` vue
<script setup lang="ts">
```

------------------------------------------------------------------------

## ADR-002 --- SPA + CSR

El proyecto actual corresponde a una **SPA (Single Page Application)**
con **CSR (Client-Side Rendering)**.

La aplicación carga inicialmente HTML, JavaScript y CSS. Posteriormente
Vue controla la interfaz, la navegación y la actualización del DOM sin
recargar completamente la página.

Esto es diferente de la arquitectura MPA/SSR estudiada con Express/EJS.
Las presentaciones distinguen explícitamente MPA/SSR de SPA/CSR.
fileciteturn2file5

### Regla

Para el proyecto frontend:

``` text
Browser
   ↓
Vue Application
   ├── Router
   ├── Views
   ├── Components
   ├── Services
   └── Pinia Store
```

------------------------------------------------------------------------

## ADR-003 --- Vue Router para navegación

Toda página de la aplicación debe estar representada por una ruta.

Cada ruta debe apuntar a una vista.

Ejemplo:

``` typescript
{
  path: '/transactions',
  name: 'transactions',
  component: TransactionsIndexView,
  meta: {
    title: 'Transactions',
  },
}
```

### Reglas

1.  Toda ruta debe tener una vista asociada.
2.  Toda vista que represente una página debe terminar en `View`.
3.  Las rutas deben utilizar `createWebHistory`.
4.  Cada ruta debe definir `meta.title`.
5.  Los nombres de rutas deben ser consistentes.
6.  Las rutas con parámetros deben validar el parámetro antes de
    utilizarlo.
7.  Las rutas administrativas deben utilizar guardas.
8.  No se debe implementar navegación manual mediante cambios
    arbitrarios de `window.location`.

El patrón utilizado en los tutoriales define rutas como `/books`,
`/books/create` y `/books/:id`, asociadas respectivamente a vistas
`BooksIndexView`, `BooksCreateView` y `BooksShowView`.
fileciteturn4file5turn4file6

------------------------------------------------------------------------

## ADR-004 --- Pinia para estado global

Pinia es el mecanismo de estado global.

El store debe ser deliberadamente simple.

Ejemplo:

``` typescript
export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<TransactionInterface[]>([]);

  return {
    transactions,
  };
});
```

### El store NO debe

-   validar formularios;
-   calcular reglas de negocio;
-   formatear monedas;
-   filtrar datos para una pantalla concreta;
-   realizar navegación;
-   manipular directamente componentes;
-   contener múltiples operaciones complejas;
-   convertirse en una segunda capa de servicios.

### El Service SÍ debe

-   leer el store;
-   modificar el store;
-   validar datos;
-   sanear entradas;
-   realizar búsquedas;
-   crear, actualizar y eliminar entidades;
-   encapsular las reglas del dominio.

Los tutoriales evolucionan desde acceso directo a datos hacia
`BookService` y posteriormente hacia Pinia, manteniendo el store como
contenedor del estado. fileciteturn4file2turn4file7

------------------------------------------------------------------------

## ADR-005 --- Services como clases con métodos estáticos

Los services se implementan como clases.

``` typescript
export class TransactionService {
  static getTransactions(): TransactionInterface[] {
    // ...
  }

  static createTransaction(dto: CreateTransactionDTO): void {
    // ...
  }
}
```

### No utilizar

``` typescript
export class TransactionService {
  constructor(private store: TransactionStore) {}
}
```

La arquitectura utilizada en los tutoriales establece explícitamente
services con métodos estáticos. fileciteturn3file6

### Razón

Para el alcance actual:

-   reduce complejidad;
-   evita instanciación innecesaria;
-   agrupa operaciones relacionadas;
-   hace explícito el dominio de cada servicio.

Si un proyecto futuro requiere inyección de dependencias, múltiples
implementaciones o testing avanzado, esta decisión puede revisarse
mediante una ADR.

------------------------------------------------------------------------

# 4. Modelo de datos: Interfaces y DTOs

## 4.1 Interface

Cada entidad del dominio debe tener una interface.

Ejemplo:

``` typescript
export interface TransactionInterface {
  id: string;
  userId: string;
  accountId: string;
  activityId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}
```

La interface representa la entidad completa.

------------------------------------------------------------------------

## 4.2 DTO

Las operaciones que reciben datos deben utilizar DTOs.

Ejemplo:

``` typescript
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';

export type CreateTransactionDTO = Omit<TransactionInterface, 'id'>;
```

### Regla obligatoria

No duplicar manualmente los campos de la entidad.

Incorrecto:

``` typescript
export interface CreateTransactionDTO {
  userId: string;
  accountId: string;
  activityId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}
```

Correcto:

``` typescript
export type CreateTransactionDTO =
  Omit<TransactionInterface, 'id'>;
```

Los tutoriales introducen explícitamente `Omit<>` para construir DTOs
derivados de las interfaces. fileciteturn4file0

------------------------------------------------------------------------

## 4.3 Regla para futuras operaciones

Cuando existan diferentes operaciones:

``` text
CreateXxxDTO
UpdateXxxDTO
FilterXxxDTO
ResponseXxxDTO
```

Los DTOs deben derivarse de las interfaces siempre que sea razonable.

Ejemplo:

``` typescript
export type UpdateTransactionDTO =
  Partial<Omit<TransactionInterface, 'id'>>;
```

No utilizar DTOs como sustituto de interfaces de dominio.

------------------------------------------------------------------------

# 5. Estructura de carpetas

Para el frontend:

``` text
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── input.css
│   │
│   ├── components/
│   │   ├── TablaGenerica.vue
│   │   ├── SelectorFiltro.vue
│   │   └── GraficoChart.vue
│   │
│   ├── dtos/
│   │   ├── CreateUserDTO.ts
│   │   ├── CreateAccountDTO.ts
│   │   ├── CreateActivityDTO.ts
│   │   └── CreateTransactionDTO.ts
│   │
│   ├── interfaces/
│   │   ├── UserInterface.ts
│   │   ├── AccountInterface.ts
│   │   ├── ActivityInterface.ts
│   │   └── TransactionInterface.ts
│   │
│   ├── router/
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── UserService.ts
│   │   ├── AccountService.ts
│   │   ├── ActivityService.ts
│   │   └── TransactionService.ts
│   │
│   ├── stores/
│   │   ├── userstore.ts
│   │   ├── userseeder.ts
│   │   ├── accountstore.ts
│   │   ├── accountseeder.ts
│   │   ├── activitystore.ts
│   │   ├── activityseeder.ts
│   │   ├── transactionstore.ts
│   │   └── transactionseeder.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── ...
│   │
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── HomeView.vue
│   │   ├── TransactionsIndexView.vue
│   │   ├── TransactionsCreateView.vue
│   │   ├── ActivitiesIndexView.vue
│   │   ├── UsersIndexView.vue
│   │   └── ReportsView.vue
│   │
│   ├── App.vue
│   ├── main.ts
│   └── PiniaConfig.ts
│
├── .env
├── .env.example
├── .gitignore
├── .prettierrc.json
├── eslint.config.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Esta organización replica la separación utilizada en los tutoriales:
`views`, `components`, `services`, `interfaces`, `dtos`, `stores` y
`utils`. La presentación de elementos avanzados describe explícitamente
el proyecto como una arquitectura modular por capas/módulos.
fileciteturn2file15

------------------------------------------------------------------------

# 6. Responsabilidad de cada carpeta

## `views/`

Contiene páginas completas.

Una View:

-   representa una ruta;
-   obtiene información mediante Services;
-   coordina componentes;
-   maneja el estado local estrictamente necesario para la interfaz;
-   contiene composición de UI.

Una View NO debe:

-   modificar directamente un store;
-   implementar reglas complejas del dominio;
-   contener funciones reutilizables para todo el sistema;
-   duplicar validaciones presentes en Services.

------------------------------------------------------------------------

## `components/`

Contiene piezas reutilizables de interfaz.

Un componente debe tener una responsabilidad específica.

Puede:

-   recibir `props`;
-   emitir eventos;
-   utilizar componentes hijos;
-   manejar estado local de presentación.

Los componentes fueron definidos en clase como piezas reutilizables que
encapsulan lógica, vista y estilos, con responsabilidad específica.
fileciteturn2file14

### Regla práctica

Crear un componente cuando:

1.  se reutiliza en dos o más lugares; o
2.  tiene una responsabilidad visual claramente aislable; o
3.  su tamaño hace que una View pierda claridad; o
4.  encapsula una interacción compleja.

No crear componentes artificiales para cada `<div>`.

------------------------------------------------------------------------

## `services/`

Es la capa de negocio.

Ejemplos:

``` typescript
TransactionService.getTransactions()
TransactionService.getTransactionById(id)
TransactionService.createTransaction(dto)
TransactionService.updateTransaction(id, dto)
TransactionService.deleteTransaction(id)
```

La lógica debe expresarse mediante métodos con nombres descriptivos.

------------------------------------------------------------------------

## `stores/`

Contiene estado global.

Debe utilizar Setup Stores:

``` typescript
defineStore('transaction', () => {
  const transactions = ref<TransactionInterface[]>([]);

  return {
    transactions,
  };
});
```

Los stores no deben tener getters ni acciones complejas según la
convención establecida en `ARQUITECTURA.md`. fileciteturn5file11

------------------------------------------------------------------------

## `seeders`

Los datos iniciales deben mantenerse separados del store.

Ejemplo:

``` text
stores/
├── transactionstore.ts
└── transactionseeder.ts
```

El seeder solamente define datos iniciales.

El store solamente define estado.

La configuración de Pinia decide cuándo cargar los seeders y cuándo
restaurar el estado persistido. fileciteturn5file2

------------------------------------------------------------------------

## `interfaces/`

Solo contratos de datos.

No deben contener:

-   llamadas a servicios;
-   estado;
-   funciones de negocio;
-   acceso a LocalStorage.

------------------------------------------------------------------------

## `dtos/`

Solo tipos utilizados como entrada/salida de operaciones.

------------------------------------------------------------------------

## `utils/`

Contiene funciones reutilizables, preferiblemente puras.

Ejemplos:

``` typescript
formatToCOP(amount)
formatDate(date)
formatPercentage(value)
isValidEmail(email)
```

Las utilidades no deben depender directamente de Vue ni de Pinia.

La presentación de elementos avanzados define la capa Util como
funciones independientes, reutilizables, sin estado propio y sin
dependencia directa de Vue. fileciteturn1file2

------------------------------------------------------------------------

# 7. Regla de oro para decidir dónde colocar una función

Antes de crear una función, preguntar:

### ¿Es una regla del negocio?

→ `services/`

### ¿Es una operación sobre el estado global?

→ `services/` utilizando `stores/`

### ¿Es una transformación/formateo técnico reutilizable?

→ `utils/`

### ¿Es exclusivamente presentación?

→ `views/` o `components/`

### ¿Es una pieza visual reutilizable?

→ `components/`

### ¿Es solamente un contrato de tipos?

→ `interfaces/` o `dtos/`

Esta regla evita que `views` o `components` terminen acumulando lógica.

------------------------------------------------------------------------

# 8. Vue Single File Components

Todos los componentes Vue deben ser SFC.

Estructura preferida:

``` vue
<script setup lang="ts">
// lógica
</script>

<template>
  <!-- interfaz -->
</template>
```

Se utiliza exclusivamente Composition API.

Los tutoriales construyen las vistas de esta forma y el documento de
arquitectura establece `<script setup lang="ts">` como convención.
fileciteturn5file2

------------------------------------------------------------------------

# 9. Props

Las props deben utilizar tipado TypeScript.

Correcto:

``` typescript
const props = defineProps<{
  transactionId: string;
  readonly?: boolean;
}>();
```

Evitar:

``` typescript
const props = defineProps({
  transactionId: String,
});
```

La presentación/tutorial de componentes utiliza `defineProps` con
genéricos de TypeScript. fileciteturn5file2

------------------------------------------------------------------------

# 10. `computed` vs `ref`

## Utilizar `ref` cuando

El valor representa estado mutable.

``` typescript
const selectedType = ref('');
const isLoading = ref(false);
```

## Utilizar `computed` cuando

El valor puede derivarse de otros datos.

``` typescript
const totalExpenses = computed(() =>
  transactions.value
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0),
);
```

Regla:

> Si el valor puede calcularse a partir de otros estados, preferir
> `computed` antes que almacenar un segundo estado manualmente.

La presentación avanzada dedica una sección a variables computadas y
plantea explícitamente la diferencia entre `computed` y `ref`.
fileciteturn2file3

------------------------------------------------------------------------

# 11. Watchers

Utilizar `watch` cuando se necesita ejecutar una acción como
consecuencia de un cambio.

Ejemplos apropiados:

-   persistir información;
-   reaccionar ante cambios de filtros;
-   realizar una llamada a API;
-   ejecutar una validación;
-   redirigir;
-   sincronizar estados externos.

Ejemplo:

``` typescript
watch(selectedActivity, () => {
  updateFilteredTransactions();
});
```

La presentación define los watchers precisamente como mecanismos para
observar cambios y ejecutar lógica cuando algo cambia, incluyendo API,
LocalStorage, validaciones y redirecciones. fileciteturn2file7

No utilizar `watch` para reemplazar un `computed` cuando solamente se
necesita derivar un valor.

------------------------------------------------------------------------

# 12. Código limpio

## 12.1 Una función debe hacer una sola cosa

Incorrecto:

``` typescript
function processTransaction() {
  validateForm();
  saveToStore();
  formatCurrency();
  showNotification();
  router.push('/transactions');
}
```

Si la función está acumulando responsabilidades, separar las
operaciones.

------------------------------------------------------------------------

## 12.2 Nombres descriptivos

Correcto:

``` typescript
getTransactionsByAccountId()
calculateMonthlyExpenses()
formatToCOP()
isAdmin()
```

Incorrecto:

``` typescript
getData()
process()
doThing()
handle()
x()
```

Los nombres deben expresar intención.

------------------------------------------------------------------------

## 12.3 Guard clauses

Preferir:

``` typescript
if (!transaction) {
  return;
}

if (!isValidTransaction(transaction)) {
  return;
}

saveTransaction(transaction);
```

En lugar de:

``` typescript
if (transaction) {
  if (isValidTransaction(transaction)) {
    saveTransaction(transaction);
  }
}
```

Los tutoriales y `ARQUITECTURA.md` establecen explícitamente la
preferencia por early returns/guard clauses. fileciteturn5file10

------------------------------------------------------------------------

## 12.4 Evitar anidamiento excesivo

Si una función necesita demasiados `if`, `for`, callbacks o bloques
anidados, probablemente necesita ser dividida.

------------------------------------------------------------------------

## 12.5 Evitar duplicación

Si una operación aparece dos veces:

1.  identificar si realmente es la misma responsabilidad;
2.  extraerla;
3.  colocarla en la capa correcta.

No duplicar:

-   formateadores;
-   validaciones;
-   acceso a datos;
-   reglas de negocio;
-   componentes visuales.

------------------------------------------------------------------------

# 13. Validación

La validación relacionada con reglas del negocio debe estar en el
Service.

Ejemplo:

``` typescript
static createTransaction(dto: CreateTransactionDTO): void {
  if (dto.amount <= 0) {
    return;
  }

  if (!dto.accountId) {
    return;
  }

  // ...
}
```

La vista puede realizar validaciones básicas necesarias para UX, pero no
debe ser la única responsable de garantizar la integridad de los datos.

El tutorial avanzado muestra explícitamente validación y saneamiento en
la capa de Service. fileciteturn1file6

------------------------------------------------------------------------

# 14. Sanitización

Los datos recibidos de formularios deben limpiarse antes de almacenarse.

Ejemplo:

``` typescript
const description = dto.description.trim();
```

No almacenar directamente:

``` typescript
dto.description
```

cuando el dato admite espacios accidentales.

------------------------------------------------------------------------

# 15. Reglas para LocalStorage

En la primera versión del proyecto, LocalStorage actúa como
persistencia.

El entregable establece que inicialmente la "base de datos" debe estar
en LocalStorage y que al cargar la aplicación por primera vez deben
existir datos ficticios. fileciteturn5file15

### Regla

La persistencia debe estar centralizada.

No hacer:

``` typescript
localStorage.setItem(...)
```

arbitrariamente desde múltiples Views.

Debe existir una capa responsable de la persistencia.

En la arquitectura actual:

``` text
PiniaConfig
   ↓
Pinia State
   ↓
localStorage
```

La clave utilizada en los tutoriales es:

``` text
piniaState
```

y el estado se sincroniza mediante `watch`. fileciteturn4file13

------------------------------------------------------------------------

# 16. Seeders

Al iniciar por primera vez:

``` text
¿Existe estado guardado?
       │
       ├── Sí → cargar estado
       │
       └── No → cargar seeders
                   ↓
              guardar estado
```

Los seeders deben proporcionar información suficiente para que la
aplicación sea navegable desde el primer arranque.

------------------------------------------------------------------------

# 17. TypeScript

TypeScript debe utilizarse en modo estricto.

Configuración mínima:

``` json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "verbatimModuleSyntax": true,
  "isolatedModules": true
}
```

Esta configuración sigue la convención establecida en `ARQUITECTURA.md`.
fileciteturn3file17

------------------------------------------------------------------------

## 17.1 No utilizar `any`

Evitar:

``` typescript
const data: any = ...
```

Usar:

``` typescript
const data: TransactionInterface = ...
```

o el tipo adecuado.

El `any` solo debe utilizarse cuando exista una justificación técnica
explícita.

------------------------------------------------------------------------

## 17.2 `import type`

Para tipos:

``` typescript
import type { TransactionInterface } from '@/interfaces/TransactionInterface.js';
```

No:

``` typescript
import { TransactionInterface } from '@/interfaces/TransactionInterface.js';
```

Esta regla está asociada a `verbatimModuleSyntax`.
fileciteturn3file12

------------------------------------------------------------------------

## 17.3 Extensión `.js`

Con la configuración utilizada:

``` typescript
import { TransactionService } from '@/services/TransactionService.js';
```

Aunque el archivo fuente sea:

``` text
TransactionService.ts
```

Esta convención está definida por la configuración NodeNext utilizada en
el proyecto. fileciteturn3file12

------------------------------------------------------------------------

## 17.4 Tipado explícito de `ref`

Correcto:

``` typescript
const transactions = ref<TransactionInterface[]>([]);
```

No:

``` typescript
const transactions = ref([]);
```

------------------------------------------------------------------------

## 17.5 No tipar innecesariamente lo que TypeScript puede inferir

La presentación de TypeScript también señala que no siempre es necesario
declarar tipos cuando TypeScript puede inferirlos correctamente.
fileciteturn2file4

La regla es:

> Tipar explícitamente las fronteras importantes; permitir inferencia en
> variables locales simples.

------------------------------------------------------------------------

# 18. Naming

  -----------------------------------------------------------------------------
  Elemento                Convención              Ejemplo
  ----------------------- ----------------------- -----------------------------
  Clase                   PascalCase              `TransactionService`

  Interface               PascalCase +            `TransactionInterface`
                          `Interface`             

  DTO                     PascalCase + `DTO`      `CreateTransactionDTO`

  Service                 PascalCase + `Service`  `TransactionService`

  View                    PascalCase + `View`     `TransactionsIndexView.vue`

  Component               PascalCase              `TablaGenerica.vue`

  Store                   camelCase + `store`     `transactionstore.ts`

  Seeder                  camelCase + `seeder`    `transactionseeder.ts`

  Variable                camelCase               `selectedTransaction`

  Función                 camelCase               `calculateBalance`

  Constante               camelCase si representa `transactionSeeder`
                          datos del dominio       
  -----------------------------------------------------------------------------

Estas convenciones están alineadas con `ARQUITECTURA.md`.
fileciteturn5file12

------------------------------------------------------------------------

# 19. Convención RESTful para Views

Para un recurso `transactions`:

``` text
TransactionsIndexView.vue
TransactionsShowView.vue
TransactionsCreateView.vue
TransactionsEditView.vue
```

Rutas:

``` text
/transactions
/transactions/:id
/transactions/create
/transactions/:id/edit
```

No utilizar nombres inconsistentes como:

``` text
TransactionList.vue
TransactionsPage.vue
TransactionFormPage.vue
```

salvo que exista una decisión documentada.

------------------------------------------------------------------------

# 20. Componentes reutilizables del proyecto

El proyecto actual requiere como mínimo dos componentes reutilizables.

Se definieron tres componentes especialmente adecuados:

## `TablaGenerica.vue`

Responsabilidad:

-   recibir columnas;
-   recibir filas;
-   renderizar una tabla;
-   permitir acciones mediante slots.

Debe poder reutilizarse en:

-   Transactions;
-   Activities;
-   Users.

------------------------------------------------------------------------

## `SelectorFiltro.vue`

Responsabilidad:

-   mostrar opciones;
-   recibir opciones mediante props;
-   emitir el cambio.

Debe poder utilizarse en:

-   Transactions;
-   Reports.

------------------------------------------------------------------------

## `GraficoChart.vue`

Responsabilidad:

-   encapsular Chart.js;
-   recibir configuración mediante props;
-   mostrar el gráfico.

Debe reutilizarse en:

-   Home;
-   Transactions;
-   Reports.

El contexto del proyecto define explícitamente estos tres componentes
como componentes reutilizables y exige al menos dos.
fileciteturn5file0

------------------------------------------------------------------------

# 21. Criterio para reutilización

No todo debe convertirse en componente.

### Crear componente si:

``` text
Existe reutilización
        OR
Existe una responsabilidad visual independiente
        OR
Existe una interacción compleja
        OR
La View se vuelve difícil de mantener
```

### No crear componente si:

``` text
Solo contiene un div
Solo aparece una vez
No tiene responsabilidad independiente
La extracción hace el código más difícil de entender
```

El entregable solicita explícitamente utilizar el criterio del
desarrollador para decidir cuándo crear componentes reutilizables.
fileciteturn5file15

------------------------------------------------------------------------

# 22. Route Guards y roles

El sistema tiene dos roles:

``` text
user
admin
```

Las páginas administrativas deben protegerse.

Actualmente las páginas definidas como administrativas son:

``` text
Activities
Users
```

El contexto del proyecto exige guards para restringir estas páginas
según el rol del usuario. fileciteturn5file0

Conceptualmente:

``` text
Usuario
  ↓
¿Está autenticado?
  ├── No → Login
  └── Sí
       ↓
    ¿Es admin?
       ├── Sí → permitir
       └── No → acceso denegado
```

La lógica de autorización no debe duplicarse en cada View.

------------------------------------------------------------------------

# 23. Variables de entorno

Las variables configurables deben almacenarse en `.env`.

Nunca escribir directamente secretos o configuraciones sensibles en el
código.

Ejemplo:

``` text
.env
.env.example
```

`.env.example` debe contener únicamente nombres y valores de ejemplo.

Nunca subir:

``` text
.env
```

si contiene información sensible.

------------------------------------------------------------------------

# 24. Tailwind CSS

La interfaz utiliza Tailwind CSS con enfoque utility-first.

Ejemplo:

``` html
<div class="rounded-lg bg-white p-6 shadow-md">
```

La presentación del curso define Tailwind como un framework
utility-first donde pequeñas clases representan responsabilidades
visuales individuales. fileciteturn2file8

### Reglas

-   Preferir clases Tailwind.
-   Evitar CSS personalizado innecesario.
-   No crear una clase CSS propia para algo que Tailwind ya resuelve.
-   Mantener consistencia visual.
-   Reutilizar componentes cuando un patrón visual se repita.
-   El CSS global debe reservarse para reglas realmente globales.

------------------------------------------------------------------------

# 25. Layout

El layout global debe vivir en:

``` text
App.vue
```

Debe contener:

``` text
Sidebar / Navbar
Header
RouterView
```

No duplicar el sidebar completo en cada View.

La arquitectura de referencia utiliza `App.vue` como shell/layout
global. fileciteturn5file2

------------------------------------------------------------------------

# 26. Responsive design

La interfaz debe ser adaptable al menos a:

``` text
Mobile
Tablet
Desktop
```

Debe utilizarse un enfoque mobile-first cuando sea razonable.

Los elementos principales del proyecto ---tablas, formularios, cards y
gráficos--- deben contemplar pantallas pequeñas.

El contexto del proyecto establece explícitamente diseño responsive como
requisito técnico. fileciteturn5file0

------------------------------------------------------------------------

# 27. Estados de interfaz

Toda View que trabaje con datos debe considerar:

``` text
Loading
Success
Empty
Error
```

No mostrar simplemente una tabla vacía.

Ejemplo:

``` text
Cargando transacciones...
```

``` text
No hay transacciones para este filtro.
```

``` text
No fue posible cargar las transacciones.
```

Esto forma parte de los requisitos técnicos definidos para el proyecto.
fileciteturn5file0

------------------------------------------------------------------------

# 28. Gráficos

Chart.js es obligatorio.

Los gráficos deben recibir datos preparados y tipados.

La View no debería contener toda la lógica interna de Chart.js.

Preferir:

``` text
Service
  ↓
datos procesados
  ↓
GraficoChart
  ↓
Chart.js
```

El contexto exige Chart.js y al menos una librería visual adicional.
fileciteturn5file15

------------------------------------------------------------------------

# 29. Filtros

Los filtros deben mantener una separación clara:

``` text
Selector
   ↓
estado del filtro
   ↓
computed / Service
   ↓
datos filtrados
```

No duplicar el mismo algoritmo de filtrado en diferentes Views.

Si una regla de filtrado es de negocio, colocarla en Service.

Si es una derivación puramente visual de estado local, puede utilizarse
`computed`.

------------------------------------------------------------------------

# 30. Persistencia y estado de autenticación

La aplicación inicialmente utiliza LocalStorage/sessionStorage para:

-   usuarios ficticios;
-   estado de autenticación;
-   rol;
-   estado de Pinia.

El contexto define explícitamente que los usuarios ficticios deben
almacenarse inicialmente en LocalStorage y que el rol debe utilizarse
para proteger rutas administrativas. fileciteturn5file0

No distribuir la lógica de autenticación arbitrariamente entre
componentes.

Debe existir una responsabilidad centralizada para consultar:

``` text
usuario actual
usuario autenticado
rol actual
```

------------------------------------------------------------------------

# 31. Calidad de código

## Prettier

Configuración establecida:

``` json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100
}
```

Prettier solamente formatea. No corrige errores lógicos ni optimiza
rendimiento. La presentación de Vue lo define explícitamente como
herramienta de formateo automático. fileciteturn2file0

------------------------------------------------------------------------

## ESLint / OXLint

El linting se utiliza para:

-   detectar errores;
-   detectar malas prácticas;
-   aplicar reglas;
-   mantener estándares de equipo.

La presentación de fundamentos explica precisamente estas
responsabilidades. fileciteturn5file18

No ignorar warnings o errores simplemente para conseguir que el build
termine.

Si una regla debe deshabilitarse:

1.  justificar la razón;
2.  limitar el alcance;
3.  documentar la excepción cuando sea relevante.

------------------------------------------------------------------------

# 32. Scripts mínimos

Frontend:

``` bash
npm run dev
npm run build
npm run type-check
npm run lint
npm run format
```

Antes de un Pull Request:

``` bash
npm run type-check
npm run lint
npm run format
npm run build
```

Los scripts y su propósito siguen la organización establecida en
`ARQUITECTURA.md`. fileciteturn5file7

------------------------------------------------------------------------

# 33. Git y GitHub

El repositorio debe ser el punto central de coordinación.

La estructura recomendada:

``` text
.github/
├── pull_request_template.md
├── ISSUE_TEMPLATE/
│   ├── feature.md
│   ├── bug.md
│   └── architecture.md
└── workflows/
    └── quality.yml

docs/
├── architecture/
│   ├── README.md
│   └── adr/
├── coding-standards.md
├── domain-model.md
├── routes.md
└── decisions.md

src/
...

README.md
CONTRIBUTING.md
```

------------------------------------------------------------------------

# 34. Documentación que debe vivir en el repositorio

La información no debe depender de que una persona "se acuerde" de las
reglas.

## `README.md`

Debe explicar:

-   qué hace el proyecto;
-   cómo instalarlo;
-   cómo ejecutarlo;
-   stack;
-   estructura general;
-   comandos principales;
-   enlace a documentación.

------------------------------------------------------------------------

## `CONTRIBUTING.md`

Debe explicar:

-   cómo crear ramas;
-   cómo nombrarlas;
-   cómo hacer commits;
-   cómo ejecutar validaciones;
-   cómo crear Pull Requests;
-   reglas de revisión.

------------------------------------------------------------------------

## `docs/coding-standards.md`

Debe contener:

-   naming;
-   TypeScript;
-   Vue;
-   Services;
-   Stores;
-   Components;
-   DTOs;
-   Utils;
-   Prettier;
-   ESLint/OXLint.

Este documento debe ser la guía de estilo solicitada por el entregable.
El entregable permite definir una guía manual o explicar el uso del
linter seleccionado. fileciteturn5file14

------------------------------------------------------------------------

## `docs/architecture/README.md`

Debe explicar:

-   arquitectura;
-   capas;
-   flujo de datos;
-   dependencias;
-   decisiones importantes;
-   estructura de carpetas.

------------------------------------------------------------------------

## `docs/architecture/adr/`

Aquí se almacenan decisiones arquitectónicas.

Ejemplo:

``` text
docs/architecture/adr/
├── ADR-001-vue3.md
├── ADR-002-spa-csr.md
├── ADR-003-pinia.md
├── ADR-004-services-static.md
├── ADR-005-localstorage.md
└── ADR-006-component-reuse.md
```

------------------------------------------------------------------------

# 35. Architecture Decision Records (ADR)

Una ADR debe utilizarse cuando una decisión:

-   afecta varias capas;
-   cambia una tecnología;
-   cambia la estructura de carpetas;
-   introduce un patrón;
-   elimina un patrón;
-   modifica el flujo de datos;
-   afecta a todos los integrantes;
-   puede generar discusión futura.

Formato:

``` markdown
# ADR-XXX — Título

## Estado

Propuesta | Aceptada | Rechazada | Reemplazada

## Contexto

¿Qué problema existe?

## Decisión

¿Qué se decidió?

## Razones

¿Por qué?

## Alternativas consideradas

¿Qué otras opciones se analizaron?

## Consecuencias

¿Qué ventajas y costos genera?

## Fecha

YYYY-MM-DD
```

------------------------------------------------------------------------

# 36. Regla para nuevas decisiones arquitectónicas

Antes de introducir una nueva librería, patrón o carpeta:

``` text
¿Es realmente necesario?
       ↓
¿Existe una solución con lo que ya tenemos?
       ↓
¿Afecta varias capas?
       ↓
¿Aumenta complejidad?
       ↓
¿Debe documentarse como ADR?
```

No agregar dependencias simplemente porque "son populares".

------------------------------------------------------------------------

# 37. GitHub Projects

El entregable exige utilizar GitHub Projects para dividir tareas y que
cada integrante indique qué está haciendo y qué queda pendiente.
fileciteturn5file15

Se recomienda un tablero:

``` text
Backlog
   ↓
Ready
   ↓
In Progress
   ↓
Review
   ↓
Done
```

Cada tarea debe incluir:

-   descripción;
-   responsable;
-   prioridad;
-   criterio de aceptación;
-   relación con requisito;
-   estado.

Ejemplo:

``` text
[Transactions] Crear CRUD de transacciones

Responsable: Integrante A
Prioridad: Alta

Criterios:
- listar transacciones
- crear transacción
- editar transacción
- eliminar transacción
- utilizar TransactionService
- utilizar CreateTransactionDTO
- persistir mediante Pinia
```

------------------------------------------------------------------------

# 38. Ramas

Recomendación:

``` text
main
│
├── feature/login
├── feature/transactions-crud
├── feature/activities-crud
├── feature/reports
├── feature/reusable-table
└── fix/transaction-filter
```

No desarrollar directamente sobre `main`.

------------------------------------------------------------------------

# 39. Commits

Los commits deben representar cambios coherentes.

Preferir:

``` text
feat: add transaction service
feat: add transactions index view
fix: correct transaction filter
refactor: extract currency formatter
style: format vue components
docs: update architecture guide
```

Evitar:

``` text
cosas
final
final2
ahora si
cambios
arreglos
```

Un commit debe ser suficientemente pequeño para poder entender qué
cambió.

------------------------------------------------------------------------

# 40. Pull Requests

Todo cambio importante debe pasar por Pull Request.

El autor debe verificar:

``` text
[ ] La funcionalidad funciona
[ ] TypeScript no presenta errores
[ ] ESLint/OXLint no presenta errores
[ ] Prettier está aplicado
[ ] Se respetó la arquitectura
[ ] Se utilizaron interfaces/DTOs
[ ] No se accede directamente al store desde Views
[ ] No se duplicó lógica
[ ] Se actualizaron documentos si era necesario
```

------------------------------------------------------------------------

# 41. Arquitecto del proyecto

El entregable define un integrante como arquitecto.

Su responsabilidad no es programar todo.

Debe:

-   definir las reglas;
-   documentarlas;
-   revisar cambios;
-   controlar consistencia;
-   validar decisiones;
-   revisar Pull Requests;
-   evitar que cada integrante cree su propia arquitectura.

El entregable establece que el arquitecto debe analizar los commits y
pushes y puede revertir versiones que no cumplan las reglas
establecidas. fileciteturn5file14

------------------------------------------------------------------------

# 42. Revisión de código

La revisión debe centrarse primero en arquitectura y calidad, no
únicamente en si "funciona".

Orden recomendado:

1.  ¿La funcionalidad cumple el requisito?
2.  ¿Está ubicada en la capa correcta?
3.  ¿Respeta el flujo View → Service → Store?
4.  ¿Utiliza interfaces y DTOs?
5.  ¿Existe duplicación?
6.  ¿Los nombres son claros?
7.  ¿La función tiene demasiadas responsabilidades?
8.  ¿Se manejan estados vacíos/error/loading?
9.  ¿El código está tipado?
10. ¿Pasa lint/type-check/build?

------------------------------------------------------------------------

# 43. Reglas específicas del proyecto de Finanzas Personales

Estas reglas corresponden al proyecto actual y deben separarse de las
reglas arquitectónicas generales cuando se replique la metodología.

## Modelo de dominio

El entregable exige exactamente cuatro clases:

``` text
User
Account
Activity
Transaction
```

El modelo actual define estas entidades y sus relaciones.
fileciteturn3file0

### User

``` text
id
name
email
password
role
createdAt
updatedAt
```

### Account

``` text
id
userId
type
accountNumber
bank
initialBalance
```

### Activity

``` text
id
userId
name
color
type
targetAmount
```

### Transaction

``` text
id
userId
accountId
activityId
type
amount
date
description
```

Relaciones:

``` text
User 1 ─── * Account
User 1 ─── * Activity
User 1 ─── * Transaction
Account 1 ─── * Transaction
Activity 1 ─── * Transaction
```

El detalle de estas entidades y relaciones está definido en
`contexto.md`. fileciteturn5file5

------------------------------------------------------------------------

# 44. Páginas del proyecto actual

El proyecto actual tiene siete páginas:

``` text
1. Login
2. Home / Dashboard
3. Transactions — Listado
4. Transactions — Crear/Editar
5. Activities — Gestión
6. Users — Administración
7. Reportes
```

El contexto define exactamente estas páginas y sus responsabilidades.
fileciteturn5file0

------------------------------------------------------------------------

# 45. Requisitos funcionales que afectan la arquitectura

El proyecto debe tener:

-   Vue 3;
-   Vue Router;
-   LocalStorage inicialmente;
-   datos ficticios al primer arranque;
-   entre 7 y 14 páginas;
-   Login;
-   Home;
-   mínimo dos páginas administrativas;
-   mínimo dos páginas con filtros;
-   tablas;
-   gráficos;
-   Chart.js;
-   una segunda librería visual;
-   mínimo dos componentes reutilizables;
-   mínimo dos CRUD;
-   diseño responsive.

Estos requisitos están definidos por el entregable y por el contexto del
proyecto. fileciteturn5file15turn5file0

------------------------------------------------------------------------

# 46. Regla para CRUD

Cada CRUD debe respetar la separación:

``` text
View
 ↓
Service
 ↓
Store
```

Ejemplo:

``` text
TransactionsIndexView
        ↓
TransactionService.getTransactions()
        ↓
useTransactionStore().transactions
```

Crear:

``` text
TransactionsCreateView
        ↓
TransactionService.createTransaction(dto)
        ↓
Store
```

Eliminar:

``` text
TransactionsIndexView
        ↓
TransactionService.deleteTransaction(id)
        ↓
Store
```

La View nunca debe ejecutar:

``` typescript
useTransactionStore().transactions.push(...)
```

directamente.

------------------------------------------------------------------------

# 47. Regla para formularios

Los formularios deben:

1.  mantener estado local de entrada;
2.  construir un DTO;
3.  enviar el DTO al Service;
4.  dejar al Service validar y transformar los datos;
5.  reaccionar al resultado.

Conceptualmente:

``` text
Form
 ↓
CreateTransactionDTO
 ↓
TransactionService
 ↓
Validation
 ↓
Store
```

No enviar objetos arbitrarios con campos inconsistentes.

------------------------------------------------------------------------

# 48. Regla para tablas

Las tablas reutilizables deben recibir datos.

No deben conocer específicamente:

``` text
Transaction
Activity
User
```

El componente genérico debe trabajar con una estructura configurable.

Esto permite utilizar el mismo componente en:

``` text
Transactions
Activities
Users
```

------------------------------------------------------------------------

# 49. Regla para gráficos

Los gráficos no deben contener lógica de negocio.

La transformación:

``` text
transactions
   ↓
gasto por actividad
   ↓
labels + datasets
```

debe realizarse antes de entregar los datos al wrapper de Chart.js.

El componente gráfico debe concentrarse en representar los datos.

------------------------------------------------------------------------

# 50. Anti-patrones prohibidos

## View accediendo al store

``` typescript
const store = useTransactionStore();
store.transactions.push(transaction);
```

Prohibido.

Debe:

``` typescript
TransactionService.createTransaction(dto);
```

------------------------------------------------------------------------

## Service importando componentes

``` text
Service → Vue Component
```

Prohibido.

------------------------------------------------------------------------

## Store con lógica de negocio

``` typescript
const createTransaction = (...) => {
  // 30 líneas de validaciones y cálculos
}
```

Prohibido.

------------------------------------------------------------------------

## DTO redefinido manualmente

Prohibido cuando puede derivarse mediante `Omit`, `Pick`, `Partial`,
etc.

------------------------------------------------------------------------

## Util con acceso al store

``` typescript
export function getTransactions() {
  return useTransactionStore().transactions;
}
```

Incorrecto.

Eso no es una utilidad pura.

------------------------------------------------------------------------

## Componente gigante

Un componente que contiene:

-   múltiples tablas;
-   múltiples formularios;
-   llamadas a servicios;
-   filtros;
-   gráficos;
-   lógica de negocio;

debe dividirse.

------------------------------------------------------------------------

## Duplicación de lógica

No implementar:

``` text
calculateBalance() en HomeView
calculateBalance() en ReportsView
calculateBalance() en DashboardService
```

sin justificación.

Debe existir una única responsabilidad para el cálculo.

------------------------------------------------------------------------

# 51. Matriz de decisión rápida

  Necesito...                          Uso
  ------------------------------------ -----------------------------------
  Una página                           `views/`
  UI reutilizable                      `components/`
  Regla de negocio                     `services/`
  Estado global                        `stores/`
  Datos iniciales                      `seeders`
  Contrato de entidad                  `interfaces/`
  Datos para crear/actualizar          `dtos/`
  Formatear/transformar técnicamente   `utils/`
  Navegación                           `router/`
  Persistencia Pinia                   `PiniaConfig`
  Configuración                        archivo de configuración / `.env`
  Decisión arquitectónica              `docs/architecture/adr/`

------------------------------------------------------------------------

# 52. Flujo completo recomendado

Para implementar una nueva funcionalidad:

``` text
1. Requisito
   ↓
2. Identificar entidad
   ↓
3. Revisar Interface
   ↓
4. Crear/actualizar DTO
   ↓
5. Implementar Service
   ↓
6. Actualizar Store si es necesario
   ↓
7. Crear componente reutilizable si aplica
   ↓
8. Crear View
   ↓
9. Registrar Route
   ↓
10. Agregar guard si aplica
   ↓
11. Probar estados loading/empty/error/success
   ↓
12. Ejecutar format
   ↓
13. Ejecutar lint
   ↓
14. Ejecutar type-check
   ↓
15. Ejecutar build
   ↓
16. Pull Request
   ↓
17. Code Review
```

------------------------------------------------------------------------

# 53. Checklist obligatorio antes de aceptar código

## Arquitectura

-   [ ] La responsabilidad está en la capa correcta.
-   [ ] Se respeta `View → Service → Store`.
-   [ ] No hay acceso directo al Store desde Views.
-   [ ] Los Services son clases con métodos estáticos.
-   [ ] Los Stores solo manejan estado.
-   [ ] Los seeders están separados.
-   [ ] Interfaces y DTOs están separados.
-   [ ] Las utilidades son puras.
-   [ ] No se crearon carpetas innecesarias.

## Vue

-   [ ] Se utiliza `<script setup lang="ts">`.
-   [ ] Se utiliza Composition API.
-   [ ] Las props están tipadas.
-   [ ] `computed` se usa para valores derivados.
-   [ ] `watch` se usa únicamente cuando corresponde.
-   [ ] La View no contiene lógica de negocio compleja.
-   [ ] Los componentes tienen responsabilidad específica.

## TypeScript

-   [ ] No existe `any` injustificado.
-   [ ] Los parámetros importantes están tipados.
-   [ ] Los retornos importantes están tipados.
-   [ ] Se utiliza `import type`.
-   [ ] Los imports respetan `.js`.
-   [ ] Los `ref` importantes están tipados.
-   [ ] Se utiliza inferencia cuando es suficiente.

## Código limpio

-   [ ] Nombres descriptivos.
-   [ ] Funciones pequeñas.
-   [ ] Una responsabilidad por función.
-   [ ] Guard clauses.
-   [ ] Sin duplicación innecesaria.
-   [ ] Sin anidamiento excesivo.
-   [ ] Validación centralizada.

## UI

-   [ ] Responsive.
-   [ ] Loading.
-   [ ] Empty state.
-   [ ] Error state.
-   [ ] Accesibilidad básica.
-   [ ] Consistencia visual.
-   [ ] Componentes reutilizables cuando corresponda.

## Calidad

-   [ ] Prettier.
-   [ ] ESLint/OXLint.
-   [ ] Type-check.
-   [ ] Build.
-   [ ] PR revisado.

------------------------------------------------------------------------

# 54. Organización recomendada del repositorio

La organización final recomendada para replicar esta metodología es:

``` text
project/
│
├── .github/
│   ├── workflows/
│   │   └── quality.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── feature.md
│   │   ├── bug.md
│   │   └── architecture.md
│   └── pull_request_template.md
│
├── docs/
│   ├── architecture/
│   │   ├── README.md
│   │   └── adr/
│   │       ├── ADR-001.md
│   │       ├── ADR-002.md
│   │       └── ...
│   │
│   ├── coding-standards.md
│   ├── domain-model.md
│   ├── routes.md
│   └── requirements.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── dtos/
│   │   ├── interfaces/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── utils/
│   │   ├── views/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── PiniaConfig.ts
│   │
│   ├── public/
│   ├── .env.example
│   ├── eslint.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .prettierrc.json
│
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

------------------------------------------------------------------------

# 55. Fuente de verdad del proyecto

Para evitar contradicciones, la documentación debe tener una jerarquía.

``` text
REQUISITOS DEL CURSO / PRODUCTO
            ↓
        ADR aceptadas
            ↓
  architecture/README.md
            ↓
 coding-standards.md
            ↓
          Código
```

Si el código contradice la documentación, el Pull Request debe señalar
la contradicción.

Si la documentación está desactualizada:

> Primero se actualiza la decisión/documentación; después se cambia el
> código.

No se debe permitir que la arquitectura dependa de conocimiento oral del
equipo.

------------------------------------------------------------------------

# 56. Regla final

El objetivo de esta metodología no es llenar el proyecto de carpetas,
clases o patrones.

El objetivo es conseguir:

``` text
Baja duplicación
      +
Responsabilidades claras
      +
Dependencias controladas
      +
Tipado fuerte
      +
Código fácil de leer
      +
Componentes reutilizables
      +
Trabajo colaborativo consistente
      =
Sistema mantenible
```

La arquitectura debe ser suficientemente estructurada para evitar el
caos, pero suficientemente simple para que cualquier integrante pueda
entender dónde debe colocar una nueva funcionalidad.

------------------------------------------------------------------------

# 57. Referencias internas utilizadas

Esta guía consolida las reglas observadas en:

-   `ARQUITECTURA.md`: arquitectura, capas, carpetas, patrones,
    TypeScript, naming y calidad. fileciteturn5file1turn5file4
-   Tutorial 03 de Vue: creación de SPA, Vue Router, SFC y Tailwind.
    fileciteturn4file3turn4file12
-   Tutorial 04 de Vue: interfaces, services, DTOs, Pinia, seeders y
    LocalStorage. fileciteturn4file1turn4file0turn4file7
-   Tutorial 05 de Vue: services adicionales, components, props,
    watchers y utilidades. fileciteturn4file11turn4file4
-   Presentación de elementos avanzados: capa Util, `computed`, `watch`,
    components y revisión de código.
    fileciteturn2file0turn2file7turn2file14
-   `Entregable 1 Parte 1 - Base`: requisitos de arquitectura, reglas de
    programación, GitHub, arquitecto, wiki, Projects, LocalStorage,
    páginas, CRUDs y componentes reutilizables.
    fileciteturn5file14turn5file15
-   `contexto.md`: modelo de dominio, páginas, componentes reutilizables
    y requisitos técnicos del proyecto de Finanzas Personales.
    fileciteturn5file0
-   `Resumen Proyecto`: definición del Dashboard de Finanzas Personales
    y modelo de cuatro clases. fileciteturn3file0

------------------------------------------------------------------------

## Regla operativa para el equipo

Ante cualquier duda sobre dónde implementar algo, seguir esta secuencia:

``` text
¿Es UI?
 ├─ Sí → ¿se reutiliza?
 │        ├─ Sí → components/
 │        └─ No → views/
 │
 └─ No
      ↓
¿Es estado?
 ├─ Sí → stores/
 │
 └─ No
      ↓
¿Es lógica de negocio?
 ├─ Sí → services/
 │
 └─ No
      ↓
¿Es una función técnica pura?
 ├─ Sí → utils/
 │
 └─ No → revisar arquitectura antes de implementar
```

**Si una implementación no encaja claramente en una capa, no se debe
improvisar: se revisa la arquitectura y, si la decisión afecta al diseño
general, se crea una ADR.**
