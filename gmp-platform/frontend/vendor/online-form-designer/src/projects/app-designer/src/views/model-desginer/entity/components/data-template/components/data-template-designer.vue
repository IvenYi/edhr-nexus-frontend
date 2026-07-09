<template>
  <div class="data-template box-full">
    <div class="toolbar">
      <div class="breadcrumb">
        <a-breadcrumb>
          <a-breadcrumb-item>{{ dataTplInfo?.modelName }}</a-breadcrumb-item>
          <a-breadcrumb-item
            ><a href="">{{
              `${dataTplInfo?.name}${t(`sys.${dataTplInfo?.type?.toLowerCase()}`)}模板`
            }}</a></a-breadcrumb-item
          >
        </a-breadcrumb>
      </div>
      <div class="actions">
        <a-button class="btn mr-12px" type="primary" ghost @click="handleDownload">
          <i class="iconfont icon-xiazai mr-5px"></i>
          {{ t('sys.download') }}
        </a-button>
        <a-button class="btn mr-12px" type="primary" ghost @click="handleSetting">
          <i class="iconfont icon-template mr-5px"></i>
          {{ t('sys.appDesigner.templateConfig') }}
        </a-button>
        <a-button class="btn" type="primary" @click="handleSave">
          <i class="iconfont icon-baocun1 mr-5px"></i>
          {{ t('sys.saveText') }}
        </a-button>
      </div>
    </div>
    <div class="tpl-container">
      <div class="aside">
        <div class="header">{{ t('sys.appDesigner.tableHeaderField') }}</div>
        <div class="fieldList">
          <draggable v-model="filteredFields" handle=".mover" :animation="200" ghostClass="ghost">
            <template #item="{ element }">
              <div class="field-checkbox">
                <a-checkbox
                  :class="{ 'is-checkbox-disabled': element.checked && element.fieldDisabled }"
                  :checked="element.checked"
                  @change="(e) => onChange(e, element)"
                  :disabled="element.fieldDisabled"
                  >{{ `${element.name}(${element.key})` }}
                </a-checkbox>
                <a-tooltip placement="top">
                  <template #title>
                    <span>{{ t('sys.appDesigner.canDrag') }}</span>
                  </template>
                  <i class="iconfont icon-drag mover" @click="handleIconClick"></i>
                </a-tooltip>
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div class="temp">
        <div class="top">
          <div class="title">{{ t('sys.appDesigner.template') }}</div>
          <div class="alert">
            <a-alert :message="defaultDataTpl.notes" type="warning" show-icon />
          </div>
          <div class="table">
            <a-table
              :striped="false"
              :bordered="true"
              :showIndexColumn="false"
              :ellipsis="true"
              :columns="tableColumns"
              :row-key="(record) => record.key"
              :data-source="[]"
              size="small"
              style="padding: 0 8px"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <a>
                    {{ record.name }}
                  </a>
                </template>
              </template>
            </a-table>
          </div>
        </div>
        <div class="bottom">
          <import-template-setting v-if="isShowTplSetting" :dataTplInfo="dataTplInfo!" />
          <data-column-setting
            v-if="isShowColumnSetting && isSelectedFieldInChecked"
            :fieldId="selectedField.id"
            :dataTplInfo="dataTplInfo!"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import draggable from 'vuedraggable';
  import { useFieldData } from '../hooks/useFieldData';
  import ImportTemplateSetting from '../column-settings/import-template-setting.vue';
  import DataColumnSetting from '../column-settings/data-column-setting.vue';
  import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
  import { getExcelTmplInfo, postExcelTmplConfig } from '/@/apis/gct-apaas/ExcelTmplController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { message } from 'ant-design-vue';
  import { downloadByUrl } from '/@/utils/file/download';
  import { DataTemplateEnum } from '../type';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { EntityModelTypeEnum } from '/@app-designer/enum';

  const {
    dataTplId,
    fields: filteredFields,
    defaultDataTpl,
    modelKey,
    getDataTplConfigJson,
  } = useFieldData();

  const { t } = useI18n();

  const selectedField = ref();
  const isShowTplSetting = ref(false);
  const isShowColumnSetting = ref(false);
  const dataTplInfo = ref<ExcelTmplResponse>();
  const excelUrl = ref('');
  const isSelectedFieldInChecked = ref(false);

  const tableColumns = computed(() => {
    if (!filteredFields.value) return;
    const items: IData[] = [];
    filteredFields.value.forEach((field) => {
      if (field.checked) {
        items.push({
          title: field.aliasName,
          dataIndex: field.key,
          width: field.columnWidth + 'px',
          customHeaderCell: () => {
            return {
              onClick: () => {
                isShowColumnSetting.value = true;
                isShowTplSetting.value = false;
                selectedField.value = field ?? {};
                isSelectedFieldInChecked.value = !!field;
              },
            };
          },
        });
      }
    });
    return items.filter((item) => {
      return item !== undefined;
    });
  });

  // 选中数据变更
  const onChange = (e, data) => {
    data.checked = e.target.checked;
    if (data.type === FIELD_TYPE.RDO_REF) {
      const item = filteredFields.value.find((item) => {
        return item.id === data.id + '_version_';
      });
      item.checked = data.checked;
    }

    isSelectedFieldInChecked.value =
      selectedField.value?.id &&
      filteredFields.value.some((item) => {
        return item.checked && item.id === selectedField.value?.id;
      });

    if (selectedField.value?.id && !isSelectedFieldInChecked.value) {
      selectedField.value = {};
    }
  };

  const handleIconClick = (event) => {
    // 阻止点击事件冒泡到复选框
    event.stopPropagation();
    // 在这里可以添加处理图标点击的逻辑
  };

  // 下载
  const handleDownload = () => {
    if (excelUrl.value) {
      const url = transformUrl(excelUrl.value);
      downloadByUrl({
        url,
        fileName: `${dataTplInfo.value!.name}.xlsx`,
      });
    } else {
      message.warn('下载文件前，请先保存！');
    }
  };

  // 配置
  const handleSetting = () => {
    isShowTplSetting.value = true;
    isShowColumnSetting.value = false;
  };

  // 保存
  const handleSave = async () => {
    const columns = filteredFields.value.filter((item) => item.checked);
    const config = {
      configJson: {
        columns,
        ...defaultDataTpl,
      },
      key: dataTplInfo.value?.key,
      modelKey,
    };
    excelUrl.value = (await postExcelTmplConfig(config)) ?? '';
    message.success(t('sys.saveSuccess'));
  };

  // 获取当前模板的信息
  const getDataTplInfo = async () => {
    dataTplInfo.value = (await getExcelTmplInfo({ id: dataTplId })) || {};
    getDataTplConfigJson({ isImport: dataTplInfo.value.type === DataTemplateEnum.EXPORT });
  };

  onMounted(() => {
    getDataTplInfo();
    if (
      dataTplInfo.value?.type === DataTemplateEnum.EXPORT &&
      dataTplInfo.value?.modelType === EntityModelTypeEnum.DYNAMIC_FORM
    ) {
      filteredFields.value = filteredFields.value?.filter(
        (e) => !['ref_master_id_', 'ref_model_key_', 'ref_field_key_'].includes(e.key),
      )||[]
    }
  });
