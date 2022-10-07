package com.hmsec.common.file.model;


import org.springframework.util.StringUtils;

public enum AttachDivCd {

    PRDT_TP01("상품-확대이미지"),
    PRDT_TP02("상품-작은이미지"),
    PRDT_TP03("상품-추가이미지"),
    PRDT_TP04("상품-다른색상이미지"),
    PRDT_TP05("상품-아웃이미지"),

    CERTIFICATE_THUMBNAIL("인증서-썸네일"),
    CERTIFICATE("인증서"),
    POPUP("팝업이미지"),
    CATALOGUE_THUMBNAIL("카탈로그-썸네일"),
    CATALOGUE("카탈로그"),

    EDITOR("에디터이미지"),
    ETC("ETC")
    ;

    private String cdNm;

    AttachDivCd(String cdNm) {
        this.cdNm = cdNm;
    }

    public String getCdNm() {
        return cdNm;
    }

    public String getLabel() {
        return cdNm;
    }

    public static AttachDivCd fromString(String text) {

        if (!StringUtils.hasLength(text)) {
            return AttachDivCd.ETC;
        }
        for (AttachDivCd attachDivCd : AttachDivCd.values()) {
            if (attachDivCd.toString().equalsIgnoreCase(text)) {
                return attachDivCd;
            }
        }
        return AttachDivCd.ETC;
    }
}
