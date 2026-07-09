<template>
  <div>
    <div class="version-wrapper">
      <div class="version-current cursor-pointer" @click.prevent="isExpand = !isExpand">
        <template v-if="publishedVersion">
          <span class="color-[#797A7D]">{{ t('sys.ipaas.currentVersionWithColon') }}</span>
          <span class="text-color font-500">
            {{ publishedVersion.version }}
            <span v-if="!isFrontPage" class="ml-5px"
              >({{ t('sys.bpmn.versionStatus.PUBLISHED') }})</span
            >
          </span>
        </template>
        <span class="color-[#797A7D]" v-else> {{ t('sys.bpmn.noPublishedVersion') }} </span>

        <div v-if="!isFrontPage" class="ml-[auto] flex">
          <a v-if="copyAvailable" @click.stop="createVersion">{{ t('sys.insert') }}</a>
          <div class="cursor-pointer color-[#666] ml-8px">
            <DownOutlined
              class="scale-y-80"
              :class="{
                'rotate-180': isExpand,
              }"
            />
          </div>
        </div>
      </div>
      <div
        v-if="!isFrontPage"
        class="version-list"
        :class="{
          'is-expand': isExpand,
        }"
      >
        <div>
          <div
            class="version-item"
            :class="{
              active: item.id === curVersionId,
            }"
            v-for="item in versionList"
            :key="item.id"
            @click="() => toggleVersion(item.id!)"
          >
            <span :title="item.id" class="version-item__name">{{ item.version }}</span>
            <span
              v-if="item.status !== BpmnVersionStatusEnum.HISTORY"
              class="ml-5px text-[#8F8F8F] text-12px version-item__status"
              >({{ t('sys.bpmn.versionStatus.' + item.status) }})</span
            >

            <span class="primary-color ml-5px text-12px" v-if="item.id === curVersionId">{{
              t('sys.ipaas.operating')
            }}</span>

            <i
              v-if="item.id === curVersionId"
              :title="t('sys.ipaas.operating')"
              class="iconfont icon-dingwei primary-color"
            ></i>

            <div class="flex items-center actions">
              <i
                :title="t('sys.copy')"
                class="iconfont icon-fuzhi1"
                @click.stop="() => copyVersion(item.id!)"
                v-if="copyAvailable"
              ></i>

              <a-popconfirm :title="t('sys.sureToDelete')" @confirm="() => deleteVersion(item.id!)">
                <i
                  :title="t('sys.delete')"
                  class="iconfont icon-shanchu2 ml-10px"
                  @click.stop
                  v-if="item.status === BpmnVersionStatusEnum.DRAFT"
                ></i>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useProcess } from '../hook/useProcess';
  import { BpmnVersionStatusEnum } from '../constants';

  const {
    versionList,
    curVersionId,
    copyVersion,
    toggleVersion,
    deleteVersion,
    createVersion,
    isFrontPage,
  } = useProcess();
  const { t } = useI18n();

  const isExpand = ref<boolean>(true);

  const publishedVersion = computed(() => {
    return versionList.value.find((item) => item.status === BpmnVersionStatusEnum.PUBLISHED);
  });

  const copyAvailable = computed(() => {
    return versionList.value.every((item) => item.status !== BpmnVersionStatusEnum.DRAFT);
  });
</script>

<style lang="less" scoped>
  .primary-color {
    color: var(--ant-primary-color);
  }
  .error-color {
    color: var(--ant-error-color);
  }

  .text-color {
    color: #212528;
  }

  .version {
    &-wrapper {
      width: 246px;
      box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      overflow: hidden;
    }

    &-current {
      height: 36px;
      background-color: #fafafa;
      display: flex;
      align-items: center;
      padding: 0 12px;
    }

    &-list {
      max-height: 60vh;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;
      transition: 0.3s ease;
      background-color: #fff;

      &.is-expand {
        grid-template-rows: 1fr;
      }

      & > div {
        overflow: hidden;
        &:hover {
          overflow: auto;
        }
      }
    }

    &-item {
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      cursor: pointer;
      position: relative;
      color: #474747;
      line-height: 1em;

      &:first-child {
        border-top: 1px solid #f0f0f0;
      }

      &:hover {
        color: #212528;
        background-color: hsl(from var(--ant-primary-color) h s 98%);

        .icon-dingwei {
          display: none;
        }
        .actions {
          display: flex;
        }
      }

      &.active &__name,
      &.active &__status {
        color: #212528;
        font-weight: 500;
      }

      .icon-dingwei {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        line-height: 1em;
      }

      .actions {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        display: none;

        .iconfont {
          cursor: pointer;
          line-height: 1em;

          &.icon-fuzhi1,
          &.icon-shanchu2 {
            color: #8f8f8f;
          }

          &.icon-fuzhi1:hover {
            color: var(--ant-primary-color);
          }
          &.icon-shanchu2:hover {
            color: var(--ant-error-color);
          }
        }
      }
    }
  }
</style>
