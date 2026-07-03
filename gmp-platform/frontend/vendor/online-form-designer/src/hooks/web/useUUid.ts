import { unref, computed } from 'vue';
import type { Ref } from 'vue';

interface IRandomUUidOpts {
  /** 是否需要拼接前缀（默认不需要） */
  needPrefix?: boolean;
  /** 随机串只能是字符串 */
  isString?: boolean;
  /** 前缀，默认前缀u_ */
  prefix?: string;
  /** 即将生成的uuid位数（不包含前缀, 默认8位） */
  length?: number;
  /** 类型 */
  chars?: string;
  /** 是否数字打头 */
  numPref?: boolean;
}

/**
 * 生成随机串
 * @param uuids 不可用的uuid
 * @param opts
 * @param opts.needPrefix 是否需要拼接前缀（默认不需要）
 * @param opts.isString 随机串只能是字符串
 * @param opts.prefix 前缀，默认前缀u_
 * @param opts.length 即将生成的uuid位数（不包含前缀, 默认8位）
 * @param opts.chars 类型
 * @param opts.numPref 数字打头
 */
export const randomUUID = (uuids: string[] = [], opts?: IRandomUUidOpts): string => {
  const {
    needPrefix = false,
    isString = true,
    prefix = 'u_',
    length = 8,
    chars = '',
    numPref = false,
  } = opts || {};
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // 大写字母和数字
  if (chars === 'capital&number') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  } else if (chars === 'lowercase&number') {
    // 小写字母和数字
    characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  } else if (chars === 'lowercase') {
    // 小写字母
    characters = 'abcdefghijklmnopqrstuvwxyz';
  }
  let uuid;
  while (!uuid) {
    let id = '';
    if (isString) {
      if (numPref) {
        id += Math.floor(Math.random() * 9) + 1;
      }
      for (let i = 0; i < length; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } else {
      id = `${needPrefix ? prefix : ''}${
        numPref ? Math.floor(Math.random() * 9) + 1 : ''
      }${Math.random().toString(36).substr(2, length)}`;
    }
    if (!uuids.includes(id)) {
      uuid = id;
    }
  }
  return uuid;
};

/**
 * uuid生成器
 * @param uuids 已有uuid
 */
randomUUID.Generate = (uuids?: string[], opts?: IRandomUUidOpts) => {
  const cloneUUids = Array.isArray(uuids) ? uuids.concat() : [];

  return {
    next: () => {
      const id = randomUUID(cloneUUids, opts);
      cloneUUids.push(id);
      return id;
    },
  };
};

export function useUUid(
  tableData: Ref<Recordable[]>,
  keyAttr: Ref<String>,
  opts?: IRandomUUidOpts,
) {
  const f_children = 'children';
  const f_key = 'key';

  const flatTableData = computed(() => {
    return unref(tableData).reduce((list, item) => {
      list.push(item);
      const nodes = item[f_children].map((ele) => {
        return {
          ...ele,
          _pid_: item.id,
        };
      });
      list.push(...nodes);
      return list;
    }, []);
  });

  const oldUUids = computed(() => {
    return unref(flatTableData)
      .map((data) => {
        if (data._pid_) {
          return data[f_key].replace(new RegExp(`^${unref(keyAttr)}_*`), '');
        }
        return null;
      })
      .filter((i) => i);
  });

  function getUuid(uuidsProp?: string[], optsProp?: IRandomUUidOpts) {
    return randomUUID([...unref(oldUUids), ...(uuidsProp ?? [])], { ...opts, ...optsProp });
  }

  function getUuidGenerate(uuidsProp?: string[], optsProp?: IRandomUUidOpts) {
    return randomUUID.Generate([...unref(oldUUids), ...(uuidsProp ?? [])], {
      ...opts,
      ...optsProp,
    });
  }

  return {
    oldUUids,
    flatTableData,
    getUuid,
    getUuidGenerate,
  };
}
