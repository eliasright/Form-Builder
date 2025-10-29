<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const isDark = ref<boolean>(false)

const THEME_STORAGE_KEY = 'formbuilder_theme'


const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
  saveTheme()
}

const applyTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
  }
}

const saveTheme = () => {
  localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? 'dark' : 'light')
}

const loadTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
      applyTheme()
    }
  } catch (error) {
    console.error('Error loading theme:', error)
  }
}

onMounted(() => {
  loadTheme()
})
</script>

<template>
  <div class="app-container">
    <div class="custom-menubar">
      <div class="nav-buttons">
        <Button 
          @click="router.push('/builder')"
          :class="{ 'active': $route.path === '/builder' }"
          class="nav-button"
        >
          Builder
        </Button>
        <Button 
          @click="router.push('/render')"
          :class="{ 'active': $route.path === '/render' }"
          class="nav-button"
        >
          Viewer
        </Button>
      </div>
      <Button 
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'" 
        @click="toggleTheme"
        text
        rounded
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      />
    </div>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  height: 100vh;
}

.custom-menubar {
  background: var(--p-surface-card);
  border-bottom: 1px solid var(--p-surface-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
}

.nav-button {
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  background: transparent !important;
  border: 2px solid transparent !important;
  color: var(--p-text-color) !important;
}

.nav-button:hover {
  background: var(--p-primary-50) !important;
  border-color: var(--p-primary-200) !important;
  color: var(--p-primary-700) !important;
}

.nav-button.active {
  background: var(--p-primary-500) !important;
  border-color: var(--p-primary-500) !important;
  color: white !important;
}

.nav-button.active:hover {
  background: var(--p-primary-600) !important;
  border-color: var(--p-primary-600) !important;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.main-content {
  background: var(--p-surface-ground);
  width: 100%;
  height: calc(100vh - 60px);
  margin: 0;
  padding: 0;
}
</style>
