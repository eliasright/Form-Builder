<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Form Submitted Successfully!</h2>
        <button @click="closeModal" class="close-btn">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="success-icon">
          <i class="pi pi-check-circle"></i>
        </div>

        <p class="modal-message">Your form has been submitted. What would you like to do?</p>

        <div class="results-preview">
          <h3>Your Responses:</h3>
          <div class="response-list">
            <div v-for="(value, key) in formattedData" :key="key" class="response-item">
              <span class="response-label">
                <template v-if="key.endsWith(' *')">
                  {{ key.slice(0, -2) }}<span class="required-asterisk">*</span>:
                </template>
                <template v-else>
                  {{ key }}:
                </template>
              </span>
              <span class="response-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="downloadResults" class="action-btn download-btn">
          <i class="pi pi-download"></i>
          Download as TXT
        </button>
        <button @click="closeModal" class="action-btn close-modal-btn">
          <i class="pi pi-times"></i>
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  isOpen: boolean
  data: Record<string, any>
  formName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  download: []
}>()

const formattedData = computed(() => {
  return props.data
})

const closeModal = () => {
  emit('close')
}

const downloadResults = () => {
  emit('download')
  closeModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-muted);
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--surface-100);
  color: var(--text-primary);
}

.modal-body {
  padding: 2rem 1.5rem;
}

.success-icon {
  text-align: center;
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.modal-message {
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.results-preview {
  background: var(--surface-50);
  border-radius: 8px;
  padding: 1.5rem;
}

.results-preview h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.response-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.response-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.response-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 120px;
}

.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}

.response-value {
  color: var(--text-primary);
  word-break: break-word;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn {
  background: #10b981;
  color: white;
}

.download-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.close-modal-btn {
  background: var(--surface-200);
  color: var(--text-primary);
}

.close-modal-btn:hover {
  background: var(--surface-300);
}

@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-footer {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .response-item {
    flex-direction: column;
  }

  .response-label {
    min-width: auto;
  }
}
</style>
