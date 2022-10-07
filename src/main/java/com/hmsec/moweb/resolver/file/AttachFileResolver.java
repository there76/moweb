package com.hmsec.moweb.resolver.file;

import com.hmsec.common.error.exception.BadParameterException;
import com.hmsec.common.file.model.AttachDivCd;
import com.hmsec.common.file.model.AttachFile;
import com.hmsec.common.file.model.FileSystemScheme;
import com.hmsec.common.file.service.FileService;
import com.hmsec.utils.IDGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FilenameUtils;
import org.springframework.core.MethodParameter;
import org.springframework.lang.Nullable;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;

public class AttachFileResolver implements HandlerMethodArgumentResolver {

    private FileService fileService;

    @Nullable
    private final Set<String> allowedUploadExtensions;
    private final boolean isCheckAllowedUploadExtension;

    private FileSystemScheme scheme;

    private ObjectMapper objectMapper;

    public AttachFileResolver(FileService fileService, String uploadRoot, String publicUrl, Set<String> allowedUploadExtensions) {
        this.fileService = fileService;
        this.allowedUploadExtensions = allowedUploadExtensions;
        this.isCheckAllowedUploadExtension = this.allowedUploadExtensions != null && this.allowedUploadExtensions.size() > 0;
        this.objectMapper = new ObjectMapper();
    }


    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {

        return methodParameter.hasParameterAnnotation(AttachFiles.class);

    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer,
                                  NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {

        AttachFiles attachFileAnnotation = methodParameter.getParameterAnnotation(AttachFiles.class);
        if (attachFileAnnotation == null) {
            throw new IllegalArgumentException("There is no @AttachFiles Annotation.");
        }

        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) nativeWebRequest.getNativeRequest();

        String name = attachFileAnnotation.name();

        String attachDivCdParamName = attachFileAnnotation.attachDivCdParamName();
        String dscParamName = attachFileAnnotation.dscParamName();
        boolean isInsert = "INSERT".equals(attachFileAnnotation.workType());
        List<String> attachDivCdList = null;
        List<String> dscList = null;

        if (StringUtils.hasLength(attachDivCdParamName)) {
            MultipartFile multipartFile = multipartRequest.getFile(attachDivCdParamName);
            attachDivCdList = objectMapper.readValue(multipartFile.getBytes(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));

        }

        if (StringUtils.hasLength(dscParamName)) {
            MultipartFile multipartFile = multipartRequest.getFile(dscParamName);
            dscList = objectMapper.readValue(multipartFile.getBytes(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        }

        List<MultipartFile> multipartFiles = multipartRequest.getFiles(name);
        AttachFileList attachFiles = new AttachFileList();
        if (multipartFiles.size() > 0) {

            this.checkAllowedUploadExtension(multipartFiles);

            for (int i = 0; i < multipartFiles.size(); i++) {
                MultipartFile multipartFile = multipartFiles.get(i);
                if (isInsert) {

                    // 업로드
                    AttachFile attachFile = this.processAttachFile(multipartFile);
                    attachFile.setAttachDivCd(attachFileAnnotation.attachDivCd());

                    if (attachDivCdList != null) {
                        attachFile.setAttachDivCd(AttachDivCd.fromString(attachDivCdList.get(i)));
                    }

                    if (dscList != null) {
                        attachFile.setFileDsc(dscList.get(i));
                    }

                    attachFile.setWorkType("INSERT");
                    attachFiles.add(attachFile);

                } else {
                    // 삭제 | 수정
                    List<AttachFile> deleteAttachFiles = objectMapper.readValue(multipartFile.getBytes(),
                            objectMapper.getTypeFactory().constructCollectionType(List.class, AttachFile.class));

                    for (AttachFile deleteAttachFile : deleteAttachFiles) {
                        deleteAttachFile.setWorkType(attachFileAnnotation.workType());
                        attachFiles.add(deleteAttachFile);
                    }
                }
            }
        }
        return attachFiles;
    }

    private void checkAllowedUploadExtension(List<MultipartFile> multipartFiles) {
        if (this.allowedUploadExtensions == null || !this.isCheckAllowedUploadExtension) {
            return;
        }

        for (MultipartFile multipartFile : multipartFiles) {
            String originalFilename = multipartFile.getOriginalFilename();

            if ("blob".equals(originalFilename)) {
                continue;
            }

            String extension = FilenameUtils.getExtension(originalFilename);
            if (StringUtils.isEmpty(extension) || !this.allowedUploadExtensions.contains(extension.toLowerCase())) {
                throw new BadParameterException("not allowed File extension. [" + extension + "]");
            }
        }
    }

    private AttachFile processAttachFile(MultipartFile multipartFile) throws IOException {

        String originalFilename = multipartFile.getOriginalFilename();
        String extension = FilenameUtils.getExtension(originalFilename);
        String fileKey = IDGenerator.getUUID();


        AttachFile attachFile = new AttachFile();
        attachFile.setFileKey(fileKey);
        attachFile.setFilePath(fileService.getFilePath());
        attachFile.setFileSize(multipartFile.getSize());
        attachFile.setExtNm(extension);
        attachFile.setUserFileNm(originalFilename);

        Path tempPath = fileService.newTempPath();
        multipartFile.transferTo(tempPath);

        String tempFileName = tempPath.getFileName().toString();
        attachFile.setFileNm(tempFileName);

        return attachFile;

    }
}
