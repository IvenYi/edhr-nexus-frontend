<template>
  <div :class="[ns.b(), showEmpty ? ns.m('empty') : ns.m('default')]">
    <span v-if="showEmpty"> {{ emptyText }}</span>
    <div :class="ns.e('content')" v-else>
      <div :class="ns.e('label-wrapper')" :title="label">
        <i v-show="icon" :class="['iconfont', ns.e('icon'), icon]"></i>
        <span :class="[ns.e('label')]">{{ label }}</span>
      </div>
      <close-outlined v-if="!disabled" :class="[ns.e('remove')]" @click="handleRemoveClick" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';

  const ns = {
    b: () => 'gct-single-drop',
    e: (element: string) => `gct-single-drop__${element}`,
    m: (modifier: string) => `gct-single-drop--${modifier}`,
  };

  const props = withDefaults(
    defineProps<{
      label?: string;
      icon?: string;
      emptyText?: string;
      disabled?: boolean;
    }>(),
    {
      emptyText: $t('sys.onlineForm.dragFieldNeedingBinding'),
    },
  );

  const showEmpty = computed(() => {
    return !props.label;
  });

  const emit = defineEmits(['clear']);

  function handleRemoveClick() {
    emit('clear');
  }
</script>

<style lang="scss" scoped>
  @include b(single-drop) {
    user-select: none;
    border-radius: 4px 4px 4px 4px;
    font-size: 12px;
    height: 32px;
    line-height: 1;
    @include m(empty) {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c3c3c3;
      background: #fbfbfc;
      border: 1px dashed #e0e3ea;
    }

    @include m(default) {
      color: #666666;
      background: #ffffff;
      border: 1px solid #e6e6e6;
      padding: 3px;
    }

    @include e(content) {
      background: #f0f0f0;
      border-radius: 4px 4px 4px 4px;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }

    @include e(label) {
      vertical-align: middle;
    }

    @include e(icon) {
      margin-right: 4px;
      vertical-align: middle;
    }

    @include e(remove) {
      vertical-align: middle;
    }

    @include e(label-wrapper) {
      width: 1px;
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>
