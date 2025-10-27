<template>
  <div class="date-picker-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div class="input-wrapper">
      <input
        v-model="inputValue"
        type="date"
        :min="config.validation.minDate"
        :max="config.validation.maxDate"
        :required="config.validation.required"
        :disabled="false"
        :class="['date-input', { 'has-error': validationError, 'is-valid': isValid && inputValue }]"
        @change="validateDate"
        @blur="validateDate"
      />
      
      <div v-if="config.props.showTime" class="time-input-wrapper">
        <input
          v-model="timeValue"
          type="time"
          :step="config.props.timeStep"
          :class="['time-input', { 'has-error': validationError }]"
          @change="validateDate"
        />
      </div>
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && inputValue" class="success-message">
      <i class="pi pi-check"></i>
      Valid date
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
  column?: any
}

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'date',
    name: 'Date Picker',
    category: 'fields' as const,
    icon: 'pi pi-calendar',
    description: 'Date and time picker with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Date Picker',
    defaultValue: 'Date Picker',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Select date...',
    defaultValue: 'Select date...',
    editable: true
  },
  
  // Description configuration
  description: {
    show: false,
    value: '',
    defaultValue: '',
    editable: true
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'Select a date',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minDate: '',
    maxDate: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    showTime: false,
    timeStep: 60, // seconds
    format: 'YYYY-MM-DD',
    defaultToToday: false
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'label.value',
      label: 'Label',
      type: 'text',
      required: true
    },
    {
      key: 'description.value',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Additional information for users'
    },
    {
      key: 'validation.required',
      label: 'Required',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.showTime',
      label: 'Include Time',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.minDate',
      label: 'Minimum Date',
      type: 'date',
      required: false
    },
    {
      key: 'validation.maxDate',
      label: 'Maximum Date', 
      type: 'date',
      required: false
    },
    {
      key: 'props.defaultToToday',
      label: 'Default to Today',
      type: 'checkbox',
      required: false
    }
  ]
}

// Merge props with defaults - USE COLUMN DATA FROM FORMBUILDER
const config = computed(() => {
  let merged = JSON.parse(JSON.stringify(defaultConfig))
  
  // If we have column data from FormBuilder, use it
  if (props.column) {
    merged.label = props.column.label || merged.label
    merged.placeholder = props.column.placeholder || merged.placeholder
    merged.description = props.column.description || merged.description
    merged.validation = props.column.validation || merged.validation
    merged.props = props.column.props || merged.props
  }
  
  // Apply any additional overrides
  if (props.overrides) {
    function deepMerge(target: any, source: any) {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {}
          deepMerge(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }
    deepMerge(merged, props.overrides)
  }
  
  return merged
})

// Component state
const inputValue = ref(config.value.props.defaultToToday ? new Date().toISOString().split('T')[0] : '')
const timeValue = ref('12:00')
const validationError = ref('')

// Validation logic
const isValid = computed(() => {
  if (!inputValue.value) return false
  
  const selectedDate = new Date(inputValue.value)
  const val = config.value.validation
  
  // Check min/max dates
  if (val.minDate && selectedDate < new Date(val.minDate)) return false
  if (val.maxDate && selectedDate > new Date(val.maxDate)) return false
  
  return true
})

const validateDate = () => {
  validationError.value = ''
  const val = config.value.validation
  
  // Required validation
  if (!inputValue.value && val.required) {
    validationError.value = val.customMessage || 'Date is required'
    return
  }
  
  if (!inputValue.value) return
  
  const selectedDate = new Date(inputValue.value)
  
  // Check if valid date
  if (isNaN(selectedDate.getTime())) {
    validationError.value = 'Please enter a valid date'
    return
  }
  
  // Min date validation
  if (val.minDate && selectedDate < new Date(val.minDate)) {
    validationError.value = `Date must be after ${val.minDate}`
    return
  }
  
  // Max date validation
  if (val.maxDate && selectedDate > new Date(val.maxDate)) {
    validationError.value = `Date must be before ${val.maxDate}`
    return
  }
}

// Helper to get nested object values
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}
</script>

<script lang="ts">
// EXPORT STATIC CONFIGURATION FOR FORM BUILDER
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'date',
    name: 'Date Picker',
    category: 'fields' as const,
    icon: 'pi pi-calendar',
    description: 'Date and time picker with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Date Picker',
    defaultValue: 'Date Picker',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Select date...',
    defaultValue: 'Select date...',
    editable: true
  },
  
  // Description configuration
  description: {
    show: false,
    value: '',
    defaultValue: '',
    editable: true
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'Select a date',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minDate: '',
    maxDate: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    showTime: false,
    timeStep: 60, // seconds
    format: 'YYYY-MM-DD',
    defaultToToday: false
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'label.value',
      label: 'Label',
      type: 'text',
      required: true
    },
    {
      key: 'description.value',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Additional information for users'
    },
    {
      key: 'validation.required',
      label: 'Required',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.showTime',
      label: 'Include Time',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.minDate',
      label: 'Minimum Date',
      type: 'date',
      required: false
    },
    {
      key: 'validation.maxDate',
      label: 'Maximum Date', 
      type: 'date',
      required: false
    },
    {
      key: 'props.defaultToToday',
      label: 'Default to Today',
      type: 'checkbox',
      required: false
    }
  ]
}

export const elementConfig = defaultConfig

// EXPORT SETTINGS GENERATOR 
export function generateSettings(currentConfig: any) {
  return defaultConfig.settings.map(setting => ({
    ...setting,
    value: getNestedValue(currentConfig, setting.key)
  }))
}

// Helper to get nested object values
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((o, p) => o?.[p], obj)
}
</script>

<style scoped>
.date-picker-element {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.element-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.required-indicator {
  color: var(--text-danger);
  margin-left: 0.25rem;
}

.element-description {
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: 0.25rem;
  margin-bottom: 0.75rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.date-input,
.time-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.date-input:focus,
.time-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.date-input.has-error,
.time-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.date-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.time-input-wrapper {
  flex: 0 0 auto;
}

.error-message,
.success-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.error-message {
  color: var(--text-danger);
}

.success-message {
  color: #10b981;
}
</style>