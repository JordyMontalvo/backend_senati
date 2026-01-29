<template>
  <div id="app">
    <!-- Navbar Superior Horizontal -->
    <header class="navbar">
      <div class="navbar-content">
        <!-- Logo/Brand -->
        <div class="brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
            <path d="M16 8L22 14H18V24H14V14H10L16 8Z" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#00428B"/>
                <stop offset="100%" stop-color="#F26522"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="brand-text">
            <span class="brand-title">SENATI Horarios</span>
            <span class="brand-subtitle">Sistema de Gestión</span>
          </div>
        </div>

        <!-- Tabs de Navegación Horizontales -->
        <nav class="nav-tabs">
          <router-link to="/" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span>Inicio</span>
          </router-link>

          <router-link to="/periodos" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <span>Períodos</span>
          </router-link>

          <router-link to="/carreras" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
            <span>Carreras</span>
          </router-link>

          <router-link to="/cursos" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            <span>Cursos</span>
          </router-link>

          <router-link to="/bloques" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6z" clip-rule="evenodd"/>
            </svg>
            <span>Bloques</span>
          </router-link>

          <router-link to="/horarios" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span>Horarios</span>
          </router-link>

          <router-link to="/profesores" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>Profesores</span>
          </router-link>

          <router-link to="/aulas" class="nav-tab">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span>Aulas</span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Contenido Principal Centrado -->
    <main class="main-container">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>

    <!-- Notificaciones Globales -->
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref, provide } from 'vue'
import { useAppStore } from './stores/app'
import ToastNotification from './components/ToastNotification.vue'

const store = useAppStore()
const toastRef = ref(null)

// Proveer método de notificación globalmente
provide('toast', {
  success: (title, message) => toastRef.value?.add({ type: 'success', title, message }),
  error: (title, message) => toastRef.value?.add({ type: 'error', title, message }),
  warning: (title, message) => toastRef.value?.add({ type: 'warning', title, message }),
  info: (title, message) => toastRef.value?.add({ type: 'info', title, message })
})

onMounted(() => {
  store.fetchPeriodos()
  store.fetchCarreras()
})
</script>

<style>
:root {
  --primary: #00428B;
  --primary-dark: #002e61;
  --secondary: #2968B8;
  --success: #10b981;
  --warning: #F26522;
  --danger: #ef4444;
  --dark: #1f2937;
  --gray: #6b7280;
  --light-gray: #f3f4f6;
  --white: #ffffff;
  --border: #e5e7eb;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f9fafb;
  color: var(--dark);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ========== NAVBAR HORIZONTAL SUPERIOR ========== */
.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Brand/Logo */
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  border-right: 1px solid var(--border);
  padding-right: 2rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--gray);
  line-height: 1;
}

/* Tabs de Navegación */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: var(--gray);
  font-weight: 500;
  font-size: 0.9375rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.nav-tab:hover {
  background: var(--light-gray);
  color: var(--dark);
}

.nav-tab.router-link-active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
}

.nav-tab svg {
  flex-shrink: 0;
}

/* ========== CONTENEDOR PRINCIPAL ========== */
.main-container {
  flex: 1;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
}

/* ========== UTILIDADES GLOBALES ========== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--light-gray);
  color: var(--dark);
}

.btn-secondary:hover {
  background: var(--border);
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--gray);
  transition: all 0.2s;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--light-gray);
  color: var(--primary);
}

.card {
  background: var(--white);
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  text-align: left;
  padding: 0.75rem;
  font-weight: 600;
  border-bottom: 2px solid var(--border);
  color: var(--gray);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table tbody td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.table tbody tr:hover {
  background: var(--light-gray);
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-primary {
  background: #e6f0fa;
  color: #00428B;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef0eb;
  color: #d84b0e;
}

.badge-info {
  background: #e0e7ff;
  color: #3730a3;
}

.badge-secondary {
  background: #e5e7eb;
  color: #6b7280;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--gray);
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border: 4px solid var(--light-gray);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1024px) {
  .navbar-content {
    padding: 0 1rem;
  }

  .brand {
    padding-right: 1rem;
  }

  .nav-tabs {
    gap: 0;
  }

  .nav-tab span {
    display: none;
  }

  .nav-tab {
    padding: 0.75rem;
  }

  .content-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }

  .brand-subtitle {
    display: none;
  }

  .brand-title {
    font-size: 1rem;
  }

  .card {
    padding: 1rem;
  }
}
</style>
