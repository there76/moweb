package com.hmsec.common.file.web;

import com.hmsec.common.file.model.AttachDivCd;
import com.hmsec.common.file.model.AttachFile;
import com.hmsec.common.file.service.FileService;
import com.hmsec.modules.base.users.model.AppManager;
import com.hmsec.utils.FileSystemUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@RequiredArgsConstructor
@Slf4j
@RequestMapping(value = "${apps.api-request-mapping}", produces = MediaType.APPLICATION_JSON_VALUE)
@RestController
public class FileRestController {
    private final FileService fileService;

    @GetMapping("/base/files")
    public ResponseEntity<?> getFiles(AttachDivCd attachDivCd, String dataNo) {
        List<AttachFile> attachFile = fileService.findFiles(attachDivCd, dataNo);
        return ResponseEntity.ok(attachFile);
    }

    @GetMapping("/base/files/{fileKey}")
    public ResponseEntity<?> getFile(@PathVariable String fileKey) {
        AttachFile attachFile = fileService.findOne(fileKey);
        return ResponseEntity.ok(attachFile);
    }

    @GetMapping("/base/files/{fileKey}/download")
    public ResponseEntity<StreamingResponseBody> download(HttpServletRequest req, @PathVariable String fileKey) {

        AttachFile attachFile = fileService.findOne(fileKey);
        StreamingResponseBody responseBody = outputStream -> FileSystemUtils.write(attachFile, outputStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + getEncodedFileName(req, attachFile.getUserFileNm()))
                .contentLength(attachFile.getFileSize())
                .body(responseBody);
    }

    @PostMapping("/base/files")
    public ResponseEntity<?> postFiles(AppManager appManager, MultipartHttpServletRequest request) throws IOException {

        LocalDateTime now = LocalDateTime.now();

        List<AttachFile> fileList = new ArrayList<>();

        String meta[] = request.getParameterValues("meta");
        int index = 0;
        for (MultipartFile mf : request.getFiles("file")) {
            long size = mf.getSize();
            String fieldName = mf.getName();
            String oriFileName = mf.getOriginalFilename();
            String ext = request.getParameter("ext");

            if (StringUtils.isEmpty(ext)) {
                ext = FilenameUtils.getExtension(oriFileName);
            }

            log.debug("fieldName:{}, fileName:{}, size:{}", fieldName, oriFileName, size);

            //C:\Users\neoxe\AppData\Local\Temp\349ffb8c-8e1e-46f1-b72c-98ba40583794.tmp
            Path tempPath = fileService.newTempPath();
            mf.transferTo(tempPath);

            String tempFileName = tempPath.getFileName().toString();

            AttachFile attachFile = new AttachFile();
            attachFile.setFileNm(tempFileName);
            attachFile.setFilePath(fileService.getFilePath());
            attachFile.setFileSize(size);
            attachFile.setExtNm(ext);
            attachFile.setUserFileNm(oriFileName);
            attachFile.setWorkType("INSERT");
            attachFile.setRegMngrNo(appManager.getMngrNo());

            if (meta != null && meta.length >= index) {
                attachFile.setMeta(meta[index]);
            }

            fileList.add(attachFile);

            AttachDivCd attachDivCd = AttachDivCd.fromString(request.getParameter("attachDivCd"));

            if (attachDivCd == AttachDivCd.EDITOR) {
                // 에디터 이미지 첨부일때만 save 처리
                fileService.save(attachDivCd, request.getParameter("dataNo"), fileList, true);
            }

            index++;
        }

        return ResponseEntity.ok(fileList);
    }

    @GetMapping("/base/files/delete")
    public ResponseEntity<?> deleteFiles(@RequestParam(required = false) String fileKey,
                                         @RequestParam(required = false) AttachDivCd attachDivCd,
                                         @RequestParam(required = false) String dataNo
    ) {

        log.debug("delete request for fileKey={}, attachDivCd={}, dataNo={}", fileKey, attachDivCd, dataNo);

        List<AttachFile> attachFiles;
        if (fileKey != null) {
            attachFiles = new ArrayList<>();
            AttachFile attachFile = fileService.findOne(fileKey);
            if (attachFile != null) {
                attachFiles.add(attachFile);
            }
        } else {
            attachFiles = fileService.findFiles(attachDivCd, dataNo);
        }

        if (attachFiles != null) {
            fileService.delete(attachFiles);
        }

        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "/base/files/view/{fileKey}")
    public ResponseEntity<StreamingResponseBody> view(@PathVariable String fileKey) throws IOException, URISyntaxException {

        AttachFile attachFile = fileService.findOne(fileKey);

        if (fileService.getFileSystemScheme().isSupportExternalUrl()) {
            URI redirectUri = new URI(attachFile.getUrl());
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.setLocation(redirectUri);
            return new ResponseEntity<>(httpHeaders, HttpStatus.SEE_OTHER);

        } else {

            /*File file = fileService.getFile(attachFile);
            Path path = file.toPath();
            String mimeType = Files.probeContentType(path);

            try (InputStream is = Files.newInputStream(path)) {
                return ResponseEntity.ok()
                        .contentType(MediaType.asMediaType(MimeType.valueOf(mimeType)))
                        .body(IOUtils.toByteArray(is));
            }*/

            StreamingResponseBody responseBody = outputStream -> FileSystemUtils.write(attachFile, outputStream);

            FileNameMap fileNameMap = URLConnection.getFileNameMap();
            String mimeType = fileNameMap.getContentTypeFor(attachFile.getFileNm());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .body(responseBody);
        }

    }

    public static String getEncodedFileName(HttpServletRequest req, String fileName) {
        String disposition = "";
        String userAgent = req.getHeader("User-Agent");

        try {
            if (!userAgent.contains("MSIE") && !userAgent.contains("Trident")) {
                if (userAgent.contains("Chrome")) {
                    StringBuilder sb = new StringBuilder();

                    for (int i = 0; i < fileName.length(); ++i) {
                        char c = fileName.charAt(i);
                        if (c > '~') {
                            sb.append(URLEncoder.encode("" + c, "UTF-8"));
                        } else {
                            sb.append(c);
                        }
                    }

                    disposition = disposition + "\"" + sb.toString() + "\"";
                } else {
                    disposition = disposition + "\"" + new String(fileName.getBytes(StandardCharsets.UTF_8), "8859_1") + "\"";
                }
            } else {
                disposition = disposition + URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
            }
        } catch (UnsupportedEncodingException var7) {
            disposition = disposition + "\"" + fileName + "\"";
        }

        return disposition;
    }
}
