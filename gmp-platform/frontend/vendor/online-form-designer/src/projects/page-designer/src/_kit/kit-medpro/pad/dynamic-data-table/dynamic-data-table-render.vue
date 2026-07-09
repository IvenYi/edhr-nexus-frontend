<template>
  <div class="data-collection-table">
    <vxe-grid
      class="vxetable"
      round
      :row-config="{ isHover: true, useKey: true, keyField: 'id', isCurrent: true }"
      :data="computedTableData"
      min-height="88"
      :columns="tableColumns"
    >
      <template #seq="{ rowIndex }">
        <span>{{ rowIndex + 1 }}</span>
      </template>
      <template #name="{ row }">
        <span class="required-asterisk" v-if="row.required_">*</span>
        <span>{{ row.name_ }}</span>
        <div v-if="numberRange(row)" :style="{ fontSize: '11px', lineHeight: '11px' }">
          {{ numberRange(row) }}
        </div>
      </template>
      <template #value="{ row }">
        <span>{{ getRowValue(row) }}</span>
      </template>
      <template #operate="{ row }">
        <van-button size="small" class="edit-btn" @click="handleEdit(row)"> 编辑 </van-button>
      </template>
      <template #empty>
        <van-empty description="暂无数据" />
      </template>
    </vxe-grid>

    <!-- 详情编辑弹窗 -->
    <detail-popup
      ref="detailPopupRef"
      :data-collection="currentDataCollection"
      @save-value="onSaveValue"
    />
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-data-table-pad">
  import { ref, toRefs, computed } from 'vue';
  import { BindCmpStyleEnum, FormComponents } from '/@page-designer/enum';
  import { getUserListByTenantId } from '/@/apis/gct-platform/UserController';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE } from '@gct/runtime';
  import { buildShortUUID } from '/@/utils/uuid';

  import DetailPopup from './detail.vue';

  const props = defineProps<{ widget }>();
  const { widgetsMap } = toRefs(props.widget?.props);
  // 表格列定义
  const tableColumns = computed((): any[] => {
    const columns: any[] = [
      { type: 'seq', width: 60, title: '序号', align: 'center' },
      { field: 'name_', title: '数据采集项名称', align: 'left', slots: { default: 'name' } },
      { field: 'value_', title: '值', align: 'center', slots: { default: 'value' } },
      { field: 'tip_text_', title: '参考值', align: 'center', width: 120 },
    ];
    if (!isReadonly.value) {
      columns.push({
        field: 'operate',
        title: '操作',
        align: 'center',
        slots: { default: 'operate' },
      });
    }
    return columns;
  });

  const dcData = ref<any>([]);

  const isReadonly = ref(false);

  // 详情弹窗相关状态
  const detailPopupRef = ref(null);
  const currentDataCollection = ref({});

  const computedTableData = computed(() => {
    return dcData.value.map((item) => {
      const raw = item.value_ ?? item.default_value_;
      let value;
      if (item.type_ === 'boolean') {
        const isTrue = raw === true || raw === 'true' || raw === 1 || raw === '1';
        const isFalse = raw === false || raw === 'false' || raw === 0 || raw === '0';
        if (isTrue) {
          value = item.true_text_ ?? '真';
        } else if (isFalse) {
          value = item.false_text_ ?? '假';
        } else {
          value = '--';
        }
      } else {
        value = raw ?? '--';
      }
      return {
        ...item,
        value,
      };
    });
  });

  const getWidgetType = (val) => {
    let fieldType: FormComponents;
    if (val.type_ === 'boolean') {
      fieldType = FormComponents.Switch;
    } else if (val.type_ === 'decimal') {
      if (val.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Inputnumber;
      }
    } else if (val.type_ === 'integer') {
      if (val.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Inputnumber;
      }
    } else if (val.type_ === 'string') {
      if (val.show_type_ === 'select') {
        fieldType = FormComponents.Select;
      } else {
        fieldType = FormComponents.Input;
      }
    } else if (val.type_ === 'user') {
      fieldType = FormComponents.Userpicker;
    } else if (val.type_ === 'org') {
      fieldType = FormComponents.Department;
    } else if (val.type_ === 'date') {
      fieldType = FormComponents.Datepicker;
    } else if (val.type_ === 'date_time') {
      fieldType = FormComponents.DateTimepicker;
    } else if (val.type_ === 'image') {
      fieldType = FormComponents.UploadImage;
    } else if (val.type_ === 'attachment') {
      fieldType = FormComponents.UploadImage;
    } else {
      fieldType = FormComponents.Input;
    }
    return fieldType;
  };

  const numberRange = (val) => {
    let text;
    if (val.type_ === 'decimal') {
      text = `上限：${val.max_decimal_} 下限：${val.min_decimal_}`;
    } else if (val.type_ === 'integer') {
      text = `上限：${val.max_int_} 下限：${val.min_int_}`;
    }
    return text;
  };

  // 统一规范默认值的类型，避免字符串/数字/布尔在各组件中出现类型不一致
  const toBool = (x: any) => {
    if (typeof x === 'boolean') return x;
    if (typeof x === 'number') return x === 1;
    if (typeof x === 'string') {
      const s = x.trim().toLowerCase();
      if (!s) return undefined;
      return s === 'true' || s === '1';
    }
    return undefined;
  };
  const toNumber = (x: any) => {
    if (x === '' || x === null || x === undefined) return undefined;
    const n = Number(x);
    return Number.isFinite(n) ? n : undefined;
  };
  const normalizeDefaultValue = (row: any) => {
    switch (row?.type_) {
      case 'boolean':
        return toBool(row.default_value_);
      case 'decimal':
      case 'integer':
        return toNumber(row.default_value_);
      case 'date':
      case 'date_time':
        return row.default_value_ || undefined;
      case 'attachment':
        return row.default_value_;
      case 'string':
      default:
        return row.default_value_ ?? undefined;
    }
  };

  const userDataNotOrg = ref<any[]>([]);
  const orgData = ref<any[]>([]);

  // 查询所有的部门
  const getOrgData = async () => {
    const data = (await getDesignerCommonGetCanBeUsedOrg()) ?? [];
    orgData.value = data.map((e) => {
      return { ...e, formatId: `ORG:${e.id}` };
    });
  };

  // 查询部门下的人员
  const getUserDataNotOrg = async () => {
    userDataNotOrg.value = ((await getUserListByTenantId()) ?? []).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  };

  const getRowValue = (row) => {
    let showValue = row.value ?? row.value_;
    if (row.type_ === 'user') {
      showValue = userDataNotOrg.value.find((n) => n.id === showValue)?.fullname ?? '';
    }
    if (row.type_ === 'org') {
      showValue = orgData.value.find((n) => n.id === showValue)?.name ?? '';
    }
    return showValue;
  };

  // 处理编辑按钮点击
  const handleEdit = async (row) => {
    const type = getWidgetType(row);
    let widgetSchema = cloneDeep(widgetsMap?.value[type]);
    widgetSchema.name = row.name_;
    // widgetSchema.props.readonly = props.collectionItem.status == 'submitted';
    // ⬇️ 根据show_type_生成对应render描述
    widgetSchema.id = buildShortUUID(type);
    widgetSchema.props.label = row.name_;
    widgetSchema.props.field = 'value_';
    widgetSchema.props.modelKey = 'em_data_collection_entry';
    widgetSchema.props.fieldType = row.type_;
    widgetSchema.props.required = !!row.required_;
    if (row.type_ == 'attachment') {
      // 移动端附件因为无法预览 目前用图片的组件来展示，对其他的文件类型做隐藏
      const defaultList = row.default_value_?.split?.(',') ?? [];
      const list = defaultList.filter((i) => {
        const type = i.split('.').at(-1);
        return ['jpg', 'jpeg', 'png', 'bmp', 'gif'].includes(type);
      });
      const otherList = defaultList.filter((i) => !list.includes(i));
      row.default_value_other_ = otherList.join();
      row.default_value_ = list.join();
      widgetSchema.props.defaultValueOther = row.default_value_other_;
    }
    const _defaultValue = normalizeDefaultValue(row);
    widgetSchema.props.defaultValue = _defaultValue;
    widgetSchema.props.precision = row.digits_ || 0;
    widgetSchema.props.maxValue = row.max_decimal_ ?? row.max_int_;
    widgetSchema.props.minValue = row.min_decimal_ ?? row.min_int_;
    widgetSchema.value_ = row.value_ ?? _defaultValue;
    if (row.show_type_ === 'select') {
      widgetSchema.props.options =
        (row.options_ ?? '').split(',').map((item) => {
          return {
            label: item,
            value: item,
          };
        }) ?? [];
    }
    if (row.type_ === 'boolean') {
      if (row.show_type_ === 'radio') {
        widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
      } else if (row.show_type_ === 'select') {
        widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_SELECT_LIST;
      } else if (!row.show_type_) {
        widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
      }
      widgetSchema.props.options = widgetSchema.props.customOptions = [
        {
          label: row.true_text_ || '真',
          value: true,
        },
        {
          label: row.false_text_ || '假',
          value: false,
        },
      ];
    }
    if (type === FormComponents.Userpicker) {
      widgetSchema.props.fieldType = FIELD_TYPE.USER;
    }
    if (type === FormComponents.Department) {
      widgetSchema.props.fieldType = FIELD_TYPE.ORG;
    }
    currentDataCollection.value = {
      ...widgetSchema,
      ...row,
      value_: row.value_ ?? row.default_value_,
    };
    detailPopupRef.value?.onOpen();
  };

  // 详情弹窗保存后，更新当前选中行的值
  const onSaveValue = ({ id_, value_ }) => {
    if (currentDataCollection.value && currentDataCollection.value.id === id_) {
      currentDataCollection.value.value_ = value_;
    }
    // 同步更新表格数据 dcData 中对应项的值
    if (Array.isArray(dcData.value) && dcData.value.length) {
      const idx = dcData.value.findIndex((item) => item.id_ === id_);
      if (idx !== -1) {
        dcData.value[idx] = { ...dcData.value[idx], value_ };
        // 触发响应式更新
        dcData.value = [...dcData.value];
      }
    }
  };

  defineExpose({
    async setDataSource(data) {
      dcData.value = data?.data.map((item) => {
        const _defaultValue = normalizeDefaultValue(item);
        return {
          ...item,
          id_: item.id_ ?? buildShortUUID(item.type_),
          value_: item.value_ ?? _defaultValue,
        };
      });

      if (data?.data.some((n) => n.type_ === 'org')) {
        await getOrgData();
      }
      if (data?.data.some((n) => n.type_ === 'user')) {
        await getUserDataNotOrg();
      }
    },

    getDataSource() {
      return dcData.value;
    },

    setReadonly(bool) {
      isReadonly.value = bool;
    },
  });
</script>

<style lang="less" scoped>
  .data-collection-table {
    padding: 0 36px;
  }
  .required-asterisk {
    color: #ff4d4f;
    margin-right: 4px;
  }
</style>
