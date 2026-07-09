<template>
  <div>
    <div class="version-wrapper">
      <div class="version-current cursor-pointer" @click.prevent="isExpand = !isExpand">
        <template v-if="onlineVersion">
          <span class="color-[#797A7D]">{{ t('sys.ipaas.currentVersionWithColon') }}</span>
          <span class="text-color font-500">{{ onlineVersion.version }} </span>
        </template>
        <span class="color-[#797A7D]" v-else> {{ t('sys.ipaas.noOnlineVersion') }} </span>

        <div class="ml-[auto] cursor-pointer color-[#666]">
          <DownOutlined class="scale-y-80" :class="[isExpand && 'rotate-180']" />
        </div>
      </div>
      <div
        class="version-list"
        :class="{
          'is-expand': isExpand,
        }"
      >
        <div>
          <div
            class="version-item"
            :class="{
              active: item.version === flowVersionInfo?.version,
            }"
            v-for="item in flowVersions"
            :key="item.version"
            @click="() => toggleVersion(item.version)"
          >
            <span>{{ item.version }}</span>
            <span
              class="ml-5px text-[#8F8F8F] text-12px"
              v-if="item.statusStr === ConnectionFlowStatus.Online"
              >({{ t('sys.ipaas.online') }})</span
            >
            <span
              class="primary-color ml-5px text-12px"
              v-if="item.version === flowVersionInfo?.version"
              >{{ t('sys.ipaas.operating') }}</span
            >

            <i
              v-if="item.version === flowVersionInfo?.version"
              :title="t('sys.ipaas.operating')"
              class="iconfont icon-dingwei primary-color"
            ></i>

            <div class="flex items-center actions">
              <i
                :title="t('sys.copy')"
                class="iconfont icon-fuzhi1"
                @click.stop="() => createFlowVersion(item.version)"
              ></i>

              <a-popconfirm
                :title="t('sys.ipaas.sureToSetOnline')"
                @confirm="() => setOnline(item.version)"
              >
                <i
                  :title="t('sys.ipaas.setOnline')"
                  class="iconfont icon-shangxian ml-10px"
                  v-if="setOnlineAvailable &&
                    [ConnectionFlowStatus.Publish, ConnectionFlowStatus.Offline].includes(item.statusStr as ConnectionFlowStatus)
                    "
                  @click.stop
                ></i>
              </a-popconfirm>

              <a-popconfirm
                :title="t('sys.ipaas.sureToSetOffline')"
                @confirm="() => setOffline(item.version)"
              >
                <i
                  :title="t('sys.ipaas.setOffline')"
                  class="iconfont icon-xiaxian ml-10px"
                  v-if="item?.statusStr === ConnectionFlowStatus.Online"
                  @click.stop
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
  import { useFlow } from '/@ipaas/hooks/useFlow';
  import { ConnectionFlowStatus } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useI18n } from '/@/hooks/web/useI18n';

  const {
    flowVersions,
    flowVersionInfo,
    toggleVersion,
    createFlowVersion,
    setOnlineAvailable,
    setOffline,
    setOnline,
  } = useFlow();
  const { t } = useI18n();

  const isExpand = ref<boolean>(true);

  const onlineVersion = computed(() => {
    return flowVersions.value.find((item) => item.statusStr === ConnectionFlowStatus.Online);
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
      width: 220px;
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

      &.active {
        color: #212528;
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
          &.icon-shangxian,
          &.icon-xiaxian {
            color: #8f8f8f;
          }

          &.icon-fuzhi1:hover,
          &.icon-shangxian:hover {
            color: var(--ant-primary-color);
          }
          &.icon-xiaxian:hover {
            color: var(--ant-error-color);
          }
        }
      }
    }
  }
</style>
