<template>
  <div class="flex h100% w100% print">
    <div class="left flex flex-col">
      <div class="left-title"> {{ $t('sys.inputVar') }} </div>
      <ScrollContainer>
        <a-form ref="FormRef" :model="varMap" autocomplete="off" layout="vertical">
          <a-form-item
            v-for="item in defProps.fieldConfig"
            :key="item.key"
            :label="$t(item.label)"
            :name="item.key"
            class="var-item"
            :class="{ selected: selectItem[0]?.id === item.key }"
            @mouseenter="mouseenter(item.key)"
            @mouseleave="mouseleave"
            required
          >
            <a-input
              @focus="focus(item.key)"
              @blur="blur"
              @change="changeMap(varMap[item.key], item.key)"
              v-model:value="varMap[item.key]"
              :placeholder="$t('sys.inputText')"
            />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
    <div class="right">
      <div class="right-title"> {{ t('sys.simulatedPreview') }} </div>

      <div ref="containerRef" class="canvas-container">
        <stage-canvas
          ref="canvasRef"
          :schema="schema"
          style="pointer-events: none; user-select: none"
          :style="canvasStyle"
          @updatePBarcodeWidth="updatePBarcodeWidth"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, toRaw, onUnmounted, computed, nextTick } from 'vue';
  import StageCanvas from '../stage/stage-canvas.vue';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { IModal, useModal } from '@gct/runtime';
  import { useDesigner } from '../hooks/useDesigner';

  const { hoveredElements, updateEgglement } = useDesigner();

  const selectItem = ref([]);

  const hoverItem = ref([]);

  const containerRef = ref(null);
  const canvasRef = ref(null);
  const canvasSize = ref({ width: 0, height: 0 });
  const containerSize = ref({ width: 0, height: 0 });

  const { t } = useI18n();
  const FormRef = ref();
  const varMap = ref<any>({});
  const defProps = defineProps<{
    modal: IModal;
    fieldConfig: any;
    data: any;
  }>();
  const schema = ref();
  const handleOk = async () => {
    try {
      await FormRef.value?.validate();

      return {
        ok: true,
        data: { ...varMap.value },
      };
    } catch (err) {
      console.warn(err);
    }
    return {
      ok: false,
    };
  };
  const changeMap = async (value, id) => {
    schema.value.forEach((i) => {
      if (i.type === 'TEXT' && i.id === id) {
        i.attrs.text.label = value;
        i.attrs.text.value = value;
      } else if (i.id === id) {
        i.attrs.content.value = value;
      }
    });
  };

  const updatePBarcodeWidth = (payload) => {
    const egglement = schema.value.find((d) => d.id === payload.elId);
    if (egglement.rotate === 90) {
      if (payload.height !== egglement.height) {
        updateEgglement({
          egglement,
          width: payload.rotateWidth,
          height: payload.width,
        });
      } else {
        console.log('高度不变');
      }
    } else {
      if (payload.width !== egglement.width) {
        updateEgglement({
          egglement,
          width: payload.width,
        });
      } else {
        console.log('长度不变');
      }
    }
  };

  const focus = (id) => {
    selectItem.value = schema.value.filter((i) => i.id === id);
    hoveredElements.value = [...selectItem.value, ...hoverItem.value];
  };

  const blur = () => {
    selectItem.value = [];
    hoveredElements.value = [...hoverItem.value];
  };

  const mouseenter = (id) => {
    hoverItem.value = schema.value.filter((i) => i.id === id);
    hoveredElements.value = [...selectItem.value, ...hoverItem.value];
  };

  const mouseleave = () => {
    hoverItem.value = [];
    hoveredElements.value = [...selectItem.value];
  };

  useModal(handleOk);

  // 计算缩放比例和 transform
  const canvasStyle = computed(() => {
    if (
      !canvasSize.value.width ||
      !canvasSize.value.height ||
      !containerSize.value.width ||
      !containerSize.value.height
    ) {
      return {};
    }

    const scaleX = containerSize.value.width / canvasSize.value.width;
    const scaleY = containerSize.value.height / canvasSize.value.height;
    const scale = Math.min(scaleX, scaleY);

    // 计算居中的偏移量
    const translateX = (containerSize.value.width - canvasSize.value.width * scale) / 2;
    const translateY = (containerSize.value.height - canvasSize.value.height * scale) / 2;

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transformOrigin: 'top left',
      width: `${canvasSize.value.width}px`,
      height: `${canvasSize.value.height}px`,
    };
  });

  onMounted(() => {
    schema.value = cloneDeep(defProps.data);
    // if (defProps.fieldConfig && defProps.fieldConfig.length) {
    //   defProps.fieldConfig.forEach((i) => {
    //     varMap.value[i.key] = '';
    //   });
    // }

    // 获取 canvas 原始尺寸
    if (canvasRef.value) {
      // 假设 canvas 组件有获取原始尺寸的方法
      // 如果没有，可能需要从 schema 或其它地方获取
      canvasSize.value = {
        width: canvasRef.value.$el?.offsetWidth || 0,
        height: canvasRef.value.$el?.offsetHeight || 0,
      };
    }

    // 创建 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        containerSize.value.width = width;
        containerSize.value.height = height;
      }
    });

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }

    // 清理
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  });
</script>

<style lang="less" scoped>
  .print {
    min-width: 0; /* 重要：防止 flex 子项溢出 */
    min-height: 0; /* 重要：防止 flex 子项溢出 */
  }

  .left {
    width: 288px;
    min-width: 288px;
    padding: 12px 0 12px 12px;
    border-right: 1px solid #e0e3eb;

    .left-title {
      display: flex;
      align-items: center; // 垂直居中
      margin: 12px 0;
      color: #1a1d23;
      font-size: 14px;
      font-weight: 600;

      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        margin-right: 8px;
        margin-left: 12px;
        background: var(--ant-primary-color);
        color: var(--ant-primary-color);
      }
    }
  }

  .right {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0; /* 重要：防止内容撑开 */
    padding: 24px;
    background: #f6f8fa;

    .canvas-container {
      height: calc(100% - 48px);
    }

    .right-title {
      margin-bottom: 24px;
      color: #1a1d23;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }
  }

  .var-item {
    margin-right: 12px;
    padding: 12px;

    &:hover {
      border: 1px solid rgb(from var(--ant-primary-color) r g b / 30%);
      border-radius: 4px;
      background: rgb(from var(--ant-primary-color) r g b / 8%);
    }

    &.selected {
      border: 1px solid rgb(from var(--ant-primary-color) r g b / 30%);
      border-radius: 4px;
      background: rgb(from var(--ant-primary-color) r g b / 8%);
    }
  }

  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-input-affix-wrapper-focused) {
    border-color: var(--ant-primary-color);
  }
</style>
