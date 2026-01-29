<template>
  <div class="profesores-view">
    <div class="page-header">
      <div>
        <h1>👨‍🏫 Profesores</h1>
        <p>Gestiona el registro de docentes</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nuevo Profesor
      </button>
    </div>

    <!-- Filtros -->
    <div class="card filtros-card">
      <div class="filtros-grid">
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar por nombre, código..."
          class="filtro-input"
        >
        <select v-model="estadoFiltro" class="filtro-select">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select v-model="porPagina" class="filtro-select">
          <option :value="20">20 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>

    <!-- Vista de Profesores -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando profesores...</p>
    </div>

    <div v-else class="profesores-grid">
      <div v-for="profesor in profesoresPaginados" :key="profesor._id" class="profesor-card">
        <div class="profesor-avatar">
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
        </div>

        <div class="profesor-info">
          <div class="profesor-header">
            <h3>{{ profesor.nombres }} {{ profesor.apellidos }}</h3>
            <span :class="['estado-badge', profesor.activo ? 'activo' : 'inactivo']">
              {{ profesor.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div v-if="profesor.codigo" class="profesor-codigo">
            <span class="badge badge-primary">{{ profesor.codigo }}</span>
          </div>

          <div class="profesor-detalles">
            <div v-if="profesor.especialidad" class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
              <span>{{ profesor.especialidad }}</span>
            </div>

            <div v-if="profesor.email" class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <span>{{ profesor.email }}</span>
            </div>

            <div v-if="profesor.telefono" class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span>{{ profesor.telefono }}</span>
            </div>
          </div>
        </div>

        <div class="profesor-acciones">
          <button class="btn-icon" @click="editarProfesor(profesor)" title="Editar">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" @click="eliminarProfesor(profesor)" title="Eliminar">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <p v-if="profesoresFiltrados.length === 0" class="empty-state">
        📭 No se encontraron profesores
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="profesoresFiltrados.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="profesoresFiltrados.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal -->
    <Modal
      v-model="mostrarModal"
      :titulo="profesorEditando ? 'Editar Profesor' : 'Nuevo Profesor'"
      :loading="guardando"
      @guardar="guardarProfesor"
    >
      <form @submit.prevent="guardarProfesor" class="form-modal">
        <div class="form-row">
          <div class="form-group">
            <label>Nombres *</label>
            <input v-model="formulario.nombres" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Apellidos *</label>
            <input v-model="formulario.apellidos" type="text" class="form-input" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Código</label>
            <input v-model="formulario.codigo" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>DNI</label>
            <input v-model="formulario.dni" type="text" class="form-input" maxlength="8">
          </div>
        </div>

        <div class="form-group">
          <label>Especialidad</label>
          <input v-model="formulario.especialidad" type="text" class="form-input">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input v-model="formulario.email" type="email" class="form-input">
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="formulario.telefono" type="tel" class="form-input">
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="formulario.activo" type="checkbox">
            <span>Profesor activo</span>
          </label>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { profesoresService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const profesores = ref([])
const busqueda = ref('')
const estadoFiltro = ref('')
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const profesorEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(20)

const formulario = ref({
  nombres: '',
  apellidos: '',
  codigo: '',
  dni: '',
  especialidad: '',
  email: '',
  telefono: '',
  activo: true
})

const profesoresFiltrados = computed(() => {
  let filtered = profesores.value

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.nombres.toLowerCase().includes(term) ||
      p.apellidos.toLowerCase().includes(term) ||
      (p.codigo && p.codigo.toLowerCase().includes(term))
    )
  }

  if (estadoFiltro.value !== '') {
    filtered = filtered.filter(p => p.activo === (estadoFiltro.value === 'true'))
  }

  return filtered
})

const profesoresPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return profesoresFiltrados.value.slice(inicio, fin)
})

function abrirModalNuevo() {
  profesorEditando.value = null
  formulario.value = {
    nombres: '',
    apellidos: '',
    codigo: '',
    dni: '',
    especialidad: '',
    email: '',
    telefono: '',
    activo: true
  }
  mostrarModal.value = true
}

function editarProfesor(profesor) {
  profesorEditando.value = profesor
  formulario.value = {
    nombres: profesor.nombres,
    apellidos: profesor.apellidos,
    codigo: profesor.codigo || '',
    dni: profesor.dni || '',
    especialidad: profesor.especialidad || '',
    email: profesor.email || '',
    telefono: profesor.telefono || '',
    activo: profesor.activo !== false
  }
  mostrarModal.value = true
}

async function guardarProfesor() {
  try {
    guardando.value = true
    
    if (profesorEditando.value) {
      await profesoresService.update(profesorEditando.value._id, formulario.value)
    } else {
      await profesoresService.create(formulario.value)
    }
    
    await cargarProfesores()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando profesor:', error)
    alert('Error al guardar el profesor')
  } finally {
    guardando.value = false
  }
}

async function eliminarProfesor(profesor) {
  if (!confirm(`¿Eliminar a ${profesor.nombres} ${profesor.apellidos}?`)) return
  
  try {
    await profesoresService.delete(profesor._id)
    await cargarProfesores()
  } catch (error) {
    console.error('Error eliminando profesor:', error)
    alert('Error al eliminar el profesor')
  }
}

async function cargarProfesores() {
  try {
    loading.value = true
    const response = await profesoresService.getAll()
    profesores.value = response.data.data
  } catch (error) {
    console.error('Error cargando profesores:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarProfesores()
})
</script>

<style scoped>
.profesores-view {
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
  margin-bottom: 2rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.filtro-input,
.filtro-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.profesores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profesor-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s;
  position: relative;
}

.profesor-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.profesor-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profesor-info {
  flex: 1;
}

.profesor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.profesor-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--dark);
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.estado-badge.activo {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.profesor-codigo {
  margin-bottom: 1rem;
}

.profesor-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray);
}

.detalle-item svg {
  color: var(--primary);
  flex-shrink: 0;
}

.profesor-acciones {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profesores-grid {
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
