<template>
  <BasicTable
    v-if="dataSourse"
    :columns="getColumns(props.type)"
    :data-source="dataSourse"
    :pagination="false"
    size="small"
    class="trace-table"
    :showIndexColumn="false"
    :scroll="{ y: 'max-content' }"
  >
    <template #bodyCell="{ column, record, index }">
      <template
        v-if="
          record.fieldType === FIELD_TYPE.IMAGE &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- 图片组件 -->
        <image-list :fileList="record[column.key]" />
      </template>

      <template
        v-else-if="
          record.fieldType === FIELD_TYPE.ATTACHMENT &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- 附件 -->
        <file-list :fileList="record[column.key]" />
      </template>
      <template
        v-else-if="
          record.fieldType === FIELD_TYPE.SERIALRULE &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- 序列号规则 -->
        <serial-rule :ruleConfig="record[column.key]" />
      </template>
      <template
        v-else-if="
          record.fieldType === FIELD_TYPE.EXPRESSION_CONDITION &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- 公式 -->
        <expression-condition :conditionConfig="record[column.key]" />
      </template>
      <template
        v-else-if="
          record.fieldType === FIELD_TYPE.SIGNATURE &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- 签名 -->
        <signature :fileList="record[column.key]" />
      </template>
      <template
        v-else-if="
          record.fieldType === FIELD_TYPE.ESOP &&
          (column.key === 'newData' || column.key === 'oldData')
        "
      >
        <!-- esop -->
        <ESOP :fileList="record[column.key]" />
      </template>
      <template v-else-if="column.key === 'operationType'">
        {{ operationTypeMap.get(record[column.key]) }}
      </template>
      <template v-else-if="enumField.includes(record.fieldType) && column.key === 'newData'">
        <div class="wrap">
          {{
            record.newDict && record.newDict.length
              ? record.newDict.join('，')
              : record.newData
              ? record.newData
              : displayValue
          }}
        </div>
      </template>
      <template v-else-if="enumField.includes(record.fieldType) && column.key === 'oldData'">
        <div class="wrap">
          {{
            record.oldDict && record.oldDict.length
              ? record.oldDict.join('，')
              : record.oldData
              ? record.oldData
              : displayValue
          }}
        </div>
      </template>
      <template v-else-if="record.fieldType == FIELD_TYPE.ENUM_MULTI && column.key === 'oldData'">
        <div class="wrap">
          {{
            record.oldDict && record.oldDict.length
              ? record.oldDict.join('，')
              : record.oldData
              ? record.oldData.replaceAll('|', '，')
              : displayValue
          }}
        </div>
      </template>
      <template v-else-if="record.fieldType == FIELD_TYPE.ENUM_MULTI && column.key === 'newData'">
        <div class="wrap">
          {{
            record.newDict && record.newDict.length
              ? record.newDict.join('，')
              : record.newData
              ? record.newData.replaceAll('|', '，')
              : displayValue
          }}
        </div>
      </template>
      <template v-else-if="column.key !== 'fieldName'">
        <div class="wrap">
          {{
            record[column.key] === false
              ? record[column.key].toString()
              : record[column.key] || displayValue
          }}
        </div>
      </template>
      <template v-else>
        {{ record[column.key] || displayValue }}
      </template>
    </template>
  </BasicTable>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import ImageList from './image.vue';
  import FileList from './file.vue';
  import SerialRule from './serial-rule.vue';
  import ExpressionCondition from './expression-condition.vue';
  import Signature from './signature.vue';
  import ESOP from './esop.vue';
  import { BasicTable } from '/@/components/Table';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { t } = useI18n();
  const { displayValue } = useGlobalSetting();
  const props = defineProps<{ dataSourse: any; type: string; isMain: boolean }>();
  const operationTypeMap = new Map([
    ['update', t('sys.edit')],
    ['insert', t('sys.new')],
    ['deleted', t('sys.delText')],
  ]);

  // 枚举字段
  const enumField = [
    FIELD_TYPE.E_DHR_TEMPLATE,
    FIELD_TYPE.ONLINE_FORM_TEMPLATE,
    FIELD_TYPE.LABEL_TEMPLATE_REF,
    FIELD_TYPE.DOCUMENT_TEMPLATE,
    FIELD_TYPE.REF,
    FIELD_TYPE.REF_MULTI,
    FIELD_TYPE.RDO_REF,
    FIELD_TYPE.TRANSACTION,
    FIELD_TYPE.USER,
    FIELD_TYPE.USER_MULTI,
    FIELD_TYPE.PRINTER,
    FIELD_TYPE.ORG,
    FIELD_TYPE.ORG_MULTI,
    // FIELD_TYPE.ENUM_MULTI,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.MESSAGE_TMPL,
  ];
  const newColumns = ref([
    {
      title: t('序号'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      customCell: (_, index) => {
        // const row = logDetails.value[_.id][0].children[_.sonIndex][index];
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
    },
    {
      title: t('sys.appDesigner.operationType'),
      dataIndex: 'operationType',
      key: 'operationType',
      width: props.type === 'deleted' ? 330 : 100,
      customCell: (_, index) => {
        // const row = logDetails.value[_.id][0].children[_.sonIndex][index];
        // console.log('row', row.operationTypeRowSpan,_);
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
    },
    {
      title: t('sys.model.data') + 'ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: props.type === 'deleted' ? 330 : 100,
      customCell: (_, index) => {
        // const row = logDetails.value[_.id][0].children[_.sonIndex][index];
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
    },
    {
      title: t('sys.appDesigner.detailData'),
      dataIndex: 'detailData',
      key: 'detailData',
      width: props.type === 'deleted' ? (props.isMain ? 400 : 350) : props.isMain ? 150 : 100,
      customCell: (_, index) => {
        // const row = logDetails.value[_.id][0].children[_.sonIndex][index];
        return {
          rowSpan: _.detailDataRowSpan,
        };
      },
    },

    {
      title: t('sys.model.fieldName'),
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.oldData'),
      dataIndex: 'oldData',
      key: 'oldData',
      width: 280,
    },
    {
      title: t('sys.pageDesigner.newData'),
      dataIndex: 'newData',
      key: 'newData',
      width: 280,
    },
  ]);

  const getColumns = (type) => {
    if (type === 'deleted') {
      return newColumns.value.filter((i, idx) => {
        return idx < 4;
      });
    } else {
      return newColumns.value;
    }
  };
</script>
<style lang="scss" scoped>
  .wrap {
    white-space: wrap;
  }
</style>
