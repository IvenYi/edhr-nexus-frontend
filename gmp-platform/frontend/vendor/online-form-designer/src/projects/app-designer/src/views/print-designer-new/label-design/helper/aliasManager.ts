/**
 * 用于管理当前项目所有组件的alias，每当创建一个新的组件后，其默认alias应为{nameIndex}这种形式
 */
const aliasManager = {
  add: function (item) {
    let rt = '';
    if (!this.hasOwnProperty(item.type) || item.type.length === 0) {
      this[item.type] = [];
      this[item.type].push({
        id: item.id,
        alias: item.displayName + '1',
      });
      rt = item.displayName + '1';
    } else {
      let num = 0;
      for (let i = this[item.type].length - 1; i >= 0; i--) {
        if (this[item.type][i].alias.startsWith(item.displayName)) {
          num = parseInt(this[item.type][i].alias.substr(item.displayName.length));
          break;
        }
      }
      this[item.type].push({
        id: item.id,
        alias: item.displayName + (num + 1),
      });
      rt = item.displayName + (num + 1);
    }
    return rt;
  },
  set: function (item) {
    if (!this[item.type]) {
      this[item.type] = [];
    }
    this[item.type].push({
      id: item.id,
      alias: item.alias,
    });
  },
  update: function (item) {
    this[item.type].map((ele) => {
      if (ele.id === item.id) {
        ele.alias = item.type;
      }
      return ele;
    });
  },
  remove: function (item) {
    if (this[item.type]) {
      const index = this[item.type].findIndex((ele) => ele.id === item.id);
      aliasManager[item.type].splice(index, 1);
    }
  },
  reset: function () {
    for (const prop in this) {
      if (['add', 'update', 'remove', 'reset'].indexOf(prop) === -1) {
        delete this[prop];
      }
    }
  },
};

export default aliasManager;
