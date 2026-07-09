<template>
  <a-dropdown
    v-if="!!moreOptions?.length"
    :trigger="['click']"
    v-model:visible="visible"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- <a-tooltip placement="left" v-if="useMore">
      <template #title>{{ label + t(`sys.model.${useMore}`) }}</template>
      <a class="ml2 iconfont icon-shezhi" @click.prevent> </a>
    </a-tooltip> -->
    <div
      :class="[
        'more-icon-box',
        'ml-4px',
        'px-5px',
        'h-32px',
        { 'has-click': visible, 'more--disabled': disabled },
      ]"
    >
      <span
        :class="['icon', 'gct-iconfont', 'icon-shaixuan-chaxun', { 'has-more': useMore }]"
        @click.prevent
      >
      </span>
    </div>
    <template #overlay>
      <a-menu :disabled="disabled">
        <a-menu-item
          v-for="i in moreOptions"
          :key="i"
          :class="useMore == i ? 'more-checked' : ''"
          @click="setope(i)"
        >
          <a>{{ t(`sys.model.${i}`) }}</a>
        </a-menu-item>
        <a-menu-item :class="['more-cancel', { 'cancel-disabled': !useMore }]" @click="setope()">
          <i class="icon gct-iconfont icon-qingchushaixuan text-2xl mr-5px"></i>
          <a>{{ t(`sys.model.clearFilter`) }}</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ref, computed } from 'vue';

  const { t } = useI18n();
  var opecatch: any = null;
  const props = defineProps<{
    useMore?: string;
    moreOptions: any[];
    ope: any[];
    label: any;
    disabled: boolean;
  }>();
  const emit = defineEmits(['update:ope', 'update:useMore', 'clear', 'change']);
  const visible = ref<boolean>(false);

  // const options = computed(() => {
  //   return props.useMore
  //     ? props.moreOptions.filter((i: string) => i == props.useMore)
  //     : props.moreOptions;
  // });

  function setope(type?: string) {
    if (!type) {
      emit('update:ope', opecatch);
      emit('update:useMore', '');
      opecatch = null;
    } else {
      opecatch = props.ope;
      emit('update:ope', [type]);
      emit('update:useMore', type);
      emit('clear');
    }
    emit('change');
    visible.value = false;
  }

  function handleClick() {
    visible.value = props.disabled ? false : true;
  }
</script>

<style scoped lang="less">
  .more-icon-box {
    line-height: 32px;
    border-radius: 4px;
    color: #a6a6a6;
    span {
      cursor: pointer;
      font-size: 12px !important;
    }
    &:hover {
      background: #f2f5f8;
      color: #5a5f6b;
    }
    &.has-click {
      background: #f2f5f8;
      color: #5a5f6b;
    }
    &.more--disabled {
      opacity: 0.5;
      span {
        cursor: not-allowed !important;
      }
      &:hover {
        background: transparent;
        color: #a6a6a6;
      }
    }
  }
  .has-more {
    color: var(--ant-primary-color);
  }
  :deep(.ant-dropdown-menu) {
    padding-bottom: 0 !important;
  }
  :deep(.ant-dropdown-menu-item) {
    width: 120px;
    &.more-checked {
      font-weight: bold;
      background: rgba(from var(--ant-primary-color) r g b / 10%);
    }
    &.more-cancel {
      margin-top: 4px;
      border-top: 1px solid #e0e3eb;
      padding: 10px 12px;
      &:hover {
        background: transparent;
      }
      &.cancel-disabled {
        color: #c6c6c6;
      }
      .gct-iconfont {
        font-size: 14px;
      }
    }
  }
  .gct-iconfont {
    opacity: 1 !important;
  }
</style>
