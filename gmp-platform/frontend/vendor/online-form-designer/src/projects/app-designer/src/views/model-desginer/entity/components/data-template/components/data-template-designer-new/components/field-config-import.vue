<template>
  <a-form :model="configJson" ref="configFormRef" :colon="false" autocomplete="off" class="new-form">
    <div class="template-config">
      <div class="title py4px">{{ t('sys.appDesigner.templateConfig') }}</div>
      <div class="mt8px bg-[#FBFBFC] pt16px pb1px px12px">
        <a-form-item
          :label="t('sys.app.uniqueColumns')"
          name="uniqueColumns"
          :key="!(exportModel.length === 1 && exportModel[0] === ImportModeEnum.NEW)"
          :rules="[
            {
              required: !(exportModel.length === 1 && exportModel[0] === ImportModeEnum.NEW),
              message: t('sys.chooseTextTip', { name: t('sys.app.uniqueColumns') }),
            },
          ]"
        >
          <a-select
            v-model:value="configJson.uniqueColumns"
            mode="multiple"
            :options="columnsOptions"
            :placeholder="t('sys.app.uniqueColumnsTip')"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            :showSearch="false"
            :maxTagCount="5"
            :maxTagTextLength="6"
            allowClear
            style="width: 424px"
            showArrow
          />
        </a-form-item>
        <a-form-item :label="t('sys.app.required')" name="required">
          <a-select
            v-model:value="configJson.required"
            :options="requiredOptions"
            :placeholder="t('sys.app.requiredColumnsTip')"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            mode="multiple"
            :showSearch="false"
            :maxTagCount="5"
            :maxTagTextLength="6"
            allowClear
            style="width: 424px"
            showArrow
          />
        </a-form-item>
      </div>
    </div>
    <slot></slot>
    <div v-show="userList.length || refList.length" class="field-config mt24px">
      <div class="title py4px">{{ t('sys.pageDesigner.fieldConfigProp') }}</div>
      <div class="mt8px bg-[#FBFBFC] pt16px pb1px px12px">
        <div v-show="userList.length" class="text-[#666666] mb16px px4px">{{
          t('sys.app.userConfigTip')
        }}</div>
        <a-form-item v-for="item in userList" :key="item.id" :label="item.aliasName || item.name">
          <a-select
            v-model:value="configJson[item.id]"
            :options="
              userOptions.map((e) => {
                return {
                  ...e,
                  disabled: configJson[item.id]?.length <= 1 && configJson[item.id][0] === e.id,
                };
              })
            "
            :fieldNames="{ label: 'name', value: 'id' }"
            :placeholder="t('sys.chooseText')"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            mode="multiple"
            :showSearch="false"
            :maxTagCount="5"
            :maxTagTextLength="6"
            showArrow
            style="width: 424px"
            @change="(val, data) => onSelectChange(val, data, item.id)"
          >
            <template #tagRender="{ label, onClose }">
              <a-tag
                :closable="configJson[item.id].length > 1"
                style="margin-right: 3px"
                @close="onClose"
              >
                <span class="text-[14px] color-[rgba(0,0,0,.85)]">{{ label }}</span>
              </a-tag>
            </template>
          </a-select>
        </a-form-item>
        <div v-show="refList.length" class="text-[#666666] mb16px px4px">{{
          t('sys.app.refConfigTip')
        }}</div>
        <a-form-item
          v-for="item in refList"
          :key="item.id"
          :label="item.aliasName || item.name"
          :name="item.id"
          :rules="[{ required: true, message: t('sys.app.selectImportRefTip') }]"
        >
          <a-select
            v-model:value="configJson[item.id]"
            :options="returnRefOptions(item.bindInfo)"
            :fieldNames="{ label: 'name', value: 'id' }"
            :placeholder="t('sys.chooseText')"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            mode="multiple"
            allowClear
            showArrow
            :showSearch="false"
            :maxTagCount="5"
            :maxTagTextLength="6"
            style="width: 424px"
            @change="(val, data) => onSelectChange(val, data, item.id)"
          />
        </a-form-item>
      </div>
    </div>
    <div v-show="numList.length" class="field-config mt24px">
      <div class="title py4px">{{ t('sys.app.specFieldConfig') }}</div>
      <div class="mt8px bg-[#FBFBFC] pt16px pb1px px12px">
        <div class="text-[#666666] mb16px px4px">{{ t('sys.app.numConfigTip') }}</div>
        <a-form-item v-for="item in numList" :key="item.id" :label="item.aliasName || item.name">
          <a-checkbox-group
            v-model:value="configJson[item.id]"
            @change="(val) => onNumChange(val, item.id)"
          >
            <a-checkbox
              :value="0"
              :disabled="configJson[item.id]?.length === 1 && configJson[item.id][0] === 0"
            >
              {{ t(`sys.pageDesigner.bindCmpStyle.bindNumber`) }}
            </a-checkbox>
            <a-checkbox
              :value="1"
              :disabled="configJson[item.id]?.length === 1 && configJson[item.id][0] === 1"
            >
              {{ t(`sys.pageDesigner.bindCmpStyle.bindCurrency`) }}
            </a-checkbox>
            <a-checkbox
              v-show="[FIELD_TYPE.LONG, FIELD_TYPE.INTEGER].includes(item.type)"
              :value="2"
              :disabled="configJson[item.id]?.length === 1 && configJson[item.id][0] === 2"
            >
              {{ t(`sys.pageDesigner.bindCmpStyle.bindTime`) }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </div>
    </div>
  </a-form>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CreateType, FIELD_TYPE } from '/@/enums/appEnum';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { COLUMN_FIELD, PickKeys, USER_CONFIG_OPTS } from '../../../constant/columns';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { cloneDeep, pick } from 'lodash-es';
  import { ImportModeEnum } from '../../../type';
  import { useDesigner } from '../hook/useDesigner';

  const props = defineProps<{
    form: object;
    columns: object[];
  }>();

  const emit = defineEmits(['update:columns']);
  const { exportModel } = useDesigner();
  const { orgSetting } = useOrgSetting();
  const { t } = useI18n();
  const configFormRef = ref();

  const configJson = computed({
    get() {
      return props.columns.reduce((obj, e: any) => {
        if (isRefType(e.type, e.createType, e.key)) {
          obj[e.id] = e.relationColumns?.map((f) => f.id) || [];
        }
        if (isUserType(e.type)) {
          if (!e.relationColumns) {
            e.relationColumns = userOptions.value.filter((f) => f.id === 'username');
          }
          obj[e.id] = e.relationColumns?.map((f) => f.id);
        }
        if (isNumType(e.type)) {
          if (!e.numberFormats) {
            e.numberFormats = [0];
          }
          obj[e.id] = e.numberFormats;
        }
        return obj;
      }, props.form);
    },
    set(value) {
      Object.assign(props.form, value);
    },
  });

  const userList = computed(() => {
    return props.columns.filter((e) => isUserType(e.type));
  });

  const refList = computed(() => {
    return props.columns.filter((e: any) => isRefType(e.type, e.createType, e.key));
  });

  const numList = computed(() => {
    return props.columns.filter((e) => isNumType(e.type));
  });

  const userOptions = computed(() => {
    const exts =
      orgSetting.extFieldConfigs?.map((e) => {
        return {
          ...e,
          key: e.relationField,
          name: e.fieldName,
        };
      }) || [];
    return [...USER_CONFIG_OPTS, ...exts];
  });

  const columnsOptions = computed(() => {
    return props.columns.map((e) => {
      return {
        notNeedRequired: e.notNeedRequired,
        label: e.aliasName || e.name,
        value: e.id,
      };
    });
  });

  const requiredOptions = computed(() => {
    return columnsOptions.value.filter((e) => !e.notNeedRequired);
  });

  const onSelectChange = (val, data, fId) => {
    updateColumns(fId, 'relationColumns', data);
  };

  const onNumChange = (data, fId) => {
    updateColumns(fId, 'numberFormats', data);
  };

  function updateColumns(fId, key, data) {
    emit(
      'update:columns',
      props.columns.map((e: any) => {
        if (e.id === fId) {
          e[key] = [...data];
        }
        return e;
      }),
    );
  }

  function isRefType(type, createType, key) {
    return (
      [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(type) ||
      (createType === CreateType.BUILTIN && key === 'parent_id_')
    );
  }

  function isUserType(type) {
    return [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(type);
  }

  function isNumType(type) {
    return [FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL, FIELD_TYPE.DOUBLE].includes(
      type,
    );
  }

  const refOptions = ref<object>({});
  function returnRefOptions(modelKey) {
    if (!refOptions.value[modelKey]) {
      getModelFields(modelKey);
    }
    return refOptions.value[modelKey] || [];
  }

  async function getModelFields(modelKey) {
    const res =
      (await getFieldMetaList({
        modelKey,
        sys: false,
      })) || [];
    refOptions.value[modelKey] = res
      .filter((e: any) => {
        return [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.LONG,
          FIELD_TYPE.INTEGER,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.DECIMAL,
          FIELD_TYPE.DATE,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE_TIME,
        ].includes(e.type);
      })
      .map((e) => {
        const obj = cloneDeep(COLUMN_FIELD);
        Object.assign(obj, pick(e, PickKeys));
        return obj;
      });
  }

  const validate = async () => {
    return new Promise((resolve) => {
      configFormRef.value
        ?.validate()
        .then((res) => {
          resolve(true);
        })
        .catch((error) => {
          resolve(false);
        });
    });
  };

  defineExpose({
    validate,
  });
</script>
<style lang="less" scoped>
  .title {
    display: flex;
    align-items: center;
    font-size: 16px;

    &::before {
      content: ' ';
      display: block;
      width: 3px;
      height: 16px;
      margin-right: 8px;
      background-color: var(--ant-primary-color);
    }
  }

  :deep(.ant-checkbox) {
    color: #212528;
  }

  :deep(.ant-tag) {
    background-color: #f5f5f5;
  }

  :deep(.ant-form-item-label > label) {
    display: block;
    position: relative;
    width: 118px;
    padding-right: 14px;
    overflow: hidden;
    line-height: 32px;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;

    &::after {
      content: ':';
      position: absolute;
      top: 0;
      right: 0;
    }
  }
</style>
