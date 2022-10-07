package com.hmsec.common.file.model;


public enum FileSystemScheme {
    FILE, FTP, SFTP, S3(true);

    FileSystemScheme(boolean supportExternalUrl) {
        this.supportExternalUrl = supportExternalUrl;
    }

    FileSystemScheme() {
        this(false);
    }

    private boolean supportExternalUrl;

    public boolean isSupportExternalUrl() {
        return supportExternalUrl;
    }

    public static FileSystemScheme fromString(String text) {

        for (FileSystemScheme fileSystemScheme : FileSystemScheme.values()) {
            if (fileSystemScheme.toString().equalsIgnoreCase(text)) {
                return fileSystemScheme;
            }
        }
        return null;
    }
}
