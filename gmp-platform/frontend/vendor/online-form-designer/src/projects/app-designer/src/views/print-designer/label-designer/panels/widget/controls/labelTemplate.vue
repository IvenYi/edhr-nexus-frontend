<template>
  <div class="label-template">
    <a-form-item :label="t('sys.printDesigner.labelSize')">
      <a-select v-model:value="project.labelSize" @change="onChange">
        <a-select-option v-for="opt in sizeOpt" :key="opt.value" :value="opt.value">{{
          opt.label
        }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="t('sys.width')" name="width">
      <a-input-number
        v-model:value="formState.width"
        :disabled="project.labelSize !== 7"
        :placeholder="t('sys.inputText')"
      />
    </a-form-item>
    <a-form-item :label="t('sys.height')" name="height">
      <a-input-number
        v-model:value="formState.height"
        :disabled="project.labelSize !== 7"
        :placeholder="t('sys.inputText')"
      />
    </a-form-item>
    <a-form-item :label="t('sys.printDesigner.printDPI')" name="dpi">
      <a-input-number
        v-model:value="project.dpi"
        :min="0"
        :placeholder="t('sys.inputText')"
        @blur="blurDpi"
      />
    </a-form-item>
    <a-form-item :label="t('sys.printDesigner.refEntity')" name="modelKey">
      <a-select v-model:value="project.modelKey" :placeholder="t('sys.chooseText')">
        <a-select-opt-group v-for="group in modelList" :key="group.name">
          <template #label>
            <span>
              {{ group.name }}
            </span>
          </template>
          <a-select-option
            v-for="model in group.children"
            :key="model.key"
            :value="model.key"
            :title="model.name"
            >{{ model.name }}</a-select-option
          >
        </a-select-opt-group>
      </a-select>
    </a-form-item>
    <a-form-item :label="t('sys.printDesigner.labelFormart')">
      <a-select v-model:value="project.printType" :placeholder="t('sys.appDesigner.pleaseSelect')">
        <a-select-option v-for="opt in formartOpt" :key="opt.value" :value="opt.value">{{
          opt.label
        }}</a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed, reactive } from 'vue';
  import {
    sizeOpt,
    getSpecificationsForSize,
    transformsize,
    transformCoordinateByDpi,
  } from '../../../../constants/size';
  import { usePage } from '../../../hooks/usePage';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useI18n } from '/@/hooks/web/useI18n';

  enum formart {
    ZPL = 'zpl',
    // TSPL = 'tspl',
    // CPCL = 'cpcl',
    // 'ESC/POS' = 'esc/pos',
    PNG = 'png',
  }

  const { t } = useI18n();
  const oldDip = ref();
  const modelList = ref<CategoryCompleteResponse[]>([]);
  const formState = reactive({
    width: 0,
    height: 0,
  });

  const formartOpt = Object.values(formart).map((key, index) => ({
    value: key,
    label: Object.keys(formart)[index],
  }));

  const { project, width, height } = usePage();
  const onChange = (value) => {
    const { width, height, strWidth, strHeight } = getSpecificationsForSize(
      value!,
      project.value.dpi!,
    );
    formState.width = width!;
    formState.height = height!;
    project.value.width = strWidth;
    project.value.height = strHeight;
  };
  async function getModelList() {
    modelList.value =
      (await getCategoryListComplete({ module: ModelTypeEnum.ENTITY as string })) || [];
  }
  getModelList();
  watch(formState, (v) => {
    project.value.width = transformsize(v.width, project.value.dpi!);
    project.value.height = transformsize(v.height, project.value.dpi!);
    project.value.labelWidth = formState.width;
    project.value.labelHeight = formState.height;
  });
  onMounted(() => {
    const { labelSize, dpi, labelWidth, labelHeight, printType } = reactive(project.value);
    const { width, height, strWidth, strHeight } = getSpecificationsForSize(labelSize!, dpi!);
    formState.width = labelWidth || width;
    formState.height = labelHeight || height;
    project.value.width = strWidth;
    project.value.height = strHeight;
    project.value.printType = printType || 'zpl';
    oldDip.value = dpi;
  });

  async function blurDpi() {
    if (oldDip.value !== project.value.dpi) {
      transformCoordinate(project.value.dpi, oldDip.value);
      oldDip.value = project.value.dpi;
    }
  }
  const transformCoordinate = (n, o) => {
    const { labelWidth, labelHeight } = project.value;
    project.value.width = transformsize(labelWidth, n);
    project.value.height = transformsize(labelHeight, n);
    width.value = project.value.width;
    height.value = project.value.height;
    project.value.page = project.value.page.map((i) => {
      return {
        ...i,
        top: transformCoordinateByDpi(i.top, o, n),
        left: transformCoordinateByDpi(i.left, o, n),
      };
    });
  };
</script>
<style scoped lang="less">
  :deep(.ant-form-item) {
    margin-bottom: 12px;
    .ant-form-item-label > label {
      height: 28px;
      font-size: 12px;
    }
    .ant-form-item-control-input {
      min-height: 28px;
    }
  }
</style>
