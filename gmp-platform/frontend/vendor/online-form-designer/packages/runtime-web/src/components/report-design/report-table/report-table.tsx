import { defineComponent, ref, PropType, computed, toRaw } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './report-table.scss';
import detailedTable from './table/detailed-table.vue';
import crossTable from './table/cross-table.vue';
import { BaseField, ReportTable, ReportEnum } from '../schema/index';
import { watchDebounced } from '@vueuse/core';
import Empty from './table/components/empty.vue';
import ReportEmpty from './table/components/report-empty.vue';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { useDrillingHook } from './table/drilling-hook';
import { useDiffSchemaToUpdateTable } from './table/schema-diff';
import { cloneDeep } from 'lodash-es';
import { initReportHeaderByAppId } from './table/report-hooks';

const componentMap = {
  [ReportEnum.SCHEDULE_TABLE]: detailedTable,
  [ReportEnum.CROSS_TABLE]: crossTable,
};

export const ReportData = defineComponent({
  name: 'ReportData',
  components: { detailedTable, crossTable },
  props: {
    schema: {
      type: Object as PropType<ReportTable>,
      required: true,
    },
    reportName: {
      //报表名称
      type: String,
      required: true,
    },
    isDesign: {
      type: Boolean,
      default: true,
    },
    appId: {
      type: String,
      default: '',
      required: false,
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const apiConfig = initReportHeaderByAppId(props.appId);
    const schema = {
      ...cloneDeep(props.schema),
      reportName: props.reportName,
    };
    const ns = useNamespace('report-table');
    const reportBox = ref();
    const _uuid = ref();
    const fieldMetaList = ref([]);
    const { diffSchema } = useDiffSchemaToUpdateTable(props.schema);
    const { drillingClick, reportSchema, drillingLinkList, crumbsClick } = useDrillingHook(schema);
    watchDebounced(
      () => props.schema?._uuid,
      (v) => {
        const delta = diffSchema(props.schema);
        if (delta && !drillingLinkList.value.length) {
          /**定向更新制定属性 */
          Object.keys(delta).forEach((k) => {
            reportSchema.value[k] = props.schema[k];
          });
          return;
        }
        drillingLinkList.value = [];
        reportSchema.value = {
          ...cloneDeep(props.schema),
          reportName: props.reportName,
          _field_proto_map: {},
        };
      },
      {
        debounce: 500,
      },
    );
    watchDebounced(
      () => reportSchema.value?._uuid,
      (v) => {
        init();
      },
    );
    const showTable = computed(() => {
      const { dataColumn, rowDimension, columnDimension, reportType } = reportSchema.value;
      return (
        reportBox.value &&
        _uuid.value &&
        ((reportType === ReportEnum.SCHEDULE_TABLE && !!dataColumn?.length) ||
          (reportType === ReportEnum.CROSS_TABLE &&
            (columnDimension?.length || !!rowDimension?.length)))
      );
    });

    //初始化schema
    async function resetSchema() {
      const { fieldMap, drillMap = {} } = reportSchema.value;

      // 主模型字段映射
      fieldMetaList.value.forEach((i) => {
        reportSchema.value._field_proto_map[i.key] = i;
      });

      // 关联模型字段映射；是否是关联字段，是否包含 '.' : dataColumn:iem_uinkjjal_7x42.iem_fwfegljd_7x42.if_fwry_7x42
      const relatedModelList = Object.values(fieldMap)
        .filter((o) => o.id.includes('.'))
        .map(({ id, modelKey }) => {
          const start = id.indexOf(':') + 1;
          const end = id.lastIndexOf('.');
          const relatedFieldKey = id.substring(start, end);
          return { relatedFieldKey, modelKey };
        });

      // const cache = {};

      for (const m of relatedModelList) {
        const { relatedFieldKey, modelKey } = m;

        const res = await getModelMetaDetail(
          {
            modelKey,
          },
          apiConfig,
        );
        const modelFieldList = (res?.fieldMetaList || []).map((row) => ({
          ...row,
          key: [relatedFieldKey, row.key].join('.'),
        }));

        modelFieldList.forEach((i) => {
          reportSchema.value._field_proto_map[i.key] = i;
        });
      }
      // 处理字段
      for (const k in fieldMap) {
        const fieldItem = fieldMap[k];
        if (!reportSchema.value._field_proto_map[fieldItem.field]) {
          delete fieldMap[k];
          continue;
        }
        const { alias, aliasI18n } = fieldItem;
        fieldItem.fieldName =
          $t(aliasI18n || '') ||
          alias ||
          reportSchema.value._field_proto_map?.[fieldItem.field]?.name;
      }

      for (const k in drillMap) {
        const fieldItem = drillMap[k];
        if (!reportSchema.value._field_proto_map[fieldItem.field]) {
          delete drillMap[k];
          continue;
        }
        const { alias, aliasI18n } = fieldItem;
        fieldItem.fieldName =
          $t(aliasI18n || '') ||
          alias ||
          reportSchema.value._field_proto_map?.[fieldItem.field]?.name;
      }
      _uuid.value = reportSchema.value?._uuid;
    }

    /**初始化字段 */
    async function init() {
      const { modelKey } = reportSchema.value;
      if (!modelKey) {
        resetSchema();
        return;
      }
      const data =
        (await getModelMetaDetail(
          {
            modelKey,
          },
          apiConfig,
        )) || {};
      fieldMetaList.value = data.fieldMetaList || [];
      resetSchema();
    }
    init();
    return {
      ns,
      reportBox,
      _uuid,
      showTable,
      reportSchema,
      drillingLinkList,
      drillingClick,
      crumbsClick,
    };
  },
  render() {
    if (this.reportSchema.isDelete || this.reportSchema.isLimit) {
      return (
        <ReportEmpty
          isDelete={!!this.reportSchema.isDelete}
          drillingLinkList={this.drillingLinkList}
          crumbsClick={this.crumbsClick}
        />
      );
    }
    const SelectedComponent = componentMap[this.reportSchema?.reportType];
    return (
      <div class={this.ns.b()} ref="reportBox">
        {this.showTable ? (
          <SelectedComponent
            key={this._uuid}
            widget={this.reportSchema}
            parentRef={this.reportBox}
            isDesign={this.isDesign}
            showHeader={this.showHeader}
            drillingLinkList={this.drillingLinkList}
            drillingClick={this.drillingClick}
            crumbsClick={this.crumbsClick}
          ></SelectedComponent>
        ) : this._uuid ? (
          <Empty isDesign={this.isDesign} reportType={this.reportSchema?.reportType} />
        ) : null}
      </div>
    );
  },
});
