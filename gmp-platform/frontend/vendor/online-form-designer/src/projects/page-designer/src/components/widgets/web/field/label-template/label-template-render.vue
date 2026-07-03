<template>
  <div class="label-template" :style="{ width: width, height: height }" v-if="value">
    <div class="wrap">
      <stage-view :project="project" ref="canvas" style="pointer-events: none; user-select: none" />
    </div>
    <div class="mask" v-if="!readonly">
      <div class="ks-row-center-middle">
        <span class="iconfont icon-bianji cursor-pointer" @click="openView"></span>
        <span class="iconfont icon-shanchu ml10px mr10px cursor-pointer" @click="deleteJson"></span>
      </div>
    </div>
  </div>
  <div
    class="label-template text-[#bfbfbf] relative labeltext"
    :class="!readonly && 'cursor-pointer'"
    :style="{ width: width, height: height }"
    v-else
    @click="openView"
  >
  </div>
</template>

<script setup lang="ts" name="gct-label-template">
  import { toRefs, computed, watch, ref } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { useModalPicker } from '/@app-designer/views/print-designer-new/label-design/modal/index';
  import { type ProjectType } from '/@app-designer/views/print-designer-new/label-design/hooks/usePage';
  import StageView from '/@app-designer/views/print-designer-new/label-design/stage/stage-view.vue';
  import { cloneDeep } from 'lodash-es';
  import { ILabelTemplateComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { openPickerLabel } = useModalPicker();
  const props = defineProps<{
    modelValue?: string;
    widget: LowCodeWidget.FieldSchema;
    formData: { _DICT: any; [key: string]: any };
  }>();
  const emit = defineEmits(['update:modelValue']);
  const { getValue, setValue, value } = useFormWidget(props, emit);
  const project = ref<ProjectType>();
  const { readonly } = toRefs(props.widget.props);

  async function openView() {
    if (props.widget.props?.readonly) return;
    await openPickerLabel().open(value.value, props.widget.id, (json) => {
      value.value = json;
    });
  }

  watch(
    () => props.modelValue,
    (value) => {
      if (!value) return;
      project.value = cloneDeep(JSON.parse(value));
    },
    {
      immediate: true,
    },
  );

  const width = computed(() => {
    return project.value?.width || '607px';
  });

  const height = computed(() => {
    return project.value?.height || '399px';
  });

  function deleteJson() {
    value.value = '';
  }
  defineExpose<ILabelTemplateComponentExpose>({ getValue, setValue });
</script>
<style scoped lang="less">
  .label-template {
    // width: 607px;
    // height: 401px;
    box-sizing: content-box;
    border: 1px solid #dedede;
    position: relative;

    .wrap {
      height: 100%;
      background-color: #f1f1f1;
      display: flex;
      align-items: center;
      overflow: none;
    }

    &:hover .mask {
      display: block;
    }

    .mask {
      display: none;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
      width: 100%;
      height: 100%;
      background-color: #47404042;

      & > div > span {
        color: #333;
        font-size: 20px;
      }

      & > div {
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translateY(-50%);
      }
    }
  }

  .labeltext::after {
    content: '请配置标签模板组件';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%);
    line-height: 0;
  }
</style>
