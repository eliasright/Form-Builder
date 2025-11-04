import { getNestedValue } from '@/utils/helpers'

/**
 * Text Element Configuration
 * Centralized configuration for Text Input element
 */
export const textElementConfig = {
  // Element metadata
  meta: {
    type: 'text',
    name: 'Text Input',
    category: 'fields' as const,
    icon: 'pi pi-align-left',
    description: 'Single line text input field',
  },

  // Label configuration
  label: {
    show: true,
    value: 'Text Input',
    defaultValue: 'Text Input',
    editable: true,
  },

  // Placeholder configuration
  placeholder: {
    show: true,
    value: 'Enter text...',
    defaultValue: 'Enter text...',
    editable: true,
  },

  // Description configuration
  description: {
    show: false,
    value: '',
    defaultValue: '',
    editable: true,
  },

  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'Enter any text value',
    editable: true,
  },

  // Validation rules
  validation: {
    required: false,
    minLength: 0,
    maxLength: 255,
    pattern: '',
    customMessage: '',
  },

  // Element-specific properties
  props: {
    inputType: 'text',
    autocomplete: 'off',
  },

  // Settings panel configuration
  settings: [
    {
      key: 'label.value',
      label: 'Label',
      type: 'text',
      required: true,
    },
    {
      key: 'placeholder.value',
      label: 'Placeholder',
      type: 'text',
      required: false,
    },
    {
      key: 'description.value',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Additional information for users',
    },
    {
      key: 'validation.required',
      label: 'Required',
      type: 'checkbox',
      required: false,
    },
    {
      key: 'validation.minLength',
      label: 'Minimum Length',
      type: 'number',
      required: false,
      min: 0,
      max: 1000,
    },
    {
      key: 'validation.maxLength',
      label: 'Maximum Length',
      type: 'number',
      required: false,
      min: 1,
      max: 10000,
    },
    {
      key: 'validation.pattern',
      label: 'Pattern (Regex)',
      type: 'text',
      required: false,
      placeholder: '^[a-zA-Z0-9]+$',
    },
  ],
} as const

/**
 * Generate settings with current values
 * @param currentConfig - Current element configuration
 * @returns Settings array with populated values
 */
export function generateTextElementSettings(currentConfig: typeof textElementConfig) {
  return textElementConfig.settings.map((setting) => ({
    ...setting,
    value: getNestedValue(currentConfig, setting.key),
  }))
}
