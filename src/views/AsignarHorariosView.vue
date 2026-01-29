<template>
  <div class="asignar-horarios-view">
    <div class="page-header">
      <div>
        <h1>📅 Asignar Horarios por Bloque</h1>
        <p>Configura cursos, profesores, aulas y horarios para cada bloque</p>
      </div>
    </div>

    <!-- PASO 1: Seleccionar Bloque -->
    <div class="card selector-bloque">
      <h2>1️⃣ Selecciona el Bloque</h2>
      <div class="selector-grid">
        <div class="form-group">
          <label>Período:</label>
          <select v-model="periodoSeleccionado" @change="cargarBloquesPorPeriodo" class="form-input">
            <option value="">Seleccionar período</option>
            <option v-for="periodo in periodos" :key="periodo._id" :value="periodo._id">
              {{ periodo.codigo }} - {{ periodo.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Bloque:</label>
          <select v-model="bloqueSeleccionado" @change="cargarInfoBloque" class="form-input">
            <option value="">Seleccionar bloque</option>
            <option v-for="bloque in bloquesFiltrados" :key="bloque._id" :value="bloque._id">
              {{ bloque.codigo }} - {{ bloque.carrera?.nombre }} (Sem. {{ bloque.semestreAcademico }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Información del Bloque Seleccionado -->
    <div v-if="bloqueActual" class="card bloque-info-card">
      <div class="bloque-info-header">
        <div class="bloque-badge">
          <h2>📚 {{ bloqueActual.codigo }}</h2>
          <span class="badge badge-primary">{{ bloqueActual.carrera?.nombre }}</span>
        </div>
        <div class="bloque-meta">
          <div class="meta-item">
            <strong>Período:</strong> {{ bloqueActual.periodo?.nombre }}
          </div>
          <div class="meta-item">
            <strong>Semestre:</strong> {{ bloqueActual.semestreAcademico }}
          </div>
          <div class="meta-item">
            <strong>Capacidad:</strong> {{ bloqueActual.totalInscritos || 0 }}/{{ bloqueActual.capacidadMax }}
          </div>
        </div>
      </div>
    </div>

    <!-- PASO 2: Asignar Cursos al Bloque -->
    <div v-if="bloqueActual" class="card">
      <div class="section-header">
        <h2>2️⃣ Cursos del Semestre {{ bloqueActual.semestreAcademico }}</h2>
        <button class="btn btn-primary" @click="mostrarModalAsignacion = true">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Asignar Curso
        </button>
      </div>

      <!-- Lista de Asignaciones -->
      <div v-if="asignaciones.length === 0" class="empty-state">
        No hay cursos asignados a este bloque. Haz clic en "Asignar Curso" para comenzar.
      </div>

      <div v-else class="asignaciones-list">
        <div v-for="asignacion in asignaciones" :key="asignacion._id" class="asignacion-item">
          <div class="asignacion-header">
            <div class="curso-info">
              <h3>{{ asignacion.curso?.nombre }}</h3>
              <span class="badge badge-primary">{{ asignacion.curso?.codigo }}</span>
              <span class="badge badge-info">{{ asignacion.curso?.creditos }} créditos</span>
            </div>
            <div class="asignacion-acciones">
              <button class="btn btn-secondary btn-sm" @click="editarAsignacion(asignacion)">
                Editar
              </button>
              <button class="btn btn-danger btn-sm" @click="eliminarAsignacion(asignacion._id)">
                Eliminar
              </button>
            </div>
          </div>

          <div class="asignacion-detalles">
            <div class="detalle-col">
              <strong>👨‍🏫 Profesor:</strong>
              <span>{{ asignacion.profesor?.nombres }} {{ asignacion.profesor?.apellidos }}</span>
            </div>
            <div class="detalle-col">
              <strong>🚪 Aula:</strong>
              <span>{{ asignacion.aula?.nombre || 'Sin asignar' }}</span>
            </div>
            <div class="detalle-col">
              <strong>⏰ Horas Semanales:</strong>
              <span>{{ asignacion.curso?.horasTotal }}h (T:{{ asignacion.curso?.horasTeoria }} + P:{{ asignacion.curso?.horasTaller }})</span>
            </div>
          </div>

          <!-- Horarios de esta asignación -->
          <div class="horarios-asignacion">
            <div class="horarios-header">
              <strong>📅 Horarios:</strong>
              <button class="btn btn-primary btn-sm" @click="agregarHorario(asignacion)">
                + Agregar Horario
              </button>
            </div>
            <div v-if="asignacion.horarios && asignacion.horarios.length > 0" class="horarios-grid">
              <div 
                v-for="horario in asignacion.horarios" 
                :key="horario._id" 
                class="horario-tag clickable"
                @click="editarHorario(horario)"
                title="Clic para editar"
              >
                <strong>{{ horario.diaSemana }}</strong>
                {{ horario.horaInicio }} - {{ horario.horaFin }}
                <span class="tipo-sesion">{{ horario.tipoSesion }}</span>
                <button class="btn-remove" @click.stop="eliminarHorario(horario._id)">×</button>
              </div>
            </div>
            <div v-else class="no-horarios">
              Sin horarios asignados
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PASO 3: Vista Previa del Horario Semanal -->
    <div v-if="bloqueActual && asignaciones.length > 0" class="card">
      <h2>3️⃣ Vista Previa - Horario Semanal del Bloque {{ bloqueActual.codigo }}</h2>
      <div class="horario-semanal">
        <table class="tabla-horario">
          <thead>
            <tr>
              <th class="hora-col">Hora</th>
              <th v-for="dia in diasSemana" :key="dia">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hora in horasUnicas" :key="hora">
              <td class="hora-cell">{{ hora }}</td>
              <td v-for="dia in diasSemana" :key="dia" class="sesion-cell">
                <div v-if="obtenerSesion(dia, hora)" :class="['sesion-block', `tipo-${obtenerSesion(dia, hora).tipo}`]">
                  <div class="sesion-curso">{{ obtenerSesion(dia, hora).curso }}</div>
                  <div class="sesion-profesor">{{ obtenerSesion(dia, hora).profesor }}</div>
                  <div class="sesion-aula">{{ obtenerSesion(dia, hora).aula }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Asignar Curso al Bloque -->
    <Modal
      v-model="mostrarModalAsignacion"
      :titulo="asignacionActual ? 'Editar Asignación' : 'Asignar Curso'"
      size="large"
      :loading="guardando"
      @guardar="guardarAsignacion"
    >
      <form @submit.prevent="guardarAsignacion" class="form-modal">
        <div class="form-group">
          <label>Curso *</label>
          <select v-model="formularioAsignacion.curso" class="form-input" required>
            <option value="">Seleccionar curso</option>
            <option v-for="curso in cursosDisponibles" :key="curso._id" :value="curso._id">
              {{ curso.codigo }} - {{ curso.nombre }} ({{ curso.horasTotal }}h)
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Profesor *</label>
            <select v-model="formularioAsignacion.profesor" class="form-input" required>
              <option value="">Seleccionar profesor</option>
              <option v-for="profesor in profesores" :key="profesor._id" :value="profesor._id">
                {{ profesor.nombres }} {{ profesor.apellidos }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Aula</label>
            <select v-model="formularioAsignacion.aula" class="form-input">
              <option value="">Seleccionar aula</option>
              <option v-for="aula in aulas" :key="aula._id" :value="aula._id">
                {{ aula.codigo }} - {{ aula.nombre }} ({{ aula.tipo }}, Cap: {{ aula.capacidad }})
              </option>
            </select>
          </div>
        </div>
      </form>
    </Modal>

    <!-- Modal: Agregar/Editar Horario -->
    <Modal
      v-model="mostrarModalHorario"
      :titulo="horarioEditando ? 'Editar Horario' : 'Agregar Horario'"
      :loading="guardando"
      @guardar="guardarHorario"
    >
      <form @submit.prevent="guardarHorario" class="form-modal">
        <div class="form-row">
          <div class="form-group">
            <label>Día de la Semana *</label>
            <select v-model="formularioHorario.diaSemana" class="form-input" required>
              <option value="">Seleccionar</option>
              <option v-for="dia in diasSemana" :key="dia" :value="dia">{{ dia }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de Sesión *</label>
            <select v-model="formularioHorario.tipoSesion" class="form-input" required>
              <option value="">Seleccionar</option>
              <option value="Teoría">Teoría</option>
              <option value="Taller">Taller</option>
              <option value="Laboratorio">Laboratorio</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Hora Inicio *</label>
            <input v-model="formularioHorario.horaInicio" type="time" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Hora Fin *</label>
            <input v-model="formularioHorario.horaFin" type="time" class="form-input" required>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import Modal from '../components/Modal.vue'
import { bloquesService, periodosService, cursosService, profesoresService, aulasService } from '../services'
import api from '../services/api'

const toast = inject('toast')
const periodos = ref([])
const bloques = ref([])
const periodoSeleccionado = ref('')
const bloqueSeleccionado = ref('')
const bloqueActual = ref(null)
const asignaciones = ref([])
const profesores = ref([])
const aulas = ref([])
const cursos = ref([])
const guardando = ref(false)

const mostrarModalAsignacion = ref(false)
const mostrarModalHorario = ref(false)
const asignacionActual = ref(null) // Para saber a qué asignación agregar horario
const horarioEditando = ref(null) // Para saber si estamos editando un horario

const formularioAsignacion = ref({
  curso: '',
  profesor: '',
  aula: '',
  bloque: ''
})

const formularioHorario = ref({
  asignacion: '',
  diaSemana: '',
  horaInicio: '',
  horaFin: '',
  tipoSesion: ''
})

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const bloquesFiltrados = computed(() => {
  if (!periodoSeleccionado.value) return []
  return bloques.value.filter(b => b.periodo?._id === periodoSeleccionado.value)
})

const cursosDisponibles = computed(() => {
  if (!bloqueActual.value) return []
  return cursos.value.filter(c => 
    c.carrera?._id === bloqueActual.value.carrera?._id &&
    c.semestre === bloqueActual.value.semestreAcademico
  )
})

const horasUnicas = computed(() => {
  const horas = new Set()
  asignaciones.value.forEach(asig => {
    asig.horarios?.forEach(h => {
      horas.add(h.horaInicio)
    })
  })
  return Array.from(horas).sort()
})

function obtenerSesion(dia, hora) {
  for (const asig of asignaciones.value) {
    if (!asig.horarios) continue
    const horario = asig.horarios.find(h => h.diaSemana === dia && h.horaInicio === hora)
    if (horario) {
      return {
        curso: asig.curso?.codigo || '',
        profesor: `${asig.profesor?.nombres || ''} ${asig.profesor?.apellidos || ''}`,
        aula: asig.aula?.codigo || 'N/A',
        tipo: (horario.tipoSesion || 'teoria').toLowerCase()
      }
    }
  }
  return null
}

async function cargarPeriodos() {
  try {
    const response = await periodosService.getAll()
    periodos.value = response.data.data
    const activo = periodos.value.find(p => p.estado === 'activo')
    if (activo) {
      periodoSeleccionado.value = activo._id
      await cargarBloquesPorPeriodo()
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function cargarBloquesPorPeriodo() {
  try {
    const response = await bloquesService.getAll({ periodo: periodoSeleccionado.value })
    bloques.value = response.data.data
  } catch (error) {
    console.error('Error:', error)
  }
}

async function cargarInfoBloque() {
  try {
    const response = await bloquesService.getById(bloqueSeleccionado.value)
    bloqueActual.value = response.data.data
    await cargarAsignaciones()
  } catch (error) {
    console.error('Error:', error)
  }
}

async function cargarAsignaciones() {
  try {
    const response = await api.get(`/asignaciones?bloque=${bloqueSeleccionado.value}`)
    asignaciones.value = response.data.data
    
    // Cargar horarios para cada asignación
    for (const asig of asignaciones.value) {
      const horariosRes = await api.get(`/horarios?asignacion=${asig._id}`)
      asig.horarios = horariosRes.data.data
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function guardarAsignacion() {
  try {
    guardando.value = true
    formularioAsignacion.value.bloque = bloqueSeleccionado.value
    
    if (asignacionActual.value) {
      await api.put(`/asignaciones/${asignacionActual.value._id}`, formularioAsignacion.value)
    } else {
      await api.post('/asignaciones', formularioAsignacion.value)
    }

    await cargarAsignaciones()
    mostrarModalAsignacion.value = false
    formularioAsignacion.value = { curso: '', profesor: '', aula: '', bloque: '' }
    asignacionActual.value = null
  } catch (error) {
    console.error('Error:', error)
    alert('Error al guardar la asignación')
  } finally {
    guardando.value = false
  }
}

function editarAsignacion(asignacion) {
  asignacionActual.value = asignacion
  formularioAsignacion.value = {
    curso: asignacion.curso?._id || '',
    profesor: asignacion.profesor?._id || '',
    aula: asignacion.aula?._id || '',
    bloque: bloqueSeleccionado.value
  }
  mostrarModalAsignacion.value = true
}

function agregarHorario(asignacion) {
  asignacionActual.value = asignacion
  horarioEditando.value = null
  formularioHorario.value = {
    asignacion: asignacion._id,
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    tipoSesion: 'Teoría'
  }
  mostrarModalHorario.value = true
}

function editarHorario(horario) {
  horarioEditando.value = horario
  formularioHorario.value = {
    asignacion: horario.asignacion,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    tipoSesion: horario.tipoSesion
  }
  mostrarModalHorario.value = true
}

async function guardarHorario() {
  try {
    guardando.value = true
    
    if (horarioEditando.value) {
       await api.put(`/horarios/${horarioEditando.value._id}`, formularioHorario.value)
       toast.success('Éxito', 'Horario actualizado correctamente')
    } else {
       await api.post('/horarios', formularioHorario.value)
       toast.success('Éxito', 'Horario agregado correctamente')
    }

    await cargarAsignaciones()
    mostrarModalHorario.value = false
  } catch (error) {
    console.error('Error:', error)
    const status = error.response?.status
    const msg = error.response?.data?.message || 'Error al guardar el horario'
    
    if (status === 409) {
      toast.error('Conflicto de Horario', msg)
    } else {
      toast.error('Error', msg)
    }
  } finally {
    guardando.value = false
  }
}

async function eliminarAsignacion(id) {
  if (!confirm('¿Eliminar esta asignación? Se borrarán todos sus horarios.')) return
  try {
    await api.delete(`/asignaciones/${id}`)
    toast.success('Eliminado', 'Asignación eliminada correctamente')
    await cargarAsignaciones()
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error', 'No se pudo eliminar la asignación')
  }
}

async function eliminarHorario(id) {
  if (!confirm('¿Eliminar este horario?')) return
  try {
    await api.delete(`/horarios/${id}`)
    toast.success('Eliminado', 'Horario eliminado correctamente')
    await cargarAsignaciones()
  } catch (error) {
    console.error('Error:', error)
    toast.error('Error', 'No se pudo eliminar el horario')
  }
}

async function cargarDatos() {
  try {
    const [profesoresRes, aulasRes, cursosRes] = await Promise.all([
      profesoresService.getAll(),
      aulasService.getAll(),
      cursosService.getAll()
    ])
    profesores.value = profesoresRes.data.data
    aulas.value = aulasRes.data.data
    cursos.value = cursosRes.data.data
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    cargarPeriodos(),
    cargarDatos()
  ])
})
</script>

<style scoped>
.asignar-horarios-view {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
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

.selector-bloque {
  margin-bottom: 2rem;
}

.selector-bloque h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.bloque-info-card {
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.bloque-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bloque-badge h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.bloque-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  font-size: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.asignaciones-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.asignacion-item {
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: white;
}

.asignacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.curso-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.curso-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
}

.asignacion-acciones {
  display: flex;
  gap: 0.5rem;
}

.asignacion-detalles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--light-gray);
  border-radius: 0.5rem;
}

.detalle-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.horarios-asignacion {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.horarios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.horarios-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.horario-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.horario-tag.clickable {
  cursor: pointer;
}

.horario-tag.clickable:hover {
  background: var(--light-gray);
  border-color: var(--primary);
}

.tipo-sesion {
  padding: 0.125rem 0.5rem;
  background: var(--primary);
  color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.btn-remove {
  background: var(--danger);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
}

.no-horarios {
  color: var(--gray);
  font-style: italic;
  padding: 0.5rem;
}

.horario-semanal {
  overflow-x: auto;
}

.tabla-horario {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.tabla-horario thead th {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 700;
}

.hora-col {
  width: 100px;
}

.hora-cell {
  background: var(--light-gray);
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  color: var(--primary);
  border: 1px solid var(--border);
}

.sesion-cell {
  padding: 0.5rem;
  border: 1px solid var(--border);
  vertical-align: top;
  min-height: 100px;
}

.sesion-block {
  padding: 0.75rem;
  border-radius: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sesion-block.tipo-teoría {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left: 4px solid #3b82f6;
}

.sesion-block.tipo-taller {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left: 4px solid #10b981;
}

.sesion-block.tipo-laboratorio {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left: 4px solid #f59e0b;
}

.sesion-curso {
  font-weight: 700;
  font-size: 0.9375rem;
}

.sesion-profesor,
.sesion-aula {
  font-size: 0.8125rem;
  color: var(--gray);
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .selector-grid,
  .asignacion-detalles,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
