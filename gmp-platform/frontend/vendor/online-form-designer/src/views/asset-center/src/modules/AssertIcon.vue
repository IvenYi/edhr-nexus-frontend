<template>
  <div class="assert-icon">
    <slider
      @upload-success="handleUploadSuccess"
      @checked-change="handleCheckedChange"
      :userActions="userActions"
      :siderTitle="t('sys.developer.assetCenter.iconResource')"
    >
      <template #list>
        <div class="table-wrap empty" v-if="assetList && !assetList.length && !isSearch">
          <van-empty :image="emptyPng" description="还没有上传任何图标，您可以立即开始上传" />
          <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
            {{ t('sys.upload') + t('sys.appDesigner.icon') }}
          </a-button>
        </div>
        <div v-if="(assetList && assetList.length) || isSearch" class="flex-col h100%">
          <div class="flex justify-between mb-20px">
            <a-input
              v-model:value="params.filename"
              placeholder="请输入关键字"
              style="width: 240px"
              @press-enter="loadAssets"
            />
            <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
              {{ t('sys.upload') + t('sys.appDesigner.icon') }}
            </a-button>
          </div>
          <a-row :gutter="[40, 40]" v-if="assetList.length">
            <template v-for="asset in assetList" :key="asset.id">
              <a-col>
                <icon-item :item="asset" @delete="handleDeleteSuccess" :userActions="userActions" />
              </a-col>
            </template>
          </a-row>
          <div v-else style="height: calc(100% - 32px)" class="flex items-center justify-center">
            <a-empty :image="simpleImage" />
          </div>
        </div>
      </template>
    </slider>
    <create-icon @register="register" @ok="loadAssets" />
  </div>
</template>

<script setup lang="ts">
  import IconItem from '../components/IconItem.vue';
  import { provide, ref, reactive, computed } from 'vue';
  import Slider from '../components/Slider.vue';
  import { ModuleEnum } from '../enum';
  import {
    getAssetsList,
    getAssetsListQueryInterface,
  } from '/@/apis/gct-platform/AssetsController';
  import emptyPng from '/@/assets/images/empty.png';
  import type { AssetsResponse } from '/@/apis/gct-platform/model';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CreateIcon from '../modal/create-icon.vue';
  import { useModal } from '/@/components/Modal';
  import { Empty } from 'ant-design-vue';
  provide('module', ModuleEnum.ICON);
  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const isSearch = ref(false);
  const assetList = ref<AssetsResponse[]>([]);
  const params: getAssetsListQueryInterface = reactive({
    categoryIds: undefined,
    filename: undefined,
    assetsModule: ModuleEnum.ICON,
  });
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const spinning = ref<boolean>(false);
  const { hasPermission } = usePermission();
  const handleAdd = () => {
    openModal(true, {
      categoryId: params.categoryIds,
    });
  };
  const userActions = computed(() => {
    return {
      CategoryManagement: hasPermission(
        `${CustomAction.DevelopIconManagement}.${CustomAction.CategoryManagement}`,
      ),
      Insert: hasPermission(`${CustomAction.DevelopIconManagement}.${BasicAction.Insert}`),
      Update: hasPermission(`${CustomAction.DevelopIconManagement}.${BasicAction.Update}`),
      Delete: hasPermission(`${CustomAction.DevelopIconManagement}.${BasicAction.Delete}`),
    };
  });

  loadAssets();
  async function loadAssets() {
    spinning.value = true;
    const res = await getAssetsList(params);
    assetList.value = res!;
    if (params.filename) {
      isSearch.value = true;
    } else {
      isSearch.value = false;
    }
    spinning.value = false;
  }

  const handleUploadSuccess = () => {
    loadAssets();
  };

  const handleCheckedChange = (categoryIds?: string) => {
    params.categoryIds = categoryIds;
    loadAssets();
  };

  const handleDeleteSuccess = () => {
    loadAssets();
  };
</script>

<style lang="less">
  .assert-icon {
    height: 100%;
    width: 100%;
  }
  .table-wrap {
    width: calc(100% - 246px);
    padding: 16px;
    overflow: hidden;
    width: 100%;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
