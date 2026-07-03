<template>
  <div v-for="(el, i) in fieldData" :key="i">
    <div class="mb2px">{{ el.modelName }}</div>
    <div class="fields-wrap bg-[#F0F0F0] py8px rounded-4px mb12px">
      <div class="fields-header ks-row-middle overflow-hidden pb4px px16px">
        <div class="fields-header-name ell pr4px relative top-2px">
          {{ t('sys.appDesigner.approval.fieldName') }}
        </div>
        <div class="ks-col ks-row-middle">
          <div
            v-for="item in Object.values(FieldsPermissionEnum)"
            :key="item"
            class="fields-header-item ell"
          >
            {{ t(`sys.pageDesigner.${item}`) }}
            <a-checkbox
              :disabled="paasBpmnReadonly"
              :checked="checkedParent(item, el)"
              style="line-height: 1; height: 18px"
              @change="(e) => handleParentChange(e, item, el)"
            />
          </div>
        </div>
      </div>
      <div class="fields-main max-h-390px overflow-auto px8px">
        <a-spin :spinning="spinning">
          <div
            v-for="(field, j) in el.children"
            :key="j"
            class="fields-main-option bg-[#FFFFFF] rounded-4px mb4px border"
          >
            <div class="ks-row py5px px8px">
              <div class="w70px ell">{{ field.name }}</div>
              <div class="fields-main-option ks-col">
                <a-radio-group
                  v-if="!el.key"
                  v-model:value="fieldConfig[field.field].permission"
                  :disabled="paasBpmnReadonly"
                  @change="(e) => onParentRadioChange(e, field)"
                >
                  <a-radio
                    v-for="(item, f) in plainOptions"
                    :value="item.value"
                    :key="f"
                    :disabled="
                      field.createType === CreateType.SYSTEM &&
                      [FieldsPermissionEnum.disabled, FieldsPermissionEnum.editable].includes(
                        item.value,
                      )
                    "
                  />
                </a-radio-group>
                <a-radio-group
                  v-else
                  v-model:value="fieldConfig[el.key].children[field.field].permission"
                  :disabled="paasBpmnReadonly"
                  @change="(e) => onParentRadioChange(e, field, el.key)"
                >
                  <a-radio
                    v-for="(item, f) in plainOptions"
                    :value="item.value"
                    :key="f"
                    :disabled="
                      field.createType === CreateType.SYSTEM &&
                      [FieldsPermissionEnum.disabled, FieldsPermissionEnum.editable].includes(
                        item.value,
                      )
                    "
                  />
                </a-radio-group>
              </div>
            </div>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldsPermissionEnum } from '../constants';
  import { computed, inject, onMounted, ref } from 'vue';
  import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { useProcess } from '../hook/useProcess';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/paas-bpmn/enums';

  const props = defineProps<{
    data: IGctBpmnNodeDefinition;
  }>();

  const { t } = useI18n();
  const { processInfo, nodeSelectedData } = useProcess();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const spinning = ref(false);
  const fieldData = ref<any[]>([]);

  const fieldConfig = computed({
    get() {
      return props.data.fieldConfig || {};
    },
    set(value) {
      Object.assign(props.data, {
        ...props.data,
        fieldConfig: value,
      });
    },
  });

  const plainOptions = computed(() => {
    return Object.values(FieldsPermissionEnum).map((e) => {
      return {
        value: e,
      };
    });
  });

  onMounted(() => {
    getFieldData();
  });

  function checkedParent(permission, item) {
    let childPers = [];
    if (item.key) {
      childPers = item.children?.filter(
        (e) => fieldConfig.value[item.key]?.children[e.field]?.permission === permission,
      );
      return childPers.length === item.children.length;
    } else {
      childPers = item.children?.filter(
        (e) => fieldConfig.value[e.field]?.permission === permission,
      );
    }
    return childPers.length === item.children.length;
  }

  // checkbox change
  const handleParentChange = (evt, permission, item) => {
    const { checked } = evt.target;
    if (checked) {
      item.children.forEach((e) => {
        if (item.key) {
          fieldConfig.value[item.key].children[e.field].permission = permission;
        } else {
          fieldConfig.value[e.field].permission = permission;
        }
      });
    }
  };

  const getFieldData = async () => {
    spinning.value = true;
    try {
      const { modelKey, modelName } = processInfo.value;
      const res: any = await getModelFields(modelKey);
      fieldData.value = [];
      const msList = res
        .filter((e) => e.type === FIELD_TYPE.MASTERSLAVE)
        .map((e) => {
          return {
            key: e.key,
            modelKey: e.bindInfo,
            modelName: e.relationModelName,
          };
        });
      const fnList: any[] = msList.map((e) => getModelFields(e.modelKey, false));
      const data = await Promise.all(fnList);
      const configObj = {};
      fieldData.value = [
        {
          modelKey,
          modelName,
          children: res
            .filter((e) => e.type !== FIELD_TYPE.MASTERSLAVE)
            .map((e) => formatFields(e)),
        },
        ...msList.map((e) => {
          return {
            ...e,
            children: data.find((d) => d[0].modelKey === e.modelKey).map((f) => formatFields(f)),
          };
        }),
      ];
      fieldData.value.forEach(async (o) => {
        if (!o.key) {
          o.children.forEach((e) => {
            configObj[e.field] = {
              permission: fieldConfig.value[e.field]?.permission || e.permission,
              children: {},
            };
          });
        } else {
          configObj[o.key] = {
            children: {},
          };
          o.children.forEach((e) => {
            configObj[o.key].children[e.field] = {
              permission: fieldConfig.value[o.key]?.children[e.field]?.permission || e.permission,
              children: {},
            };
          });
        }
      });
      fieldConfig.value = configObj;
      spinning.value = false;
    } catch (error) {
      spinning.value = false;
    }
  };

  async function getModelFields(modelKey, sys = true) {
    const res = (await getFieldMetaList({ modelKey, sys, includeBuiltin: true })) || [];
    return res;
  }

  function formatFields(f, permission?) {
    const nType = nodeSelectedData.value?.type;
    return {
      field: f.key,
      name: f.name,
      modelKey: f.modelKey,
      createType: f.createType,
      type: f.type,
      children: [],
      permission:
        permission || nType === BpmnNodeTypeEnum.BpmnApproval || f.createType === CreateType.SYSTEM
          ? FieldsPermissionEnum.readonly
          : FieldsPermissionEnum.editable,
    };
  }

  function onParentRadioChange(e, field, key?) {
    const { value } = e.target;
    if (key) {
      fieldConfig.value[key].children[field.field].permission = value;
    } else {
      fieldConfig.value[field.field].permission = value;
    }
  }
</script>
<style lang="less" scoped>
  .b-b {
    border-bottom: 1px solid #e0e3ea;
  }
  .border {
    border: 1px solid #e8ebf0;
  }
  .fields {
    &-header {
      color: #666666;
      &-name {
        width: 70px;
      }
      &-item {
        flex: 1;
        text-align: right;
        line-height: 18px;
      }
    }

    &-main {
      color: #666666;
      column-gap: 4px;
      &-option {
        :deep(.ant-radio-group) {
          display: flex;

          .ant-radio-wrapper {
            display: flex;
            flex: 1;
            margin: 0;
            justify-content: flex-end;
            line-height: 1;

            span.ant-radio + * {
              padding: 0;
            }
          }
        }

        &-parent {
          display: flex;
          flex-direction: row;
          :deep(.ant-checkbox-wrapper) {
            flex: 1;
            justify-content: center;
            line-height: 1;

            & + .ant-checkbox-wrapper {
              margin: 0;
            }
          }
        }
      }
    }
  }
</style>
