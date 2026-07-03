import { toRef } from 'vue';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import type { Rule } from 'ant-design-vue/es/form';
import { getModelDataCheckFieldValueExist } from '/@/apis/gct-apaas/ModelDataController';
import { UniqueConstraintType } from '@/enums/appEnum';
import { useI18n } from '/@/hooks/web/useI18n';
import { FormComponents } from '/@page-designer/enum';
import type { validateRule } from '/@page-designer/types/widget-basic-types';
import { Events } from '/@web-render/render/Event/baseEvent';
import { FieldValidatorMap } from './validatorMap';

const { t } = useI18n();

interface formRuleProps {
  type: FormComponents;
  widgetProps: LowCodeWidget.FormItemProps;
  validateRules?: validateRule[];
  Event?: Events;
  formData?: object;
  subTableCustomValidateRules?: Function;
}

/**普通form校验 */
export function useValidator(arg: formRuleProps) {
  const {
    type,
    widgetProps,
    formData = {},
    subTableCustomValidateRules,
    validateRules = [],
    Event,
  } = arg;
  const { uniqueConstraintType, field, modelKey, closeValidator } = widgetProps || {};
  const rules = toRef(() => {
    if (arg.widgetProps.readonly || arg.widgetProps.disabled || closeValidator) return [];
    const RuleProps = publicRulesforProps(arg);
    if (
      !subTableCustomValidateRules &&
      uniqueConstraintType === UniqueConstraintType.GLOBAL &&
      type !== FormComponents.RdoInput
    ) {
      RuleProps.push({
        trigger: getTriggerBycom(type),
        message: t('sys.pageDesigner.theCurrentValueAlreadyExists'),
        async validator(_, fieldValue) {
          if (!fieldValue) return;
          try {
            const unique = await getModelDataCheckFieldValueExist({
              fieldKey: field,
              fieldValue: fieldValue,
              modelKey: modelKey,
              excludeId: formData?.id_,
              refFieldKey: formData?.ref_field_key_,
              refMasterId: formData?.ref_master_id_,
            });
            if (unique) {
              return Promise.reject();
            }
          } catch (error) {}
        },
      });
    }

    if (typeof subTableCustomValidateRules === 'function') {
      RuleProps.push(
        ...subTableCustomValidateRules({ field, type, uniqueConstraintType, formData }),
      );
    }
    if (Array.isArray(validateRules)) {
      const vdata = validateRules.find((i) => i.field === field);
      if (vdata) {
        RuleProps.push({
          trigger: getTriggerBycom(type),
          async validator(_, fieldValue) {
            return Event!.runExportByName(
              vdata.jsName,
              fieldValue,
              { ...formData },
              vdata.extParams || undefined,
            );
          },
        });
      }
    }

    return RuleProps;
  });
  return { rules };
}
const bulrCom = [
  FormComponents.Input,
  FormComponents.InputDouble,
  FormComponents.Inputmoney,
  FormComponents.Inputnumber,
  FormComponents.Textarea,
  FormComponents.Inputnumber,
];
export function getTriggerBycom(type: FormComponents) {
  return bulrCom.includes(type) ? 'blur' : 'change';
}
function publicRulesforProps(arg: formRuleProps) {
  const RuleProps: Rule[] = [];
  const { widgetProps, type } = arg;
  const {
    maxlength,
    minlength,
    regSwitch,
    reg,
    regHint,
    required,
    label,
    minValue,
    maxValue,
    notAutoFix,
  } = widgetProps;
  if (notAutoFix) {
    if (minValue !== '' && minValue !== null && !isNaN(minValue)) {
      RuleProps.push({
        validator: (rule, value) => {
          const val = value;
          return new Promise((resolve, reject) => {
            if (Number(val) < Number(minValue)) {
              reject(t('sys.pageDesigner.validatorMinValue') + ' ' + minValue);
            } else {
              resolve();
            }
          });
        },
        message: t('sys.pageDesigner.validatorMinValue') + ' ' + minValue,
        trigger: 'change',
      });
    }
    if (maxValue !== '' && maxValue !== null && !isNaN(maxValue)) {
      RuleProps.push({
        validator: (rule, value) => {
          const val = value;
          return new Promise((resolve, reject) => {
            if (Number(val) > Number(maxValue)) {
              reject(t('sys.pageDesigner.validatorMaxValue') + maxValue);
            } else {
              resolve();
            }
          });
        },
        message: t('sys.pageDesigner.validatorMaxValue') + ' ' + maxValue,
        trigger: 'change',
      });
    }
  }

  if (required) {
    RuleProps.push(...FieldValidatorMap(arg));
  }

  if (maxlength) {
    RuleProps.push({
      max: maxlength,
      message: label + t('sys.pageDesigner.lengthNotGreaterThan') + maxlength,
    });
  }
  if (minlength) {
    RuleProps.push({
      min: minlength,
      message: label + t('sys.pageDesigner.lengthNotLessThan') + minlength,
    });
  }
  if (regSwitch && reg) {
    RuleProps.push({
      pattern: new RegExp(reg),
      message: regHint ?? t('sys.regError'),
    });
  }
  return RuleProps;
}
