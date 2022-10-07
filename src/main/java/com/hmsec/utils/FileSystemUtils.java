package com.hmsec.utils;

import com.hmsec.common.file.model.AttachFile;
import com.hmsec.common.file.model.FileSystemScheme;
import com.hmsec.common.file.service.FileService;
import org.apache.commons.io.IOUtils;
import org.apache.commons.vfs2.FileContent;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemOptions;
import org.apache.commons.vfs2.impl.StandardFileSystemManager;
import org.apache.commons.vfs2.provider.ftp.FtpFileSystemConfigBuilder;
import org.apache.commons.vfs2.provider.sftp.SftpFileSystemConfigBuilder;

import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;

public class FileSystemUtils {

    public static void write(AttachFile attachFile, OutputStream outputStream) throws IOException {

        FileService fileService = ContextUtils.getBean(FileService.class);

        String uploadRoot = fileService.getUploadRoot();

        StandardFileSystemManager fileSystemManager = new StandardFileSystemManager();
        FileObject fileObject = null;

        try {

            fileSystemManager.init();

            String filePath = attachFile.getFilePath();
            if (filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }

            fileObject = fileSystemManager
                    .resolveFile(uploadRoot, FileSystemUtils.getFileSystemOptions(uploadRoot))
                    .resolveFile(filePath)
                    .resolveFile(attachFile.getFileNm());

            if (fileObject.exists()) {
                FileContent fileContent = fileObject.getContent();
                IOUtils.copy(fileContent.getInputStream(), outputStream);
            } else {
                throw new FileSystemException("fileObject not Found [" + attachFile.getFilePath() + "/" + attachFile.getFileNm() + "]");
            }

        } finally {
            try {
                if (fileObject != null) {
                    fileObject.close();
                }
            } catch (FileSystemException e) {
                e.printStackTrace();
            }

            fileSystemManager.close();
        }
    }

    public static FileSystemScheme getFileSystemScheme(String url) {
        FileSystemScheme scheme = null;

        if (url.startsWith("s3://")) {
            scheme = FileSystemScheme.S3;
        } else if (url.startsWith("sftp://")) {
            scheme = FileSystemScheme.SFTP;
        } else if (url.startsWith("ftp://")) {
            scheme = FileSystemScheme.FTP;
        } else if (url.startsWith("file://")) {
            scheme = FileSystemScheme.FILE;
        }

        if(scheme == null) {
            try {
                scheme = FileSystemScheme.fromString(new URL(url).toURI().getScheme());
            } catch (URISyntaxException | MalformedURLException e) {
                e.printStackTrace();
            }
        }

        return scheme;
    }

    public static FileSystemOptions getFileSystemOptions(String uploadRootURI) {
        FileSystemOptions fileSystemOptions = new FileSystemOptions();
        FileSystemScheme scheme = FileSystemUtils.getFileSystemScheme(uploadRootURI);
        try {
            boolean userDirIsRoot = false;

            if (scheme == FileSystemScheme.SFTP) {
                SftpFileSystemConfigBuilder.getInstance().setStrictHostKeyChecking(fileSystemOptions, "no");
                SftpFileSystemConfigBuilder.getInstance().setUserDirIsRoot(fileSystemOptions, userDirIsRoot);
            }else if (scheme == FileSystemScheme.FTP) {
                FtpFileSystemConfigBuilder.getInstance().setUserDirIsRoot(fileSystemOptions, userDirIsRoot);
            }

        } catch (FileSystemException e) {
            e.printStackTrace();
        }

        return fileSystemOptions;
    }
}
