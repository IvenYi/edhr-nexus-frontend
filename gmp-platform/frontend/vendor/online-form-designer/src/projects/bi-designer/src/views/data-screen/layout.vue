<template>
  <div :class="[ns.e('wrapper')]">
    <category-slider
      ref="categorySliderRef"
      :module="CategoryModuleEnum.DASHBOARD"
      :siderTitle="t('sys.categoryOfSth', { sth: t('sys.menu.dataScreen') })"
      @changeSelect="changeSelect"
    />
    <div :class="[ns.e('content')]">
      <div class="create-btn">
        <div class="search-container">
          <a-input
            class="important-w-260px"
            :placeholder="t('sys.developer.appCenter.searchPlaceholder')"
            allowClear
            v-model:value="keyword"
            @press-enter="handleSearch"
          >
            <template #suffix>
              <i class="search-icon iconfont icon-sousuo" style="color: #212528"></i>
            </template>
          </a-input>
        </div>
        <div class="right-area">
          <a-button type="primary" @click="showModal('create')">创建数据大屏</a-button>
          <switch-tab class="mr-8px" v-model:showType="clientType" @change="handleChangeType" />
        </div>
      </div>
      <div class="screen-container" :style="getStyle">
        <a-spin :spinning="loading" wrapperClassName="tab-loading" v-if="clientType === 'Card'">
          <card-container
            :module="CategoryModuleEnum.DASHBOARD"
            :dataList="pageData.list"
            @copy="handleCopy"
            @refresh="getAppTableData"
            @share="handleShare"
          />
          <a-empty
            v-if="pageData.list?.length == 0"
            :image="emptyPng"
            :image-style="{
              height: '120px',
            }"
          >
            <template #description>
              <span class="gct-bi-data-source-empty__description">
                还没有创建过数据大屏，您可以立即开始创建
              </span>
            </template>
          </a-empty>

          <div v-show="pageData.hasMorePage" :class="`request-loading`"> 加载中... </div>
        </a-spin>
        <list-container
          v-else-if="clientType === 'List'"
          :module="CategoryModuleEnum.DASHBOARD"
          :dataList="pageData.list"
          @copy="handleCopy"
          @share="handleShare"
          @refresh="getAppTableData"
        />
      </div>
      <a-modal v-model:visible="open" title="创建数据大屏" :afterClose="handleClose" @ok="handleOk">
        <a-form
          ref="formRef"
          :model="formState"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          :afterClose="handleClose"
        >
          <a-form-item label="看板名称" name="name" :rules="[{ required: true }]">
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item :label="t('所属分类')" name="categoryId" :rules="[{ required: true }]">
            <a-select v-model:value="formState.categoryId" :options="categoryList" />
          </a-form-item>

          <a-form-item :label="t('看板大小')" name="screenSize" :rules="[{ required: true }]">
            <a-select
              v-model:value="formState.screenSize"
              :options="screenSizeOptions"
              @change="handlePaperSizeChange"
            />
          </a-form-item>

          <a-row>
            <a-col :span="6" />
            <a-col :span="16">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item
                    :label="t('sys.appDesigner.printDesign.form.height')"
                    name="width"
                    :rules="[
                      {
                        required: true,
                        message: t('sys.pleaseInputSth', {
                          sth: t('sys.model.length'),
                        }),
                      },
                    ]"
                    :label-col="{ span: 6 }"
                    :wrapper-col="{ span: 18 }"
                    label-align="left"
                  >
                    <a-input-number
                      v-model:value="formState.width"
                      :disabled="formState.screenSize !== 'custom'"
                      :min="0"
                      :step="1"
                      :precision="0"
                      addon-after="mm"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    :label="t('sys.appDesigner.printDesign.form.width')"
                    name="height"
                    :rules="[
                      {
                        required: true,
                        message: t('sys.pleaseInputSth', {
                          sth: t('sys.width'),
                        }),
                      },
                    ]"
                    :label-col="{ span: 6 }"
                    :wrapper-col="{ span: 18 }"
                    label-align="left"
                  >
                    <a-input-number
                      :min="0"
                      v-model:value="formState.height"
                      :disabled="formState.screenSize !== 'custom'"
                      :step="1"
                      :precision="0"
                      addon-after="mm"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-col>
          </a-row>

          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea
              class="--resize-none"
              v-model:value="formState.description"
              :maxlength="120"
              show-count
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <share-modal ref="shareModalRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, reactive, watchPostEffect, computed } from 'vue';
  import emptyPng from '/@bi-designer/assets/empty.png';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { message, FormInstance, Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getPnProjectPageList,
    postPnProject,
    postPnProjectCopy,
  } from '/@/apis/gct-platform/PnProjectController';
  import type { PnProjectRequest } from '/@/apis/gct-platform/model/index';
  import SwitchTab from '../components/switch-tab.vue';
  import CardContainer from '../components/card-container.vue';
  import ListContainer from '../components/list-container.vue';
  import { CategoryModuleEnum } from '/@bi-designer/views/components/category/type';
  import shareModal from './share-modal.vue';
  import { useNamespace } from '@gct/runtime';
  import { CategorySlider } from '/@bi-designer/views/components/category-slider';
  import { getCategoryListDatasetCategory } from '/@/apis/gct-platform/CategoryController';

  const ns = useNamespace('data-screen-designer-layout');

  const shareModalRef = ref<InstanceType<typeof shareModal>>();

  const formState = reactive<PnProjectRequest>({
    name: '',
    categoryId: '',
    screenSize: '',
    width: 0,
    height: 0,
    description: '',
  });

  const open = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const usePathQuery = usePathQueryStore();
  const userStore = useUserStoreWithOut();
  const categorySliderRef = ref();

  const appId = usePathQuery.getAid() || '';

  const clientType = ref<'Card' | 'List'>('Card');

  const handleChangeType = () => {
    keyword.value = '';
    getAppTableData();
  };

  const { t } = useI18n();

  const keyword = ref('');

  const categoryList = ref();

  const screenSizeOptions = [
    {
      value: '16:9',
      label: '1920*1080（16:9）px',
    },
    {
      value: '16:10',
      label: '1920*1200（16:10）px',
    },
    {
      value: '4:3',
      label: '1920*1440（4:3）px',
    },
    {
      value: '2k',
      label: '2560×1440（2k）px',
    },
    {
      value: '4k',
      label: '3840x2160（4k）px',
    },
    {
      value: 'custom',
      label: '自定义',
    },
  ];

  const getStyle = computed(() => {
    return pageData.value.list?.length == 0
      ? {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }
      : {};
  });

  const handlePaperSizeChange = (val) => {
    if (!val) return;
    let width = formState.screenSize === 'custom' ? formState.width : 0;
    let height = formState.screenSize === 'custom' ? formState.height : 0;

    switch (val) {
      case '16:9':
        width = 1920;
        height = 1080;
        break;
      case '16:10':
        width = 1920;
        height = 1200;
        break;
      case '4:3':
        width = 1920;
        height = 1440;
        break;
      case '2k':
        width = 2048;
        height = 1080;
        break;
      case '4k':
        width = 3840;
        height = 2160;
        break;
    }

    formState.width = width;
    formState.height = height;
  };

  const handleOk = async () => {
    try {
      await formRef.value?.validate();
      const { width, height } = formState;
      const data = {
        ...formState,
        developCanvas: 'AbsoluteLayoutCanvas',
        appId: usePathQuery.getAid() ?? '',
        size: `${width}*${height}`,
        width,
        height,
        tenantId: userStore.getTenant,
      };
      await (isCopy.value ? postPnProjectCopy(data) : postPnProject(data));
      message.success('创建成功');
      if (formState.categoryId !== categoryId.value) {
        categorySliderRef.value?.setCategoryId(formState.categoryId);
      } else {
        getAppTableData();
      }
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleSearch = () => {
    getAppTableData();
  };

  const showModal = (type?) => {
    getCategoryListDatasetCategory({
      assetsModule: CategoryModuleEnum.DASHBOARD,
      appId,
    }).then((res) => {
      const list: any[] = [];

      res!.forEach((item) => {
        if (item.sysBuiltin == 1 && !categoryId.value) {
          formState.categoryId = item.id ?? '';
        }
        list.push({
          value: item.id,
          label: item.name,
        });
      });

      categoryList.value = list;
      open.value = true;
      if (type == 'create') {
        formState.name = '';
        formState.description = '';
        formState.categoryId = null;
      } else {
        formState.categoryId = categoryId.value;
      }
      // 默认选中16:9
      formState.screenSize = '16:9';
      handlePaperSizeChange('16:9');
    });
  };

  const pageData = ref<any>([]);

  const handleClose = () => {
    open.value = false;
    formRef.value?.resetFields();
  };

  const isCopy = ref(false);

  const handleCopy = (formData) => {
    Object.assign(formState, formData);
    formState.name = `${formData.name}_副本`;
    formState.screenSize = 'custom';
    isCopy.value = true;
    showModal();
  };

  const handleShare = (record: any) => {
    console.log(record);
    shareModalRef.value?.show(record);
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

  const loading = ref<boolean>(false);

  let observer;

  watchPostEffect(() => {
    observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        // 如果不可见，就返回
        if (!entry.isIntersecting && entries[0].intersectionRatio <= 0) return;
        // 加载数据
        console.log('到底了，要加载数据了哦', pageData.value.hasMorePage);
        pageData.value.hasMorePage && (await getAppTableData(true));
      });
    });
    const dom = document.querySelector(`.request-loading`);
    if (dom) {
      observer.observe(dom);
    }
  });

  onUnmounted(() => {
    observer.disconnect();
  });

  async function requestApi(isMore = false) {
    const result = await getPnProjectPageList({
      appId: usePathQuery.getAid() ?? '',
      name: keyword.value,
      categoryId: categoryId.value === '1' ? '' : categoryId.value,
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });

    if (result) {
      pagination.value.total = result?.totalCount || 0;
      if (isMore) {
        pageData.value.list = pageData.value.list.concat(result?.data ?? []);
      } else {
        pageData.value.list = result?.data ?? [];
      }
      pageData.value.hasMorePage = result?.totalPage > result?.pageNo || false;
      console.log(pageData.value);
    }
  }

  async function getAppTableData(isMore = false) {
    loading.value = true;
    if (isMore) {
      pagination.value.current = pagination.value.current + 1;
    } else {
      pagination.value.current = 1;
    }

    await requestApi(isMore);

    loading.value = false;
  }
  const categoryId = ref();
  const changeSelect = (id) => {
    pagination.value.current = 1;
    categoryId.value = id;
    getAppTableData();
  };

  onMounted(() => {
    getAppTableData();
  });
</script>
<style lang="scss" scoped>
  .create-btn {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .right-area {
      display: flex;
      flex-direction: row-reverse;
    }
  }
  .screen-container {
    padding: 20px;
    overflow: auto;
    height: calc(100% - 70px);
    .request-loading {
      padding-bottom: 10px;
      color: #333;
      line-height: 22px;
      text-align: center;
    }
  }

  .gct-data-screen-designer-layout {
    border: 1px solid #eaedf1;

    &__wrapper {
      height: 100%;
      display: flex;
      flex: 0 0 auto;
      border-left: 1px solid #eaeaea;
    }

    &__sider {
      border-width: 0 1px 0 0;
    }

    &__content {
      flex-grow: 1;
      padding: 16px;
      width: calc(100% - 222px);
      overflow: hidden;

      .bi-data-set-table-wrapper {
        :deep(.ant-pagination) {
          margin: 0;
          padding-top: 10px;
        }
      }
    }
  }
</style>
