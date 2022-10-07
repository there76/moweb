package com.hmsec.common;

public class SimpleResponseModel {
    private final int affected;
    private final String message;
    private final Object object;


    public SimpleResponseModel(int affected) {
        this(affected, "처리되었습니다.");
    }

    public SimpleResponseModel(int affected, String message) {
        this(affected, message, null);
    }

    public SimpleResponseModel(int affected, String message, Object object) {
        this.affected = affected;
        this.message = message;
        this.object = object;
    }

    public int getAffected() {
        return affected;
    }

    public String getMessage() {
        return message;
    }

    public Object getObject() {
        return object;
    }

    @Override
    public String toString() {
        return "SimpleResponseModel{" +
                "affected=" + affected +
                ", message='" + message + '\'' +
                ", response=" + object +
                '}';
    }
}
