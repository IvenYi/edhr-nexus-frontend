package com.zencas.edhr.masterdata.dto;

public record ProductFamilyMemberResponse(
        String membershipId,
        String productId,
        String productCode,
        String productName,
        String materialTypeName,
        String productFamilyId,
        String productFamilyName,
        boolean currentMember) {
}
