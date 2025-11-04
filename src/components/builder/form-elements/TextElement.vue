<template>
  <div class="text-element">
    <label v-if="config.label.show" class="element-label">
      {{ config.label.value }}
      <span v-if="config.validation.required" class="required-indicator">*</span>
    </label>

    <div v-if="config.description.show && config.description.value" class="element-description">
      {{ config.description.value }}
    </div>

    <div class="input-wrapper">
      <input
        v-model="inputValue"
        type="text"
        :placeholder="config.placeholder.value"
        :required="config.validation.required"
        :minlength="config.validation.minLength"
        :maxlength="config.validation.maxLength"
        :disabled="false"
        :class="[
          'form-input',
          {
            'has-error': validationError,
            'is-valid': isValid && inputValue,
          },
        ]"
        @input="handleInput"
        @blur="validateInput"
      />

      <!-- Success checkmark inside input -->
      <div v-if="isValid && inputValue && !validationError" class="success-indicator"></div>

      <div v-if="config.validation.maxLength" class="character-count">
        {{ inputValue.length }}/{{ config.validation.maxLength }}
      </div>
    </div>

    <div v-if="validationError" class="error-message">
      {{ validationError }}
    </div>

    <small v-if="config.helpText.show && config.helpText.value" class="help-text">
      {{ config.helpText.value }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import type { FormColumn } from '@/types/schema'
import { useFormFieldConfig } from '@/composables/useFormFieldConfig'
import { useFieldValidation } from '@/composables/useFieldValidation'
import { useFormFieldEmit } from '@/composables/useFormFieldEmit'
import { textElementConfig } from '@/config/elements/textElement'

// Props interface
interface Props {
  overrides?: Partial<typeof textElementConfig>
  isPreview?: boolean
  column?: FormColumn
  formData?: Record<string, unknown>
}

// Emits
const emit = defineEmits<{
  'update-value': [fieldName: string, value: string]
}>()

const props = defineProps<Props>()

// Use composables
const config = useFormFieldConfig(
  textElementConfig,
  toRef(() => props.column),
  toRef(() => props.overrides)
)

const validation = useFieldValidation(computed(() => config.value.validation))
const { emitValueChange } = useFormFieldEmit(
  emit,
  toRef(() => props.column),
  toRef(() => props.isPreview)
)

// Component state
const inputValue = ref('')
const { validationError } = validation

// Computed validation
const isValid = computed(() => {
  if (!inputValue.value) return false

  const val = config.value.validation

  // Check pattern if specified
  if (val.pattern) {
    const regex = new RegExp(val.pattern)
    if (!regex.test(inputValue.value)) return false
  }

  // Check length constraints
  if (inputValue.value.length < val.minLength) return false
  if (val.maxLength && inputValue.value.length > val.maxLength) return false

  return true
})

// Event handlers
const handleInput = () => {
  emitValueChange(inputValue.value)
  validateInput()
}

const validateInput = () => {
  validation.clearError()

  // Required check
  if (!validation.checkRequired(inputValue.value)) {
    return
  }

  if (!inputValue.value) return

  // Length validation
  if (!validation.checkMinLength(inputValue.value, config.value.validation.minLength)) {
    return
  }

  if (
    config.value.validation.maxLength &&
    !validation.checkMaxLength(inputValue.value, config.value.validation.maxLength)
  ) {
    return
  }

  // Pattern validation
  if (config.value.validation.pattern) {
    const regex = new RegExp(config.value.validation.pattern)
    if (
      !validation.checkPattern(
        inputValue.value,
        regex,
        config.value.validation.customMessage || 'Invalid format'
      )
    ) {
      return
    }
  }
}
</script>

<script lang="ts">
// Export configuration for form builder
export { textElementConfig as elementConfig, generateTextElementSettings as generateSettings } from '@/config/elements/textElement'
</script>

<style scoped>
.text-element {
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

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.1);
}

.form-input.has-error {
  border-color: var(--text-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-input.is-valid {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.success-indicator {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #10b981;
  font-size: 1.25rem;
  pointer-events: none;
}

.success-indicator::before {
  content: '✓';
  font-weight: bold;
}

.character-count {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
  background-color: var(--bg-primary);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
}

.form-input.is-valid ~ .character-count {
  right: 2.75rem;
}

.error-message {
  color: var(--text-danger);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.help-text {
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>
