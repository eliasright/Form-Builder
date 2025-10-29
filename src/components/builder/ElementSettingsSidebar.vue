<template>
  <div class="element-settings-sidebar" :class="{ 'visible': visible }">
    <div class="sidebar-header">
      <h3>Element Settings</h3>
      <button @click="$emit('close')" class="close-btn">
        <i class="pi pi-times"></i>
      </button>
    </div>
    
    <div class="settings-content">
      <div class="setting-group">
        <label class="setting-label">Label</label>
        <input 
          type="text" 
          :value="element?.label" 
          @input="updateField('label', $event.target.value)"
          class="setting-input"
          placeholder="Field label"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">Placeholder</label>
        <input 
          type="text" 
          :value="element?.placeholder" 
          @input="updateField('placeholder', $event.target.value)"
          class="setting-input"
          placeholder="Placeholder text"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">Required</label>
        <div class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="element?.validation.required" 
            @change="updateValidation('required', $event.target.checked)"
            class="setting-checkbox"
            id="required-checkbox"
          />
          <label for="required-checkbox" class="checkbox-label">This field is required</label>
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">Max Length</label>
        <input 
          type="number" 
          :value="element?.validation.maxLength" 
          @input="updateValidation('maxLength', parseInt($event.target.value))"
          class="setting-input"
          placeholder="Maximum characters"
          min="1"
        />
      </div>

      <div v-if="element?.type === 'textarea'" class="setting-group">
        <label class="setting-label">Rows</label>
        <input 
          type="number" 
          :value="element?.props?.rows || 3" 
          @input="updateProps('rows', parseInt($event.target.value))"
          class="setting-input"
          min="2"
          max="10"
        />
      </div>

      <div class="setting-group">
        <label class="setting-label">Element Type</label>
        <div class="type-badge">{{ element?.type }}</div>
      </div>

    </div>
    
    <!-- Fixed bottom action bar -->
    <div class="action-bar">
      <button @click="$emit('close')" class="save-btn">
        <i class="pi pi-check"></i>
        <span>Save</span>
      </button>
      <button @click="$emit('deleteElement')" class="delete-btn">
        <i class="pi pi-trash"></i>
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormColumn } from '@/types/schema'

interface Props {
  visible: boolean
  element?: FormColumn | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updateElement: [updates: Partial<FormColumn>]
  deleteElement: []
}>()

const updateField = (field: keyof FormColumn, value: unknown): void => {
  emit('updateElement', { [field]: value })
}

const updateValidation = (field: string, value: unknown): void => {
  if (!props.element) return
  emit('updateElement', {
    validation: {
      ...props.element.validation,
      [field]: value
    }
  })
}

const updateProps = (field: string, value: unknown): void => {
  if (!props.element) return
  emit('updateElement', {
    props: {
      ...props.element.props,
      [field]: value
    }
  })
}
</script>

<style scoped>
.element-settings-sidebar {
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
  overflow: hidden;
}

.element-settings-sidebar.visible {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
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

.save-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  border-radius: 6px;
  color: var(--accent-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.settings-content {
  padding: 2rem;
  padding-bottom: 120px;
  overflow-y: auto;
  height: calc(100vh - 100px);
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.setting-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.setting-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
  cursor: pointer;
}

.checkbox-label {
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  margin: 0;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
}

.type-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.action-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-top: 2px solid var(--border-color);
  display: flex;
  gap: 0.75rem;
  z-index: 10;
}

.save-btn {
  flex: 2;
  padding: 0.75rem 1rem;
  border: 1px solid var(--accent-color);
  background: var(--accent-color);
  border-radius: 6px;
  color: var(--accent-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.delete-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.delete-btn i {
  font-size: 0.875rem;
}
</style>