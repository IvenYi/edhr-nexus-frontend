import { reactive, ref,computed } from 'vue';
import { COLUMNS_TYPE } from '/@page-designer/enum';

export function UseDragByLine(startValue: number, rowType: COLUMNS_TYPE,config={}) {
  const minValue=config.minValue||10
  const startMove = ref(startValue);
  const dragData = reactive({
    offset: 'offsetWidth',
    client: 'clientX',
    clientMove: 0,
    rowType,
    offsetWidth:2000
  });
  function moveDomDown(event, el, onMouseUp?: () => void) {
    dragData.offsetWidth = el[dragData.offset];
    dragData.clientMove = event[dragData.client];
    event.preventDefault();
    document.onmousemove = (e) => {
      moveHandle(e[dragData.client]);
    };
    document.onmouseup = (e) => {
      document.onmouseup = null;
      document.onmousemove = null;
      onMouseUp && onMouseUp();
    };
  }

  function moveMobileDomDown(event, el, onTouchEnd?: () => void) {
    dragData.offsetWidth = el[dragData.offset];
    dragData.clientMove = event.touches[0][dragData.client];
    event.preventDefault();
    document.ontouchmove = (e) => {
      moveHandle(e.touches[0][dragData.client]);
    };
    document.ontouchend = (e) => {
      document.ontouchend = null;
      document.ontouchmove = null;
      onTouchEnd && onTouchEnd();
    };
  }

  function moveHandle(clientX) {
    const computedX = clientX - dragData.clientMove;
    let changeWidth = transformWidth(startMove.value) + computedX;

    startMove.value = transformWidth(changeWidth);
    dragData.clientMove = clientX;
  }
  function transformWidth(width) {
    if (dragData.rowType === 'right' || dragData.rowType === 'bottom') {
      return dragData.offsetWidth - width;
    } else {
      return width;
    }
  }
  const start=computed({
    get(){
      if (startMove.value < minValue) {
        return minValue;
      }
      if (startMove.value > dragData.offsetWidth - minValue) {
        return dragData.offsetWidth - minValue;
      }
      return startMove.value
    },
    set(v){
      startMove.value=v
    }
  })
  return { moveDomDown, moveMobileDomDown, start };
}
