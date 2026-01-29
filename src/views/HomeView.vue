<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">Sistema de Gestión de Horarios</h1>
      <p class="hero-subtitle">SENATI - Instituto de Educación Superior</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ carreras.length }}</div>
          <div class="stat-label">Carreras</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ cursos.length }}</div>
          <div class="stat-label">Cursos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ bloques.length }}</div>
          <div class="stat-label">Bloques</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-secondary">
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ profesores.length }}</div>
          <div class="stat-label">Profesores</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Accesos Rápidos</h2>
      <div class="actions-grid">
        <router-link to="/carreras" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <h3>Gestionar Carreras</h3>
          <p>Administra las carreras profesionales del instituto</p>
        </router-link>

        <router-link to="/bloques" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>Programar Bloques</h3>
          <p>Crea y gestiona bloques académicos por período</p>
        </router-link>

        <router-link to="/horarios" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3>Ver Horarios</h3>
          <p>Consulta y genera horarios académicos</p>
        </router-link>

        <router-link to="/profesores" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3>Gestionar Profesores</h3>
          <p>Administra el registro de docentes</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()

const carreras = computed(() => store.carreras)
const cursos = computed(() => store.cursos)
const bloques = computed(() => store.bloques)
const profesores = computed(() => store.profesores)

onMounted(async () => {
  await Promise.all([
    store.fetchCarreras(),
    store.fetchCursos(),
    store.fetchBloques(),
    store.fetchProfesores()
  ])
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--gray);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--white);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: var(--primary);
}

.stat-icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.stat-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon-secondary {
  background: rgba(118, 75, 162, 0.1);
  color: var(--secondary);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--gray);
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-actions h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: var(--white);
  border-radius: 1rem;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--shadow);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: var(--gray);
  font-size: 0.9375rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.875rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
