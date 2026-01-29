<template>
  <transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="cerrar">
      <div class="modal-container" :class="[size]">
        <div class="modal-header">
          <h2>{{ titulo }}</h2>
          <button class="btn-cerrar" @click="cerrar">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="!hideFooter" class="modal-footer">
          <button class="btn btn-secondary" @click="cerrar">Cancelar</button>
          <button class="btn btn-primary" @click="$emit('guardar')" :disabled="loading">
            <span v-if="loading">Guardando...</span>
            <span v-else>{{ textoGuardar }}</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  titulo: { type: String, default: 'Modal' },
  size: { type: String, default: 'medium' }, // small, medium, large
  hideFooter: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  textoGuardar: { type: String, default: 'Guardar' }
})

const emit = defineEmits(['update:modelValue', 'guardar'])

function cerrar() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.modal-container.small {
  max-width: 400px;
}

.modal-container.medium {
  max-width: 600px;
}

.modal-container.large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
}

.btn-cerrar {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray);
  transition: all 0.2s;
}

.btn-cerrar:hover {
  background: var(--light-gray);
  color: var(--dark);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
