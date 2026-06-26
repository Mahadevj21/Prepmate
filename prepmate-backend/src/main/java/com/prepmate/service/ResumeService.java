package com.prepmate.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ResumeService {

    private final GenAiService geminiService;

    public ResumeService(GenAiService geminiService) {
        this.geminiService = geminiService;
    }

    public String analyzeResume(MultipartFile file) {
        try {
            String text = extractTextFromPdf(file);
            if (text.trim().isEmpty()) {
                throw new RuntimeException("Could not extract any text from the provided PDF.");
            }

            String prompt = "You are an expert technical recruiter and ATS specialist. "
                    + "Analyze the following resume and provide feedback. "
                    + "Resume Content:\n" + text + "\n\n"
                    + "Return ONLY a JSON object with these exact fields:\n"
                    + "{\n"
                    + "  \"score\": <integer 0-100>,\n"
                    + "  \"summary\": \"<3-sentence overall assessment>\",\n"
                    + "  \"atsCompatibility\": \"<analysis of how parsers see this resume>\",\n"
                    + "  \"actionVerbFeedback\": \"<feedback on active vs passive language>\",\n"
                    + "  \"formattingIssues\": \"<any layout-related concerns>\",\n"
                    + "  \"topStrengths\": [\"<point 1>\", \"<point 2>\"],\n"
                    + "  \"criticalImprovements\": [\"<point 1>\", \"<point 2>\"],\n"
                    + "  \"suggestedKeywords\": [\"<keyword 1>\", \"<keyword 2>\"]\n"
                    + "}\n"
                    + "Use plain text only. No markdown. No explanation. Only the JSON object.";

            String aiResponse = geminiService.ask(prompt);
            if (GenAiService.isError(aiResponse)) {
                throw new RuntimeException(GenAiService.errorMessage(aiResponse));
            }

            return stripMarkdownFences(aiResponse.trim());

        } catch (IOException e) {
            throw new RuntimeException("Failed to process resume file: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private static String stripMarkdownFences(String raw) {
        if (raw.startsWith("```")) {
            int firstNl = raw.indexOf('\n');
            if (firstNl > 0) {
                raw = raw.substring(firstNl + 1);
            }
            int fence = raw.lastIndexOf("```");
            if (fence >= 0) {
                raw = raw.substring(0, fence);
            }
            raw = raw.trim();
        }
        return raw;
    }
}
