<template>
  <a-modal
    v-model:visible="open"
    title="我的大屏 - 分享"
    :width="640"
    :footer="null"
    :afterClose="() => (open = false)"
  >
    <div class="share-modal-container">
      <a-button type="dashed" @click="handleOpen()">
        <template #icon>
          <PlusOutlined />
        </template>
        创建分享链接
      </a-button>

      <div class="share-list">
        <a-empty v-if="!shareList.length" description="暂无分享" style="margin-top: 150px" />
        <div class="share-item" v-for="item in shareList" :key="item.shareId">
          <div class="share-item-top">
            <div class="share-item-top-name">
              <LockOutlined v-if="item.encrypted" />
              {{ item.name }}
            </div>
            <div class="share-item-top-info">
              <div
                :class="[
                  'share-item-top-info-time',
                  { 'share-item-top-info-time-expired': getDaysDiff(item.expireDate) === '已过期' },
                ]"
              >
                {{ getDaysDiff(item.expireDate) }}
              </div>
              <div class="share-item-top-info-btn">
                <a-button type="text" size="small" @click="handleOpen(item)">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
                <a-button type="text" size="small" @click="handleDelete(item.id)">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
            </div>
          </div>
          <div class="share-item-main">
            <div class="share-item-main-url">
              {{ formatUrl(item.url ?? '') }}
            </div>
            <a-button type="primary" class="share-item-main-btn" @click="handleCopy(item)">
              分享链接
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
  <a-modal
    v-model:visible="detailOpen"
    :title="detailModalTitle"
    :width="640"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      :model="formState"
      ref="formRef"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 14 }"
      autocomplete="off"
      :rules="rules"
    >
      <a-form-item label="分享链接" v-if="isEdit">
        <a-input v-model:value="shareUrl" disabled />
      </a-form-item>
      <a-form-item label="链接名称" name="name">
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <a-form-item label="加密分享" name="encrypted">
        <div class="encrypted-item">
          <a-checkbox
            v-model:checked="formState.encrypted"
            @change="handleEncryptedChange"
            :disabled="isEdit"
          />
          <template v-if="formState.encrypted">
            <div class="pr-8px pl-8px">设置密码</div>
            <a-input v-model:value="formState.password" style="width: 150px" :disabled="isEdit" />
          </template>
        </div>
      </a-form-item>

      <a-form-item label="有效期" name="expireType">
        <div class="mt-5px">
          <a-radio-group v-model:value="formState.expireType" name="radioGroup">
            <a-radio :value="0">永久</a-radio>
            <a-radio :value="1">截止日期</a-radio>
          </a-radio-group>
        </div>
        <a-date-picker
          v-if="formState.expireType === 1"
          v-model:value="formState.expireDate"
          :disabled-date="disabledDate"
          class="w-full"
          style="margin-top: 5px"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, createVNode } from 'vue';
  import dayjs from 'dayjs';
  import { useI18n } from 'vue-i18n';
  import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
  } from '@ant-design/icons-vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { Modal, message } from 'ant-design-vue';
  import { buildUUID } from '/@/utils/uuid';
  import {
    getBiShareList,
    postBiShare,
    putBiShareById,
    deleteBiShare,
  } from '/@/apis/gct-platform/BiShareController';
  import type { BiShareResponse } from '/@/apis/gct-platform/model';

  const { t } = useI18n();

  const open = ref(false);
  const screenId = ref('');
  const screenName = ref('');
  const formRef = ref();
  const formState = ref({
    shareId: '',
    name: '',
    encrypted: false,
    password: '',
    expireType: 0,
    expireDate: undefined,
    url: '',
  });
  const shareList = ref<BiShareResponse[]>([]);

  const show = async (screen) => {
    screenId.value = screen.id;
    screenName.value = screen.name;
    await loadData();
    open.value = true;
  };

  const loadData = async () => {
    await getBiShareList({ projectId: screenId.value }).then((res) => {
      shareList.value = res;
    });
  };

  const handleDelete = (ids) => {
    Modal.confirm({
      title: t('sys.sureToDelete'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await deleteBiShare({ ids });
        message.success('删除成功');
        loadData();
      },
      onCancel() {},
    });
  };
  const detailOpen = ref(false);
  const isEdit = ref(false);

  const rules: Record<string, Rule[]> = {
    name: [
      {
        required: true,
        message: '请输入链接名称',
        trigger: 'blur',
      },
    ],
    encrypted: [
      {
        validator: (_, value) => {
          if (value && (!formState.value.password || formState.value.password.length !== 4)) {
            return Promise.reject(new Error('请输入4位密码'));
          }
          return Promise.resolve();
        },
      },
    ],
  };

  const getDaysDiff = (date: any) => {
    if (!date) {
      return '永久链接';
    }
    const diff = dayjs(date).diff(dayjs(), 'day');
    if (diff < 0) {
      return '已过期';
    }
    return diff + '天后过期';
  };

  const formatUrl = (url: string) => {
    return `${window.location.origin}${url}`;
  };

  const shareUrl = computed(() => {
    return formatUrl(formState.value.url);
  });

  const handleOpen = (item?: BiShareResponse) => {
    isEdit.value = !!item;
    if (item) {
      formState.value = {
        ...item,
        expireDate: item.expireDate ? dayjs(item.expireDate) : undefined,
      };
    } else {
      formState.value = {
        shareId: '',
        name: '',
        encrypted: false,
        password: '',
        expireType: 0,
        expireDate: undefined,
        url: '',
      };
    }
    detailOpen.value = true;
  };

  const handleClose = () => {
    formRef.value.resetFields();
    detailOpen.value = false;
  };

  const detailModalTitle = computed(() => {
    return isEdit.value ? '编辑分享链接' : '新增分享链接';
  });

  const generateRandomString = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleEncryptedChange = () => {
    if (formState.value.encrypted) {
      if (!formState.value.password) {
        formState.value.password = generateRandomString();
      }
    } else {
      formRef.value.validateFields(['encrypted']);
      if (formState.value.password.length !== 4) {
        formState.value.password = '';
      }
    }
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().endOf('day');
  };

  const handleCopy = (item: BiShareResponse) => {
    const copyText = `分享链接：《${screenName.value}》\n链接：${window.location.origin + item.url}
${item.encrypted ? '密码：' + item.password + '\n' : ''}`;
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.writeText(copyText).then(
        () => message.success('复制成功'),
        () => message.error('复制失败'),
      );
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = copyText;
      document.body.appendChild(textarea);

      try {
        textarea.select();
        document.execCommand('copy');
        message.success('复制成功');
      } catch (err) {
        message.error('复制失败');
      }
      document.body.removeChild(textarea);
    }
  };

  const handleOk = async () => {
    try {
      await formRef.value.validate();
      const { name, encrypted, password, expireType, expireDate, shareId } = formState.value;
      const _shareId = shareId || buildUUID();
      const params = {
        shareId: _shareId,
        projectId: screenId.value,
        name,
        encrypted: encrypted ? 1 : 0,
        password,
        expireType,
        expireDate: expireType ? dayjs(expireDate).format('YYYY-MM-DD') : '',
        url: `/datav/share/screen/${screenId.value}/${_shareId}`,
      };
      console.log(params);
      if (isEdit.value) {
        await putBiShareById(
          {
            id: formState.value.id,
          },
          params,
        );
        message.success('编辑成功！');
      } else {
        await postBiShare(params);
        message.success('创建成功！');
      }
      await loadData();
      formRef.value.resetFields();
      detailOpen.value = false;
    } catch (e) {
      console.log(e);
      console.log('error');
    }
  };

  onMounted(() => {
    console.log('mounted');
  });

  onUnmounted(() => {
    console.log('unmounted');
  });

  defineExpose({
    show,
  });
</script>

<style lang="scss" scoped>
  .share-modal-container {
    height: 550px;
    .share-list {
      height: calc(100% - 80px);
      overflow-y: scroll;

      .share-item {
        padding: 12px;
        background: #f9fafb;
        border-radius: 4px;
        margin-top: 20px;
        &-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 400;
          font-size: 14px;
          color: #212528;

          &-info {
            display: flex;
            align-items: center;

            &-time {
              margin-right: 4px;
              color: #026ac8;

              &-expired {
                color: #8b8b8b;
              }
              &::before {
                content: '·';
                margin-right: 4px;
              }
            }

            &-btn {
              color: #666;
            }
          }
        }

        &-main {
          display: flex;
          margin-top: 8px;
          &-url {
            width: calc(100% - 100px);
            margin-right: 12px;
            background: #ffffff;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            padding: 6px 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
  .encrypted-item {
    display: flex;
    align-items: center;
  }
</style>
