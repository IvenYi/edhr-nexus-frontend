<template>
  <a-select :class="[ns.b()]" v-model:value="_value" placeholder="请选择" :disabled="disabled">
    <a-select-option
      v-for="i in options"
      :key="i"
      :value="i"
      :title="t(`sys.ipaas.paramType.${i}`)"
    >
      {{ t(`sys.ipaas.paramType.${i}`) }}
    </a-select-option>
  </a-select>
</template>

<script lang="ts" setup name="param-select">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { ParamTypeEnum } from '/@ipaas/enums';

  const { t } = useI18n();
  const ns = useNamespace('param-select');

  const props = withDefaults(
    defineProps<{
      /** 值 */
      value: ParamTypeEnum;
      disabled?: boolean;
    }>(),
    {
      value: undefined,
    },
  );

  const options = Object.values(ParamTypeEnum);

  const emit = defineEmits<{
    (e: 'update:value', value: ParamTypeEnum): void;
  }>();

  const _value = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });
</script>

<style lang="scss" scoped>
  $param-select: ();

  @include b(param-select) {
    @include set-component-css-var(param-select, $param-select);
    width: 120px;
  }
</style>