</script>

<style lang="less" scoped>
  .border(@fs, @bh, @bw:3px) {
    display: flex;
    align-items: center;
    font-size: @fs;
    font-weight: bold;

    &::before {
      content: ' ';
      height: @bh;
      padding-right: 6px;
      border-left: @bw solid var(--ant-primary-color);
    }
  }

  .data-template {
    width: 100%;
    height: 100%;
    background-color: #eff3f9;

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 56px;
      padding: 0 16px;
      border-bottom: 1px solid #eaeaea;
      background-color: #fff;

      .actions {
        .btn {
          border-radius: 4px;
        }
      }
    }

    .tpl-container {
      display: flex;
      height: calc(100% - 56px);

      .aside {
        width: 260px;
        margin-top: 1px;
        margin-bottom: 16px;
        margin-left: 16px;
        background-color: #fff;

        .header {
          height: 48px;
          padding-left: 16px;
          border-bottom: 1px solid #eaeaea;
          font-family: PingFangSC-Regular, 'PingFang SC';
          font-size: 16px;
          font-weight: 400;
          line-height: 48px;
        }
      }

      .temp {
        flex: 1;
        margin: 8px 16px 16px 8px;

        .top {
          height: 50%;
          background-color: #fff;

          .title {
            padding-top: 12px;
            padding-left: 16px;
            .border(14px, 12px);
          }

          .alert {
            padding: 12px 16px 8px;
          }

          .table {
            width: 100%;
            // :deep(.vben-basic-table) {
            //   width: 500px;
            // }
          }
        }

        .bottom {
          height: calc(50% - 8px);
          margin-top: 8px;
          background-color: #fff;
        }
      }

      .fieldList {
        height: calc(100% - 60px);
        overflow: auto;
        user-select: none;

        .field-checkbox {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 6px 12px 6px 16px;
          background-color: #fff;

          :deep(.is-checkbox-disabled > .ant-checkbox-disabled) {
            + span {
              color: #333;
              cursor: default;
            }
          }

          &:hover {
            background-color: #f7f7f7;
          }

          &.ghost {
            opacity: 0.5;
            background: #f5f5f5;
          }

          .mover {
            position: absolute;
            top: 50%;
            right: 12px;
            transform: translateY(-50%);
            color: #96a0b5;
            font-size: 12px;
            cursor: pointer;

            &:hover {
              color: rgb(0 0 0 / 50%);
            }
          }
        }
      }
    }
  }
</style>
