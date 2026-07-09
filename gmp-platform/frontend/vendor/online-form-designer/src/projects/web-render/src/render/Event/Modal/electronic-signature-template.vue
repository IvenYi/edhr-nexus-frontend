<template>
  <Modal
    v-model:visible="visible"
    v-bind="modalProps"
    @cancel="cancel"
    @ok="ok"
    :confirmLoading="confirmLoading"
  >
    <ConfigProvider :locale="getAntdLocale">
      <div class="electronic-signature-container">
        <!-- {{ formState }} -->
        <a-form ref="formRef" name="advanced_search" :model="formState" layout="vertical">
          <div
            class="electronic-signature-item"
            v-for="(signGroup, signGroupIndex) in formState.signGroups"
            :key="signGroup.id"
          >
            <div class="electronic-signature-title">
              <a-descriptions
                :column="4"
                :label-style="{ color: '#333' }"
                :content-style="{ color: '#7F8695' }"
              >
                <a-descriptions-item>
                  <template #label>
                    <i class="iconfont icon-a-Single-linetext mr-4px" style="line-height: 1"></i>
                    签名组
                  </template>
                  {{ signGroup.signGroupName }}
                </a-descriptions-item>
                <a-descriptions-item label="签名数量">{{
                  signGroup.signNumber
                }}</a-descriptions-item>
                <a-descriptions-item label="会签组" v-if="signGroup.hasCounterSignGroup">{{
                  signGroup.counterSignGroupName
                }}</a-descriptions-item>
                <a-descriptions-item label="会签数量" v-if="signGroup.hasCounterSignGroup">{{
                  signGroup.counterSignNumber
                }}</a-descriptions-item>
              </a-descriptions>
            </div>
            <template v-if="formState.type === 'password'">
              <div class="electronic-signature-list">
                <template v-for="(sign, signIndex) in signGroup.signs" :key="sign.id">
                  <a-row :gutter="24">
                    <a-col :span="6">
                      <a-form-item
                        :name="['signGroups', signGroupIndex, 'signs', signIndex, 'account']"
                        :label="t('sys.userName')"
                        :rules="validateAccount('signs', signGroupIndex, signIndex)"
                      >
                        <a-input
                          v-model:value="sign.account"
                          :disabled="sign.disabled"
                          :placeholder="t('sys.pleaseInputSth', { sth: t('sys.userName') })"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        :name="['signGroups', signGroupIndex, 'signs', signIndex, 'password']"
                        :label="t('sys.password')"
                        :rules="[
                          { required: true },
                          {
                            pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/,
                            message: t('sys.passwordFormatError'),
                          },
                        ]"
                      >
                        <a-input-password
                          v-model:value="sign.password"
                          :disabled="sign.disabled"
                          :placeholder="
                            t('sys.pleaseInputSth', {
                              sth: t('sys.password'),
                            })
                          "
                          autocomplete="new-password"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <a-form-item
                        :name="['signGroups', signGroupIndex, 'signs', signIndex, 'description']"
                        :label="t('sys.description')"
                      >
                        <a-textarea
                          v-model:value="sign.description"
                          :disabled="sign.disabled"
                          autosize
                          :maxlength="120"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <div class="button-wrapper">
                        <a-button
                          :disabled="sign.validate"
                          type="link"
                          v-if="!sign.isShowCountersigns"
                          @click.stop="() => onSignatureVerification(signGroupIndex, signIndex)"
                          >签名验证</a-button
                        >
                        <a-button
                          type="link"
                          v-if="sign.isShowCountersigns"
                          :disabled="sign.validate"
                          @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, false)"
                          >签名</a-button
                        >
                        <a-button
                          type="link"
                          v-if="
                            signGroup.hasCounterSignGroup &&
                            signGroup.counterSignNumber &&
                            !sign.validate &&
                            !sign.isShowCountersigns
                          "
                          @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, true)"
                          >会签</a-button
                        >
                      </div>
                    </a-col>
                  </a-row>

                  <template v-if="sign.isShowCountersigns">
                    <template
                      v-for="(countersign, countersignIndex) in sign.countersigns"
                      :key="countersign.id"
                    >
                      <a-row :gutter="24">
                        <a-col :span="5">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'countersignReason',
                            ]"
                            label="会签原因"
                            required
                          >
                            <a-select
                              v-model:value="countersign.countersignReason"
                              style="width: 100%"
                              :disabled="countersign.disabled"
                              :placeholder="
                                t('sys.pleaseSelectSth', {
                                  sth: '会签原因',
                                })
                              "
                              :options="options"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="5">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'account',
                            ]"
                            :label="t('sys.userName')"
                            :rules="
                              validateAccount(
                                'countersigns',
                                signGroupIndex,
                                signIndex,
                                countersignIndex,
                              )
                            "
                          >
                            <a-input
                              v-model:value="countersign.account"
                              :disabled="countersign.disabled"
                              :placeholder="t('sys.pleaseInputSth', { sth: t('sys.userName') })"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="5">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'password',
                            ]"
                            :label="t('sys.password')"
                            :rules="[
                              { required: true },
                              {
                                pattern: /^(?![\u4e00-\u9fa5])\S{6,16}$/,
                                message: t('sys.passwordFormatError'),
                              },
                            ]"
                          >
                            <a-input-password
                              v-model:value="countersign.password"
                              :disabled="countersign.disabled"
                              :placeholder="
                                t('sys.pleaseInputSth', {
                                  sth: t('sys.password'),
                                })
                              "
                              autocomplete="new-password"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="5">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'description',
                            ]"
                            :label="t('sys.description')"
                          >
                            <a-textarea
                              v-model:value="countersign.description"
                              :disabled="countersign.disabled"
                              autosize
                              :maxlength="120"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="4">
                          <div class="button-wrapper">
                            <a-button
                              type="link"
                              :disabled="countersign.validate"
                              @click.stop="
                                () =>
                                  onCountersignVerification(
                                    signGroupIndex,
                                    signIndex,
                                    countersignIndex,
                                  )
                              "
                              >签名验证</a-button
                            >
                          </div>
                        </a-col>
                      </a-row>
                    </template>
                  </template>
                </template>
              </div>
            </template>
            <template v-else-if="formState.type === 'writing'">
              <div class="electronic-signature-list">
                <template v-for="(sign, signIndex) in signGroup.signs" :key="sign.id">
                  <a-row :gutter="24">
                    <a-col :span="18">
                      <a-form-item
                        :name="['signGroups', signGroupIndex, 'signs', signIndex, 'description']"
                        :label="t('sys.description')"
                      >
                        <a-textarea
                          v-model:value="sign.description"
                          :disabled="sign.disabled"
                          autosize
                          :maxlength="120"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :span="6">
                      <div class="button-wrapper">
                        <a-button
                          :disabled="sign.validate"
                          type="link"
                          v-if="!sign.isShowCountersigns"
                          @click.stop="
                            () => onOpenWacomModal('master', { signGroupIndex, signIndex })
                          "
                          >手写签名</a-button
                        >
                        <a-button
                          type="link"
                          v-if="sign.isShowCountersigns"
                          :disabled="sign.validate"
                          @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, false)"
                          >签名</a-button
                        >
                        <a-button
                          type="link"
                          v-if="
                            signGroup.hasCounterSignGroup &&
                            signGroup.counterSignNumber &&
                            !sign.validate &&
                            !sign.isShowCountersigns
                          "
                          @click.stop="() => onChangeCounterSigns(signGroupIndex, signIndex, true)"
                          >会签</a-button
                        >
                      </div>
                    </a-col>
                  </a-row>

                  <template v-if="sign.isShowCountersigns">
                    <template
                      v-for="(countersign, countersignIndex) in sign.countersigns"
                      :key="countersign.id"
                    >
                      <a-row :gutter="24">
                        <a-col :span="12">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'countersignReason',
                            ]"
                            label="会签原因"
                            required
                          >
                            <a-select
                              v-model:value="countersign.countersignReason"
                              style="width: 100%"
                              :disabled="countersign.disabled"
                              :placeholder="
                                t('sys.pleaseSelectSth', {
                                  sth: '会签原因',
                                })
                              "
                              :options="options"
                            />
                          </a-form-item>
                        </a-col>

                        <a-col :span="8">
                          <a-form-item
                            :name="[
                              'signGroups',
                              signGroupIndex,
                              'signs',
                              signIndex,
                              'countersigns',
                              countersignIndex,
                              'description',
                            ]"
                            :label="t('sys.description')"
                          >
                            <a-textarea
                              v-model:value="countersign.description"
                              :disabled="countersign.disabled"
                              autosize
                              :maxlength="120"
                            />
                          </a-form-item>
                        </a-col>
                        <a-col :span="4">
                          <div class="button-wrapper">
                            <a-button
                              type="link"
                              :disabled="countersign.validate"
                              @click.stop="
                                () =>
                                  onOpenWacomModal('counter', {
                                    signGroupIndex,
                                    signIndex,
                                    countersignIndex,
                                  })
                              "
                              >手写签名</a-button
                            >
                          </div>
                        </a-col>
                      </a-row>
                    </template>
                  </template>
                </template>
              </div>
            </template>
          </div>
        </a-form>
      </div>
    </ConfigProvider>
  </Modal>
  <Modal
    v-model:visible="wacomVisible.isVisible"
    v-bind="wacomModalProps"
    @cancel="wacomCancel"
    @ok="wacomOk"
  >
    <ConfigProvider :locale="getAntdLocale">
      <div class="electronic-signature-container" style="border: 1px solid #ddd">
        <WacomRender :widget="{ style: { width: '592', height: '400' } }" ref="wacomRef" />
      </div>
      <span class="mt-4px" style="display: inline-block; color: red"
        >*请在操作台的签名板上进行签名，请保证签名清晰完整</span
      >
    </ConfigProvider>
  </Modal>
