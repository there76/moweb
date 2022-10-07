package com.hmsec.common.error.exception;

public class FileOperationException extends RuntimeException {
    public FileOperationException(String message) {
        super(message);
    }

    public FileOperationException(String message, Throwable e) {
        super(message, e);
    }
}
