<template>
  <div class="pagination">
    <div class="pagination-info">
      Mostrando {{ inicio }} - {{ fin }} de {{ total }} resultados
    </div>
    <div class="pagination-controls">
      <button 
        class="pagination-btn" 
        :disabled="currentPage === 1"
        @click="cambiarPagina(currentPage - 1)"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        Anterior
      </button>

      <div class="pagination-pages">
        <button
          v-for="pagina in paginasVisibles"
          :key="pagina"
          :class="['page-btn', { active: pagina === currentPage }]"
          @click="cambiarPagina(pagina)"
        >
          {{ pagina }}
        </button>
      </div>

      <button 
        class="pagination-btn" 
        :disabled="currentPage === totalPaginas"
        @click="cambiarPagina(currentPage + 1)"
      >
        Siguiente
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  perPage: { type: Number, default: 20 },
  total: { type: Number, required: true }
})

const emit = defineEmits(['update:currentPage'])

const totalPaginas = computed(() => Math.ceil(props.total / props.perPage))

const inicio = computed(() => (props.currentPage - 1) * props.perPage + 1)
const fin = computed(() => Math.min(props.currentPage * props.perPage, props.total))

const paginasVisibles = computed(() => {
  const paginas = []
  const maxPaginas = 5
  let inicio = Math.max(1, props.currentPage - Math.floor(maxPaginas / 2))
  let fin = Math.min(totalPaginas.value, inicio + maxPaginas - 1)

  if (fin - inicio < maxPaginas - 1) {
    inicio = Math.max(1, fin - maxPaginas + 1)
  }

  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }

  return paginas
})

function cambiarPagina(pagina) {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    emit('update:currentPage', pagina)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: var(--shadow);
  margin-top: 2rem;
}

.pagination-info {
  color: var(--gray);
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--light-gray);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--dark);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--border);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  background: var(--light-gray);
  color: var(--dark);
}

.page-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-pages {
    display: none;
  }
}
</style>
