<template>
  <form-design>
    <template #default="args">
      <slot v-bind="args"></slot>
    </template>
  </form-design>
</template>

<script setup lang="ts" name="gct-form-process">
  import formDesign from '../form/form-design.vue';
</script>
<style scoped lang="less"></style>
