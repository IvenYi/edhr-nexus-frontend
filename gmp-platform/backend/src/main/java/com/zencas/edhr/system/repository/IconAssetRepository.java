package com.zencas.edhr.system.repository;

import com.zencas.edhr.system.entity.IconAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IconAssetRepository extends JpaRepository<IconAsset, Long>, JpaSpecificationExecutor<IconAsset> {
    boolean existsByGroupId(Long groupId);

    boolean existsByFileId(Long fileId);

    List<IconAsset> findByGroupIdOrderBySortOrderAscCreatedAtAsc(Long groupId);

    @Query("select new com.zencas.edhr.system.repository.IconAssetRepository$GroupIconCount(i.groupId, count(i)) "
            + "from IconAsset i where i.groupId in :groupIds group by i.groupId")
    List<GroupIconCount> countByGroupIdIn(List<Long> groupIds);

    record GroupIconCount(Long groupId, long iconCount) {
    }
}
