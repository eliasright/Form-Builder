<template>
  <div class="text-element">
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
        type="text" 
        :placeholder="config.placeholder.value"
        :required="config.validation.required"
        :minlength="config.validation.minLength"
        :maxlength="config.validation.maxLength"
        :disabled="false"
        :class="['text-input', { 'has-error': validationError, 'is-valid': isValid && inputValue }]"
        @input="handleInput"
        @blur="validateInput"
      />
      
      <div v-if="config.validation.maxLength" class="character-count">
        {{ inputValue.length }}/{{ config.validation.maxLength }}
      </div>
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && inputValue" class="success-message">
      <i class="pi pi-check"></i>
      Valid input
    </div>
    
    <small v-if="config.helpText.show && config.helpText.value" class="help-text">
      {{ config.helpText.value }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormColumn } from '@/types/schema'
import { deepMerge, getNestedValue } from '@/utils/helpers'

interface Props {
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
  column?: FormColumn
  formData?: Record<string, unknown>
}

const emit = defineEmits<{
  'update-value': [fieldName: string, value: string | number]
}>()

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'text',
    name: 'Text Input',
    category: 'fields' as const,
    icon: 'pi pi-align-left',
    description: 'Single line text input field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Text Input',
    defaultValue: 'Text Input',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter text...',
    defaultValue: 'Enter text...',
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
    defaultValue: 'Enter any text value',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minLength: 0,
    maxLength: 255,
    pattern: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputType: 'text',
    autocomplete: 'off'
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
      key: 'validation.minLength',
      label: 'Minimum Length',
      type: 'number',
      required: false,
      min: 0,
      max: 1000
    },
    {
      key: 'validation.maxLength',
      label: 'Maximum Length', 
      type: 'number',
      required: false,
      min: 1,
      max: 10000
    },
    {
      key: 'validation.pattern',
      label: 'Pattern (Regex)',
      type: 'text',
      required: false,
      placeholder: '^[a-zA-Z0-9]+$'
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
    merged = deepMerge(merged, props.overrides)
  }
  
  return merged
})

// Component state
const inputValue = ref('')
const validationError = ref('')

// Validation logic
const isValid = computed(() => {
  if (!inputValue.value) return false
  
  const val = config.value.validation
  
  // Check pattern if specified
  if (val.pattern) {
    const regex = new RegExp(val.pattern)
    if (!regex.test(inputValue.value)) return false
  }
  
  // Check length constraints
  if (inputValue.value.length < val.minLength) return false
  if (val.maxLength && inputValue.value.length > val.maxLength) return false
  
  return true
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  
  // Emit value change for conditional display
  if (props.column?.name && !props.isPreview) {
    emit('update-value', props.column.name, inputValue.value)
  }
  
  validateInput()
}

const validateInput = () => {
  validationError.value = ''
  const val = config.value.validation
  
  // Required validation
  if (!inputValue.value && val.required) {
    validationError.value = val.customMessage || 'This field is required'
    return
  }
  
  if (!inputValue.value) return
  
  // Length validation
  if (inputValue.value.length < val.minLength) {
    validationError.value = `Minimum ${val.minLength} characters required`
    return
  }
  
  if (val.maxLength && inputValue.value.length > val.maxLength) {
    validationError.value = `Maximum ${val.maxLength} characters allowed`
    return
  }
  
  // Pattern validation
  if (val.pattern) {
    const regex = new RegExp(val.pattern)
    if (!regex.test(inputValue.value)) {
      validationError.value = val.customMessage || 'Invalid format'
      return
    }
  }
}

</script>

<script lang="ts">
import { getNestedValue } from '@/utils/helpers'

// EXPORT STATIC CONFIGURATION FOR FORM BUILDER
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'text',
    name: 'Text Input',
    category: 'fields' as const,
    icon: 'pi pi-align-left',
    description: 'Single line text input field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Text Input',
    defaultValue: 'Text Input',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter text...',
    defaultValue: 'Enter text...',
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
    defaultValue: 'Enter any text value',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minLength: 0,
    maxLength: 255,
    pattern: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputType: 'text',
    autocomplete: 'off'
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
      key: 'validation.minLength',
      label: 'Minimum Length',
      type: 'number',
      required: false,
      min: 0,
      max: 1000
    },
    {
      key: 'validation.maxLength',
      label: 'Maximum Length', 
      type: 'number',
      required: false,
      min: 1,
      max: 10000
    },
    {
      key: 'validation.pattern',
      label: 'Pattern (Regex)',
      type: 'text',
      required: false,
      placeholder: '^[a-zA-Z0-9]+$'
    }
  ]
}

export const elementConfig = defaultConfig

// EXPORT SETTINGS GENERATOR
export function generateSettings(currentConfig: typeof defaultConfig) {
  return defaultConfig.settings.map(setting => ({
    ...setting,
    value: getNestedValue(currentConfig, setting.key)
  }))
}

</script>

<style scoped>
.text-element {
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
  position: relative;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.text-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.text-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.character-count {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--bg-primary);
  padding: 0 0.25rem;
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