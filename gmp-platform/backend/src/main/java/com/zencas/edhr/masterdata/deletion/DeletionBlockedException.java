package com.zencas.edhr.masterdata.deletion;

public class DeletionBlockedException extends RuntimeException {
    private final DeletionImpact impact;

    public DeletionBlockedException(DeletionImpact impact) {
        super("当前数据存在关联，暂不能删除，请先查看并处理关联关系");
        this.impact = impact;
    }

    public DeletionImpact getImpact() { return impact; }
}
