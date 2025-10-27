<template>
  <div class="heading-element">
    <component 
      :is="headingTag"
      :class="['heading-text', `heading-${config.props.level}`, `align-${config.props.alignment}`]"
      :style="{ color: config.props.color }"
    >
      {{ config.props.text }}
    </component>
    
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
  column?: any
}

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'heading',
    name: 'Heading',
    category: 'static' as const,
    icon: 'pi pi-text-color',
    description: 'Heading text element'
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
    defaultValue: 'This is a heading element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    text: 'Heading Text',
    level: 2, // H1-H6
    alignment: 'left', // left, center, right
    color: 'inherit',
    fontWeight: 'bold'
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.text',
      label: 'Heading Text',
      type: 'text',
      required: true
    },
    {
      key: 'props.level',
      label: 'Heading Level',
      type: 'select',
      required: true,
      options: [
        { value: 1, label: 'H1 - Main Title' },
        { value: 2, label: 'H2 - Section Title' },
        { value: 3, label: 'H3 - Subsection' },
        { value: 4, label: 'H4 - Minor Heading' },
        { value: 5, label: 'H5 - Small Heading' },
        { value: 6, label: 'H6 - Smallest Heading' }
      ]
    },
    {
      key: 'props.alignment',
      label: 'Text Alignment',
      type: 'select',
      required: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ]
    },
    {
      key: 'props.color',
      label: 'Text Color',
      type: 'color',
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

const headingTag = computed(() => `h${config.value.props.level}`)

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
    type: 'heading',
    name: 'Heading',
    category: 'static' as const,
    icon: 'pi pi-text-color',
    description: 'Heading text element'
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
    defaultValue: 'This is a heading element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    text: 'Heading Text',
    level: 2, // H1-H6
    alignment: 'left', // left, center, right
    color: 'inherit',
    fontWeight: 'bold'
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.text',
      label: 'Heading Text',
      type: 'text',
      required: true
    },
    {
      key: 'props.level',
      label: 'Heading Level',
      type: 'select',
      required: true,
      options: [
        { value: 1, label: 'H1 - Main Title' },
        { value: 2, label: 'H2 - Section Title' },
        { value: 3, label: 'H3 - Subsection' },
        { value: 4, label: 'H4 - Minor Heading' },
        { value: 5, label: 'H5 - Small Heading' },
        { value: 6, label: 'H6 - Smallest Heading' }
      ]
    },
    {
      key: 'props.alignment',
      label: 'Text Alignment',
      type: 'select',
      required: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ]
    },
    {
      key: 'props.color',
      label: 'Text Color',
      type: 'color',
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
.heading-element {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.heading-text {
  margin: 0;
  font-weight: bold;
  line-height: 1.2;
}

.heading-1 {
  font-size: 2rem;
}

.heading-2 {
  font-size: 1.5rem;
}

.heading-3 {
  font-size: 1.25rem;
}

.heading-4 {
  font-size: 1.125rem;
}

.heading-5 {
  font-size: 1rem;
}

.heading-6 {
  font-size: 0.875rem;
}

.align-left {
  text-align: left;
}

.align-center {
  text-align: center;
}

.align-right {
  text-align: right;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>