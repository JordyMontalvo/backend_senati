<template>
  <div class="cursos-view">
    <div class="page-header">
      <div>
        <h1>📚 Cursos Académicos</h1>
        <p>Gestiona el catálogo de cursos por carrera y semestre</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nuevo Curso
      </button>
    </div>

    <!-- Filtros -->
    <div class="card filtros-card">
      <div class="filtros-grid">
        <select v-model="carreraFiltro" class="filtro-select">
          <option value="">Todas las carreras</option>
          <option v-for="carrera in carreras" :key="carrera._id" :value="carrera._id">
            {{ carrera.codigo }} - {{ carrera.nombre }}
          </option>
        </select>
        <select v-model="semestreFiltro" class="filtro-select">
          <option value="">Todos los semestres</option>
          <option v-for="sem in semestres" :key="sem" :value="sem">Semestre {{ sem }}</option>
        </select>
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar curso..."
          class="filtro-input"
        >
        <select v-model="porPagina" class="filtro-select">
          <option :value="20">20 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-mini">
      <div class="stat-mini-card">
        <div class="stat-mini-value">{{ cursosFiltrados.length }}</div>
        <div class="stat-mini-label">Cursos Encontrados</div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-mini-value">{{ creditosTotales }}</div>
        <div class="stat-mini-label">Créditos Totales</div>
      </div>
      <div class="stat-mini-card">
        <div class="stat-mini-value">{{ horasTotales }}</div>
        <div class="stat-mini-label">Horas Totales</div>
      </div>
    </div>

    <!-- Vista de Cursos -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>

    <div v-else class="cursos-grid">
      <div v-for="curso in cursosPaginados" :key="curso._id" class="curso-card">
        <div class="curso-header">
          <div class="curso-codigo-principal">
            <span class="badge badge-primary">{{ curso.codigo }}</span>
            <span :class="['tipo-badge', `tipo-${(curso.tipoCurso || 'tec').toLowerCase()}`]">
              {{ curso.tipoCurso || 'TEC' }}
            </span>
          </div>
          <div class="curso-acciones-mini">
            <button class="btn-icon" @click="editarCurso(curso)" title="Editar">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
            <button class="btn-icon btn-danger" @click="eliminarCurso(curso)" title="Eliminar">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <h3 class="curso-nombre">{{ curso.nombre }}</h3>

        <div class="curso-detalles">
          <div class="detalle-row">
            <div class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
              <span class="detalle-label">Carrera:</span>
              <span class="detalle-valor">{{ curso.carrera?.codigo || 'N/A' }}</span>
            </div>
          </div>

          <div class="detalle-row">
            <div class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span class="detalle-label">Horas:</span>
              <span class="detalle-valor">{{ curso.horasTotal }}h</span>
            </div>
            <div class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="detalle-label">Créditos:</span>
              <span class="detalle-valor">{{ curso.creditos || 0 }}</span>
            </div>
          </div>

          <div class="curso-horas-breakdown">
            <div class="horas-item">
              <div class="horas-barra teoria" :style="{ width: `${(curso.horasTeoria / curso.horasTotal * 100) || 0}%` }"></div>
              <span>Teoría: {{ curso.horasTeoria }}h</span>
            </div>
            <div class="horas-item">
              <div class="horas-barra taller" :style="{ width: `${(curso.horasTaller / curso.horasTotal * 100) || 0}%` }"></div>
              <span>Taller: {{ curso.horasTaller }}h</span>
            </div>
            <div v-if="curso.horasVirtual > 0" class="horas-item">
              <div class="horas-barra virtual" :style="{ width: `${(curso.horasVirtual / curso.horasTotal * 100) || 0}%` }"></div>
              <span>Virtual: {{ curso.horasVirtual }}h</span>
            </div>
          </div>
        </div>
      </div>

      <p v-if="cursosFiltrados.length === 0" class="empty-state">
        📭 No se encontraron cursos
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="cursosFiltrados.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="cursosFiltrados.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal -->
    <Modal
      v-model="mostrarModal"
      :titulo="cursoEditando ? 'Editar Curso' : 'Nuevo Curso'"
      size="large"
      :loading="guardando"
      @guardar="guardarCurso"
    >
      <form @submit.prevent="guardarCurso" class="form-modal">
        <div class="form-row">
          <div class="form-group">
            <label>Código *</label>
            <input v-model="formulario.codigo" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Tipo de Curso *</label>
            <select v-model="formulario.tipoCurso" class="form-input" required>
              <option value="">Seleccionar</option>
              <option value="TEC">TEC - Tecnológico</option>
              <option value="TAL">TAL - Taller</option>
              <option value="VIR">VIR - Virtual</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Nombre *</label>
          <input v-model="formulario.nombre" type="text" class="form-input" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Carrera *</label>
            <select v-model="formulario.carrera" class="form-input" required>
              <option value="">Seleccionar carrera</option>
              <option v-for="carrera in carreras" :key="carrera._id" :value="carrera._id">
                {{ carrera.codigo }} - {{ carrera.nombre }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Semestre *</label>
            <select v-model="formulario.semestre" class="form-input" required>
              <option value="">Seleccionar</option>
              <option v-for="i in 6" :key="i" :value="'I'.repeat(i)">Semestre {{ 'I'.repeat(i) }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Materia</label>
            <input v-model="formulario.materia" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Número</label>
            <input v-model.number="formulario.numero" type="number" class="form-input">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Créditos</label>
            <input v-model.number="formulario.creditos" type="number" class="form-input" min="0" step="0.5">
          </div>
          <div class="form-group">
            <label>Horas Teoría</label>
            <input v-model.number="formulario.horasTeoria" type="number" class="form-input" min="0">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Horas Taller</label>
            <input v-model.number="formulario.horasTaller" type="number" class="form-input" min="0">
          </div>
          <div class="form-group">
            <label>Horas Virtual</label>
            <input v-model.number="formulario.horasVirtual" type="number" class="form-input" min="0">
          </div>
        </div>

        <div class="form-info">
          <strong>Total de Horas:</strong> {{ horasTotalesFormulario }}h
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { cursosService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const store = useAppStore()

const carreraFiltro = ref('')
const semestreFiltro = ref('')
const busqueda = ref('')
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const cursoEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(20)

const formulario = ref({
  codigo: '',
  nombre: '',
  carrera: '',
  semestre: '',
  materia: '',
  numero: 0,
  tipoCurso: '',
  creditos: 0,
  horasTeoria: 0,
  horasTaller: 0,
  horasVirtual: 0
})

const carreras = computed(() => store.carreras)
const cursos = computed(() => store.cursos)

const semestres = computed(() => {
  const sems = new Set()
  cursos.value.forEach(c => {
    if (c.semestre) sems.add(c.semestre)
  })
  return Array.from(sems).sort()
})

const cursosFiltrados = computed(() => {
  let filtered = cursos.value

  if (carreraFiltro.value) {
    filtered = filtered.filter(c => c.carrera?._id === carreraFiltro.value)
  }

  if (semestreFiltro.value) {
    filtered = filtered.filter(c => c.semestre === semestreFiltro.value)
  }

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    filtered = filtered.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.codigo.toLowerCase().includes(term)
    )
  }

  return filtered
})

const cursosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return cursosFiltrados.value.slice(inicio, fin)
})

