<template>
  <div class="template-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div class="input-wrapper">
      <input 
        v-model="inputValue"
        type="text" 
        :placeholder="config.placeholder.value"
        :required="config.validation.required"
        :minlength="config.validation.minLength"
        :maxlength="config.validation.maxLength"
        :disabled="false"
        :class="['template-input', { 'has-error': validationError, 'is-valid': isValid && inputValue }]"
        @input="validateInput"
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

// EVERYTHING IS SELF-CONTAINED HERE - NO EXTERNAL DEPENDENCIES
interface Props {
  // Optional: can override defaults, but element works without any props
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
}

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'template',
    name: 'Template Element',
    category: 'fields', // 'fields' | 'static'
    icon: 'pi pi-file',
    description: 'A template showing how to structure form elements'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Template Field',
    defaultValue: 'Template Field',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter template value...',
    defaultValue: 'Enter template value...',
    editable: true
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'This is a template element for demonstration',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minLength: 0,
    maxLength: 100,
    pattern: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputType: 'text',
    autocomplete: 'off'
  },
  
  // Settings panel configuration (what shows in right panel)
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
      min: 0
    },
    {
      key: 'validation.maxLength',
      label: 'Maximum Length', 
      type: 'number',
      required: false,
      min: 1,
      max: 1000
    },
    {
      key: 'helpText.value',
      label: 'Help Text',
      type: 'textarea',
      required: false
    }
  ]
}

// Merge props with defaults
const config = computed(() => {
  if (!props.overrides) return defaultConfig
  
  // Deep merge overrides with defaults
  const merged = JSON.parse(JSON.stringify(defaultConfig))
  
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
    type: 'template',
    name: 'Template Element',
    category: 'fields', // 'fields' | 'static'
    icon: 'pi pi-file',
    description: 'A template showing how to structure form elements'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Template Field',
    defaultValue: 'Template Field',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter template value...',
    defaultValue: 'Enter template value...',
    editable: true
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'This is a template element for demonstration',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minLength: 0,
    maxLength: 100,
    pattern: '',
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputType: 'text',
    autocomplete: 'off'
  },
  
  // Settings panel configuration (what shows in right panel)
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
      min: 0
    },
    {
      key: 'validation.maxLength',
      label: 'Maximum Length', 
      type: 'number',
      required: false,
      min: 1,
      max: 1000
    },
    {
      key: 'helpText.value',
      label: 'Help Text',
      type: 'textarea',
      required: false
    }
  ]
}

export const elementConfig = defaultConfig

// EXPORT SETTINGS GENERATOR 
// This generates the settings panel dynamically
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
.template-element {
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

.input-wrapper {
  position: relative;
}

.template-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.template-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.template-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.template-input.is-valid {
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