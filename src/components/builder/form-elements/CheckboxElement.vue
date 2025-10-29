<template>
  <div class="checkbox-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div class="help-text-top" v-if="config.helpText.show && config.helpText.value">
      <small>{{ config.helpText.value }}</small>
    </div>
    
    <div :class="['checkbox-group', config.props.layout]">
      <div 
        v-for="option in config.props.options" 
        :key="option.value"
        class="checkbox-option"
      >
        <label class="checkbox-container">
          <input 
            v-model="selectedValues"
            type="checkbox"
            :value="option.value"
            :disabled="isMaxReached && !selectedValues.includes(option.value)"
            class="checkbox-input"
            @change="validateInput"
          />
          <span class="checkbox-checkmark"></span>
          <span class="checkbox-text">{{ option.label }}</span>
        </label>
      </div>
      
      <!-- Custom "Other" Option -->
      <div v-if="config.props.allowCustom" class="checkbox-option custom-option">
        <label class="checkbox-container">
          <input 
            v-model="hasCustomValue"
            type="checkbox"
            :disabled="isMaxReached && !hasCustomValue"
            class="checkbox-input"
            @change="handleCustomChange"
          />
          <span class="checkbox-checkmark"></span>
          <span class="checkbox-text">Other:</span>
        </label>
        <input 
          v-if="hasCustomValue"
          v-model="customValue"
          type="text" 
          class="custom-input"
          placeholder="Please specify..."
          @input="validateInput"
        />
      </div>
    </div>
    
    <div class="selection-info">
      <small>{{ selectedCount }}/{{ maxSelections }} selected</small>
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && selectedValues.length > 0" class="success-message">
      <i class="pi pi-check"></i>
      Valid selection
    </div>
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
  'update-value': [fieldName: string, value: string[]]
}>()

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'checkbox',
    name: 'Checkbox List',
    category: 'fields' as const,
    icon: 'pi pi-check-square',
    description: 'Multiple choice checkbox list'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Select Options',
    defaultValue: 'Select Options',
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
    show: true,
    value: 'Select one or more options',
    defaultValue: 'Select one or more options',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minSelections: 1,
    maxSelections: 999,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ],
    layout: 'vertical', // or 'horizontal'
    allowCustom: false, // Allow "Other" option with text input
    maxSelections: 999 // Maximum number of selections allowed
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
      key: 'helpText.value',
      label: 'Help Text',
      type: 'text',
      required: false,
      placeholder: 'Instructions for users'
    },
    {
      key: 'validation.required',
      label: 'Required',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.minSelections',
      label: 'Minimum Selections',
      type: 'number',
      required: false,
      min: 1,
      max: 50
    },
    {
      key: 'validation.maxSelections',
      label: 'Maximum Selections',
      type: 'number',
      required: false,
      min: 1,
      max: 50
    },
    {
      key: 'props.options',
      label: 'Options (What users see vs. what gets saved)',
      type: 'options',
      required: true,
      description: 'Label = What users see, Value = What gets saved to database'
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
    },
    {
      key: 'props.allowCustom',
      label: 'Allow Custom "Other" Option',
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
const selectedValues = ref<string[]>([])
const customValue = ref('')
const hasCustomValue = ref(false)
const validationError = ref('')

// Computed properties
const maxSelections = computed(() => config.value.validation.maxSelections || config.value.props.maxSelections || 999)
const selectedCount = computed(() => selectedValues.value.length + (hasCustomValue.value ? 1 : 0))
const isMaxReached = computed(() => selectedCount.value >= maxSelections.value)

// Validation logic
const isValid = computed(() => {
  if (selectedCount.value === 0) return false
  
  const minSelections = config.value.validation.minSelections || 1
  const maxSelections = config.value.validation.maxSelections || 999
  
  return selectedCount.value >= minSelections && selectedCount.value <= maxSelections
})

const validateInput = () => {
  validationError.value = ''
  const val = config.value.validation
  const count = selectedCount.value
  
  // Required validation
  if (count === 0 && val.required) {
    validationError.value = val.customMessage || 'Please select at least one option'
    return
  }
  
  if (count === 0) return
  
  // Min/Max validation
  const minSelections = val.minSelections || 1
  const maxSelections = val.maxSelections || 999
  
  if (count < minSelections) {
    validationError.value = `Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`
    return
  }
  
  if (count > maxSelections) {
    validationError.value = `Please select no more than ${maxSelections} option${maxSelections > 1 ? 's' : ''}`
    return
  }
  
  // Custom value validation
  if (hasCustomValue.value && !customValue.value.trim()) {
    validationError.value = 'Please specify the custom option'
    return
  }
}

const handleCustomChange = () => {
  if (!hasCustomValue.value) {
    customValue.value = ''
  }
  validateInput()
}

</script>

<script lang="ts">
import { getNestedValue } from '@/utils/helpers'

// EXPORT STATIC CONFIGURATION FOR FORM BUILDER
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'checkbox',
    name: 'Checkbox List',
    category: 'fields' as const,
    icon: 'pi pi-check-square',
    description: 'Multiple choice checkbox list'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Select Options',
    defaultValue: 'Select Options',
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
    show: true,
    value: 'Select one or more options',
    defaultValue: 'Select one or more options',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    minSelections: 1,
    maxSelections: 999,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' }
    ],
    layout: 'vertical',
    allowCustom: false,
    maxSelections: 999
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
      key: 'helpText.value',
      label: 'Help Text',
      type: 'text',
      required: false,
      placeholder: 'Instructions for users'
    },
    {
      key: 'validation.required',
      label: 'Required',
      type: 'checkbox',
      required: false
    },
    {
      key: 'validation.minSelections',
      label: 'Minimum Selections',
      type: 'number',
      required: false,
      min: 1,
      max: 50
    },
    {
      key: 'validation.maxSelections',
      label: 'Maximum Selections',
      type: 'number',
      required: false,
      min: 1,
      max: 50
    },
    {
      key: 'props.options',
      label: 'Options (What users see vs. what gets saved)',
      type: 'options',
      required: true,
      description: 'Label = What users see, Value = What gets saved to database'
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
    },
    {
      key: 'props.allowCustom',
      label: 'Allow Custom "Other" Option',
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
.checkbox-element {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.help-text-top {
  margin-top: -0.5rem;
  margin-bottom: 0.25rem;
}

.help-text-top small {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-style: italic;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg-tertiary);
}

.checkbox-group.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  flex-shrink: 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-input:disabled ~ .checkbox-checkmark {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-checkmark {
  position: relative;
  height: 20px;
  width: 20px;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
}

.checkbox-container:hover .checkbox-checkmark {
  border-color: var(--accent-color);
  background-color: var(--accent-light);
}

.checkbox-input:checked ~ .checkbox-checkmark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

.checkbox-checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkbox-checkmark:after {
  display: block;
}

.checkbox-text {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.custom-option {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.custom-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.custom-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.selection-info {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.25rem;
}

.selection-info small {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .checkbox-group.horizontal {
    flex-direction: column;
  }
}
</style>