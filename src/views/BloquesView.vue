<template>
  <div class="bloques-view">
    <!-- Header con selector de período -->
    <div class="page-header">
      <div>
        <h1>📚 Gestión de Bloques Académicos</h1>
        <p>Organiza bloques por período y carrera</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nuevo Bloque
      </button>
    </div>

    <!-- Selector de Período y Filtros -->
    <div class="card selector-periodo">
      <div class="selector-content">
        <label>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          <span>Periodo:</span>
        </label>
        <select v-model="periodoSeleccionado" class="periodo-select" @change="cargarBloques">
          <option value="">-- Todos los períodos --</option>
          <option v-for="periodo in periodos" :key="periodo._id" :value="periodo._id">
            {{ periodo.codigo }} - {{ periodo.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Filtros por Carrera -->
    <div class="card filters-card">
      <div class="filter-group">
        <label>
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
          </svg>
          Carrera:
        </label>
        <select v-model="carreraFiltro" class="filter-select">
          <option value="">Todas las carreras</option>
          <option v-for="carrera in carreras" :key="carrera._id" :value="carrera._id">
            {{ carrera.codigo }} - {{ carrera.nombre }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado:</label>
        <select v-model="estadoFiltro" class="filter-select">
          <option value="">Todos</option>
          <option value="planificado">Planificado</option>
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Buscar:</label>
        <input v-model="busqueda" type="text" class="filter-select" placeholder="Código...">
      </div>
      <div class="filter-group">
        <label>Por página:</label>
        <select v-model="porPagina" class="filter-select">
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Grid de Bloques -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando bloques...</p>
    </div>

    <div v-else>
      <div class="bloques-grid">
        <div v-for="bloque in bloquesPaginados" :key="bloque._id" class="bloque-card">
          <div class="bloque-header">
            <div class="bloque-codigo">
              <span class="badge badge-primary">{{ bloque.codigo }}</span>
              <span :class="['badge', `badge-${getEstadoColor(bloque.estado)}`]">
                {{ bloque.estado }}
              </span>
            </div>
            <div class="bloque-acciones">
              <button class="btn-icon" @click="verHorario(bloque)" title="Ver Horario">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button class="btn-icon" @click="editarBloque(bloque)" title="Editar">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </button>
              <button class="btn-icon btn-danger" @click="eliminarBloque(bloque)" title="Eliminar">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="bloque-info">
            <div class="info-row">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
              <span><strong>Carrera:</strong> {{ bloque.carrera?.codigo || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              <span><strong>Período:</strong> {{ bloque.periodo?.codigo || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span><strong>Semestre:</strong> {{ bloque.semestreAcademico }}</span>
            </div>
            <div class="info-row">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
              <span><strong>Inscritos:</strong> {{ bloque.totalInscritos }} / {{ bloque.capacidadMax }}</span>
            </div>
          </div>

          <div class="bloque-footer">
            <button class="btn btn-secondary btn-block" @click="verHorario(bloque)">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              Ver Horario Completo
            </button>
          </div>
        </div>
      </div>

      <p v-if="bloquesFiltrados.length === 0" class="empty-state">
        📭 No se encontraron bloques con los filtros seleccionados
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="bloquesFiltrados.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="bloquesFiltrados.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal -->
    <Modal
      v-model="mostrarModal"
      :titulo="bloqueEditando ? 'Editar Bloque' : 'Nuevo Bloque'"
      :loading="guardando"
      @guardar="guardarBloque"
    >
      <form @submit.prevent="guardarBloque" class="form-modal">
        <div class="form-group">
          <label>Código *</label>
          <input v-model="formulario.codigo" type="text" class="form-input" placeholder="NAIDE201" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Período *</label>
            <select v-model="formulario.periodo" class="form-input" required>
              <option value="">Seleccionar período</option>
              <option v-for="periodo in periodos" :key="periodo._id" :value="periodo._id">
                {{ periodo.codigo }} - {{ periodo.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Carrera *</label>
            <select v-model="formulario.carrera" class="form-input" required>
              <option value="">Seleccionar carrera</option>
              <option v-for="carrera in carreras" :key="carrera._id" :value="carrera._id">
                {{ carrera.codigo }} - {{ carrera.nombre }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Semestre Académico *</label>
            <select v-model="formulario.semestreAcademico" class="form-input" required>
              <option value="">Seleccionar</option>
              <option v-for="i in 6" :key="i" :value="'I'.repeat(i)">Semestre {{ 'I'.repeat(i) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Capacidad Máxima *</label>
            <input v-model.number="formulario.capacidadMax" type="number" class="form-input" min="1" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha Inicio</label>
            <input v-model="formulario.fechaInicio" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label>Fecha Fin</label>
            <input v-model="formulario.fechaFin" type="date" class="form-input">
          </div>
        </div>

        <div class="form-group">
          <label>Estado *</label>
          <select v-model="formulario.estado" class="form-input" required>
            <option value="">Seleccionar estado</option>
            <option value="planificado">Planificado</option>
            <option value="activo">Activo</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { bloquesService, periodosService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const router = useRouter()
const store = useAppStore()

const periodos = ref([])
const bloques = ref([])
const periodoSeleccionado = ref('')
const carreraFiltro = ref('')
const estadoFiltro = ref('')
const busqueda = ref('')
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const bloqueEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(20)

const formulario = ref({
  codigo: '',
  periodo: '',
  carrera: '',
  semestreAcademico: '',
  capacidadMax: 30,
  fechaInicio: '',
  fechaFin: '',
  estado: 'planificado'
})

const carreras = computed(() => store.carreras)

const bloquesFiltrados = computed(() => {
  let filtered = bloques.value

  if (periodoSeleccionado.value) {
    filtered = filtered.filter(b => b.periodo?._id === periodoSeleccionado.value)
  }

  if (carreraFiltro.value) {
    filtered = filtered.filter(b => b.carrera?._id === carreraFiltro.value)
  }

  if (estadoFiltro.value) {
    filtered = filtered.filter(b => b.estado === estadoFiltro.value)
  }

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    filtered = filtered.filter(b => b.codigo.toLowerCase().includes(term))
  }

  return filtered
})

const bloquesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return bloquesFiltrados.value.slice(inicio, fin)
})

function getEstadoColor(estado) {
  const colores = {
    'planificado': 'warning',
    'activo': 'success',
    'finalizado': 'secondary'
  }
  return colores[estado] || 'secondary'
}

function verHorario(bloque) {
  router.push(`/horarios/bloque/${bloque._id}`)
}

function abrirModalNuevo() {
  bloqueEditando.value = null
  formulario.value = {
    codigo: '',
    periodo: periodoSeleccionado.value || '',
    carrera: '',
    semestreAcademico: '',
    capacidadMax: 30,
    fechaInicio: '',
    fechaFin: '',
    estado: 'planificado'
  }
  mostrarModal.value = true
}

function editarBloque(bloque) {
  bloqueEditando.value = bloque
  formulario.value = {
    codigo: bloque.codigo,
    periodo: bloque.periodo?._id || '',
    carrera: bloque.carrera?._id || '',
    semestreAcademico: bloque.semestreAcademico || '',
    capacidadMax: bloque.capacidadMax || 30,
    fechaInicio: bloque.fechaInicio ? bloque.fechaInicio.split('T')[0] : '',
    fechaFin: bloque.fechaFin ? bloque.fechaFin.split('T')[0] : '',
    estado: bloque.estado || 'planificado'
  }
  mostrarModal.value = true
}

async function guardarBloque() {
  try {
    guardando.value = true
    
    if (bloqueEditando.value) {
      await bloquesService.update(bloqueEditando.value._id, formulario.value)
    } else {
      await bloquesService.create(formulario.value)
    }
    
    await cargarBloques()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando bloque:', error)
    alert('Error al guardar el bloque')
  } finally {
    guardando.value = false
  }
}

async function eliminarBloque(bloque) {
  if (!confirm(`¿Eliminar el bloque "${bloque.codigo}"?`)) return
  
  try {
    await bloquesService.delete(bloque._id)
    await cargarBloques()
  } catch (error) {
    console.error('Error eliminando bloque:', error)
    alert('Error al eliminar el bloque')
  }
}

async function cargarPeriodos() {
  try {
    const response = await periodosService.getAll()
    periodos.value = response.data.data
    const activo = periodos.value.find(p => p.estado === 'activo')
    if (activo) {
      periodoSeleccionado.value = activo._id
    }
  } catch (error) {
    console.error('Error cargando períodos:', error)
  }
}

async function cargarBloques() {
  try {
    loading.value = true
    const params = {}
    if (periodoSeleccionado.value) {
      params.periodo = periodoSeleccionado.value
    }
    const response = await bloquesService.getAll(params)
    bloques.value = response.data.data
  } catch (error) {
    console.error('Error cargando bloques:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchCarreras(),
    cargarPeriodos()
  ])
  await cargarBloques()
})
</script>

<style scoped>
.bloques-view {
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
}

.selector-periodo {
  margin-bottom: 1.5rem;
}

.selector-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.selector-content label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--dark);
  white-space: nowrap;
}

.periodo-select {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}

.filters-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray);
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
}

.bloques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.bloque-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.3s;
}

.bloque-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.bloque-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bloque-codigo {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.bloque-acciones {
  display: flex;
  gap: 0.5rem;
}

.bloque-info {
  padding: 1.25rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9375rem;
  color: var(--dark);
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row svg {
  color: var(--primary);
  flex-shrink: 0;
}

.bloque-footer {
  padding: 1rem 1.25rem;
  background: var(--light-gray);
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.btn-danger {
  color: var(--danger);
}

.btn-danger:hover {
  background: #fee2e2;
}

.form-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--dark);
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .bloques-grid {
    grid-template-columns: 1fr;
  }

  .filters-card {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
