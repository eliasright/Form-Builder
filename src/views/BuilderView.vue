<template>
  <div class="builder-view">
    <FormBuilder />
  </div>
</template>

<script setup lang="ts">
import FormBuilder from '@/components/builder/FormBuilder.vue'
</script>

<style scoped>
.builder-view {
  background: var(--p-surface-ground);
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>