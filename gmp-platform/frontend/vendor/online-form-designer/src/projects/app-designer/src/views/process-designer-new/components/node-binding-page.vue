<template>
  <form-item
    v-if="
      formState.type === 'global' || (formState.type !== 'global' && globalData.data.webPageOption)
    "
    label="WEB"
    :colon="false"
    is-first
    class="mb2px"
  >
    <div
      v-show="formState.type === 'global'"
      class="w100% ks-row-middle"
      style="justify-content: end"
    >
      <a-switch
        v-model:checked="globalData.data.webPageOption"
        size="small"
        :disabled="paasBpmnReadonly || !globalData.data.mobilePageOption"
      />
    </div>
  </form-item>
  <div v-if="globalData.data.webPageOption" class="bg-[#F2F4F7] rounded-4px p8px">
    <form-item
      is-first
      :label="t('sys.process.approvalPage')"
      :inline="false"
      :rules="[
        {
          required: formState.type === 'global',
          message: t('sys.chooseTextTip', { name: t('sys.process.approvalPage') }),
        },
      ]"
    >
      <div class="ks-row-middle">
        <a-select
          :value="formState.webPageKey || globalData.data.webPageKey"
          @update:value="(val) => updateForm('webPageKey', val)"
          :placeholder="t('sys.chooseText')"
          :options="webOptions.filter((e) => e.children && e.children.length)"
          :fieldNames="{
            label: 'name',
            value: 'id',
            options: 'children',
          }"
          :disabled="paasBpmnReadonly"
          :get-popup-container="
            (trigger) => trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
          "
          dropdown-class-name="gct-project-select-dropdown"
          show-search
          allow-clear
          optionFilterProp="name"
          size="small"
        />
        <template v-if="!isFrontPage">
          <a-tooltip placement="top">
            <template #title>{{ t('sys.menu.pageDesign') }}</template>
            <i
              v-if="formState.webPageKey"
              class="iconfont icon-sheji1 primary-gct cursor-pointer ml8px"
              @click="openDesign(PageTypeEnum.WEB, formState.webPageKey)"
            ></i>
          </a-tooltip>
          <a-tooltip placement="topRight" :arrowPointAtCenter="true">
            <template #title>{{ t('sys.appDesigner.newMobilePage') }}</template>
            <i
              class="iconfont icon-chuangjian primary-gct cursor-pointer ml8px"
              :class="[paasBpmnReadonly && 'disabled']"
              @click="!paasBpmnReadonly && addPage('webPageKey')"
            ></i>
          </a-tooltip>
        </template>
      </div>
    </form-item>
    <form-item
      is-first
      :label="t('sys.process.viewPage')"
      :inline="false"
      :rules="[
        {
          required: formState.type === 'global',
          message: t('sys.chooseTextTip', { name: t('sys.process.viewPage') }),
        },
      ]"
    >
      <div class="ks-row-middle">
        <a-select
          :value="formState.webViewPageKey || globalData.data.webViewPageKey"
          @update:value="(val) => updateForm('webViewPageKey', val)"
          :placeholder="t('sys.chooseText')"
          :options="webOptions.filter((e) => e.children && e.children.length)"
          :fieldNames="{
            label: 'name',
            value: 'id',
            options: 'children',
          }"
          :disabled="paasBpmnReadonly"
          :get-popup-container="
            (trigger) => trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
          "
          dropdown-class-name="gct-project-select-dropdown"
          show-search
          allow-clear
          optionFilterProp="name"
          size="small"
        />
        <template v-if="!isFrontPage">
          <a-tooltip placement="top">
            <template #title>{{ t('sys.menu.pageDesign') }}</template>
            <i
              v-if="formState.webViewPageKey"
              class="iconfont icon-sheji1 primary-gct cursor-pointer ml8px"
              @click="openDesign(PageTypeEnum.WEB, formState.webViewPageKey)"
            ></i>
          </a-tooltip>
          <a-tooltip placement="topRight" :arrowPointAtCenter="true">
            <template #title>{{ t('sys.appDesigner.newMobilePage') }}</template>
            <i
              class="iconfont icon-chuangjian primary-gct cursor-pointer ml8px"
              :class="[paasBpmnReadonly && 'disabled']"
              @click="!paasBpmnReadonly && addPage('webViewPageKey')"
            ></i>
          </a-tooltip>
        </template>
      </div>
    </form-item>
  </div>
  <form-item
    v-show="
      formState.type === 'global' ||
      (formState.type !== 'global' && globalData.data.mobilePageOption)
    "
    :is-first="!globalData.data.webPageOption"
    :colon="false"
    label="MOBILE"
    class="mb2px"
  >
    <div
      v-if="formState.type === 'global'"
      class="w100% ks-row-middle"
      style="justify-content: end"
    >
      <a-switch
        v-model:checked="globalData.data.mobilePageOption"
        size="small"
        :disabled="paasBpmnReadonly || !globalData.data.webPageOption"
      />
    </div>
  </form-item>
  <div v-if="globalData.data.mobilePageOption" class="bg-[#F2F4F7] rounded-4px p8px">
    <form-item
      :label="t('sys.process.approvalPage')"
      is-first
      :inline="false"
      :rules="[
        {
          required: formState.type === 'global',
          message: t('sys.chooseTextTip', { name: t('sys.process.approvalPage') }),
        },
      ]"
    >
      <div class="ks-row-middle">
        <a-select
          :value="formState.mobilePageKey || globalData.data.mobilePageKey"
          @update:value="(val) => updateForm('mobilePageKey', val)"
          :placeholder="t('sys.chooseText')"
          :options="mobileOptions.filter((e) => e.children && e.children.length)"
          :fieldNames="{
            label: 'name',
            value: 'id',
            options: 'children',
          }"
          :get-popup-container="
            (trigger) => trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
          "
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown"
          show-search
          allow-clear
          optionFilterProp="name"
          size="small"
        />
        <template v-if="!isFrontPage">
          <a-tooltip placement="top">
            <template #title>{{ t('sys.menu.pageDesign') }}</template>
            <i
              v-if="formState.mobilePageKey"
              class="iconfont icon-sheji1 primary-gct cursor-pointer ml8px"
              @click="openDesign(PageTypeEnum.MOBILE, formState.mobilePageKey)"
            ></i>
          </a-tooltip>
          <a-tooltip placement="topRight" :arrowPointAtCenter="true">
            <template #title>{{ t('sys.appDesigner.newMobilePage') }}</template>
            <i
              class="iconfont icon-chuangjian primary-gct cursor-pointer ml8px"
              :class="[paasBpmnReadonly && 'disabled']"
              @click="!paasBpmnReadonly && addPage('mobilePageKey')"
            ></i>
          </a-tooltip>
        </template>
      </div>
    </form-item>
    <form-item
      :label="t('sys.process.viewPage')"
      :inline="false"
      :rules="[
        {
          required: formState.type === 'global',
          message: t('sys.chooseTextTip', { name: t('sys.process.viewPage') }),
        },
      ]"
    >
      <div class="ks-row-middle">
        <a-select
          :value="formState.mobileViewPageKey || globalData.data.mobileViewPageKey"
          @update:value="(val) => updateForm('mobileViewPageKey', val)"
          :placeholder="t('sys.chooseText')"
          :options="mobileOptions.filter((e) => e.children && e.children.length)"
          :fieldNames="{
            label: 'name',
            value: 'id',
            options: 'children',
          }"
          :get-popup-container="
            (trigger) => trigger.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
          "
          :disabled="paasBpmnReadonly"
          dropdown-class-name="gct-project-select-dropdown"
          show-search
          allow-clear
          optionFilterProp="name"
          size="small"
        />
        <template v-if="!isFrontPage">
          <a-tooltip placement="top">
            <template #title>{{ t('sys.menu.pageDesign') }}</template>
            <i
              v-if="formState.mobileViewPageKey"
              class="iconfont icon-sheji1 primary-gct cursor-pointer ml8px"
              @click="openDesign(PageTypeEnum.MOBILE, formState.mobileViewPageKey)"
            ></i>
          </a-tooltip>
          <a-tooltip placement="topRight" :arrowPointAtCenter="true">
            <template #title>{{ t('sys.appDesigner.newMobilePage') }}</template>
            <i
              class="iconfont icon-chuangjian primary-gct cursor-pointer ml8px"
              :class="[paasBpmnReadonly && 'disabled']"
              @click="!paasBpmnReadonly && addPage('mobileViewPageKey')"
            ></i>
          </a-tooltip>
        </template>
      </div>
    </form-item>
  </div>

  <pageModal
    @register="registerNewPage"
    :webPageCategory="treeData"
    :tab="pageType"
    @refresh="onRefresh"
  />
