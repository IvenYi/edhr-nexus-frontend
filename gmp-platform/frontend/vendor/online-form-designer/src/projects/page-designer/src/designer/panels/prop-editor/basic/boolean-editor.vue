<template>
  <div>
    <div class="mb10px ks-row-middle">
      <span class="mr10px">{{ $t('sys.pageDesigner.true') }}</span>
      <i18n-select-input
        attr="truelabel"
        @on-i18n-select="(i18nKey) => handleI18nSelect(i18nKey, 'truelabel')"
        :i18nConfig="i18n"
        size="small"
      >
        <template #i18n-input>
          <a-input
            style="width: calc(100% - 28px); height: 28px"
            v-model:value="truevalue"
            :placeholder="$t('sys.inputText')"
            :maxlength="32"
            showCount
            size="small"
          />
        </template>
      </i18n-select-input>
    </div>
    <div class="ks-row-middle">
      <span class="mr10px">{{ $t('sys.pageDesigner.false') }}</span>
      <i18n-select-input
        attr="falselabel"
        @on-i18n-select="(i18nKey) => handleI18nSelect(i18nKey, 'falselabel')"
        :i18nConfig="i18n"
        size="small"
      >
        <template #i18n-input>
          <a-input
            style="width: calc(100% - 28px); height: 28px"
            v-model:value="falsevalue"
            :placeholder="$t('sys.inputText')"
            :maxlength="32"
            showCount
            size="small"
          />
        </template>
      </i18n-select-input>
    </div>
  </div>
</template>

<script setup lang="ts" name="boolean-editor">
  import { computed, toRefs } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { I18nSelectInput } from '/@/components/I18nSelect';

  const defProps = defineProps(props);
  const { i18n } = toRefs(defProps.widget);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const truevalue = computed({
    get() {
      return propValue.value.truevalue;
    },
    set(val) {
      propValue.value = { ...propValue.value, truevalue: val };
    },
  });
  const falsevalue = computed({
    get() {
      return propValue.value.falsevalue;
    },
    set(val) {
      propValue.value = { ...propValue.value, falsevalue: val };
    },
  });
  function handleI18nSelect({ i18nKey }, key: string) {
    if (!i18n.value) return;
    i18n.value![key] = i18nKey;
  }
</script>

<style scoped>
  :deep(.ant-form-item) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0 !important;
    padding: 0;
  }

  :deep(.ant-form-item-label) {
    padding: 0;
  }
</style>
