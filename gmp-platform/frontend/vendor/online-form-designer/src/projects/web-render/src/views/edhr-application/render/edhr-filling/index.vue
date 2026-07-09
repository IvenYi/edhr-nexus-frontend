<template>
  <basic-page-render>
    <div class="ks-row h100%">
      <div class="edhr-filling-wrapper ks-col">
        <edhr-filling-header
          v-model:value="materialNo"
          v-model:loading="loading"
          @after-search="afterSearch"
        />
        <div class="h100% flex overflow-hidden">
          <div class="edhr-filling-empty-area flex-1">
            <a-empty
              description=""
              :image="edhrFillingEmpty"
              :image-style="{
                height: '40vh',
              }"
            />
          </div>
        </div>
      </div>
      <div class="edhr-filling-left bg-[#F0F2F5]">
        <EdhrFillingLeft ref="edhrListRef" @go-detail="afterSearch" />
      </div>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import EdhrFillingHeader from './edhr-filling-header.vue';
  import edhrFillingEmpty from '/@web-render/assets/image/edhr-filling-empty.png';
  import FillingModal from './filling-modal/index.vue';
  import EdhrFillingLeft from './edhr-filling-left.vue';

  const materialNo = ref();
  const loading = ref(false);
  const edhrListRef = ref();

  const afterSearch = async (materialNo) => {
    await gct.openUtil.fullScreen(FillingModal, {
      materialNo,
      loading: loading.value,
      formInstBtnPerKey: 'edhr-filling.ADD_FORM',
    });
    edhrListRef.value.getData();
  };
</script>

<style scoped lang="less">
  .edhr-filling-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
  }

  .edhr-filling-empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    height: 100%;
  }

  :deep(.edhr-filling-header-wrapper) {
    border-bottom: 1px solid #e8ebf0;
  }

  .edhr-filling-left {
    // border: 1px solid #e8ebf0;
  }
</style>
