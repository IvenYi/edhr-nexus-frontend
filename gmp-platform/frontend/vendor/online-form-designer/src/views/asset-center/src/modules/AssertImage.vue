<template>
  <div class="assert-image">
    <slider
      @upload-success="handleUploadSuccess"
      @checked-change="handleCheckedChange"
      @keyword-change="handleKeywordChange"
      :userActions="userActions"
      :siderTitle="t('sys.developer.assetCenter.imgResource')"
    >
      <template #list>
        <div class="table-wrap empty" v-if="assetList && !assetList.length && !isSearch">
          <van-empty :image="emptyPng" description="还没有上传任何图片，您可以立即开始上传" />
          <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
            {{ t('sys.upload') + t('sys.appDesigner.appLogoImage') }}
          </a-button>
        </div>
        <div v-else v-if="(assetList && assetList.length) || isSearch" class="flex-col h100%">
          <div class="flex justify-between mb-20px">
            <a-input
              v-model:value="params.filename"
              placeholder="请输入关键字"
              style="width: 240px"
              @press-enter="loadAssets"
            />
            <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
              {{ t('sys.upload') + t('sys.appDesigner.appLogoImage') }}
            </a-button>
          </div>
          <a-row :gutter="[20, 20]" v-if="assetList.length">
            <a-col
              v-for="asset in assetList"
              :key="asset.id"
              :sm="{ span: 24 }"
              :md="{ span: 8 }"
              :xl="{ span: 6 }"
              :xxl="{ span: 4 }"
            >
              <image-card :item="asset" @delete="handleDeleteSuccess" :userActions="userActions" />
            </a-col>
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
  import ImageCard from '../components/ImageCard.vue';
  import { provide, ref, reactive, computed } from 'vue';
  import Slider from '../components/Slider.vue';
  import { ModuleEnum } from '../enum';
  import {
    getAssetsList,
    getAssetsListQueryInterface,
  } from '/@/apis/gct-platform/AssetsController';
  import type { AssetsResponse } from '/@/apis/gct-platform/model';
  import { BasicAction, CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CreateIcon from '../modal/create-icon.vue';
  import { useModal } from '/@/components/Modal';
  import emptyPng from '/@/assets/images/empty.png';
    import { Empty } from 'ant-design-vue';
  provide('module', ModuleEnum.IMAGE);
  const { t } = useI18n();
  const [register, { openModal }] = useModal();
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const assetList = ref<AssetsResponse[]>([]);
  const params: getAssetsListQueryInterface = reactive({
    categoryIds: undefined,
    filename: undefined,
    assetsModule: ModuleEnum.IMAGE,
  });
  const spinning = ref<boolean>(false);
  const { hasPermission } = usePermission();
const isSearch = ref(false);
  const userActions = computed(() => {
    return {
      CategoryManagement: hasPermission(
        `${CustomAction.DevelopImageManagement}.${CustomAction.CategoryManagement}`,
      ),
      Insert: hasPermission(`${CustomAction.DevelopImageManagement}.${BasicAction.Insert}`),
      Update: hasPermission(`${CustomAction.DevelopImageManagement}.${BasicAction.Update}`),
      Delete: hasPermission(`${CustomAction.DevelopImageManagement}.${BasicAction.Delete}`),
    };
  });
  const handleAdd = () => {
    openModal(true, {
      categoryId: params.categoryIds,
    });
  };
  loadAssets();
  async function loadAssets() {
    spinning.value = true;
    const res = await getAssetsList(params);
    assetList.value = res!;
    spinning.value = false;
     if (params.filename) {
      isSearch.value = true;
    } else {
      isSearch.value = false;
    }
  }

  const handleUploadSuccess = () => {
    loadAssets();
  };

  const handleCheckedChange = (categoryIds?: string) => {
    params.categoryIds = categoryIds;
    loadAssets();
  };

  const handleKeywordChange = (filename?: string) => {
    params.filename = filename;
    loadAssets();
  };

  const handleDeleteSuccess = () => {
    loadAssets();
  };
</script>

<style lang="less" scoped>
  .assert-image {
    height: 100%;
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