</template>

<script setup lang="ts" name="electronic-signature-template">
  import { ref, reactive, nextTick } from 'vue';
  import { Modal, message as Message, ConfigProvider } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useLocale } from '/@/locales/useLocale';
  import type { ModalProps, FormInstance } from 'ant-design-vue';
  import { useSHA256 } from '/@/views/sys/login/useLogin';
 import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import WacomRender from '/@page-designer/components/widgets/web/other/wacom/wacom-render.vue';
  import { isNil } from 'lodash-es';

  interface ISignBasic {
    id: number;
    /** 账号 */
    account?: string;
    /** 密码 */
    password?: string;
    /** 备注 */
    description?: string;
    signGroupId: string;
    cosignGroupId: string;
    disabled: boolean;
    /** 是否验证过 */
    validate: boolean;
  }

  interface ICountersigns extends ISignBasic {
    /** 会签原因 */
    countersignReason?: string;
  }

  interface ISign extends ISignBasic {
    /** 是否显示会签 */
    isShowCountersigns: boolean;
    /** 会签组 */
    countersigns?: ICountersigns[];
  }

  interface ISignGroups {
    id: string;
    /** 签名组名称 */
    signGroupName: string;
    /** 签名数量 */
    signNumber: number;
    /**是否有会签组 */
    hasCounterSignGroup: boolean;
    /** 会签组名称 */
    counterSignGroupName: string;
    /** 会签数量 */
    counterSignNumber: number;
    signs: ISign[];
  }

  interface IFormState {
    relationId: string;
    signRequirementId: string;
    otherParams: { [k: string]: any };
    type: string;
    /** 是否复合签名 */
    review: boolean;
    signGroups: ISignGroups[];
  }

  const { getAntdLocale } = useLocale();
  const confirmLoading = ref(false);
  const { t } = useI18n();

  const { sha256 } = useSHA256();

  const defProps = defineProps<{
    destroyVm: Function;
    successCallback?: Function;
    cancel?: Function;
  }>();

  const modalProps: ModalProps = reactive({
    title: '电子签名',
    width: 1000,
    okText: '提交',
    cancelText: '取消',
    maskClosable: false,
  });

  const wacomModalProps: ModalProps = reactive({
    title: '签名区',
    width: 640,
    okText: '保存',
    cancelText: '取消',
    maskClosable: false,
    confirmLoading: false
  });

  const visible = ref(false);
  const wacomVisible = reactive<{
    isVisible: boolean;
    type: string;
    indexs: number[];
  }>({
    isVisible: false,
    type: '',
    indexs: [],
  });
  const formRef = ref<FormInstance>();
  const wacomRef = ref();
  const formState = reactive<IFormState>({
    relationId: '',
    signRequirementId: '',
    type: '',
    review: false,
    otherParams: {},
    signGroups: [],
  });

  const options = ref([]);

  const getTableData = async () => {
    const res = await postBizServiceByModelKeyByBsKey({ bsKey: 'listAll', modelKey: 'em_cosign_reason' });
    if (res && res.data.length !== 0) {
      options.value = res.data.map((item) => {
        return {
          label: item.name_,
          value: item.id_,
        };
      });
    }
  };

  const requestSignatureVerification = async (info) => {
    const relationKey: string = formState.otherParams?.relationKey || 'relation_id_';
    await postBizServiceByModelKeyByBsKey(
      { bsKey: 'save', modelKey: 'em_sign_history' },
      {
        [relationKey]: formState.relationId,
        review_: formState.review,
        type_: 'producing',
        ...info,
      },
    );
    Message.success(formState.type === 'password' ? '签名验证成功' : '签名保存成功');
    return true;
  };

  async function open(params) {
    const { relationId, signRequirementId, type, configs, review, ...otherParams } = params || {};
    const { data, dict } = configs || {};
    modalProps.title = review ? '复核签名' : '电子签名';

    if (!(relationId && signRequirementId && data.length !== 0))
      return Message.warn('没有获取到电子签名配置');

    visible.value = true;

    formState.relationId = relationId;

    formState.signRequirementId = signRequirementId;

    formState.type = type;

    formState.review = review;

    formState.otherParams = { ...otherParams };

    data.forEach((config, index) => {
      formState.signGroups.push({
        id: config.id_,
        signGroupName: dict.sign_group_id_[config.sign_group_id_],
        signNumber: Number(config.sign_qty_),
        hasCounterSignGroup: config.cosign_group_id_ ? true : false,
        counterSignGroupName:
          config.cosign_group_id_ && dict.cosign_group_id_[config.cosign_group_id_],
        counterSignNumber: (isNil(config.cosign_qty_)
          ? undefined
          : Number(config.cosign_qty_)) as any as number,
        signs: [],
      });

      for (let i = 0; i < formState.signGroups[index].signNumber; i++) {
        formState.signGroups[index].signs.push({
          id: Date.now(),
          account: undefined,
          password: undefined,
          description: undefined,
          disabled: false,
          validate: false,
          isShowCountersigns: false,
          signGroupId: config.sign_group_id_,
          cosignGroupId: config.cosign_group_id_,
          countersigns: [],
        });

        for (let j = 0; j < formState.signGroups[index].counterSignNumber; j++) {
          formState.signGroups[index].signs[i].countersigns!.push({
            id: Date.now(),
            account: undefined,
            password: undefined,
            description: undefined,
            disabled: false,
            validate: false,
            countersignReason: undefined,
            signGroupId: config.sign_group_id_,
            cosignGroupId: config.cosign_group_id_,
          });
        }
      }
    });
    getTableData();
    console.log('formState', formState);
  }

  /** 显示会签组列表 */
  const onChangeCounterSigns = (signGroupIndex: number, signIndex: number, bool: boolean) => {
    // 显示隐藏会签组列表
    formState.signGroups[signGroupIndex].signs[signIndex].isShowCountersigns = bool;
    // 把签名行设置是否置灰
    formState.signGroups[signGroupIndex].signs[signIndex].disabled = bool;

    if (bool) {
      formState.signGroups[signGroupIndex].signs[signIndex].account = undefined;
      formState.signGroups[signGroupIndex].signs[signIndex].password = undefined;
      formState.signGroups[signGroupIndex].signs[signIndex].description = undefined;
      formRef.value?.clearValidate([
        ['signGroups', signGroupIndex, 'signs', signIndex, 'account'],
        ['signGroups', signGroupIndex, 'signs', signIndex, 'password'],
      ]);
    } else {
      formState.signGroups[signGroupIndex].signs[signIndex].countersigns?.forEach(
        (countersign, index) => {
          countersign.countersignReason = undefined;
          countersign.account = undefined;
          countersign.password = undefined;
          countersign.description = undefined;
          formRef.value?.clearValidate([
            [
              'signGroups',
              signGroupIndex,
              'signs',
              signIndex,
              'countersigns',
              index,
              'countersignReason',
            ],
            ['signGroups', signGroupIndex, 'signs', signIndex, 'countersigns', index, 'account'],
            ['signGroups', signGroupIndex, 'signs', signIndex, 'countersigns', index, 'password'],
          ]);
        },
      );
    }
  };

  /** 签名行签名验证 */
  const onSignatureVerification = async (signGroupIndex, signIndex) => {
    const info = formState.signGroups[signGroupIndex].signs[signIndex] || {};
    formRef.value
      ?.validate([
        ['signGroups', signGroupIndex, 'signs', signIndex, 'account'],
        ['signGroups', signGroupIndex, 'signs', signIndex, 'password'],
      ])
      .then(async () => {
        const params: any = {
          sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
          sign_group_id_: info.signGroupId,
          sign_account_: info.account,
          description_: info.description,
        };
        if (info.password) {
          const key = Math.random().toString(16).substring(2, 8);
          Object.assign(params, {
            password_: sha256(info.password, key),
          });
        }
        try {
          formState.signGroups[signGroupIndex].signs[signIndex].disabled = true;
          formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
          await requestSignatureVerification(params);
        } catch (err) {
          formState.signGroups[signGroupIndex].signs[signIndex].disabled = false;
          formState.signGroups[signGroupIndex].signs[signIndex].validate = false;
        }
      });
  };

  /** 会签行签名验证 */
  const onCountersignVerification = async (signGroupIndex, signIndex, countersignIndex) => {
    const info =
      formState.signGroups[signGroupIndex].signs[signIndex].countersigns![countersignIndex] || {};

    formRef.value
      ?.validate([
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'countersignReason',
        ],
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'account',
        ],
        [
          'signGroups',
          signGroupIndex,
          'signs',
          signIndex,
          'countersigns',
          countersignIndex,
          'password',
        ],
      ])
      .then(async () => {
        const params = {
          sign_requirement_config_id_: formState.signGroups[signGroupIndex].id,
          cosign_group_id_: info.cosignGroupId,
          cosign_account_: info.account,
          description_: info.description,
          cosign_reason_id_: info.countersignReason,
        };

        if (info.password) {
          const key = Math.random().toString(16).substring(2, 8);
          Object.assign(params, {
            password_: sha256(info.password, key),
          });
        }

        try {
          formState.signGroups[signGroupIndex].signs[signIndex].validate = true;
          formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
            countersignIndex
          ].disabled = true;
          formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
            countersignIndex
          ].validate = true;
          await requestSignatureVerification(params);
        } catch (err) {
          formState.signGroups[signGroupIndex].signs[signIndex].validate = false;
          formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
            countersignIndex
          ].disabled = false;
          formState.signGroups[signGroupIndex].signs[signIndex].countersigns![
            countersignIndex
          ].validate = false;
        }
      });
  };

  async function close() {
    visible.value = false;
    defProps.destroyVm && (await defProps.destroyVm());
  }

  async function cancel() {
    defProps.cancel && defProps.cancel();
    await close();
  }

  async function ok() {
    confirmLoading.value = true;
    try {
      defProps.successCallback &&
        (await defProps.successCallback({
          relationId: formState.relationId,
          signRequirementId: formState.signRequirementId,
          review: formState.review,
          ...formState.otherParams,
        }));
      await nextTick();
    } catch (error) {}
    confirmLoading.value = false;
  }

  /** 打开手写版 */
  const onOpenWacomModal = async (type, { signGroupIndex, signIndex, countersignIndex }) => {
    if (type === 'master') {
      wacomVisible.isVisible = true;
      wacomVisible.type = type;
      wacomVisible.indexs = [signGroupIndex, signIndex];
    } else if (type === 'counter') {
      formRef.value
        ?.validate([
          [
            'signGroups',
            signGroupIndex,
            'signs',
            signIndex,
            'countersigns',
            countersignIndex,
            'countersignReason',
          ],
        ])
        .then(async () => {
          wacomVisible.isVisible = true;
          wacomVisible.type = type;
          wacomVisible.indexs = [signGroupIndex, signIndex, countersignIndex];
        });
    }
  };

  function wacomCancel() {
    wacomRef.value.clear();
    wacomVisible.isVisible = false;
    wacomVisible.type = '';
    wacomVisible.indexs = [];
  }

  async function wacomOk() {
    wacomModalProps.confirmLoading = true;
    if (wacomVisible.type === 'master') {
      const [_signGroupIndex, _signIndex] = wacomVisible.indexs;

      const info = formState.signGroups[_signGroupIndex].signs[_signIndex] || {};

      const params: any = {
        sign_requirement_config_id_: formState.signGroups[_signGroupIndex].id,
        sign_group_id_: info.signGroupId,
        description_: info.description,
        sign_name_: wacomRef.value.getValue(),
      };

      try {
        await requestSignatureVerification(params);
        formState.signGroups[_signGroupIndex].signs[_signIndex].disabled = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].validate = true;
      } catch (err) {
        wacomModalProps.confirmLoading = false;
      }
    } else if (wacomVisible.type === 'counter') {
      const [_signGroupIndex, _signIndex, _countersignIndex] = wacomVisible.indexs;

      const info =
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![_countersignIndex] ||
        {};

      const params = {
        sign_requirement_config_id_: formState.signGroups[_signGroupIndex].id,
        cosign_group_id_: info.cosignGroupId,
        description_: info.description,
        cosign_reason_id_: info.countersignReason,
        cosign_name_: wacomRef.value.getValue(),
      };

      try {
        await requestSignatureVerification(params);
        formState.signGroups[_signGroupIndex].signs[_signIndex].validate = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![
          _countersignIndex
        ].disabled = true;
        formState.signGroups[_signGroupIndex].signs[_signIndex].countersigns![
          _countersignIndex
        ].validate = true;
      } catch(err) {
        wacomModalProps.confirmLoading = false;
      }
    }

    wacomModalProps.confirmLoading = false;
    wacomCancel();
  }
  function validateAccount(
    type: string,
    signGroupIndex: number,
    signIndex: number,
    countersignIndex?: number,
  ) {
    return [
      {
        message: '该签名账号重复!',
        async validator() {
          let flag = false;
          if (type === 'signs') {
            const needValidateVal = formState.signGroups[signGroupIndex].signs[signIndex].account;
            formState.signGroups[signGroupIndex].signs.forEach((sign, index) => {
              if (needValidateVal && index !== signIndex && sign.account == needValidateVal) {
                flag = true;
              }
            });
          }
          if (type === 'countersigns') {
            const needValidateVal =
              formState.signGroups[signGroupIndex].signs[signIndex].countersigns[countersignIndex!]
                .account;
            formState.signGroups[signGroupIndex].signs[signIndex].countersigns.forEach(
              (countersign, index) => {
                if (
                  needValidateVal &&
                  index !== countersignIndex &&
                  countersign.account == needValidateVal
                ) {
                  flag = true;
                }
              },
            );
          }
          if (flag) {
            return Promise.reject();
          }
        },
      },
      {
        required: true,
      },
    ];
  }

  async function validateForm() {
    try {
      const promiseList: any[] = [];
      formState.signGroups.forEach((signGroup, signGroupIndex) => {
        (signGroup?.signs ?? []).forEach((sign, signIndex) => {
          if (!sign.isShowCountersigns && !sign.validate) {
            promiseList.push(
              formRef.value?.validate([
                ['signGroups', signGroupIndex, 'signs', signIndex, 'account'],
                ['signGroups', signGroupIndex, 'signs', signIndex, 'password'],
              ]),
            );
          }
          (sign?.countersigns ?? [])?.forEach((countersign, countersignIndex) => {
            if (sign.isShowCountersigns) {
              promiseList.push(
                formRef.value?.validate([
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'countersignReason',
                  ],
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'account',
                  ],
                  [
                    'signGroups',
                    signGroupIndex,
                    'signs',
                    signIndex,
                    'countersigns',
                    countersignIndex,
                    'password',
                  ],
                ]),
              );
            }
          });
        });
      });
      await Promise.all(promiseList);
    } catch (error) {
      console.log(error, 'validate:promiseList');
      if (!error?.errorFields?.length) return;

      return Promise.reject(error);
    }
  }
  defineExpose({
    open,
    close,
    validateForm,
  });
</script>
<style lang="less" scoped>
  .button-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
  }
</style>
