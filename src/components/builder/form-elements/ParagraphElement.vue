<template>
  <div class="paragraph-element">
    <p 
      :class="['paragraph-text', `align-${config.props.alignment}`, `size-${config.props.size}`]"
      :style="{ color: config.props.color }"
    >
      {{ config.props.text }}
    </p>
    
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
    type: 'paragraph',
    name: 'Paragraph',
    category: 'static' as const,
    icon: 'pi pi-align-left',
    description: 'Paragraph text element'
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
    defaultValue: 'This is a paragraph element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    text: 'Your paragraph text here.',
    alignment: 'left', // left, center, right, justify
    size: 'normal', // small, normal, large
    color: 'inherit'
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.text',
      label: 'Paragraph Text',
      type: 'textarea',
      required: true,
      rows: 4
    },
    {
      key: 'props.alignment',
      label: 'Text Alignment',
      type: 'select',
      required: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justify' }
      ]
    },
    {
      key: 'props.size',
      label: 'Text Size',
      type: 'select',
      required: false,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'normal', label: 'Normal' },
        { value: 'large', label: 'Large' }
      ]
    },
    {
      key: 'props.color',
      label: 'Text Color',
      type: 'color',
      required: false
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
    type: 'paragraph',
    name: 'Paragraph',
    category: 'static' as const,
    icon: 'pi pi-align-left',
    description: 'Paragraph text element'
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
    defaultValue: 'This is a paragraph element',
    editable: true
  },
  
  // Validation rules (not applicable for static elements)
  validation: {},
  
  // Element-specific properties
  props: {
    text: 'Your paragraph text here.',
    alignment: 'left', // left, center, right, justify
    size: 'normal', // small, normal, large
    color: 'inherit'
  },
  
  // Settings panel configuration
  settings: [
    {
      key: 'props.text',
      label: 'Paragraph Text',
      type: 'textarea',
      required: true,
      rows: 4
    },
    {
      key: 'props.alignment',
      label: 'Text Alignment',
      type: 'select',
      required: false,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justify' }
      ]
    },
    {
      key: 'props.size',
      label: 'Text Size',
      type: 'select',
      required: false,
      options: [
        { value: 'small', label: 'Small' },
        { value: 'normal', label: 'Normal' },
        { value: 'large', label: 'Large' }
      ]
    },
    {
      key: 'props.color',
      label: 'Text Color',
      type: 'color',
      required: false
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
.paragraph-element {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.paragraph-text {
  margin: 0;
  line-height: 1.6;
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

.align-justify {
  text-align: justify;
}

.size-small {
  font-size: 0.875rem;
}

.size-normal {
  font-size: 1rem;
}

.size-large {
  font-size: 1.125rem;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>