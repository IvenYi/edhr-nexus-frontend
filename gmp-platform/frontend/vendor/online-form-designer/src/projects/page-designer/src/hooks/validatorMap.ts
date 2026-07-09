import { useI18n } from '/@/hooks/web/useI18n';
import { FormComponents } from '/@page-designer/enum';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import type { validateRule } from '/@page-designer/types/widget-basic-types';
import { Events } from '/@web-render/render/Event/baseEvent';
import type { Rule } from 'ant-design-vue/es/form';
import { TypeEnum } from '/@app-designer/views/model-desginer/entity/constant/serial';

const { t } = useI18n();

interface formRuleProps {
  type: FormComponents;
  widgetProps: LowCodeWidget.FormItemProps;
  validateRules?: validateRule[];
  Event?: Events;
  formData?: object;
}
export const FieldValidatorMap = (arg: formRuleProps): Rule[] => {
  const { widgetProps, type, formData } = arg;
  const { label, fieldName } = widgetProps;
  const __default = [
    {
      required: true,
      message: (label || fieldName) + $t('sys.pageDesigner.cannotBeEmpty'),
    },
  ];
  const vMap = {
    [FormComponents.RdoInput]: [
      {
        required: true,
        validator: ({ field }, value) => {
          if (!formData?.[field] && !formData?.version_) {
            return Promise.reject(
              label + '、' + t('sys.appDesigner.version') + t('sys.pageDesigner.cannotBeEmpty'),
            );
          } else if (!formData?.[field]) {
            return Promise.reject(label + t('sys.pageDesigner.cannotBeEmpty'));
          } else if (!formData?.version_) {
            return Promise.reject(
              t('sys.appDesigner.version') + t('sys.pageDesigner.cannotBeEmpty'),
            );
          } else return Promise.resolve();
        },
      },
    ],
    [FormComponents.SubTable]: [
      {
        required: true,
        validator: (rule, value) => {
          const realValue = (value ?? []).filter((item) => !item.deleted_);
          if (!realValue.length) {
            return Promise.reject(label + t('sys.pageDesigner.cannotBeEmpty'));
          }
          return Promise.resolve();
        },
      },
    ],
    [FormComponents.SerialRule]: [
      {
        validator: (rule, value) => {
          const { ruleConfig } = JSON.parse(value);
          formData['_SERIAL_RULE_VALIDATE_'] = ruleConfig?.map((i) => i.id);
          // return new Promise((resolve, reject) => {
          for (let i = 0; i < ruleConfig.length; i++) {
            if (ruleConfig[i].type === TypeEnum.INCREASE) {
              const { padding, step } = ruleConfig[i].config;
              if (!(padding && step)) {
                return Promise.reject(t('sys.pageDesigner.increaseValiText', { sth: label }));
              }
            } else if (ruleConfig[i].type === TypeEnum.FIXED) {
              if (!ruleConfig[i].config.value) {
                return Promise.reject(t('sys.pageDesigner.fixedValiText', { sth: label }));
              }
            } else if (ruleConfig[i].type === TypeEnum.PLACEHOLDER) {
              if (!ruleConfig[i].config.modelKey) {
                return Promise.reject(t('sys.pageDesigner.placeholderValiText', { sth: label }));
              }
            } else if (ruleConfig[i].type === TypeEnum.DATE) {
              if (ruleConfig[i].config.patternType === 'CUSTOM' && !ruleConfig[i].config.pattern) {
                return Promise.reject(t('sys.pageDesigner.dateCustomValiText', { sth: label }));
              }
            }
          }
          delete formData?.['_SERIAL_RULE_VALIDATE_'];
          return Promise.resolve('');
          // delete formData?.['_SERIAL_RULE_VALIDATE_'];
          // resolve('');
          // });
        },
        message: '',
        trigger: 'change',
      },
    ],
  };
  return vMap[type] || __default;
};
