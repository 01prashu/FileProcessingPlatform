package com.file.test.service;

import com.file.test.dto.ResponseDto;
import com.file.test.util.FileServiceHelper;
import jakarta.annotation.Resource;
import org.apache.tomcat.util.file.ConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@Service
public class FileService {
    @Autowired
    FileServiceHelper fileServiceHelper;

        public ResponseDto mergeDocument(List<MultipartFile> files) throws IOException,Exception
    {

        String mergeFile = fileServiceHelper.processMerging(files);
        ResponseDto responseDto = new ResponseDto();
        responseDto.setDocumentName(mergeFile);
        if(!mergeFile.isEmpty())
        {
            responseDto.setStatus("Success");
            responseDto.setRemark("Document Merged Successfully");
            responseDto.setDocumentName(mergeFile);
            responseDto.setUrl("/api/download/"+mergeFile);
        }else{
            responseDto.setStatus("Failed");
            responseDto.setRemark("Document Merged Failed");
            /* responseDto.setDocumentName(""); */
        }
        return responseDto;
    }
    public byte[] downloadPdf(String fileName)throws  IOException
    {
        File file = fileServiceHelper.fetchFile(fileName);
        //byte[]bytes= Files.readAllBytes(file.toPath());
        return Files.readAllBytes(file.toPath());
    }

    public ResponseDto splitFile(MultipartFile file,String startPage,String endPage)throws IOException,Exception {
            System.out.println("Inside the splitFile method");
            File splitFile = fileServiceHelper.splitProcessor(file,startPage,endPage);
            ResponseDto responseDto = new ResponseDto();
            if(splitFile.exists())
            {
                responseDto.setStatus("Success");
                responseDto.setRemark("Successfully Split Pdf");
                responseDto.setDocumentName(splitFile.getName());
                responseDto.setUrl("/api/download/"+splitFile.getName());
            }else{
                responseDto.setStatus("Failed");
                responseDto.setRemark("Failed to Split Pdf");
            }
            return responseDto;
    }
}
