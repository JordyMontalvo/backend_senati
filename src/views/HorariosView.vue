<template>
  <div class="horarios-view">
    <div class="page-header">
      <div>
        <h1>📅 Horarios Académicos</h1>
        <p>Consulta los horarios por bloque, carrera o profesor</p>
      </div>
      <router-link to="/horarios/gestionar" class="btn btn-primary">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
        Gestionar Horarios
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="card filtros-card">
      <div class="filtros-grid">
        <div class="filtro-grupo">
          <label>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            Período:
          </label>
          <select v-model="periodoFiltro" class="filtro-select">
            <option value="">Todos los períodos</option>
            <option v-for="periodo in periodos" :key="periodo._id" :value="periodo._id">
              {{ periodo.codigo }} - {{ periodo.nombre }}
            </option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
            Carrera:
          </label>
          <select v-model="carreraFiltro" class="filtro-select">
            <option value="">Todas las carreras</option>
            <option v-for="carrera in carreras" :key="carrera._id" :value="carrera._id">
              {{ carrera.codigo }} - {{ carrera.nombre }}
            </option>
          </select>
        </div>

        <div class="filtro-grupo">
          <label>Búsqueda:</label>
          <input 
            v-model="busqueda" 
            type="text" 
            placeholder="Buscar bloque..."
            class="filtro-input"
          >
        </div>
      </div>
    </div>

    <!-- Grid de Bloques con Horarios -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando horarios...</p>
    </div>

    <div v-else class="bloques-horarios-grid">
      <div 
        v-for="bloque in bloquesFiltrados" 
        :key="bloque._id" 
        class="bloque-horario-card"
        @click="verDetalleBloque(bloque._id)"
      >
        <div class="bloque-horario-header">
          <div class="bloque-titulo">
            <h3>{{ bloque.codigo }}</h3>
            <span class="badge badge-primary">{{ bloque.carrera?.codigo }}</span>
          </div>
          <span :class="['estado-badge', `estado-${bloque.estado}`]">
            {{ bloque.estado }}
          </span>
        </div>

        <div class="bloque-info-resumen">
          <div class="info-item-small">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            {{ bloque.periodo?.codigo }}
          </div>
          <div class="info-item-small">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            Semestre {{ bloque.semestreAcademico }}
          </div>
          <div class="info-item-small">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            {{ bloque.totalInscritos }}/{{ bloque.capacidadMax }} estudiantes
          </div>
        </div>

        <!-- Mini Calendario Preview -->
        <div class="mini-calendario-preview">
          <div class="dias-semana-mini">
            <span>L</span>
            <span>M</span>
            <span>M</span>
            <span>J</span>
            <span>V</span>
          </div>
          <div class="horario-visual-mini">
            <div class="barra-horario"></div>
          </div>
        </div>

        <button class="btn-ver-horario">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
          </svg>
          Ver Horario Completo
        </button>
      </div>

      <p v-if="bloquesFiltrados.length === 0" class="empty-state">
        📭 No se encontraron bloques con horarios
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { bloquesService, periodosService } from '../services'

const router = useRouter()
const store = useAppStore()

const periodos = ref([])
const bloques = ref([])
const periodoFiltro = ref('')
const carreraFiltro = ref('')
const busqueda = ref('')
const loading = ref(false)

const carreras = computed(() => store.carreras)

const bloquesFiltrados = computed(() => {
  let filtered = bloques.value

  if (periodoFiltro.value) {
    filtered = filtered.filter(b => b.periodo?._id === periodoFiltro.value)
  }

  if (carreraFiltro.value) {
    filtered = filtered.filter(b => b.carrera?._id === carreraFiltro.value)
  }

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    filtered = filtered.filter(b => 
      b.codigo.toLowerCase().includes(term) ||
      b.carrera?.nombre.toLowerCase().includes(term)
    )
  }

  return filtered
})

function verDetalleBloque(bloqueId) {
  router.push(`/horarios/bloque/${bloqueId}`)
}

async function cargarDatos() {
  try {
    loading.value = true
    
    const [periodosRes, bloquesRes] = await Promise.all([
      periodosService.getAll(),
      bloquesService.getAll()
    ])
    
    periodos.value = periodosRes.data.data
    bloques.value = bloquesRes.data.data
    
    // Seleccionar período activo por defecto
    const activo = periodos.value.find(p => p.estado === 'activo')
    if (activo) {
      periodoFiltro.value = activo._id
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await store.fetchCarreras()
  await cargarDatos()
})
</script>

<style scoped>
.horarios-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray);
  font-size: 1.125rem;
}

.filtros-card {
  margin-bottom: 2rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-grupo label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray);
}

.filtro-select,
.filtro-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.filtro-select:focus,
.filtro-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.bloques-horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.bloque-horario-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.bloque-horario-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.bloque-horario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.bloque-titulo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bloque-titulo h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark);
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-planificado {
  background: #fef3c7;
  color: #92400e;
}

.estado-activo {
  background: #d1fae5;
  color: #065f46;
}

.estado-finalizado {
  background: #e5e7eb;
  color: #6b7280;
}

.bloque-info-resumen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray);
}

.info-item-small svg {
  color: var(--primary);
  flex-shrink: 0;
}

.mini-calendario-preview {
  background: var(--light-gray);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.dias-semana-mini {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.dias-semana-mini span {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray);
  padding: 0.25rem;
}

.horario-visual-mini {
  height: 60px;
  background: white;
  border-radius: 0.375rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.barra-horario {
  width: 70%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 0.25rem;
}

.btn-ver-horario {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ver-horario:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .bloques-horarios-grid {
    grid-template-columns: 1fr;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }
}
</style>
