<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UserService } from '@/services/UserService.js';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Users,
  PieChart,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Wallet,
} from 'lucide-vue-next';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface NavItem {
  name: string;
  label: string;
  icon: unknown;
  tag?: string;
}

// ── Temporary stubs (replaced in Issue #4 + #8 with Pinia stores) ─────────────
const appTheme = ref<'light' | 'dark'>('light');
const authenticatedUser = ref<{ name: string; role: string } | null>(null);
const isAdminUser = computed(() => authenticatedUser.value?.role === 'admin');

function clearSession(): void {
  authenticatedUser.value = null;
}

function toggleAppTheme(): void {
  appTheme.value = appTheme.value === 'light' ? 'dark' : 'light';
}

// ── Router & navigation state ─────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();
const isMobileMenuOpen = ref(false);

const navItems = computed<NavItem[]>(() => [
  { name: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { name: 'accounts', label: 'Cuentas', icon: Wallet },
  { name: 'transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { name: 'reports', label: 'Reportes', icon: PieChart },
  ...(isAdminUser.value
    ? [
        { name: 'activities', label: 'Actividades', icon: Tags, tag: 'Admin' },
        { name: 'users', label: 'Usuarios', icon: Users, tag: 'Admin' },
      ]
    : []),
]);

const userInitials = computed<string>(() => {
  const fullName = authenticatedUser.value?.name ?? '?';
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
});

function navigateTo(routeName: string): void {
  router.push({ name: routeName });
  isMobileMenuOpen.value = false;
}

async function handleLogout(): Promise<void> {
  const Swal = (await import('sweetalert2')).default;
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
  if (result.isConfirmed) {
    UserService.logout();
    await router.push({ name: 'login' });
  }
}
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
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-meta">
            <div class="user-name">{{ authenticatedUser?.name }}</div>
            <div class="user-role">
              <span class="chip" :class="isAdminUser ? 'badge-indigo' : 'badge-gray'">{{
                isAdminUser ? 'Administrador' : 'Usuario'
              }}</span>
            </div>
          </div>
          <button
            class="btn btn-ghost btn-icon"
            @click="handleLogout"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut :size="17" />
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
        <h1 class="topbar-title">{{ route.meta.title || 'Resumen' }}</h1>
        <div class="topbar-actions">
          <button
            class="btn btn-ghost btn-icon"
            @click="toggleAppTheme"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            <Moon v-if="appTheme === 'light'" :size="18" />
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
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 14px;
  background: var(--surface-2);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.user-meta {
  min-width: 0;
  flex: 1;
}
.user-name {
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  margin-top: 2px;
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
}
.topbar-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text);
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
  .close-btn {
    display: block;
  }
  .menu-btn {
    display: block;
  }
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 50;
  }
  .content {
    padding: 18px 16px;
  }
}
</style>
