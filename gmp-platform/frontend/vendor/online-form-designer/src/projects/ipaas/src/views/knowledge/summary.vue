<template>
  <basic-page>
    <div class="flex h-full">
      <div class="w-220px flex-none b-r p-16px overflow-auto">
        <div
          class="knowledge-category ell"
          :class="{
            active: n === 3,
          }"
          v-for="n in 10"
          :key="n"
          >Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias soluta quisquam saepe
          consectetur cum? Corporis eveniet consequatur atque enim officia eum numquam architecto!
          Nulla repellendus inventore asperiores modi eius necessitatibus?</div
        >
      </div>
      <div class="w-1px flex-1 p-16px flex flex-col">
        <div class="flex-none">
          <a-tabs v-model:activeKey="activeTab" type="card">
            <a-tab-pane key="1" tab="Tab 1" />
            <a-tab-pane key="2" tab="Tab 2" />
            <a-tab-pane key="3" tab="Tab 3" />
          </a-tabs>
        </div>

        <div class="h-1px flex-1 flex flex-col b-l b-r b-b">
          <div class="flex-none p-16px important-pl-40px">
            <a-radio-group>
              <a-radio value="1">A</a-radio>
              <a-radio value="2">B</a-radio>
              <a-radio value="3">C</a-radio>
              <a-radio value="4">D</a-radio>
            </a-radio-group>
          </div>

          <div class="flex-1 overflow-auto pl-16px pr-16px">
            <div
              class="knowledge-app b-all h-112px rounded-4px p-20px flex mb-16px"
              v-for="n in 20"
              :key="n"
              @click="handleGoDocs"
            >
              <div class="h-72px w-72px mr-20px flex-none">
                <img
                  v-if="n === 1"
                  class="w-full h-full"
                  src="./assets/api-call.png"
                  alt=""
                  srcset=""
                />
                <img
                  v-else-if="n === 2"
                  class="w-full h-full"
                  src="./assets/any-call.png"
                  alt=""
                  srcset=""
                />
                <img
                  v-else-if="n === 3"
                  class="w-full h-full"
                  src="./assets/sdk-call.png"
                  alt=""
                  srcset=""
                />
              </div>
              <div>
                <div class="flex items-center">
                  <span class="knowledge-app__title">erp / u8</span>
                  <CallTypeTag type="API" class="ml-8px" />
                  <CallTypeTag type="SDK" class="ml-8px" />
                </div>
                <div class="line-clamp-2 mt-8px"
                  >Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus ex magni, quo
                  odit rem qui animi, quia ducimus inventore sapiente, ipsam sint at voluptatem
                  culpa! Ullam commodi reiciendis ad laudantium?Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Temporibus ex magni, quo odit rem qui animi, quia
                  ducimus inventore sapiente, ipsam sint at voluptatem culpa! Ullam commodi
                  reiciendis ad laudantium?Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Temporibus ex magni, quo odit rem qui animi, quia ducimus inventore sapiente,
                  ipsam sint at voluptatem culpa! Ullam commodi reiciendis ad laudantium?Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Temporibus ex magni, quo odit rem qui
                  animi, quia ducimus inventore sapiente, ipsam sint at voluptatem culpa! Ullam
                  commodi reiciendis ad laudantium?Lorem ipsum dolor sit amet consectetur
                  adipisicing elit. Temporibus ex magni, quo odit rem qui animi, quia ducimus
                  inventore sapiente, ipsam sint at voluptatem culpa! Ullam commodi reiciendis ad
                  laudantium?</div
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import CallTypeTag from './components/call-type-tag.vue';

  const activeTab = ref('1');
  const go = useGo();

  const handleGoDocs = () => {
    go(`/integration/knowledge/summary/docs/asdasdad`);
  };
</script>

<style lang="less" scoped>
  .b-r {
    border-right: 1px solid #e0e3ea;
  }

  .b-l {
    border-left: 1px solid #e0e3ea;
  }

  .b-t {
    border-top: 1px solid #e0e3ea;
  }

  .b-b {
    border-bottom: 1px solid #e0e3ea;
  }

  .b-all {
    border: 1px solid #e0e3ea;
  }

  .ant-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }
  }

  .knowledge-category {
    height: 36px;
    line-height: 36px;
    color: #212528;
    font-size: 14px;
    padding: 0 20px;
    cursor: pointer;
    transition: all 0.3s;
    &.active {
      color: var(--ant-primary-color);
      background-color: rgba(from var(--ant-primary-color) r g b / 8%);
    }
    &:hover {
      background-color: rgba(from var(--ant-primary-color) r g b / 8%);
    }
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  .knowledge-app {
    transition: all 0.3s;

    &:hover {
      box-shadow: 0px 4px 8px 0px #e0e3ea;
    }

    &__title {
      font-weight: 500;
      font-size: 16px;
      color: #212528;
      line-height: 22px;
    }
  }
</style>
