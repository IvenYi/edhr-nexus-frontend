<template>
  <basic-page>
    <div class="h-full bg-[#fff] flex flex-col p-16px">
      <div class="flex-none color-text flex items-center">
        <span
          class="color-[#737A87] hover:color-[#212528] cursor-pointer transition-all-300"
          @click="router.back"
          ><left-outlined class="mr-6px" />{{ $t('sys.integration.backToPrevPage') }}</span
        >
        <div class="w-2px h-12px bg-[#797A7D] ml-16px mr-16px"></div>
        <span class="font-500">ERP - {{ $t('sys.ipaas.yonyou') }} - U8</span>
      </div>
      <div class="flex-none flex items-center mt-16px">
        <span class="color-text text-16px lh-28px mr-20px">{{ $t('sys.ipaas.yonyou') }} U8 {{ $t('sys.ipaas.productIntroduction') }}</span>
        <CallTypeTag type="API" class="mr-8px relative top-1px" />
        <CallTypeTag type="SDK" class="mr-8px relative top-1px" />
      </div>
      <div class="flex-none p-20px rounded-4px lh-22px bg-[#F7F8FA] mt-12px">
        <div class="color-text mb-10px"
          >Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae adipisci neque aliquid
          quaerat. Quos consequatur commodi quas inventore quidem magni? Saepe, tenetur. Modi quidem
          provident molestias necessitatibus vero repellendus id. Lorem ipsum dolor sit amet
          consectetur adipisicing elit. Molestiae adipisci neque aliquid quaerat. Quos consequatur
          commodi quas inventore quidem magni? Saepe, tenetur. Modi quidem provident molestias
          necessitatibus vero repellendus id. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Molestiae adipisci neque aliquid quaerat. Quos consequatur commodi quas inventore
          quidem magni? Saepe, tenetur. Modi quidem provident molestias necessitatibus vero
          repellendus id.
        </div>
        <div>
          <span class="color-[#797A7D]">{{ $t('sys.ipaas.productWebsite') }}：</span>
          <a href="http://www.yonyou.com/">http://www.yonyou.com/</a>
        </div>
      </div>

      <a-tabs class="flex-1 important-mt-16px" v-model:activeKey="activeTab" type="card">
        <a-tab-pane :key="CallTypeEnum.API" :tab="CallTypeEnum.API">
          <ApiDocTable />
        </a-tab-pane>
        <a-tab-pane :key="CallTypeEnum.SDK" :tab="CallTypeEnum.SDK" />
      </a-tabs>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import CallTypeTag from './components/call-type-tag.vue';
  import ApiDocTable from './components/api-doc-table.vue';
  import { useRouter } from 'vue-router';

  enum CallTypeEnum {
    API = 'API',
    SDK = 'SDK',
  }

  const router = useRouter();
  const activeTab = ref<CallTypeEnum>(CallTypeEnum.API);
</script>

<style lang="less" scoped>
  .color-text {
    color: #212528;
  }

  .ant-tabs {
    :deep(.ant-tabs-nav) {
      margin: 0;
    }

    :deep(.ant-tabs-content) {
      height: 100%;
      padding: 16px;
      border-right: 1px solid #eaedf1;
      border-bottom: 1px solid #eaedf1;
      border-left: 1px solid #eaedf1;
      border-bottom-right-radius: 4px;
      border-bottom-left-radius: 4px;
    }
  }
</style>
