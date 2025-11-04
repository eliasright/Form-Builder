# Dynamic Form Builder

A production-ready form builder built with Vue 3, TypeScript, and PrimeVue. Create dynamic forms with drag-and-drop, conditional logic, and JSON schema-based architecture.

## Tech Stack

- **Vue 3 (Composition API)** - Modern reactivity with clean state management
- **TypeScript** - Strict type safety throughout
- **PrimeVue** - Professional UI components
- **VueDraggable** - Drag-and-drop functionality
- **Vite** - Fast dev server and build tool

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm (comes with Node.js)

### Local Development
```bash
# Clone and install
git clone <repository-url>
cd form-builder
npm install

# Start dev server
npm run dev
# Open http://localhost:5173

# Build for production
npm run build
```

### Docker Development
```bash
# Development server
docker-compose --profile development up form-builder-dev

# Production build
docker-compose up form-builder
```

## Usage

**Builder Mode** (`/builder`):
- Drag elements from sidebar onto canvas
- Click any element to configure settings
- Save, load, or export forms as JSON

**Viewer Mode** (`/render`):
- Import a schema or use the example
- Fill out the form as an end user
- View and download submission results

## How It Works

Forms are defined as portable JSON schemas. Example:

```json
{
  "meta": {
    "name": "Contact Form",
    "description": "Get in touch"
  },
  "fields": [
    {
      "type": "text",
      "label": { "value": "Full Name" },
      "validation": { "required": true }
    },
    {
      "type": "email",
      "label": { "value": "Email" },
      "validation": { "required": true }
    }
  ]
}
```

### Conditional Logic
Fields can be shown/hidden based on other field values:

```json
{
  "type": "number",
  "label": { "value": "Number of Days" },
  "conditionalDisplay": {
    "field": "leave_type",
    "condition": "equals",
    "value": "Full Day"
  }
}
```