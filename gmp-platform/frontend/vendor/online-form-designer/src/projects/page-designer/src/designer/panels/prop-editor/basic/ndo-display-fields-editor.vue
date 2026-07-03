<template>
  <div>
    <a-select
      v-model:value="value"
      :options="fieldOptions"
      mode="multiple"
      size="small"
      showArrow
      :showSearch="false"
      style="width: 100%"
      dropdownClassName="gct-custom-select-dropdown hidden"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode"
      :placeholder="$t('sys.chooseText')"
      maxTagCount="responsive"
      allowClear
      @click.stop="openOption"
    >
      <template #tagRender="{ value: val, label, name, onClose, alias }">
        <a-tag
          style="
            margin-top: 1px;
            margin-right: 3px;
            margin-bottom: 1px;
            border-radius: 4px;
            background-color: #e6e9ef;
          "
          :closable="true"
          @close="onClose"
        >
          <span
            class="color-[#212528]"
            :title="(alias || label || name).length > 12 ? alias || label || name : ''"
          >
            {{
              (alias || label || name).length > 12
                ? (alias || label || name).slice(0, 12) + '...'
                : alias || label || name
            }}
          </span>
        </a-tag>
      </template>
    </a-select>
    <div class="text-12px color-[#C3C3C3] mt-8px">{{
      $t('sys.pageDesigner.fieldsDisplayedInTheDropdownOptions')
    }}</div>
    <a-divider />
  </div>
