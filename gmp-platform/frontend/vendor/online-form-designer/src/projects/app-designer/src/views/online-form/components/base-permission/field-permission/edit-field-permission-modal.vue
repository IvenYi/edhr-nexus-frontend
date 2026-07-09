<template>
  <div :class="ns.b()">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane v-for="item in modelMetaArr" :key="item.modelKey" :tab="item.title">
        <a-table :columns="tableColumns" :data-source="activeFields" :pagination="false">
          <template #headerCell="{ column }">
            <template v-if="column.dataIndex === 'edit'">
              <span @click="setAllEdit"
                >{{ $t('sys.appDesigner.timedTask.grid.actions.edit') }}
                <a-checkbox
                  :disabled="readonly"
                  :checked="isAllEdit"
                  :indeterminate="editIndeterminate"
              /></span>
            </template>
            <template v-if="column.dataIndex === 'readonly'">
              <span @click="setAllReadonly"
                >{{ $t('sys.pageDesigner.readonly') }}
                <a-checkbox
                  :disabled="readonly"
                  :checked="isAllReadonly"
                  :indeterminate="readonlyIndeterminate"
              /></span>
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'edit'">
              <a-radio
                :checked="record.edit"
                size="small"
                :disabled="readonly"
                @change="(e) => onEditChange(e, record)"
              />
            </template>
            <template v-if="column.dataIndex === 'readonly'">
              <a-radio
                :checked="record.readonly"
                size="small"
                :disabled="readonly"
                @change="(e) => onReadonlyChange(e, record)"
              />
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts" name="edit-field-permission-modal">
  import { computed, ref } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import { ModelMeta, FieldPermissionConfig, FieldPermissionTableRow } from './type';
  import { omit } from 'lodash-es';
  import { FIELD_TYPE_LABEL_MAP } from '/@online-form/views/designer/constants/index';

  const ns = useNamespace('edhr-outline-modal');

  const props = withDefaults(
    defineProps<{
      modelMetaArr: ModelMeta[];
      fieldConfigs?: FieldPermissionConfig[];
      readonly: boolean;
    }>(),
    {
      fieldConfigs: () => [],
    },
  );

  const dataSource = ref<FieldPermissionTableRow[]>([]);

  /** 初始化数据源 */
  function initDataSource() {
    const map = new Map<string, FieldPermissionConfig>();
    props.fieldConfigs.forEach((item) => {
      const key = `${item.modelKey}-${item.field}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    props.modelMetaArr.forEach((model) => {
      model.fields.forEach((field) => {
        const key = `${model.modelKey}-${field.key}`;
        const oldConfig = map.get(key);
        dataSource.value.push({
          modelKey: model.modelKey,
          fieldName: field.name!,
          field: field.key,
          type: field.type! as any,
          typeLabel: FIELD_TYPE_LABEL_MAP[field.type!],
          subModel: model.subModel,
          edit: oldConfig?.edit ?? true,
          readonly: oldConfig?.readonly ?? false,
        });
      });
    });
  }
  initDataSource();

  /** 当前选中的分页的模型key */
  const activeKey = ref(props.modelMetaArr[0]?.modelKey || '');
  /** 当前选中模型的所有字段配置 */
  const activeFields = computed(() => {
    return dataSource.value.filter((item) => item.modelKey === activeKey.value);
  });
  /** 是否所有字段均为编辑 */
  const isAllEdit = computed(() => {
    return activeFields.value.every((item) => item.edit);
  });

  /** 是否所有字段均为只读 */
  const isAllReadonly = computed(() => {
    return activeFields.value.every((item) => item.readonly);
  });

  const editIndeterminate = computed(() => {
    return activeFields.value.some((e) => e.edit) && activeFields.value.some((e) => !e.edit);
  });
  const readonlyIndeterminate = computed(() => {
    return (
      activeFields.value.some((e) => e.readonly) && activeFields.value.some((e) => !e.readonly)
    );
  });

  const tableColumns = [
    {
      title: $t('sys.appDesigner.approval.fieldName'),
      dataIndex: 'fieldName',
    },
    {
      title: $t('sys.keyOfSth', { sth: $t('sys.field') }),
      dataIndex: 'field',
    },
    {
      title: $t('sys.bi.fieldType'),
      dataIndex: 'typeLabel',
    },
    {
      title: $t('sys.appDesigner.timedTask.grid.actions.edit'),
      dataIndex: 'edit',
    },
    {
      title: $t('sys.pageDesigner.readonly'),
      dataIndex: 'readonly',
    },
  ];

  /** 单个字段设置编辑 */
  const onEditChange = (e, record) => {
    console.log('onEditChange', e, record);
    if (e.target.checked) {
      Object.assign(record, { edit: true, readonly: false });
    }
  };

  /** 单个字段设置只读 */
  const onReadonlyChange = (e, record) => {
    console.log('onReadonlyChange', e, record);
    if (e.target.checked) {
      Object.assign(record, { edit: false, readonly: true });
    }
  };

  /** 所有字段设置编辑 */
  const setAllEdit = () => {
    if (props.readonly) {
      return;
    }
    activeFields.value.forEach((item) => {
      Object.assign(item, { edit: true, readonly: false });
    });
  };

  /** 所有字段设置只读 */
  const setAllReadonly = () => {
    if (props.readonly) {
      return;
    }
    activeFields.value.forEach((item) => {
      Object.assign(item, { edit: false, readonly: true });
    });
  };

  function toFieldConfigs(): FieldPermissionConfig[] {
    return dataSource.value.map((item) => omit(item, 'type'));
  }

  useModal(async () => {
    return {
      ok: true,
      data: toFieldConfigs(),
    };
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-modal) {
    padding: 12px;
  }
</style>
