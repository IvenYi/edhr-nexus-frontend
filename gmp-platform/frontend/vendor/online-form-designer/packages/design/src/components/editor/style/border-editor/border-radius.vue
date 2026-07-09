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
        <a-auto-complete :options="options" v-model:value="radiusVal">
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
          />
        </a-auto-complete>
        <down-outlined class="ant-select-arrow gct-select-arrow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BorderRadiusValue, parseRadiusType, parseValueUnit } from './util';
  import { emitFieldSet } from '@gct/runtime';

  const { t } = useI18n();

  const options = ref([
    {
      label: '2',
      value: 2,
    },
    {
      label: '4',
      value: 4,
    },
    {
      label: '6',
      value: 6,
    },
    {
      label: '8',
      value: 8,
    },
    {
      label: '10',
      value: 10,
    },
  ]);

  const props = withDefaults(
    defineProps<{
      value?: BorderRadiusValue;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: BorderRadiusValue): void;
  }>();

  const local = computed(() => {
    const v = props.value;
    const pos = parseRadiusType(v);
    let numberVal = 0;
    if (v) {
      let numStr;
      switch (pos) {
        case 'all':
        case 'upLeft':
          numStr = v.topLeftRadius;
          break;
        case 'upRight':
          numStr = v.topRightRadius;
          break;
        case 'downRight':
          numStr = v.bottomRightRadius;
          break;
        case 'downLeft':
          numStr = v.bottomLeftRadius;
          break;
      }
      if (!numStr || numStr === 'nullpx') {
        numStr = '0px';
      }
      const { value } = parseValueUnit(numStr);
      numberVal = value;
    }
    return {
      pos,
      numberVal,
    };
  });

  const { pos, numberVal } = emitFieldSet(local, (f, v, obj) => {
    const result: BorderRadiusValue = {};
    let tags = ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'];
    switch (obj.pos) {
      case 'upLeft':
        tags = ['topLeftRadius'];
        break;
      case 'upRight':
        tags = ['topRightRadius'];
        break;
      case 'downLeft':
        tags = ['bottomLeftRadius'];
        break;
      case 'downRight':
        tags = ['bottomRightRadius'];
        break;
      default:
        break;
    }
    tags.forEach((tag) => {
      result[tag] = obj.numberVal + 'px';
    });
    emit('update:value', result);
  });

  const radiusVal = computed({
    get() {
      if (numberVal.value === 0) {
        return '0';
      }
      return numberVal.value;
    },
    set(v) {
      numberVal.value = v as number;
    },
  });
</script>

<style lang="less" scoped>
  .radius-box {
    position: relative;
    display: flex;
    .radius-div {
      position: relative;
      width: 60px;
      height: 60px;
      padding: 6px;
      margin-right: 10px;
      border-radius: 4px;
      border: 1px solid @gct-input-border-color;

      &-inner {
        width: 100%;
        height: 100%;
        border: 1px dashed @gct-modal-border-color;
        position: relative;
        border-radius: 4px;
      }
      .ground {
        cursor: pointer;
        width: 12px;
        height: 12px;
        &.highlight {
          border-color: var(--ant-primary-color);
        }
      }
      .upLeftGround {
        position: absolute;
        top: -1px;
        left: -1px;
        border-left: 2px solid #c3c3c3;
        border-top: 2px solid #c3c3c3;
        border-radius: 4px 0 0 0;
      }
      .upRightGround {
        position: absolute;
        top: -1px;
        right: -1px;
        border-right: 2px solid #c3c3c3;
        border-top: 2px solid #c3c3c3;
        border-radius: 0 4px 0 0;
      }
      .downLeftGround {
        position: absolute;
        left: -1px;
        bottom: -1px;
        border-left: 2px solid #c3c3c3;
        border-bottom: 2px solid #c3c3c3;
        border-radius: 0 0 0 4px;
      }
      .downRightGround {
        position: absolute;
        right: -1px;
        bottom: -1px;
        border-right: 2px solid #c3c3c3;
        border-bottom: 2px solid #c3c3c3;
        border-radius: 0 0 4px 0;
      }
    }
    .radius-editor {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      .radius-col {
        display: flex;
        align-items: center;
        .radius-text {
          margin-right: 6px;
          width: 40px;
        }
        .input-wrap {
          flex: 1;
        }
      }
    }
    .centerGround {
      cursor: pointer;
      width: 12px;
      height: 12px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 1px solid #c3c3c3;
      border-radius: 2px;
      &.highlight {
        border-color: var(--ant-primary-color);
      }
    }
  }
  .focus {
    border-color: var(--ant-primary-color) !important;
  }
  :deep(.gct-select-arrow) {
    color: #212528;
    position: absolute;
    top: 50%;
    right: 45px;
  }

  :deep(.ant-input-number-handler-wrap) {
    z-index: 2;
  }
</style>
