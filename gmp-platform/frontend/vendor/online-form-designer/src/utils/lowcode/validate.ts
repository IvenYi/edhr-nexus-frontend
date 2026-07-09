import { useI18n } from '/@/hooks/web/useI18n';
interface Validation {
  required?: boolean;
  reg?: string | RegExp;
  regHint?: string;
  validateFn?: Promise<any>;
}
interface Rule {
  required?: boolean;
  message?: string;
  validator?: Promise<any> | Function;
}
export function buildItemRules(validation: Validation) {
  const { t } = useI18n();
  const rules: Rule[] = [];
  if (!!validation.required) {
    rules.push({
      required: true,
      message: t('sys.notNull'),
    });
  }
  // 自定义正则校验
  if (!!validation.reg) {
    const { reg, regHint } = validation;
    const regExg = new RegExp(reg);
    const validator = (val) => regExg.test(val);
    rules.push({
      validator: validator,
      message: regHint ?? t('sys.regError'),
    });
  }
  const validateEvent = validation.validateFn;
  if (!!validateEvent) {
    rules.push({
      validator: validateEvent,
    });
  }
  return rules;
}
