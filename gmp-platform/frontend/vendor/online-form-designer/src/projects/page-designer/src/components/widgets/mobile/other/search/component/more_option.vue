<template>
  <van-popover
    v-if="!!moreOptions?.length"
    v-model:show="show"
    placement="bottom-end"
    teleport="body"
    class="pad-search-more-option-popover"
    :disabled="disabled"
    trigger="manual"
    :actions="columns"
    @select="onSelect"
    @close="onClose"
  >
    <template #reference>
      <div class="pad-search-more-option-reference">
        <van-button
          type="default"
          size="small"
          :disabled="disabled"
          :class="{ checkedMoreOption: !!useMore, more_button: true, 'has-click': show }"
          @click="handleButtonClick"
        >
          <span class="icon gct-iconfont icon-shaixuan-chaxun"></span>
        </van-button>
      </div>
    </template>
    <template #action="{ action }">
      <div
        v-if="action.value == 'clear'"
        :class="['ks-row-middle', 'w100%', 'clear-filter', { 'cancel-disabled': !useMore }]"
      >
        <i class="icon gct-iconfont icon-qingchushaixuan mr-5px"></i>
        <div class="ks-col"> {{ action.text }}</div>
      </div>
      <div v-else :class="{ 'primary-gct ': action.value === useMore }" class="ks-row-middle w100%">
        <div class="ks-col"> {{ action.text }}</div>
        <van-icon name="success" class="text-18px primary-color" v-if="action.value === useMore" />
      </div>
    </template>
  </van-popover>
</template>

<script setup lang="ts" name="more-option">
  import { ref, computed } from 'vue';
  import { useI18n } from '@mobile/utils/useI18n';
  import { SEARCH_TYPE } from '/@page-designer/schema/common';
  import { FIELD_TYPE } from '@gct/runtime';

  const { t } = useI18n();
  const props = defineProps<{
    useMore?: string;
    moreOptions: any[];
    ope: any[];
    fieldType?: FIELD_TYPE;
    disabled: boolean;
  }>();
  const emit = defineEmits(['update:ope', 'update:useMore', 'change', 'clear']);

  const show = ref(false);
  const isFixed = ref(false);
  const isHoveringPopover = ref(false);

  const columns = computed(() => {
    const mores = props.moreOptions.map((key) => {
      return {
        text: t(`sys.model.${key}`),
        value: key,
      };
    });
    // const options = props.useMore ? mores.filter((i) => i.value == props.useMore) : mores;
    const list = [
      ...mores,
      {
        text: t('sys.model.clearFilter'),
        value: 'clear',
      },
    ];
    return list;
  });

  const handleButtonClick = () => {
    if (isFixed.value) {
      // 已固定状态下点击，收起popover并取消固定
      show.value = false;
      isFixed.value = false;
    } else {
      // 未固定状态下点击，固定popover
      show.value = props.disabled ? false : true;
      isFixed.value = true;
    }
  };

  const onSelect = (action) => {
    if (action.value == 'clear') {
      emit('update:ope', [...(SEARCH_TYPE[props.fieldType!].default || [])]);
      emit('update:useMore', '');
    } else {
      emit('update:ope', [action.value]);
      emit('update:useMore', action.value);
      emit('clear');
    }
    emit('change');
    // 选择完成后收起popover并取消固定
    show.value = false;
    isFixed.value = false;
    isHoveringPopover.value = false;
  };

  const onClose = () => {
    show.value = false;
    isFixed.value = false;
  };
</script>
<style scoped lang="less">
  .pad-search-more-option-reference {
    display: inline-block;
    // transform: translateY(-1px);
  }

  :deep(.van-popover__action:has(div.clear-filter)) {
    border-top: 1px solid #e0e3eb;
  }

  .cancel-disabled {
    color: #c6c6c6;
  }

  .more_button {
    width: 32px !important;
    height: 32px !important;
    line-height: 30px;
    color: #a6a6a6;
    border-color: var(--gct-color-border);
    .gct-iconfont {
      font-size: 12px;
    }

    &:hover {
      border-color: #f2f5f8;
      background-color: #f2f5f8;
    }
    &.has-click {
      border-color: #f2f5f8;
      background-color: #f2f5f8;
    }
  }
  .checkedMoreOption {
    // background: hsl(from var(--van-primary-color) h s 96%);
    color: var(--van-primary-color);
  }

  :deep(.van-button--disabled) {
    &:hover {
      border-color: var(--gct-color-border);
      background-color: transparent;
    }
  }
</style>
