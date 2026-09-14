package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "equipment")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipment {
    @Id private Long id;
    @Column(name = "equipment_type_id")
    private Long equipmentTypeId;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "brand", length = 128)
    private String brand;
    @Column(name = "model")
    private String model;
    @Column(name = "serial_number")
    private String serialNumber;
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;
    @Column(name = "site_id")
    private Long siteId;
    @Column(name = "status")
    @Builder.Default private String status = "ACTIVE";
    @Column(name = "created_by", length = 128) private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by", length = 128) private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
