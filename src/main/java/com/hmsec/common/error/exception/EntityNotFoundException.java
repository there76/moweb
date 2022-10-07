package com.hmsec.common.error.exception;


import com.hmsec.common.error.BusinessException;
import com.hmsec.common.error.ErrorCode;

public class EntityNotFoundException extends BusinessException {
    public EntityNotFoundException(String message) {
        super(message, ErrorCode.ENTITY_NOT_FOUND);
    }
}
