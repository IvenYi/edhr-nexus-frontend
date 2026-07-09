<template>
  <div :class="[ns.b()]">
    <ModelFieldSelect v-model:value="field" :multiple="true" />
    <FieldTypeEditor :field-info="field" v-model:value="fieldValue" />
  </div>
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { ModelFieldSelect } from '/@online-form/components/model-field-select';
  import { FieldTypeEditor } from '/@online-form/components/field-type-editor';
  import { ref } from 'vue';

  const ns = useNamespace('field-test');

  const field = ref();
  const fieldValue = ref();
</script>

<style lang="scss" scoped>
  $field-test: (
    height: auto,
  );

  @include b(field-test) {
    @include set-component-css-var(field-test, $field-test);
    height: getCssVar(field-test, height);
  }
</style>
