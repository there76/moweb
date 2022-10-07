package com.hmsec.common.file.service;

import com.hmsec.common.error.exception.FileOperationException;
import com.hmsec.common.file.model.AttachDivCd;
import com.hmsec.common.file.model.AttachFile;
import com.hmsec.common.file.model.FileSystemScheme;
import com.hmsec.utils.DateTimeUtils;
import com.hmsec.utils.FileSystemUtils;
import com.hmsec.utils.IDGenerator;
import com.github.vfss3.operations.Acl;
import com.github.vfss3.operations.IAclGetter;
import com.github.vfss3.operations.IAclSetter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.impl.StandardFileSystemManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FileService {

    @Value("${apps.upload.publicUrl}")
    private String publicUrl;

    @Value("${apps.upload.root}")
    private String uploadRoot;

    @Value("${apps.upload.allowedUploadExtensions:}")
    private String allowedUploadExtensions;

    private final FileRepository fileRepository;

    private FileSystemScheme scheme;

    // for StandardFileSystemManager
    private String uploadRootURI;

    private String tempDir;

    @PostConstruct
    public void init() throws IOException {

        this.tempDir = System.getProperty("java.io.tmpdir");

        if (StringUtils.isEmpty(this.tempDir)) {
            Path temp = Files.createTempFile("", ".tmp");
            this.tempDir = temp.getParent().toFile().getAbsolutePath();
            temp.toFile().delete();
        }

        StandardFileSystemManager fileSystemManager = new StandardFileSystemManager();
        FileObject uploadRootFileObject = null;
        try {
            fileSystemManager.init();

            String uploadRootUri = uploadRoot;
            if (!StringUtils.isEmpty(publicUrl)) {
                uploadRootUri += publicUrl;
            }

            uploadRootFileObject = fileSystemManager.resolveFile(uploadRootUri, FileSystemUtils.getFileSystemOptions(uploadRootUri));
            if (!uploadRootFileObject.exists()) {
                uploadRootFileObject.createFolder();
            }

            this.scheme = FileSystemUtils.getFileSystemScheme(uploadRootUri);

            if (this.scheme == FileSystemScheme.S3) {
                this.uploadRootURI = uploadRootUri;
            } else {
                this.uploadRootURI = uploadRootFileObject.getName().getURI();
            }


        } finally {
            if (uploadRootFileObject != null) {
                uploadRootFileObject.close();
            }
            fileSystemManager.close();
        }
    }

    public String getFilePath() {
        String yyyyMM = DateTimeUtils.getFormatted(LocalDateTime.now(), "yyyyMM");
        return this.getPublicUrl() + "/" + yyyyMM;
    }

    public String getExtension(final String filename) {
        if (filename == null) {
            return "";
        }
        final int index = filename.lastIndexOf('.');
        if (index == -1) {
            return "";
        } else {
            return filename.substring(index + 1).toLowerCase();
        }
    }


    public Path newTempPath(String tempName) {
        return Paths.get(this.tempDir, tempName + ".tmp");
    }

    public Path newTempPath() {
        return this.newTempPath(IDGenerator.getUUID());
    }

    public String getPublicUrl() {
        return this.publicUrl;
    }

    public FileSystemScheme getFileSystemScheme() {
        return this.scheme;
    }

    public String getUploadRoot() {
        return uploadRoot;
    }

    @Transactional(readOnly = true)
    public List<AttachFile> findFiles(AttachDivCd attachDivCd, String dataNo) {
        return fileRepository.findFiles(attachDivCd, dataNo);
    }

    @Transactional(readOnly = true)
    public AttachFile findOne(String fileKey) {
        return fileRepository.findOne(fileKey);
    }

    public File getFile(AttachFile attachFile) {
        if (attachFile == null) {
            throw new FileOperationException("해당 파일은 존재 하지 않습니다.");
        }

        String baseName = FilenameUtils.getBaseName(attachFile.getFileNm());
        Path existPath = Paths.get(this.tempDir, baseName + ".tmp");
        if (Files.exists(existPath)) {
            return existPath.toFile();
        }

        Path tempPath;
        try {
            tempPath = this.newTempPath(baseName);
            try (OutputStream os = Files.newOutputStream(tempPath)) {
                FileSystemUtils.write(attachFile, os);
            }
        } catch (IOException e) {
            log.error("getFile exception!!", e);
            throw new FileOperationException("해당 파일을 찾을수 없습니다.");
        }

        return tempPath.toFile();
    }

    public Resource getResource(String path) {
        return new DefaultResourceLoader().getResource(uploadRoot + path);
    }

    public int save(AttachDivCd attachDivCd, String dataNo, List<AttachFile> attachFileList, boolean isInTempDirectory) {
        attachFileList.forEach((attachFile) -> {
            attachFile.setDataNo(dataNo);
            attachFile.setAttachDivCd(attachDivCd);
        });

        return save(attachFileList, isInTempDirectory);
    }

    public int delete(List<AttachFile> attachFileList) {

        if (attachFileList == null) {
            return 0;
        }

        attachFileList.forEach(attachFile -> attachFile.setWorkType("DELETE"));

        return this.save(attachFileList, false);
    }

    public int delete(AttachDivCd attachDivCd, String dataNo) {
        List<AttachFile> attachFileList = this.findFiles(attachDivCd, dataNo);

        if (attachFileList.size() == 0) {
            return 0;
        }

        int affected = fileRepository.delete(attachFileList.stream().map(AttachFile::getFileKey).collect(Collectors.toList()));
        this.doDeleteFile(attachFileList);

        return affected;
    }

    public int update(List<AttachFile> attachFiles) {
        return fileRepository.update(attachFiles);
    }

    public int save(List<AttachFile> attachFileList, boolean isInTempDirectory) {
        int affected = 0;
        List<AttachFile> insertFileList = new ArrayList<>();
        List<AttachFile> deleteFileList = new ArrayList<>();
        List<AttachFile> updateFileList = new ArrayList<>();

        attachFileList.forEach(attachFile -> {
            if ("INSERT".equals(attachFile.getWorkType())) {
                String fileName;
                if (StringUtils.hasLength(attachFile.getFileNm())) {
                    fileName = FilenameUtils.getBaseName(attachFile.getFileNm()) + "." + attachFile.getExtNm();
                } else {
                    fileName = IDGenerator.getUUID() + "." + attachFile.getExtNm();
                }

                String filePath = attachFile.getFilePath();
                Path source = null;
                if (isInTempDirectory) {
                    source = Paths.get(tempDir, attachFile.getFileNm());
                    try {
                        this.doAttachFile(attachFile, fileName, source);
                    } catch (IOException e) {
                        throw new FileOperationException(source + " Files move fail.", e);
                    }

                } else {
                    fileName = attachFile.getFileNm();
                    try {
                        getResource(filePath + "/" + fileName).getFile();
                    } catch (IOException e) {
                        throw new FileOperationException(filePath + "/" + fileName + " not exist.", e);
                    }
                }

                LocalDateTime lastModified = LocalDateTime.now();

                attachFile.setFileNm(fileName);
                attachFile.setRegDt(lastModified);
                attachFile.setUpdDt(lastModified);

                insertFileList.add(attachFile);
            } else if ("DELETE".equals(attachFile.getWorkType())) {
                deleteFileList.add(attachFile);
            } else if ("COPY".equals(attachFile.getWorkType())) {
                insertFileList.add(attachFile);
            } else if ("UPDATE".equals(attachFile.getWorkType())) {
                updateFileList.add(attachFile);
            }
        });

        if (insertFileList.size() > 0) {
            affected += fileRepository.insert(insertFileList);
        }

        if (deleteFileList.size() > 0) {
            affected += fileRepository.delete(deleteFileList.stream().map(AttachFile::getFileKey).collect(Collectors.toList()));
            List<String> notDeletableFileFullPathList = fileRepository.findNotDeletableFileFullPathList(deleteFileList.stream().map(attachFile -> attachFile.getFilePath() + "/" + attachFile.getFileNm()).collect(Collectors.toList()));
            this.doDeleteFile(deleteFileList.stream().filter(attachFile
                    -> !notDeletableFileFullPathList.contains(attachFile.getFilePath() + "/" + attachFile.getFileNm())).collect(Collectors.toList()));
        }


        if (updateFileList.size() > 0) {
            updateFileList.forEach(e -> e.setUpdDt(LocalDateTime.now()));
            fileRepository.update(updateFileList);
        }

        return affected;
    }

    public String getTempDir() {
        return this.tempDir;
    }

    private void doDeleteFile(List<AttachFile> attachFiles) {

        if (attachFiles.size() == 0) {
            return;
        }

        StandardFileSystemManager fileSystemManager = new StandardFileSystemManager();
        try {
            fileSystemManager.init();

            for (AttachFile attachFile : attachFiles) {

                String path = attachFile.getFilePath();

                if (path.startsWith("/")) {
                    path = path.substring(1);
                }

                String name = attachFile.getFileNm();

                FileObject fileObject = null;
                try {
                    fileObject = fileSystemManager
                            .resolveFile(this.uploadRoot, FileSystemUtils.getFileSystemOptions(this.uploadRoot))
                            .resolveFile(path)
                            .resolveFile(name);

                    if (fileObject.exists()) {
                        fileObject.delete();
                        log.debug("{}/{} deleted.", path, name);
                    } else {
                        log.warn("{}/{} is not exist", path, name);
                    }
                } catch (IOException e) {
                    log.debug("delete fail {}/{}", path, name, e);
                } finally {
                    if (fileObject != null) {
                        fileObject.close();
                    }
                }
            }


        } catch (FileSystemException e) {
            log.error("fileSystemManager init fail. exception", e);
        } finally {
            fileSystemManager.close();
        }


    }

    public void doAttachFile(AttachFile attachFile, String newName, Path path) throws IOException {
        StandardFileSystemManager fileSystemManager = new StandardFileSystemManager();
        FileObject targetFileObject = null;
        FileObject uploadFileObject = null;
        File targetFile = path.toFile();
        try {
            fileSystemManager.init();

            targetFileObject = fileSystemManager.toFileObject(targetFile);

            uploadFileObject = fileSystemManager.resolveFile(this.uploadRootURI,
                    FileSystemUtils.getFileSystemOptions(this.uploadRootURI))
                    .resolveFile(attachFile.getFilePath()).resolveFile(newName);

            System.out.println( "targetFileObject.getPublicURIString() : " + targetFileObject.getPublicURIString());
            System.out.println( "this.uploadRootURI : " + this.uploadRootURI);
            System.out.println( "attachFile.getFilePath() : " + attachFile.getFilePath());
            System.out.println( "newName : " + newName);
            System.out.println( "uploadFileObject : " + uploadFileObject.getPublicURIString());

            if (!uploadFileObject.exists()) {
                uploadFileObject.createFolder();
            }

            String lowerCaseName = newName.toLowerCase();

            if (lowerCaseName.endsWith(".jpg") || lowerCaseName.endsWith(".png") || lowerCaseName.endsWith(".jpeg")
                    || lowerCaseName.endsWith(".png") || lowerCaseName.endsWith(".gif")) {

                try {
                    BufferedImage bimg = ImageIO.read(targetFile);
                    int width = bimg.getWidth();
                    int height = bimg.getHeight();
                    attachFile.setMeta("{\"width\": " + width + ", \"height\":" + height + "}");
                } catch (IOException ignore) {}

            }


            targetFileObject.moveTo(uploadFileObject);

            this.doAttachFileAfter(uploadFileObject);

            if (targetFileObject.exists()) {
                FileUtils.forceDelete(targetFile);
            }

        } catch (FileSystemException e) {
            throw new IOException(e);
        } finally {

            if (targetFileObject != null) {
                targetFileObject.close();
            }

            if (uploadFileObject != null) {
                uploadFileObject.close();
            }

            fileSystemManager.close();
        }
    }

    private void doAttachFileAfter(FileObject fileObject) throws FileSystemException {

        if (this.scheme == FileSystemScheme.S3) {
            // public access 변경
            IAclGetter aclGetter = (IAclGetter) fileObject.getFileOperations().getOperation(IAclGetter.class);
            aclGetter.process();
            Acl fileAcl = aclGetter.getAcl();
            IAclSetter aclSetter = (IAclSetter) fileObject.getFileOperations().getOperation(IAclSetter.class);
            fileAcl.allow(Acl.Group.EVERYONE, Acl.Permission.READ);
            aclSetter.setAcl(fileAcl);
            aclSetter.process();
        } else {
            // ... another scheme
        }

    }

    public int insert(List<AttachFile> attachFileList) {
        return fileRepository.insert(attachFileList);
    }

}
