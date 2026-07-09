<template>
  <div class="error-group-panel-wrapper">
    <a-collapse
      class="error-group-panel--collapse"
      v-model:activeKey="activeKeys"
      :bordered="false"
    >
      <template #expandIcon="{ isActive }">
        <CaretRightOutlined :rotate="isActive ? 90 : 0" />
      </template>
      <a-collapse-panel v-for="group of groupedByModelKey" :key="group.showModelKey">
        <template #header>
          <div class="header-title-content">
            <div class="title-area">
              <span class="title">{{ group.showModelName }}</span>
              <a-tooltip>
                <template #title>
                  <div class="tooltip-content">
                    <a-descriptions
                      :column="1"
                      :colon="true"
                      :labelStyle="{ color: '#fff', fontSize: '12px' }"
                      :contentStyle="{ color: '#fff', fontSize: '12px' }"
                    >
                      <a-descriptions-item
                        :label="
                          group.subFieldKey
                            ? $t('sys.model.childModelKey')
                            : $t('sys.model.modelKey')
                        "
                        >{{ group.showModelKey }}</a-descriptions-item
                      >
                      <a-descriptions-item
                        :label="$t('sys.model.viewFieldKey')"
                        v-if="group.subFieldKey"
                        >{{ group.subFieldKey }}</a-descriptions-item
                      >
                    </a-descriptions>
                  </div>
                </template>
                <i class="iconfont icon-assist"></i>
              </a-tooltip>
            </div>
            <span
              class="sub-type-status"
              :style="{
                '--nocode-textColor': group.themeConfig?.textColor,
                '--nocode-bgColor': group.themeConfig?.background,
              }"
              >{{ group.themeConfig?.placeholder }}</span
            >
          </div>
        </template>
        <div class="content">
          <a-descriptions
            bordered
            :column="1"
            size="small"
            :labelStyle="{ color: '#252525', fontSize: '12px', width: '200px' }"
            :contentStyle="{ color: '#ff4d4f', fontSize: '12px' }"
          >
            <template v-for="field of group.fields" :key="field.targetFieldId">
              <template v-if="Array.isArray(field.messages)">
                <a-descriptions-item>
                  <template #label>
                    <span class="title">{{ field.showFieldName }}</span>
                    <a-tooltip>
                      <template #title>
                        <div class="tooltip-content">
                          <a-descriptions
                            :colon="true"
                            :labelStyle="{ color: '#fff', fontSize: '12px' }"
                            :contentStyle="{ color: '#fff', fontSize: '12px' }"
                          >
                            <a-descriptions-item :label="$t('sys.model.viewFieldKey')">{{
                              field.targetFieldId
                            }}</a-descriptions-item>
                          </a-descriptions>
                        </div>
                      </template>
                      <i class="iconfont icon-assist text-14px! ml-4px"></i>
                    </a-tooltip>
                  </template>
                  <span class="message-title" v-for="message of field.messages">{{ message }}</span>
                </a-descriptions-item>
              </template>
              <template v-else>
                <a-descriptions-item v-for="(messages, index) of field.messages">
                  <template #label>
                    <span class="title">{{ field.showFieldName }}</span>
                    <a-tooltip>
                      <template #title>
                        <div class="tooltip-content">
                          <a-descriptions
                            :colon="true"
                            :labelStyle="{ color: '#fff', fontSize: '12px' }"
                            :contentStyle="{ color: '#fff', fontSize: '12px' }"
                          >
                            <a-descriptions-item :label="$t('sys.model.viewFieldKey')">{{
                              field.targetFieldId
                            }}</a-descriptions-item>
                          </a-descriptions>
                        </div>
                      </template>
                      <i class="iconfont icon-assist text-14px! ml-4px"></i>
                    </a-tooltip>
                  </template>
                  <span class="message-title" v-for="message of messages">{{ message }}</span>
                </a-descriptions-item>
              </template>
            </template>
          </a-descriptions>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts" name="error-group-panel">
  import { ref, computed } from 'vue';
  import { useModal } from '@gct/runtime';
  import { MobileFillTypeEnum } from '@gct/nocode-base';

  const statusMap = {
    [MobileFillTypeEnum.MAIN_FIELD]: {
      textColor: '#309C41',
      background: 'rgba(48,156,65,0.2)',
      placeholder: $t('sys.component.fieldTransfer.subMainModel'),
    },
    [MobileFillTypeEnum.SUB_TABLE]: {
      textColor: '#742fb2',
      background: 'rgba(116, 47, 178, 0.2)',
      placeholder: $t('sys.onlineForm.subTableType.DEFAULT'),
    },
    [MobileFillTypeEnum.FIXED_TABLE]: {
      textColor: '#845832',
      background: 'rgba(132,88,50, 0.2)',
      placeholder: $t('sys.onlineForm.subTableType.FIXED'),
    },
    [MobileFillTypeEnum.SUB_TABLE_2D]: {
      textColor: '#6D82B0',
      background: '#E6EEFF',
      placeholder: $t('sys.onlineForm.subTableType.2D'),
    },
    [MobileFillTypeEnum.SUB_TABLE_2D_LINK]: {
      textColor: '#F77E4A',
      background: 'rgba(247,126,74,0.2)',
      placeholder: $t('sys.onlineForm.subTable2DLink'),
    },
    [MobileFillTypeEnum.CHECK_TABLE_2D]: {
      textColor: '#13C2C2',
      background: 'rgba(19,194,194,0.2)',
      placeholder: $t('sys.onlineForm.subTableType.CHECK'),
    },
    [MobileFillTypeEnum.CHECK_TABLE_2D_LINK]: {
      textColor: '#F77E4A',
      background: 'rgba(247,126,74,0.2)',
      placeholder: $t('sys.onlineForm.checkTable2DLink'),
    },
    [MobileFillTypeEnum.MATERIAL_CONSUME_TABLE]: {
      textColor: '#4C8CAA',
      background: 'rgba(76,140,170,0.12)',
      placeholder: $t('sys.onlineForm.subTableType.MATERIAL_CONSUMPTION'),
    },
  };

  const props = defineProps<{
    /** 错误信息集合 */
    errorMap: any;
    subTableInfo: any;
  }>();

  const groupedByModelKey = computed<any>(() => {
    const result = {};

    const addToSet = (map, key, val) => {
      if (!map[key]) map[key] = new Set();
      map[key].add(val);
    };

    for (const errorList of Object.values(props.errorMap)) {
      for (const { field, message: messageJson } of errorList as any[]) {
        const { showModelName, showModelKey, showFieldName, subFieldKey, targetFieldId, message } =
          JSON.parse(messageJson);

        if (!result[showModelKey]) {
          const info = props.subTableInfo.find((item) => item.field === subFieldKey);
          const themeConfig = statusMap[info?.subType ?? MobileFillTypeEnum.MAIN_FIELD];
          result[showModelKey] = {
            showModelName,
            showModelKey,
            subFieldKey,
            themeConfig,
            fields: {},
          };
        }

        const modelGroup = result[showModelKey];

        if (!modelGroup.fields[targetFieldId]) {
          modelGroup.fields[targetFieldId] = {
            showFieldName,
            targetFieldId,
            linkFields: targetFieldId === 'value_' ? {} : new Set(),
            messages: targetFieldId === 'value_' ? {} : new Set(),
          };
        }

        const fieldGroup = modelGroup.fields[targetFieldId];

        if (targetFieldId === 'value_') {
          const m = field.match(/^(.*_value_)_(\d+)$/);
          if (!m) continue;
          const groupKey = m[1];
          addToSet(fieldGroup.linkFields, groupKey, field);
          addToSet(fieldGroup.messages, groupKey, message);
        } else {
          fieldGroup.linkFields.add(field);
          fieldGroup.messages.add(message);
        }
      }
    }

    for (const model of Object.values(result) as any[]) {
      for (const field of Object.values(model.fields) as any[]) {
        if (field.targetFieldId === 'value_') {
          for (const key in field.linkFields) {
            field.linkFields[key] = [...field.linkFields[key]];
            field.messages[key] = [...field.messages[key]];
          }
        } else {
          field.linkFields = [...field.linkFields];
          field.messages = [...field.messages];
        }
      }
    }
    return result;
  });

  const activeKeys = ref(Object.keys(groupedByModelKey.value));

  useModal(async () => {
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
    };
  });
