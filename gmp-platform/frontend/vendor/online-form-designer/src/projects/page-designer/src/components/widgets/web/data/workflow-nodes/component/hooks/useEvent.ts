import { IEmitEventData } from '../types';
import { debounce } from 'lodash-es';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { getProviderInstance } from '../utils/provider';

const providerIns = getProviderInstance();

type emitEventFn = (data: IEmitEventData) => void;
let emitEvent: emitEventFn | undefined = undefined;

let settingCallback: emitEventFn | undefined = undefined;

export function useEvent(_Event) {
  const Event = _Event || getPageEvent();

  function setEmitEvent(callback) {
    emitEvent = callback;
  }

  function setSettingCallback(callback) {
    settingCallback = callback;
  }

  function emitEventMulti(arr: IEmitEventData[]) {
    arr.forEach((data) => {
      emitEvent && emitEvent(data);
    });
  }

  function onClick(node) {
    if (!Event) return;

    Event.runEventByName(
      'onClick',
      providerIns?.widget?.events || {
        onClick: {
          name: 'onClick',
          extraParams: {},
        },
      },
      node,
    );
  }

  function onGraphMounted(graph) {
    if (!Event) return;

    Event.runEventByName(
      'onGraphMounted',
      providerIns?.widget?.events || {
        onGraphMounted: {
          name: 'onGraphMounted',
          extraParams: {},
        },
      },
      graph,
    );
  }

  const emitEventMultiDebounce = debounce(emitEventMulti, 300);

  return {
    emitEvent,
    emitEventMulti,
    emitEventMultiDebounce,
    setEmitEvent,
    settingCallback,
    setSettingCallback,
    onClick,
    onGraphMounted,
  };
}
