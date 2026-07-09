import { computed, defineComponent, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FIELD_TYPE, FieldIconMap } from '@gct/runtime';
import './report-data-set-link-config-item.scss';

/**
 * 报表数据集关联配置项组件
 *
 * 功能：提供左右两侧字段的关联配置，支持智能过滤验证
 *
 * 右侧选项过滤验证逻辑：
 * 1. 主从关联 (MASTERSLAVE)：必须关联同一个子模型 (bindInfo 一致)，主键除外
 * 2. 枚举关联 (ENUM, ENUM_MULTI)：
 *    - 枚举模型必须一致 (bindInfo 一致)
 *    - 如果设置了自定义枚举值，自定义枚举值必须一致
 *    - 主键始终可选
 * 3. 模型关联 (REF, REF_MULTI)：必须关联同一个模型 (bindInfo 一致)，主键除外
 * 4. 版本模型关联 (RDO_REF)：必须关联同一个版本模型 (bindInfo 一致)，主键除外
 * 5. 主键特殊逻辑：
 *    - 左侧选择主键时，右侧可以选择任意属性
 *    - 左侧选择任意属性时，右侧均可以选择主键
 */

export const ReportDataSetLinkConfigItem = defineComponent({
  name: 'ReportDataSetLinkConfigItem',
  props: {
    index: {
      type: Number,
      required: true,
    },
    items: {
      type: Array<string>,
      required: true,
    },
    leftOptions: {
      type: Array<IObject>,
      default: () => [],
    },
    rightOptions: {
      type: Array<IObject>,
      default: () => [],
    },
    fields: {
      type: Array<string[]>,
      required: true,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['changeLinkField', 'deleteLinkField', 'clearFieldError'],
  setup(props, { emit }) {
    const t = (window as any).$t;
    const ns = useNamespace('report-data-set-link-config-item');

    const { items, leftOptions, rightOptions, fields, hasError } = toRefs(props);

    // 字段类型映射配置，根据左侧选择的类型筛选右侧可选项
    // 基于 transformMappingField4Auto 函数的配置，其中 equal: true 的字段类型需要额外的 bindInfo 验证
    interface FieldMappingConfig {
      filterArr: string[];
      equal?: boolean;
    }

    const fieldTypeMapping: Record<string, FieldMappingConfig> = {
      [FIELD_TYPE.TEXT]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.LONG_TEXT]: {
        filterArr: [FIELD_TYPE.LONG_TEXT, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.INTEGER]: {
        filterArr: [
          FIELD_TYPE.INTEGER,
          FIELD_TYPE.LONG,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.LONG]: {
        filterArr: [
          FIELD_TYPE.LONG,
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.DOUBLE]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.DECIMAL]: {
        filterArr: [FIELD_TYPE.DECIMAL, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.DATE]: {
        filterArr: [
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      [FIELD_TYPE.TIME]: {
        filterArr: [FIELD_TYPE.TIME, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.DATE_TIME]: {
        filterArr: [
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      // [FIELD_TYPE.IMAGE]: {
      //   filterArr: [FIELD_TYPE.IMAGE, FIELD_TYPE.PRIMARY_KEY],
      // },
      // [FIELD_TYPE.ATTACHMENT]: {
      //   filterArr: [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.PRIMARY_KEY],
      // },
      // [FIELD_TYPE.MASTERSLAVE]: {
      //   filterArr: [FIELD_TYPE.MASTERSLAVE, FIELD_TYPE.PRIMARY_KEY],
      //   equal: true,
      // },
      [FIELD_TYPE.USER]: {
        filterArr: [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.USER_MULTI]: {
        filterArr: [FIELD_TYPE.USER_MULTI, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.ORG]: {
        filterArr: [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.ORG_MULTI]: {
        filterArr: [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.ENUM]: {
        filterArr: [FIELD_TYPE.ENUM, FIELD_TYPE.PRIMARY_KEY],
        equal: true,
      },
      [FIELD_TYPE.ENUM_MULTI]: {
        filterArr: [FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.PRIMARY_KEY],
        equal: true,
      },
      [FIELD_TYPE.REF]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.REF_MULTI]: {
        filterArr: [FIELD_TYPE.REF_MULTI, FIELD_TYPE.PRIMARY_KEY, FIELD_TYPE.DEVICE_REF_MULTI],
        equal: true,
      },
      [FIELD_TYPE.RDO_REF]: {
        filterArr: [FIELD_TYPE.RDO_REF, FIELD_TYPE.PRIMARY_KEY],
        equal: true,
      },
      // [FIELD_TYPE.ESOP]: {
      //   filterArr: [FIELD_TYPE.ESOP, FIELD_TYPE.PRIMARY_KEY],
      // },
      [FIELD_TYPE.TRANSACTION]: {
        filterArr: [FIELD_TYPE.TRANSACTION, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
        filterArr: [FIELD_TYPE.LABEL_TEMPLATE_REF, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
        filterArr: [FIELD_TYPE.DOCUMENT_TEMPLATE, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.PRINTER]: {
        filterArr: [FIELD_TYPE.PRINTER, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.MESSAGE_TMPL]: {
        filterArr: [FIELD_TYPE.MESSAGE_TMPL, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.RANGE_USER]: {
        filterArr: [FIELD_TYPE.RANGE_USER, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
        filterArr: [FIELD_TYPE.ONLINE_FORM_TEMPLATE, FIELD_TYPE.PRIMARY_KEY],
      },
      [FIELD_TYPE.E_DHR_TEMPLATE]: {
        filterArr: [FIELD_TYPE.E_DHR_TEMPLATE, FIELD_TYPE.PRIMARY_KEY],
      },
      // 主键可以选择任意类型的字段
      [FIELD_TYPE.PRIMARY_KEY]: {
        filterArr: [], // 空数组表示可以选择任意字段类型
      },
      [FIELD_TYPE.MATERIAL_NO]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.RELATED_LOT_NO]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.PRODUCT]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.DEVICE]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.MFG_ORDER]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.RECORD_NO]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.ORDER_NO]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.TRACE_DATE]: {
        filterArr: [
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      [FIELD_TYPE.ROUTING_OPERATION]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.GOOD_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.NOT_GOOD_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.REPORT_START_TIME]: {
        filterArr: [
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      [FIELD_TYPE.REPORT_END_TIME]: {
        filterArr: [
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      [FIELD_TYPE.PRODUCTION_DATE]: {
        filterArr: [
          FIELD_TYPE.DATE_TIME,
          FIELD_TYPE.TIME,
          FIELD_TYPE.DATE,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.TRACE_DATE,
          FIELD_TYPE.PRODUCTION_DATE,
          FIELD_TYPE.REPORT_START_TIME,
          FIELD_TYPE.REPORT_END_TIME,
        ],
      },
      [FIELD_TYPE.WORK_HOURS]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.NOT_GOOD_REASON]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.NOT_GOOD_GROUP]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.SCRAP_REASON]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.SCRAP_GROUP]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.SCRAP_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.SCRAP_MATERIAL]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.SCRAP_MATERIAL_NO]: {
        filterArr: [
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.MATERIAL_NO,
          FIELD_TYPE.RELATED_LOT_NO,
          FIELD_TYPE.SCRAP_MATERIAL_NO,
          FIELD_TYPE.RECORD_NO,
          FIELD_TYPE.ORDER_NO,
        ],
      },
      [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.PRODUCT_CHECK_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.MATERIAL_CHECK_QTY]: {
        filterArr: [
          FIELD_TYPE.DOUBLE,
          FIELD_TYPE.TEXT,
          FIELD_TYPE.LONG_TEXT,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.GOOD_QTY,
          FIELD_TYPE.NOT_GOOD_QTY,
          FIELD_TYPE.SCRAP_QTY,
          FIELD_TYPE.DESTRUCTIVE_TEST_QTY,
          FIELD_TYPE.PRODUCT_CHECK_QTY,
          FIELD_TYPE.MATERIAL_CHECK_QTY,
          FIELD_TYPE.WORK_HOURS,
        ],
      },
      [FIELD_TYPE.DEVICE_REF]: {
        filterArr: [
          FIELD_TYPE.REF,
          FIELD_TYPE.REF_MULTI,
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
        ],
        equal: true,
      },
      [FIELD_TYPE.DEVICE_REF_MULTI]: {
        filterArr: [FIELD_TYPE.REF_MULTI, FIELD_TYPE.PRIMARY_KEY, FIELD_TYPE.DEVICE_REF_MULTI],
        equal: true,
      },
    };

    const key = computed<string>(() => {
      return (items.value[0] || '') + (items.value[1] || '');
    });

    const onChangeLinkField = () => {
      emit('changeLinkField', items.value);
    };

    const onDeleteLinkField = () => {
      emit('deleteLinkField', props.index);
    };

    /**
     * 处理左侧字段变化
     * @param value - 选择的值
     */
    const onLeftFieldChange = (value: string) => {
      items.value[0] = value;
      // 清空右侧选择，因为左侧字段类型变化了
      items.value[1] = null as any;
      // 如果有值，则尝试清除错误状态
      if (value) {
        emit('clearFieldError', props.index, 'left');
      }
      onChangeLinkField();
    };

    /**
     * 处理右侧字段变化
     * @param value - 选择的值
     */
    const onRightFieldChange = (value: string) => {
      items.value[1] = value;
      // 如果有值，则尝试清除错误状态
      if (items.value[0] && value) {
        emit('clearFieldError', props.index, 'right');
      }
      onChangeLinkField();
    };

    /**
     * 检查左侧字段是否为空
     */
    const leftFieldEmpty = computed<boolean>(() => {
      return hasError.value && !items.value[0];
    });

    /**
     * 检查右侧字段是否为空
     */
    const rightFieldEmpty = computed<boolean>(() => {
      return hasError.value && !items.value[1];
    });

    /**
     * 根据 fieldTypeMapping 的 key 过滤左侧可选项
     */
    const filteredLeftOptions = computed(() => {
      // 获取 fieldTypeMapping 中所有支持的字段类型（key）
      const supportedTypes = Object.keys(fieldTypeMapping);

      // 只显示在映射配置中存在的字段类型
      return leftOptions.value.filter((option) => {
        return supportedTypes.includes(option.type) || option.key === 'id_';
      });
    });

    /**
     * 比较两个数组是否相等
     */
    const compareArrays = (arr1: any[], arr2: any[]) => {
      if (!arr1 || !arr2) return false;
      return arr1.toString() === arr2.toString();
    };

    /**
     * 检查自定义枚举配置是否一致
     */
    const isCustomEnumConsistent = (leftOption: any, rightOption: any) => {
      const leftCustomConfig = leftOption.specificConfig?.customEnumConfig;
      const rightCustomConfig = rightOption.specificConfig?.customEnumConfig;

      // 检查是否都启用了自定义枚举配置
      const leftEnabled = leftCustomConfig?.enabled;
      const rightEnabled = rightCustomConfig?.enabled;

      if (leftEnabled && rightEnabled) {
        // 都启用了自定义枚举，需要比较自定义值是否一致
        return compareArrays(leftCustomConfig.values, rightCustomConfig.values);
      } else if (!leftEnabled && !rightEnabled) {
        // 都没有启用自定义枚举，认为一致
        return true;
      } else {
        // 一个启用了自定义枚举，一个没有，不一致
        return false;
      }
    };

    /**
     * 根据左侧选择的字段类型过滤右侧可选项
     */
    const filteredRightOptions = computed(() => {
      // 左侧如果没有选择任何字段，右侧不显示任何选项
      if (!items.value[0]) {
        return [];
      }

      // 获取左侧选择的字段信息
      const selectedLeftOption = leftOptions.value.find(
        (option) => option.value === items.value[0],
      );
      if (!selectedLeftOption || !selectedLeftOption.type) {
        return rightOptions.value;
      }

      const leftFieldType = selectedLeftOption.type;
      const fieldConfig = fieldTypeMapping[leftFieldType] || [];

      // 如果没有配置映射关系，则不可选择
      if (!fieldConfig) {
        return [];
      }

      // 特殊处理：如果左侧选择的是主键，右侧可以选择任意属性
      if (leftFieldType === FIELD_TYPE.PRIMARY_KEY || selectedLeftOption.key === 'id_') {
        const keys = Object.keys(fieldTypeMapping);
        return rightOptions.value.filter((option) => {
          return keys.includes(option.type) || option.key === 'id_';
        });
      }

      // 基础类型过滤
      let filteredList = rightOptions.value.filter((option) => {
        return fieldConfig.filterArr.includes(option.type) || option.key === 'id_';
      });

      // 针对特定字段类型的额外验证逻辑
      if (leftFieldType === FIELD_TYPE.MASTERSLAVE) {
        // 主从关联：必须关联同一个子模型，但主键除外
        filteredList = filteredList.filter(
          (option) =>
            option.type === FIELD_TYPE.PRIMARY_KEY ||
            option.bindInfo === selectedLeftOption.bindInfo ||
            option.key === 'id_',
        );
      } else if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(leftFieldType)) {
        // 枚举关联：枚举值必须一致，如果设置了自定义枚举值，自定义枚举值必须一致，但主键除外
        filteredList = filteredList.filter((option) => {
          // 主键可以被选择
          if (option.type === FIELD_TYPE.PRIMARY_KEY || option.key === 'id_') {
            return true;
          }
          // 首先检查绑定信息是否一致（枚举模型一致）
          if (option.bindInfo !== selectedLeftOption.bindInfo) {
            return false;
          }
          // 检查自定义枚举配置是否一致
          return isCustomEnumConsistent(selectedLeftOption, option);
        });
      } else if ([FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(leftFieldType)) {
        // 模型关联、模型多选：必须关联同一个模型，但主键除外
        filteredList = filteredList.filter((option) => {
          return (
            option.type === FIELD_TYPE.PRIMARY_KEY ||
            option.bindInfo === selectedLeftOption.bindInfo ||
            option.key === 'id_'
          );
        });
      } else if (leftFieldType === FIELD_TYPE.RDO_REF) {
        // 版本模型关联：必须关联同一个版本模型，但主键除外
        filteredList = filteredList.filter(
          (option) =>
            option.type === FIELD_TYPE.PRIMARY_KEY ||
            option.bindInfo === selectedLeftOption.bindInfo ||
            option.key === 'id_',
        );
      }

      return filteredList;
    });

    /**
     * 根据输入过滤选项
     */
    const filterOption = (input: string, option: any) => {
      return option.label.toLowerCase().includes(input.toLowerCase());
    };

    return () => {
      return (
        <div key={key.value} class={[ns.b(), ns.is('has-error', hasError.value == true)]}>
          <div class={ns.e('item-config')}>
            <div class={ns.em('item-config', 'select')}>
              <a-select
                v-model:value={items.value[0]}
                placeholder={t('sys.dataSet.pleaseSelect')}
                class={leftFieldEmpty.value ? ns.e('select-error') : null}
                onChange={onLeftFieldChange}
                showSearch={true}
                allowClear
                filterOption={filterOption}
              >
                {filteredLeftOptions.value.map((option) => (
                  <a-select-option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    title={option.label}
                  >
                    <span class={ns.e('option-icon')}>
                      <i
                        class={`iconfont ${FieldIconMap[option.type]}`}
                        style={{ marginRight: '4px' }}
                      ></i>
                    </span>
                    <span class={ns.e('option-title')}>{option.label}</span>
                  </a-select-option>
                ))}
              </a-select>
              {leftFieldEmpty.value && (
                <div class={ns.em('item-config', 'error')}>
                  {t('sys.dataSet.pleaseSelectField')}
                </div>
              )}
            </div>
            <div class={ns.em('item-config', 'equal')}>=</div>
            <div class={ns.em('item-config', 'select')}>
              <a-select
                v-model:value={items.value[1]}
                placeholder={t('sys.dataSet.pleaseSelect')}
                class={rightFieldEmpty.value ? ns.e('select-error') : null}
                onChange={onRightFieldChange}
                showSearch={true}
                allowClear
                filterOption={filterOption}
              >
                {filteredRightOptions.value.map((option) => (
                  <a-select-option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    title={option.label}
                  >
                    <span class={ns.e('option-icon')}>
                      <i
                        class={`iconfont ${FieldIconMap[option.type]}`}
                        style={{ marginRight: '4px' }}
                      ></i>
                    </span>
                    <span class={ns.e('option-title')}>{option.label}</span>
                  </a-select-option>
                ))}
              </a-select>
              {rightFieldEmpty.value && (
                <div class={ns.em('item-config', 'error')}>
                  {t('sys.dataSet.pleaseSelectField')}
                </div>
              )}
            </div>
          </div>
          {fields.value.length > 1 ? (
            <div class={ns.e('item-delete')} onClick={onDeleteLinkField}>
              <a-tooltip title={t('sys.dataSet.deleteTooltip')}>
                <i class="iconfont icon-shanchu" />
              </a-tooltip>
            </div>
          ) : null}
        </div>
      );
    };
  },
});
