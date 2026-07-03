<template>
  <van-popup
    v-model:show="drawerVisible"
    destroy-on-close
    :close-on-click-overlay="false"
    position="right"
    :style="{ width: '800px', height: '100%' }"
    :teleport="teleport"
    @close="afterClose"
  >
    <div class="popup-container">
      <div class="popup-title ks-row-middle pl-16px pr-16px">
        <div class="ks-col">{{ drawerTitle }}</div>
        <i class="gct-iconfont icon-guanbi-Paddanchuang" @click="onClose"></i>
      </div>
      <div class="ks-col relative popup-content">
        <div class="dc-name">{{ collectionItem.name }}</div>
        <div class="data-collection-table">
          <van-form ref="formRef" :key="indexkey">
            <van-cell-group inset>
              <van-field
                v-for="record in formRows"
                :key="record.id_"
                :label="record.name ?? record.name_"
                :required="!!record.required_"
                label-width="12em"
                :model-value="record.value_"
                :rules="getFieldRules(record)"
              >
                <template #input>
                  <div v-if="collectionItem.status === 'submitted'"> {{ record.value }}</div>
                  <template v-else>
                    <select-field
                      v-if="record?.type_ === 'select' || record?.show_type_ === 'select'"
                      class="hidden-label"
                      :widget="record"
                      :rowValue="record"
                      :index="0"
                    />
                    <field-widget
                      class="hidden-label"
                      v-else
                      :widget="record"
                      :rowValue="record"
                      :index="0"
                    />
                  </template>
                </template>
                <template
                  #left-icon
                  v-if="
                    (record.type_ === 'decimal' || record.type_ === 'integer') &&
                    (record.show_limit_ || record.show_limit_ === undefined) &&
                    (record.remind_enabled_ || record.validate_range_)
                  "
                >
                  <van-popover
                    :key="record.id_"
                    v-model:show="leftTipPopoverShow[record.id_]"
                    theme="dark"
                  >
                    <div class="tip-text p-8px">
                      <span v-if="record?.maxValue" class="mr-8px"
                        >上限： {{ record.maxValue }}</span
                      >
                      <span v-if="record?.minValue">下限： {{ record.minValue }}</span>
                    </div>
                    <template #reference>
                      <van-icon
                        name="warning-o"
                        @click.stop="
                          leftTipPopoverShow[record.id_] = !leftTipPopoverShow[record.id_]
                        "
                      />
                    </template>
                  </van-popover>
                </template>
                <template #right-icon v-if="record.tip_text_">
                  <van-popover
                    :key="record.id_"
                    v-model:show="tipPopoverShow[record.id_]"
                    theme="dark"
                  >
                    <div class="tip-text p-8px">{{ record.tip_text_ }}</div>
                    <template #reference>
                      <van-icon
                        name="info-o"
                        @click.stop="tipPopoverShow[record.id_] = !tipPopoverShow[record.id_]"
                      />
                    </template>
                  </van-popover>
                </template>
              </van-field>
            </van-cell-group>
          </van-form>
        </div>
      </div>
      <div class="popup-bottom ks-row-middle pl-16px pr-16px" v-if="!isReadonly">
        <div class="ks-col ks-col-4">
          <van-button @click="handleReset">重置</van-button>
        </div>
        <div class="ks-col ks-col-4 text-center">
          <van-button type="default" @click="handleTemporary"> 暂存 </van-button>
        </div>
        <div class="ks-col ks-col-4 text-right">
          <van-button type="primary" @click="handleSubmit">提交</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import { BindCmpStyleEnum, FormComponents } from '/@page-designer/enum';
  import { FIELD_TYPE } from '@gct/runtime';
  import { cloneDeep, isNil } from 'lodash-es';
  import { buildShortUUID } from '/@/utils/uuid';
  import { showToast } from 'vant';

  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';
  import { TypeNames, StatusEnum } from '../types';
  import { getUserListByTenantId } from '/@/apis/gct-platform/UserController';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';

  import fieldWidget from '/@page-designer/components/widgets/pad/__components__/fieldByList/index.vue';
  import selectField from './select-field.vue';

  const props = defineProps<{
    collectionItem: any;
    widget;
    widgetsMap;
  }>();

  const { teleport } = usePadTeleport();

  const emit = defineEmits(['handleLoad']);

  const Event = getPageEvent();

  const formRef = ref();
  const tipPopoverShow = ref<Record<string, boolean>>({});
  const leftTipPopoverShow = ref<Record<string, boolean>>({});
  const drawerVisible = ref<boolean>(false);
  const temporaryLoading = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);
  const dcData = ref<any>([]);
  const formRows = ref<any[]>([]);

  const userDataNotOrg = ref<any[]>([]);
  const orgData = ref<any[]>([]);

  const isReadonly = computed(() => props.collectionItem?.status === StatusEnum.SUBMITTED);

  const drawerTitle = computed(() => TypeNames[props.collectionItem?.type] || '数据采集');

  /** 根据字段 schema 生成 van-form rules */
  const getFieldRules = (record: any) => {
    const rules: any[] = [];
    const { type_, required_, validate_range_, auto_fix_, validate_true_, validate_false_ } =
      record;

    // 必填校验
    if (required_) {
      rules.push({
        required: true,
        message: `${record.name} 不能为空`,
        trigger: 'onChange',
      });
    }
    if (type_ === 'boolean') {
      if (validate_true_ || validate_false_) {
        rules.push({
          trigger: 'onChange',
          validator: (val) => {
            if (validate_true_ && val != true) return '该布尔值不能为假';
            if (validate_false_ && val != false) return '该布尔值不能为真';
            return true;
          },
        });
      }
    }

    // 数值类型：自动修复通过 min/max 限制；期望范围校验
    if ((type_ === 'integer' || type_ === 'decimal') && !auto_fix_) {
      const minVal = isNil(record.min_decimal_) ? record.min_int_ : record.min_decimal_;
      const maxVal = isNil(record.max_decimal_) ? record.max_int_ : record.max_decimal_;
      if (validate_range_ && (!isNil(minVal) || !isNil(maxVal))) {
        rules.push({
          trigger: 'onChange',
          validator: (val) => {
            if (val === null || val === undefined || val === '') return true;
            const num = Number(val);
            if (!isNil(minVal) && num < Number(minVal)) {
              return false;
            }
            if (!isNil(maxVal) && num > Number(maxVal)) {
              return false;
            }
            return true;
          },
          message: (() => {
            const minVal = isNil(record.min_decimal_) ? record.min_int_ : record.min_decimal_;
            const maxVal = isNil(record.max_decimal_) ? record.max_int_ : record.max_decimal_;
            if (!isNil(minVal) && !isNil(maxVal)) return `请输入 ${minVal} 到 ${maxVal} 之间的数字`;
            if (!isNil(minVal)) return `输入值不能小于 ${minVal}`;
            return `输入值不能大于 ${maxVal}`;
          })(),
        });
      }
    }

    return rules;
  };

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

  // 统一规范默认值的类型，避免字符串/数字/布尔在各组件中出现类型不一致
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

  const getWidgetType = (val): FormComponents => {
    if (val.type_ === 'boolean') return FormComponents.Switch;
    if (val.type_ === 'user' || val.type_ === 'user_multi') return FormComponents.Userpicker;
    if (val.type_ === 'org') return FormComponents.Department;
    if (val.type_ === 'date') return FormComponents.Datepicker;
    if (val.type_ === 'date_time') return FormComponents.DateTimepicker;
    if (val.type_ === 'decimal' || val.type_ === 'integer') return FormComponents.Inputnumber;
    // if (val.type_ === 'image' || val.type_ === 'attachment') return FormComponents.UploadImage;
    return FormComponents.Input;
  };

  const getOrgData = async () => {
    const data = (await getDesignerCommonGetCanBeUsedOrg()) ?? [];
    orgData.value = data.map((e) => ({ ...e, formatId: `ORG:${e.id}` }));
  };

  const getUserDataNotOrg = async () => {
    userDataNotOrg.value = ((await getUserListByTenantId()) ?? []).map((e) => ({
      ...e,
      formatId: `USER:${e.id}`,
    }));
  };

  const getCollectionData = async () => {
    const res =
      (await Event.context.$customBizService.post(
        {
          action: 'biz_get_data_collection_details' as any,
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
        },
      )) || [];
    dcData.value = res;
    if (res.some((n) => n.type_ === 'org')) {
      await getOrgData();
    }
    if (res.some((n) => n.type_ === 'user')) {
      await getUserDataNotOrg();
    }
  };

  const handleEdit = (row) => {
    const raw = row.value_ ?? row.default_value_;
    let value: string;
    if (row.type_ === 'boolean') {
      const isTrue = raw === true || raw === 'true' || raw === 1 || raw === '1';
      const isFalse = raw === false || raw === 'false' || raw === 0 || raw === '0';
      value = isTrue ? row.true_text_ ?? '真' : isFalse ? row.false_text_ ?? '假' : '--';
    } else if (row.type_ === 'user') {
      value = userDataNotOrg.value.find((n) => n.id === raw)?.fullname ?? '';
    } else if (row.type_ === 'user_multi') {
      value =
        userDataNotOrg.value
          .filter((n) => raw?.includes(n.id))
          ?.map((n) => n.fullname)
          .join(', ') ?? '';
    } else if (row.type_ === 'org') {
      value = orgData.value.find((n) => n.id === raw)?.name ?? '';
    } else {
      value = raw ?? '--';
    }
    if (row.type_ === 'decimal' || row.type_ === 'integer') {
      row.maxValue = row.max_decimal_ ?? row.max_int_;
      row.minValue = row.min_decimal_ ?? row.min_int_;
    }
    if (props.collectionItem.status === 'submitted') {
      // 如果是提交状态，则返回简单对象
      return { ...row, value };
    }

    const type = getWidgetType(row);
    const widgetSchema = cloneDeep(props.widgetsMap[type]);
    widgetSchema.name = row.name_;
    widgetSchema.props.readonly = false;
    widgetSchema.id = buildShortUUID(type);
    widgetSchema.props.field = 'value_';
    widgetSchema.props.modelKey = 'em_data_collection_entry';
    widgetSchema.props.fieldType = row.type_;
    const _defaultValue = normalizeDefaultValue(row);
    widgetSchema.props.defaultValue = _defaultValue;
    widgetSchema.props.precision = row.digits_ || 0;
    let _value = row.value_ ?? _defaultValue;
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
    if (row.type_ === 'decimal' || row.type_ === 'integer') {
      if (row.auto_fix_) {
        widgetSchema.props.maxValue = row.max_decimal_ ?? row.max_int_;
        widgetSchema.props.minValue = row.min_decimal_ ?? row.min_int_;
      }
      _value = toNumber(_value);
    }
    if (row.show_type_ === 'select') {
      widgetSchema.props.options =
        (row.options_ ?? '').split(',').map((item) => ({
          label: item,
          value: row.type_ === 'decimal' || row.type_ === 'integer' ? Number(item) : item,
        })) ?? [];
    }
    if (row.type_ === 'boolean') {
      if (row.show_type_ === 'radio' || !row.show_type_) {
        widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
      } else if (row.show_type_ === 'select') {
        widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_SELECT_LIST;
      }
      widgetSchema.props.options = widgetSchema.props.customOptions = [
        { label: row.true_text_ || '真', value: true },
        { label: row.false_text_ || '假', value: false },
      ];
      _value = toBool(_value);
    }
    if (type === FormComponents.Department) {
      widgetSchema.props.fieldType = FIELD_TYPE.ORG;
    }
    return {
      ...widgetSchema,
      ...row,
      value_: _value,
      value,
    };
  };

  const onOpen = async (_id) => {
    await getCollectionData();
    formRows.value = dcData.value.map((item) => handleEdit(item));
    await nextTick();
    drawerVisible.value = true;
  };

  const onClose = () => {
    drawerVisible.value = false;
    dcData.value = [];
  };

  const afterClose = async () => {
    Event.runEventByName('afterClosed', props.widget.events);
  };
  const indexkey = ref(0);
  /** 重置回暂存/初始数据状态 */
  async function handleReset() {
    await getCollectionData();
    formRows.value = dcData.value.map((item) => handleEdit(item));
    indexkey.value += 1;
  }

  /** 暂存数据采集数据到暂存表 */
  async function handleTemporary() {
    try {
      temporaryLoading.value = true;
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_stash' as any,
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
          entries_: formRows.value.map((item) => ({
            ...item,
            value_: item.value_ ?? normalizeDefaultValue(item),
          })),
        },
      );
      showToast({ message: '保存成功', zIndex: 9999 });
      emit('handleLoad');
    } catch (e) {
      // showToast({ message: e.subMessage || e.message || '保存失败', zIndex: 9999 });
    } finally {
      temporaryLoading.value = false;
    }
  }

  async function handleSubmit() {
    try {
      await formRef.value?.validate();
      submitLoading.value = true;
      console.log({
        id_: props.collectionItem.id,
        entries_: formRows.value.map((item) => ({
          ...item,
          value_: item.value_ ?? normalizeDefaultValue(item),
        })),
      });
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_submit' as any,
          key: 'em_data_collection_task',
        },
        {
          id_: props.collectionItem.id,
          entries_: formRows.value.map((item) => ({
            ...item,
            value_: item.value_ ?? normalizeDefaultValue(item),
          })),
        },
      );
      showToast('提交成功');
      drawerVisible.value = false;
      emit('handleLoad');
    } catch (e) {
      // showToast({ message: e.subMessage || e.message || '提交失败', zIndex: 9999 });
    } finally {
      submitLoading.value = false;
    }
  }

  defineExpose({ onOpen, onClose });
</script>

<style scoped lang="less">
  .popup-container {
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    flex-direction: column;
    width: 100%;

    .popup-title {
      height: 56px;
      border-bottom: 1px solid #e0e3eb;
      color: #1a1d23;
      font-size: 17px;
      font-weight: 600;
    }
    .popup-content {
      flex: 1;
      overflow: auto;
      color: #1a1d23;
      padding: 16px;
      .dc-name {
        font-size: 16px;
        font-weight: 600;
        background: #f9fafb;
        border-radius: 4px;
        padding: 12px;
        margin-bottom: 16px;
      }
      .data-collection-table {
        height: calc(100% - 96px);
      }
    }
    .popup-bottom {
      height: 56px;
      border-top: 1px solid #e0e3eb;
      padding: 8px 16px;
      .ks-col {
        &-4 {
          padding: 0 4px;
        }
      }
      .van-button {
        width: 100%;
        height: 40px;
        font-size: 14px;
        border-radius: 4px;
      }
    }
    :deep(.hidden-label) {
      padding: 0;
      .van-field__label {
        display: none !important;
      }
    }
  }
</style>
