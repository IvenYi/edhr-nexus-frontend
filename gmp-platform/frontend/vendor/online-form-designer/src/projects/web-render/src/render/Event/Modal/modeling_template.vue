<template>
  <Modal
    v-model:visible="visible"
    v-bind="modalProps"
    style="top: 40px"
    :cancel-text="t('sys.cancelOpenness')"
    ref="modalTrace"
    :style="{
      top: isFullscreen ? '0' : '100px',
      maxWidth: isFullscreen ? '100%' : 'calc(100% - 32px)',
      width: isFullscreen ? '100%' : modalProps.width + 'px',
      height: isFullscreen ? '100%' : 'auto',
    }"
    :bodyStyle="{
      height: isFullscreen ? 'calc(100vh - 108px)' : 'auto',
      maxHeight: isFullscreen ? 'calc(100vh - 108px)' : 'auto',
      overflow: 'auto',
    }"
    class="model-trace"
  >
    <template #closeIcon>
      <div class="flex">
        <span class="custom-close mr8px" @click.stop="toggle">
          <FullscreenOutlined v-if="!isFullscreen" />
          <FullscreenExitOutlined v-else />
        </span>
        <div class="custom-close" @click="cancel">
          <close-outlined />
        </div>
      </div>
    </template>
    <ConfigProvider :locale="getAntdLocale">
      <div class="scroll-container" v-if="dataSource.length">
        <div
          class="position-relative mb1px pl1px"
          v-for="(item, index) in dataSource"
          :key="item.id"
          :ref="(el) => setItemRef(el, index)"
          :class="{ 'expanded-border': item.expanded }"
        >
          <div
            @click="onTableExpand(false, item)"
            :class="['item-header', 'px16px', 'sticky-header', { expanded: item.expanded }]"
          >
            <CaretDownOutlined v-if="item.expanded" class="expanded-icon" />
            <CaretRightOutlined class="expanded-icon" v-else @click="onTableExpand(true, item)" />
            <a-descriptions :column="5" class="ell">
              <a-descriptions-item :label="t('sys.appDesigner.operatePerson')">
                <div class="ell" :title="item.createUserName">
                  {{ item.triggerType ? t('sys.system') : item.createUserName }}
                </div>
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.userName')">
                <div class="ell" :title="item.userName">
                  {{ item.triggerType ? displayValue : item.userName }}
                </div></a-descriptions-item
              >
              <a-descriptions-item :label="t('sys.triggerMode')">
                {{
                  item.triggerType
                    ? t('sys.appDesigner.systemTriggered')
                    : t('sys.appDesigner.userBehavior')
                }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.appDesigner.operationType')">
                {{ operationTypeMap.get(item.operationType) }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.appDesigner.operateTime')">{{
                dayjs(item.modifyTime).format('YYYY-MM-DD HH:mm')
              }}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div v-if="item.expanded && logDetails[item.id]" class="title ml-16px">{{
            t('sys.appDesigner.tableTraceDetail')
          }}</div>

          <div v-if="item.expanded && logDetails[item.id]" class="mb-12px ml-16px">
            <span class="color-[#717682]"> {{ t('sys.dataSet.modelName') }}：</span>
            {{ logDetails[item.id][0].modelName }}
          </div>
          <trace-table
            v-if="item.expanded && logDetails[item.id] && logDetails[item.id][0].recordFieldJson"
            class="my-12px ml-16px"
            :isMain="true"
            :dataSourse="logDetails[item.id][0].recordFieldJson"
            :type="item.operationType"
          />

          <div
            class="ml-16px"
            v-if="item.expanded && logDetails[item.id] && logDetails[item.id][0].children.length"
          >
            <div class="title subTitle">{{ t('sys.appDesigner.subTableTraceDetail') }}</div>
            <div v-for="p in logDetails[item.id][0].children" :key="p.id">
              <div class="my-12px">
                <span class="color-[#717682]"> {{ t('sys.dataSet.modelName') }}：</span>
                {{ p[0].modelName }}
              </div>
              <BasicTable
                :columns="getColumns(item.operationType)"
                :data-source="p"
                :pagination="false"
                :expandedRowKeys="expandedRowKeys[item.id + p[0].parentFieldKey]"
                class="trace-table"
                size="small"
                :showIndexColumn="false"
                :showExpandColumn="false"
                :scroll="{ y: 'max-content' }"
                :key="expandedRowKeys[item.id + p[0].parentFieldKey]"
              >
                <!-- <template #expandIcon="{ expanded, onExpand, record }">
                  <span
                    v-if="record.children && record.children.length > 0"
                    @click="(e) => onExpand(record, e)"
                    style="cursor: pointer"
                  >
                    <CaretDownOutlined v-if="expanded" class="color-blue" />
                    <CaretRightOutlined v-else />
                  </span>
                </template> -->
                <template #expandedRowRender="{ record }">
                  <template v-if="record.children && record.children.length > 0">
                    <div v-for="(value, key) in sunDetails[item.id + record.sonId]" :key="key">
                      <div class="my-12px pl27px">
                        <span class="color-s[#717682]"> {{ t('sys.dataSet.modelName') }}：</span>
                        {{ value.modelName }}
                      </div>
                      <trace-table
                        :isMain="false"
                        :type="item.operationType"
                        :dataSourse="value.recordFieldJson"
                      />
                    </div>
                  </template>
                </template>
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
                    <div>
                      <span
                        v-if="record.expandIndex"
                        @click="handleExpand(record.expandIndex, item.id + record.parentFieldKey)"
                        style="cursor: pointer"
                      >
                        <CaretDownOutlined
                          v-if="
                            expandedRowKeys[item.id + record.parentFieldKey].includes(
                              record.expandIndex,
                            )
                          "
                          class="color-blue"
                        />
                        <CaretRightOutlined v-else />
                      </span>
                      {{ operationTypeMap.get(record[column.key]) }}
                    </div>
                  </template>
                  <template
                    v-else-if="enumField.includes(record.fieldType) && column.key === 'newData'"
                  >
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
                  <template
                    v-else-if="enumField.includes(record.fieldType) && column.key === 'oldData'"
                  >
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
                  <template
                    v-else-if="
                      record.fieldType == FIELD_TYPE.ENUM_MULTI && column.key === 'oldData'
                    "
                  >
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
                  <template
                    v-else-if="
                      record.fieldType == FIELD_TYPE.ENUM_MULTI && column.key === 'newData'
                    "
                  >
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
            </div>
          </div>
        </div>
      </div>
      <div v-if="dataSource.length" class="pagination">
        <a-pagination
          class="float-right"
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="pagination.showTotal"
          show-quick-jumper
          show-size-changer
          size="small"
          @change="changePagination"
        />
      </div>

      <div class="empty w100% h100% flex items-center justify-center ks-column" v-else>
        <img :src="emptyPng" class="w92px" />
        <div v-if="!isTrace" class="color-[#717682] mt-12px">{{ $t('sys.appDesigner.noTraceInfo') }}</div>
        <div v-else class="color-[#717682] mt-12px">{{ t('sys.noData') }}</div>
      </div>
    </ConfigProvider>
    <template #footer>
      <a-button @click="cancel">{{ t('sys.cancelOpenness') }}</a-button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { Modal, message as Message, ConfigProvider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLocale } from '/@/locales/useLocale';
  import type { ModalProps } from 'ant-design-vue';
  import {
    getTraceLogDetailsPageListByRecodeId,
    getTraceLogDetailsInfoTreeById,
  } from '/@/apis/gct-apaas/TraceLogDetailsController';
  import { getTraceSettingTreeByModelKey } from '/@/apis/gct-apaas/TraceSettingController';
  import { SerialNumberRuleFieldHistory } from './modeling_template/serial-number-rule-field.history';
  import { SerialPreview } from './modeling_template/serial-preview';
  import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import ImageList from './components/image.vue';
  import FileList from './components/file.vue';
  import SerialRule from './components/serial-rule.vue';
  import Signature from './components/signature.vue';
  import ExpressionCondition from './components/expression-condition.vue';
  import TraceTable from './components/trace-table.vue';
  import emptyPng from '/@/assets/images/empty.png';
  import { useIntersectionObserver } from '@vueuse/core';
  import ESOP from './components/esop.vue';
  import dayjs from 'dayjs';
  import { BasicTable } from '/@/components/Table';
  import FullScreen from '/@/components/FullScreen/index.vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue } = useGlobalSetting();

  const { getAntdLocale } = useLocale();
  const expandedRowKeys = ref({});
  const isFullscreen = ref(false);
  const modalTrace = ref();
  const { t } = useI18n();
  const operationTypeMap = new Map([
    ['update', t('sys.edit')],
    ['insert', t('sys.new')],
    ['deleted', t('sys.delText')],
  ]);

  const defProps = defineProps<{
    id?: string;
    modelKey: string;
    title?: string;
    destroyVm: Function;
  }>();

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
    // FIELD_TYPE.ENUM_MULTI,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.ORG_MULTI,
    FIELD_TYPE.MESSAGE_TMPL,
  ];

  //建模追溯
  const dataSource: any = ref([]);
  const logDetails = ref({});
  const sunDetails = ref({});
  const { id, modelKey } = reactive(defProps);
  const visible = ref(false);
  /** 模型建模追溯是否开启 */
  const isTrace = ref(1);
  const modalProps: ModalProps = reactive({
    title: defProps.title || t('sys.appDesigner.modelTrace'),
    width: isFullscreen.value ? '100%' : dataSource.value.length ? 1200 : 640,
  });
  const newSonColumns = ref([
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      key: 'index',
      maxwidth: 72,
      width: 60,
      customCell: (_, index) => {
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
      //   customRender: ({ text, record }) => ({
      //   children: text,
      //   attrs: {
      //     rowSpan: record.recordIdRowSpan,
      //     style: { position: 'relative' } // 为绝对定位提供上下文
      //   }
      // })
    },
    {
      title: t('sys.appDesigner.operationType'),
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      customCell: (_, index) => {
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
    },
    {
      title: t('sys.model.data') + 'ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 100,
      customCell: (_, index) => {
        return {
          rowSpan: _.recordIdRowSpan,
        };
      },
    },
    {
      title: t('sys.appDesigner.detailData'),
      dataIndex: 'detailData',
      key: 'detailData',
      width: 150,
      customCell: (_, index) => {
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
  const toggle = () => {
    isFullscreen.value = !isFullscreen.value;
  };
  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async () => {
    if (!id) return Message.warn('id');
    const { data, totalCount } =
      (await getTraceLogDetailsPageListByRecodeId({
        recodeId: id,
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
      })) || {};
    pagination.value.total = totalCount ?? 0;

    dataSource.value = data || [];
    modalProps.width = data.length ? 1200 : 640;
    if (!data.length) {
      getTraceSettingTreeByModelKey({ modelKey }).then((res) => {
        isTrace.value = res.enable;
      });
    }

    if (totalCount === 1) {
      onTableExpand(true, dataSource.value[0]);
    }
  };

  const changePagination = (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    getTableData();
  };

  async function open(opts?) {
    if (!id) return Message.warn('id');
    if (opts?.title) {
      modalProps.title = opts?.title;
    }
    await getTableData();
    visible.value = true;
  }

  function cancel() {
    defProps.destroyVm && defProps.destroyVm();
  }

  const onTableExpand = async (expanded, record) => {
    if (!expanded) {
      record.expanded = expanded;
    }
    if (expanded && !record.children) {
      const logDetailsRes = await getTraceLogDetailsInfoTreeById({ id: record.id }); // 在展开子表格时异步请求数据
      setTimeout(() => {
        record.expanded = expanded;
      }, 100);
      if (logDetailsRes && logDetailsRes.length) {
        logDetailsRes.map((item: any) => {
          if (item.children) {
            const children = [];
            let idx = 0;
            for (let key in item.children) {
              item.children[key].map((i, iidx) => {
                i.recordFieldJson &&
                  i.recordFieldJson.map((p, index) => {
                    p.id = record.id;
                    p.sonId = i.id;
                    p.sonIndex = Object.keys(item.children).indexOf(key);
                    p.recordId = i.recordId;
                    p.detailData = `${operationTypeMap.get(i.operationType)}了「${
                      i.detailData || displayValue.value
                    }」数据`;
                    p.operationType = i.operationType;
                    p.modelName = i.modelName;
                    p.parentFieldKey = i.parentFieldKey;
                    p.index = iidx + 1;
                    p.key = idx++;
                    if (index === i.recordFieldJson.length - 1) {
                      p.children =
                        index === i.recordFieldJson.length - 1 && i.children.length
                          ? i.children
                          : undefined;
                      if (i.children && i.children.length) {
                        i.recordFieldJson[0].expandIndex = p.key;
                        !expandedRowKeys.value[record.id + i.parentFieldKey]
                          ? (expandedRowKeys.value[record.id + i.parentFieldKey] = [p.key])
                          : expandedRowKeys.value[record.id + i.parentFieldKey].push(p.key);
                      }
                    }

                    return { ...p };
                  });
                //当改了孙没有改子时，手动插入子数据
                if (!i.recordFieldJson && i.children && i.children.length) {
                  i.recordFieldJson = [
                    {
                      recordId: i.recordId,
                      operationType: i.operationType,
                      detailData: `${operationTypeMap.get(i.operationType)}了「${
                        i.detailData || displayValue.value
                      }」数据`,
                      newData: '',
                      oldData: '',
                      index: iidx + 1,
                      key: 1,
                      sonId: i.id,
                      parentFieldKey: i.parentFieldKey,
                      children: i.children,
                    },
                  ];
                  i.recordFieldJson[0].expandIndex = 1;
                  expandedRowKeys.value[record.id + i.parentFieldKey] = [1];
                }
                // 子表数据构造
                !children[Object.keys(item.children).indexOf(key)]
                  ? (children[Object.keys(item.children).indexOf(key)] = i.recordFieldJson)
                  : (children[Object.keys(item.children).indexOf(key)] = children[
                      Object.keys(item.children).indexOf(key)
                    ].concat(i.recordFieldJson));

                //孙数据处理
                if (i.children && i.children.length) {
                  let idxx = 0;
                  const no = {};
                  i.children.map((z, zindex) => {
                    !no[z.parentFieldKey] ? (no[z.parentFieldKey] = 1) : no[z.parentFieldKey]++;
                    z.recordFieldJson.map((n, index) => {
                      n.recordId = z.recordId;
                      n.detailData = `${operationTypeMap.get(z.operationType)}了「${
                        z.detailData || displayValue.value
                      }」数据`;
                      n.operationType = z.operationType;
                      n.modelName = z.modelName;
                      n.key = idxx++;
                      n.index = no[z.parentFieldKey];
                      return { ...n };
                    });

                    // 孙表进行模型分类
                    const sunKey = item.id + i.id;
                    if (!sunDetails.value[sunKey]) {
                      sunDetails.value[sunKey] = {};
                      if (!sunDetails.value[sunKey][z.parentFieldKey]) {
                        sunDetails.value[sunKey][z.parentFieldKey] = z;
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson = processedData(
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson,
                        );
                      } else {
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson =
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson.concat(
                            z.recordFieldJson,
                          );
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson = processedData(
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson,
                        );
                      }
                    } else {
                      if (!sunDetails.value[sunKey][z.parentFieldKey]) {
                        sunDetails.value[sunKey][z.parentFieldKey] = z;
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson = processedData(
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson,
                        );
                      } else {
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson =
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson.concat(
                            z.recordFieldJson,
                          );
                        sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson = processedData(
                          sunDetails.value[sunKey][z.parentFieldKey].recordFieldJson,
                        );
                      }
                    }
                    // }, 100);

                    return { ...z };
                  });
                }
                return i.recordFieldJson;
              });
            }
            item.children = children.map((y) => {
              return processedData(y);
            });
          }
        });
        const temp = logDetailsRes.map((item: any) => {
          const regex = /.*?\（.*?[:：].*?\）/;
          const regex1 = /(.*?)\（(.*?)[:：](.*?)）/;
          if (regex.test(item.detailData) && !item.detailData.match(regex1)[1]) {
            item.detailData = `${displayValue.value}${item.detailData}`;
          }
          if (regex.test(item.detailData) && item.detailData.match(regex1)[1] === 'null') {
            item.detailData = item.detailData.replace('null', displayValue.value);
          }

          if (!item.recordFieldJson || item.recordFieldJson.length === 0) {
            item.recordFieldJson = [
              {
                recordId: item.recordId,
                operationType: item.operationType,
                detailData: `${operationTypeMap.get(item.operationType)}了「${
                  item.detailData || displayValue.value
                }」数据`,
                newData: '',
                oldData: '',
                index: 1,
              },
            ];
          } else {
            item.recordFieldJson.map((i) => {
              i.index = 1;
              i.id = item.id;
              i.recordId = item.recordId;
              i.detailData = `${operationTypeMap.get(item.operationType)}了「${
                item.detailData || displayValue.value
              }」数据`;
              i.operationType = item.operationType;
              // if (i.fieldType === FIELD_TYPE.IMAGE || i.fieldType === FIELD_TYPE.ATTACHMENT) {
              //   i.oldData = i.oldData ? i.oldData.split(',') : [];
              //   i.newData = i.newData ? i.newData.split(',') : [];
              // }
              return { ...i };
            });
            item.recordFieldJson = processedData(item.recordFieldJson);
          }

          return item;
        });
        // 数据加载完手动全部展开孙表
        // setTimeout(() => {
        //   expandedRowKeys.value[record.id] = [13];
        // });
        logDetails.value[record.id] = temp || [];
        console.log('logDetails.value', logDetails.value);
        console.log(' sunDetails.value', sunDetails.value);

        // }, 100);

        return;
      }
      logDetails.value[record.id] = logDetailsRes || [];
    }
  };

  const handleExpand = (index, id) => {
    if (expandedRowKeys.value[id].includes(index)) {
      expandedRowKeys.value[id] = expandedRowKeys.value[id].filter((i) => i !== index);
    } else {
      expandedRowKeys.value[id].push(index);
    }
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.value.current = current;
    pagination.value.total = total;
    pagination.value.pageSize = pageSize;
    getTableData();
  };

  defineExpose({ open });

  const itemRefs = ref([]);
  const activeIndex = ref(0);
  const modalHeaderHeight = ref(55);

  const setItemRef = (el, index) => {
    if (el) {
      itemRefs.value[index] = el;
    }
  };

  const getColumns = (type) => {
    if (type === 'deleted') {
      return [
        {
          title: t('sys.index'),
          dataIndex: 'index',
          key: 'index',
          width: 60,
          customCell: (_, index) => {
            return {
              rowSpan: _.recordIdRowSpan,
            };
          },
        },
        {
          title: t('sys.appDesigner.operationType'),
          dataIndex: 'operationType',
          key: 'operationType',
          width: 330,
          customCell: (_, index) => {
            return {
              rowSpan: _.recordIdRowSpan,
            };
          },
        },
        {
          title: t('sys.model.data') + 'ID',
          dataIndex: 'recordId',
          key: 'recordId',
          width: 330,
          customCell: (_, index) => {
            return {
              rowSpan: _.recordIdRowSpan,
            };
          },
        },
        {
          title: t('sys.appDesigner.detailData'),
          dataIndex: 'detailData',
          key: 'detailData',
          width: 400,
          customCell: (_, index) => {
            return {
              rowSpan: _.detailDataRowSpan,
            };
          },
        },
      ];
    } else {
      return newSonColumns.value;
    }
  };

  const targetIsVisible = ref(false);

  // 表格行合并计算逻辑
  function processData(data) {
    const result = [];
    let currentName = null;
    let count = 0;
    let startIndex = 0;

    data.forEach((item, index) => {
      if (item.name !== currentName) {
        if (count > 0) {
          // 设置上一组的rowSpan
          result[startIndex].nameRowSpan = count;
        }
        currentName = item.name;
        count = 1;
        startIndex = index;
        result.push({ ...item, nameRowSpan: 0 });
      } else {
        count++;
        result.push({ ...item, nameRowSpan: 0 });
      }
    });

    // 处理最后一组
    if (count > 0) {
      result[startIndex].nameRowSpan = count;
    }

    return result;
  }
  // 处理数据，添加合并标记
  const processedData = (dataSourse) => {
    if (dataSourse) {
      const data = JSON.parse(JSON.stringify(dataSourse));
      mergeCells(data, 'operationType');
      mergeCells(data, 'recordId');
      mergeCells(data, 'detailData');

      return data;
    }
    return dataSourse;
  };

  // 通用合并函数
  function mergeCells(data, field) {
    let pos = 0;
    while (pos < data.length) {
      const current = data[pos][field];
      let count = 1;

      while (pos + count < data.length && data[pos + count][field] === current) {
        count++;
      }

      if (count > 1) {
        data[pos][`${field}RowSpan`] = count;
        for (let i = 1; i < count; i++) {
          data[pos + i][`${field}RowSpan`] = 0;
        }
        pos += count;
      } else {
        data[pos][`${field}RowSpan`] = 1;
        pos++;
      }
    }
    const customCell = (_, index) => {
      // 可以在这里统一处理单元格样式
      return {};
    };
  }
</script>
<style lang="scss" scoped>
  :deep(.ant-table-expanded-row .ant-table-bordered > .ant-table-container) {
    border-right: none !important;
  }

  :deep(.ant-table-tbody .ant-table-row-level-1 td) {
    border-bottom: none !important;
  }

  .color-blue {
    color: #3168ec;
  }

  :deep(
    .ant-table-thead
      > tr
      > th:not(:last-child):not(.ant-table-selection-column):not(
        .ant-table-row-expand-icon-cell
      ):not([colspan])::before
  ) {
    width: 1px;
  }

  .col-table-border {
    border-right: 1px solid #e0e3ea;
  }

  .refresh-area {
    margin: 0 12px 12px;
    float: right;
  }

  :deep(.image-list-box .ant-image) {
    box-sizing: content-box;
    margin-right: 4px;
    border: 1px dashed#d9d9d9;
    border-radius: 2px;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    .ant-image-img {
      vertical-align: top;
    }

    .ant-image-img,
    .ant-image-mask {
      visibility: visible;
      border-radius: 2px;
    }
  }

  .scroll-container,
  .empty {
    position: relative;
    min-height: 400px;
    // overflow: hidden;
  }

  .scroll-container {
    margin-top: -23px;
    padding-bottom: 40px;
  }

  .pagination {
    position: absolute;
    z-index: 100;
    right: 20px;
    bottom: 53px;
    width: calc(100% - 40px);
    padding: 12px 0;
    background: #fff;
  }

  .item-header {
    display: flex;
    position: relative;
    padding: 16px;
    padding-left: 28px;
    color: var(--ant-primary-color);
  }

  .expanded-icon {
    position: absolute;
    top: 20px;
    left: 8px;
  }

  .expanded {
    border-radius: 4px;
    background: #f7f8fa;
  }

  .expanded-border {
    margin-bottom: 4px;
    border: 1px solid var(--ant-primary-color);
    border-radius: 4px;
  }

  .item-header.sticky-header {
    position: sticky;
    z-index: 100;
    top: -24px;
    right: 0;
    left: 0;
  }

  .img-box {
    flex-wrap: wrap;
  }

  .item-content {
    padding: 16px;
    padding-top: 76px; /* header高度 + 额外间距 */
  }

  .title {
    margin: 20px 0 12px 16px;
    color: #1e222b;
    font-size: 16px;
    font-weight: 500;

    &::before {
      content: ' ';
      display: inline-block;
      width: 3px;
      height: 16px;
      margin-right: 10px;
      background-color: var(--ant-primary-color);
      vertical-align: middle;
    }
  }

  .subTitle {
    margin: 20px 0 12px;
  }

  :deep(.ant-descriptions-row > td) {
    padding-bottom: 0;
  }

  :deep(.ant-descriptions-item-content) {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wrap {
    white-space: wrap;
  }

  .custom-close {
    color: #00000073;

    &:hover {
      color: #000000bf;
    }
  }
</style>
<style lang="less">
  .model-trace .ant-modal-body {
    width: 100%;
    // position: relative;
    max-height: calc(88vh - 150px);
    overflow-y: auto;
  }

  .trace-table {
    .ant-table-row {
      .ant-table-cell:nth-child(1),
      .ant-table-cell:nth-child(2),
      .ant-table-cell:nth-child(3),
      .ant-table-cell:nth-child(4),
      .ant-table-cell:nth-child(5) {
        border-right: 1px solid #f0f0f0;
      }

      .ant-table-cell:nth-last-child(1),
      .ant-table-cell:nth-last-child(2),
      .ant-table-cell:nth-last-child(3) {
        border-right: none;
      }
    }

    .ant-table-row.ant-table-row-level-1 {
      display: none;
    }
  }

  .full-modal {
    .ant-modal {
      top: 0;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;
    }

    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
    }

    .ant-modal-body {
      flex: 1;
    }
  }
</style>
