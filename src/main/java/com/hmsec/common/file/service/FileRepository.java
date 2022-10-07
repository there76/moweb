package com.hmsec.common.file.service;


import com.hmsec.common.file.model.AttachDivCd;
import com.hmsec.common.file.model.AttachFile;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface FileRepository {
    List<AttachFile> findFiles(AttachDivCd attachDivCd, String dataNo);

    AttachFile findOne(String fileKey);


    int insert(List<AttachFile> attachFileList);

    int delete(List<String> deleteFileList);

    List<String> findNotDeletableFileFullPathList(List<String> fileFullPathList);

    int update(List<AttachFile> attachFiles);
}
