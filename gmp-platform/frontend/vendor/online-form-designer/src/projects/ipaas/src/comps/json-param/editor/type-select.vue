<template>
  <a-select
    :class="[ns.b()]"
    v-model:value="_value"
    :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
    :disabled="disabled"
  >
    <a-select-option
      v-for="i in _availableTypes"
      :key="i"
      :value="i"
      :title="t(`sys.ipaas.keyType.${i}`)"
    >
      {{ t(`sys.ipaas.keyType.${i}`) }}
    </a-select-option>
  </a-select>
</template>

<script lang="ts" setup name="type-select">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, watch } from 'vue';
  import { AuthKeyTypeEnum } from '/@ipaas/enums';

  const { t } = useI18n();
  const ns = useNamespace('type-select');

  const props = withDefaults(
    defineProps<{
      /** 值 */
      value: AuthKeyTypeEnum;
      /** 可用的类型 */
      availableTypes: AuthKeyTypeEnum[];
      disabled?: boolean;
    }>(),
    {
      value: undefined,
      availableTypes: () => Object.values(AuthKeyTypeEnum),
    },
  );

  const NumberTypes = [
    AuthKeyTypeEnum.Integer,
    AuthKeyTypeEnum.Long,
    AuthKeyTypeEnum.BigDecimal,
  ];

  const _availableTypes = computed(()=>{
    return props.availableTypes.filter(i=>!NumberTypes.includes(i));
  });


  const emit = defineEmits<{
    (e: 'update:value', value: AuthKeyTypeEnum): void;
  }>();



  const _value = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });

  watch(
    () => props.value,
    (v) => {
      if (NumberTypes.includes(v)) {
        emit('update:value', AuthKeyTypeEnum.Number);
      }
    },{
      immediate: true,
    }
  );
</script>

<style lang="scss" scoped>
  $type-select: ();

  @include b(type-select) {
    @include set-component-css-var(type-select, $type-select);
    width: 120px;
  }
</style>
