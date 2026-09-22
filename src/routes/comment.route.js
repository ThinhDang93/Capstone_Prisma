const express = require("express");
const commentController = require("../controllers/comment.controller");

const router = express.Router({ mergeParams: true });

router.get("/", commentController.getCommentsByImageId); // GET bình luận theo id ảnh
router.post("/", commentController.createComment); // POST lưu bình luận

module.exports = router;
