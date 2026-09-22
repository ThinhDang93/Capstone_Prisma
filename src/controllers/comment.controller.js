const commentService = require("../services/comment.service");
const { ok, created } = require("../utils/response");

// GET /api/images/:id/comments
async function getCommentsByImageId(req, res, next) {
  try {
    const comments = await commentService.getCommentsByImageId(req.params.id);
    return ok(res, comments, "Lấy danh sách bình luận thành công");
  } catch (err) {
    next(err);
  }
}

// POST /api/images/:id/comments (nguoiDungId lấy từ token)
async function createComment(req, res, next) {
  try {
    const { noiDung } = req.body;
    const comment = await commentService.createComment(req.params.id, req.user.userId, noiDung);
    return created(res, comment, "Bình luận thành công");
  } catch (err) {
    next(err);
  }
}

module.exports = { getCommentsByImageId, createComment };
