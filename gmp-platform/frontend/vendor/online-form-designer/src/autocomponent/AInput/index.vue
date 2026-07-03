<template>
  <ant-input
    ref="inputRef"
    @blur="blurEvent"
    :allow-clear="props.allowClear !== false"
    @focus="focusEvent"
    :showCount="showCount"
    autocomplete="off"
    v-model:value="value"
    :class="{ 'gct-hidden-input-icon': !isAllowClear }"
  >
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </ant-input>
</template>

<script setup lang="ts">
  import { Input as antInput } from 'ant-design-vue';
  import { ref, computed, toRef, onMounted } from 'vue';
  //  allowClear和 showCount 不能同时为true
  const props = withDefaults(
    defineProps<{ allowClear?: boolean; showCount?: boolean; value?: string }>(),
    {
      allowClear: undefined,
      showCount: false,
      value: undefined,
    },
  );
  const emit = defineEmits(['blur', 'focus', 'update:value']);

  const value = computed({
    get() {
      return props.value;
    },
    set(v) {
      emit('update:value', v);
    },
  });
  const focusStatus = ref(false);

  const inputRef = ref();

  const blurEvent = (...arg) => {
    focusStatus.value = false;
    emit('blur', ...arg);
    emit('update:value', typeof value?.value === 'string' ? value?.value?.trim() : value?.value);
  };
  const focusEvent = (...arg) => {
    focusStatus.value = true;
    emit('focus', ...arg);
  };
  const isAllowClear = computed(() => {
    if (props.allowClear === false) {
      return false;
    }
    return focusStatus.value;
  });
  const showCount = toRef(() => {
    return props.showCount && !isAllowClear.value;
  });
  onMounted(() => {
    for (let i in inputRef.value) {
      exposedMethods[i] = inputRef.value[i];
    }
  });
  const exposedMethods = {};
  defineExpose(exposedMethods);
</script>
<style lang="less">
  // 失焦的时候隐藏删除按钮
  .gct-hidden-input-icon {
    .anticon-close-circle {
      visibility: hidden;
    }
  }

  .ant-input-suffix {
    // position: relative;
    transform: translate(0, 0);
    margin: 0;
  }

  .ant-input-clear-icon-has-suffix.ant-input-clear-icon::after {
    content: '';
    display: block;
    position: absolute;
    z-index: -1;
    inset: 0;
    // background: red;
  }
</style>
