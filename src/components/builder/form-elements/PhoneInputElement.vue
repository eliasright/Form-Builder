<template>
  <div class="phone-input-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div class="phone-input-wrapper">
      <div class="country-selector">
        <select v-model="selectedCountry" class="country-select" :disabled="false">
          <option v-for="country in countries" :key="country.code" :value="country.code">
            {{ country.flag }} {{ country.dialCode }}
          </option>
        </select>
      </div>
      <input
        v-model="phoneNumber"
        type="tel"
        :placeholder="currentCountry.placeholder"
        :required="config.validation.required"
        :disabled="false"
        :class="['phone-input', { 'has-error': validationError, 'is-valid': isValid && phoneNumber }]"
        @input="formatPhoneNumber"
        @blur="validatePhone"
      />
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="isValid && phoneNumber" class="success-message">
      <i class="pi pi-check"></i>
      Valid phone number
    </div>
    
    <small v-if="config.helpText.show && config.helpText.value" class="help-text">
      {{ config.helpText.value }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
    type: 'phone',
    name: 'Phone Number',
    category: 'fields' as const,
    icon: 'pi pi-phone',
    description: 'Phone number input with country selection'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Phone Number',
    defaultValue: 'Phone Number',
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
    defaultValue: 'Enter your phone number with country code',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    defaultCountry: 'US',
    allowedCountries: [] // Empty means all countries allowed
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
      key: 'props.defaultCountry',
      label: 'Default Country',
      type: 'select',
      required: false,
      options: [
        { value: 'US', label: '🇺🇸 United States' },
        { value: 'CA', label: '🇨🇦 Canada' },
        { value: 'GB', label: '🇬🇧 United Kingdom' },
        { value: 'AU', label: '🇦🇺 Australia' },
        { value: 'DE', label: '🇩🇪 Germany' },
        { value: 'FR', label: '🇫🇷 France' },
        { value: 'JP', label: '🇯🇵 Japan' },
        { value: 'IN', label: '🇮🇳 India' },
        { value: 'TH', label: '🇹🇭 Thailand' }
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

const selectedCountry = computed(() => config.value.props.defaultCountry || 'US')
const phoneNumber = ref('')
const validationError = ref('')

// Common countries with their dial codes and formatting
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', placeholder: '(555) 123-4567', pattern: /^\(\d{3}\) \d{3}-\d{4}$/ },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', placeholder: '(555) 123-4567', pattern: /^\(\d{3}\) \d{3}-\d{4}$/ },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', placeholder: '020 1234 5678', pattern: /^\d{3,4} \d{4} \d{4}$/ },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', placeholder: '04 1234 5678', pattern: /^\d{2} \d{4} \d{4}$/ },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', placeholder: '030 12345678', pattern: /^\d{3,4} \d{6,8}$/ },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', placeholder: '01 23 45 67 89', pattern: /^\d{2} \d{2} \d{2} \d{2} \d{2}$/ },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', placeholder: '090-1234-5678', pattern: /^\d{3}-\d{4}-\d{4}$/ },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', placeholder: '98765 43210', pattern: /^\d{5} \d{5}$/ },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', placeholder: '081 079 7059', pattern: /^\d{3} \d{3} \d{4}$/ }
]

const currentCountry = computed(() => {
  return countries.find(c => c.code === selectedCountry.value) || countries[0]
})

const isValid = computed(() => {
  if (!phoneNumber.value) return false
  return currentCountry.value.pattern.test(phoneNumber.value)
})

const formatPhoneNumber = () => {
  let value = phoneNumber.value.replace(/\D/g, '') // Remove all non-digits
  
  // Format based on selected country
  switch (selectedCountry.value) {
    case 'US':
    case 'CA':
      if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
      } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`
      }
      break
    case 'GB':
      if (value.length >= 7) {
        value = `${value.slice(0, 3)} ${value.slice(3, 7)} ${value.slice(7, 11)}`
      } else if (value.length >= 3) {
        value = `${value.slice(0, 3)} ${value.slice(3)}`
      }
      break
    case 'AU':
      if (value.length >= 6) {
        value = `${value.slice(0, 2)} ${value.slice(2, 6)} ${value.slice(6, 10)}`
      } else if (value.length >= 2) {
        value = `${value.slice(0, 2)} ${value.slice(2)}`
      }
      break
    case 'JP':
      if (value.length >= 7) {
        value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`
      } else if (value.length >= 3) {
        value = `${value.slice(0, 3)}-${value.slice(3)}`
      }
      break
    case 'IN':
      if (value.length >= 5) {
        value = `${value.slice(0, 5)} ${value.slice(5, 10)}`
      }
      break
    case 'TH':
      if (value.length >= 6) {
        value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`
      } else if (value.length >= 3) {
        value = `${value.slice(0, 3)} ${value.slice(3)}`
      }
      break
    default:
      // Default formatting for other countries
      if (value.length >= 6) {
        value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
      } else if (value.length >= 3) {
        value = `${value.slice(0, 3)} ${value.slice(3)}`
      }
  }
  
  phoneNumber.value = value
  validationError.value = ''
}

const validatePhone = () => {
  const val = config.value.validation
  
  if (!phoneNumber.value && !val.required) {
    validationError.value = ''
    return
  }
  
  if (!phoneNumber.value && val.required) {
    validationError.value = val.customMessage || 'Phone number is required'
    return
  }
  
  if (!currentCountry.value.pattern.test(phoneNumber.value)) {
    validationError.value = val.customMessage || `Please enter a valid ${currentCountry.value.name} phone number`
    return
  }
  
  validationError.value = ''
}

// Clear phone number when country changes
watch(selectedCountry, () => {
  phoneNumber.value = ''
  validationError.value = ''
})

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
    type: 'phone',
    name: 'Phone Number',
    category: 'fields' as const,
    icon: 'pi pi-phone',
    description: 'Phone number input with country selection'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Phone Number',
    defaultValue: 'Phone Number',
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
    defaultValue: 'Enter your phone number with country code',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    defaultCountry: 'US',
    allowedCountries: [] // Empty means all countries allowed
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
      key: 'props.defaultCountry',
      label: 'Default Country',
      type: 'select',
      required: false,
      options: [
        { value: 'US', label: '🇺🇸 United States' },
        { value: 'CA', label: '🇨🇦 Canada' },
        { value: 'GB', label: '🇬🇧 United Kingdom' },
        { value: 'AU', label: '🇦🇺 Australia' },
        { value: 'DE', label: '🇩🇪 Germany' },
        { value: 'FR', label: '🇫🇷 France' },
        { value: 'JP', label: '🇯🇵 Japan' },
        { value: 'IN', label: '🇮🇳 India' },
        { value: 'TH', label: '🇹🇭 Thailand' }
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
.phone-input-element {
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

.phone-input-wrapper {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.phone-input-wrapper:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.country-selector {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.country-select {
  padding: 0.75rem 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 80px;
}

.country-select:focus {
  outline: none;
}

.phone-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.phone-input:focus {
  outline: none;
}

.phone-input.has-error {
  background: rgba(239, 68, 68, 0.05);
}

.phone-input.is-valid {
  background: rgba(16, 185, 129, 0.05);
}

.phone-input-wrapper:has(.phone-input.has-error) {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.phone-input-wrapper:has(.phone-input.is-valid) {
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