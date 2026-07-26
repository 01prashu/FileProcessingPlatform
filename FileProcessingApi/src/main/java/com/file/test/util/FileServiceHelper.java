package com.file.test.util;

import com.file.test.exception.DocumentProcessingException;
import com.file.test.model.CustomFile;
import com.file.test.repository.FileRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.multipdf.Splitter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class FileServiceHelper {
    @Autowired
    private FileRepository fileRepo;
    @Value("${app.pdfmerge.path}")
    public String pdfMergePath;
    public  String getFileExtention(String fileName)
    {
        if(fileName == null || !fileName.contains("."))
        {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".")+1);
    }
    public  String processMerging(List<MultipartFile> files) throws IOException,Exception {
        if(files.isEmpty() || files.size()==1)
        {
            throw new DocumentProcessingException("At least two files are needed to merge");
        }
        String uuid = UUID.randomUUID().toString().substring(0,8);
        PDFMergerUtility merger = new PDFMergerUtility();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        //String mergeFileName="Merge_"+timestamp+uuid+".pdf";
        String mergeFileName=uniqueFileNameProvider("Merge_",".pdf");
        List<File>tmpFiles=new ArrayList<>();
        try{
            for(MultipartFile file:files)
            {
                File tempFile=null;

                String fileName=file.getOriginalFilename();
                System.out.println("######### Original File Name:"+fileName);
                assert fileName != null:"File Name Can not be null";
                String fileExtension=getFileExtention(fileName);
                if(fileExtension.equalsIgnoreCase(""))
                {
                    throw new Exception("Uploaded file has no extension.");
                }
                else if(!fileExtension.equalsIgnoreCase("pdf"))
                {
                    tempFile=convertIntoPdf(file);
                }


                if(null==tempFile)
                {
                    tempFile=File.createTempFile ("upload_", ".pdf");
                    file.transferTo(tempFile);
                }
                // File tempFile=File.createTempFile();
                tmpFiles.add(tempFile);
                merger.addSource(tempFile);
                saveFileIntoDb(fileExtension,file.getSize(),fileName);

            }
            Path downloadPath = Paths.get(pdfMergePath);
            if(!downloadPath.toFile().exists())
            {
                Files.createDirectories(downloadPath);
            }
            File fullPath= new File(pdfMergePath,mergeFileName);
            merger.setDestinationFileName(fullPath.getAbsolutePath());
            merger.mergeDocuments(MemoryUsageSetting.setupTempFileOnly().streamCache);
        }
        finally {
            for(File t:tmpFiles)
            {
               t.deleteOnExit();
            }
        }
        return mergeFileName;
    }

    private void saveFileIntoDb(String fileExtension, long size, String fileName) {
        CustomFile customFile = new CustomFile();
        customFile.setExt(fileExtension);
        customFile.setSize(size);
        customFile.setName((fileName).substring(0, fileName.lastIndexOf(".")));
        customFile.setInsertTime(LocalDateTime.now());
        fileRepo.save(customFile);
        System.out.println("File save into DB");
    }

    private String uniqueFileNameProvider(String prefix, String suffix) {
        String uuid = UUID.randomUUID().toString().substring(0,8);
        //PDFMergerUtility merger = new PDFMergerUtility();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return prefix+timestamp+uuid+suffix;
    }

    private File convertIntoPdf(MultipartFile imageFile) throws IOException{
        System.out.println("Converting File to PDF:"+imageFile.getName());
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            byte[] imageBytes = imageFile.getBytes();
            PDImageXObject pdfImage = PDImageXObject.createFromByteArray(document, imageBytes, imageFile.getOriginalFilename());


            float pageWidth = page.getMediaBox().getWidth();
            float imageHeightOnPage = page.getMediaBox().getHeight();

            float imgWidth = pdfImage.getWidth();
            float imgHeight = pdfImage.getHeight();

            float scale = Math.min(pageWidth / imgWidth, imageHeightOnPage / imgHeight);
            float finalWidth = imgWidth * scale;
            float finalHeight = imgHeight * scale;

            // Center the image inside the A4 canvas margins
            float xOffset = (pageWidth - finalWidth) / 2;
            float yOffset = (imageHeightOnPage - finalHeight) / 2;

            // Draw the graphic context onto the active sheet
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.drawImage(pdfImage, xOffset, yOffset, finalWidth, finalHeight);
            }

            // Write output to raw byte array
           // ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            File tmpFile = File.createTempFile("upload_",".pdf");
            System.out.print("Pdf created :"+tmpFile.getName()+" and size:"+tmpFile.length());
            document.save(tmpFile);
            return tmpFile;
        }
    }


    public File fetchFile(String fileName) {

        return new File(pdfMergePath,fileName);
    }

    public File splitProcessor(MultipartFile file, String startPage, String endPage) throws IOException {

        File tempFile = File.createTempFile("upload_", ".pdf");

        try {
            // Copy uploaded file to temporary file
            file.transferTo(tempFile);

            try (PDDocument document = Loader.loadPDF(tempFile)) {

                Splitter splitter = new Splitter();
                splitter.setStartPage(Integer.parseInt(startPage));
                splitter.setEndPage(Integer.parseInt(endPage));

                List<PDDocument> splitDocuments = splitter.split(document);

                if (splitDocuments.isEmpty()) {
                    throw new DocumentProcessingException("Unable to split the document.");
                }

                String fileName = uniqueFileNameProvider("split_", ".pdf");
                System.out.println("FileName:"+fileName);
                File outputFile = new File(pdfMergePath, fileName);
                System.out.println("OutFileName:"+outputFile.getName()+" length:"+outputFile.length());
                int start = Integer.parseInt(startPage);
                int end = Integer.parseInt(endPage);

                int totalPages = document.getNumberOfPages();

                if (start < 1 || end > totalPages || start > end) {
                    throw new DocumentProcessingException("Invalid page range.");
                }
                try (PDDocument splitDocument=new PDDocument()) {
                    for (int i = start - 1; i < end; i++) {
                        splitDocument.importPage(document.getPage(i));
                    }
                    splitDocument.save(outputFile);
                    System.out.println("Save Output file with length:"+outputFile.length());
                }

                saveFileIntoDb(
                        ".pdf",
                        outputFile.length(),
                        outputFile.getName()
                );

                return outputFile;
            }

        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }

        }
    }
}
