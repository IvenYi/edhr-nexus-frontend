<template>
  <template v-if="defProps.propConfig.i18n">
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
          :placeholder="placeholder"
          :maxlength="maxlength"
          :showCount="defProps.propConfig.showCount && maxlength"
          @blur="handleInputBlur"
          size="small"
        />
      </template>
    </i18n-select-input>
  </template>
  <template v-else>
    <a-input
      v-model:value="propValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :showCount="defProps.propConfig.showCount && maxlength"
      @blur="handleInputBlur"
      size="small"
    />
  </template>
</template>

<script setup lang="ts" name="text-editor">
  import { computed, inject, nextTick } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { I18nSelectInput } from '/@/components/I18nSelect';
  import { isEmpty, omit } from 'lodash-es';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(
    defProps.propName,
    defProps.changeCallback,
    defProps.propConfig.supportGlobData ? globFieldInfo : {},
  );
  const maxlength = computed(() => getValue(defProps.propConfig.maxlength));
  const defaultValue = defProps.propConfig?.defaultValue;
  const i18nConfig = computed(() => {
    if (defProps.propConfig.i18n) {
      return defProps?.widget?.i18n ?? {};
    }
    return {};
  });

  const handleI18nSelect = (params) => {
    if (isEmpty(propValue.value) && !isEmpty(params)) {
      propValue.value = params.i18nTitle;
    }

    if (defProps?.widget) {
      const i18nKey = defProps.propName as string;
      if (isEmpty(params)) {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = omit(defProps.widget?.i18n ?? {}, i18nKey);
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        defProps.widget.i18n = {
          ...(defProps.widget?.i18n ?? {}),
          [i18nKey]: params.i18nKey,
        };
      }
    }
  };
  function getValue(propkey) {
    if (typeof propkey === 'function') {
      return propkey(defProps.widget);
    } else {
      return propkey;
    }
  }

  // 当清空后需要重置为新建字段时的名称
  const handleInputBlur = async () => {
    if (isEmpty(propValue.value) && defProps.propConfig.supportGlobData) {
      propValue.value = globFieldInfo[defProps.propName as string];
    }
    await nextTick();
    //按钮的兜底逻辑
    propValue.value = propValue.value || $t(defaultValue || '');
  };
  //按钮默认暗提示
  const placeholder = $t(defaultValue || 'sys.inputText');
</script>

<style lang="less" scoped></style>
