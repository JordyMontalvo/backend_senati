import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  carrerasService, 
  cursosService, 
  periodosService,
  bloquesService,
  profesoresService
} from '@/services'

export const useAppStore = defineStore('app', () => {
  // Estado
  const carreras = ref([])
  const cursos = ref([])
  const periodos = ref([])
  const bloques = ref([])
  const profesores = ref([])
  const loading = ref(false)
  const error = ref(null)

  //  Getters computados
  const carrerasActivas = computed(() => 
    carreras.value.filter(c => c.activo !== false)
  )

  const periodoActivo = computed(() => 
    periodos.value.find(p => p.estado === 'activo')
  )

  // Acciones
  async function fetchCarreras() {
    try {
      loading.value = true
      const response = await carrerasService.getAll()
      carreras.value = response.data.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching carreras:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchCursos(filtros = {}) {
    try {
      loading.value = true
      const response = await cursosService.getAll(filtros)
      cursos.value = response.data.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching cursos:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPeriodos() {
    try {
      loading.value = true
      const response = await periodosService.getAll()
      periodos.value = response.data.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching periodos:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBloques(filtros = {}) {
    try {
      loading.value = true
      const response = await bloquesService.getAll(filtros)
      bloques.value = response.data.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching bloques:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchProfesores() {
    try {
      loading.value = true
      const response = await profesoresService.getAll()
      profesores.value = response.data.data
      error.value = null
    } catch (err) {
      error.value = err.message
      console.error('Error fetching profesores:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    carreras,
    cursos,
    periodos,
    bloques,
    profesores,
    loading,
    error,
    // Getters
    carrerasActivas,
    periodoActivo,
    // Acciones
    fetchCarreras,
    fetchCursos,
    fetchPeriodos,
    fetchBloques,
    fetchProfesores
  }
})
