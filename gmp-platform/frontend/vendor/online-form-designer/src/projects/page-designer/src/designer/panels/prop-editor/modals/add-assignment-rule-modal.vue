<template>
  <a-modal
    v-model:visible="visible"
    :title="t('sys.pageDesigner.configAssignRule')"
    @ok="handleOk"
    centered
    :after-close="afterClose"
    :width="800"
  >
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item
            :label="t('sys.pageDesigner.tableOfAssigned')"
            name="refTable"
            :rules="[
              {
                required: true,
                message: `${t('sys.pleaseSelectSth', {
                  sth: t('sys.pageDesigner.tableOfAssigned'),
                })}`,
              },
            ]"
          >
            <a-select
              v-model:value="formState.refTable"
              style="width: 100%"
              placeholder="请选择"
              @change="handleChange"
              allowClear
            >
              <a-select-option
                :value="i.value"
                v-for="i in allTableOptions"
                :key="i.value"
                :title="i.label"
                >{{ i.label }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.pageDesigner.dataSourceTable')" name="sourceTab">
            <a-select
              v-model:value="formState.sourceTab"
              style="width: 100%"
              placeholder="请选择"
              disabled
            >
              <a-select-option
                :value="i.value"
                v-for="i in tabOptions"
                :key="i.value"
                :title="i.label"
                >{{ i.label }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.pageDesigner.assignmentRule')" name="assignment">
            <a-select
              v-model:value="formState.assignment"
              style="width: 100%"
              placeholder="请选择"
              disabled
            >
              <a-select-option
                :value="i.value"
                v-for="i in assignOptions"
                :key="i.value"
                :title="i.label"
                >{{ i.label }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <div class="mb-20px">
        <a-button type="link" style="padding: 0" @click="handleAddRules">
          <plus-outlined />
          {{ t('sys.pageDesigner.addAssignRule') }}
        </a-button>

        <template v-for="(item, index) in formState.rules" :key="index">
          <div class="assign-rule-item">
            <a-form-item-rest>
              <a-select v-model:value="item.from" allowClear class="w215px" placeholder="请选择">
                <a-select-option
                  :value="i.field"
                  v-for="i in fromOptions(item.from)"
                  :key="i.id"
                  :title="i.name"
                  >{{ i.name }}</a-select-option
                >
              </a-select>
            </a-form-item-rest>
            <div class="w60px rule-item-text">更新为</div>
            <a-form-item-rest>
              <a-select v-model:value="item.to" allowClear class="w215px" placeholder="请选择">
                <a-select-option
                  :value="i.field"
                  v-for="i in toOptions"
                  :key="i.id"
                  :title="i.name"
                  >{{ i.name }}</a-select-option
                >
              </a-select>
            </a-form-item-rest>
            <span
              v-show="formState.rules.length > 0"
              @click="deleteList(index)"
              title="删除"
              class="icon-shanchu iconfont cursor-pointer text-[#797A7D] ml8px rule-item-icon"
            ></span>
          </div>
        </template>
      </div>

      <a-row :gutter="16">
        <a-col :span="4">{{ t('sys.pageDesigner.assignIsNoRepeat') }}</a-col>
        <a-col :span="4">
          <a-form-item label="" name="enableNoRepeat">
            <a-switch
              style="float: right"
              v-model:checked="formState.enableNoRepeat"
              @change="handleSwitchChange"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16" v-if="formState.enableNoRepeat">
        <a-col :span="8">
          <a-form-item
            :label="t('sys.pageDesigner.noRepeatIdent')"
            name="noRepeatId"
            :rules="[
              {
                required: true,
                message: `${t('sys.pleaseSelectSth', {
                  sth: t('sys.pageDesigner.noRepeatIdent'),
                })}`,
              },
            ]"
          >
            <a-select
              v-model:value="formState.noRepeatId"
              allowClear
              style="width: 100%"
              placeholder="请选择"
            >
              <a-select-option
                :value="i.field"
                v-for="i in fromFieldOptions"
                :key="i.id"
                :title="i.name"
                >{{ i.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts" name="add-assignment-rule-modal">
  import { ref, toRaw, computed, reactive, onBeforeMount, watch } from 'vue';
  import { props } from '/@page-designer/hooks/usePropEditor';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const formRef = ref<FormInstance>();
  const formState = reactive<{
    refTable: string | undefined;
    sourceTab: string;
    assignment: string;
    rules: any[];
    enableNoRepeat: boolean;
    noRepeatId: string | undefined;
  }>({
    refTable: undefined,
    sourceTab: defProps.widget?.props.tableSelect?.id,
    assignment: '1',
    rules: [],
    enableNoRepeat: false,
    noRepeatId: undefined,
  });
  const resolveCallback = ref();
  const visible = ref(false);
  const { allTableWidget, allSubTableWidget } = useDesigner();
  const toOptions = ref<any[]>([]);
  const fromFieldOptions = ref<any[]>([]);

  const allTableOptions = computed(() => {
    const list = [...allTableWidget.value, ...allSubTableWidget.value].map((i) => ({
      value: i.id,
      label: `${t(i.alias)}(${i.id})`,
      type: i.type,
      preLocation: i.preLocation,
      children: i.children,
      alias: i.alias,
      bindModelKey: i.props.bindModelKey || i.props.model,
    }));
    return list;
  });

  const getModelFields = async (modelKey) => {
    const result: any =
      (await getModelMetaDetail({
        modelKey: modelKey,
      })) || {};
    return result.fieldMetaList?.map((i) => ({
      id: i.id,
      field: i.key,
      modelKey: i.modelKey,
      name: `${t(result.name)}.${t(i.name)}`,
    }));
  };

  const tabOptions = computed(() => {
    const tableSelect = defProps.widget?.props.tableSelect;
    return [{ value: tableSelect.id, label: tableSelect.alias }];
  });

  const fromOptions = computed(() => {
    return (val) => {
      const list = formState.rules.map((i) => i.from).filter((v) => v !== val) || [];
      return fromFieldOptions.value.filter((i) => !list.includes(i.field));
    };
  });

  const assignOptions = computed(() => [{ value: '1', label: '增量赋值' }]);

  onBeforeMount(async () => {
    toOptions.value = (await getModelFields(defProps.widget?.props.tableSelect.props.model)) || [];
  });

  watch(
    () => formState.refTable,
    async (val) => {
      const findItem = allTableOptions.value.find((i) => i.value === val);
      if (findItem?.bindModelKey) {
        fromFieldOptions.value = (await getModelFields(findItem?.bindModelKey)) || [];
      }
    },
  );

  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    const values = toRaw(formState);
    resolveCallback.value(values);
  };

  const handleChange = async (val) => {
    if (val) {
      formState.rules.forEach((i) => {
        i.from = undefined;
      });
    } else {
      formState.rules = [];
      formState.enableNoRepeat = false;
    }
    formState.noRepeatId = undefined;
  };

  const handleSwitchChange = (val) => {
    if (!val) {
      formState.noRepeatId = undefined;
    }
  };

  const handleAddRules = () => {
    const item = {
      from: undefined,
      to: undefined,
    };
    formState.rules.push(item);
  };

  const deleteList = (index) => {
    formState.rules.splice(index, 1);
  };

  const open = async (formData: Partial<typeof formState> = {}): Promise<typeof formState> => {
    for (let key in formState) {
      switch (key) {
        case 'rules':
          formState['rules'] = formData['rules'] || [];
          break;
        case 'assignment':
          formState['assignment'] = formData['assignment'] || '1';
          break;
        case 'enableNoRepeat':
          formState['enableNoRepeat'] = formData['enableNoRepeat'] ?? false;
          break;
        case 'sourceTab':
          formState['sourceTab'] = formData['sourceTab'] || defProps.widget?.props.tableSelect?.id;
          break;
        default:
          formState[key] = formData[key];
          break;
      }
    }
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };

  const afterClose = () => {
    formRef.value?.resetFields();
    formState['rules'] = [];
  };

  defineExpose({ open });
</script>

<style scoped lang="less">
  .assign-rule-item {
    display: flex;
    margin-bottom: 10px;
    .rule-item-text {
      text-align: center;
      line-height: 32px;
    }
    .rule-item-icon {
      line-height: 32px;
      font-size: 18px;
    }
  }
</style>
