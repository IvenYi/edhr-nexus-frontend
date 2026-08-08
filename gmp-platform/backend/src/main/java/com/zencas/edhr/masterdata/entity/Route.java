package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity @Table(name = "route")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Route {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "code", length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "product_family_id")
    private String productFamilyId;
    @Column(name = "common_asset")
    @Builder.Default private Boolean commonAsset = true;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by")
    private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @Transient private Integer versionCount;
    @Transient private List<RouteVersion> versions;
    @PrePersist void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }
    @PreUpdate void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
