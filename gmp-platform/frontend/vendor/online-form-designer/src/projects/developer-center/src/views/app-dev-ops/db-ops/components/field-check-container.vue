<template>
  <div class="field-check-container-wrapper">
    <div ref="fieldCheckRef" class="field-check-item-box" :class="{ 'field-disabled': disabled }">
      <field-check-item
        v-for="(item, index) of fieldConfig"
        :class="index === 0 ? 'increase-mt' : ''"
        :key="item.id"
        :itemConfig="item"
        :isShow="fieldConfig.length > 1"
        :disabled="false"
        :valiIds="valiIds"
        :alreadyValidateIds="alreadyValidateIds"
        :fieldList="fieldList"
        :checkedFields="checkedFields"
        @del="fieldCheckDel(index)"
        @update:itemConfig="handleUpdate"
      />
    </div>
    <a-button type="dashed" @click="handleAdd">
      <plus-outlined />
      {{ t('sys.addSth', { sth: t('sys.app.indexField') }) }}
    </a-button>
  </div>
</template>

<script lang="ts" setup name="field-check-container">
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { deleteAndInsertArr } from '/@/utils';
  import { buildShortUUID } from '/@/utils/uuid';
  import FieldCheckItem from './field-check-item.vue';
  import { type ItemConfig } from './typping';
  import Sortable from 'sortablejs';

  const { t } = useI18n();
  const props = defineProps<{
    value: string;
    disabled?: boolean;
    valiIds?: any[];
    modelKey?: string;
    fieldList: any[];
    fieldConfig: any[];
    alreadyValidateIds?: any[];
  }>();
  const emit = defineEmits(['update:value']);
  const fieldCheckRef = ref();

  const fieldConfig = computed<any[]>({
    get() {
      const config: ItemConfig[] = [
        {
          id: buildShortUUID(),
          config: {
            value: undefined,
            name: undefined,
          },
        },
      ];
      return props.fieldConfig.length
        ? props.fieldConfig
        : props.value
        ? setFieldConfig(props.value)
        : config;
    },
    set(value: string[]) {
      emit('update:value', value);
    },
  });

  const checkedFields = computed(() => {
    return fieldConfig.value.map((i) => i.config?.value).filter(Boolean) || [];
  });

  function setFieldConfig(fieldKey) {
    const fieldKeys = fieldKey?.split(',');
    return fieldKeys.map((i) => {
      const findItem: any = props.fieldList.find((v) => v.key === i);
      const config: ItemConfig = {
        id: buildShortUUID(),
        config: {
          value: findItem?.key,
          name: findItem?.name,
        },
      };
      return config;
    });
  }

  onMounted(() => {
    nextTick(() => {
      if (props.disabled) return;
      // if (props.serialConfigValue) {
      //   const { modelKey } = props.serialConfigValue;
      //   bindModelKey.value = modelKey;
      // }
      Sortable.create(fieldCheckRef.value, {
        animation: 150, // 过度效果，定义排序动画的时间
        onEnd(event) {
          // const { modelKey, ruleConfig } = unref(value);
          const temp = [...fieldConfig.value];
          deleteAndInsertArr(temp, event.oldIndex, event.newIndex);
          fieldConfig.value = [...temp];
        },
      });
      // 初始化ruleConfig时进行值更新及预览操作
      // if (!props.serialConfigValue && value.value) {
      //   emit('update:value', value.value);
      //   preview();
      // }
    });
  });

  const handleUpdate = (val) => {
    const ids = fieldConfig.value.map((i) => i.id);
    const config = [...fieldConfig.value];
    if (ids.includes(val.id)) {
      config.forEach((item) => {
        if (item.id === val.id) {
          item.config = val.config;
        }
      });
      fieldConfig.value = [...config];
    }
  };

  const fieldCheckDel = (index) => {
    // if (props.disabled) return;
    const arr = [...fieldConfig.value];
    arr.splice(index, 1);
    fieldConfig.value = [...arr];
  };

  const handleAdd = () => {
    const newConfig: ItemConfig = {
      id: buildShortUUID(),
      config: {
        value: undefined,
        name: undefined,
      },
    };
    fieldConfig.value = [...fieldConfig.value, newConfig];
  };

  const getFieldConfig = () => {
    return fieldConfig.value;
  };

  defineExpose({
    getFieldConfig,
  });
</script>

<style lang="less" scoped>
  :deep(.ant-btn, .ant-btn-dashed) {
    border-color: var(--ant-primary-color);
    color: var(--ant-primary-color);
  }

  .field-check-container-wrapper {
    .field-check-item-box {
      > div:not(.serial-number-container-preview) {
        &:first-child {
          // margin-top: -5px;
        }
      }
    }
  }
</style>
