# Dynamic Form Builder

A full-featured form builder built from scratch with Vue 3, TypeScript, and PrimeVue. This project demonstrates dynamic form generation with drag-and-drop interface, conditional logic, and JSON schema-based architecture.

**The Challenge:** Build a production-quality form builder that non-technical users can actually use. Include conditional logic, validation, and proper TypeScript type safety throughout the entire codebase.

**Why build from scratch?** To understand the architecture and challenges of building a complex, stateful UI application. Libraries like Vueform exist and work great, but building this taught me how they work under the hood and exposed design patterns I wouldn't have learned otherwise.

## Key Features

- **14+ form element types** including text inputs, numbers, dates, file uploads, selections, and layout elements
- **Drag and drop builder** with visual editor
- **Conditional logic** to show/hide fields based on user input
- **Built-in validation** with custom error messages
- **Dark mode** support
- **Fully responsive** design for desktop and mobile
- **Zero `any` types** - 100% type-safe TypeScript implementation
- **Export/Import** forms as JSON schemas

## What It Does

### The Builder Experience
Imagine being able to drag form elements onto a canvas, configure them with a settings panel, and instantly see your form come to life. That's exactly what this does:

- **Drag & Drop Interface** - Grab elements from the sidebar and drop them where you want
- **Live Configuration** - Click any element to edit its properties in real-time
- **Visual Feedback** - See exactly what your users will see as you build
- **Schema Export** - Save your work as JSON to use anywhere

### Form Elements (14+ types)
- **Text Inputs**: Single-line text, multi-line textarea, email, phone numbers
- **Numbers**: With min/max validation and decimal support
- **Choices**: Radio buttons, select dropdowns, multi-select checkboxes
- **Advanced**: Date pickers with custom formats, image upload with preview
- **Layout**: Headings, paragraphs, and dividers to structure forms

### Advanced Features
- **Conditional Logic**: Show/hide fields based on other field values
- **Smart Validation**: Required fields, format validation, custom error messages
- **Import/Export**: Save forms to localStorage or download as JSON
- **Dark Mode**: Light and dark theme support
- **Responsive**: Works on phones, tablets, and desktops

## Tech Stack & Why I Chose It

- **Vue 3 (Composition API)**: Modern reactivity system with clean state management patterns
- **TypeScript**: Zero `any` types in the entire codebase. Full type safety throughout.
- **PrimeVue**: Professional UI component library for inputs, buttons, and modals
- **VueDraggable**: Handles drag-and-drop functionality
- **Vite**: Fast dev server and build tool

### Code Quality
TypeScript implementation follows strict patterns:
- Proper interfaces for all form schemas and components
- Shared utility functions with generic types
- Zero `any` types in the entire codebase
- Extracted duplicate logic into reusable helper functions

## How It Works Under the Hood

The entire form is defined as JSON. This was a key design decision - I wanted forms to be portable, versionable, and easy to store in a database. Here's what a simple form looks like:

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
The conditional logic was tricky to get right, but here's how it works:
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
This field only shows up when `leave_type` equals "full_day". Simple but powerful!

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

### What You'll Need
- Node.js (version 20.19+ or 22.12+) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- Docker (optional, if you prefer containerized development)

### Quick Start

#### Option 1: Local Development (Recommended)
```bash
# Clone this repo
git clone <repository-url>
cd form-builder

# Install dependencies
npm install

# Fire up the dev server
npm run dev
# Open http://localhost:5173 in your browser

# Build for production
npm run build
```

#### Option 2: Docker Development
```bash
# Clone the repository
git clone <repository-url>
cd form-builder

# Start development server with Docker
docker-compose --profile development up form-builder-dev

# Or build and run production container
docker-compose up form-builder
```

### Docker Commands
```bash
# Build and start production container
docker-compose up -d

# Start development environment
docker-compose --profile development up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose build --no-cache
```

### Usage

**Builder Mode** (http://localhost:5173/builder):
1. Drag elements from the left sidebar onto the canvas
2. Click any element to configure it in the right sidebar
3. Reorder elements by dragging
4. Use the menu to save, load, or export as JSON

**Viewer Mode** (http://localhost:5173/render):
1. Import a schema or use the default example
2. Fill out the form as an end user
3. Submit to see form data in console

## Design Decisions & What I Learned

### Why JSON Schemas?
I needed a way to represent forms that was both human-readable and machine-parseable. JSON schemas let you version control your forms, store them in a database, and even generate forms programmatically. Plus, they're language-agnostic - you could use these schemas with React, Angular, or anything else.

### The Component Architecture Challenge
Here's what I struggled with: each form element (text input, dropdown, etc.) needed to handle:
- Rendering in builder mode vs. viewer mode
- Managing its own validation state
- Exposing a settings interface
- Handling value updates

My solution? Each element is a self-contained Vue component with its own config object. This made the codebase way more maintainable than having one giant form component.

### TypeScript Implementation
Spent significant time on proper types. Zero `any` types in the codebase. This caught bugs at compile-time and made refactoring safer. The IDE autocomplete also sped up development significantly.

### UX Decisions
- **Visual Feedback**: Clear hover, active, and drag states so users know what's interactive
- **Mobile-First Sidebar**: Settings panel slides up from bottom on mobile instead of fixed sidebar
- **Instant Validation**: Fields validate on input, not just on submit
- **Dark Mode**: Theme support for user preference

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

## Future Improvements

Given more time, these would be the next additions:

- **Backend Integration**: API submission and database persistence
- **Advanced Validation**: Custom regex patterns, cross-field validation
- **Multi-Step Forms**: Wizard-style forms with progress indicators
- **Form Analytics**: Completion rate tracking and drop-off analysis
- **Templates**: Pre-built forms for common use cases
- **Team Collaboration**: Real-time multi-user editing
- **Accessibility**: Screen reader support, keyboard navigation, ARIA labels

## Production Considerations

For production applications, established solutions like [Vueform](https://vueform.com/), [FormKit](https://formkit.com/), or [SurveyJS](https://surveyjs.io/) would be more appropriate. They offer extensive documentation, active maintenance, and battle-tested reliability.

That said, building this from scratch provided valuable learning:
- How drag-and-drop systems work internally
- Complex state management patterns in Vue
- Structuring large TypeScript projects
- Building truly reusable component architectures
- Why abstraction matters (the shared utility functions eliminated hundreds of lines of duplicate code)

---

This project demonstrates Vue 3, TypeScript, and modern frontend development practices in the context of building a complex, stateful application.