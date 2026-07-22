package com.lms.digital.controller;

import com.lms.digital.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        String filePath = fileUploadService.storeFile(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("filePath", filePath);
        
        return ResponseEntity.ok(response);
    }
}
