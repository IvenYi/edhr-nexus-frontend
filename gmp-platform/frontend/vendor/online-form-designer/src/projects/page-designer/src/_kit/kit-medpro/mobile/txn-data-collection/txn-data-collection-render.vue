<template>
  <div>
    <van-cell
      class="txn-data-collection-card"
      v-for="item of tableData"
      :key="item.id_"
      is-link
      @click="handleClick(item)"
    >
      <template #title>
        <div class="txn-data-collection-card-title">
          <span>
            {{
              item?._DICT?.data_collection_usage_rule_id_?.[
                item.data_collection_usage_rule_id_
              ][0] ?? item?._DICT?.data_collection_id_?.[item.data_collection_id_][0]
            }}
          </span>
          <span :class="['file-status', item.status_]">{{ StatusNames[item.status_] }}</span>
        </div>
      </template>
      <template #right-icon>
        <van-icon name="arrow" class="arrow-icon" />
      </template>
    </van-cell>

    <basic-popup
      v-model:show="show"
      :title="
        currentDataCollection?._DICT?.data_collection_usage_rule_id_?.[
          currentDataCollection.data_collection_usage_rule_id_
        ][0] ??
        currentDataCollection?._DICT?.data_collection_id_?.[
          currentDataCollection.data_collection_id_
        ][0]
      "
      :popup-props="popupProps"
      :extra-style="{
        left: 'auto',
        right: 0,
        height: '85vh',
        width: '100vw',
      }"
    >
      <div class="p-8px" v-if="currentDataCollection">
        <div class="bg-white rounded-8px">
          <van-form
            style="height: 100%; min-height: inherit"
            class="dynamic-table-field-area-form"
            required="auto"
            label-align="top"
            ref="refForms"
          >
            <template v-for="(w, index) of currentDataCollection.widgetList" :key="w.id">
              <selectField v-if="w.type === 'select'" :widget="w" :rowValue="w" :index="index">
                <template #label>
                  <div>{{ w.name }}</div>
                </template>
              </selectField>
              <fieldWidget v-else :widget="w" :rowValue="w" :index="index">
                <template #label>
                  <div>
                    <div>{{ w.name }}</div>
                  </div>
                </template>
              </fieldWidget>
            </template>
          </van-form>
        </div>
      </div>

      <template #footer v-if="currentDataCollection?.status_ !== 'submitted'">
        <div class="flex">
          <van-button class="flex-1 important-mr-8px" type="default" @click="show = false">
            取消
          </van-button>
          <van-button
            class="flex-1 important-mr-8px"
            type="default"
            :loading="temporaryLoading"
            @click="handleTemporary"
          >
            保存
          </van-button>
          <van-button class="flex-1" type="primary" :loading="submitLoading" @click="handleSubmit">
            提交
          </van-button>
        </div>
      </template>
    </basic-popup>
  </div>
</template>

