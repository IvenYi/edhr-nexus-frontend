<template>
  <div class="range-box">
    <a-input-number
      :value="rangeMin"
      @change="handleMinChange"
      :min="0"
      :max="startMax"
      :precision="precision"
      :placeholder="`${t('sys.model.pleaseInputMin')}${placeholderType}`"
    />
    <div class="text">
      <slot name="middle-text">{{ $t('sys.webRender.to') }}</slot>
    </div>
    <a-input-number
      :value="rangeMax"
      @change="handleMaxChange"
      :min="0"
      :max="endMax"
      :precision="precision"
      :placeholder="`${t('sys.model.pleaseInputMax')}${placeholderType}`"
    />
  </div>
</template>
<script setup lang="ts">
  import { PropType, computed } from 'vue';
  import t from './i18n';
  // 解决自定义组件的警告
  // import { Form } from 'ant-design-vue';

  // const formItemContext = Form.useInjectFormItemContext();
  type RangeNumber = number | undefined;
  type MaxObjProp = Object | undefined;

  const props = defineProps({
    rangeMin: { type: [Number, undefined] as PropType<RangeNumber>, default: undefined },
    rangeMax: { type: [Number, undefined] as PropType<RangeNumber>, default: undefined },
    disabled: { type: Boolean, default: false },
    precision: { type: Number, default: 0 },
    maxObj: { type: [Object, undefined] as PropType<MaxObjProp>, default: undefined },
    placeholderType: { type: String, default: t('sys.model.value') },
  });

  const startMax = computed(() => {
    return props.maxObj ? props.maxObj['start'] : undefined;
  });

  const endMax = computed(() => {
    return props.maxObj ? props.maxObj['end'] : undefined;
  });

  const handleMinChange = (val) => {
    emit('update:rangeMin', val);
    emit('change', val);
  };

  const handleMaxChange = (val) => {
    emit('update:rangeMax', val);
    emit('change', val);
  };

  const emit = defineEmits(['update:rangeMin', 'update:rangeMax', 'change']);
</script>

<style lang="less" scoped>
  .range-box {
    display: flex;
    align-items: center;

    .text {
      width: 90px;
      text-align: center;
    }
  }
</style>
