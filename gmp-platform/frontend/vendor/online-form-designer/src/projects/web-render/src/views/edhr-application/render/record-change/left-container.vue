<template>
  <div :class="{ [ns.b()]: true, [ns.e('collapsed')]: isCollapsed }">
    <div :class="[ns.e('container')]">
      <div :class="[ns.e('operating-console')]">
        <div :class="[ns.e('title')]">
          <span>{{ $t('sys.onlineForm.operationTable') }}</span>
        </div>
        <a-form layout="vertical" :model="formState" ref="formRef" class="px-12px! py-12px!">
          <a-form-item
            v-if="showRecordChange"
            :label="$t('sys.onlineForm.recordType')"
            name="recordType"
          >
            <a-select
              v-model:value="formState.recordType"
              :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.onlineForm.recordType') })"
              :options="options"
            />
          </a-form-item>
          <a-form-item
            :label="
              formState.recordType === 'eDHR'
                ? $t('sys.edhr.lotOrSn')
                : $t('sys.onlineForm.formIdent')
            "
            name="recordId"
          >
            <!-- <MaterialNoSelect
              v-if="formState.recordType === 'eDHR'"
              v-model:value="formState.recordId"
              :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.edhr.lotOrSn') })"
            /> -->
            <MaterialNoTableSelect
              v-if="formState.recordType === 'eDHR'"
              v-model:value="formState.recordId"
              :placeholder="$t('sys.pleaseSelectSth', { sth: $t('sys.edhr.lotOrSn') })"
              :pageAttr="{
                size: 'small',
                showSizeChanger: false,
              }"
            />
            <a-input
              v-else
              v-model:value="formState.recordId"
              :placeholder="
                $t('sys.inputTextTip', {
                  name:
                    formState.recordType === 'eDHR'
                      ? $t('sys.edhr.lotOrSn')
                      : $t('sys.onlineForm.formIdent'),
                })
              "
            />
          </a-form-item>
          <a-form-item>
            <a-row :gutter="12">
              <a-col class="gutter-row" :span="12">
                <a-button style="width: 100%" @click="() => formRef?.resetFields()">
                  {{ $t('sys.reset') }}
                </a-button>
              </a-col>
              <a-col class="gutter-row" :span="12">
                <a-button type="primary" style="width: 100%" @click="handleSearch">
                  {{ $t('sys.queryText') }}
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-form>
      </div>
      <div :class="[ns.e('doc-info')]">
        <div :class="[ns.e('title')]">
          <span>{{ $t('sys.onlineForm.formBasic') }}</span>
        </div>
        <div class="form-container">
          <Scrollbar class="px-12px py-12px">
            <a-form layout="vertical" :model="docInfoData">
              <a-form-item :label="$t('sys.onlineForm.formName')">{{
                docInfoData.tmplName ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.onlineForm.relatedProducts')">{{
                docInfoData.productName ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.onlineForm.currentFormStatus')">
                <instance-status-label
                  :form-type="docInfoData.formType!"
                  :data-status="docInfoData.dataStatus"
                  :instance-status="docInfoData.instanceStatus!"
                  use-dynamic-color
                />
              </a-form-item>
              <a-form-item :label="$t('sys.onlineForm.linkFormNum')">{{
                docInfoData.relatedFormCount ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.onlineForm.formCreateTime')">{{
                docInfoData.createTime ?? '-'
              }}</a-form-item>
              <a-form-item :label="$t('sys.onlineForm.formModifyTime')">
                {{ docInfoData.modifyTime ?? '-' }}</a-form-item
              >
            </a-form>
          </Scrollbar>
        </div>
      </div>
    </div>

    <div
      :class="{
        'toggle-btn': true,
        'toggle-btn--collapsed': isCollapsed,
      }"
      @click="toggleCollapsed"
    >
      <i class="iconfont icon-a-Leftarrow"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, onBeforeMount, onUnmounted, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { message } from 'ant-design-vue';
  import type { FormInstance } from 'ant-design-vue';
  import { InstanceStatusLabel } from '/@online-form/views/integration/apaas_ebr/index';
  import { Scrollbar } from '/@/components/Scrollbar';
  import {
    getOnlineFormInstanceFindRelationInfoById,
    getOnlineFormInstanceFindOfTaskBySerialNo4Change,
  } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { OnlineFormInstanceRelationInfoResponse } from '/@/apis/gct-apaas/model';
  import { useNocodeEmitter } from '@gct/nocode-base';
  import MaterialNoSelect from '../../components/material-no-select/material-no-select.vue';
  import MaterialNoTableSelect from '../../components/material-no-table-select/material-no-table-select.vue';

  const { t } = useI18n();

  const { emitter, EmitterEnum } = useNocodeEmitter();
  const ns = useNamespace('record-change-left-container');

  const options = [
    {
      label: 'DHR',
      value: 'eDHR',
    },
    {
      label: $t('sys.form'),
      value: 'doc',
    },
  ];

  const props = withDefaults(
    defineProps<{
      value?: any;
      loading?: boolean;
      showRecordChange: boolean;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value?: any): void;
    (e: 'update:loading', value?: boolean): void;
    (e: 'query-click-callback'): void;
  }>();

  const formRef = ref<FormInstance>();

  const docInfoData = ref<OnlineFormInstanceRelationInfoResponse>({}); // 表单信息

  const isCollapsed = ref(false); // 是否折叠

  const cacheId = ref<string | undefined>('');
  const cacheType = ref<string | undefined>('');

  const formState = reactive<{
    /** 变更类型 */
    recordType: string | undefined;
    /** 记录表示 */
    recordId: string | undefined;
  }>({
    recordType: 'eDHR',
    recordId: undefined,
  });

  watch(
    () => props.value,
    (value) => {
      if (value) {
        Object.assign(formState, value);
      }
    },
    { immediate: true, deep: true },
  );

  onBeforeMount(() => {
    // 打开单个批注详情
    emitter.on(EmitterEnum.__on_select_ebr_doc_instance_id, (params: any) => {
      console.log('打开单个批注详情 aaaa', params);
      requestData(params.instanceId);
    });
  });

  onUnmounted(() => {
    emitter.off(EmitterEnum.__on_select_ebr_doc_instance_id);
  });

  async function requestData(id) {
    docInfoData.value = {};
    if (id) {
      try {
        const detail = await getOnlineFormInstanceFindRelationInfoById({ id: id });

        if (detail) {
          docInfoData.value = detail;
        }
      } catch (error) {}
    }
  }

  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value;
  };

  async function setLoading(loading: boolean) {
    emit('update:loading', loading);
  }

  const handleSearch = async () => {
    let isCache = false;
    if (cacheId.value === formState.recordId && cacheType.value === formState.recordType) {
      isCache = true;
      // return;
    }

    if (!formState.recordId) {
      message.warn(
        $t('sys.inputTextTip', {
          name:
            formState.recordType === 'eDHR' ? $t('sys.edhr.lotOrSn') : $t('sys.onlineForm.formIdent'),
        }),
      );
      return;
    }

    cacheId.value = formState.recordId;
    cacheType.value = formState.recordType;
    docInfoData.value = {};
    setLoading(true);

    if (formState.recordType === 'doc' && formState.recordId) {
      let result;
      try {
        result = await getOnlineFormInstanceFindOfTaskBySerialNo4Change({
          serialNo: formState.recordId,
        });
        if (result && result.id) {
          docInfoData.value = result;
        }
        if (isCache) {
          emit('query-click-callback');
        } else {
          emit('update:value', {
            recordType: formState.recordType,
            recordId: formState.recordId,
            instanceId: result ? result.id : undefined,
            instanceStatus: result ? result.instanceStatus : undefined,
          });
        }
      } catch (error) {}
    } else {
      if (isCache) {
        emit('query-click-callback');
      } else {
        emit('update:value', {
          recordType: formState.recordType,
          recordId: formState.recordId,
          instanceId: undefined,
          instanceStatus: undefined,
        });
      }
    }

    setLoading(false);
  };

  defineExpose({
    onSearch: handleSearch,
  });
