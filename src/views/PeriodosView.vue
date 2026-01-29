<template>
  <div class="periodos-view">
    <div class="page-header">
      <div>
        <h1>📅 Períodos Académicos</h1>
        <p>Gestiona los ciclos académicos</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalNuevo">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Nuevo Período
      </button>
    </div>

    <!-- Grid de Períodos -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando períodos...</p>
    </div>

    <div v-else class="periodos-grid">
      <div 
        v-for="periodo in periodosPaginados" 
        :key="periodo._id" 
        class="periodo-card"
        :class="{ 'periodo-activo': periodo.estado === 'activo' }"
      >
        <div class="periodo-header">
          <div class="periodo-icono">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
          </div>
          <span :class="['estado-badge', `estado-${periodo.estado}`]">
            {{ periodo.estado }}
          </span>
        </div>

        <div class="periodo-info">
          <div class="periodo-codigo">{{ periodo.codigo }}</div>
          <h3>{{ periodo.nombre }}</h3>

          <div class="periodo-fechas">
            <div class="fecha-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <div>
                <div class="fecha-label">Inicio:</div>
                <div class="fecha-valor">{{ formatearFecha(periodo.fechaInicio) }}</div>
              </div>
            </div>

            <div class="fecha-divider">→</div>

            <div class="fecha-item">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <div>
                <div class="fecha-label">Fin:</div>
                <div class="fecha-valor">{{ formatearFecha(periodo.fechaFin) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="periodo-acciones">
          <button class="btn btn-secondary btn-sm" @click="editarPeriodo(periodo)">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Editar
          </button>
          <button class="btn btn-secondary btn-sm btn-danger" @click="eliminarPeriodo(periodo)">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clip-rule="evenodd"/>
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <p v-if="periodos.length === 0" class="empty-state">
        📭 No hay períodos registrados
      </p>
    </div>

    <!-- Paginación -->
    <Pagination 
      v-if="periodos.length > 0"
      :current-page="paginaActual"
      :per-page="porPagina"
      :total="periodos.length"
      @update:current-page="paginaActual = $event"
    />

    <!-- Modal -->
    <Modal
      v-model="mostrarModal"
      :titulo="periodoEditando ? 'Editar Período' : 'Nuevo Período'"
      :loading="guardando"
      @guardar="guardarPeriodo"
    >
      <form @submit.prevent="guardarPeriodo" class="form-modal">
        <div class="form-group">
          <label>Código *</label>
          <input v-model="formulario.codigo" type="text" class="form-input" placeholder="202610" required>
        </div>

        <div class="form-group">
          <label>Nombre *</label>
          <input v-model="formulario.nombre" type="text" class="form-input" placeholder="Período 2026-1" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fecha Inicio *</label>
            <input v-model="formulario.fechaInicio" type="date" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Fecha Fin *</label>
            <input v-model="formulario.fechaFin" type="date" class="form-input" required>
          </div>
        </div>

        <div class="form-group">
          <label>Estado *</label>
          <select v-model="formulario.estado" class="form-input" required>
            <option value="">Seleccionar estado</option>
            <option value="planificado">Planificado</option>
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { periodosService } from '../services'
import Modal from '../components/Modal.vue'
import Pagination from '../components/Pagination.vue'

const periodos = ref([])
const loading = ref(false)
const guardando = ref(false)
const mostrarModal = ref(false)
const periodoEditando = ref(null)
const paginaActual = ref(1)
const porPagina = ref(10)

const formulario = ref({
  codigo: '',
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'planificado'
})

const periodosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return periodos.value.slice(inicio, fin)
})

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function abrirModalNuevo() {
  periodoEditando.value = null
  formulario.value = {
    codigo: '',
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'planificado'
  }
  mostrarModal.value = true
}

function editarPeriodo(periodo) {
  periodoEditando.value = periodo
  formulario.value = {
    codigo: periodo.codigo,
    nombre: periodo.nombre,
    fechaInicio: periodo.fechaInicio ? periodo.fechaInicio.split('T')[0] : '',
    fechaFin: periodo.fechaFin ? periodo.fechaFin.split('T')[0] : '',
    estado: periodo.estado
  }
  mostrarModal.value = true
}

async function guardarPeriodo() {
  try {
    guardando.value = true
    
    if (periodoEditando.value) {
      await periodosService.update(periodoEditando.value._id, formulario.value)
    } else {
      await periodosService.create(formulario.value)
    }
    
    await cargarPeriodos()
    mostrarModal.value = false
  } catch (error) {
    console.error('Error guardando período:', error)
    alert('Error al guardar el período')
  } finally {
    guardando.value = false
  }
}

async function eliminarPeriodo(periodo) {
  if (!confirm(`¿Eliminar el período "${periodo.nombre}"?`)) return
  
  try {
    await periodosService.delete(periodo._id)
    await cargarPeriodos()
  } catch (error) {
    console.error('Error eliminando período:', error)
    alert('Error al eliminar el período')
  }
}

async function cargarPeriodos() {
  try {
    loading.value = true
    const response = await periodosService.getAll()
    periodos.value = response.data.data.sort((a, b) => {
      if (a.estado === 'activo') return -1
      if (b.estado === 'activo') return 1
      return new Date(b.fechaInicio) - new Date(a.fechaInicio)
    })
  } catch (error) {
    console.error('Error cargando períodos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarPeriodos()
})
</script>

<style scoped>
.periodos-view {
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

.periodos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.periodo-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow);
  transition: all 0.3s;
  border: 3px solid transparent;
}

.periodo-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.periodo-card.periodo-activo {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.periodo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.periodo-icono {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.estado-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.estado-activo {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.estado-cerrado {
  background: #fee2e2;
  color: #991b1b;
}

.estado-badge.estado-planificado {
  background: #fef3c7;
  color: #92400e;
}

.periodo-codigo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.periodo-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--dark);
}

.periodo-fechas {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--light-gray);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.fecha-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.fecha-item svg {
  color: var(--primary);
  flex-shrink: 0;
}

.fecha-label {
  font-size: 0.75rem;
  color: var(--gray);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fecha-valor {
  font-size: 1rem;
  font-weight: 700;
  color: var(--dark);
}

.fecha-divider {
  font-size: 1.5rem;
  color: var(--gray);
  font-weight: 300;
}

.periodo-acciones {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger {
  color: var(--danger);
}

.btn-danger:hover {
  background: #fee2e2;
  color: var(--danger);
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

  .periodos-grid {
    grid-template-columns: 1fr;
  }

  .periodo-fechas {
    flex-direction: column;
    align-items: stretch;
  }

  .fecha-divider {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
