<template>
  <div :class="ns.b()">
    <a-input-group compact>
      <a-form-item>
        <a-select
          :class="ns.e('mode')"
          v-model:value="modeValue"
          @change="changeMode"
          :disabled="c.state.disabled"
        >
          <a-select-option v-for="item in ModelTypeOptions" :key="item.value" :value="item.value">
            {{ t(item.label) }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-select
        :class="ns.e('model')"
        :value="val"
        show-search
        :filter-option="filterOption"
        :placeholder="t('sys.chooseText')"
        @change="changeModel"
        :disabled="c.state.disabled"
      >
        <a-select-opt-group v-for="(models, modelType) in options" :key="modelType">
          <template #label>
            <span>
              {{ t(`sys.model.${modelType}`) }}
            </span>
          </template>
          <a-select-option
            :key="model.key"
            v-for="model in models"
            :value="model.key"
            :name="model.name"
            :type="model.type"
            :subModel="model.subModel"
            :category="model.category"
          >
            {{ model.name }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </a-input-group>
  </div>
</template>
<script lang="ts" setup name="model-picker">
  import { ref, computed } from 'vue';
  import { getModelComprehensiveModelSummary } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { groupBy } from 'lodash-es';
  import { ModelTypeOptions } from '/@/constants/model';
  import { ModelBriefInfo } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    IFormItem,
    IFormItemController,
    ITextEditor,
    useGctFormValue,
    useNamespace,
  } from '@gct/runtime';

  interface ModelSelectOpt {
    [key: string]: ModelBriefInfo[];
  }

  const ns = useNamespace('model-picker');

  const { t } = useI18n();

  const props = defineProps({
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  });

  const options = ref<ModelSelectOpt>();

  const val = useGctFormValue();

  const modeValue = computed<string>({
    get: () => props.c.data.modelCategory ?? 'entity',
    set: (v) => {
      // eslint-disable-next-line vue/no-mutating-props
      props.c.data.modelCategory = v;
    },
  });

  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.name.includes(input) || option.value.includes(input);
    }
    return false;
  };

  const getModelList = async () => {
    const arr = await getModelComprehensiveModelSummary({
      category: modeValue.value,
    });
    options.value = groupBy(arr, 'category');
  };

  getModelList();

  const changeMode = (v: string) => {
    modeValue.value = v;
    if (val.value) {
      val.value = '';
    }
    options.value = {};
    getModelList();
  };

  const changeModel = (v: string) => {
    val.value = v;
  };
</script>
<style lang="scss">
  @include b(model-picker) {
    @include e(mode) {
      flex-shrink: 0;
      width: 70px;
    }

    @include e(model) {
      flex-grow: 1;
      width: calc(100% - 70px);
    }

    .ant-input-group {
      display: flex;

      > .ant-form-item {
        margin: 0;
      }
    }
  }
</style>
