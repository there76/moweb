package com.hmsec.common.error.exception;


import com.hmsec.common.error.BusinessException;
import com.hmsec.common.error.ErrorCode;

public class InvalidValueException extends BusinessException {
    public InvalidValueException(String value) {
        super(value, ErrorCode.INVALID_INPUT_VALUE);
    }

    public InvalidValueException(String value, ErrorCode errorCode) {
        super(value, errorCode);
    }
}
