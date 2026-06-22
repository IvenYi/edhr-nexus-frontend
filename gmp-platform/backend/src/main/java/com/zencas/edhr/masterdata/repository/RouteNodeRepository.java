package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.RouteNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteNodeRepository extends JpaRepository<RouteNode, Long>, JpaSpecificationExecutor<RouteNode> {
    List<RouteNode> findByRouteVersionIdOrderBySortOrderAsc(Long routeVersionId);

    void deleteByRouteVersionId(Long routeVersionId);
}