<script setup lang="ts" name="gct-txn-data-collection">
  import { ref, toRef, toRefs, watch, provide } from 'vue';
  import { BindCmpStyleEnum, FormComponents } from '/@page-designer/enum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, isNil } from 'lodash-es';
  import { buildShortUUID } from '/@/utils/uuid';
  import { FIELD_TYPE } from '@gct/runtime';
  import { i18n } from '@mobile/locales/setupI18n';
  import fieldWidget from '/@page-designer/components/widgets/mobile/__components__/fieldByList/index.vue';
  import selectField from './select-field.vue';
  import { showToast, showNotify } from 'vant';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';

  const { t } = i18n.global;
  const Event = getPageEvent();
  const props = defineProps<{ modelValue: Array<any>; widget }>();
  const {
    deviceRefForm,
    batchRefForm,
    refFormField,
    refSearchField,
    txnType,
    collation,
    widgetsMap,
  } = toRefs(props.widget?.props);
  const refFormData = toRef(() => {
    const data: any = {};
    refFormField.value?.forEach((i) => {
      data[i] = formMap.value[deviceRefForm.value]?.[i];
    });
    refSearchField.value.forEach((i) => {
      data[i] = formMap.value[batchRefForm.value]?.[i];
    });
    data['txn_subject_id_'] = formMap.value[batchRefForm.value]?.id_;
    return data;
  });

  const StatusNames = {
    initial: t('sys.kit.dataCollection.initial'),
    stash: t('sys.kit.dataCollection.stash'),
    submitted: t('sys.kit.dataCollection.submitted'),
  };
  /**排序字段 */
  const querySort = getQuerySort({ collation: collation.value });

  const txnDataCollection = ref<any>({});

  const tableData = ref<any[]>([]);

  const refForms = ref<any>();

  const show = ref(false);

  const popupProps = ref({
    position: 'bottom',
  });

  provide('form-layout', { inputAlign: 'left', inputBg: true });

  const getDataSource = async (queryParam = {}) => {
    const param = Object.assign(
      {
        ...refFormData.value,
        txn_key_: txnType?.value,
      },
      queryParam,
    );
    const res = await Event.context.$customBizService.post(
      {
        // @ts-ignore
        action: 'biz_get_data_collection_usage_rule',
        key: 'em_data_collection',
      },
      {
        query: { ...param },
        sorts: [...querySort],
      },
    );
    const { data, dict } = res;
    const result =
      transformSourceData(data, dict).map((d, index) => {
        return {
          index,
          ...d,
        };
      }) || [];
    return result;
  };

  watch(
    () => refFormData.value,
    async () => {
      let needQueryFlag = true;
      refSearchField.value.forEach((i) => {
        //如果关联的值为空 则不用查询
        if (!formMap.value[batchRefForm?.value]?.[i]) {
          needQueryFlag = false;
        }
      });
      if (needQueryFlag) {
        tableData.value = await getDataSource();
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const getWidgetType = (val) => {
    let fieldType: FormComponents;
    if (val.type_ === 'boolean') {
      // if (val.show_type_ === 'select') {
      //   fieldType = FormComponents.Select;
      // } else {
      //   fieldType = FormComponents.Switch;
      // }
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

  const setFormVal = (type, form, val) => {
    if (type === 'boolean') {
      form.bool_value_ = val === 'true' ? true : false;
      form.value_ = val === 'true' ? true : false;
    } else if (type === 'string') {
      form.text_value_ = val;
    } else if (type === 'integer') {
      form.int_value_ = val;
    } else if (type === 'decimal') {
      form.double_value_ = val;
    } else if (type === 'user') {
      form.user_value_ = val;
    } else if (type === 'org') {
      form.org_value_ = val;
    } else if (type === 'date') {
      form.date_value_ = val;
    } else if (type === 'date_time') {
      form.date_time_value_ = val;
    } else if (type === 'image') {
      form.image_value_ = val;
    } else if (type === 'attachment') {
      form.attachment_value_ = val;
    }
  };

  const submitCollectionById = async (params: {
    id_: string;
    entries_: Array<any>;
    status_: string;
  }) => {
    await Event.context.$customBizService.post(
      {
        // @ts-ignore
        action: 'biz_data_collection_submit',
        key: 'em_data_collection_task',
      },
      {
        id_: params.id_,
        entries_: params.entries_,
      },
    );
    tableData.value.forEach((c) => {
      if (c.id_ === params.id_) {
        c.status_ = 'submitted';
      }
    });
  };

  // 逐条提交所有的数据
  const submitDataCollections = async () => {
    const data = cloneDeep(tableData.value);
    try {
      await Promise.all(
        data.map(async (c, i) => {
          if (c.status_ === 'submitted' || !c.entries_?.length) return;
          await submitCollectionById(c);
          tableData.value[i].status_ = 'submitted';
        }),
      )
        .then(() => {})
        .catch((err) => {
          console.log(err, '数据采集提交失败');
          throw err;
        });
    } catch (err) {
      throw Promise.reject(err);
    }
  };

  const currentDataCollection = ref<any>(null);

  const handleClick = async (item) => {
    const res =
      (await Event.context.$customBizService.post(
        {
          action: 'biz_get_data_collection_details',
          key: 'em_data_collection_task',
        },
        {
          id_: item.id_,
        },
      )) || [];

    const widgetList = res.map((n) => {
      const type = getWidgetType(n);
      let widgetSchema = cloneDeep(widgetsMap.value[type]);
      widgetSchema.name = n.name_;
      widgetSchema.props.readonly = item.status_ == 'submitted';
      // ⬇️ 根据show_type_生成对应render描述
      widgetSchema.id = buildShortUUID(type);
      widgetSchema.props.label = n.name_;
      widgetSchema.props.field = 'value_';
      widgetSchema.props.modelKey = 'em_data_collection_entry';
      widgetSchema.props.fieldType = n.type_;
      widgetSchema.props.required = !!n.required_;
      if (n.type_ == 'attachment') {
        // 移动端附件因为无法预览 目前用图片的组件来展示，对其他的文件类型做隐藏
        const defaultList = n.default_value_?.split?.(',') ?? [];
        const list = defaultList.filter((i) => {
          const type = i.split('.').at(-1);
          return ['jpg', 'jpeg', 'png', 'bmp', 'gif'].includes(type);
        });
        const otherList = defaultList.filter((i) => !list.includes(i));
        n.default_value_other_ = otherList.join();
        n.default_value_ = list.join();
        widgetSchema.props.defaultValueOther = n.default_value_other_;
      }
      widgetSchema.props.defaultValue = n.default_value_;
      widgetSchema.props.precision = n.digits_ || 0;
      widgetSchema.props.maxValue = n.max_decimal_ ?? n.max_int_;
      widgetSchema.props.minValue = n.min_decimal_ ?? n.min_int_;
      widgetSchema.value_ = n.value_ ?? n.default_value_;
      if (n.show_type_ === 'select') {
        widgetSchema.props.options =
          (n.options_ ?? '').split(',').map((item) => {
            return {
              label: item,
              value: item,
            };
          }) ?? [];
      }
      if (n.type_ === 'boolean') {
        if (n.show_type_ === 'radio') {
          widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
        } else if (n.show_type_ === 'select') {
          widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_SELECT_LIST;
        } else if (!n.show_type_) {
          widgetSchema.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
        }
        widgetSchema.props.options = widgetSchema.props.customOptions = [
          {
            label: n.true_text_ || '真',
            value: true,
          },
          {
            label: n.false_text_ || '假',
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
      return { ...n, ...widgetSchema };
    });

    currentDataCollection.value = { ...item, widgetList };

    show.value = true;
  };

  const temporaryLoading = ref<boolean>(false);
  const submitLoading = ref<boolean>(false);

  /** 暂存数据采集数据到暂存表 */
  async function handleTemporary() {
    await refForms.value?.validate();
    try {
      temporaryLoading.value = true;
      const entries_ = currentDataCollection.value.widgetList;
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_stash',
          key: 'em_data_collection_task',
        },
        {
          id_: currentDataCollection.value.id_,
          entries_,
        },
      );
      tableData.value = await getDataSource();
      showNotify({ type: 'success', message: $t('sys.saveSuccess'), 'z-index': 9999 });
    } finally {
      temporaryLoading.value = false;
    }
  }

  async function handleSubmit() {
    await refForms.value?.validate();
    try {
      submitLoading.value = true;
      const entries_ = currentDataCollection.value.widgetList;
      await Event.context.$customBizService.post(
        {
          action: 'biz_data_collection_submit',
          key: 'em_data_collection_task',
        },
        {
          id_: currentDataCollection.value.id_,
          entries_,
        },
      );
      showNotify({ type: 'success', message: '提交成功', 'z-index': 9999 });
      tableData.value = await getDataSource();
      show.value = false;
    } finally {
      submitLoading.value = false;
    }
  }

  async function validate() {
    try {
      await refForms.value?.validate();
    } catch (err) {
      showToast('当前数据采集未通过校验');
      throw err;
    }
  }

  defineExpose({
    getValue() {
      const data = cloneDeep(tableData.value);
      data.forEach((item) => {
        const widgetList = txnDataCollection.value[item.id_]?.widgetList;
        if (widgetList) {
          widgetList.forEach((n, i) => {
            let val;
            if (n.props.fieldType == 'attachment') {
              const values = n.value_ ? n.value_.split(',') : [];
              const others = n.props.defaultValueOther ? n.props.defaultValueOther.split(',') : [];
              const defaults = item.entries_[i].default_value_
                ? item.entries_[i].default_value_.split(',')
                : [];
              val = values.length ? [...values, ...others].join() : [...defaults, ...others].join();
            } else {
              val = n.value_ ?? item.entries_[i].default_value_;
            }
            if (!isNil(val)) {
              item.entries_[i].value_ = val;
              setFormVal(item.entries_[i].type_, item.entries_[i], val);
            }
          });
        }
      });
      return data;
    },
    setValue(data, index?) {},
    reset() {
      tableData.value = [];
    },
    async reload(queryParam) {
      tableData.value = await getDataSource(queryParam);
    },
    setDataSource(res) {
      tableData.value =
        transformSourceData(res.data, res.dict).map((d, index) => {
          return {
            index,
            ...d,
          };
        }) || [];
    },
    async validate() {
      if (refForms.value) {
        try {
          for (let i in refForms.value) {
            await refForms.value[i].validate();
          }
        } catch (err) {
          if (err && err.length) {
            showToast('当前数据采集未通过校验');
            throw err;
          }
        }
      }
    },
    submitDataCollections,
    submitCollectionById,
    getCollectionIds() {
      // PDA端暂时去除在线表单的数据提交
      const withoutOnlineformData =
        tableData.value.filter((item) => item.collection_method_ === 'dataCollection') ?? [];
      return withoutOnlineformData.map((op) => op.id_);
    },
  });
</script>

<style lang="less" scoped>
  .txn-data-collection-card {
    margin: 8px 0;
    border-radius: 6px;
    background-color: #fff;
    align-items: center;

    &-title {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      position: relative;

      span {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin-left: 4px;
      }
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        content: '';
        width: 3px;
        height: 16px;
        background: var(--van-primary-color);
        transform: translate(0, -50%);
      }
    }

    .file-status {
      font-size: 12px;
      padding: 0 4px;
      border-radius: 4px;
      margin-left: 6px;
      &.initial {
        color: #026ac8;
        background: rgba(2, 106, 200, 0.1);
      }
      &.stash {
        color: #f77e4a;
        background: rgba(247, 126, 74, 0.1);
      }
      &.submitted {
        color: #979797;
        background: rgba(151, 151, 151, 0.1);
      }
    }
  }
</style>
