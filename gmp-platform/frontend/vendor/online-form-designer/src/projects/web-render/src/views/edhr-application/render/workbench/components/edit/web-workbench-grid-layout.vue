<template>
  <div class="web-workbench-grid-layout">
    <grid-layout
      v-model:layout="compList"
      :col-num="12"
      :row-height="32"
      :margin="[16, 16]"
      :is-draggable="true"
      :is-resizable="true"
      :is-bounded="true"
      :vertical-compact="false"
      :use-css-transforms="true"
    >
      <grid-item
        v-for="item in compList"
        :key="item.id"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :minW="item.minW"
        :minH="item.minH"
        @moved="movedEvent"
        @resized="resizedEvent"
      >
        <div class="content">
          <div class="title">{{ $t(item.name) }}</div>
          <div class="tips">{{ t('sys.portal.dragTips') }}</div>
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup lang="ts" name="web-workbench-grid-layout">
  import { watch, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { pick } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  interface Props {
    dataSource: Array<any>;
    deviceSource: number;
  }

  const props = defineProps<Props>();

  const emits = defineEmits(['refresh']);

  const compList = ref<Array<any>>([]);

  watch(
    () => props.dataSource,
    (value) => {
      compList.value = value;
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const onUpdatePositionJson = async (msg) => {
    const batchPosition = compList.value.map((item) => {
      return {
        id: item.id,
        positionJson: JSON.stringify(pick(item, ['x', 'y', 'w', 'h'])),
      };
    });
    message.success(msg);
    emits('refresh', batchPosition);
  };

  /** 移动后的事件 */
  const movedEvent = async () => {
    onUpdatePositionJson(t('sys.portal.dragSuccess'));
  };

  /** 调整大小后的事件 */
  const resizedEvent = () => {
    onUpdatePositionJson(t('sys.portal.compSizeChangeSuccess'));
  };
</script>

<style lang="less">
  .web-workbench-grid-layout {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: #f5f5f5;

    .vue-grid-layout {
      background: #f5f5f5;
    }

    .vue-grid-item:not(.vue-grid-placeholder) {
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
    }

    .vue-grid-item.vue-grid-placeholder {
      border-radius: 8px;
      background: green !important;
    }

    .vue-grid-item .resizing {
      opacity: 0.3;
    }

    .vue-grid-item .static {
      background: #cce;
    }

    .vue-grid-item {
      .content {
        display: flex;
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 100%;

        .title {
          padding-top: 16px;
          padding-left: 18px;
          color: #333;
          font-size: 16px;
          line-height: 22px;
        }

        .tips {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #bfbfbf;
        }
      }
    }

    .vue-grid-item .text {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: auto;
      font-size: 24px;
      text-align: center;
    }

    .vue-grid-item .no-drag {
      width: 100%;
      height: 100%;
    }

    .vue-grid-item .minMax {
      font-size: 12px;
    }

    .vue-grid-item .add {
      cursor: pointer;
    }
  }
</style>
