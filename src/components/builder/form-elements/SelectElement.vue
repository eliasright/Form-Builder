<template>
  <div class="select-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div class="select-wrapper">
      <select 
        v-model="selectedValue"
        :required="config.validation.required"
        :disabled="false"
        :class="['select-input', { 'has-error': validationError, 'is-valid': isValid && selectedValue }]"
        @change="validateInput"
        @blur="validateInput"
      >
        <option value="" disabled>{{ config.placeholder.value || 'Select an option...' }}</option>
        <option 
          v-for="option in config.props.options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <i class="pi pi-chevron-down select-icon"></i>
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && selectedValue" class="success-message">
      <i class="pi pi-check"></i>
      Valid selection
    </div>
    
    <small v-if="config.helpText.show && config.helpText.value" class="help-text">
      {{ config.helpText.value }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
  column?: any
  formData?: Record<string, any>
}

const emit = defineEmits<{
  'update-value': [fieldName: string, value: any]
}>()

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'select',
    name: 'Select Dropdown',
    category: 'fields' as const,
    icon: 'pi pi-list',
    description: 'Dropdown selection field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Select Option',
    defaultValue: 'Select Option',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Choose an option...',
    defaultValue: 'Choose an option...',
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
    defaultValue: 'Select one option from the list',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ],
    multiple: false
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
      key: 'placeholder.value', 
      label: 'Placeholder',
      type: 'text',
      required: false
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
      key: 'props.options',
      label: 'Options',
      type: 'options',
      required: true,
      description: 'Add options for the dropdown'
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
const selectedValue = ref('')
const validationError = ref('')

// Validation logic
const isValid = computed(() => {
  if (!selectedValue.value) return false
  
  // Check if selected value exists in options
  const validOptions = config.value.props.options.map((opt: any) => opt.value)
  return validOptions.includes(selectedValue.value)
})

const validateInput = () => {
  validationError.value = ''
  const val = config.value.validation
  
  // Emit value change for conditional display
  if (props.column?.name && !props.isPreview) {
    emit('update-value', props.column.name, selectedValue.value)
  }
  
  // Required validation
  if (!selectedValue.value && val.required) {
    validationError.value = val.customMessage || 'This field is required'
    return
  }
  
  if (!selectedValue.value) return
  
  // Validate option exists
  const validOptions = config.value.props.options.map((opt: any) => opt.value)
  if (!validOptions.includes(selectedValue.value)) {
    validationError.value = 'Please select a valid option'
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
    type: 'select',
    name: 'Select Dropdown',
    category: 'fields' as const,
    icon: 'pi pi-list',
    description: 'Dropdown selection field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Select Option',
    defaultValue: 'Select Option',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Choose an option...',
    defaultValue: 'Choose an option...',
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
    defaultValue: 'Select one option from the list',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ],
    multiple: false
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
      key: 'placeholder.value', 
      label: 'Placeholder',
      type: 'text',
      required: false
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
      key: 'props.options',
      label: 'Options',
      type: 'options',
      required: true,
      description: 'Add options for the dropdown'
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
.select-element {
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

.select-wrapper {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
  background-image: none;
}

.select-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.select-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.select-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
  font-size: 0.8rem;
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

.help-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>