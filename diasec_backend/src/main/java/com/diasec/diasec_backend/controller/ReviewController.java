package com.diasec.diasec_backend.controller;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.diasec.diasec_backend.service.ReviewService;
import com.diasec.diasec_backend.util.ImageUtil;
import com.diasec.diasec_backend.vo.ReviewVo;


@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "${custom.cors.origin}", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ImageUtil imageUtil;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.access.url}")
    private String accessUrl;

    // 리뷰 작성 부분 목록 가져오기
    @GetMapping("/eligible")
    public List<ReviewVo> getEligible(@RequestParam String id) {
        return reviewService.getEligibleReviews(id);
    }
    
    // 리뷰 작성
    @PostMapping("/write")
    public ResponseEntity<?> writeReview(
        @RequestParam("pid") Long pid,
        @RequestParam("id") String id,
        @RequestParam("itemId") int itemId,
        @RequestParam("rating") int rating,
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        try {
            // 1. 후기 저장
            ReviewVo review = new ReviewVo();
            review.setPid(pid);
            review.setId(id);
            review.setRating(rating);
            review.setTitle(title);
            review.setContent(content);
            review.setItem_id(itemId);
            reviewService.insertReview(review);
            
            // 2. 이미지 저장
            if (images != null) {
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        // 이미지 저장 및 URL 반환
                        String imageUrl = imageUtil.saveImage(file, "review");
                        reviewService.insertReviewImage(review.getRid(), imageUrl);
                    }
                }
            }

            return ResponseEntity.ok().body(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
        }
    }

    // 리뷰 리스트 가져오기
    @GetMapping("/list")
    public ResponseEntity<List<ReviewVo>> getReviews(@RequestParam int pid) {
        System.out.println("/list!!" + ResponseEntity.ok(reviewService.getReviewsByPid(pid)));
        return ResponseEntity.ok(reviewService.getReviewsByPid(pid));
    }

    // 리뷰 리스트 전체 가져오기
    @GetMapping("/all")
    public ResponseEntity<List<ReviewVo>> getAllReviews() {
        System.out.println("list : " + reviewService.getAllReviews());
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    // 리뷰 한 페이지씩 불러오기
    @GetMapping("/recent")
    public ResponseEntity<List<ReviewVo>> getRecentReviews(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(reviewService.getRecentReviews(limit));
    }

    // 리뷰 삭제 & 실제 이미지 삭제
    @DeleteMapping("/delete/{rid}")
    public ResponseEntity<?> deleteReview(@PathVariable Long rid) {
        try {
            reviewService.deleteReview(rid);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
        }
    }
}
