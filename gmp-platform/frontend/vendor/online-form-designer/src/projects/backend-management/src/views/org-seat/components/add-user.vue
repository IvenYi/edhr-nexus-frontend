<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.component.userCmp.addUser')"
    centered
    width="640px"
    :minHeight="40"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-alert
      :message="
        t('sys.org.displayNoAuthorizeUser', {
          sth: appType === 'platform' ? t('sys.org.plat') : t('sys.org.kit'),
        })
      "
      type="info"
      show-icon
      banner
    />

    <a-input
      v-model:value="username"
      :placeholder="t('sys.org.seatPlaceholder')"
      class="mt-12px mb-12px"
      @pressEnter="getUserData"
    >
      <template #suffix>
        <SearchOutlined style="color: #212528; cursor: pointer" @click="getUserData" />
      </template>
    </a-input>

    <div class="user-list">
      <ScrollContainer>
        <div
          v-for="(item, index) in userSource"
          :key="index"
          class="mb-8px pl-8px pt-4px pb-4px w100%"
          :class="item.checked ? 'user-select' : ''"
        >
          <a-checkbox v-model:checked="item.checked" @change="checkChange(item)">
            <div class="item flex">
              <cropper-avatar
                v-model:value="item.avatar"
                :showBtn="false"
                width="30"
                class="is-readonly mr-8px ml-8px avatar"
              />
              <div class="flex item-info">
                <div>
                  <span class="mr-8px">{{ item.fullname }}</span>
                  <span>{{ item.username }}</span>
                </div>
                <span class="dept">{{ item.orgNames }}</span>
              </div>
            </div>
          </a-checkbox>
        </div>
      </ScrollContainer>
    </div>

    <div class="selct-user">
      <div class="mb-8px">{{ t('sys.org.selectUserTotal', { sth: selectUser.length }) }}</div>
      <a-tag
        v-for="(item, idx) in selectUser"
        :key="idx"
        class="mb-8px"
        :bordered="false"
        closable
        @close="close(item)"
        >{{ item.fullname }}</a-tag
      >
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { message } from 'ant-design-vue';
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getSeatListNotAuth, postSeatAuth } from '/@/apis/gct-platform/SeatController';
  import { CropperAvatar } from '/@/components/Cropper';
  import { ScrollContainer } from '/@/components/Container';

  const { t } = useI18n();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const emit = defineEmits(['reload']);

  /** 应用类型，是平台还是套件 */
  const appType = ref('platform');

  const userSource = ref<Array<any>>();

  const username = ref('');

  const tenantId = ref('');

  const selectUser = ref<Array<any>>([]);

  const onDeactivated = (data) => {
    appType.value = data.type;
    tenantId.value = data.tenantId;
    getUserData();
  };

  const getUserData = () => {
    getSeatListNotAuth({
      type: appType.value,
      tenantId: tenantId.value,
      username: username.value,
    }).then((res) => {
      userSource.value = res;
      userSource.value?.forEach((item) => {
        selectUser.value.forEach((p) => {
          if (item.id === p.id) {
            item.checked = true;
          }
        });
        if (item.tenantList) {
          item.orgNames = item.tenantList
            .map((i) => {
              return i.orgNames;
            })
            .join(',');
        }
      });
    });
  };

  const checkChange = (checkedValue) => {
    if (checkedValue.checked) {
      selectUser.value.push(checkedValue);
    } else {
      selectUser.value = selectUser.value.filter((i) => {
        return i.id !== checkedValue.id;
      });
    }
  };

  const close = (item) => {
    userSource.value?.forEach((p) => {
      if (p.id === item.id) {
        p.checked = false;
      }
    });
    selectUser.value.filter((i) => i.id !== item.id);
  };

  const handleClose = () => {
    selectUser.value = [];
    userSource.value = [];
    username.value = '';
    closeModal();
  };

  const handleOk = async () => {
    selectUser.value.forEach((i) => {
      if (appType.value === 'platform') {
        i.platSeat = true;
      } else {
        i.suiteSeat = true;
      }
    });
    postSeatAuth(selectUser.value).then(() => {
      selectUser.value = [];
      userSource.value = [];
      username.value = '';
      emit('reload');
      closeModal();
      message.success(t('sys.appDesigner.addSuccess'));
    });
  };
</script>

<style lang="less" scoped>
  .user-select {
    background: #e6eefe;
  }

  .user-list {
    height: 40vh;
    overflow: scroll;
    border: 1px solid #e8ebf0;
    padding: 8px 12px;
    border-radius: 4px;

    .avatar {
      display: flex;
      align-items: center;
    }

    .is-readonly {
      pointer-events: none;
    }

    .item-info {
      vertical-align: middle;
      flex-direction: column;

      .dept {
        font-size: 12px;
        color: #8f8f8f;
      }
    }
  }

  .selct-user {
    height: 13vh;
    margin: 16px 0;
    overflow: scroll;
  }
</style>
