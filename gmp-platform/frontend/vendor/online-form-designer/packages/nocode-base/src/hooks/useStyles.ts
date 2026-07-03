import { computed } from 'vue';

export function useStyles(widget, isArea = false) {
  const otherClass = computed(() => {
    if (!widget.style) {
      return;
    }
    const cls: string[] = [];
    if (widget.style['textAlign']) {
      if (widget.style['textAlign'] === 'center') {
        cls.push('m-justify-center');
      }
      if (widget.style['textAlign'] === 'left') {
        cls.push('m-justify-start');
      }
      if (widget.style['textAlign'] === 'right') {
        cls.push('m-justify-end');
      }
    } else {
      cls.push('m-justify-start');
    }

    if (widget.style['verticalAlign']) {
      if (widget.style['verticalAlign'] === 'middle') {
        cls.push(isArea ? 'm-content-center' : 'm-items-center');
      }
      if (widget.style['verticalAlign'] === 'top') {
        cls.push(isArea ? 'm-content-start' : 'm-items-start');
      }
      if (widget.style['verticalAlign'] === 'bottom') {
        cls.push(isArea ? 'm-content-end' : 'm-items-end');
      }
    } else {
      cls.push(isArea ? 'm-content-start' : 'm-items-start');
    }

    return cls;
  });

  return { otherClass };
}
