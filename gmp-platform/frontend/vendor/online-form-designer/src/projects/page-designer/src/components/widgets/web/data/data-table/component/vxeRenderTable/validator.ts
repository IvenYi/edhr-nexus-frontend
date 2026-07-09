import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
export function getRules(fieldWidget) {
  const RuleProps: any = [];
  const { required, maxlength, minlength, regSwitch, reg, label, fieldName, regHint } =
    fieldWidget.props;
  const labelName = label || fieldName;
  if (required) {
    RuleProps.push({
      required: true,
      message: labelName + t('sys.pageDesigner.cannotBeEmpty'),
    });
  }
  if (maxlength) {
    RuleProps.push({
      max: maxlength,
      message: labelName + t('sys.pageDesigner.lengthNotGreaterThan') + maxlength,
    });
  }
  if (minlength) {
    RuleProps.push({
      min: minlength,
      message: labelName + t('sys.pageDesigner.lengthNotLessThan') + minlength,
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
