<template>
  <div class="render-view">
    <!-- Form Controls -->
    <div class="form-controls">
      <div class="control-group">
        <label for="import-form" class="import-label">
          <i class="pi pi-upload"></i>
          Import Form
        </label>
        <input
          id="import-form"
          type="file"
          accept=".json"
          @change="handleImportForm"
          style="display: none;"
        />
      </div>
      
      <div class="control-group">
        <button @click="saveForm" class="save-btn">
          <i class="pi pi-save"></i>
          Save Form
        </button>
      </div>
    </div>

    <FormViewer 
      :schema="formSchema"
      @submit="handleFormSubmit"
      @reset="handleFormReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FormViewer from '@/components/FormViewer.vue'
import type { FormSchema } from '@/types/schema'

const route = useRoute()
const formSchema = ref<FormSchema | null>(null)

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
                "value": "Choose Option",
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

const downloadResponses = (data: Record<string, any>) => {
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
  
  // Download the user's responses
  downloadResponses(data)
  
  // Show success message
  alert(`Form submitted successfully!\n\nResponses have been downloaded.`)
}

const handleFormReset = () => {
  console.log('Form reset')
}
</script>

<style scoped>
.render-view {
  width: 100%;
  min-height: 100vh;
}

.form-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.control-group {
  display: flex;
  align-items: center;
}

.import-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.import-label:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .form-controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .import-label,
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>