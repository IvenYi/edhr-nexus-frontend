# 列表边界最终独立QA：盘点与源码辅助

状态：FINAL。只读辅助，非独立功能验收总结果；未修改产品、测试、配置、知识或Git。

实际来源及契约读取提交为`8efb21f74dcc07050ccfbc3f516747ff2accab90`，目标`edhr-dev@cf0eb57c3553b5efee7a4cfee20a0ea0a50c0d34`，知识0.3.25，工作树始终干净。

## 实际核对

- 自行运行`build-branch-review-inventory.py`重建固定cf0的coverage、entrypoints、migrations和summary四文件，逐字节及SHA256均与提交原件一致。3961跟踪路径、130迁移，所有覆盖行仍为pending/inventory-only；不是语义审查通过。
- 使用Git NUL分隔路径枚举，实际路径集合与覆盖CSV逐项相等，含六个非ASCII路径。原交付8ec3c3a1与cf0整树相同；候选没有知识、架构、契约或DESIGN变更。
- 四产品路径/有限方法记录的基线blob和当前源码SHA全部匹配；14条只读辅助记录的基线blob/SHA全部匹配。两组记录有交叉，不加总为18个整文件完成。
- 本体八个产品/相邻源码摘要与候选相同；13条知识ID原记录的规范JSON摘要吻合，另两条是UI契约节，不冒充额外知识ID。19份安全归档原件均与receipt SHA匹配。
- 候选实际仅四前端产品文件及一个浏览器脚本，后端、删除资格/预检/确认、权限、审计和版本/快照写路径无改动。

## 有限源码判断

亲读新hook、字典fallback选择/selectedItemPage/queryKey和请求页参数/显示页、四个消费的success/fetch/placeholder资格，以及原DELETE处理。hook只管理一基已知页界；undefined总页数不作边界依据，等待/失败/占位不触发；不迁移零基共享分页、不发送写请求。字典在自动选择尚未同步时立即以新父项第一页作为查询及显示页，selection effect随后同步保存状态；无父项也显示第一页。当前改动未见新增可复现缺陷。

该源码判断不代替父QA实际浏览器及后端运行。其他pageKey variant、ModelTab/菜单选择器真实刷新路径、性能候选和原用户暂缓继续保留，不能外推全文件、本体或分支完成。

## 辅助工具纠正与清理

辅助校验首轮使用未加`-z`的Git路径输出，六个中文路径被Git引号转义，集合比对出现假红；四份重建文件当时已经逐字节相同。首轮JSON原样保留为`/tmp/edhr-list-qa-inventory-source-initial-path-decoding.json`，随后改用NUL分隔路径重新执行原集合断言，结果一致，没有修改被测源码、测试或清单。

自建临时目录`/tmp/edhr-list-qa-inventory-rebuild-source-8efb21f7`已按确切路径移除。详细10项辅助核对和原件摘要见`/tmp/edhr-list-qa-inventory-source.json`。
