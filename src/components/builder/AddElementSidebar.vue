<template>
  <div class="add-element-sidebar" :class="{ 'visible': visible }">
    <div class="sidebar-header">
      <h3>Add Element</h3>
      <button @click="$emit('close')" class="close-btn">
        <i class="pi pi-times"></i>
      </button>
    </div>
    
    <div class="element-options">
      <div class="element-option" @click="selectElement('text')">
        <div class="element-icon">
          <i class="pi pi-align-left"></i>
        </div>
        <div class="element-info">
          <h4>Text Input</h4>
          <p>Single line text field for names, emails, etc.</p>
        </div>
      </div>
      
      <div class="element-option" @click="selectElement('textarea')">
        <div class="element-icon">
          <i class="pi pi-align-justify"></i>
        </div>
        <div class="element-info">
          <h4>Text Area</h4>
          <p>Multi-line text field for descriptions, comments, etc.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Debug log
import { watch } from 'vue'
watch(() => props.visible, (newValue) => {
  console.log('AddElementSidebar visible changed to:', newValue)
})

const emit = defineEmits<{
  close: []
  selectElement: [elementType: 'text' | 'textarea']
}>()

const selectElement = (elementType: 'text' | 'textarea'): void => {
  emit('selectElement', elementType)
}
</script>

<style scoped>
.add-element-sidebar {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background: var(--bg-primary);
  border-left: 3px solid var(--border-color);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.add-element-sidebar.visible {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0.5rem 1rem 0.5rem;
  border-bottom: 2px solid var(--border-color);
  background: var(--bg-secondary);
}

.sidebar-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--accent-color);
  color: var(--accent-text);
  border-color: var(--accent-color);
}

.element-options {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.element-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-primary);
}

.element-option:hover {
  border-color: var(--accent-color);
  background: var(--accent-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.element-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-color);
  border: 2px solid var(--accent-hover);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.element-icon i {
  font-size: 1.25rem;
  color: var(--accent-text);
}

.element-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.element-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>