/**
 * 按钮组件属性显隐控制判断
 */
export function hiddenButtonProps(widget) {
  if (Object.prototype.hasOwnProperty.call(widget.props, 'model')) {
    return !widget.props.model;
  }
  if (Object.prototype.hasOwnProperty.call(widget.props, 'refForm')) {
    return !widget.props.refForm;
  }
  return false;
}
