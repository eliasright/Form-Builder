<template>
  <div class="render-view">
    <!-- Subtle import button in corner -->
    <div class="import-container">
      <label for="import-form" class="import-icon-btn" title="Import Form">
        <i class="pi pi-upload"></i>
      </label>
      <input
        id="import-form"
        type="file"
        accept=".json"
        @change="handleImportForm"
        style="display: none;"
      />
    </div>

    <FormViewer
      :schema="formSchema"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
    />

    <FormResultsModal
      :is-open="showModal"
      :data="submittedData"
      :form-name="formSchema?.meta?.name"
      @close="closeModal"
      @download="downloadResponses"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FormViewer from '@/components/FormViewer.vue'
import FormResultsModal from '@/components/FormResultsModal.vue'
import type { FormSchema } from '@/types/schema'

const route = useRoute()
const formSchema = ref<FormSchema | null>(null)
const showModal = ref(false)
const submittedData = ref<Record<string, any>>({})

// Load form schema on mount
onMounted(() => {
  loadFormSchema()
})

const loadFormSchema = () => {
  try {
    // Try to get form from route params/query
    if (route.query.data) {
      // From URL query parameter (for preview)
      const decodedData = decodeURIComponent(route.query.data as string)
      formSchema.value = JSON.parse(decodedData)
      return
    }
    
    // Always default to Leave Request Form
    formSchema.value = {
      "id": "new-form",
      "meta": {
        "name": "Leave Request Form",
        "description": "Form created with builder",
        "version": "1.0.0"
      },
      "layout": {
        "type": "grid",
        "maxColumns": 3,
        "gap": "md"
      },
      "fields": [
        {
          "id": "id_ml96doy9f",
          "type": "row",
          "order": 1,
          "columns": [
            {
              "id": "id_v2d700wkn",
              "name": "field_id_v2d700wkn",
              "type": "text",
              "label": {
                "show": true,
                "value": "Name",
                "defaultValue": "Text Input",
                "editable": true
              },
              "placeholder": {
                "show": true,
                "value": "Full Name",
                "defaultValue": "Enter text...",
                "editable": true
              },
              "validation": {
                "required": true,
                "minLength": 0,
                "maxLength": 280,
                "pattern": "",
                "customMessage": ""
              },
              "props": {
                "inputType": "text",
                "autocomplete": "off"
              },
              "width": 1
            }
          ]
        },
        {
          "id": "id_iig7xiwqh",
          "type": "row",
          "order": 2,
          "columns": [
            {
              "id": "id_jxvoedrre",
              "name": "field_id_jxvoedrre",
              "type": "radio",
              "label": {
                "show": true,
                "value": "How long I'll be",
                "defaultValue": "Choose Option",
                "editable": true
              },
              "placeholder": {
                "show": false,
                "value": "",
                "defaultValue": "",
                "editable": false
              },
              "description": {
                "show": true,
                "value": "If taking full day leave, please fill in the days below",
                "defaultValue": "",
                "editable": true
              },
              "validation": {
                "required": true,
                "customMessage": ""
              },
              "props": {
                "options": [
                  {
                    "label": "Half Day",
                    "value": "Half Day"
                  },
                  {
                    "label": "Full Day",
                    "value": "Full Day"
                  }
                ],
                "layout": "vertical"
              },
              "width": 1
            }
          ]
        },
        {
          "id": "id_qpw1isjm6",
          "type": "row",
          "order": 3,
          "columns": [
            {
              "id": "id_276sb6oo3",
              "name": "field_id_276sb6oo3",
              "type": "number",
              "label": {
                "show": true,
                "value": "Number of Days",
                "defaultValue": "Number Input",
                "editable": true
              },
              "placeholder": {
                "show": true,
                "value": "Enter number...",
                "defaultValue": "Enter number...",
                "editable": true
              },
              "description": {
                "show": false,
                "value": "",
                "defaultValue": "",
                "editable": true
              },
              "validation": {
                "required": false,
                "min": 1,
                "max": 1000000,
                "step": 1,
                "allowDecimals": false,
                "decimalPlaces": 0,
                "customMessage": ""
              },
              "props": {
                "inputMode": "numeric",
                "autocomplete": "off"
              },
              "width": 1,
              "conditionalDisplay": {
                "field": "field_id_jxvoedrre",
                "condition": "equals",
                "value": "Full Day"
              }
            }
          ]
        }
      ]
    }
  } catch (error) {
    console.error('Failed to load form schema:', error)
    formSchema.value = null
  }
}

const handleImportForm = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedSchema = JSON.parse(content)
      formSchema.value = importedSchema
      console.log('Form imported successfully:', importedSchema)
    } catch (error) {
      console.error('Failed to import form:', error)
      alert('Failed to import form. Please check the file format.')
    }
  }
  reader.readAsText(file)
  
  // Reset the input
  target.value = ''
}

const saveForm = () => {
  if (!formSchema.value) {
    alert('No form to save')
    return
  }
  
  const dataStr = JSON.stringify(formSchema.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${formSchema.value.meta?.name || 'form'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const downloadResponses = () => {
  const data = submittedData.value
  const responses = Object.entries(data).map(([key, value]) => {
    // Find the field label for better formatting
    let label = key
    if (formSchema.value?.fields) {
      for (const row of formSchema.value.fields) {
        for (const column of row.columns) {
          if (column.id === key || column.name === key) {
            label = column.label?.value || key
            break
          }
        }
      }
    }
    return `${label}: ${value}`
  }).join('\n')

  const dataStr = responses
  const dataBlob = new Blob([dataStr], { type: 'text/plain' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${formSchema.value?.meta?.name || 'form'}_responses.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleFormSubmit = (data: Record<string, any>) => {
  console.log('Form submitted with data:', data)

  // Helper function to check if field should be shown (same logic as FormViewer)
  const shouldShowField = (column: any, formData: Record<string, any>): boolean => {
    if (!column.conditionalDisplay) return true

    const { field, condition, value } = column.conditionalDisplay
    const fieldValue = formData[field]

    switch (condition) {
      case 'equals':
        return fieldValue === value
      case 'not_equals':
        return fieldValue !== value
      case 'contains':
        return fieldValue && fieldValue.toString().includes(value)
      case 'not_empty':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      case 'empty':
        return fieldValue === undefined || fieldValue === null || fieldValue === ''
      default:
        return true
    }
  }

  // Format data with labels for modal display, filtering out hidden fields
  const formattedData: Record<string, any> = {}
  Object.entries(data).forEach(([key, value]) => {
    if (formSchema.value?.fields) {
      for (const row of formSchema.value.fields) {
        for (const column of row.columns) {
          if (column.id === key || column.name === key) {
            // Only include if field should be visible
            if (shouldShowField(column, data)) {
              let label = column.label?.value || key
              // Add red asterisk for required fields
              if (column.validation?.required) {
                label = label + ' *'
              }
              formattedData[label] = value
            }
            break
          }
        }
      }
    }
  })

  // Store data and show modal
  submittedData.value = formattedData
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleFormReset = () => {
  console.log('Form reset')
}
</script>

<style scoped>
.render-view {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

/* Subtle import button in top-right corner */
.import-container {
  position: fixed;
  top: 80px;
  right: 1.5rem;
  z-index: 100;
}

.import-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.import-icon-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

@media (max-width: 768px) {
  .import-container {
    top: 70px;
    right: 1rem;
  }

  .import-icon-btn {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
}
</style>