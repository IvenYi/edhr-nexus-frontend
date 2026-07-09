<template>
  <div>
    <a-input-group>
      <a-row :gutter="10">
        <a-col :span="19">
          <a-select
            v-if="tagType === tagEnum.PROGRESS"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            v-model:value="tagStyleRef.tagType"
            option-label-prop="children"
            style="width: 100%"
          >
            <a-select-option :value="i" v-for="i in ProgressTypeEnum" :key="i">
              <div class="tag-opt">
                <div :class="i" class="mr10px"></div>{{ $t(`sys.pageDesigner.${i}_process`) }}</div
              >
            </a-select-option>
          </a-select>
          <a-select
            v-else
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            v-model:value="tagStyleRef.tagType"
            option-label-prop="children"
            style="width: 100%"
          >
            <a-select-option :value="i" v-for="i in TagTypeEnum" :key="i">
              <div class="tag-opt">
                <div class="tag-icon" :class="i"></div>{{ $t(`sys.pageDesigner.${i}`) }}</div
              >
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="5" class="text-right">
          <g-color-picker
            :preset="presetColor"
            :color="tagStyleRef.color"
            @update:color="handleUpdateColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '24px',
                  height: '24px',
                  backgroundColor: tagStyleRef.color,
                }"
              ></div>
            </template>
          </g-color-picker>
        </a-col>
      </a-row>
    </a-input-group>
  </div>
</template>

<script setup lang="ts">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { ref } from 'vue';
  import { TagTypeEnum, tagEnum, ProgressTypeEnum } from '/@page-designer/enum';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';

  const props = defineProps<{ tagStyle: LowCodeWidget.TagConfigStyle; tagType: tagEnum }>();
  const tagStyleRef = ref(props.tagStyle);
  const handleUpdateColor = (_e, color) => {
    tagStyleRef.value.color = color;
  };
</script>

<style lang="less" scoped>
  .tag-opt {
    display: flex;
    align-items: center;

    .tag-icon {
      width: 30px;
      height: 20px;
      margin-right: 10px;
    }

    .radius {
      border-radius: 5px;
      background-color: var(--ant-primary-color);
    }

    .linear_radius {
      border: 1px solid var(--ant-primary-color);
      border-radius: 5px;
    }

    .big_radius {
      border-radius: 10px;
      background-color: var(--ant-primary-color);
    }

    .linear_big_radius {
      border: 1px solid var(--ant-primary-color);
      border-radius: 10px;
    }

    .dashed_radius {
      border: 1px dashed var(--ant-primary-color);
      border-radius: 5px;
    }

    .status {
      border-radius: 4px;
      border-top-left-radius: 15px;
      background-color: var(--ant-primary-color);
    }
  }

  .circle {
    width: 20px;
    height: 20px;
    border: 4px solid var(--ant-primary-color);
    border-radius: 100%;
  }

  .line {
    width: 20px;
    height: 4px;
    background-color: var(--ant-primary-color);
  }
</style>
