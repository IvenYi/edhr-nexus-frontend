<template>
  <basic-modal
    v-bind="{ ...$attrs, 'z-index': 1001 }"
    @register="registerInner"
    :title="t('sys.pageDesigner.regConfig')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="regForm"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.pageDesigner.regex')" name="reg" style="position: relative">
        <a-input v-model:value="formState.reg" :maxlength="128" show-count />
        <a-popover
          :visible="visible"
          :title="t('sys.pageDesigner.commonReg')"
          trigger="click"
          placement="right"
        >
          <template #content>
            <div style="width: 300px">
              <a-button type="primary" @click="addReg" block style="width: 90%; margin: 0 15px">
                <template #icon>
                  <plus-outlined />
                </template>
                {{ t('sys.add') + t('sys.pageDesigner.commonReg') }}</a-button
              >
              <close-outlined
                style="position: absolute; top: 8px; right: 15px"
                @click="visible = false"
              />
              <a-list item-layout="horizontal" :data-source="commonRegList">
                <template #renderItem="{ item }">
                  <a-list-item class="list">
                    <template #actions>
                      <div v-if="!item.sysBuiltin">
                        <a-button type="link" @click="editReg(item)">
                          <template #icon>
                            <a-tooltip>
                              <template #title>{{ t('sys.edit') }}</template>
                              <edit-outlined />
                            </a-tooltip>
                          </template>
                        </a-button>
                        <a-popconfirm
                          :title="t('sys.sureToDelete')"
                          :ok-text="t('sys.ok')"
                          :cancel-text="t('sys.cancel')"
                          @confirm="delReg(item)"
                        >
                          <a-button type="link" danger>
                            <template #icon>
                              <a-tooltip>
                                <template #title>{{ t('sys.delete') }}</template>
                                <delete-outlined />
                              </a-tooltip>
                            </template>
                          </a-button>
                        </a-popconfirm>
                      </div>
                    </template>
                    <a-list-item-meta :description="item.value">
                      <template #title>
                        <a-button type="link" @click="chooseReg(item)">{{ item.name }}</a-button>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </div>
          </template>
          <a-button type="link" style="position: absolute">
            <template #icon>
              <database-outlined @click="visible = true" />
            </template>
          </a-button>
        </a-popover>
      </a-form-item>
      <a-form-item
        :label="t('sys.pageDesigner.regHint')"
        name="regHint"
        :rules="[{ required: !!formState.reg }]"
      >
        <a-textarea
          v-model:value="formState.regHint"
          :maxlength="64"
          show-count
          class="i18n-textarea"
        />
        <i18n-select-btn
          :buttonExtraProps="{ type: 'link', class: 'custom-i18n-btn reg-i18n' }"
          :i18nValue="i18nValue"
          @on-select-i18n="handleSelectI18n"
        />
      </a-form-item>
      <a-form-item name="i18nConfig" hidden>
        <span>{{ formState.i18nConfig }}</span>
      </a-form-item>
    </a-form>
    <add-edit-common-reg-modal @register="register" @ok="handleCommonRegOk" zIndex="2000" />
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DatabaseOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import AddEditCommonRegModal from './add-edit-common-reg-modal.vue';
  import { RegexpResponse } from '/@/apis/gct-apaas/model';
  import { I18nSelectBtn } from '/@/components/I18nSelect';
  import { isEmpty, omit } from 'lodash-es';
  import {
    deleteRegexp,
    getRegexpList,
    postRegexp,
    putRegexpById,
  } from '/@/apis/gct-apaas/RegexpController';

  const { t } = useI18n();
  const regForm = ref();
  const emit = defineEmits(['ok', 'register']);
  const formState = ref<FormState>({
    reg: '',
    regHint: '',
    i18nConfig: {},
  });

  const i18nValue = computed(() => {
    return formState.value?.i18nConfig?.['regHint'] ?? '';
  });

  //弹框显示隐藏改变
  const handleShow = async (visible: boolean) => {
    if (visible) {
      getCommonRegList();
    }
  };
  const [register, { openModal: openCommonReg, closeModal: closeCommonModal }] = useModal();
  const [registerInner, { closeModal }] = useModalInner((data: FormState) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data: FormState) => {
    formState.value = data;
  };
  const handleClose = () => {
    regForm.value?.resetFields();
    visible.value = false;
    closeModal();
  };
  const handleOk = async () => {
    try {
      await regForm.value!.validate();
      emit('ok', { ...formState.value });
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };
  const chooseReg = (reg) => {
    formState.value.reg = reg.value;
  };
  /////常用正则popover////
  const visible = ref<boolean>(false);
  const commonRegList = ref<RegexpResponse[]>([]);
  const editCommonReg = ref(false);
  const addReg = () => {
    editCommonReg.value = false;
    openCommonReg(true, { commonRegList: commonRegList.value, isEdit: editCommonReg.value });
  };
  const editReg = (item) => {
    editCommonReg.value = true;
    openCommonReg(true, {
      ...item,
      commonRegList: commonRegList.value,
      isEdit: editCommonReg.value,
    });
  };
  const delReg = async (item) => {
    await deleteRegexp({ ids: item.id });
    getCommonRegList();
  };
  const handleCommonRegOk = async (data) => {
    if (editCommonReg.value) {
      await putRegexpById({ id: data.id }, { name: data.name, value: data.value });
    } else {
      await postRegexp({
        name: data.name,
        value: data.value,
      });
    }
    getCommonRegList();
    closeCommonModal();
  };

  const handleSelectI18n = (params: { i18nKey: string; i18nTitle: string }) => {
    if (isEmpty(formState.value.regHint) && !isEmpty(params)) {
      formState.value.regHint = params.i18nTitle;
    }

    if (isEmpty(params)) {
      formState.value.i18nConfig = omit(formState.value.i18nConfig, 'regHint');
    } else {
      formState.value.i18nConfig = {
        ...formState.value.i18nConfig,
        regHint: params.i18nKey,
      };
    }
  };
  const getCommonRegList = async () => {
    const data = await getRegexpList();
    commonRegList.value = data || [];
  };
</script>

<script lang="ts">
  interface FormState {
    reg: string;
    regHint: string;
    i18nConfig: Recordable<any>;
  }
</script>
<style lang="less" scoped>
  :deep(.ant-list-item-action) {
    margin-left: 0;
  }

  .i18n-textarea {
    position: relative;
    z-index: 2;
  }

  .list {
    padding: 12px 16px;

    &:hover {
      background-color: #edf6f6;
    }
  }
</style>
