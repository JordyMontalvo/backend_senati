<template>
  <div class="horario-bloque-view">
    <!-- Header del Bloque -->
    <div class="bloque-header-info">
      <button class="btn-back" @click="$router.back()">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        Volver
      </button>

      <div v-if="bloque" class="bloque-info-card">
        <div class="info-principal">
          <h1>📅 Horario del Bloque {{ bloque.codigo }}</h1>
          <div class="badges">
            <span class="badge badge-primary">{{ bloque.carrera?.nombre }}</span>
            <span class="badge badge-success">Semestre {{ bloque.semestreAcademico }}</span>
            <span :class="['badge', `badge-${getEstadoColor(bloque.estado)}`]">
              {{ bloque.estado }}
            </span>
          </div>
        </div>
        
        <div class="info-secundaria">
          <div class="info-item">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <span><strong>Período:</strong> {{ bloque.periodo?.nombre }}</span>
          </div>
          <div class="info-item">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span><strong>Inscritos:</strong> {{ bloque.totalInscritos }} / {{ bloque.capacidadMax }} estudiantes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Horarios -->
    <div class="card horario-card">
      <div class="card-header">
        <h2>📚 Horario Semanal</h2>
        <div class="leyenda">
          <span class="leyenda-item teoria">Teoría</span>
          <span class="leyenda-item taller">Taller</span>
          <span class="leyenda-item laboratorio">Laboratorio</span>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando horario...</p>
      </div>

      <div v-else-if="horarios.length === 0" class="empty-horario">
        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
        </svg>
        <h3>No hay horarios programados</h3>
        <p>Este bloque aún no tiene horarios asignados</p>
      </div>

      <div v-else class="horario-table-container">
        <table class="horario-table">
          <thead>
            <tr>
              <th class="hora-column">Hora</th>
              <th v-for="dia in diasSemana" :key="dia">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="hora in horasUnicas" :key="hora">
              <td class="hora-cell">{{ hora }}</td>
              <td v-for="dia in diasSemana" :key="dia" class="sesion-cell">
                <div v-if="obtenerSesion(dia, hora)" 
                     :class="['sesion', `sesion-${obtenerSesion(dia, hora).tipoSesion.toLowerCase()}`]">
                  <div class="sesion-curso">{{ obtenerSesion(dia, hora).curso }}</div>
                  <div class="sesion-profesor">👨‍🏫 {{ obtenerSesion(dia, hora).profesor }}</div>
                  <div class="sesion-aula">🚪 {{ obtenerSesion(dia, hora).aula }}</div>
                  <div class="sesion-tipo">{{ obtenerSesion(dia, hora).tipoSesion }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Cursos del Bloque -->
    <div class="card">
      <div class="card-header">
        <h2>📖 Cursos Asignados al Bloque</h2>
      </div>
      <div class="cursos-grid">
        <div v-for="sesion in cursosUnicos" :key="sesion.curso" class="curso-item">
          <div class="curso-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
          </div>
          <div class="curso-info">
            <h4>{{ sesion.curso }}</h4>
            <p>👨‍🏫 {{ sesion.profesor }}</p>
            <span class="badge badge-sm badge-primary">{{ sesion.totalHoras }} horas/semana</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { bloquesService, horariosService } from '../services'

const route = useRoute()
const bloqueId = route.params.id

const bloque = ref(null)
const horarios = ref([])
const loading = ref(true)

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const horasUnicas = computed(() => {
  const horas = new Set()
  horarios.value.forEach(h => {
    horas.add(h.horaInicio)
  })
  return Array.from(horas).sort()
})

const cursosUnicos = computed(() => {
  const cursosMap = new Map()
  horarios.value.forEach(h => {
    const curso = h.asignacion?.curso?.nombre || 'Sin nombre'
    const profesor = h.asignacion?.profesor?.nombreCompleto || h.asignacion?.profesor?.nombres || 'Sin asignar'
    
    if (!cursosMap.has(curso)) {
      cursosMap.set(curso, {
        curso,
        profesor,
        totalHoras: 0
      })
    }
    
    // Calcular duración (simplificado)
    const inicio = h.horaInicio.split(':')
    const fin = h.horaFin.split(':')
    const duracion = (parseInt(fin[0]) - parseInt(inicio[0])) + ((parseInt(fin[1]) - parseInt(inicio[1])) / 60)
    
    cursosMap.get(curso).totalHoras += duracion
  })
  
  return Array.from(cursosMap.values())
})

function obtenerSesion(dia, hora) {
  const sesion = horarios.value.find(h => h.diaSemana === dia && h.horaInicio === hora)
  if (!sesion) return null
  
  return {
    curso: sesion.asignacion?.curso?.nombre || 'Sin curso',
    profesor: sesion.asignacion?.profesor?.nombreCompleto || sesion.asignacion?.profesor?.nombres || 'Sin profesor',
    aula: sesion.aula?.nombre || sesion.aula?.codigo || 'Sin aula',
    tipoSesion: sesion.tipoSesion || 'Teoría'
  }
}

function getEstadoColor(estado) {
  const colores = {
    'planificado': 'warning',
    'activo': 'success',
    'finalizado': 'secondary'
  }
  return colores[estado] || 'secondary'
}

async function cargarDatos() {
  try {
    loading.value = true
    
    // Cargar bloque
    const bloqueResponse = await bloquesService.getById(bloqueId)
    bloque.value = bloqueResponse.data.data
    
    // Cargar horarios del bloque
    const horariosResponse = await horariosService.getByBloque(bloqueId)
    horarios.value = horariosResponse.data.data
    
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.horario-bloque-view {
  max-width: 1600px;
  margin: 0 auto;
}

.bloque-header-info {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  margin-bottom: 1rem;
  background: var(--light-gray);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--border);
}

.bloque-info-card {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
}

.info-principal h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.info-secundaria {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid var(--border);
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.leyenda {
  display: flex;
  gap: 1rem;
}

.leyenda-item {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.leyenda-item.teoria {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.leyenda-item.taller {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}

.leyenda-item.laboratorio {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.horario-table-container {
  overflow-x: auto;
  padding: 1.5rem;
}

.horario-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

.horario-table thead th {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 1rem;
  font-weight: 700;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.horario-table thead th:first-child {
  border-radius: 0.75rem 0 0 0;
}

.horario-table thead th:last-child {
  border-radius: 0 0.75rem 0 0;
}

.hora-column {
  width: 100px;
}

.hora-cell {
  background: var(--light-gray);
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  color: var(--primary);
  border-right: 2px solid var(--border);
}

.sesion-cell {
  padding: 0.5rem;
  border: 1px solid var(--border);
  vertical-align: top;
  min-height: 100px;
}

.sesion {
  padding: 0.75rem;
  border-radius: 0.5rem;
  height: 100%;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: all 0.2s;
}

.sesion:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.sesion-teoria {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left: 4px solid #3b82f6;
}

.sesion-taller {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left: 4px solid #10b981;
}

.sesion-laboratorio {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-left: 4px solid #f59e0b;
}

.sesion-curso {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.sesion-profesor,
.sesion-aula {
  font-size: 0.8125rem;
  color: var(--gray);
}

.sesion-tipo {
  margin-top: auto;
  padding-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-horario {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray);
}

.empty-horario svg {
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-horario h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.cursos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.curso-item {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--light-gray);
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.curso-item:hover {
  background: var(--border);
  transform: translateX(4px);
}

.curso-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.curso-info h4 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.curso-info p {
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 0.5rem;
}

.badge-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .horario-table {
    font-size: 0.875rem;
  }

  .sesion {
    min-height: 80px;
    padding: 0.5rem;
  }

  .cursos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