</template>
<script setup lang="ts" name="ndo-display-fields-editor">
  import { computed, nextTick, onMounted, ref, reactive } from 'vue';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { CreateType, EntityModelTypeEnum, FIELD_TYPE, MaterialEnum } from '@gct/runtime';
  import { beginDrag } from '/@page-designer/schema/utils';
  import { useFieldTransfer } from '/@/components/FieldTransfer';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { platform } from '/@page-designer/hooks/usePage';
  import { FormComponents, Platform, fixedAlignENUM } from '/@page-designer/enum';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const Fieldinstance = useFieldTransfer();
  const propConfig = reactive(defProps.propConfig);
  const fieldMap = ref({});
  const fieldOptions = ref<any[]>([]);
  const value = computed({
    get() {
      const val = (propValue.value ? propValue.value : []).map((e) => e.props?.field);
      console.log('propValue.value1111111', propValue.value);
      return val;
    },
    set(val) {
      const fields = val.map((e) => {
        let item = fieldMap.value[e];
        if (!item) {
          return propValue.value.find((f) => f.props.field === e);
        }
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: defProps.widget?.id,
        });
        // fieldWidget.props.fieldReadonly = true;
        // fieldWidget.props._preset = true;
        return fieldWidget;
      });
      propValue.value = fields;
      console.log('propValue.value', propValue.value);
    },
  });

  onMounted(() => {
    nextTick(() => {
      getFieldsData();
    });
  });

  const USER_DEFINED_TYPES = [
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.DATE,
    FIELD_TYPE.TIME,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.USER,
    FIELD_TYPE.USER_MULTI,
    FIELD_TYPE.ORG,
    FIELD_TYPE.ORG_MULTI,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.ENUM_MULTI,
    FIELD_TYPE.REF,
    FIELD_TYPE.REF_MULTI,
    FIELD_TYPE.RDO_REF,
  ];

  const SYS_TYPES = [
    'create_user_id_',
    'create_time_',
    'modify_user_id_',
    'modify_time_',
    'create_org_id_',
    'modify_org_id_',
  ];
  const BUILTIN_KYES = ['default_'];
  const getFieldsData = async () => {
    fieldOptions.value = propValue.value.map((p) => {
      return {
        ...p,
        label: p.alias,
        value: p.props.field,
      };
    });
    // const modelKey = defProps.widget?.props?.filterModeKey ?? defProps.widget?.props?.bindModelKey;
    // const res = (await getFieldMetaList({ modelKey })) || [];
    // fieldOptions.value = res
    //   .filter((e: any) => {
    //     return (
    //       (e.createType === CreateType.USER_DEFINED && USER_DEFINED_TYPES.includes(e.type)) ||
    //       (e.createType === CreateType.SYSTEM && SYS_TYPES.includes(e.key)) ||
    //       (e.createType === CreateType.BUILTIN &&
    //         e.initCommitId === '__0000__' &&
    //         !BUILTIN_KYES.includes(e.key))
    //     );
    //   })
    //   .map((e) => ({
    //     ...e,
    //     label: e.name,
    //     value: e.key,
    //   }));
    // res.forEach((field) => {
    //   fieldMap.value[field.key] = field;
    // });
  };
  const isEntityModel = computed(() => {
    return (
      defProps.widget!.props?.modeldata?.modelCategory === EntityModelCategoryEnum.ENTITY ||
      !defProps.widget!.props?.modeldata?.modelCategory
    );
  });
  const openOption = () => {
    const excludeList = [
      FIELD_TYPE.ESOP,
      FIELD_TYPE.MASTERSLAVE,
      FIELD_TYPE.LABEL_TEMPLATE,
      FIELD_TYPE.SERIALRULE,
      'online_form',
    ];
    if (platform.value === Platform.MOBILE) {
      excludeList.push(
        ...[FIELD_TYPE.RANGE_USER, FIELD_TYPE.MESSAGE_TMPL, FIELD_TYPE.EXPRESSION_CONDITION],
      );
    }
    const excludeFieldKeyList =
      typeof propConfig.excludeFieldKey === 'function'
        ? propConfig.excludeFieldKey(defProps.widget)
        : propConfig.excludeFieldKey;

    console.log(
      ['tenant_id_', 'ref_field_key_', 'ref_model_key_'].concat(excludeFieldKeyList ?? []),
      '999999999999',
    );
    Fieldinstance.open({
      modelKey: defProps.widget?.props[propConfig.modelByKey || 'model'],
      childParentModelKey: defProps.widget?.props.refParentModelkey,
      modalTitle: t('sys.kit.medPro.selectShowResultFields'),
      isShowCascader: !!isEntityModel.value,
      draggable: !!propConfig.draggable,
      data: propValue.value.map((i) => i.props),
      maxEnableCount: propConfig.maxlength,
      filterFieldByFunction: propConfig.filterFn,
      disabledFieldKey: propValue.value
        .filter((n) => n.props._preset)
        .map((n) => n.props.field)
        .concat(propConfig.disabledFieldKey ?? []),
      containFieldType: propConfig.containFieldType,
      containFieldKey: propConfig.containFieldKey,
      excludeFieldType: excludeList.concat(propConfig.excludeFieldType ?? []),
      excludeFieldKey: ['tenant_id_', 'ref_field_key_', 'ref_model_key_'].concat(
        excludeFieldKeyList ?? [],
      ),
      saveCallback: ({ objFieldList }) => {
        console.log('objFieldList', objFieldList, propConfig);
        if (propConfig.createField) {
          if (propConfig.draggable) {
            const fieldMap = propValue.value.reduce((total, curr) => {
              total[curr.props.fieldId] = curr;
              return total;
            }, {});
            propValue.value = objFieldList
              .map((i) => {
                const widget = fieldMap[i.id] || propConfig.createField!(i, defProps.widget);

                return { ...widget };
              })
              .map((p) => {
                return {
                  ...p,
                  label: p.alias,
                  value: p.props.field,
                };
              });
            console.log('propValue.value', propValue.value, value.value);
            fieldOptions.value = propValue.value;
          } else {
            const fieldMap = objFieldList.reduce((total, curr) => {
              total[curr.id] = curr;
              return total;
            }, {});
            /**保留原先排序 */
            //删除穿梭框 上不存在的字段
            //穿梭框内多余的字段 排在末尾
            const widgetList = [...propValue.value];
            let start = 0;
            // const delIndexArr: any[] = [];
            while (widgetList[start]) {
              const widget = widgetList[start];
              if (
                widget.type === FormComponents.DataTableFormula ||
                widget.props.isCustomField ||
                widget.props._preset
              ) {
                /**公式字段跳过 */
                start++;
                // 如果字段被冻结（_frozen为true），则构建该字段的唯一标识符id，并将fieldMap中对应id的值设为null
                // 用于标记该字段在后续处理中忽略
                if (widget.props._frozen) {
                  const id = widget.props.modelKey + '$' + widget.props.field;
                  fieldMap[id] = null;
                }
                continue;
              }
              const id = widget.props.fieldId;
              const field = fieldMap[id];
              if (!field) {
                widgetList.splice(start, 1);
              } else {
                start++;
              }
              fieldMap[id] = null;
            }
            Object.values(fieldMap).forEach((i) => {
              if (i) {
                const widget = propConfig.createField!(i, defProps.widget);

                widgetList.push(widget);
              }
            });
            //为了触发changecallback所以这么写
            propValue.value = [...widgetList];
          }
        }
      },
    });
  };
</script>
<style lang="less" scoped>
  :deep(.ant-divider-horizontal) {
    margin: 16px 0 8px;
  }
</style>
