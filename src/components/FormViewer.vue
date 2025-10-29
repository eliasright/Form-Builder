<template>
  <div class="form-viewer">
    <div class="form-container">
      <!-- Form Header -->
      <div v-if="formSchema.meta" class="form-header">
        <h1 class="form-title">{{ formSchema.meta.name || 'Untitled Form' }}</h1>
        <p v-if="formSchema.meta.description" class="form-description">
          {{ formSchema.meta.description }}
        </p>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="form-content">
        <!-- Empty Form State -->
        <div v-if="!formSchema.fields || formSchema.fields.length === 0" class="empty-form-state">
          <div class="empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h3>No Form Fields</h3>
          <p>This form doesn't have any fields yet. Go back to the builder to add some elements.</p>
          <button @click="$emit('close')" class="back-btn">
            <i class="pi pi-arrow-left"></i>
            Back to Builder
          </button>
        </div>
        
        <!-- Render Form Fields -->
        <div v-for="row in formSchema.fields" :key="row.id" class="form-row">
          <div 
            v-for="column in row.columns" 
            :key="column.id" 
            v-show="shouldShowElement(column)"
            :class="['form-column', `width-${column.width}`]"
          >
            <component 
              :is="getElementComponent(column.type)"
              :column="column"
              :is-preview="false"
              :form-data="formData"
              @update-value="updateFieldValue"
              :class="['form-element', `element-${column.type}`]"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div v-if="showSubmit" class="form-actions">
          <button type="submit" class="submit-btn" :disabled="!isValid">
            <i class="pi pi-check"></i>
            {{ submitText }}
          </button>
          <button v-if="showReset" type="button" @click="resetForm" class="reset-btn">
            <i class="pi pi-refresh"></i>
            Reset
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="showSuccess" class="success-message">
        <i class="pi pi-check-circle"></i>
        <span>Form submitted successfully!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TextElement from './builder/form-elements/TextElement.vue'
import TextareaElement from './builder/form-elements/TextareaElement.vue'
import NumberInputElement from './builder/form-elements/NumberInputElement.vue'
import EmailInputElement from './builder/form-elements/EmailInputElement.vue'
import PhoneInputElement from './builder/form-elements/PhoneInputElement.vue'
import SelectElement from './builder/form-elements/SelectElement.vue'
import RadioElement from './builder/form-elements/RadioElement.vue'
import CheckboxElement from './builder/form-elements/CheckboxElement.vue'
import DatePickerElement from './builder/form-elements/DatePickerElement.vue'
import ImageUploadElement from './builder/form-elements/ImageUploadElement.vue'
import HeadingElement from './builder/form-elements/HeadingElement.vue'
import ParagraphElement from './builder/form-elements/ParagraphElement.vue'
import DividerElement from './builder/form-elements/DividerElement.vue'
import type { FormSchema, FormColumn } from '@/types/schema'

interface Props {
  schema?: FormSchema | null
  showSubmit?: boolean
  showReset?: boolean
  submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSubmit: true,
  showReset: true,
  submitText: 'Submit'
})

const emit = defineEmits<{
  submit: [data: Record<string, unknown>]
  reset: []
  close: []
}>()

// Default empty schema
const defaultSchema: FormSchema = {
  meta: {
    name: 'Sample Form',
    description: 'This is a sample form'
  },
  fields: []
}

// Form data and state
const formData = ref<Record<string, any>>({})
const showSuccess = ref(false)

// Conditional display logic
const shouldShowElement = (column: FormColumn): boolean => {
  if (!column.conditionalDisplay) return true
  
  const { field, condition, value } = column.conditionalDisplay
  const fieldValue = formData.value[field]
  
  switch (condition) {
    case 'equals':
      return fieldValue === value
    case 'not_equals':
      return fieldValue !== value
    case 'contains':
      return fieldValue && fieldValue.toString().includes(value)
    case 'not_empty':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
    case 'empty':
      return fieldValue === undefined || fieldValue === null || fieldValue === ''
    default:
      return true
  }
}

// Use provided schema or default
const formSchema = computed(() => props.schema || defaultSchema)

// Reset form function - declare first
const resetForm = () => {
  formData.value = {}
  showSuccess.value = false
  emit('reset')
}

// Form validation - simplified for now
const isValid = computed(() => {
  // Always enable submit for preview
  return true
})

// Watch for schema changes and reset form data
watch(() => props.schema, () => {
  resetForm()
}, { immediate: true })

// Get element component
const getElementComponent = (type: string) => {
  switch (type) {
    case 'text': return TextElement
    case 'textarea': return TextareaElement
    case 'number': return NumberInputElement
    case 'email': return EmailInputElement
    case 'phone': return PhoneInputElement
    case 'select': return SelectElement
    case 'radio': return RadioElement
    case 'checkbox': return CheckboxElement
    case 'calendar': return DatePickerElement
    case 'image': return ImageUploadElement
    case 'heading': return HeadingElement
    case 'paragraph': return ParagraphElement
    case 'divider': return DividerElement
    default: return TextElement
  }
}


// Update field value
const updateFieldValue = (fieldId: string, value: unknown) => {
  formData.value[fieldId] = value
}

// Handle form submission
const handleSubmit = () => {
  if (!isValid.value) return

  // Show success message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)

  // Emit submit event with form data
  emit('submit', { ...formData.value })

  console.log('Form submitted:', formData.value)
}
</script>

<style scoped>
.form-viewer {
  min-height: 100vh;
  background: var(--p-surface-ground);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  background: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  overflow: hidden;
}

.form-header {
  background: var(--accent-color);
  color: white;
  padding: 2rem;
  text-align: center;
}

.form-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--p-text-color);
}

.form-description {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.5;
  color: var(--p-text-muted-color);
}

.form-content {
  padding: 2rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.form-column {
  flex: 1;
  min-width: 0;
}

.form-column.width-1 {
  flex: 1;
}

.form-column.width-2 {
  flex: 2;
}

.form-column.width-3 {
  flex: 3;
}

.form-element {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 2rem;
  border-top: 1px solid var(--p-surface-border);
  margin-top: 2rem;
}

.submit-btn,
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.submit-btn {
  background: var(--accent-color);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  background: var(--p-surface-300);
  color: var(--p-text-muted-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-btn {
  background: var(--p-surface-100);
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-border);
}

.reset-btn:hover {
  background: var(--p-surface-200);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--p-green-50);
  color: var(--p-green-800);
  padding: 1rem;
  margin: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid var(--p-green-200);
}

.success-message i {
  font-size: 1.2rem;
}

.empty-form-state {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--p-text-muted-color);
}

.empty-icon {
  font-size: 4rem;
  color: var(--p-surface-400);
  margin-bottom: 1.5rem;
}

.empty-form-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: var(--p-text-color);
}

.empty-form-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .form-viewer {
    padding: 1rem;
  }
  
  .form-container {
    border-radius: 8px;
  }
  
  .form-header {
    padding: 1.5rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-content {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-column {
    flex: none;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .submit-btn,
  .reset-btn {
    width: 100%;
  }
}

/* Empty state */
.form-viewer:has(.form-content:empty) .form-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.form-viewer:has(.form-content:empty) .form-container::before {
  content: "No form elements to display";
  color: var(--p-text-muted-color);
  font-size: 1.1rem;
}
</style>