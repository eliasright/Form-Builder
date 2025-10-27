<template>
  <div class="form-builder">
    <!-- 3-Column Layout -->
    <div class="builder-layout">
      <!-- Left: Elements Palette -->
      <div class="elements-panel">
        <div class="panel-header">
          <h3>Elements</h3>
          <div class="element-toggle">
            <button 
              :class="{ active: activeTab === 'fields' }"
              @click="activeTab = 'fields'"
              class="toggle-btn"
            >
              Fields
            </button>
            <button 
              :class="{ active: activeTab === 'static' }"
              @click="activeTab = 'static'"
              class="toggle-btn"
            >
              Static
            </button>
          </div>
        </div>
        
        <div class="element-list">
          <!-- Fields Tab -->
          <div v-show="activeTab === 'fields'" class="element-category">
            <div 
              v-for="element in fieldElements" 
              :key="element.type" 
              class="element-item"
              draggable="true"
              :data-type="element.type"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
            >
              <i :class="element.icon"></i>
              <span>{{ element.label }}</span>
            </div>
          </div>
          
          <!-- Static Tab -->
          <div v-show="activeTab === 'static'" class="element-category">
            <div 
              v-for="element in staticElements" 
              :key="element.type" 
              class="element-item"
              draggable="true"
              :data-type="element.type"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
            >
              <i :class="element.icon"></i>
              <span>{{ element.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center: Form Editor -->
      <div class="form-editor">
        <div class="editor-header">
          <div class="form-title-section">
            <input 
              v-model="schema.meta.name" 
              type="text" 
              class="form-title-input"
              placeholder="Form Name"
            />
          </div>
          <div class="editor-actions">
            <button @click="previewForm" class="btn btn-preview">
              <i class="pi pi-eye"></i>
              Preview
            </button>
            <div class="dropdown-wrapper" ref="dropdownRef">
              <button @click="showDropdown = !showDropdown" class="btn btn-menu">
                <i class="pi pi-ellipsis-v"></i>
              </button>
              <div v-if="showDropdown" class="dropdown-menu">
                <button @click="showRowControls = !showRowControls; showDropdown = false" class="dropdown-item">
                  <i :class="showRowControls ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                  {{ showRowControls ? 'Hide' : 'Show' }} Row Arrows
                </button>
                <div class="dropdown-divider"></div>
                <button @click="previewForm" class="dropdown-item">
                  <i class="pi pi-eye"></i>
                  Preview
                </button>
                <button @click="saveLocal" class="dropdown-item">
                  <i class="pi pi-save"></i>
                  Save Local
                </button>
                <button @click="loadLocal" class="dropdown-item">
                  <i class="pi pi-folder-open"></i>
                  Load Local
                </button>
                <button @click="importForm" class="dropdown-item">
                  <i class="pi pi-upload"></i>
                  Import
                </button>
                <button @click="exportForm" class="dropdown-item">
                  <i class="pi pi-download"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="canvas-area" @dragover="handleCanvasDragOver" @drop="handleCanvasDrop">
          <div class="canvas-with-controls">
            <div 
              class="form-canvas"
              :class="{ 'drag-active': isDragging || isDraggingElement }"
              @dragover="handleDragOver"
              @drop="handleDrop"
            >
            <div v-if="schema.fields.length === 0" class="empty-canvas">
              <div class="empty-content">
                <i class="pi pi-plus-circle"></i>
                <h4>Start Building</h4>
                <p>Drag elements from the left to build your form</p>
              </div>
            </div>
            
            <div v-else class="form-elements">
              <!-- Drop zone at the top -->
              <div 
                v-show="isDragging || isDraggingElement"
                class="row-drop-zone"
                @dragover="handleRowDropZoneDragOver"
                @drop="(e) => handleRowDropZoneDrop(e, 0)"
              ></div>
              
              <template v-for="(row, rowIndex) in schema.fields" :key="row.id">
                <div class="form-row-wrapper">
                  <div class="form-row">
                    <div 
                      class="row-content"
                      :class="{ 'drop-zone-active': isDragging || isDraggingElement }"
                      @dragover="handleRowDragOver"
                      @drop="(e) => handleRowDrop(e, row)"
                    >
                    <template v-for="(column, columnIndex) in row.columns" :key="column.id">
                      <div 
                        class="form-element"
                        :class="{ 'active': selectedElement?.id === column.id }"
                        :style="{ flex: column.width || 1 }"
                        draggable="true"
                        @dragstart="(e) => handleElementDragStart(e, column)"
                        @dragend="handleElementDragEnd"
                        @click="selectElement(column)"
                      >
                        <div class="element-controls">
                          <button 
                            class="drag-handle"
                            @click.stop
                          >
                            <i class="pi pi-bars"></i>
                          </button>
                          <button @click.stop="deleteElement(column.id)" class="delete-btn">
                            <i class="pi pi-trash"></i>
                          </button>
                        </div>
                        <component 
                          :is="getElementComponent(column.type)"
                          :column="column"
                          :is-preview="true"
                        />
                      </div>
                      
                      <!-- Resize handle between elements -->
                      <div 
                        v-if="columnIndex < row.columns.length - 1"
                        class="resize-handle"
                        @mousedown="(e) => startResize(e, row, columnIndex)"
                      >
                        <div class="resize-bar"></div>
                      </div>
                    </template>
                    </div>
                    
                    <!-- Row controls - positioned on right edge -->
                    <div v-if="showRowControls" class="row-controls-right">
                      <button @click="moveRowUp(rowIndex)" class="row-move-btn" :disabled="rowIndex === 0">
                        <i class="pi pi-chevron-up"></i>
                      </button>
                      <button @click="moveRowDown(rowIndex)" class="row-move-btn" :disabled="rowIndex === schema.fields.length - 1">
                        <i class="pi pi-chevron-down"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Drop zone between rows -->
                <div 
                  v-show="isDragging || isDraggingElement"
                  class="row-drop-zone"
                  @dragover="handleRowDropZoneDragOver"
                  @drop="(e) => handleRowDropZoneDrop(e, rowIndex + 1)"
                ></div>
              </template>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Element Settings (Desktop) -->
      <div class="settings-panel desktop-only">
        <h3>Element Settings</h3>
        <div v-if="!selectedElement" class="no-selection">
          <i class="pi pi-info-circle"></i>
          <p>Select an element to edit its properties</p>
        </div>
        <div v-else class="settings-content">
          <div v-for="setting in elementSettings" :key="setting.key" class="setting-item">
            <!-- Text & Textarea Inputs -->
            <div v-if="setting.type === 'text' || setting.type === 'textarea'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <input 
                v-if="setting.type === 'text'"
                :value="getSettingValue(setting.key)"
                type="text" 
                class="field-input"
                :placeholder="setting.placeholder || ''"
                @input="updateSettingValue(setting.key, $event.target.value)"
              />
              <textarea 
                v-else
                :value="getSettingValue(setting.key)"
                class="field-input field-textarea"
                :placeholder="setting.placeholder || ''"
                rows="3"
                @input="updateSettingValue(setting.key, $event.target.value)"
              />
            </div>
            
            <!-- Number Input -->
            <div v-else-if="setting.type === 'number'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <input 
                :value="getSettingValue(setting.key)"
                type="number" 
                class="field-input"
                :min="setting.min"
                :max="setting.max"
                :step="setting.step || 1"
                @input="updateSettingValue(setting.key, parseFloat($event.target.value) || 0)"
              />
            </div>
            
            <!-- Checkbox -->
            <div v-else-if="setting.type === 'checkbox'" class="field-group checkbox-group">
              <label class="checkbox-container">
                <input 
                  :checked="getSettingValue(setting.key)"
                  type="checkbox"
                  class="checkbox-input"
                  @change="updateSettingValue(setting.key, $event.target.checked)"
                />
                <span class="checkbox-checkmark"></span>
                <span class="checkbox-text">{{ setting.label }}</span>
              </label>
            </div>
            
            <!-- Select Dropdown -->
            <div v-else-if="setting.type === 'select'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <select 
                :value="getSettingValue(setting.key)"
                class="field-input field-select"
                @change="updateSettingValue(setting.key, $event.target.value)"
              >
                <option v-for="option in setting.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <!-- Color Input -->
            <div v-else-if="setting.type === 'color'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <div class="color-input-wrapper">
                <input 
                  :value="getSettingValue(setting.key)"
                  type="color" 
                  class="field-input field-color"
                  @input="updateSettingValue(setting.key, $event.target.value)"
                />
                <span class="color-preview" :style="{ backgroundColor: getSettingValue(setting.key) }"></span>
              </div>
            </div>
            
            <!-- Date Input -->
            <div v-else-if="setting.type === 'date'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <input 
                :value="getSettingValue(setting.key)"
                type="date" 
                class="field-input"
                @input="updateSettingValue(setting.key, $event.target.value)"
              />
            </div>
            
            <!-- Field Select for Conditional Display -->
            <div v-else-if="setting.type === 'field_select'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <select 
                :value="getSettingValue(setting.key)"
                class="field-input field-select"
                @change="updateSettingValue(setting.key, $event.target.value)"
              >
                <option value="">None</option>
                <option v-for="field in getAvailableFields()" :key="field.value" :value="field.value">
                  {{ field.label }}
                </option>
              </select>
            </div>
            
            <!-- Options Manager -->
            <div v-else-if="setting.type === 'options'" class="field-group">
              <label class="field-label">{{ setting.label }}</label>
              <div class="options-explanation">
                <small>
                  <strong>Label:</strong> What users see (e.g., "Small", "Medium", "Large")<br>
                  <strong>Value:</strong> What gets saved (e.g., "sm", "md", "lg")
                </small>
              </div>
              <div class="options-manager">
                <div class="options-header">
                  <span class="header-label">User sees</span>
                  <span class="header-value">Database saves</span>
                  <span class="header-action"></span>
                </div>
                <div v-for="(option, index) in getSettingValue(setting.key)" :key="index" class="option-item">
                  <input 
                    :value="option.label"
                    type="text" 
                    class="field-input option-label"
                    placeholder="What users see"
                    @input="updateOptionLabel(setting.key, index, $event.target.value)"
                  />
                  <input 
                    :value="option.value"
                    type="text" 
                    class="field-input option-value"
                    placeholder="Database value"
                    @input="updateOptionValue(setting.key, index, $event.target.value)"
                  />
                  <button @click="removeOption(setting.key, index)" class="remove-option-btn">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
                <button @click="addOption(setting.key)" class="add-option-btn">
                  <i class="pi pi-plus"></i>
                  Add Option
                </button>
              </div>
            </div>
          </div>
          
          <!-- Universal Conditional Display Settings -->
          <div v-if="selectedElement && selectedElement.type !== 'heading' && selectedElement.type !== 'paragraph' && selectedElement.type !== 'divider'" class="conditional-settings">
            <div class="conditional-header">
              <h4>Conditional Display</h4>
              <small>Show this element only when certain conditions are met</small>
            </div>
            
            <div class="field-group">
              <label class="field-label">Show Only When Field</label>
              <select 
                :value="getSettingValue('conditionalDisplay.field')"
                class="field-input field-select"
                @change="updateSettingValue('conditionalDisplay.field', $event.target.value)"
              >
                <option value="">Always show</option>
                <option v-for="field in getAvailableFields()" :key="field.value" :value="field.value">
                  {{ field.label }}
                </option>
              </select>
            </div>
            
            <div v-if="getSettingValue('conditionalDisplay.field')" class="field-group">
              <label class="field-label">Condition</label>
              <select 
                :value="getSettingValue('conditionalDisplay.condition')"
                class="field-input field-select"
                @change="updateSettingValue('conditionalDisplay.condition', $event.target.value)"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="not_empty">Not Empty</option>
                <option value="empty">Empty</option>
              </select>
            </div>
            
            <div v-if="getSettingValue('conditionalDisplay.field') && ['equals', 'not_equals', 'contains'].includes(getSettingValue('conditionalDisplay.condition'))" class="field-group">
              <label class="field-label">Value</label>
              <input 
                :value="getSettingValue('conditionalDisplay.value')"
                type="text" 
                class="field-input"
                placeholder="Value to compare"
                @input="updateSettingValue('conditionalDisplay.value', $event.target.value)"
              />
            </div>
          </div>
          
          <div class="settings-actions">
            <button @click="deleteSelectedElement" class="delete-button">
              <i class="pi pi-trash"></i>
              <span>Delete Element</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Settings Modal -->
    <div v-if="showMobileSettings" class="mobile-modal-overlay" @click="closeMobileSettings">
      <div class="mobile-modal" @click.stop>
        <div class="modal-header">
          <h3>Element Settings</h3>
          <button @click="closeMobileSettings" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="selectedElement" class="settings-content">
            <div v-for="setting in elementSettings" :key="setting.key" class="setting-item">
              <!-- Text & Textarea Inputs -->
              <div v-if="setting.type === 'text' || setting.type === 'textarea'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <input 
                  v-if="setting.type === 'text'"
                  :value="getSettingValue(setting.key)"
                  type="text" 
                  class="field-input"
                  :placeholder="setting.placeholder || ''"
                  @input="updateSettingValue(setting.key, $event.target.value)"
                />
                <textarea 
                  v-else
                  :value="getSettingValue(setting.key)"
                  class="field-input field-textarea"
                  :placeholder="setting.placeholder || ''"
                  rows="3"
                  @input="updateSettingValue(setting.key, $event.target.value)"
                />
              </div>
              
              <!-- Number Input -->
              <div v-else-if="setting.type === 'number'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <input 
                  :value="getSettingValue(setting.key)"
                  type="number" 
                  class="field-input"
                  :min="setting.min"
                  :max="setting.max"
                  :step="setting.step || 1"
                  @input="updateSettingValue(setting.key, parseFloat($event.target.value) || 0)"
                />
              </div>
              
              <!-- Checkbox -->
              <div v-else-if="setting.type === 'checkbox'" class="field-group checkbox-group">
                <label class="checkbox-container">
                  <input 
                    :checked="getSettingValue(setting.key)"
                    type="checkbox"
                    class="checkbox-input"
                    @change="updateSettingValue(setting.key, $event.target.checked)"
                  />
                  <span class="checkbox-checkmark"></span>
                  <span class="checkbox-text">{{ setting.label }}</span>
                </label>
              </div>
              
              <!-- Select Dropdown -->
              <div v-else-if="setting.type === 'select'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <select 
                  :value="getSettingValue(setting.key)"
                  class="field-input field-select"
                  @change="updateSettingValue(setting.key, $event.target.value)"
                >
                  <option v-for="option in setting.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              
              <!-- Color Input -->
              <div v-else-if="setting.type === 'color'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <div class="color-input-wrapper">
                  <input 
                    :value="getSettingValue(setting.key)"
                    type="color" 
                    class="field-input field-color"
                    @input="updateSettingValue(setting.key, $event.target.value)"
                  />
                  <span class="color-preview" :style="{ backgroundColor: getSettingValue(setting.key) }"></span>
                </div>
              </div>
              
              <!-- Date Input -->
              <div v-else-if="setting.type === 'date'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <input 
                  :value="getSettingValue(setting.key)"
                  type="date" 
                  class="field-input"
                  @input="updateSettingValue(setting.key, $event.target.value)"
                />
              </div>
              
              <!-- Field Select for Conditional Display (Mobile) -->
              <div v-else-if="setting.type === 'field_select'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <select 
                  :value="getSettingValue(setting.key)"
                  class="field-input field-select"
                  @change="updateSettingValue(setting.key, $event.target.value)"
                >
                  <option value="">None</option>
                  <option v-for="field in getAvailableFields()" :key="field.value" :value="field.value">
                    {{ field.label }}
                  </option>
                </select>
              </div>
              
              <!-- Options Manager (Mobile) -->
              <div v-else-if="setting.type === 'options'" class="field-group">
                <label class="field-label">{{ setting.label }}</label>
                <div class="options-explanation">
                  <small>
                    <strong>Label:</strong> What users see<br>
                    <strong>Value:</strong> What gets saved
                  </small>
                </div>
                <div class="options-manager">
                  <div v-for="(option, index) in getSettingValue(setting.key)" :key="index" class="option-item">
                    <input 
                      :value="option.label"
                      type="text" 
                      class="field-input option-label"
                      placeholder="What users see"
                      @input="updateOptionLabel(setting.key, index, $event.target.value)"
                    />
                    <input 
                      :value="option.value"
                      type="text" 
                      class="field-input option-value"
                      placeholder="Database value"
                      @input="updateOptionValue(setting.key, index, $event.target.value)"
                    />
                    <button @click="removeOption(setting.key, index)" class="remove-option-btn">
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                  <button @click="addOption(setting.key)" class="add-option-btn">
                    <i class="pi pi-plus"></i>
                    Add Option
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Universal Conditional Display Settings (Mobile) -->
            <div v-if="selectedElement && selectedElement.type !== 'heading' && selectedElement.type !== 'paragraph' && selectedElement.type !== 'divider'" class="conditional-settings">
              <div class="conditional-header">
                <h4>Conditional Display</h4>
                <small>Show this element only when certain conditions are met</small>
              </div>
              
              <div class="field-group">
                <label class="field-label">Show Only When Field</label>
                <select 
                  :value="getSettingValue('conditionalDisplay.field')"
                  class="field-input field-select"
                  @change="updateSettingValue('conditionalDisplay.field', $event.target.value)"
                >
                  <option value="">Always show</option>
                  <option v-for="field in getAvailableFields()" :key="field.value" :value="field.value">
                    {{ field.label }}
                  </option>
                </select>
              </div>
              
              <div v-if="getSettingValue('conditionalDisplay.field')" class="field-group">
                <label class="field-label">Condition</label>
                <select 
                  :value="getSettingValue('conditionalDisplay.condition')"
                  class="field-input field-select"
                  @change="updateSettingValue('conditionalDisplay.condition', $event.target.value)"
                >
                  <option value="equals">Equals</option>
                  <option value="not_equals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="not_empty">Not Empty</option>
                  <option value="empty">Empty</option>
                </select>
              </div>
              
              <div v-if="getSettingValue('conditionalDisplay.field') && ['equals', 'not_equals', 'contains'].includes(getSettingValue('conditionalDisplay.condition'))" class="field-group">
                <label class="field-label">Value</label>
                <input 
                  :value="getSettingValue('conditionalDisplay.value')"
                  type="text" 
                  class="field-input"
                  placeholder="Value to compare"
                  @input="updateSettingValue('conditionalDisplay.value', $event.target.value)"
                />
              </div>
            </div>
            
            <div class="settings-actions">
              <button @click="deleteSelectedElement" class="delete-button">
                <i class="pi pi-trash"></i>
                <span>Delete Element</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms Management Modal -->
    <div v-if="showFormsModal" class="modal-overlay" @click="closeFormsModal">
      <div class="forms-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ formsModalMode === 'save' ? 'Save Form' : 'Load Form' }}</h3>
          <button @click="closeFormsModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <!-- Save Mode -->
          <div v-if="formsModalMode === 'save'" class="save-form-section">
            <div class="field-group">
              <label class="field-label">Form Name</label>
              <input 
                v-model="newFormName"
                type="text" 
                class="field-input"
                placeholder="Enter form name..."
                @keyup.enter="saveFormWithName"
              />
            </div>
            <div class="modal-actions">
              <button @click="closeFormsModal" class="btn-secondary">Cancel</button>
              <button @click="saveFormWithName" class="btn-primary" :disabled="!newFormName.trim()">
                <i class="pi pi-save"></i>
                Save Form
              </button>
            </div>
          </div>
          
          <!-- Load Mode -->
          <div v-if="formsModalMode === 'load'" class="load-form-section">
            <div v-if="savedForms.length === 0" class="empty-state">
              <i class="pi pi-folder-open"></i>
              <p>No saved forms found</p>
              <small>Save a form to see it here</small>
            </div>
            
            <div v-else class="forms-list">
              <div 
                v-for="form in sortedSavedForms" 
                :key="form.id" 
                class="form-item"
              >
                <div class="form-info">
                  <div class="form-name">{{ form.name }}</div>
                  <div class="form-timestamp">{{ formatTimestamp(form.timestamp) }}</div>
                </div>
                <div class="form-actions">
                  <button @click="loadSelectedForm(form)" class="load-btn">
                    <i class="pi pi-folder-open"></i>
                    Load
                  </button>
                  <button @click="deleteForm(form.id)" class="delete-form-btn">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="savedForms.length > 0" class="modal-actions">
              <button @click="closeFormsModal" class="btn-secondary">Cancel</button>
              <button @click="clearAllForms" class="btn-danger">
                <i class="pi pi-trash"></i>
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="preview-modal-overlay" @click="closePreviewModal">
      <div class="preview-modal" @click.stop>
        <div class="preview-modal-header">
          <h3>Form Preview</h3>
          <div class="preview-actions">
            <button @click="closePreviewModal" class="close-btn">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        
        <div class="preview-modal-content">
          <FormViewer :schema="schema" @close="closePreviewModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import TextElement from './form-elements/TextElement.vue'
import TextareaElement from './form-elements/TextareaElement.vue'
import NumberInputElement from './form-elements/NumberInputElement.vue'
import EmailInputElement from './form-elements/EmailInputElement.vue'
import PhoneInputElement from './form-elements/PhoneInputElement.vue'
import SelectElement from './form-elements/SelectElement.vue'
import RadioElement from './form-elements/RadioElement.vue'
import CheckboxElement from './form-elements/CheckboxElement.vue'
import HeadingElement from './form-elements/HeadingElement.vue'
import ParagraphElement from './form-elements/ParagraphElement.vue'
import DividerElement from './form-elements/DividerElement.vue'
import DatePickerElement from './form-elements/DatePickerElement.vue'
import ImageUploadElement from './form-elements/ImageUploadElement.vue'
import { elementConfig as textConfig } from './form-elements/TextElement.vue'
import { elementConfig as numberConfig } from './form-elements/NumberInputElement.vue'
import { elementConfig as emailConfig } from './form-elements/EmailInputElement.vue'
import { elementConfig as phoneConfig } from './form-elements/PhoneInputElement.vue'
import { elementConfig as textareaConfig } from './form-elements/TextareaElement.vue'
import { elementConfig as selectConfig } from './form-elements/SelectElement.vue'
import { elementConfig as radioConfig } from './form-elements/RadioElement.vue'
import { elementConfig as checkboxConfig } from './form-elements/CheckboxElement.vue'
import { elementConfig as headingConfig } from './form-elements/HeadingElement.vue'
import { elementConfig as paragraphConfig } from './form-elements/ParagraphElement.vue'
import { elementConfig as dividerConfig } from './form-elements/DividerElement.vue'
import { elementConfig as dateConfig } from './form-elements/DatePickerElement.vue'
import { elementConfig as imageConfig } from './form-elements/ImageUploadElement.vue'
import FormViewer from '@/components/FormViewer.vue'
import type { FormSchema, FormRow, FormColumn } from '@/types/schema'

const selectedElement = ref<FormColumn | null>(null)
const showMobileSettings = ref(false)
const activeTab = ref<'fields' | 'static'>('fields')
const hoveredRow = ref<string | null>(null)
const showDropdown = ref(false)
const showRowControls = ref(true)
const showFormsModal = ref(false)
const formsModalMode = ref<'save' | 'load'>('load')
const savedForms = ref<Array<{id: string, name: string, timestamp: number, data: any}>>([])
const newFormName = ref('')
const showPreviewModal = ref(false)

// Element palette data
const fieldElements = ref([
  { type: 'text', label: 'Text Input', icon: 'pi pi-align-left' },
  { type: 'number', label: 'Number Input', icon: 'pi pi-hashtag' },
  { type: 'email', label: 'Email Address', icon: 'pi pi-at' },
  { type: 'phone', label: 'Phone Number', icon: 'pi pi-phone' },
  { type: 'textarea', label: 'Text Area', icon: 'pi pi-align-justify' },
  { type: 'select', label: 'Select Dropdown', icon: 'pi pi-list' },
  { type: 'radio', label: 'Radio Buttons', icon: 'pi pi-circle' },
  { type: 'checkbox', label: 'Checkbox List', icon: 'pi pi-check-square' },
  { type: 'calendar', label: 'Date Picker', icon: 'pi pi-calendar' },
  { type: 'image', label: 'Image Upload', icon: 'pi pi-image' }
])

const staticElements = ref([
  { type: 'heading', label: 'Heading', icon: 'pi pi-bookmark' },
  { type: 'paragraph', label: 'Paragraph', icon: 'pi pi-align-left' },
  { type: 'divider', label: 'Divider', icon: 'pi pi-minus' }
])

// Simple drag and drop state
let draggedElementType: string | null = null
let draggedElement: FormColumn | null = null
const isDragging = ref(false)
const isDraggingElement = ref(false)

// Resize state
const isResizing = ref(false)
let resizeData: {
  row: FormRow
  leftIndex: number
  rightIndex: number
  startX: number
  startLeftWidth: number
  startRightWidth: number
} | null = null

const schema = reactive<FormSchema>({
  id: 'new-form',
  meta: {
    name: 'New Form',
    description: 'Form created with builder',
    version: '1.0.0'
  },
  layout: {
    type: 'grid',
    maxColumns: 3,
    gap: 'md'
  },
  fields: []
})

const generateId = (): string => {
  return 'id_' + Math.random().toString(36).substr(2, 9)
}

// Grid helper functions
// Simple native HTML5 drag and drop handlers
const handleDragStart = (e: DragEvent) => {
  const target = e.target as HTMLElement
  draggedElementType = target.dataset.type || null
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedElementType = null
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // Allow drop
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  
  // Handle dragged existing element
  if (draggedElement) {
    // Remove from current position
    removeElementFromSchema(draggedElement.id)
    
    // Create new row for the element
    const newRow: FormRow = {
      id: generateId(),
      type: 'row',
      order: schema.fields.length + 1,
      columns: [draggedElement]
    }
    
    schema.fields.push(newRow)
    selectElement(draggedElement)
    draggedElement = null
    isDraggingElement.value = false
    return
  }
  
  // Handle new element from palette
  if (!draggedElementType) return
  
  // Create new form element using self-contained config
  const config = elementConfigs[draggedElementType as keyof typeof elementConfigs]
  const elementId = generateId()
  const newColumn: FormColumn = {
    id: elementId,
    name: `field_${elementId}`, // Add name for conditional referencing
    type: draggedElementType as any,
    label: config?.label || { show: true, value: 'Element', defaultValue: 'Element', editable: true },
    placeholder: config?.placeholder || { show: true, value: '', defaultValue: '', editable: true },
    description: config?.description || { show: false, value: '', defaultValue: '', editable: true },
    validation: config?.validation || {},
    props: config?.props || {},
    width: 1
  }
  
  
  // Create new row
  const newRow: FormRow = {
    id: generateId(),
    type: 'row',
    order: schema.fields.length + 1,
    columns: [newColumn]
  }
  
  schema.fields.push(newRow)
  selectElement(newColumn)
  draggedElementType = null
  isDragging.value = false
}

const handleRowDragOver = (e: DragEvent) => {
  e.preventDefault() // Allow drop on row
}

const handleRowDrop = (e: DragEvent, row: FormRow) => {
  e.preventDefault()
  e.stopPropagation() // Prevent canvas drop from firing
  
  // Handle dragged existing element
  if (draggedElement) {
    // Remove from current position
    removeElementFromSchema(draggedElement.id)
    
    // Add to target row
    row.columns.push(draggedElement)
    selectElement(draggedElement)
    draggedElement = null
    isDraggingElement.value = false
    return
  }
  
  // Handle new element from palette
  if (!draggedElementType) return
  
  // Create new form element using self-contained config
  const config = elementConfigs[draggedElementType as keyof typeof elementConfigs]
  const elementId = generateId()
  const newColumn: FormColumn = {
    id: elementId,
    name: `field_${elementId}`, // Add name for conditional referencing
    type: draggedElementType as any,
    label: config?.label || { show: true, value: 'Element', defaultValue: 'Element', editable: true },
    placeholder: config?.placeholder || { show: true, value: '', defaultValue: '', editable: true },
    validation: config?.validation || {},
    props: config?.props || {},
    width: 1
  }
  
  // Add to existing row
  row.columns.push(newColumn)
  selectElement(newColumn)
  draggedElementType = null
  isDragging.value = false
}

const getElementConfig = (type: string) => {
  const configs = {
    text: {
      label: 'Text Input',
      placeholder: 'Enter text...',
      validation: { required: false, minLength: 0, maxLength: 255 }
    },
    number: {
      label: 'Number Input',
      placeholder: 'Enter number...',
      validation: { required: false, min: undefined, max: undefined }
    },
    email: {
      label: 'Email Address',
      placeholder: 'Enter email...',
      validation: { required: false, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
    },
    phone: {
      label: 'Phone Number',
      placeholder: '',
      validation: { required: false },
      props: { defaultCountry: 'US' }
    },
    textarea: {
      label: 'Text Area',
      placeholder: 'Enter description...',
      validation: { required: false, minLength: 0, maxLength: 1000 },
      props: { rows: 3 }
    },
    select: {
      label: 'Dropdown',
      placeholder: 'Select option...',
      validation: { required: false },
      props: { options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] }
    },
    checkbox: {
      label: 'Checkbox',
      placeholder: '',
      validation: { required: false }
    },
    radio: {
      label: 'Radio Button',
      placeholder: '',
      validation: { required: false },
      props: { options: [{ value: 'option1', label: 'Option 1' }, { value: 'option2', label: 'Option 2' }] }
    },
    heading: {
      label: 'Heading',
      placeholder: '',
      validation: {},
      props: { level: 2, text: 'Heading Text' }
    },
    paragraph: {
      label: 'Paragraph',
      placeholder: '',
      validation: {},
      props: { text: 'Your paragraph text here.' }
    },
    divider: {
      label: 'Divider',
      placeholder: '',
      validation: {},
      props: { style: 'solid' }
    },
    calendar: {
      label: 'Date Picker',
      placeholder: 'Select date...',
      validation: { required: false }
    },
    image: {
      label: 'Image Upload',
      placeholder: '',
      validation: { required: false },
      props: { maxSize: 5, allowedTypes: ['jpg', 'jpeg', 'png', 'gif'] }
    }
  }
  return configs[type as keyof typeof configs] || configs.text
}

const getElementComponent = (type: string) => {
  switch (type) {
    case 'text': return TextElement
    case 'textarea': return TextareaElement
    case 'number': return NumberInputElement
    case 'email': return EmailInputElement
    case 'phone': return PhoneInputElement
    case 'select': return SelectElement
    case 'radio': return RadioElement
    case 'checkbox': return CheckboxElement
    case 'calendar': return DatePickerElement
    case 'image': return ImageUploadElement
    case 'heading': return HeadingElement
    case 'paragraph': return ParagraphElement
    case 'divider': return DividerElement
    default: return TextElement
  }
}

const selectElement = (column: FormColumn): void => {
  selectedElement.value = column
  // On mobile, open settings modal
  if (window.innerWidth <= 768) {
    showMobileSettings.value = true
  }
}

const closeMobileSettings = () => {
  showMobileSettings.value = false
}

const updateElement = () => {
  // Element is already reactive, changes are automatic
}

const deleteSelectedElement = (): void => {
  if (!selectedElement.value) return
  deleteElement(selectedElement.value.id)
  closeMobileSettings()
}

const deleteElement = (columnId: string): void => {
  for (let i = schema.fields.length - 1; i >= 0; i--) {
    const row = schema.fields[i]
    const columnIndex = row.columns.findIndex(c => c.id === columnId)
    
    if (columnIndex > -1) {
      row.columns.splice(columnIndex, 1)
      
      if (selectedElement.value?.id === columnId) {
        selectedElement.value = null
      }
      
      // Remove empty rows
      if (row.columns.length === 0) {
        schema.fields.splice(i, 1)
      } else {
        // Smart redistribute remaining widths
        distributeWidths(row.columns)
      }
      
      break
    }
  }
}

const distributeWidths = (columns: FormColumn[]): void => {
  const equalWidth = 1 / columns.length
  columns.forEach(column => {
    column.width = equalWidth
  })
}

// Resize functionality
const startResize = (e: MouseEvent, row: FormRow, leftIndex: number): void => {
  e.preventDefault()
  e.stopPropagation()
  
  const rightIndex = leftIndex + 1
  if (rightIndex >= row.columns.length) return
  
  const leftColumn = row.columns[leftIndex]
  const rightColumn = row.columns[rightIndex]
  
  isResizing.value = true
  resizeData = {
    row,
    leftIndex,
    rightIndex,
    startX: e.clientX,
    startLeftWidth: leftColumn.width || 1,
    startRightWidth: rightColumn.width || 1
  }
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent): void => {
  if (!resizeData || !isResizing.value) return
  
  const deltaX = e.clientX - resizeData.startX
  const containerWidth = 800 // Approximate container width for calculations
  const deltaPercent = deltaX / containerWidth
  
  const newLeftWidth = Math.max(0.1, Math.min(0.9, resizeData.startLeftWidth + deltaPercent))
  const newRightWidth = Math.max(0.1, Math.min(0.9, resizeData.startRightWidth - deltaPercent))
  
  // Ensure total width stays consistent
  const totalWidth = newLeftWidth + newRightWidth
  if (totalWidth > 0) {
    resizeData.row.columns[resizeData.leftIndex].width = newLeftWidth
    resizeData.row.columns[resizeData.rightIndex].width = newRightWidth
  }
}

const stopResize = (): void => {
  isResizing.value = false
  resizeData = null
  
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Element drag handlers
const handleElementDragStart = (e: DragEvent, element: FormColumn) => {
  draggedElement = element
  isDraggingElement.value = true
  e.stopPropagation()
}

const handleElementDragEnd = () => {
  draggedElement = null
  isDraggingElement.value = false
}

const removeElementFromSchema = (elementId: string): void => {
  for (let i = schema.fields.length - 1; i >= 0; i--) {
    const row = schema.fields[i]
    const index = row.columns.findIndex(col => col.id === elementId)
    if (index > -1) {
      row.columns.splice(index, 1)
      
      // Remove empty rows
      if (row.columns.length === 0) {
        schema.fields.splice(i, 1)
      }
      break
    }
  }
}

// Row drop zone handlers
const handleRowDropZoneDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleRowDropZoneDrop = (e: DragEvent, insertIndex: number) => {
  e.preventDefault()
  e.stopPropagation()
  
  let elementToInsert: FormColumn
  
  // Handle dragged existing element
  if (draggedElement) {
    removeElementFromSchema(draggedElement.id)
    elementToInsert = draggedElement
    draggedElement = null
    isDraggingElement.value = false
  }
  // Handle new element from palette
  else if (draggedElementType) {
    const config = elementConfigs[draggedElementType as keyof typeof elementConfigs]
    elementToInsert = {
      id: generateId(),
      type: draggedElementType as any,
      label: config?.label || { show: true, value: 'Element', defaultValue: 'Element', editable: true },
      placeholder: config?.placeholder || { show: true, value: '', defaultValue: '', editable: true },
      validation: config?.validation || {},
      props: config?.props || {},
      width: 1
    }
    draggedElementType = null
    isDragging.value = false
  } else {
    return
  }
  
  // Create new row at the specified position
  const newRow: FormRow = {
    id: generateId(),
    type: 'row',
    order: insertIndex + 1,
    columns: [elementToInsert]
  }
  
  // Insert the row at the correct position
  schema.fields.splice(insertIndex, 0, newRow)
  
  // Update order for all rows after the inserted position
  for (let i = insertIndex + 1; i < schema.fields.length; i++) {
    schema.fields[i].order = i + 1
  }
  
  selectElement(elementToInsert)
}

// Canvas-wide drag handlers
const handleCanvasDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleCanvasDrop = (e: DragEvent) => {
  // Only handle if not dropping on a specific row or element
  if (e.target === e.currentTarget) {
    handleDrop(e)
  }
}

// Move row up/down functions
const moveRowUp = (rowIndex: number) => {
  if (rowIndex > 0) {
    // Swap with previous row
    const temp = schema.fields[rowIndex]
    schema.fields[rowIndex] = schema.fields[rowIndex - 1]
    schema.fields[rowIndex - 1] = temp
    
    // Update order numbers
    schema.fields[rowIndex].order = rowIndex + 1
    schema.fields[rowIndex - 1].order = rowIndex
  }
}

const moveRowDown = (rowIndex: number) => {
  if (rowIndex < schema.fields.length - 1) {
    // Swap with next row
    const temp = schema.fields[rowIndex]
    schema.fields[rowIndex] = schema.fields[rowIndex + 1]
    schema.fields[rowIndex + 1] = temp
    
    // Update order numbers
    schema.fields[rowIndex].order = rowIndex + 1
    schema.fields[rowIndex + 1].order = rowIndex + 2
  }
}

// Menu functions
const saveLocal = () => {
  openSaveModal()
}

const loadLocal = () => {
  openLoadModal()
}

const importForm = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const parsed = JSON.parse(event.target.result)
          Object.assign(schema, parsed)
          selectedElement.value = null
        } catch (error) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
  showDropdown.value = false
}

const exportForm = () => {
  const formData = JSON.stringify(schema, null, 2)
  const blob = new Blob([formData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${schema.meta.name || 'form'}.json`
  a.click()
  URL.revokeObjectURL(url)
  showDropdown.value = false
}

const previewForm = () => {
  console.log('Preview form clicked, schema:', schema)
  console.log('Schema fields:', schema.fields)
  console.log('showPreviewModal before:', showPreviewModal.value)
  showPreviewModal.value = true
  console.log('showPreviewModal after:', showPreviewModal.value)
  showDropdown.value = false
}

const closePreviewModal = () => {
  showPreviewModal.value = false
}

// Forms Management Functions
const loadSavedForms = () => {
  try {
    const saved = localStorage.getItem('form-builder-forms')
    if (saved) {
      savedForms.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load saved forms:', error)
    savedForms.value = []
  }
}

const saveForms = () => {
  try {
    localStorage.setItem('form-builder-forms', JSON.stringify(savedForms.value))
  } catch (error) {
    console.error('Failed to save forms:', error)
  }
}

const openSaveModal = () => {
  formsModalMode.value = 'save'
  newFormName.value = schema.meta.name || 'New Form'
  showFormsModal.value = true
  showDropdown.value = false
}

const openLoadModal = () => {
  formsModalMode.value = 'load'
  loadSavedForms()
  showFormsModal.value = true
  showDropdown.value = false
}

const closeFormsModal = () => {
  showFormsModal.value = false
  newFormName.value = ''
}

const saveFormWithName = () => {
  if (!newFormName.value.trim()) return
  
  const formData = {
    id: Date.now().toString(),
    name: newFormName.value.trim(),
    timestamp: Date.now(),
    data: JSON.parse(JSON.stringify(schema))
  }
  
  // Check if form with same name exists
  const existingIndex = savedForms.value.findIndex(f => f.name === formData.name)
  if (existingIndex > -1) {
    // Update existing form
    savedForms.value[existingIndex] = formData
  } else {
    // Add new form
    savedForms.value.push(formData)
  }
  
  saveForms()
  closeFormsModal()
  
  // Show success message
  alert(`Form "${formData.name}" saved successfully!`)
}

const loadSelectedForm = (form: any) => {
  Object.assign(schema, form.data)
  selectedElement.value = null
  closeFormsModal()
  alert(`Form "${form.name}" loaded successfully!`)
}

const deleteForm = (formId: string) => {
  if (confirm('Are you sure you want to delete this form?')) {
    savedForms.value = savedForms.value.filter(f => f.id !== formId)
    saveForms()
  }
}

const clearAllForms = () => {
  if (confirm('Are you sure you want to delete all saved forms? This cannot be undone.')) {
    savedForms.value = []
    saveForms()
  }
}

const sortedSavedForms = computed(() => {
  return [...savedForms.value].sort((a, b) => b.timestamp - a.timestamp)
})

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Static element configurations mapping
const elementConfigs = {
  text: textConfig,
  number: numberConfig,
  email: emailConfig,
  phone: phoneConfig,
  textarea: textareaConfig,
  select: selectConfig,
  radio: radioConfig,
  checkbox: checkboxConfig,
  heading: headingConfig,
  paragraph: paragraphConfig,
  divider: dividerConfig,
  calendar: dateConfig,
  image: imageConfig
}

const elementSettings = computed(() => {
  if (!selectedElement.value) return []
  
  // Get settings from the element's self-contained configuration
  const elementType = selectedElement.value.type
  const config = elementConfigs[elementType as keyof typeof elementConfigs]
  
  if (!config || !config.settings) {
    console.log('No config found for element type:', elementType)
    return []
  }
  
  console.log('Element settings for', elementType, ':', config.settings)
  return config.settings
})

const getSettingValue = (key: string) => {
  if (!selectedElement.value) return null
  
  const keys = key.split('.')
  let value = selectedElement.value
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return null
    }
  }
  
  return value
}

const updateSettingValue = (key: string, value: any) => {
  if (!selectedElement.value) return
  
  const keys = key.split('.')
  let target = selectedElement.value
  
  // Navigate to the parent object
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!(k in target)) {
      target[k] = {}
    }
    target = target[k]
  }
  
  // Set the final value
  const finalKey = keys[keys.length - 1]
  target[finalKey] = value
  
  // Auto-enable show when description gets a value
  if (key === 'description.value' && value && value.trim()) {
    if (target.show !== undefined) {
      target.show = true
    }
  }
  
  updateElement()
}

// Options management functions
const addOption = (key: string) => {
  const options = getSettingValue(key) || []
  const newOption = { label: `Option ${options.length + 1}`, value: `option${options.length + 1}` }
  options.push(newOption)
  updateSettingValue(key, options)
}

const removeOption = (key: string, index: number) => {
  const options = getSettingValue(key) || []
  if (options.length > 1) { // Keep at least one option
    options.splice(index, 1)
    updateSettingValue(key, options)
  }
}

const updateOptionLabel = (key: string, index: number, label: string) => {
  const options = getSettingValue(key) || []
  if (options[index]) {
    options[index].label = label
    updateSettingValue(key, options)
  }
}

const updateOptionValue = (key: string, index: number, value: string) => {
  const options = getSettingValue(key) || []
  if (options[index]) {
    options[index].value = value
    updateSettingValue(key, options)
  }
}

// Get available fields for conditional display
const getAvailableFields = () => {
  const fields: Array<{ label: string; value: string }> = []
  
  schema.fields.forEach(row => {
    row.columns.forEach(column => {
      if (column.name && column.type !== 'heading' && column.type !== 'paragraph' && column.type !== 'divider') {
        // Handle different label formats
        let label = ''
        if (typeof column.label === 'string') {
          label = column.label
        } else if (column.label && typeof column.label === 'object' && column.label.value) {
          label = column.label.value
        } else {
          label = column.name
        }
        fields.push({ label: label || column.name, value: column.name })
      }
    })
  })
  
  return fields
}

// Fix existing elements that don't have names or description properties
const fixElementNames = () => {
  schema.fields.forEach(row => {
    row.columns.forEach(column => {
      if (!column.name && column.id) {
        column.name = `field_${column.id}`
        console.log('Fixed element name:', column.type, column.name)
      }
      
      // Fix missing description property
      if (!column.description && column.type !== 'heading' && column.type !== 'paragraph' && column.type !== 'divider') {
        column.description = { show: false, value: '', defaultValue: '', editable: true }
        console.log('Added description property to:', column.type, column.name || column.id)
      }
    })
  })
}

// Run the fix immediately
fixElementNames()

</script>

<style scoped>
.form-builder {
  height: 100%;
  background: var(--bg-primary);
  width: 100%;
  margin: 0;
  padding: 0;
  display: block;
}

.builder-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  overflow: hidden;
}

/* Left Panel: Elements */
.elements-panel {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem 1rem;
  overflow-y: auto;
  height: 100%;
}

.elements-panel h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.panel-header {
  margin-bottom: 0.5rem;
}

.element-toggle {
  display: flex;
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 2px;
  gap: 2px;
  margin-top: 1rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: var(--accent-color);
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.element-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  cursor: grab;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.element-item:hover {
  border-color: var(--accent-color);
  background: var(--accent-light);
  transform: translateY(-1px);
}

.element-item:active {
  cursor: grabbing;
}

.element-item i {
  color: var(--accent-color);
  font-size: 1.1rem;
}

.element-item span {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* Center Panel: Form Editor */
.form-editor {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.editor-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.form-title-section {
  flex: 1;
}

.form-title-input {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 0;
  width: 100%;
  max-width: 300px;
}

.form-title-input:focus {
  outline: none;
  border-bottom: 2px solid var(--accent-color);
}

.form-title-input::placeholder {
  color: var(--text-muted);
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.canvas-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.empty-canvas {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--bg-tertiary);
  transition: all 0.2s ease;
}

.empty-canvas.drag-over {
  border-color: var(--accent-color);
  background: rgba(249, 115, 22, 0.1);
}

.empty-content {
  text-align: center;
  color: var(--text-muted);
}

.empty-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.empty-content p {
  margin: 0;
}

.form-canvas {
  min-height: 400px;
  width: 100%;
}

.form-canvas.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-canvas.drag-active {
  background: rgba(249, 115, 22, 0.05);
}

.form-canvas.drag-active .empty-canvas {
  border-color: var(--accent-color);
  background: rgba(249, 115, 22, 0.1);
}

.row-content.drop-zone-active {
  border: 2px dashed var(--accent-color);
  border-radius: 6px;
  background: rgba(249, 115, 22, 0.1);
  transition: all 0.2s ease;
}

.row-content.drop-zone-active::before {
  content: "";
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--accent-color);
  border-radius: 2px;
  pointer-events: none;
}

.canvas-with-controls {
  position: relative;
}

.form-row-wrapper {
  margin-bottom: 1rem;
}

.form-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.row-content {
  flex: 1;
}

.row-controls-right {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 0.5rem;
}

.row-move-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.row-move-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.row-move-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.row-move-up {
  align-self: flex-start;
}

.row-move-down {
  align-self: flex-end;
}

.row-content {
  display: flex;
  gap: 0.5rem;
  align-items: start;
  min-height: 60px;
  width: 100%;
  position: relative;
}

.form-element {
  position: relative;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  flex: 1;
  min-width: 0;
}

.form-element:hover {
  border-color: var(--border-color-hover);
  background: var(--bg-tertiary);
}

.form-element.active {
  border-color: var(--accent-color);
  background: var(--accent-light);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
}


.element-controls {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.form-element:hover .element-controls {
  opacity: 1;
}

.resize-handle {
  width: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: col-resize;
  margin: 0 -4px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.row-content:hover .resize-handle {
  opacity: 1;
}

.resize-bar {
  width: 2px;
  height: 40px;
  background: var(--border-color);
  border-radius: 1px;
  transition: all 0.2s ease;
}

.resize-handle:hover .resize-bar {
  background: var(--accent-color);
  width: 3px;
}

.resizer-left,
.resizer-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  cursor: col-resize;
  border-radius: 2px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.resizer-left:hover,
.resizer-right:hover {
  background: var(--accent-color);
  color: white;
}

/* Drop Zones */
.drop-zone {
  opacity: 0;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.form-canvas.dragging .drop-zone {
  opacity: 0.3;
}

.drop-zone.active {
  opacity: 1;
}

.row-drop-zone {
  height: 20px;
  border: 2px dashed var(--accent-color);
  background: rgba(249, 115, 22, 0.1);
  border-radius: 4px;
  margin: 0.25rem 0;
}

.column-drop-zone {
  flex: 0 0 40px;
  min-height: 60px;
  border: 2px dashed var(--accent-color);
  background: rgba(249, 115, 22, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.move-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.drag-handle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: grab;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--text-danger);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: var(--bg-danger-light);
}


/* Right Panel: Settings */
.settings-panel {
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  padding: 1.5rem 1rem;
  overflow-y: auto;
  height: 100%;
}

.settings-panel h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.no-selection {
  text-align: center;
  color: var(--text-muted);
  padding: 2rem 1rem;
}

.no-selection i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* Settings Panel Styles */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.setting-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.025em;
}

.field-input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.field-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  transform: translateY(-1px);
}

.field-input:hover {
  border-color: var(--border-color-hover);
}

.field-textarea {
  resize: none;
  min-height: 80px;
  line-height: 1.5;
}

.field-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Custom Checkbox */
.checkbox-group {
  padding: 0.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
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
  font-size: 0.875rem;
}

/* Color Input */
.color-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.field-color {
  width: 60px;
  height: 40px;
  padding: 4px;
  cursor: pointer;
  border-radius: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}

/* Settings Actions */
.settings-actions {
  padding: 1.5rem 0 0.5rem 0;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.delete-button:hover {
  background: #dc2626;
  color: #ffffff !important;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.delete-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.delete-button i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.delete-button:hover i {
  transform: scale(1.1);
}

.delete-button span {
  font-weight: 600;
  letter-spacing: 0.025em;
}


/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:hover {
  background: var(--bg-tertiary);
}

.btn-preview {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.dropdown-wrapper {
  position: relative;
}

.btn-menu {
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  margin-top: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
}

.dropdown-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.25rem 0;
}

.btn-danger {
  border-color: var(--text-danger);
  color: var(--text-danger);
}

.btn-danger:hover {
  background: var(--bg-danger-light);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .builder-layout {
    grid-template-columns: 200px 1fr;
  }
  
  .desktop-only {
    display: none;
  }
  
  .elements-panel {
    padding: 1rem 0.5rem;
  }
  
  .canvas-area {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }
  
  .elements-panel {
    display: none;
  }
}

/* Mobile Modal */
.mobile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.mobile-modal {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
}

@media (min-width: 769px) {
  .mobile-modal-overlay {
    display: none;
  }
}

/* Forms Management Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.forms-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.save-form-section,
.load-form-section {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.empty-state small {
  font-size: 0.9rem;
}

.forms-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
}

.form-item:hover {
  border-color: var(--accent-color);
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-info {
  flex: 1;
}

.form-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.form-timestamp {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.load-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.delete-form-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-form-btn:hover {
  background: #dc2626;
  color: white;
  transform: scale(1.05);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-primary:disabled {
  background: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
}

.btn-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.btn-danger:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Preview Modal */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.preview-modal {
  background: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
}

.preview-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.preview-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.preview-modal-content {
  flex: 1;
  overflow: auto;
  background: #f1f5f9;
}

.preview-modal-content .form-viewer {
  min-height: auto;
  padding: 2rem;
}

.preview-modal-content .form-container {
  margin: 0 auto;
}

/* Options Manager Styles */
.options-manager {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.option-label,
.option-value {
  flex: 1;
  min-width: 0;
}

.option-label {
  flex: 1.2;
}

.option-value {
  flex: 1;
}

.remove-option-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #dc2626;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.remove-option-btn:hover {
  background: #dc2626;
  color: white;
}

.add-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.add-option-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

/* Options Interface Improvements */
.options-explanation {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.options-explanation small {
  color: #64748b;
  line-height: 1.4;
}

.options-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px 6px 0 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.header-label {
  flex: 1.2;
}

.header-value {
  flex: 1;
}

.header-action {
  width: 32px;
  flex-shrink: 0;
}

/* Conditional Display Settings */
.conditional-settings {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.conditional-header {
  margin-bottom: 1rem;
}

.conditional-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.conditional-header small {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .option-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .option-label,
  .option-value {
    width: 100%;
  }
  
  .remove-option-btn {
    align-self: flex-end;
  }
  
  .preview-modal {
    width: 100%;
    height: 100%;
    border-radius: 0;
    max-width: none;
    max-height: none;
  }
  
  .preview-modal-header {
    padding: 1rem;
  }
  
  .preview-actions {
    gap: 0.5rem;
  }
  
  .preview-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .preview-btn span {
    display: none;
  }
}
</style>