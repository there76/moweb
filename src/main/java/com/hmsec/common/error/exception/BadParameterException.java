package com.hmsec.common.error.exception;


import com.hmsec.common.error.BusinessException;
import com.hmsec.common.error.ErrorCode;

public class BadParameterException extends BusinessException {
    public BadParameterException(String message) {
        super(message, ErrorCode.INVALID_INPUT_VALUE);
    }
}
