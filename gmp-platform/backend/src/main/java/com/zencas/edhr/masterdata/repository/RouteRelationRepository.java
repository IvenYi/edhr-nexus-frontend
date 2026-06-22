package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.RouteRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRelationRepository extends JpaRepository<RouteRelation, Long>, JpaSpecificationExecutor<RouteRelation> {
    List<RouteRelation> findByRouteVersionIdOrderByPriorityAsc(Long routeVersionId);

    void deleteByRouteVersionId(Long routeVersionId);
}
