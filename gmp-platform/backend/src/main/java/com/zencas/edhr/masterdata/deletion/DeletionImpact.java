package com.zencas.edhr.masterdata.deletion;

import java.util.List;

public record DeletionImpact(String kind, String targetName, String targetCode, List<Group> groups,
                             String targetType, String targetId, String targetModule) {
    public record Group(String key, String label, String module, String path, String guidance,
                        int count, boolean restricted, List<Item> records, String dataType) {}
    public record Item(String id, String name, String code, String version, String status, String context,
                       String path, String location, String navigationHint) {}
}