</script>

<style lang="less" scoped>
  .gct-record-change-left-container {
    position: relative;
    width: 242px;
    height: 100%;
    transition: width 0.3s ease;
    border-right: 1px solid #e8ecf0;

    .ant-form-item {
      margin-bottom: 12px;

      :deep(.ant-form-item-label) {
        label {
          color: #252525;
          font-size: 12px;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    &__title {
      position: relative;
      padding: 14px 12px;
      border-bottom: 1px solid #e8ecf0;
      line-height: 18px;

      span {
        display: inline-block;
        color: #212528;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
      }
    }

    &__operating-console {
      flex: 0 0 auto;
    }

    &__doc-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;

      .form-container {
        height: 100%;
        overflow: hidden;

        :deep(.ant-form-item-label) {
          padding-bottom: 6px;

          label {
            color: #252525;
            font-size: 12px;
          }
        }

        :deep(.ant-form-item-control) {
          .ant-form-item-control-input {
            min-height: 22px;
            color: #666;
            font-size: 12px;
            line-height: 22px;
          }
        }
      }
    }

    .toggle-btn {
      display: flex;
      position: absolute;
      z-index: 999;
      top: 24px;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      transform: translate3d(50%, -50%, 0);
      transition: all 0.3s;
      border: 1px solid #d9d9d9;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;

      .icon-a-Leftarrow {
        font-size: 12px;
      }

      &--collapsed {
        .icon-a-Leftarrow {
          transform: scale(0.8) rotateY(180deg);
        }
      }
    }

    &__collapsed {
      width: 0;
      padding: 0;

      .gct-record-change-left-container__container {
        width: 0;
        overflow: hidden;
      }
    }
  }
</style>