</template>
<script setup lang="ts">
  import { computed, inject, onMounted, ref } from 'vue';
  import FormItem from './form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/paas-bpmn/types';
  import pageModal from '../../page-designer/modals/page-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { useUUid } from '@/hooks/web/useUUid';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { genUrl, openWindow } from '/@/utils';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useBranch } from '/@/hooks/develop/useBranch';
  import { useProcess } from '../hook/useProcess';
  import { PlatformEnum } from '/@/components/UserCmp/constant/interface';

  const props = defineProps<{
    data: IGctBpmnNodeDefinition;
  }>();

  const { globalData } = useProcess();
  const { t } = useI18n();
  const usePathQuery = usePathQueryStore();
  const { branchId } = useBranch();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const addFormKey = ref();
  const pageType = computed((): string => {
    return addFormKey.value === 'webPageKey' || addFormKey.value === 'webViewPageKey'
      ? PageTypeEnum.WEB
      : PageTypeEnum.MOBILE;
  });
  const treeData = ref<CategoryCompleteResponse[]>([]);
  const [registerNewPage, { openModal: openPageModal }] = useModal();
  const { getUuid } = useUUid(treeData, pageType);
  const webOptions = ref<CategoryCompleteResponse[]>([]);
  const mobileOptions = ref<CategoryCompleteResponse[]>([]);

  const isFrontPage = inject('isFrontPage');

  const formState = computed({
    get() {
      return props.data;
    },
    set(value) {
      Object.assign(props.data ?? {}, value);
    },
  });

  onMounted(() => {
    getWebPages();
    getMobilePages();
  });

  const addPage = async (formKey) => {
    addFormKey.value = formKey;
    if (pageType.value === PageTypeEnum.WEB) {
      await getWebPages();
    } else {
      await getMobilePages();
    }
    openPageModal(true, { uuid: getUuid() });
    treeData.value = pageType.value === PageTypeEnum.WEB ? webOptions.value : mobileOptions.value;
  };

  const getWebPages = async () => {
    webOptions.value = (await getCategoryListComplete({ module: PageTypeEnum.WEB })) || [];
  };

  const getMobilePages = async () => {
    mobileOptions.value = (await getCategoryListComplete({ module: PageTypeEnum.MOBILE })) || [];
  };

  const onRefresh = (data) => {
    formState.value[addFormKey.value] = data.key;
    if (pageType.value === PageTypeEnum.WEB) {
      getWebPages();
    } else {
      getMobilePages();
    }
  };

  const openDesign = (type, pid) => {
    openWindow(
      genUrl(
        `${location.origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}${
          type === PageTypeEnum.MOBILE ? '&platform=mobile' : ''
        }`,
        {
          aid: usePathQuery.getAid(),
          pid,
          bid: branchId.value,
        },
      ),
      {
        target: '_blank',
      },
    );
  };

  const updateForm = (key, value) => {
    formState.value = { ...formState.value, [key]: value };
  };
</script>
<style lang="less" scoped>
  .icon-chuangjian {
    &.disabled {
      color: #c3c3c3 !important;
      cursor: not-allowed;
    }
  }
</style>
