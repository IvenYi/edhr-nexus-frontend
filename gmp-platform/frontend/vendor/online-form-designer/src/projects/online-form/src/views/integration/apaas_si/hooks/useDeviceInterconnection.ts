import { type Ref, ref, reactive, computed, onUnmounted } from 'vue';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { getDeviceInterconnectionData } from '/@/apis/gct-platform/DeviceInterconnectionController';
import { mqttSubscribe } from '@mobile/utils/mqtt/web';
import { defHttp } from '@/utils/http/axios';
import { Uploader } from '@/utils/uploader';
import { message } from 'ant-design-vue';
import { useUserStore } from '/@/store/modules/user';
import { DeviceConnector, DeviceLink, type FormTmplConfigController } from '@gct/nocode-base';
import { openCameraPreview } from '../render/device-link';

/**
 * 设备互联
 */
export function useDeviceInterUpdateFormData({
  formStateMap,
  basicIns,
  updatePageData,
  ocrHistoryRef,
  formTmplC,
}: {
  formStateMap: Ref<object>;
  basicIns: Ref<any>;
  updatePageData: (id: string) => void;
  ocrHistoryRef: Ref<any>;
  formTmplC: FormTmplConfigController;
}) {
  const { mitt } = useMitt();

  const unMqttTopicMap = computed(() => formTmplC.deviceConnector?.state.unMqttTopicMap);
  /**已经连接上的mqtt Id */
  const mqttTmplIds = computed(() => {
    return Object.keys(formTmplC.deviceConnector.state.unMqttTopicMap);
  });
  /** 注册主题 */
  async function subscribeTopic({
    deviceKey,
    fieldMaps,
    id,
    fieldPermission,
  }: {
    deviceKey: string;
    fieldMaps: DeviceLink.Device2FormFieldMap[];
    id: string;
    fieldPermission: any[];
  }): Promise<void> {
    const userStore = useUserStore();
    const topic = `/device/interconnection/frontend/${userStore.getTenant}/${deviceKey}`;
    /**被占用的时候  连接mqtt 并且监听一个主题消息*/
    mitt.on(`mqtt-${topic}`, (msg: any) => {
      try {
        transformMapsToData(
          msg,
          formStateMap.value[basicIns.value.uniqueId],
          fieldMaps,
          fieldPermission,
        );
        updatePageData(basicIns.value.uniqueId);
      } catch (error) {
        console.log(msg, error);
      }
    });
    /**用平台连接的Mqtt订阅主题 */
    const { unTopic } = await mqttSubscribe(topic);
    unMqttTopicMap.value[id] = () => {
      unTopic();
      mitt.off(`mqtt-${topic}`);
    };
  }

  /**
   * 获取设备数据
   */
  async function getDeviceData({
    deviceId,
    fieldMaps,
    fieldPermission,
  }: {
    deviceId: string;
    fieldMaps: any[];
    fieldPermission: any[];
  }): Promise<void> {
    const res = await getDeviceInterconnectionData({ deviceId });
    try {
      const data = JSON.parse(res);
      transformMapsToData(
        data,
        formStateMap.value[basicIns.value.uniqueId],
        fieldMaps,
        fieldPermission,
      );
      updatePageData(basicIns.value.uniqueId);
    } catch (error) {
      console.log(res, error);
    }
  }

  /** 数据连接 */
  async function handleDevice({
    id,
    runtimeDeviceType,
    runtimeDeviceKey,
    runtimeDeviceId,
    fieldMaps,
    fieldPermission,
  }: {
    id: string;
    runtimeDeviceType: DeviceLink.DeviceLinkTypeEnum;
    runtimeDeviceKey: string;
    runtimeDeviceId: string;
    fieldMaps: any[];
    fieldPermission: any[];
  }): Promise<void> {
    if (runtimeDeviceType === DeviceLink.DeviceLinkTypeEnum.IPAAS) {
      await getDeviceData({ deviceId: runtimeDeviceId, fieldMaps, fieldPermission });
    }
    if (runtimeDeviceType === DeviceLink.DeviceLinkTypeEnum.MQTT) {
      await subscribeTopic({ deviceKey: runtimeDeviceKey, fieldMaps, id, fieldPermission });
    }
  }

  /**
   * 销毁所有主题消息
   */
  function unsubscribe(): void {
    formTmplC.deviceConnector.clear();
  }

  /**
   * orcAI
   * @param param0
   */
  async function orcAgent({
    runtimePrompt,
    inputMode,
    binarizeMethod,
    contrastAlpha,
    denoiseMethod,
    deviceName,
    enableContrast,
    extraPrompt,
    enableDenoise,
    enableBinarize,
  }) {
    const image_base64 =
      inputMode === DeviceLink.AiInputModeEnum.UPLOAD ? await uploadImage() : await takePhoto();
    const hide = message.loading('OCR正在识别中...', 0);
    const res = await defHttp.post(
      {
        url: `/gct-apaas/api/ocr/v1/vlm/agent`,
        data: {
          preprocess: {
            enable_binarize: enableBinarize,
            binarize_method: enableBinarize ? binarizeMethod : '',
            enable_denoise: enableDenoise,
            denoise_method: enableDenoise ? denoiseMethod : '',
            enable_contrast: enableContrast,
            contrast_alpha: enableContrast ? contrastAlpha : '',
          },
          user_prompt: runtimePrompt,
          image_base64,
          // 实例id
          of_inst_id: basicIns.value.key,
        },
      },
      {
        joinTenantIdToHeader: true,
      },
    );
    try {
      const aiText = res.text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const data = JSON.parse(aiText);
      const formData = formStateMap.value[basicIns.value.uniqueId];
      for (const key in data) {
        const valueData = data[key];
        if (valueData.value === null) continue;
        formData[key] = valueData.value;
      }
    } catch (error) {}
    hide();
    // 刷新ocr历史记录侧边栏数据
    ocrHistoryRef.value?.refresh();
    message.success($t('sys.onlineForm.recognitionComplete'));
  }
  /**图片上传 */
  async function uploadImage() {
    const [file] = await Uploader.getFiles({ acceptList: 'image/*' });
    const base64Photo = await Uploader.compressToBase64(file);
    return base64Photo;
  }

  /**摄像头截图 */
  async function takePhoto() {
    const base64Photo = await openCameraPreview();
    return base64Photo;
  }
  /**数据同步 */
  function transformMapsToData(
    fromData,
    toData,
    fieldMaps: DeviceLink.Device2FormFieldMap[],
    fieldPermission: any[] = [],
  ) {
    function hasPermission(field: string): boolean {
      return (
        !fieldPermission.length || fieldPermission.find((e) => e.field === field && !e.readonly)
      );
    }

    fieldMaps.forEach((map) => {
      const { deviceField, formField, children, isSubField, formFields, writeBackMode } = map;
      if (!formField && !formFields) return;
      // 处理字段映射
      // 子表可编辑的字段，子表有可编辑的字段时，才可以同步数据
      const subEditableFields = (children || []).reduce((list, e) => {
        const f = extractTargetField(e.formField!);
        if (!fieldPermission.length || fieldPermission.find((e) => e.field === f && !e.readonly)) {
          list.push(f);
        }
        return list;
      }, []);
      // 如果存在子字段且不是子字段处理，则递归处理
      if (isSubField && children && children.length > 0 && subEditableFields.length > 0) {
        if (!formField) {
          return;
        }
        // 提取目标字段名（取点号后面的部分）
        const targetField = extractTargetField(formField);
        // 原子表数据要保留，传给后端时，统一打上标记deleted_，表示被删除
        const subData = (toData[targetField] || [])
          .filter((e) => e.id_)
          .map((e) => {
            return {
              ...e,
              deleted_: true,
            };
          });
        const sourceValue_children = fromData[deviceField] || [];
        const fieldValue = sourceValue_children.map((row) => {
          const newData = {};
          // 子表字段填充规则，直接覆盖原数据，且不走字段权限配置逻辑
          transformMapsToData(row, newData, children, []);
          return newData;
        });
        toData[targetField] = [...subData, ...fieldValue];
      } else {
        // 源数据没有给值的情况下不修改表单字段
        if (!(deviceField && deviceField in fromData)) {
          return;
        }
        const sourceValue = fromData[deviceField];
        if (formField) {
          // 单个字段时处理
          const targetField = extractTargetField(formField);
          if (hasPermission(targetField)) {
            toData[targetField] = sourceValue;
          }
        } else {
          formFields?.forEach((f) => {
            const targetF = extractTargetField(f);
            if (!hasPermission(targetF)) {
              return;
            }
            // 多个字段时处理
            if (writeBackMode === DeviceLink.WriteBackModeEnum.MOUSE_FOCUS) {
              // 多个字段,且配置了鼠标焦点回写方式时，只有当前聚焦字段才回写数据
              if (formTmplC.deviceConnector.state.focusFieldKey === targetF) {
                toData[targetF] = sourceValue;
              } else {
                // 其他非聚焦字段缓存数据，等到聚焦时再回写
                formTmplC.deviceConnector.state.cacheFieldData[targetF] = sourceValue;
              }
            } else {
              toData[targetF] = sourceValue;
            }
          });
        }
      }
      // 如果是子字段，继续处理（在递归中已处理）
    });
  }

  /** 提取目标字段 */
  function extractTargetField(formField: string): string {
    return formField.split('.').pop() || '';
  }

  onUnmounted(() => {
    unsubscribe();
  });

  const selectTemplate = async (res) => {
    const { type, id } = res;
    const unMqtt = unMqttTopicMap.value[id];
    if (unMqtt) {
      /**选中的模版在选中一次的话如果之前有mqtt连接 那么就先销毁订阅 */
      unMqtt();
      Reflect.deleteProperty(unMqttTopicMap.value, id);
    }
    if (type === DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION) {
      handleDevice(res);
    }
    if (type === DeviceLink.TmplTypeEnum.AI_OCR) {
      orcAgent(res);
    }
  };

  return { handleDevice, unsubscribe, orcAgent, selectTemplate, mqttTmplIds };
}
