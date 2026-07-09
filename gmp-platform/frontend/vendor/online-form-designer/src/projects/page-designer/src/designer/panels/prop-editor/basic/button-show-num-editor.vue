<template>
  <a-form-item-rest>
    <a-row :gutter="10">
      <a-col :span="foldType === buttonShowType.FOLD_PART ? 12 : 24">
        <a-select v-model:value="foldType" size="small" @change="handleFoldChange">
          <a-select-option v-for="e in buttonShowType" :key="e" :value="e">
            {{ t('sys.pageDesigner.' + e) }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col v-show="foldType === buttonShowType.FOLD_PART" :span="12">
        <a-row :gutter="5">
          <a-col :span="16">
            <a-auto-complete
              :options="options"
              v-model:value="propValue"
              style="width: 100%"
              class="gct-input-number-select"
            >
              <a-input-number
                v-model:value="propValue"
                :min="1"
                :max="maxBtn"
                :controls="true"
                :precision="0"
                style="width: 100%"
                size="small"
                @blur="handleInputBlur"
              />
            </a-auto-complete>
            <down-outlined class="ant-select-arrow gct-select-arrow" />
          </a-col>
          <a-col :span="8" class="unit">
            {{ t('sys.pageDesigner.piece') }}
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <div class="tip">{{ t(`sys.pageDesigner.${foldType}_tip`, { num: maxBtn }) }}</div>
  </a-form-item-rest>
</template>
<script setup lang="ts" name="button-show-num-editor">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { buttonShowType } from '/@page-designer/enum';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const { max } = defProps.propConfig || {};

  const options = computed(() => {
    // [{ value: 1 }, { value: 2 }, { value: 3 }]
    const list = [];
    let i = 1;
    while (i <= maxBtn.value) {
      list.push({ value: i });
      i++;
    }
    return list;
  });

  const foldType = computed(() => {
    return propValue.value === 0 ? buttonShowType.FOLD_ALL : buttonShowType.FOLD_PART;
  });

  const maxBtn = computed(() => {
    if (max && typeof max === 'function') return max(defProps.widget) || 3;
    return max ?? 3;
  });

  const handleFoldChange = (val) => {
    if (val === buttonShowType.FOLD_ALL) {
      propValue.value = 0;
    } else {
      propValue.value = 1;
    }
  };
  const handleInputBlur = (e) => {
    if (!e.target.value && foldType.value === buttonShowType.FOLD_PART) {
      propValue.value = 1;
    }
  };
</script>
<style lang="scss" scoped>
  .tip {
    margin-top: 4px;
    color: #c3c3c3;
    font-size: 12px;
  }

  :deep(.ant-input-number-group > .ant-input-number:first-child) {
    border-radius: 4px;
  }

  :deep(.gct-select-arrow) {
    position: absolute;
    top: 50%;
    right: 11px;
    color: #212528;
  }

  .unit {
    display: inline-flex;
    align-items: center;
    line-height: 1;
  }
</style>
