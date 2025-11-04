import type { ComputedRef, Ref } from 'vue'
import type { FormColumn } from '@/types/schema'

/**
 * Composable for handling form field value emissions
 * Provides consistent emit behavior across all form elements
 *
 * @param emit - The component's emit function
 * @param column - Reactive form column configuration
 * @param isPreview - Whether the form is in preview mode
 * @returns Methods for emitting value changes
 *
 * @example
 * ```ts
 * const { emitValueChange } = useFormFieldEmit(
 *   emit,
 *   toRef(props, 'column'),
 *   toRef(props, 'isPreview')
 * )
 *
 * const handleInput = () => {
 *   emitValueChange(inputValue.value)
 * }
 * ```
 */
export function useFormFieldEmit(
  emit: (event: 'update-value', name: string, value: unknown) => void,
  column: ComputedRef<FormColumn | undefined> | Ref<FormColumn | undefined>,
  isPreview: ComputedRef<boolean | undefined> | Ref<boolean | undefined>
) {
  /**
   * Emit a value change event if conditions are met
   * Only emits if:
   * - Column has a name property
   * - Not in preview mode
   *
   * @param value - The new value to emit
   */
  const emitValueChange = (value: unknown): void => {
    const columnValue = 'value' in column ? column.value : column
    const previewValue = 'value' in isPreview ? isPreview.value : isPreview

    if (columnValue?.name && !previewValue) {
      emit('update-value', columnValue.name, value)
    }
  }

  return {
    emitValueChange,
  }
}
