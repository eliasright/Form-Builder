<template>
  <div class="image-upload-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>
    
    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>
    
    <div class="upload-wrapper">
      <!-- Upload Area -->
      <div 
        :class="['upload-area', { 
          'drag-over': isDragOver, 
          'has-error': validationError,
          'has-image': uploadedImage 
        }]"
        @click="triggerFileInput"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <!-- Image Preview -->
        <div v-if="uploadedImage" class="image-preview">
          <img :src="uploadedImage.dataUrl" :alt="uploadedImage.name" />
          <div class="image-overlay">
            <button @click.stop="removeImage" class="remove-btn">
              <i class="pi pi-trash"></i>
            </button>
            <button @click.stop="triggerFileInput" class="replace-btn">
              <i class="pi pi-refresh"></i>
            </button>
          </div>
          <div class="image-info">
            <span class="image-name">{{ uploadedImage.name }}</span>
            <span class="image-size">{{ formatFileSize(uploadedImage.size) }}</span>
          </div>
        </div>
        
        <!-- Upload Prompt -->
        <div v-else class="upload-prompt">
          <i class="pi pi-cloud-upload upload-icon"></i>
          <div class="upload-text">
            <span class="primary-text">Click to upload or drag and drop</span>
            <span class="secondary-text">
              {{ allowedTypesText }} up to {{ formatFileSize(config.validation.maxSize) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedMimeTypes"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>
    
    <div v-if="validationError" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ validationError }}
    </div>
    
    <div v-else-if="uploadedImage" class="success-message">
      <i class="pi pi-check"></i>
      Image uploaded successfully
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  overrides?: Partial<typeof defaultConfig>
  isPreview?: boolean
  column?: any
}

interface UploadedImage {
  name: string
  size: number
  type: string
  dataUrl: string
  lastModified: number
}

const props = defineProps<Props>()

// COMPLETE SELF-CONTAINED CONFIGURATION
const defaultConfig = {
  // Element metadata
  meta: {
    type: 'image',
    name: 'Image Upload',
    category: 'fields' as const,
    icon: 'pi pi-image',
    description: 'Image upload with file type and size restrictions'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Image Upload',
    defaultValue: 'Image Upload',
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
    defaultValue: 'Upload an image file',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    maxSize: 5242880, // 5MB in bytes
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    multiple: false,
    preview: true,
    compress: true,
    quality: 0.8
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
      key: 'validation.maxSize',
      label: 'Max File Size (MB)',
      type: 'number',
      required: false,
      min: 0.1,
      max: 50,
      step: 0.1
    },
    {
      key: 'validation.allowedTypes',
      label: 'Allowed File Types',
      type: 'select',
      required: false,
      multiple: true,
      options: [
        { value: 'jpg', label: 'JPG' },
        { value: 'jpeg', label: 'JPEG' },
        { value: 'png', label: 'PNG' },
        { value: 'gif', label: 'GIF' },
        { value: 'webp', label: 'WebP' },
        { value: 'svg', label: 'SVG' }
      ]
    },
    {
      key: 'props.compress',
      label: 'Compress Images',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.quality',
      label: 'Compression Quality',
      type: 'number',
      required: false,
      min: 0.1,
      max: 1,
      step: 0.1
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
const fileInput = ref<HTMLInputElement>()
const uploadedImage = ref<UploadedImage | null>(null)
const validationError = ref('')
const isDragOver = ref(false)

// Computed properties
const acceptedMimeTypes = computed(() => {
  return config.value.validation.allowedTypes
    .map((type: string) => {
      switch (type) {
        case 'jpg':
        case 'jpeg': return 'image/jpeg'
        case 'png': return 'image/png'
        case 'gif': return 'image/gif'
        case 'webp': return 'image/webp'
        case 'svg': return 'image/svg+xml'
        default: return `image/${type}`
      }
    })
    .join(',')
})

const allowedTypesText = computed(() => {
  const types = config.value.validation.allowedTypes
  if (types.length <= 3) {
    return types.map((t: string) => t.toUpperCase()).join(', ')
  }
  return `${types.slice(0, 2).map((t: string) => t.toUpperCase()).join(', ')} and ${types.length - 2} more`
})

// File handling methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file: File) => {
  validationError.value = ''
  
  // Validate file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension || !config.value.validation.allowedTypes.includes(fileExtension)) {
    validationError.value = `File type not allowed. Please upload: ${config.value.validation.allowedTypes.join(', ').toUpperCase()}`
    return
  }
  
  // Validate file size
  if (file.size > config.value.validation.maxSize) {
    validationError.value = `File too large. Maximum size: ${formatFileSize(config.value.validation.maxSize)}`
    return
  }
  
  try {
    // Read file as data URL
    const dataUrl = await readFileAsDataURL(file)
    
    // Store image data
    uploadedImage.value = {
      name: file.name,
      size: file.size,
      type: file.type,
      dataUrl,
      lastModified: file.lastModified
    }
    
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    validationError.value = 'Failed to process image file'
  }
}

const removeImage = () => {
  uploadedImage.value = null
  validationError.value = ''
}

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
    type: 'image',
    name: 'Image Upload',
    category: 'fields' as const,
    icon: 'pi pi-image',
    description: 'Image upload with file type and size restrictions'
  },
  
  // Label configuration
  label: {
    show: true,
    value: 'Image Upload',
    defaultValue: 'Image Upload',
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
    defaultValue: 'Upload an image file',
    editable: true
  },
  
  // Validation rules
  validation: {
    required: false,
    maxSize: 5242880, // 5MB in bytes
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    customMessage: ''
  },
  
  // Element-specific properties
  props: {
    multiple: false,
    preview: true,
    compress: true,
    quality: 0.8
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
      key: 'validation.maxSize',
      label: 'Max File Size (MB)',
      type: 'number',
      required: false,
      min: 0.1,
      max: 50,
      step: 0.1
    },
    {
      key: 'validation.allowedTypes',
      label: 'Allowed File Types',
      type: 'select',
      required: false,
      multiple: true,
      options: [
        { value: 'jpg', label: 'JPG' },
        { value: 'jpeg', label: 'JPEG' },
        { value: 'png', label: 'PNG' },
        { value: 'gif', label: 'GIF' },
        { value: 'webp', label: 'WebP' },
        { value: 'svg', label: 'SVG' }
      ]
    },
    {
      key: 'props.compress',
      label: 'Compress Images',
      type: 'checkbox',
      required: false
    },
    {
      key: 'props.quality',
      label: 'Compression Quality',
      type: 'number',
      required: false,
      min: 0.1,
      max: 1,
      step: 0.1
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
.image-upload-element {
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

.upload-wrapper {
  width: 100%;
}

.upload-area {
  position: relative;
  min-height: 120px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.upload-area.drag-over {
  border-color: var(--accent-color);
  background: var(--accent-light);
  transform: scale(1.02);
}

.upload-area.has-error {
  border-color: var(--text-danger);
  background: rgba(239, 68, 68, 0.1);
}

.upload-area.has-image {
  border-style: solid;
  padding: 0;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  height: 100%;
}

.upload-icon {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1rem;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.primary-text {
  font-weight: 500;
  color: var(--text-primary);
}

.secondary-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.image-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.remove-btn,
.replace-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.replace-btn {
  background: rgba(249, 115, 22, 0.9);
  color: white;
}

.replace-btn:hover {
  background: rgba(249, 115, 22, 1);
  transform: scale(1.1);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 1rem 0.75rem 0.75rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.image-name {
  font-weight: 500;
  font-size: 0.875rem;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  font-size: 0.75rem;
  opacity: 0.9;
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
</style>