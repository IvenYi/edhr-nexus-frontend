<template>
  <div class="field-auth-setting-wrapper">
    <div class="model-name">{{ meta.name }}</div>
    <div class="field-list">
      <div class="field-item title">
        <div class="field-item-title">
          <em>{{ t('sys.appDesigner.approval.fieldName') }}</em>
        </div>
        <div class="field-item-options">
          <div class="option-item" v-for="option of configOptions" :key="option.value">
            <span>{{ option.label }}</span>
            <a-checkbox
              :indeterminate="allCheckedValue[`${option.value}SourceIm`]"
              :checked="allCheckedValue[`${option.value}Source`]"
              @change="(event) => onSuperChange(event, option.value)"
              :disabled="bpmnReadonly"
            />
          </div>
        </div>
      </div>

      <div class="field-item field" v-for="info of fieldList" :key="info.field">
        <div class="field-item-title" :title="info.fieldName">
          <em>{{ info.fieldName }}</em>
        </div>
        <div class="field-item-options">
          <div class="option-item" v-for="option of configOptions" :key="option.value">
            <span>{{ option.label }}</span>
            <a-radio
              v-model:checked="info[option.value]"
              :disabled="bpmnReadonly"
              @change="(event) => onFieldItemChange(event, info, option.value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="field-auth-setting">
  import { computed, inject } from 'vue';
  import { merge } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const { t } = useI18n();

  const configOptions = [
    {
      label: t('sys.edit'),
      value: 'edit',
    },
    {
      label: t('sys.pageDesigner.readonly'),
      value: 'readonly',
    },
  ];

  const changeConfig = {
    editKeys: {
      edit: {
        name: 'edit',
        excludeKey: 'readonly',
        cb: (checked) => checked,
      },
      readonly: {
        name: 'readonly',
        excludeKey: 'edit',
        cb: (checked) => checked,
      },
    },
  };

  const props = defineProps<{
    fields: Array<{
      edit: boolean;
      readonly: boolean;
      field: string | undefined;
      fieldName: string | undefined;
      modelKey: string | undefined;
      subModel: number;
    }>;
    meta: {
      key?: string;
      name?: string;
      subModel?: number;
    };
  }>();

  const fieldList = computed({
    get() {
      return props.fields;
    },
    set(value) {},
  });

  const allCheckedValue = computed(() => {
    const editCheckedValue = formatAllCheckedValue(fieldList.value, getCallback, {
      one: 'edit_one',
      two: 'common',
    });
    const readyOnlyCheckedValue = formatAllCheckedValue(fieldList.value, getCallback, {
      one: 'readonly_one',
      two: 'common',
    });
    return {
      editSource: editCheckedValue.ret.source,
      editSourceIm: editCheckedValue.ret.sourceIm,
      readonlySource: readyOnlyCheckedValue.ret.source,
      readonlySourceIm: readyOnlyCheckedValue.ret.sourceIm,
    };
  });

  const getCallback = (key, item) => {
    if (key === 'edit_one') {
      return item.edit;
    }

    if (key === 'readonly_one') {
      return item.readonly;
    }

    if (key === 'common') {
      return true;
    }
    return false;
  };

  const formatAllCheckedValue = (list, callback, keys) => {
    return list.reduce(
      (acc, cur, index) => {
        const updatedCount: any = {};

        merge(updatedCount, {
          numLength: acc.numLength + (callback(keys.one, cur) ? 1 : 0),
          numTotalLength: acc.numTotalLength + (callback(keys.two, cur) ? 1 : 0),
        });

        let updatedRet = {
          source: false,
          sourceIm: false,
        };

        if (index === list.length - 1) {
          if (updatedCount.numLength === updatedCount.numTotalLength) {
            updatedRet.source = true;
          }
          if (
            updatedCount.numLength < updatedCount.numTotalLength &&
            updatedCount.numLength !== 0
          ) {
            updatedRet.sourceIm = true;
          }
        }

        return {
          ret: updatedRet,
          ...updatedCount,
        };
      },
      { ret: {}, numLength: 0, numTotalLength: 0 },
    );
  };

  function onSuperChange(event, type) {
    const { excludeKey, name, cb } = changeConfig.editKeys[type];
    let otherConfig: any = changeConfig.editKeys[excludeKey];

    fieldList.value.forEach((field: any) => {
      field[name] = cb(event.target.checked);
      if (excludeKey) {
        field[otherConfig.name] = otherConfig.cb(!event.target.checked);
      }
    });
  }

  function onFieldItemChange(event, fieldInfo, type) {
    const { excludeKey } = changeConfig.editKeys[type];

    if (excludeKey && event.target.checked && fieldInfo[excludeKey]) {
      const { name: otherName, cb: otherCb } = changeConfig.editKeys[excludeKey];
      fieldInfo[otherName] = otherCb(false);
    }
  }
</script>

<style scoped lang="less">
  .field-auth-setting-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    .model-name {
      line-height: 18px;
      color: #252525;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .field-list {
      background-color: #f0f0f0;
      border-radius: 4px;
      padding: 0 8px;

      .field-item {
        position: relative;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #e8ebf0;
        padding: 5px 8px;
        font-size: 12px;
        display: flex;
        align-items: center;

        .field-item-title {
          flex: 1;
          overflow: hidden;
          width: 1px;
          line-height: 18px;
          > em {
            font-style: normal;
            padding-right: 5px;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #666;
          }
        }

        .field-item-options {
          display: flex;

          .option-item {
            line-height: 18px;
            position: relative;
            display: flex;
            align-items: center;
            &:first-child {
              margin-right: 4px;
            }

            > span {
              line-height: 18px;
              display: inline-block;
              margin-right: 2px;
              color: #666;
            }

            .ant-checkbox-wrapper {
              line-height: 18px;

              :deep(.ant-checkbox) {
                top: 0;
              }
              &::after {
                display: none;
              }
            }

            .ant-radio-wrapper {
              line-height: 18px;
              margin: 0;
              :deep(.ant-radio) {
                top: 0;
              }
              &::after {
                display: none;
              }
            }
          }
        }

        &.field {
          .option-item {
            > span {
              padding-right: 16px;
              opacity: 0;
              visibility: hidden;
            }
            .ant-radio-wrapper {
              position: absolute;
              left: 16px;
            }
          }
          margin-bottom: 4px;
        }

        &.title {
          border: none;
          background: transparent;
        }
      }
    }
  }
</style>
