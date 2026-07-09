<template>
  <div class="radius-box">
    <div class="radius-div">
      <div class="radius-div-inner">
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.upLeft') }}</template>
          <div
            class="upLeftGround ground"
            :class="{ highlight: pos === 'upLeft' }"
            @click="pos = 'upLeft'"
          ></div>
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.upRight') }}</template>
          <div
            class="upRightGround ground"
            :class="{ highlight: pos === 'upRight' }"
            @click="pos = 'upRight'"
          ></div>
        </a-tooltip>
        <!-- <div class="downLeft" v-if="pos === 'downLeft'"></div> -->
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.downLeft') }}</template>
          <div
            class="downLeftGround ground"
            :class="{ highlight: pos === 'downLeft' }"
            @click="pos = 'downLeft'"
          ></div>
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.downRight') }}</template>
          <div
            class="downRightGround ground"
            :class="{ highlight: pos === 'downRight' }"
            @click="pos = 'downRight'"
          ></div>
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.whole') }}</template>
          <div class="centerGround" :class="{ highlight: pos === 'all' }" @click="pos = 'all'">
          </div>
        </a-tooltip>
      </div>
    </div>
    <div class="radius-editor">
      <div class="radius-col">
        <span class="radius-text">{{ t('sys.pageDesigner.radius') }}</span>
        <a-auto-complete
          :options="options"
          v-model:value="radiusVal"
          @change="(val) => handleChange(val)"
        >
          <!-- <a-input
            class="radius-input"
            type="number"
            suffix="px"
            v-model:value="radiusVal"
            size="small"
          /> -->
          <a-input-number
            v-model:value="radiusVal"
            :min="0"
            :controls="true"
            :precision="0"
            style="width: 100%"
            size="small"
            addonAfter="px"
            @change="(val) => handleChange(val)"
          />
        </a-auto-complete>
        <!-- <down-outlined class="ant-select-arrow gct-select-arrow" /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="border-radius">
  import { computed, Ref, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const props = defineProps({
    isLabelPrint: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  const emit = defineEmits(['changeEvent']);

  let style: Ref<any> = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('changeEvent', val);
    },
  });

  const { selectedStyle } = useSelectedWidget();

  if (props.isLabelPrint !== true) {
    // eslint-disable-next-line vue/no-ref-as-operand
    style = selectedStyle;
  }
  const { t } = useI18n();
  const pos = ref<string>('all');
  const options = ref([
    {
      label: '2',
      value: '2',
    },
    {
      label: '4',
      value: '4',
    },
    {
      label: '6',
      value: '6',
    },
    {
      label: '8',
      value: '8',
    },
    {
      label: '10',
      value: '10',
    },
  ]);
  // const filterOption = (input, option) => {
  //   return option.value.toUpperCase().indexOf(input.toUpperCase()) >= 0;
  // };
  const radiusVal = computed(() => {
    const {
      borderAllRadius,
      borderTopLeftRadius,
      borderBottomLeftRadius,
      borderTopRightRadius,
      borderBottomRightRadius,
    } = style.value;
    switch (pos.value) {
      case 'all':
        if (
          new Set([
            borderTopLeftRadius,
            borderBottomLeftRadius,
            borderTopRightRadius,
            borderBottomRightRadius,
          ]).size === 1
        ) {
          return borderTopLeftRadius || '0';
        } else {
          return;
        }
      case 'upLeft':
        return style.value.borderTopLeftRadius || '0';
      case 'upRight':
        return style.value.borderTopRightRadius || '0';
      case 'downLeft':
        return style.value.borderBottomLeftRadius || '0';
      case 'downRight':
        return style.value.borderBottomRightRadius || '0';
      default:
        return style.value.borderAllRadius || '0';
    }
  });
  watch(
    [
      () => style.value.borderTopLeftRadius,
      () => style.value.borderTopRightRadius,
      () => style.value.borderBottomLeftRadius,
      () => style.value.borderBottomRightRadius,
    ],
    () => {
      if (
        style.value.borderTopLeftRadius === style.value.borderTopRightRadius &&
        style.value.borderTopRightRadius === style.value.borderBottomLeftRadius &&
        style.value.borderBottomLeftRadius === style.value.borderBottomRightRadius
      ) {
        style.value.borderAllRadius = style.value.borderBottomLeftRadius;
      } else {
        style.value.borderAllRadius = '';
      }
    },
    {
      deep: true,
    },
  );

  const handleChange = (val) => {
    if (!val) val = 0;
    val = String(val);
    switch (pos.value) {
      case 'all':
        style.value.borderAllRadius = val;
        style.value.borderTopLeftRadius = val;
        style.value.borderTopRightRadius = val;
        style.value.borderBottomLeftRadius = val;
        style.value.borderBottomRightRadius = val;
        break;
      case 'upLeft':
        style.value.borderTopLeftRadius = val;
        break;
      case 'upRight':
        style.value.borderTopRightRadius = val;
        break;
      case 'downLeft':
        style.value.borderBottomLeftRadius = val;
        break;
      case 'downRight':
        style.value.borderBottomRightRadius = val;
        break;
      default:
        break;
    }
    // eslint-disable-next-line no-self-assign
    style.value = style.value;
  };
</script>

<style lang="less" scoped>
  .radius-box {
    display: flex;

    .radius-div {
      position: relative;
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      margin-right: 10px;
      padding: 6px;
      border: 1px solid @gct-input-border-color;
      border-radius: 4px;

      &-inner {
        position: relative;
        width: 100%;
        height: 100%;
        border: 1px dashed @gct-modal-border-color;
        border-radius: 4px;
      }

      .ground {
        width: 12px;
        height: 12px;
        cursor: pointer;

        &.highlight {
          border-color: var(--ant-primary-color);
        }
      }

      .upLeftGround {
        position: absolute;
        top: -1px;
        left: -1px;
        border-top: 2px solid #c3c3c3;
        border-left: 2px solid #c3c3c3;
        border-radius: 4px 0 0;
      }

      .upRightGround {
        position: absolute;
        top: -1px;
        right: -1px;
        border-top: 2px solid #c3c3c3;
        border-right: 2px solid #c3c3c3;
        border-radius: 0 4px 0 0;
      }

      .downLeftGround {
        position: absolute;
        bottom: -1px;
        left: -1px;
        border-bottom: 2px solid #c3c3c3;
        border-left: 2px solid #c3c3c3;
        border-radius: 0 0 0 4px;
      }

      .downRightGround {
        position: absolute;
        right: -1px;
        bottom: -1px;
        border-right: 2px solid #c3c3c3;
        border-bottom: 2px solid #c3c3c3;
        border-radius: 0 0 4px;
      }
    }

    .radius-editor {
      display: flex;
      flex: 1;
      flex-wrap: wrap;

      .radius-col {
        display: flex;
        align-items: center;

        .radius-text {
          min-width: 37px;
          margin-right: 6px;
          text-align: center;
        }

        .input-wrap {
          flex: 1;
        }
      }
    }

    .centerGround {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      transform: translate(-50%, -50%);
      border: 1px solid #c3c3c3;
      border-radius: 2px;
      cursor: pointer;

      &.highlight {
        border-color: var(--ant-primary-color);
      }
    }
  }

  .focus {
    border-color: var(--ant-primary-color) !important;
  }

  :deep(.gct-select-arrow) {
    position: absolute;
    top: 50%;
    right: 45px;
    color: #212528;
  }
</style>
