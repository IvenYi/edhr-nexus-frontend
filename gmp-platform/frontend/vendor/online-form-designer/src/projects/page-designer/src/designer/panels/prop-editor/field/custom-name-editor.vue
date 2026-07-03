<template>
  <a-form-item :name="defProps.propName" class="field-name" :rules="[{ validator: nameValidator, trigger: 'change' }]">
    <i18n-select-input
      :attr="defProps.propName"
      @on-i18n-select="handleI18nSelect"
      :i18nConfig="i18nConfig"
      size="small"
    >
      <template #i18n-input>
        <a-input
          style="width: calc(100% - 28px); height: 28px"
          v-model:value="propValue"
          :placeholder="t('sys.inputText')"
          :maxlength="32"
          show-count
          @blur="handleInputBlur"
          size="small"
        />
      </template>
    </i18n-select-input>
  </a-form-item>
</template>

<script setup lang="ts" name="custom-name-editor">
  import { computed, inject } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { isEmpty, omit } from 'lodash-es';
  import { validateModelName } from '/@/utils/validate';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();
  const defProps = defineProps(props);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback, globFieldInfo);

  const i18nConfig = computed(() => {
    return defProps?.widget?.i18n ?? {};
  });

  const handleI18nSelect = (params) => {
    if (isEmpty(propValue.value) && !isEmpty(params)) {
      propValue.value = params.i18nTitle;
    }

    if (defProps && defProps.widget && defProps.widget.i18n) {
      if (isEmpty(params)) {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = omit(defProps.widget?.i18n, defProps.propName);
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = { ...defProps.widget?.i18n, [defProps.propName]: params.i18nKey };
      }
    }
  };

  const nameValidator = async (rule, value) => {
    await validateModelName(rule, value);

    return Promise.resolve();
  };

  // 当清空后需要重置为新建字段时的名称
  const handleInputBlur = () => {
    if (isEmpty(propValue.value)) {
      propValue.value = globFieldInfo[defProps.propName as string];
    }
  };
</script>

<style lang="less" scoped>
  .panel-box  .ant-form .field-name {
    margin-bottom: 0 !important;
  }
</style>
