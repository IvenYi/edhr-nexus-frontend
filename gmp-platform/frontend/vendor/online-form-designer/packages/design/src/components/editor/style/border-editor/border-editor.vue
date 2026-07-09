<template>
  <div :class="[ns.b()]">
    <BorderRadiu
      v-if="showArea.includes('radius')"
      :class="[ns.e('border-box'), 'mb-16px']"
      v-model:value="borderRadius"
    />
    <BorderBox
      v-if="showArea.includes('basics')"
      :class="[ns.e('border-box')]"
      v-model:value="boxValue"
    />
  </div>
</template>

<script lang="ts" setup>
  import { emitFieldSet, useNamespace } from '@gct/runtime';
  import BorderBox from './border-box.vue';
  import BorderRadiu from './border-radius.vue';
  import { IBorder } from '@gct/base';
  import { computed } from 'vue';
  import { pick } from 'lodash-es';

  const ns = useNamespace('border-editor');

  const props = withDefaults(
    defineProps<{
      value?: IBorder;
      showArea?: Array<'radius' | 'basics'>;
    }>(),
    {
      showArea: () => ['radius', 'basics'],
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: IBorder | undefined): void;
  }>();

  const local = computed(() => {
    const v = props.value;
    const boxValue = v ? pick(v, ['top', 'bottom', 'left', 'right']) : undefined;
    const borderRadius = v
      ? pick(v, ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'])
      : undefined;
    return {
      borderRadius,
      boxValue,
    };
  });

  const { boxValue, borderRadius } = emitFieldSet(local, (k, v, obj) => {
    const result: IBorder = {
      ...(obj.borderRadius || {}),
      ...(obj.boxValue || {}),
    };
    emit('update:value', result);
  });
</script>

<style lang="scss" scoped>
  $border-editor: ();

  @include b(border-editor) {
    @include set-component-css-var(border-editor, $border-editor);

    @include e(border-box) {
    }
  }
</style>
