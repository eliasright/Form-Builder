import { computed, type ComputedRef } from 'vue'
import type { FormColumn } from '@/types/schema'
import { deepMerge, deepClone } from '@/utils/helpers'

/**
 * Composable for managing form field configuration
 * Handles merging of default config, column overrides, and prop overrides
 *
 * @param defaultConfig - The base configuration for the form element
 * @param column - Optional FormColumn with configuration from form builder
 * @param overrides - Optional partial config overrides from props
 * @returns Computed reactive configuration object
 *
 * @example
 * ```ts
 * const config = useFormFieldConfig(
 *   defaultConfig,
 *   toRef(props, 'column'),
 *   toRef(props, 'overrides')
 * )
 * ```
 */
export function useFormFieldConfig<T extends Record<string, any>>(
  defaultConfig: T,
  column?: ComputedRef<FormColumn | undefined> | FormColumn,
  overrides?: ComputedRef<Partial<T> | undefined> | Partial<T>
): ComputedRef<T> {
  return computed(() => {
    // Start with a deep clone of the default config
    let merged = deepClone(defaultConfig)

    // Apply column-based overrides if present
    const columnValue = typeof column === 'object' && 'value' in column ? column.value : column
    if (columnValue) {
      // Map FormColumn properties to config structure
      if (columnValue.label !== undefined && 'label' in merged) {
        ;(merged as any).label = columnValue.label
      }
      if (columnValue.placeholder !== undefined && 'placeholder' in merged) {
        ;(merged as any).placeholder = columnValue.placeholder
      }
      if (columnValue.description !== undefined && 'description' in merged) {
        ;(merged as any).description = columnValue.description
      }
      if (columnValue.validation !== undefined && 'validation' in merged) {
        ;(merged as any).validation = columnValue.validation
      }
      if (columnValue.props !== undefined && 'props' in merged) {
        ;(merged as any).props = columnValue.props
      }
    }

    // Apply direct overrides last (highest priority)
    const overridesValue = typeof overrides === 'object' && 'value' in overrides ? overrides.value : overrides
    if (overridesValue) {
      merged = deepMerge(merged, overridesValue)
    }

    return merged
  })
}
