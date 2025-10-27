<template>
  <div class="number-input-element">
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
        type="number"
        :placeholder="config.placeholder.value"
        :min="config.validation.min"
        :max="config.validation.max"
        :step="config.validation.allowDecimals ? (config.validation.step || 0.01) : 1"
        :required="config.validation.required"
        :disabled="false"
        :class="['number-input', { 'has-error': validationError, 'is-valid': isValid && inputValue !== '' }]"
        @input="validateNumber"
        @blur="validateNumber"
      />
      
      <div v-if="config.validation.min !== undefined || config.validation.max !== undefined" class="range-hint">
        {{ config.validation.min ?? '−∞' }} to {{ config.validation.max ?? '+∞' }}
      </div>
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && inputValue !== ''" class="success-message">
      <i class="pi pi-check"></i>
      Valid number
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
    type: 'number',
    name: 'Number Input',
    category: 'fields' as const,
    icon: 'pi pi-hashtag',
    description: 'Numeric input field with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Number Input',
    defaultValue: 'Number Input',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter number...',
    defaultValue: 'Enter number...',
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
    defaultValue: 'Enter a numeric value',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    min: undefined,
    max: undefined,
    step: 1,
    allowDecimals: true,
    decimalPlaces: 2,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputMode: 'numeric',
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
      key: 'validation.min',
      label: 'Minimum Value',
      type: 'number',
      required: false
    },
    {
      key: 'validation.max',
      label: 'Maximum Value',
      type: 'number',
      required: false
    },
    {
      key: 'validation.step',
      label: 'Step',
      type: 'number',
      required: false,
      min: 0.01,
      step: 0.01,
      defaultValue: 1
    },
    {
      key: 'validation.allowDecimals',
      label: 'Allow Decimal Places',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.decimalPlaces',
      label: 'Maximum Decimal Places',
      type: 'number',
      required: false,
      min: 0,
      max: 10
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
const inputValue = ref('')
const validationError = ref('')

// Validation logic
const isValid = computed(() => {
  if (inputValue.value === '') return false
  
  const numValue = parseFloat(inputValue.value)
  if (isNaN(numValue)) return false
  
  const val = config.value.validation
  
  // Check min/max constraints
  if (val.min !== undefined && numValue < val.min) return false
  if (val.max !== undefined && numValue > val.max) return false
  
  // Check decimal validation
  if (!val.allowDecimals && inputValue.value.includes('.')) return false
  
  if (val.allowDecimals && val.decimalPlaces !== undefined) {
    const decimalPart = inputValue.value.split('.')[1]
    if (decimalPart && decimalPart.length > val.decimalPlaces) return false
  }
  
  return true
})

const validateNumber = () => {
  validationError.value = ''
  const val = config.value.validation
  
  // Emit value change for conditional display
  if (props.column?.name && !props.isPreview) {
    emit('update-value', props.column.name, inputValue.value)
  }
  
  // Required validation
  if (inputValue.value === '' && val.required) {
    validationError.value = val.customMessage || 'This field is required'
    return
  }
  
  if (inputValue.value === '') return
  
  const numValue = parseFloat(inputValue.value)
  
  if (isNaN(numValue)) {
    validationError.value = 'Please enter a valid number'
    return
  }
  
  // Min validation
  if (val.min !== undefined && numValue < val.min) {
    validationError.value = `Value must be at least ${val.min}`
    return
  }
  
  // Max validation
  if (val.max !== undefined && numValue > val.max) {
    validationError.value = `Value must be at most ${val.max}`
    return
  }
  
  // Decimal validation
  if (!val.allowDecimals && inputValue.value.includes('.')) {
    validationError.value = 'Decimal numbers are not allowed'
    return
  }
  
  if (val.allowDecimals && val.decimalPlaces !== undefined) {
    const decimalPart = inputValue.value.split('.')[1]
    if (decimalPart && decimalPart.length > val.decimalPlaces) {
      validationError.value = `Maximum ${val.decimalPlaces} decimal places allowed`
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
    type: 'number',
    name: 'Number Input',
    category: 'fields' as const,
    icon: 'pi pi-hashtag',
    description: 'Numeric input field with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Number Input',
    defaultValue: 'Number Input',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter number...',
    defaultValue: 'Enter number...',
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
    defaultValue: 'Enter a numeric value',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    min: undefined,
    max: undefined,
    step: 1,
    allowDecimals: true,
    decimalPlaces: 2,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    inputMode: 'numeric',
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
      key: 'validation.min',
      label: 'Minimum Value',
      type: 'number',
      required: false
    },
    {
      key: 'validation.max',
      label: 'Maximum Value',
      type: 'number',
      required: false
    },
    {
      key: 'validation.step',
      label: 'Step',
      type: 'number',
      required: false,
      min: 0.01,
      step: 0.01,
      defaultValue: 1
    },
    {
      key: 'validation.allowDecimals',
      label: 'Allow Decimal Places',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.decimalPlaces',
      label: 'Maximum Decimal Places',
      type: 'number',
      required: false,
      min: 0,
      max: 10
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
.number-input-element {
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

.number-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.number-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.number-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.number-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.range-hint {
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