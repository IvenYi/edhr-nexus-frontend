<template>
  <div class="template-setting">
    <div class="title">{{ t('sys.appDesigner.templateConfig') }}</div>
    <div>
      <a-form
        :model="defaultDataTpl"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 21 }"
        autocomplete="off"
      >
        <a-form-item
          :label="
            dataTplInfo.type === 'IMPORT'
              ? t('sys.appDesigner.writeTip')
              : t('sys.appDesigner.importTip')
          "
          name="notes"
          :rules="[{ required: dataTplInfo.type === 'IMPORT' }]"
        >
          <a-textarea
            class="--resize-none"
            v-model:value="defaultDataTpl.notes"
            show-count
            :maxlength="120"
            style="width: 30%"
          />
        </a-form-item>
        <a-form-item
          :label="
            dataTplInfo.type === 'IMPORT'
              ? t('sys.appDesigner.tipBoxHeight')
              : t('sys.appDesigner.descBoxHeight')
          "
          name="rowHeight"
          :rules="[{ required: dataTplInfo.type === 'IMPORT' }]"
        >
          <a-input-number
            class="input-number"
            v-model:value="defaultDataTpl.rowHeight"
            :placeholder="
              t('sys.pleaseInputSth', {
                sth:
                  dataTplInfo.type === 'IMPORT'
                    ? t('sys.appDesigner.tipBoxHeight')
                    : t('sys.appDesigner.descBoxHeight'),
              })
            "
            :min="0"
            :controls="false"
          />
        </a-form-item>
        <a-form-item
          v-if="dataTplInfo.type === 'IMPORT'"
          :label="t('sys.appDesigner.importPolicy')"
          name="duplicateKeyUpdate"
          :rules="[{ required: true }]"
        >
          <a-select v-model:value="defaultDataTpl.duplicateKeyUpdate" style="width: 30%">
            <a-select-option :value="DuplicateKeyUpdateEnum.NEWANDUPDATED">{{
              t('sys.appDesigner.createAndUpdate')
            }}</a-select-option>
            <a-select-option :value="DuplicateKeyUpdateEnum.NEW">{{
              t('sys.appDesigner.create')
            }}</a-select-option>
          </a-select>
          <a-descriptions
            class="import-policy-desc"
            :column="1"
            :labelStyle="{ color: '#ff4d4f', alignSelf: 'center' }"
            :contentStyle="{ color: '#ff4d4f', flex: 20 }"
            size="small"
            v-show="defaultDataTpl.duplicateKeyUpdate === DuplicateKeyUpdateEnum.NEW"
          >
            <a-descriptions-item :label="t('sys.appDesigner.createTipName')">
              {{ t('sys.appDesigner.createTipContent') }}
            </a-descriptions-item>
          </a-descriptions>
          <a-descriptions
            class="import-policy-desc"
            :column="1"
            :labelStyle="{ color: '#ff4d4f', alignSelf: 'center' }"
            :contentStyle="{ color: '#ff4d4f', flex: 20 }"
            size="small"
            v-show="defaultDataTpl.duplicateKeyUpdate === DuplicateKeyUpdateEnum.NEWANDUPDATED"
          >
            <a-descriptions-item :label="t('sys.appDesigner.createAndUpdateTipName')">
              {{ t('sys.appDesigner.createAndUpdateTipContent') }}
            </a-descriptions-item>
          </a-descriptions>
        </a-form-item>
        <a-form-item
          v-if="dataTplInfo.type === 'IMPORT'"
          :label="t('sys.appDesigner.dataOnlyRules')"
          :rules="[
            {
              required: defaultDataTpl.duplicateKeyUpdate === DuplicateKeyUpdateEnum.NEWANDUPDATED,
            },
          ]"
        >
          <a-select
            mode="multiple"
            v-model:value="defaultDataTpl.uniqueColumns"
            style="width: 30%"
            :disabled="isRdoModel"
            :maxTagCount="5"
            :maxTagTextLength="6"
          >
            <template #suffixIcon>
              <down-outlined />
            </template>
            <template v-for="item in uniqueFields" :key="item">
              <a-select-option :value="item.key">{{ item.aliasName }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { DuplicateKeyUpdateEnum } from '../type';
  import { useFieldData } from '../hooks/useFieldData';
  import { ExcelTmplResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CreateType } from '/@/enums/appEnum';

  const { t } = useI18n();

  const props = defineProps<{
    dataTplInfo: ExcelTmplResponse;
  }>();

  const { fields, defaultDataTpl } = useFieldData();

  const isRdoModel = computed(() => {
    return props.dataTplInfo.modelType === 'RDO';
  });

  const uniqueFields = computed(() => {
    if (!fields.value) return [];

    return fields.value.filter((item) => {
      if (isRdoModel.value) {
        return ['name_', 'version_'].includes(item.key) && item.createType === CreateType.BUILTIN;
      }
      return item.createType !== CreateType.SYSTEM;
    });
  });
</script>

<style lang="less" scoped>
  .border(@fs, @bh, @bw:3px) {
    display: flex;
    align-items: center;
    font-size: @fs;
    font-weight: bold;
    &::before {
      height: @bh;
      content: ' ';
      border-left: @bw solid var(--ant-primary-color);
      padding-right: 6px;
    }
  }
  .template-setting {
    height: 100%;
    overflow: auto;
    .title {
      padding: 14px 16px 20px;
      .border(16px, 12px);
    }
    .input-number {
      width: 30% !important;
    }
    .editor-wrapper {
      // height: 100px;
      border: 1px solid #eaeaea;
      border-radius: 4px;
      width: 50%;
    }

    .import-policy-desc {
      :deep(.ant-descriptions-item) {
        padding-bottom: 0;
        padding-top: 8px;
      }
    }

    .tips {
      color: #ff4d4f;
      user-select: none;
    }
  }
</style>
