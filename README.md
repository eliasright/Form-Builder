# Custom Form Builder

This is my attempt at creating a custom form builder and renderer from scratch using Vue 3, TypeScript, and PrimeVue. The project demonstrates dynamic form generation from JSON schemas with a drag-and-drop builder interface.

**Note:** While this implementation showcases custom development capabilities, for production applications I would recommend using established solutions like [Vueform](https://vueform.com/) which is more polished and have extensive community support.

## Features

### Core Functionality
- **Dynamic Form Builder** - Drag-and-drop interface for creating forms
- **JSON Schema-based** - Forms are generated from structured JSON schemas
- **Form Renderer** - Separate view for end-users to fill out forms
- **Real-time Preview** - Instant preview of form changes

### Form Elements (14+ Types)
- **Input Fields**: Text, Number, Email, Phone, Textarea
- **Selection**: Radio buttons, Select dropdowns, Checkboxes
- **Advanced**: Date picker, Image upload
- **Layout**: Headings, Paragraphs, Dividers

### Advanced Features
- **Conditional Logic** - Show/hide fields based on other field values
- **Form Validation** - Required fields and data type validation
- **Import/Export** - Save and load form schemas
- **Theme Support** - Light and dark mode
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Vue 3.5.22 with Composition API
- **Language**: TypeScript for type safety
- **UI Library**: PrimeVue 4.4.1 for professional components
- **Icons**: PrimeIcons for consistent iconography
- **Drag & Drop**: VueDraggable for element reordering
- **Build Tool**: Vite for fast development and building

## Schema Structure

Forms are defined using a flexible JSON schema format:

```json
{
  "name": "contact_form",
  "label": "Contact Information",
  "items": {
    "full_name": {
      "name": "full_name",
      "type": "Text",
      "display": {
        "label": "Full Name"
      },
      "rule": "required",
      "builder": {
        "type": "simple_input"
      },
      "layout": "Normal"
    },
    "email": {
      "name": "email",
      "type": "Email",
      "display": {
        "label": "Email Address",
        "placeholder": "Enter your email"
      },
      "rule": "required",
      "builder": {
        "type": "simple_input"
      }
    }
  }
}
```

### Conditional Logic Example
```json
{
  "leave_days": {
    "type": "Number",
    "display": {
      "label": "Number of Days"
    },
    "visible": {
      "leave_type": "required|is:full_day"
    }
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── builder/                 # Form builder components
│   │   ├── FormBuilder.vue     # Main builder interface
│   │   ├── AddElementSidebar.vue
│   │   ├── ElementSettingsSidebar.vue
│   │   └── form-elements/      # Individual form elements
│   │       ├── TextElement.vue
│   │       ├── NumberInputElement.vue
│   │       ├── SelectElement.vue
│   │       └── ... (14+ elements)
│   └── FormViewer.vue          # Form renderer
├── types/
│   └── schema.ts               # TypeScript interfaces
├── views/
│   ├── BuilderView.vue         # Builder page
│   └── RenderView.vue          # Form viewer page
└── router/
    └── index.ts                # Vue Router configuration
```

## Getting Started

### Prerequisites
- Node.js ^20.19.0 || >=22.12.0
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd form-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Builder Mode** (`/builder`):
   - Drag elements from the left panel to the form canvas
   - Configure element properties in the right panel
   - Reorder elements by dragging within the form
   - Save/load schemas using the dropdown menu

2. **Viewer Mode** (`/render`):
   - Import a schema or use the default example
   - Fill out the form as an end-user would
   - Submit to see form data output

## Design Decisions

### Schema Design
- **Flexibility**: Schema supports both simple and complex field configurations
- **Extensibility**: Easy to add new field types and properties
- **Validation**: Built-in support for required fields and data constraints
- **Conditional Logic**: Show/hide fields based on other field values

### Architecture Choices
- **Component Separation**: Each form element is its own component for maintainability
- **TypeScript**: Full type safety for better development experience
- **PrimeVue**: Professional UI components reduce custom CSS needs
- **Composition API**: Modern Vue 3 patterns for better code organization

### UX/UI Considerations
- **Drag & Drop**: Intuitive builder interface for non-technical users
- **Visual Feedback**: Clear hover states and active element highlighting
- **Responsive**: Works on both desktop and mobile devices
- **Theme Support**: Light/dark mode for user preference

## Deployment

The project includes configuration for multiple deployment platforms:

- **Vercel**: `vercel.json` configuration included
- **Netlify**: `netlify.toml` configuration included
- **Static Hosting**: Built files in `dist/` folder

```bash
# Build for deployment
npm run build

# Preview production build
npm run preview
```

## Future Enhancements

- Form submission to backend APIs
- Advanced validation rules (regex patterns, custom validators)
- Form analytics and submission tracking
- Multi-step form support
- Form templates and presets
- Collaboration features for team editing

## Production Considerations

While this custom implementation demonstrates full-stack form building capabilities, for production applications I would recommend:

- **[Vueform](https://vueform.com/)** - Comprehensive Vue form builder with extensive features
- **[FormKit](https://formkit.com/)** - Modern form framework with excellent DX
- **[Vue Formulate](https://vueformulate.com/)** - Mature Vue form library

These solutions offer:
- Extensive documentation and community support
- Advanced validation and internationalization
- Accessibility compliance out of the box
- Professional support and maintenance
- Battle-tested reliability in production environments

---

*This project serves as a technical demonstration of Vue 3, TypeScript, and modern frontend development practices in the context of dynamic form generation.*