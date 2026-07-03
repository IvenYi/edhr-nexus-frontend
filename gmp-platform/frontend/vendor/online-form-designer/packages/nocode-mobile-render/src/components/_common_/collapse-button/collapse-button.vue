<template>
  <div v-if="buttonGroup?.length">
    <van-button
      class="min-w72px"
      :size="size"
      v-for="(btn, index) in showButtons"
      :key="index"
      :type="btn.type || 'primary'"
      @click="onSelect(btn)"
    >
      {{ btn.text }}
    </van-button>
    <van-popover
      v-if="actions?.length"
      :placement="placement"
      v-model:show="showPopover"
      :trigger="trigger"
      :actions="actions"
      @select="onSelect"
    >
      <template #reference>
        <van-button :size="size" class="ml8px!">
          <span class="gct-iconfont icon-ziduan-biaodananniu-quanbuzhedie"></span>
        </van-button>
      </template>
    </van-popover>
  </div>
</template>

<script setup lang="ts">
  import { ref, toRef } from 'vue';
  import type { PopoverPlacement, PopoverTrigger, ButtonSize } from 'vant';
  import type { ButtonAction } from './types';

  const props = withDefaults(
    defineProps<{
      size?: ButtonSize;
      buttonGroup: ButtonAction[];
      displayIndex?: number;
      placement?: PopoverPlacement;
      trigger?: PopoverTrigger;
    }>(),
    {
      size: 'small',
      displayIndex: 1,
      placement: 'bottom-end',
    },
  );
  const showPopover = ref(false);
  const showButtons = toRef(() => props.buttonGroup.filter(e => !e.disabled).slice(0, props.displayIndex));
  const actions = toRef(() => props.buttonGroup.filter(e => !e.disabled).slice(props.displayIndex));
  function onSelect(action) {
    action.callback && action.callback();
    console.log(action);
  }
</script>
<style scoped lang="less"></style>
