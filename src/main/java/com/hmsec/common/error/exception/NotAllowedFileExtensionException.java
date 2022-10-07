package com.hmsec.common.error.exception;

import org.springframework.web.multipart.MultipartException;

public class NotAllowedFileExtensionException extends MultipartException {
    public NotAllowedFileExtensionException(String message) {
        super(message);
    }
}
