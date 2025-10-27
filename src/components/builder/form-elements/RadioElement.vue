<template>
  <div class="radio-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div :class="['radio-group', config.props.layout]">
      <div 
        v-for="option in config.props.options" 
        :key="option.value"
        class="radio-option"
      >
        <label class="radio-container">
          <input 
            v-model="selectedValue"
            type="radio"
            :value="option.value"
            :name="`radio-${elementId}`"
            :required="config.validation.required"
            class="radio-input"
            @change="validateInput"
          />
          <span class="radio-checkmark"></span>
          <span class="radio-text">{{ option.label }}</span>
        </label>
      </div>
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

// Generate unique element ID for radio group
const elementId = ref(Math.random().toString(36).substr(2, 9))

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'radio',
    name: 'Radio Buttons',
    category: 'fields' as const,
    icon: 'pi pi-circle',
    description: 'Radio button selection field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Choose Option',
    defaultValue: 'Choose Option',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
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
    defaultValue: 'Select one option from the choices',
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
    layout: 'vertical' // or 'horizontal'
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
      key: 'props.options',
      label: 'Options',
      type: 'options',
      required: true,
      description: 'Add options for the radio buttons'
    },
    {
      key: 'props.layout',
      label: 'Layout',
      type: 'select',
      required: false,
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' }
      ]
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
    type: 'radio',
    name: 'Radio Buttons',
    category: 'fields' as const,
    icon: 'pi pi-circle',
    description: 'Radio button selection field'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Choose Option',
    defaultValue: 'Choose Option',
    editable: true
  },
  
  // Placeholder configuration  
  placeholder: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
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
    defaultValue: 'Select one option from the choices',
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
    layout: 'vertical'
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
      key: 'props.options',
      label: 'Options',
      type: 'options',
      required: true,
      description: 'Add options for the radio buttons'
    },
    {
      key: 'props.layout',
      label: 'Layout',
      type: 'select',
      required: false,
      options: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' }
      ]
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
.radio-element {
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-group.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.radio-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.radio-checkmark {
  position: relative;
  height: 20px;
  width: 20px;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
}

.radio-container:hover .radio-checkmark {
  border-color: var(--accent-color);
  background-color: var(--accent-light);
}

.radio-input:checked ~ .radio-checkmark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.radio-checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.radio-input:checked ~ .radio-checkmark:after {
  display: block;
}

.radio-text {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
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