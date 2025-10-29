<template>
  <div class="email-input-element">
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
        type="email"
        :placeholder="config.placeholder.value"
        :required="config.validation.required"
        :disabled="false"
        :class="['email-input', { 'has-error': validationError, 'is-valid': isValid && inputValue }]"
        @blur="validateEmail"
        @input="clearError"
      />
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && inputValue" class="success-message">
      <i class="pi pi-check"></i>
      Valid email address
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
  'update-value': [fieldName: string, value: string]
}>()

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'email',
    name: 'Email Address',
    category: 'fields' as const,
    icon: 'pi pi-at',
    description: 'Email input field with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Email Address',
    defaultValue: 'Email Address',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter email...',
    defaultValue: 'Enter email...',
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
    defaultValue: 'Enter a valid email address',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    customMessage: '',
    allowMultiple: false
  },
  
  // Element-specific properties
  props: {
    inputMode: 'email',
    autocomplete: 'email'
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
      key: 'validation.allowMultiple',
      label: 'Allow Multiple Emails',
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
    merged = deepMerge(merged, props.overrides)
  }

  return merged
})

// Component state
const inputValue = ref('')
const validationError = ref('')

// Enhanced email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValid = computed(() => {
  if (!inputValue.value) return false
  
  if (config.value.validation.allowMultiple) {
    // Validate multiple emails separated by commas
    const emails = inputValue.value.split(',').map(email => email.trim())
    return emails.every(email => emailRegex.test(email))
  } else {
    return emailRegex.test(inputValue.value)
  }
})

const validateEmail = () => {
  const val = config.value.validation

  // Emit value change for conditional display
  if (props.column?.name && !props.isPreview) {
    emit('update-value', props.column.name, inputValue.value)
  }

  if (!inputValue.value && !val.required) {
    validationError.value = ''
    return
  }

  if (!inputValue.value && val.required) {
    validationError.value = val.customMessage || 'Email address is required'
    return
  }

  if (val.allowMultiple) {
    const emails = inputValue.value.split(',').map(email => email.trim())
    const invalidEmails = emails.filter(email => !emailRegex.test(email))

    if (invalidEmails.length > 0) {
      validationError.value = val.customMessage || 'Please enter valid email addresses'
      return
    }
  } else {
    if (!emailRegex.test(inputValue.value)) {
      validationError.value = val.customMessage || 'Please enter a valid email address'
      return
    }
  }

  validationError.value = ''
}

const clearError = () => {
  if (validationError.value) {
    validationError.value = ''
  }
}
</script>

<script lang="ts">
import { getNestedValue } from '@/utils/helpers'

// EXPORT STATIC CONFIGURATION FOR FORM BUILDER
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'email',
    name: 'Email Address',
    category: 'fields' as const,
    icon: 'pi pi-at',
    description: 'Email input field with validation'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Email Address',
    defaultValue: 'Email Address',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: true,
    value: 'Enter email...',
    defaultValue: 'Enter email...',
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
    defaultValue: 'Enter a valid email address',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    customMessage: '',
    allowMultiple: false
  },
  
  // Element-specific properties
  props: {
    inputMode: 'email',
    autocomplete: 'email'
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
      key: 'validation.allowMultiple',
      label: 'Allow Multiple Emails',
      type: 'checkbox',
      required: false
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
.email-input-element {
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

.email-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.email-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.email-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.email-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
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