</script>

<style scoped lang="less">
  .error-group-panel-wrapper {
    padding: 16px;
    .ant-collapse.error-group-panel--collapse {
      background: #fff;
      :deep(.ant-collapse-item) {
        margin-bottom: 4px;
        border: 1px solid #e8ecf0;

        .ant-collapse-header {
          padding: 8px;
          background: #f8f8f8;
          > div:first-child {
            display: flex;
            align-items: center;
            height: 24px;
            width: 24px;
            justify-content: center;
            .anticon {
              font-size: 16px;
              margin-right: 0;
              color: #8f8f8f;
            }
          }

          .header-title-content {
            display: flex;
            height: 24px;
            align-items: center;
            justify-content: space-between;
            flex: 1;
            padding-left: 4px;
            padding-right: 8px;
            overflow: hidden;

            .title-area {
              display: flex;
              height: 24px;
              align-items: center;
              overflow: hidden;
              .title {
                color: #212528;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-right: 4px;
              }

              .iconfont {
                height: 24px;
                margin-left: 4px;
              }
            }
          }

          .sub-type-status {
            display: inline-block;
            padding: 0 6px;
            line-height: 22px;
            color: var(--nocode-textColor);
            background: var(--nocode-bgColor);
            border-radius: 4px 4px 4px 4px;
          }
        }

        .ant-collapse-content-box {
          display: flex;
          padding: 0;
          overflow: hidden;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-top: 1px solid #e8ecf0;
          background-color: #fff;

          .content {
            padding: 8px 16px;
            cursor: pointer;
            width: 100%;

            .ant-descriptions-item-content {
              > span {
                display: inline-flex;
                flex-direction: column;
                .message-title {
                  &:not(:last-child) {
                    margin-bottom: 4px !important;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .tooltip-content {
    :deep(.ant-descriptions) {
      .ant-descriptions-view {
        > table {
          width: auto;

          .ant-descriptions-row {
            .ant-descriptions-item {
              padding-bottom: 8px !important;
            }
            &:last-child {
              .ant-descriptions-item {
                padding-bottom: 0 !important;
              }
            }
          }
        }
      }
    }
  }
</style>
