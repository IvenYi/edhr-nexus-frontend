<template>
  <a-form-item style="margin-bottom: 0">
    <a-input-group compact>
      <a-select
        class="mode"
        v-model:value="modeValue"
        size="small"
        @change="changeMode"
        style="width: 80px"
      >
        <a-select-option v-for="item in categoryOptions" :key="item.value" :value="item.value">
          {{ t(item.label) }}
        </a-select-option>
      </a-select>
      <a-select
        class="model"
        :value="value"
        show-search
        :filter-option="filterOption"
        :placeholder="t('sys.pageDesigner.selectAssociatedModel')"
        @change="changeModel"
        size="small"
      >
        <a-select-opt-group v-for="(models, modelType) in options" :key="modelType">
          <template #label>
            <span>
              {{ modelType }}
            </span>
          </template>
          <a-select-option
            v-for="(model, index) in models"
            :key="model.key + '_' + index"
            :value="model.key"
            :name="model.name"
            :type="model.type"
            :subModel="model.subModel"
            :category="model.category"
            :supportProcess="model.supportProcess"
          >
            {{ model.name }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-input-group>
  </a-form-item>
</template>

<script setup name="model-editor" lang="ts">
  import { ref, toRef, reactive, computed } from 'vue';
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { ModelBriefInfo } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { groupBy } from 'lodash-es';
  import { ModelTypeOptions } from '../../../../constant/model';

  interface ModelSelectOpt {
    [key: string]: ModelBriefInfo[];
  }

  const { t } = useI18n();
  const defProps = defineProps(props);
  const propConfig = reactive(defProps.propConfig);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { selectedRef } = useSelectedWidget();
  const categoryOptions = computed(() =>
    ModelTypeOptions.filter((i) => {
      if (propConfig.category) {
        return propConfig.category.includes(i.value);
      } else {
        return true;
      }
    }),
  );
  if (!selectedRef.value.props!.modeldata) {
    selectedRef.value.props!.modeldata = {};
  }
  const modeValue = computed<string>({
    get: () => selectedRef.value.props!.modeldata.modelCategory ?? 'entity',
    set: (v) => {
      if (!selectedRef.value.props!.modeldata) {
        selectedRef.value.props!.modeldata = {};
      }
      selectedRef.value.props!.modeldata.modelCategory = v;
    },
  });
  const value = toRef(() => propValue.value || undefined);
  const options = ref<ModelSelectOpt>();
  const getModelList = async () => {
    const arr = await getModelComprehensiveModelSummary({
      type: propConfig.type ?? 'NDO,BASE,TRANSACTION,SIGN,CHECK_LIST', // 新版edhr需要
      subModel: propConfig.subModel,
      category: modeValue.value,
      includeSys: 1,
    });
    options.value = groupBy(
      arr.filter((i) => {
        if (i.category === 'view' && i.group === '系统') return false;
        return true;
      }),
      'group',
    );
    console.log(options.value);
  };
  getModelList();
  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.name.includes(input) || option.value.includes(input);
    }
    return false;
  };
  function changeModel(v, { type, category, subModel, supportProcess }) {
    propValue.value = v;
    if (propConfig.clearChildren) {
      selectedRef.value!.children = [];
    }
    selectedRef.value.props!.modeldata = {
      modelType: type,
      modelCategory: category,
      subModel: subModel,
      supportProcess,
    };
  }

  function changeMode() {
    propValue.value = undefined;
    options.value = {};
    getModelList();
  }
</script>

<style lang="scss" scoped>
  .ant-input-group {
    display: flex;

    .mode {
      flex-shrink: 0;
      width: 61px;
    }

    .model {
      flex-grow: 1;
      width: calc(100% - 61px);
    }
  }
</style>
