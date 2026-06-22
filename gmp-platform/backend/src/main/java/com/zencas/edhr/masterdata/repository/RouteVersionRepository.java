package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.RouteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteVersionRepository extends JpaRepository<RouteVersion, Long>, JpaSpecificationExecutor<RouteVersion> {
    List<RouteVersion> findByRouteIdOrderByCreatedAtDesc(Long routeId);

    Optional<RouteVersion> findByRouteIdAndId(Long routeId, Long id);
}
