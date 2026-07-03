import { debounce } from "lodash-es";

// 创建 Tooltip 元素
let tooltip: Nullable<HTMLDivElement|any> = null;

const hideTooltip = debounce(() => {
  if(!tooltip) return;

  tooltip = null;
  const toolTipList = document.querySelectorAll('.workflow-nodes__name--tooltip');
  if(toolTipList && toolTipList.length) {
    toolTipList.forEach(el => el?.remove());
  }
}, 200);

const bindTooltip = debounce((node, e) => {
  if(e && e.target?.tagName !== 'tspan') return;

  tooltip = document.createElement('div');
  tooltip.className = 'workflow-nodes__name--tooltip';
  document.body.appendChild(tooltip);
  const { top, left, width: targetWidth } = e.target?.getBoundingClientRect();
  tooltip.textContent = node?.attrs?.label?.text || node?.attrs?.text?.text || node?.attrs?.label;
  const { height, width } = tooltip?.getBoundingClientRect();
  tooltip.style.left = `${left - (width / 2 - targetWidth / 2)}px`;
  tooltip.style.top = `${top - height - 8}px`;
}, 200)

export {
  hideTooltip,
  bindTooltip
}
