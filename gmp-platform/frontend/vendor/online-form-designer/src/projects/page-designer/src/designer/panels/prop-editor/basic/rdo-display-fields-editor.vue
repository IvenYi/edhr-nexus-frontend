<template>
  <div>
    <a-select
      v-model:value="value"
      :options="fieldOptions"
      :fieldNames="{ label: 'label', value: 'fieldId' }"
      mode="multiple"
      size="small"
      showArrow
      :showSearch="false"
      style="width: 100%"
      dropdownClassName="gct-custom-select-dropdown hidden"
      :placeholder="$t('sys.chooseText')"
      maxTagCount="responsive"
      @click.stop="openOption"
      :open="fasle"
    >
      <template #tagRender="{ value: val, label, onClose, option }">
        <a-tag
          :closable="
            val !== 'table_name_' &&
            option?.props?.modelKey + '$' + val !== disabledId &&
            option?.props?.fieldId != 'version_,name_,default_'
          "
          style="
            margin-top: 1px;
            margin-right: 3px;
            margin-bottom: 1px;
            border-radius: 4px;
            background-color: #e6e9ef;
          "
          @close="onClose"
        >
          <span
            class="color-[#212528]"
            :title="(fieldMap[val]?.name || label).length > 12 ? fieldMap[val]?.name || label : ''"
          >
            {{
              (fieldMap[val]?.name || label).length > 12
                ? (fieldMap[val]?.name || label).slice(0, 12) + '...'
                : fieldMap[val]?.name || label
            }}
          </span>
        </a-tag>
      </template>
    </a-select>
    <div class="text-12px color-[#C3C3C3] mt8px">{{
      $t('sys.pageDesigner.fieldsDisplayedInTheDropdownOptions')
    }}</div>
    <a-divider />
  </div>
</template>
<script setup lang="ts" name="rdo-display-fields-editor">
  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
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
  const disabledId = ref();
  const fieldOptions = ref<any[]>([]);
  const rdoUniqueFieldKey = ref();
  const fieldMap = ref({});
  const value = computed({
    get() {
      const val = (propValue.value ? propValue.value : []).map((e) => e.props?.fieldId);
      return val;
    },
    set(val) {
      const fields = val.map((e) => {
        let item = fieldMap.value[e];
        if (!item) {
          return propValue.value.find((f) => f.props.fieldId === e);
        }
        const fieldWidget = beginDrag(item, {
          materialType: MaterialEnum.MaterialTableField,
          preLocation: defProps.widget?.id,
        });
        if (item?.props?.fieldId === 'version_,name_,default_') {
          fieldWidget.props.fieldReadonly = true;
          fieldWidget.props._preset = true;
          fieldWidget.props.disabled = true;
        }
        return fieldWidget;
      });
      console.log('fields', fields);
      propValue.value = fields;
    },
  });

  onMounted(() => {
    nextTick(() => {
      getFieldsData();
    });
  });
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
                console.log(i, widget, 'widget');

                if (widget?.props?.fieldId === 'version_,name_,default_') {
                  widget.props.fieldReadonly = true;
                  widget.props._preset = true;
                  widget.props.disabled = true;
                }
                return { ...widget };
              })
              .map((p) => {
                return {
                  ...p,
                  label: p.alias,
                  value: p.props.field,
                  fieldId: p.props.fieldId,
                };
              });
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
                if (widget?.props?.fieldId === 'version_,name_,default_') {
                  widget.props.fieldReadonly = true;
                  widget.props._preset = true;
                  widget.props.disabled = true;
                }
                widgetList.push(widget);
              }
            });
            //为了触发changecallback所以这么写
            propValue.value = [
              ...widgetList.map((p) => {
                return {
                  ...p,
                  label: p.alias,
                  value: p.props.field,
                  fieldId: p.props.fieldId,
                };
              }),
            ];
          }
          fieldOptions.value = propValue.value;
          console.log('propValue.value', fieldOptions.value);
        }
      },
    });
  };
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
  const BUILTIN_KYES = ['base_id_', 'version_', 'default_'];
  const getFieldsData = async () => {
    const modelKey = defProps.widget?.props?.bindModelKey;
    const res = (await getFieldMetaList({ modelKey })) || [];
    fieldOptions.value = propValue.value.map((p) => {
      return {
        ...p,
        label: p.alias,
        value: p.props.field,
        fieldId: p.props.fieldId,
      };
    });
    res.forEach((field) => {
      fieldMap.value[field.key] = field;
    });
    rdoUniqueFieldKey.value = res.find((e) => !!e.rdoUniqueFieldKey)?.key || 'name_';
    if (!value.value?.length) {
      value.value = [rdoUniqueFieldKey.value];
    }
    disabledId.value = fieldMap.value[rdoUniqueFieldKey.value].fieldId;
    //存下唯一标识  keyword 搜索的时候用到
    defProps.widget.props.rdoUniqueFieldKey = rdoUniqueFieldKey.value;
    console.log('  disabledId.value ', disabledId.value, fieldOptions.value);
  };
</script>
<style lang="less" scoped>
  :deep(.ant-divider-horizontal) {
    margin: 16px 0 8px;
  }
</style>
