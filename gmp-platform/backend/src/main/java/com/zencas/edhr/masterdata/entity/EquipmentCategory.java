package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "equipment_category")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentCategory {
    @Id private Long id;
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default private String tenantId = "default";
    @Column(nullable = false, length = 128) private String name;
    @Column(name = "system_category", nullable = false) private boolean system;
    @Column(name = "sort_order", nullable = false) private int sortOrder;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
}
