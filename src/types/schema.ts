// Assignment-compliant schema interfaces
export interface FieldDisplay {
  label: string
  placeholder?: string
}

export interface FieldProps {
  maxlength?: number
  rows?: number
  autoResize?: boolean
  spellcheck?: boolean
  inputType?: string
  autocomplete?: string
  inputMode?: string
  defaultCountry?: string
  allowedCountries?: string[]
  maxSize?: number
  allowedTypes?: string[]
  options?: Array<{ label: string; value: string }>
  multiple?: boolean
  level?: number
  text?: string
  style?: string
}

export interface FieldBuilder {
  type: 'simple_input' | 'simple_choice' | 'simple_select' | 'simple_textarea' | 'simple_number' | 'heading' | 'paragraph' | 'divider'
}

export interface ValueConstraints {
  maximum?: number
  minimum?: number
  allow_decimal?: number
}

export interface VisibilityCondition {
  [fieldName: string]: string // e.g., "required|is:full"
}

export interface PrefillValue {
  value: string | number
}

export interface FormField {
  name: string
  display: FieldDisplay
  rule?: string
  props?: FieldProps
  builder: FieldBuilder
  layout: string
  type: 'Text' | 'Number' | 'Radio' | 'Select' | 'Textarea' | 'Email' | 'Phone' | 'Date' | 'Heading' | 'Paragraph' | 'Divider'
  enum?: Array<{ label: string; value: string }>
  prefill?: PrefillValue
  value_constraints?: ValueConstraints
  visible?: VisibilityCondition
}

export interface FormSchema {
  name: string
  label: string
  items: Record<string, FormField>
}

// Legacy interfaces for backwards compatibility (will be phased out)
export interface FormValidation {
  required: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  min?: number
  max?: number
  allowDecimal?: boolean
}

export interface FormElementProps {
  [key: string]: any // More flexible props interface
}

export interface ConditionalDisplay {
  field: string // field name to check
  condition: 'equals' | 'not_equals' | 'contains' | 'not_empty' | 'empty'
  value: string // value to compare against
}

export interface FormColumn {
  id: string
  name?: string // field name for referencing in conditions
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'radio' | 'select' | 'checkbox' | 'calendar' | 'image' | 'heading' | 'paragraph' | 'divider'
  label: string | { show: boolean; value: string; defaultValue: string; editable: boolean }
  placeholder: string | { show: boolean; value: string; defaultValue: string; editable: boolean }
  validation: FormValidation
  width: number
  props?: FormElementProps
  options?: Array<{ label: string; value: string }>
  defaultValue?: string | number
  conditionalDisplay?: ConditionalDisplay
}

export interface FormRow {
  id: string
  type: 'row'
  order: number
  columns: FormColumn[]
}

export interface FormLayout {
  type: 'grid'
  maxColumns: number
  gap: 'sm' | 'md' | 'lg'
}

export interface FormMeta {
  name: string
  description: string
  version: string
}

export interface LegacyFormSchema {
  id: string
  meta: FormMeta
  layout: FormLayout
  fields: FormRow[]
}

export interface BuilderState {
  schema: LegacyFormSchema
  selectedElement: string | null
  draggedElement: string | null
  activeRow: string | null
}

export interface ElementType {
  type: string
  label: string
  icon: string
}