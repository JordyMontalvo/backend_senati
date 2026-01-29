<template>
  <div class="aulas-view">
    <div class="page-header">
      <div>
        <h1>🚪 Aulas y Ambientes</h1>
        <p>Gestiona los espacios de enseñanza</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nueva Aula
      </button>
    </div>

    <!-- Filtros -->
    <div class="card filtros-card">
      <div class="filtros-grid">
        <select v-model="tipoFiltro" class="filtro-select">
          <option value="">Todos los tipos</option>
          <option value="Aula">Aula</option>
          <option value="Taller">Taller</option>
          <option value="Laboratorio">Laboratorio</option>
          <option value="Auditorio">Auditorio</option>
        </select>
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar aula..."
          class="filtro-input"
        >
        <select v-model="porPagina" class="filtro-select">
          <option :value="20">20 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>
      </div>
    </div>

    <!-- Grid de Aulas -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando aulas...</p>
    </div>

    <div v-else class="aulas-grid">
      <div v-for="aula in aulasPaginadas" :key="aula._id" class="aula-card">
        <div class="aula-header">
          <div class="aula-icono" :class="`tipo-${aula.tipo.toLowerCase()}`">
            <svg v-if="aula.tipo === 'Laboratorio'" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="aula.tipo === 'Taller'" width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z"/>
            </svg>
            <svg v-else width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <span :class="['tipo-badge', `tipo-${aula.tipo.toLowerCase()}`]">
            {{ aula.tipo }}
          </span>
        </div>

        <div class="aula-info">
          <h3>{{ aula.nombre }}</h3>
          <div class="aula-codigo">
            <span class="badge badge-primary">{{ aula.codigo }}</span>
          </div>

          <div class="aula-detalles">
            <div class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              <span>{{ aula.edificio || 'Sin edificio' }}</span>
            </div>

            <div v-if="aula.piso !== undefined" class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"/>
              </svg>
              <span>Piso {{ aula.piso }}</span>
            </div>

            <div class="detalle-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Capacidad: {{ aula.capacidad }} personas</span>
            </div>
          </div>
        </div>

        <div class="aula-acciones">
          <button class="btn-icon" @click="editarAula(aula)" title="Editar">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          <button class="btn-icon btn-danger" @click="eliminarAula(aula)" title="Eliminar">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <p v-if="aulasFiltradas.length === 0" class="empty-state">
        📭 No se encontraron aulas
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="aulasFiltradas.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="aulasFiltradas.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal -->
    <Modal
      v-model="mostrarModal"
      :titulo="aulaEditando ? 'Editar Aula' : 'Nueva Aula'"
      :loading="guardando"
      @guardar="guardarAula"
    >
      <form @submit.prevent="guardarAula" class="form-modal">
        <div class="form-row">
          <div class="form-group">
            <label>Código *</label>
            <input v-model="formulario.codigo" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formulario.nombre" type="text" class="form-input" required>
          </div>
        </div>

        <div class="form-group">
          <label>Tipo *</label>
          <select v-model="formulario.tipo" class="form-input" required>
            <option value="">Seleccionar tipo</option>
            <option value="Aula">Aula</option>
            <option value="Taller">Taller</option>
            <option value="Laboratorio">Laboratorio</option>
            <option value="Auditorio">Auditorio</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Edificio</label>
            <input v-model="formulario.edificio" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Piso</label>
            <input v-model.number="formulario.piso" type="number" class="form-input" min="0">
          </div>
        </div>

        <div class="form-group">
          <label>Capacidad *</label>
          <input v-model.number="formulario.capacidad" type="number" class="form-input" min="1" required>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="formulario.activo" type="checkbox">
            <span>Aula activa</span>
          </label>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { aulasService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const aulas = ref([])
const tipoFiltro = ref('')
const busqueda = ref('')
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const aulaEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(20)

const formulario = ref({
  codigo: '',
  nombre: '',
  tipo: '',
  edificio: '',
  piso: 0,
  capacidad: 30,
  activo: true
})

const aulasFiltradas = computed(() => {
  let filtered = aulas.value

  if (tipoFiltro.value) {
    filtered = filtered.filter(a => a.tipo === tipoFiltro.value)
  }

  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.nombre.toLowerCase().includes(term) ||
      a.codigo.toLowerCase().includes(term)
    )
  }

  return filtered
})

const aulasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return aulasFiltradas.value.slice(inicio, fin)
})

function abrirModalNuevo() {
  aulaEditando.value = null
  formulario.value = {
    codigo: '',
    nombre: '',
    tipo: '',
    edificio: '',
    piso: 0,
    capacidad: 30,
    activo: true
  }
  mostrarModal.value = true
}

function editarAula(aula) {
  aulaEditando.value = aula
  formulario.value = {
    codigo: aula.codigo,
    nombre: aula.nombre,
    tipo: aula.tipo,
    edificio: aula.edificio || '',
    piso: aula.piso || 0,
    capacidad: aula.capacidad,
    activo: aula.activo !== false
  }
  mostrarModal.value = true
}

async function guardarAula() {
  try {
    guardando.value = true
    
    if (aulaEditando.value) {
      await aulasService.update(aulaEditando.value._id, formulario.value)
    } else {
      await aulasService.create(formulario.value)
    }
    
    await cargarAulas()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando aula:', error)
    alert('Error al guardar el aula')
  } finally {
    guardando.value = false
  }
}

async function eliminarAula(aula) {
  if (!confirm(`¿Eliminar el aula "${aula.nombre}"?`)) return
  
  try {
    await aulasService.delete(aula._id)
    await cargarAulas()
  } catch (error) {
    console.error('Error eliminando aula:', error)
    alert('Error al eliminar el aula')
  }
}

async function cargarAulas() {
  try {
    loading.value = true
    const response = await aulasService.getAll()
    aulas.value = response.data.data
  } catch (error) {
    console.error('Error cargando aulas:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarAulas()
})
</script>

<style scoped>
.aulas-view {
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
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
}

.filtro-select,
.filtro-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.aulas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.aula-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s;
  position: relative;
}

.aula-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.aula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.aula-icono {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.aula-icono.tipo-aula {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
}

.aula-icono.tipo-laboratorio {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.aula-icono.tipo-taller {
  background: linear-gradient(135deg, #10b981, #059669);
}

.aula-icono.tipo-auditorio {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.tipo-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.tipo-badge.tipo-aula {
  background: #dbeafe;
  color: #1e40af;
}

.tipo-badge.tipo-laboratorio {
  background: #fef3c7;
  color: #92400e;
}

.tipo-badge.tipo-taller {
  background: #d1fae5;
  color: #065f46;
}

.tipo-badge.tipo-auditorio {
  background: #ede9fe;
  color: #5b21b6;
}

.aula-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.aula-codigo {
  margin-bottom: 1rem;
}

.aula-detalles {
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

.aula-acciones {
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

  .aulas-grid {
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
