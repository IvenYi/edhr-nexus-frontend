<template>
  <SectionCard
    :class="['usual-use']"
    title="我的常用"
    :empty="isEmpty"
    :loading="handler.loading"
    @refresh="onRefresh"
  >
    <template #after-title>
      <gct-icon
        class="ml-16px"
        :size="16"
        value="icon-preset:edhr-huakuai"
        @click="handleEditMenu"
      />
    </template>
    <template #right>
      <van-popover v-model:show="showMore" :show-arrow="false" placement="bottom-end">
        <div class="popover-box">
          <ItemCard
            class="usual-use__item"
            v-for="item in menus"
            :key="item.id"
            :title="item.title"
            :icon="item.icon"
            :bgColor="item.color"
            @click="handleClick(item)"
          />
        </div>
        <template #reference>
          <div v-if="menus.length > 5" class="more-info ks-row-middle">
            <div class="mr6px">{{ showMore ? '收起更多' : '展开更多' }}</div>
            <div class="icon-box ks-row-center-middle">
              <gct-icon
                :size="10"
                :value="showMore ? 'icon-arrow_up_pad' : 'icon-arrow_down_pad'"
              />
            </div>
          </div>
        </template>
      </van-popover>
    </template>
    <div class="usual-use__list">
      <ItemCard
        class="usual-use__item"
        v-for="item in menus"
        :key="item.id"
        :title="item.title"
        :icon="item.icon"
        :bgColor="item.color"
        @click="handleClick(item)"
      />
    </div>
  </SectionCard>
</template>

<script lang="ts" setup name="usual-use">
  import { i18n } from '@mobile/locales/setupI18n';
  import SectionCard from '../layout/section-card.vue';
  import ItemCard from './item-card.vue';
  import { UsualUseHandler } from './usual-use-handler';
  import { computed, reactive } from 'vue';

  const { t } = i18n.global;

  const handler = reactive<UsualUseHandler>(new UsualUseHandler());
  const showMore = ref(false);

  onMounted(() => {
    handler.loadMenus();
  });

  const isEmpty = computed(() => !handler.menus.length);
  const menus = computed(() => handler.menus);

  const handleEditMenu = () => {
    handler.editMenu();
  };

  const handleClick = (item: any) => {
    handler.go(item);
  };

  const onRefresh = async () => {
    await handler.loadMenus();
  };
</script>

<style lang="less" scoped>
  .usual-use {
    &__list {
      padding: 30px 24px;
      overflow: hidden;
      background: #ffffff;
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: start;
      row-gap: 30px;
      column-gap: 55px;
      border-radius: 12px 12px 12px 12px;
    }

    &__item {
      cursor: pointer;
      // flex: 1;
      // min-width: 103px;
      // height: 144px;

      :deep(.item-card__title) {
        line-height: 18px;
      }
    }

    :deep(.van-empty) {
      background-color: #fff;
    }
  }

  .more-info {
    font-size: 15px;
    color: #5a5f6b;

    .icon-box {
      width: 20px;
      height: 20px;
      background-color: #dcdfe4;
      border-radius: 50%;
    }
  }

  .popover-box {
    max-width: 556px;
    width: 50vw;
    max-height: 500px;
    padding: 30px 24px;
    box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.15);
    row-gap: 30px;
    column-gap: 55px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    overflow: auto;
  }
</style>
