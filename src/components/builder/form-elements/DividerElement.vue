<template>
  <div class="divider-element">
    <div v-if="config.props.showLabel && config.props.label" class="divider-with-label">
      <div :class="['divider-line', `style-${config.props.style}`]" :style="{ borderColor: config.props.color }"></div>
      <span class="divider-label">{{ config.props.label }}</span>
      <div :class="['divider-line', `style-${config.props.style}`]" :style="{ borderColor: config.props.color }"></div>
    </div>
    <div v-else :class="['divider-simple', `style-${config.props.style}`]" :style="{ borderColor: config.props.color, borderWidth: `${config.props.thickness}px` }"></div>
    
    <small v-if="config.helpText.show && config.helpText.value" class="help-text">
      {{ config.helpText.value }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
}

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'divider',
    name: 'Divider',
    category: 'static' as const,
    icon: 'pi pi-minus',
    description: 'Horizontal divider line'
  },
  
  // Label configuration (not applicable for static elements)
  label: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
  },
  
  // Placeholder configuration (not applicable for static elements)
  placeholder: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'This is a divider element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    style: 'solid', // solid, dashed, dotted
    color: '#e5e7eb',
    thickness: 1,
    showLabel: false,
    label: 'OR',
    spacing: 'normal' // tight, normal, loose
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.style',
      label: 'Line Style',
      type: 'select',
      required: false,
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ]
    },
    {
      key: 'props.color',
      label: 'Line Color',
      type: 'color',
      required: false
    },
    {
      key: 'props.thickness',
      label: 'Line Thickness',
      type: 'number',
      required: false,
      min: 1,
      max: 10,
      defaultValue: 1
    },
    {
      key: 'props.showLabel',
      label: 'Show Label',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.label',
      label: 'Label Text',
      type: 'text',
      required: false,
      condition: 'props.showLabel'
    },
    {
      key: 'props.spacing',
      label: 'Spacing',
      type: 'select',
      required: false,
      options: [
        { value: 'tight', label: 'Tight' },
        { value: 'normal', label: 'Normal' },
        { value: 'loose', label: 'Loose' }
      ]
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
    type: 'divider',
    name: 'Divider',
    category: 'static' as const,
    icon: 'pi pi-minus',
    description: 'Horizontal divider line'
  },
  
  // Label configuration (not applicable for static elements)
  label: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
  },
  
  // Placeholder configuration (not applicable for static elements)
  placeholder: {
    show: false,
    value: '',
    defaultValue: '',
    editable: false
  },
  
  // Help text configuration
  helpText: {
    show: false,
    value: '',
    defaultValue: 'This is a divider element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    style: 'solid', // solid, dashed, dotted
    color: '#e5e7eb',
    thickness: 1,
    showLabel: false,
    label: 'OR',
    spacing: 'normal' // tight, normal, loose
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.style',
      label: 'Line Style',
      type: 'select',
      required: false,
      options: [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' }
      ]
    },
    {
      key: 'props.color',
      label: 'Line Color',
      type: 'color',
      required: false
    },
    {
      key: 'props.thickness',
      label: 'Line Thickness',
      type: 'number',
      required: false,
      min: 1,
      max: 10,
      defaultValue: 1
    },
    {
      key: 'props.showLabel',
      label: 'Show Label',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.label',
      label: 'Label Text',
      type: 'text',
      required: false,
      condition: 'props.showLabel'
    },
    {
      key: 'props.spacing',
      label: 'Spacing',
      type: 'select',
      required: false,
      options: [
        { value: 'tight', label: 'Tight' },
        { value: 'normal', label: 'Normal' },
        { value: 'loose', label: 'Loose' }
      ]
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
.divider-element {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin: 1rem 0;
}

.divider-with-label {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 0;
  border-top: 1px solid;
}

.divider-simple {
  width: 100%;
  height: 0;
  border-top: 1px solid;
}

.style-solid {
  border-style: solid;
}

.style-dashed {
  border-style: dashed;
}

.style-dotted {
  border-style: dotted;
}

.divider-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  white-space: nowrap;
  padding: 0 0.5rem;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>