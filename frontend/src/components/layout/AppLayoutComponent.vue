<script setup lang="ts">
// External imports
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PieChart,
  ShieldCheck,
  Sun,
  Tags,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-vue-next';
import Swal from 'sweetalert2';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Internal imports
import type { NavItemInterface } from '@/interfaces/NavItemInterface.js';
import { AuthService } from '@/services/AuthService.js';
import { useThemeStore } from '@/stores/themestore.js';
import { FormattersUtil } from '@/utils/FormattersUtil.js';

// Variables
const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

// Reactive variables
const isMobileMenuOpen = ref(false);

// Computed
const currentUser = computed(() => AuthService.getCurrentUser());
const isAuthenticated = computed(() => AuthService.isAuthenticated());
const isAdminUser = computed(() => AuthService.isAdmin());

const navItems = computed<NavItemInterface[]>(() => [
  { name: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { name: 'accounts', label: 'Cuentas', icon: Wallet },
  { name: 'transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { name: 'reports', label: 'Reportes', icon: PieChart },
  { name: 'activities', label: 'Actividades', icon: Tags },
  ...(isAdminUser.value ? [{ name: 'users', label: 'Usuarios', icon: Users, tag: 'Admin' }] : []),
]);

const userInitials = computed<string>(() =>
  FormattersUtil.extractInitials(currentUser.value?.name ?? '?'),
);

// Route titles carry the app name for the browser tab ("Cuentas | FinZen"); the bar shows only the page.
const pageTitle = computed(() =>
  String(route.meta.title || 'Resumen').replace(/\s*\|\s*FinZen$/, ''),
);

// Actions
function toggleAppTheme(): void {
  themeStore.theme = themeStore.theme === 'light' ? 'dark' : 'light';
}

function navigateTo(routeName: string): void {
  router.push({ name: routeName });
  isMobileMenuOpen.value = false;
}

async function handleSignOut(): Promise<void> {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: 'Volverás a la pantalla de acceso.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Cerrar sesión',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await AuthService.signOut();
  } catch {
    // The local session already ended; a failed revoke is not shown.
  }
}

// Watchers
// The session ends either on sign-out or when the API rejects an expired
// token (BaseService clears it); both cases go back to the sign-in page.
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) {
    router.push({ name: 'sign-in' });
  }
});
</script>

<template>
  <div class="shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: isMobileMenuOpen }">
      <div class="brand">
        <div class="brand-mark"><Wallet :size="20" /></div>
        <div>
          <div class="brand-name">FinZen</div>
          <div class="brand-sub">Finanzas personales</div>
        </div>
        <button class="close-btn" @click="isMobileMenuOpen = false" aria-label="Cerrar menú">
          <X :size="20" />
        </button>
      </div>

      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.name"
          class="nav-item"
          :class="{ active: route.name === item.name }"
          @click="navigateTo(item.name)"
        >
          <component :is="item.icon" :size="19" />
          <span>{{ item.label }}</span>
          <span v-if="item.tag" class="nav-tag">{{ item.tag }}</span>
        </button>
      </nav>

      <div class="sidebar-foot">
        <div class="user-card">
          <div class="profile">
            <div class="avatar" :class="{ admin: isAdminUser }">{{ userInitials }}</div>
            <div class="user-meta">
              <div class="user-name" :title="currentUser?.name">{{ currentUser?.name }}</div>
              <div class="user-role" :class="{ admin: isAdminUser }">
                <component :is="isAdminUser ? ShieldCheck : UserRound" :size="13" />
                {{ isAdminUser ? 'Administrador' : 'Usuario' }}
              </div>
            </div>
          </div>
          <button type="button" class="signout" @click="handleSignOut">
            <LogOut :size="16" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>

    <div v-if="isMobileMenuOpen" class="overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <button class="menu-btn" @click="isMobileMenuOpen = true" aria-label="Abrir menú">
          <Menu :size="22" />
        </button>
        <h1 class="topbar-title">{{ pageTitle }}</h1>
        <div class="topbar-actions">
          <button
            class="btn btn-ghost btn-icon"
            @click="toggleAppTheme"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            <Moon v-if="themeStore.theme === 'light'" :size="18" />
            <Sun v-else :size="18" />
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px;
}
.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--primary);
  color: var(--primary-contrast);
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px -8px var(--primary);
}
.brand-name {
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 1.15rem;
}
.brand-sub {
  font-size: 0.72rem;
  color: var(--text-soft);
}
.close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: none;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  flex: 1;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 600;
  transition:
    background 0.18s ease,
    color 0.18s ease;
  text-align: left;
  width: 100%;
}
.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}
.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary-strong);
}
html.dark .nav-item.active {
  color: var(--primary);
}
.nav-tag {
  margin-left: auto;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  padding: 2px 7px;
  border-radius: 999px;
}

.sidebar-foot {
  padding: 12px;
  border-top: 1px solid var(--border);
}
.user-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  background: var(--surface-2);
}
.profile {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--text-soft) 80%, var(--text));
  color: #fff;
  display: grid;
  place-items: center;
  font-family: var(--font-head);
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.avatar.admin {
  background: var(--accent);
}
.user-meta {
  min-width: 0;
  flex: 1;
}
.user-name {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-muted);
}
.user-role.admin {
  color: var(--accent);
}
.signout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}
.signout:hover {
  color: var(--danger);
  border-color: color-mix(in srgb, var(--danger) 40%, var(--border));
  background: color-mix(in srgb, var(--danger) 7%, var(--surface));
}
.signout:focus-visible,
.nav-item:focus-visible,
.menu-btn:focus-visible,
.close-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

/* Main */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 26px;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.topbar-title {
  font-size: 1.25rem;
  font-weight: 700;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  margin-left: -8px;
  place-items: center;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
}
.menu-btn:hover {
  background: var(--surface-2);
}
.content {
  padding: 26px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.overlay {
  display: none;
}

@media (max-width: 960px) {
  .sidebar {
    position: fixed;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .sidebar {
    width: min(84vw, 300px);
    overscroll-behavior: contain;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .close-btn {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
  .menu-btn {
    display: grid;
  }
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(5, 10, 12, 0.45);
    z-index: 50;
  }
  .nav-item {
    min-height: 46px;
  }
  .topbar {
    gap: 10px;
    padding: 10px 16px;
    padding-top: max(10px, env(safe-area-inset-top));
  }
  .topbar-title {
    font-size: 1.08rem;
  }
  .content {
    padding: 18px 16px calc(28px + env(safe-area-inset-bottom));
  }
}
</style>
