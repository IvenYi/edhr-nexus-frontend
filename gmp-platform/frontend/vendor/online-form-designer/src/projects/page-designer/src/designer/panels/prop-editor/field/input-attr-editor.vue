<template>
  <a-checkbox-group class="input-attr-checkbox-group" v-model:value="value" @change="chageProps">
    <a-row>
      <a-col
        :span="['getFocus', 'clearable'].includes(option.value) ? 12 : 6"
        v-for="option of options"
        :key="option.value"
      >
        <a-checkbox :value="option.value" :disabled="computedFormReadonly || option.disabled">{{
          option.label
        }}</a-checkbox>
        <a-tooltip>
          <template #title>{{ computedTips }}</template>
          <i
            class="iconfont icon-assist mr-16px cursor-pointer focus-icon"
            v-if="option.value === 'getFocus'"
          ></i>
        </a-tooltip>
      </a-col>
    </a-row>
  </a-checkbox-group>
</template>

<script setup lang="ts" name="input-attr-editor">
  import { computed, onBeforeMount, ref, nextTick, watch } from 'vue';
  import { props } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { merge, last } from 'lodash-es';
  import { Dependency_ENUM } from '/@page-designer/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  interface IOptions {
    label: string;
    value: string;
    disabled?: boolean;
  }

  const { t } = useI18n();
  const defProps = defineProps(props);

  const requiredDisabled = ref<boolean>(false);
  const readonlyDisabled = ref<boolean>(false);
  const filterAttrs = ref<string[]>([]);

  const transform = {
    required: ['readonly', 'disabled'],
    readonly: ['required', 'disabled'],
    disabled: ['required', 'readonly'],
  };

  watch(
    () => defProps.widget?.props.readonly,
    () => {
      filterAttrs.value = defProps.propConfig?.getFilterAttrs?.(defProps.widget) || [];
    },
  );

  onBeforeMount(() => {
    requiredDisabled.value = defProps.widget?.props.fieldRequired;
    readonlyDisabled.value = defProps.widget?.props.fieldReadonly;
    filterAttrs.value = defProps.propConfig?.getFilterAttrs?.(defProps.widget) || [];
  });

  const options = computed<IOptions[]>(() => {
    if (defProps.propConfig.needFieldAttrs) {
      return defProps.propConfig.needFieldAttrs
        .filter((attr) => !filterAttrs.value.includes(attr))
        .map((attr) => {
          const params: any = {};

          if (attr === 'required' && requiredDisabled.value) {
            params.disabled = true;
          }
          if (attr === 'readonly' && readonlyDisabled.value) {
            params.disabled = true;
          }
          if (attr === 'disabled' && readonlyDisabled.value) {
            params.disabled = true;
          }

          return {
            label: t(`sys.pageDesigner.${attr}`),
            value: attr,
            ...params,
          };
        });
    }
    return [];
  });

  const value = computed<string[]>({
    get() {
      return (
        defProps.propConfig.needFieldAttrs
          ?.filter((attr) => !filterAttrs.value.includes(attr))
          ?.map((attr) => {
            return defProps.widget?.props[attr] ? attr : '';
          })
          .filter((i) => i) ?? []
      );
    },
    set(value: string[]) {
      const lastVal = last(value) ?? '';

      defProps.propConfig.needFieldAttrs
        ?.filter((attr) => !filterAttrs.value.includes(attr))
        .forEach((attr) => {
          merge(
            defProps.widget?.props,
            {
              [attr]: value.includes(attr),
            },
            Object.keys(transform).includes(lastVal) && value.includes(attr)
              ? Object.fromEntries(transform[lastVal].map((item) => [item, false]))
              : !Object.keys(transform).some((item) => value.includes(item)) &&
                requiredDisabled.value
              ? { required: true }
              : {},
          );
        });
    },
  });

  const computedTips = computed(() => {
    return t(defProps?.propConfig?.focusTips || 'sys.pageDesigner.getFocusTip');
  });

  const computedFormReadonly = computed(() => {
    const { allFormWidget } = useDesigner();
    const pForm = allFormWidget?.value?.find((e) => e.id === defProps.widget?.preLocation);
    return !!pForm?.props.readonly;
  });

  const chageProps = async (v) => {
    await nextTick();
    if (!!defProps.changeCallback && typeof defProps.changeCallback === 'function') {
      defProps.changeCallback!(defProps.widget, value.value);
    }
    /**设置必填或只读的时候 如果已经设置了组件依赖 那就 需要再对应的组件依赖内做标识*/
    const configDependency = defProps.widget?.props.componentDependency.configDependency || {};
    if (configDependency[Dependency_ENUM.REQUIRED].value) {
      configDependency[Dependency_ENUM.REQUIRED].fieldValue = value.value.includes(
        Dependency_ENUM.REQUIRED,
      );
    }
    if (configDependency[Dependency_ENUM.READONLY].value) {
      configDependency[Dependency_ENUM.READONLY].fieldValue = value.value.includes(
        Dependency_ENUM.READONLY,
      );
    }
  };
</script>

<style lang="less" scoped>
  .input-attr-checkbox-group {
    width: 100%;
    height: 22px;
  }

  .focus-icon {
    color: #bfbfbf;

    &:hover {
      color: var(--ant-primary-color);
    }
  }
  .ant-checkbox-group {
    line-height: 1;
  }
</style>