const creditosTotales = computed(() => {
  return cursosFiltrados.value.reduce((sum, c) => sum + (c.creditos || 0), 0)
})

const horasTotales = computed(() => {
  return cursosFiltrados.value.reduce((sum, c) => sum + (c.horasTotal || 0), 0)
})

const horasTotalesFormulario = computed(() => {
  return (formulario.value.horasTeoria || 0) + 
         (formulario.value.horasTaller || 0) + 
         (formulario.value.horasVirtual || 0)
})

function abrirModalNuevo() {
  cursoEditando.value = null
  formulario.value = {
    codigo: '',
    nombre: '',
    carrera: '',
    semestre: '',
    materia: '',
    numero: 0,
    tipoCurso: '',
    creditos: 0,
    horasTeoria: 0,
    horasTaller: 0,
    horasVirtual: 0
  }
  mostrarModal.value = true
}

function editarCurso(curso) {
  cursoEditando.value = curso
  formulario.value = {
    codigo: curso.codigo,
    nombre: curso.nombre,
    carrera: curso.carrera?._id || '',
    semestre: curso.semestre || '',
    materia: curso.materia || '',
    numero: curso.numero || 0,
    tipoCurso: curso.tipoCurso || '',
    creditos: curso.creditos || 0,
    horasTeoria: curso.horasTeoria || 0,
    horasTaller: curso.horasTaller || 0,
    horasVirtual: curso.horasVirtual || 0
  }
  mostrarModal.value = true
}

async function guardarCurso() {
  try {
    guardando.value = true
    
    const data = {
      ...formulario.value,
      horasTotal: horasTotalesFormulario.value
    }
    
    if (cursoEditando.value) {
      await cursosService.update(cursoEditando.value._id, data)
    } else {
      await cursosService.create(data)
    }
    
    await store.fetchCursos()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando curso:', error)
    alert('Error al guardar el curso')
  } finally {
    guardando.value = false
  }
}

async function eliminarCurso(curso) {
  if (!confirm(`¿Eliminar el curso "${curso.nombre}"?`)) return
  
  try {
    await cursosService.delete(curso._id)
    await store.fetchCursos()
  } catch (error) {
    console.error('Error eliminando curso:', error)
    alert('Error al eliminar el curso')
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    store.fetchCarreras(),
    store.fetchCursos()
  ])
  loading.value = false
})
</script>

<style scoped>
.cursos-view {
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

.filtros-card {
  margin-bottom: 1.5rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr;
  gap: 1rem;
}

.filtro-select,
.filtro-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.stats-mini {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-mini-card {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
}

.stat-mini-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-mini-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.curso-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s;
}

.curso-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.curso-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.curso-codigo-principal {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.curso-acciones-mini {
  display: flex;
  gap: 0.5rem;
}

.tipo-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.tipo-tec {
  background: #dbeafe;
  color: #1e40af;
}

.tipo-tal {
  background: #d1fae5;
  color: #065f46;
}

.tipo-vir {
  background: #fef3c7;
  color: #92400e;
}

.curso-nombre {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--dark);
  line-height: 1.4;
}

.curso-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detalle-row {
  display: flex;
  gap: 1rem;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detalle-item svg {
  color: var(--primary);
  flex-shrink: 0;
}

.detalle-label {
  color: var(--gray);
}

.detalle-valor {
  font-weight: 600;
}

.curso-horas-breakdown {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.horas-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.horas-barra {
  height: 6px;
  border-radius: 3px;
  min-width: 20px;
  transition: width 0.3s;
}

.horas-barra.teoria {
  background: #3b82f6;
}

.horas-barra.taller {
  background: #10b981;
}

.horas-barra.virtual {
  background: #f59e0b;
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

.form-info {
  padding: 1rem;
  background: var(--light-gray);
  border-radius: 0.5rem;
  text-align: center;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .cursos-grid {
    grid-template-columns: 1fr;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
