<template>
  <div class="carreras-view">
    <div class="page-header">
      <div>
        <h1>🎓 Carreras Profesionales</h1>
        <p>Gestiona las carreras del instituto</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nueva Carrera
      </button>
    </div>

    <!-- Filtros -->
    <div class="card filters">
      <div class="filters-grid">
        <input 
          v-model="searchTerm" 
          type="text" 
          placeholder="Buscar carreras..."
          class="search-input"
        >
        <select v-model="filtroActivo" class="filter-select">
          <option value="">Todas</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <select v-model="porPagina" class="filter-select">
          <option :value="20">20 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>

    <!-- Tabla de carreras -->
    <div class="card">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando carreras...</p>
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Nivel</th>
            <th>Escuela</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="carrera in carrerasPaginadas" :key="carrera._id">
            <td><span class="badge badge-primary">{{ carrera.codigo }}</span></td>
            <td><strong>{{ carrera.nombre }}</strong></td>
            <td>{{ carrera.nivel || 'N/A' }}</td>
            <td>{{ carrera.escuela?.nombre || 'N/A' }}</td>
            <td>
              <span :class="['badge', carrera.activo ? 'badge-success' : 'badge-warning']">
                {{ carrera.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>
              <button class="btn-icon" @click="editarCarrera(carrera)" title="Editar">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </button>
              <button class="btn-icon btn-danger" @click="eliminarCarrera(carrera)" title="Eliminar">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="!loading && carrerasFiltradas.length === 0" class="empty-state">
        No se encontraron carreras
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="carrerasFiltradas.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="carrerasFiltradas.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal de Crear/Editar -->
    <Modal
      v-model="mostrarModal"
      :titulo="carreraEditando ? 'Editar Carrera' : 'Nueva Carrera'"
      :loading="guardando"
      @guardar="guardarCarrera"
    >
      <form @submit.prevent="guardarCarrera" class="form-modal">
        <div class="form-group">
          <label>Código *</label>
          <input 
            v-model="formulario.codigo" 
            type="text" 
            class="form-input" 
            placeholder="Ej: NAID"
            required
          >
        </div>

        <div class="form-group">
          <label>Nombre *</label>
          <input 
            v-model="formulario.nombre" 
            type="text" 
            class="form-input" 
            placeholder="Ej: Administración Industrial"
            required
          >
        </div>

        <div class="form-group">
          <label>Escuela</label>
          <select v-model="formulario.escuela" class="form-input">
            <option value="">Seleccionar escuela</option>
            <option v-for="escuela in escuelas" :key="escuela._id" :value="escuela._id">
              {{ escuela.nombre }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nivel</label>
            <input v-model="formulario.nivel" type="text" class="form-input" placeholder="Pregrado">
          </div>

          <div class="form-group">
            <label>Grado</label>
            <input v-model="formulario.grado" type="text" class="form-input" placeholder="Profesional">
          </div>
        </div>

        <div class="form-group">
          <label>Catálogo</label>
          <input v-model="formulario.catalogo" type="text" class="form-input" placeholder="2024">
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="formulario.activo" type="checkbox">
            <span>Carrera activa</span>
          </label>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { carrerasService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const store = useAppStore()

const searchTerm = ref('')
const filtroActivo = ref('')
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const carreraEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(20)

const formulario = ref({
  codigo: '',
  nombre: '',
  escuela: '',
  nivel: '',
  grado: '',
  catalogo: '',
  activo: true
})

const carreras = computed(() => store.carreras)
const escuelas = ref([])

const carrerasFiltradas = computed(() => {
  let filtered = carreras.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      c.codigo.toLowerCase().includes(term)
    )
  }

  if (filtroActivo.value !== '') {
    filtered = filtered.filter(c => c.activo === (filtroActivo.value === 'true'))
  }

  return filtered
})

const carrerasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return carrerasFiltradas.value.slice(inicio, fin)
})

function abrirModalNuevo() {
  carreraEditando.value = null
  formulario.value = {
    codigo: '',
    nombre: '',
    escuela: '',
    nivel: '',
    grado: '',
    catalogo: '',
    activo: true
  }
  mostrarModal.value = true
}

function editarCarrera(carrera) {
  carreraEditando.value = carrera
  formulario.value = {
    codigo: carrera.codigo,
    nombre: carrera.nombre,
    escuela: carrera.escuela?._id || '',
    nivel: carrera.nivel || '',
    grado: carrera.grado || '',
    catalogo: carrera.catalogo || '',
    activo: carrera.activo !== false
  }
  mostrarModal.value = true
}

async function guardarCarrera() {
  try {
    guardando.value = true
    
    if (carreraEditando.value) {
      await carrerasService.update(carreraEditando.value._id, formulario.value)
    } else {
      await carrerasService.create(formulario.value)
    }
    
    await store.fetchCarreras()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando carrera:', error)
    alert('Error al guardar la carrera')
  } finally {
    guardando.value = false
  }
}

async function eliminarCarrera(carrera) {
  if (!confirm(`¿Eliminar la carrera "${carrera.nombre}"?`)) return
  
  try {
    await carrerasService.delete(carrera._id)
    await store.fetchCarreras()
  } catch (error) {
    console.error('Error eliminando carrera:', error)
    alert('Error al eliminar la carrera')
  }
}

async function cargarEscuelas() {
  try {
    const response = await fetch('http://localhost:3000/api/escuelas')
    const data = await response.json()
    escuelas.value = data.data
  } catch (error) {
    console.error('Error cargando escuelas:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    store.fetchCarreras(),
    cargarEscuelas()
  ])
  loading.value = false
})
</script>

<style scoped>
.carreras-view {
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

.filters {
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.search-input,
.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
