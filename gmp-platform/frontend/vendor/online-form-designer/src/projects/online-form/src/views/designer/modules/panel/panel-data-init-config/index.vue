<template>
  <div class="panel-data-init-config-wrapper">
    <a-collapse
      class="override"
      v-model:activeKey="activeCollapse"
      ghost
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="$t('sys.edhr.parameterMapping')">
        <div class="param-area">
          <div class="param-item" v-for="item of formState.parameterMapping" :key="item.id">
            <param-field-link :item="item" @on-delete="removeParamItem(item.id)" />
          </div>
          <add-button
            class="mt-8px"
            :title="$t('sys.onlineForm.addParameterMapping')"
            @on-add="addParamItem"
          />
        </div>
      </a-collapse-panel>

      <a-collapse-panel key="2" :header="$t('sys.integration.dataSource')">
        <div class="data-source-area">
          <div
            class="data-source-item"
            :class="{
              'is-last':
                formState.customDataSource && dsIndex === formState.customDataSource.length - 1,
            }"
            v-for="(dsItem, dsIndex) of formState.customDataSource"
            :key="dsItem.id"
          >
            <data-source-title
              :class="{ 'is-first': dsIndex === 0 }"
              :title="$t('sys.integration.dataSource')"
              :id="dsItem.id"
              v-model:activeKeys="activeKeys"
              @on-delete="onDeleteDsItem(dsItem.id)"
            />

            <template v-if="!activeKeys.includes(dsItem.id)">
              <data-source-model-link
                v-model:items="dsItem.onExpressions"
                v-model:joinModelType="dsItem.joinModelType"
                v-model:joinFormRefId="dsItem.joinFormRefId"
                v-model:joinModelKey="dsItem.joinModelKey"
                v-model:joinSubModel="dsItem.joinSubModel"
                v-model:joinSqlJson="dsItem.joinSqlJson"
                v-model:joinBuiltinConfig="dsItem.joinBuiltinConfig"
                :joinIpaasConfig="dsItem.joinIpaasConfig"
                :modelList="modelList"
                :dbList="dbList"
                :ipaasList="ipaasList"
                :builtinList="builtinList"
                @on-clear="onClearItem(dsItem)"
                @on-clear-all="onClearItemAll(dsItem)"
                @on-clear-field="onClearField(dsItem)"
              />
              <template v-for="(fmItem, index) of dsItem.onFieldMap" :key="fmItem.id">
                <data-source-title
                  :class="{
                    'is-first': index === 0,
                    'is-last': index === dsItem.onFieldMap.length - 1,
                  }"
                  :title="$t('sys.onlineForm.fieldMapping')"
                  isChild
                  v-model:activeKeys="activeKeys"
                  v-model:items="dsItem.onFieldMap"
                  :id="fmItem.id"
                  :index="index"
                />
                <data-source-field-map
                  v-if="!activeKeys.includes(fmItem.id)"
                  :class="{ 'is-last': index === dsItem.onFieldMap.length - 1 }"
                  :item="fmItem"
                  :joinModelType="dsItem.joinModelType!"
                  :joinFormRefId="dsItem.joinFormRefId!"
                  :joinModelKey="dsItem.joinModelKey!"
                  :joinSqlJson="dsItem.joinSqlJson!"
                  :joinBuiltinConfig="dsItem.joinBuiltinConfig!"
                />
              </template>
            </template>
          </div>
          <add-button
            class="mt-12px"
            :title="$t('sys.onlineForm.addDataSource')"
            @on-add="addDataSourceItem"
          />
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts" name="panel-data-init-config">
  import { ref, computed, onBeforeMount } from 'vue';
  import { buildUUID } from '/@/utils/uuid';

  import AddButton from './add-button.vue';
  import ParamToFieldDrop from './param-to-field-drop.vue';
  import DataSourceTitle from './common/data-source-title.vue';
  import DataSourceModelLink from './common/data-source-model-link.vue';
  import DataSourceFieldMap from './common/data-source-field-map.vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import ParamFieldLink from './common/param-field-link.vue';
  import { getCategoryGetListRdoOrNdo } from '/@/apis/gct-apaas/CategoryController';
  import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
  import { getDataSourcePageList } from '/@/apis/gct-apaas/DataSourceController';
  import { getFlowListOnline } from '/@/apis/gct-ipaas2/FlowMainController';
  import { getOnlineFormDataInitProtocolList } from '/@/apis/gct-apaas/OnlineFormDataInitController';
  import {
    CategoryCompleteResponse,
    DataSourceDTO,
    OnlineFormDataInitProtocolDTO,
  } from '/@/apis/gct-apaas/model';
  import { JoinModelTypeEum, ParamModelTypeEnum } from '@gct/nocode-base';
  import { FlowMainResp } from '/@/apis/gct-ipaas2/model';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { paper } = useSpreadSheet();

  const activeCollapse = ref(['1', '2', '3']);
  const modelList = ref<CategoryCompleteResponse[]>([]);
  const dbList = ref<DataSourceDTO[]>([]);
  const ipaasList = ref<FlowMainResp[]>([]);
  const builtinList = ref<OnlineFormDataInitProtocolDTO[]>([]);
  const activeKeys = ref<string[]>([]);
  const appInfoStore = useAppInfoStore();
  const isInMedpro = computed(() => appInfoStore.appInfo.suiteKey === 'MEDPRO');

  onBeforeMount(() => {
    Promise.all([
      getCategoryGetListRdoOrNdo({ type: 'RDO,NDO,BASE,TREE,DYNAMIC_FORM' }),
      getDataSourcePageList({ pageNo: 1, pageSize: 999, enabled: 1 }),
      getFlowListOnline(
        undefined,
        isInMedpro.value
          ? {
              transferToConfig: { headers: { 'App-Tag': '__platform__', Env: 'undefined' } },
            }
          : undefined,
      ),
      getOnlineFormDataInitProtocolList(),
    ])
      .then(([categoryRes, dataSourceRes, ipaasRes, builtinRes]) => {
        modelList.value = categoryRes?.filter((e) => e.children?.length) || [];
        dbList.value = dataSourceRes?.data ?? [];
        ipaasList.value = ipaasRes ?? [];
        builtinList.value = builtinRes ?? [];
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  });

  const formState = computed({
    get() {
      return paper.value;
    },
    set(v) {
      Object.assign(paper.value, v);
    },
  });

  function addParamItem() {
    if (!formState.value.parameterMapping) {
      formState.value.parameterMapping = [];
    }
    formState.value.parameterMapping.push({
      id: buildUUID(),
      formKey: '',
      paramMapType: ParamModelTypeEnum.CompParam,
      modelKey: undefined,
      subModel: undefined,
      subFieldKey: undefined,
      toFields: [],
    });
  }

  function removeParamItem(id: string) {
    const findIndex = formState.value.parameterMapping?.findIndex((item) => item.id === id);
    if (findIndex !== -1) {
      formState.value.parameterMapping?.splice(findIndex!, 1);
    }
  }

  function onDeleteDsItem(id: string) {
    const findIndex = formState.value.customDataSource?.findIndex((item) => item.id === id);
    if (findIndex !== -1) {
      formState.value.customDataSource?.splice(findIndex!, 1);
    }
  }

  function onClearField(dsItem) {
    dsItem.onExpressions = [];
    dsItem.onFieldMap = [
      {
        id: buildUUID(),
        modelKey: undefined,
        subModel: undefined,
        subFieldKey: undefined,
        fields: [],
        isCheckTable: false,
      },
    ];
  }

  function onClearItem(dsItem) {
    dsItem.joinSqlJson = undefined;
    dsItem.joinIpaasConfig = {
      reqMethod: undefined,
      reqPath: undefined,
      metaHeader: undefined,
      metaBody: undefined,
      metaQuery: undefined,
      metaUri: undefined,
      outputBodyParameters: undefined,
    };
    dsItem.joinBuiltinConfig = undefined;
    onClearField(dsItem);
  }

  function onClearItemAll(dsItem) {
    dsItem.joinFormRefId = undefined;
    dsItem.joinModelKey = undefined;
    dsItem.joinSubModel = undefined;
    onClearItem(dsItem);
  }

  function addDataSourceItem() {
    if (!formState.value.customDataSource) {
      formState.value.customDataSource = [];
    }

    formState.value.customDataSource.push({
      id: buildUUID(),
      joinModelType: JoinModelTypeEum.EntityModel,
      joinFormRefId: undefined,
      joinModelKey: undefined,
      joinSubModel: undefined,
      joinSqlJson: undefined,
      joinIpaasConfig: {
        reqMethod: undefined,
        reqPath: undefined,
        metaHeader: undefined,
        metaBody: undefined,
        metaQuery: undefined,
        metaUri: undefined,
        outputBodyParameters: undefined,
      },
      joinBuiltinConfig: undefined,
      onExpressions: [],
      onFieldMap: [
        {
          id: buildUUID(),
          modelKey: undefined,
          subModel: undefined,
          subFieldKey: undefined,
          fields: [],
          isCheckTable: false,
        },
      ],
    });
  }
</script>

<style scoped lang="less">
  .panel-data-init-config-wrapper {
    height: 100%;
    background-color: #fff;

    .ant-collapse {
      background-color: #fff;
    }

    .param-area {
      position: relative;
      margin-top: 16px;

      .param-item {
        position: relative;
        margin-bottom: 8px;
        padding: 8px;
        border: 1px dashed #f0f0f0;
        border-radius: 4px;
        background: #fcfcfc;

        &:last-of-type {
          margin-bottom: 16px;
        }
      }
    }

    .data-source-area {
      position: relative;
      margin-top: 16px;

      :deep(.data-source-item) {
        &.is-last {
          .data-source-field-map-wrapper.is-last {
            .line {
              display: none;
            }
          }

          .data-source-title.is-child.is-last {
            .line {
              &::after {
                display: none;
              }
            }
          }
        }
      }
    }
  }
</style>
