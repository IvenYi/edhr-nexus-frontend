<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="250"
    centered
    :defaultFullscreen="true"
    :destroyOnClose="true"
    :maskClosable="false"
    wrapClassName="online-form-modal-fullscreen"
  >
    <template #title>
      <span>
        {{ templateInfo.name }}
      </span>
      <span
        class="text-11px ml-4px"
        v-if="isStash"
        style="
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          padding: 0 4px;
          border: 1px solid #999;
        "
      >
        {{ t('sys.ipaas.flowStatus.draft') }}
      </span>
    </template>

    <template #closeIcon>
      <div class="w100% h100%" @click.stop="() => {}">
        <a-button type="link" @click.stop="handleEdit" v-if="hasEditBtn">
          {{ t('sys.edit') }}
        </a-button>
        <Tooltip :title="t('sys.component.modal.restore')" placement="bottom">
          <FullscreenExitOutlined role="full" @click.stop="handleClose" />
        </Tooltip>
      </div>
    </template>

    <template #footer>
      <div class="flex" style="justify-content: space-between">
        <div>
          <baseButton
            v-if="hasLogBtn"
            :title="t('sys.editor.logs')"
            type="link"
            icon="icon-park:log"
            hasIcon
            @click="handleClick(OperationEnum.LOG)"
          />
        </div>
        <div class="button-container">
          <baseButton
            v-for="item in computedBtnList"
            :key="item.button"
            class="ml-6px"
            :type="item.button === 'submit' ? 'primary' : ''"
            @click="handleClick(item.button)"
            :title="item.buttonName"
          />
        </div>
      </div>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, createVNode, nextTick, h } from 'vue';
  import { Modal, message } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { RenderModeEnum } from '@gct/nocode-base';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { postStash, getStashInfo } from '/@/apis/gct-apaas/StashController';
  import baseButton from '../../../__components__/base_button.vue';
  import { isEmpty } from 'lodash-es';

  // defineProps<{ dataId?: string }>();

  const enum OperationEnum {
    /** 保存 */
    SAVE = 'save',
    /** 编辑 */
    EDIT = 'edit',
    /** 日志 */
    LOG = 'log',
    /** 提交 */
    SUBMIT = 'submit',
    /** 取消 */
    CANCEL = 'cancel',
    /** 重置 */
    RESET = 'reset',
    /** 删除 */
    DELETE = 'delete',
    /** 暂存 */
    STAGING = 'staging',
  }

  const emit = defineEmits(['update:modelValue', 'saveFormData']);

  const { t } = useI18n();

  const Event = getPageEvent();

  const tempRef = ref();

  let query = reactive({});

  const pageType = ref('add');

  const isStash = ref(false);

  let templateInfo = reactive({
    id: '',
    name: '',
    modelKey: '',
    categoryId: '',
    operation: {},
  });

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    if (!data) return;
    pageType.value = 'add';
    isStash.value = false;
    const { templateKey, modelValue, onlineFormData } = data;

    if (modelValue?.dataId) {
      // 提交数据
      query.id_ = modelValue?.dataId;
    } else if (onlineFormData && !isEmpty(onlineFormData)) {
      // 临时编辑数据
      query.getFormDataCallback = () => {
        return onlineFormData;
      };
    } else if (modelValue?.stashId) {
      // 暂存数据
      const stashData = await getStashInfo({ id: modelValue?.stashId });
      if (stashData?.content) {
        isStash.value = true;
        query.getFormDataCallback = () => {
          return JSON.parse(stashData?.content);
        };
      }
    }
    // 获取表单模板信息
    const res = await getOnlineFormTmplGetVersionById({ id: templateKey });
    Object.assign(templateInfo, {
      ...res,
      operation: res?.operation ? JSON.parse(res?.operation) : undefined,
    });

    if (modelValue?.dataId) {
      await nextTick();
      pageType.value = 'detail';
      tempRef.value.setModeType(RenderModeEnum.ViewMode);
    }
  });

  const computedBtnList = computed(() => {
    const btnList = templateInfo.operation[`${pageType.value}Page`];
    console.log('btnList======>', btnList);
    return (
      btnList?.filter(
        (n) => !!n.enabled && ![OperationEnum.EDIT, OperationEnum.LOG].includes(n.button),
      ) || []
    );
  });

  const hasEditBtn = computed(() => {
    const btnList = templateInfo.operation[`${pageType.value}Page`];
    return btnList?.filter((n) => !!n.enabled)?.some((n) => n.button === OperationEnum.EDIT);
  });

  const hasLogBtn = computed(() => {
    const btnList = templateInfo.operation[`${pageType.value}Page`];
    return btnList?.filter((n) => !!n.enabled)?.some((n) => n.button === OperationEnum.LOG);
  });

  const handleClose = () => {
    const data = tempRef.value.getFormState();
    emit('saveFormData', data);
    query = reactive({});
    Object.assign(templateInfo, {
      id: '',
      name: '',
      modelKey: '',
      categoryId: '',
      operation: {},
    });
    closeModal();
  };

  const handleEdit = () => {
    pageType.value = 'edit';
    tempRef.value.setModeType(RenderModeEnum.FormMode);
  };

  const handleClick = async (type) => {
    await tempRef.value.onValidate();
    const data = tempRef.value.getFormState();
    switch (type) {
      case OperationEnum.SUBMIT:
      case OperationEnum.SAVE:
        let submitRes = await Event.context.$httpBizService(
          {
            key: templateInfo.modelKey,
            action: 'submit',
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          { ...data, id_: query.id_, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
        );
        emit(
          'update:modelValue',
          JSON.stringify({
            modelKey: templateInfo.modelKey,
            dataId: submitRes,
            stashId: undefined,
          }),
        );
        if (!query?.id_) {
          query.id_ = submitRes;
        }

        isStash.value = false;
        pageType.value = 'detail';
        tempRef.value.setModeType(RenderModeEnum.ViewMode, true);
        break;
      case OperationEnum.STAGING:
        const stashId = await postStash({
          content: JSON.stringify(data),
        });
        emit(
          'update:modelValue',
          JSON.stringify({
            modelKey: templateInfo.modelKey,
            dataId: undefined,
            stashId,
          }),
        );
        isStash.value = true;
        break;
      case OperationEnum.RESET:
        tempRef.value.resetFormState(false);
        break;
      case OperationEnum.CANCEL:
        handleClose();
        break;
      case OperationEnum.DELETE:
        Modal.confirm({
          title: t('sys.deleteData'),
          content: t('sys.deleteConfirm'),
          icon: createVNode(ExclamationCircleOutlined),
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          onOk() {
            tempRef.value.resetFormState();
            emit('saveFormData', {});
            emit('update:modelValue', null);
            message.success(t('sys.delSuccess'));
            tempRef.value.setModeType(RenderModeEnum.FormMode);
            pageType.value = 'add';
          },
          onCancel() {},
        });
        break;
      case 'log':
        if (query.id_) {
          await Event.context.$modelingTraceability!({
            id: query.id_,
            modelKey: templateInfo.modelKey,
          }).open({
            title: t('sys.editor.logs'),
          });
        }
        break;
    }
  };
</script>

<style lang="less" scoped>
  .button-container {
    display: flex;
    flex-direction: row-reverse;
  }
</style>
<style lang="less">
  .online-form-modal-fullscreen {
    .ant-modal {
      max-width: 100%;
    }
  }
</style>
