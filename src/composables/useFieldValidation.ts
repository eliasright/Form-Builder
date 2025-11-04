import { ref, type Ref, type ComputedRef, computed } from 'vue'

/**
 * Validation rules interface
 */
export interface ValidationRules {
  required?: boolean
  customMessage?: string
  [key: string]: any
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * Composable for form field validation
 * Provides reusable validation logic for form elements
 *
 * @param rules - Reactive or computed validation rules
 * @returns Validation methods and state
 *
 * @example
 * ```ts
 * const validation = useFieldValidation(computed(() => config.value.validation))
 *
 * const handleInput = () => {
 *   if (!validation.checkRequired(inputValue.value)) {
 *     return
 *   }
 *   // Continue with other validation...
 * }
 * ```
 */
export function useFieldValidation(
  rules: Ref<ValidationRules> | ComputedRef<ValidationRules>
) {
  const validationError = ref<string>('')

  /**
   * Clear all validation errors
   */
  const clearError = (): void => {
    validationError.value = ''
  }

  /**
   * Check if a value meets the required validation
   * @param value - The value to validate
   * @returns true if valid, false if invalid (sets error message)
   */
  const checkRequired = (value: unknown): boolean => {
    if (!rules.value.required) {
      return true
    }

    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)

    if (isEmpty) {
      validationError.value = rules.value.customMessage || 'This field is required'
      return false
    }

    return true
  }

  /**
   * Check if a string meets minimum length requirements
   * @param value - The string to validate
   * @param minLength - Minimum required length
   * @param message - Optional custom error message
   * @returns true if valid, false if invalid
   */
  const checkMinLength = (
    value: string,
    minLength: number,
    message?: string
  ): boolean => {
    if (!value || value.length >= minLength) {
      return true
    }

    validationError.value = message || `Minimum ${minLength} characters required`
    return false
  }

  /**
   * Check if a string meets maximum length requirements
   * @param value - The string to validate
   * @param maxLength - Maximum allowed length
   * @param message - Optional custom error message
   * @returns true if valid, false if invalid
   */
  const checkMaxLength = (
    value: string,
    maxLength: number,
    message?: string
  ): boolean => {
    if (!value || value.length <= maxLength) {
      return true
    }

    validationError.value = message || `Maximum ${maxLength} characters allowed`
    return false
  }

  /**
   * Check if a value matches a regex pattern
   * @param value - The value to validate
   * @param pattern - Regex pattern to test
   * @param message - Error message if validation fails
   * @returns true if valid, false if invalid
   */
  const checkPattern = (
    value: string,
    pattern: RegExp,
    message: string
  ): boolean => {
    if (!value || pattern.test(value)) {
      return true
    }

    validationError.value = message
    return false
  }

  /**
   * Check if a number is within min/max range
   * @param value - The number to validate
   * @param min - Optional minimum value
   * @param max - Optional maximum value
   * @returns true if valid, false if invalid
   */
  const checkRange = (
    value: number,
    min?: number,
    max?: number
  ): boolean => {
    if (min !== undefined && value < min) {
      validationError.value = `Value must be at least ${min}`
      return false
    }

    if (max !== undefined && value > max) {
      validationError.value = `Value must be at most ${max}`
      return false
    }

    return true
  }

  /**
   * Set a custom error message
   * @param message - The error message to display
   */
  const setError = (message: string): void => {
    validationError.value = message
  }

  /**
   * Check if the field is currently valid
   */
  const isValid = computed(() => validationError.value === '')

  return {
    validationError,
    isValid,
    clearError,
    checkRequired,
    checkMinLength,
    checkMaxLength,
    checkPattern,
    checkRange,
    setError,
  }
}
