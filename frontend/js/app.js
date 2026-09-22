const $app = document.getElementById("app");

function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initials(name) {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

let toastTimer;
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
}

function navigate(path) {
  window.location.hash = path;
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function renderHeader(route) {
  const $header = document.getElementById("header");
  const user = Auth.getUser();

  const rightSection = user
    ? `
      <button class="btn btn-primary" data-nav="/upload">+ Thêm ảnh</button>
      <a href="#/manage" class="avatar" title="${esc(user.hoTen)}">
        ${user.anhDaiDien ? `<img src="${esc(user.anhDaiDien)}" alt="avatar" />` : initials(user.hoTen)}
      </a>
      <button class="btn btn-secondary" id="logout-btn">Đăng xuất</button>
    `
    : `
      <button class="btn btn-secondary" data-nav="/login">Đăng nhập</button>
      <button class="btn btn-primary" data-nav="/register">Đăng ký</button>
    `;

  $header.innerHTML = `
    <a href="#/" class="logo">P</a>
    <button class="nav-pill ${route === "/" ? "active" : ""}" data-nav="/">Khám phá</button>
    <div class="search-box">
      <span>🔍</span>
      <input type="text" id="search-input" placeholder="Tìm kiếm ảnh theo tên" />
    </div>
    <div class="header-right">${rightSection}</div>
  `;

  $header.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Auth.clear();
      toast("Đã đăng xuất");
      navigate("/");
    });
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = currentSearchTerm || "";
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        currentSearchTerm = e.target.value.trim();
        if (route === "/") renderHomeGrid();
        else navigate("/");
      }, 400)
    );
  }
}

function requireLogin() {
  if (!Auth.isLoggedIn()) {
    toast("Vui lòng đăng nhập trước");
    navigate("/login");
    return false;
  }
  return true;
}

function pinCardHtml(image, { deletable = false } = {}) {
  const creator = image.nguoiDung || {};
  return `
    <div class="pin-card" data-id="${image.id}">
      <img src="${esc(image.duongDan)}" alt="${esc(image.tenHinh)}" loading="lazy" />
      ${deletable ? `<button class="delete-badge" data-delete="${image.id}" title="Xóa ảnh">✕</button>` : ""}
      <div class="pin-title">${esc(image.tenHinh)}</div>
      ${creator.hoTen ? `<div class="pin-author">${esc(creator.hoTen)}</div>` : ""}
    </div>
  `;
}

function attachPinCardEvents(container, { onDelete } = {}) {
  container.querySelectorAll(".pin-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-delete]")) return;
      navigate(`/image/${card.dataset.id}`);
    });
  });

  if (onDelete) {
    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("Xóa ảnh này?")) return;
        try {
          await Api.deleteImage(btn.dataset.delete);
          toast("Đã xóa ảnh");
          onDelete();
        } catch (err) {
          toast(err.message);
        }
      });
    });
  }
}

let currentSearchTerm = "";

async function viewHome() {
  $app.innerHTML = `<div class="page"><div class="masonry" id="grid"></div></div>`;
  await renderHomeGrid();
}

async function renderHomeGrid() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  grid.innerHTML = `<div class="loading">Đang tải ảnh...</div>`;
  try {
    const result = await Api.getImages(currentSearchTerm ? { search: currentSearchTerm } : {});
    if (!result.items.length) {
      grid.innerHTML = `<div class="empty-state">Không tìm thấy ảnh nào.</div>`;
      return;
    }
    grid.innerHTML = result.items.map((img) => pinCardHtml(img)).join("");
    attachPinCardEvents(grid);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
  }
}

function viewLogin() {
  $app.innerHTML = `
    <div class="centered-page">
      <div class="form-card">
        <h1>Đăng nhập</h1>
        <div id="form-error"></div>
        <form id="login-form">
          <div class="field"><label>Email</label><input type="email" name="email" required /></div>
          <div class="field"><label>Mật khẩu</label><input type="password" name="matKhau" required /></div>
          <button class="btn btn-primary" type="submit">Đăng nhập</button>
        </form>
        <div class="form-switch">Chưa có tài khoản? <a href="#/register">Đăng ký</a></div>
      </div>
    </div>
  `;

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const result = await Api.login({ email: fd.get("email"), matKhau: fd.get("matKhau") });
      Auth.setSession(result.token, result.user);
      toast(`Xin chào ${result.user.hoTen}!`);
      navigate("/");
    } catch (err) {
      document.getElementById("form-error").innerHTML = `<div class="error-banner">${esc(err.message)}</div>`;
    }
  });
}

function viewRegister() {
  $app.innerHTML = `
    <div class="centered-page">
      <div class="form-card">
        <h1>Tạo tài khoản</h1>
        <div id="form-error"></div>
        <form id="register-form">
          <div class="field"><label>Họ tên</label><input type="text" name="hoTen" required /></div>
          <div class="field"><label>Email</label><input type="email" name="email" required /></div>
          <div class="field"><label>Mật khẩu</label><input type="password" name="matKhau" required minlength="6" /></div>
          <div class="field"><label>Tuổi (không bắt buộc)</label><input type="number" name="tuoi" min="1" /></div>
          <button class="btn btn-primary" type="submit">Đăng ký</button>
        </form>
        <div class="form-switch">Đã có tài khoản? <a href="#/login">Đăng nhập</a></div>
      </div>
    </div>
  `;

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const result = await Api.register({
        hoTen: fd.get("hoTen"),
        email: fd.get("email"),
        matKhau: fd.get("matKhau"),
        tuoi: fd.get("tuoi") || undefined,
      });
      Auth.setSession(result.token, result.user);
      toast(`Chào mừng ${result.user.hoTen}!`);
      navigate("/");
    } catch (err) {
      document.getElementById("form-error").innerHTML = `<div class="error-banner">${esc(err.message)}</div>`;
    }
  });
}

function viewUpload() {
  if (!requireLogin()) return;

  $app.innerHTML = `
    <div class="centered-page">
      <div class="form-card">
        <h1>Thêm ảnh mới</h1>
        <div id="form-error"></div>
        <form id="upload-form">
          <div class="field"><label>Tên ảnh</label><input type="text" name="tenHinh" required /></div>
          <div class="field"><label>Đường dẫn ảnh (URL)</label><input type="url" name="duongDan" required placeholder="https://..." /></div>
          <div class="field"><label>Mô tả (không bắt buộc)</label><textarea name="moTa" rows="3"></textarea></div>
          <button class="btn btn-primary" type="submit">Đăng ảnh</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const image = await Api.createImage({
        tenHinh: fd.get("tenHinh"),
        duongDan: fd.get("duongDan"),
        moTa: fd.get("moTa") || undefined,
      });
      toast("Đăng ảnh thành công!");
      navigate(`/image/${image.id}`);
    } catch (err) {
      document.getElementById("form-error").innerHTML = `<div class="error-banner">${esc(err.message)}</div>`;
    }
  });
}

async function viewDetail(id) {
  $app.innerHTML = `<div class="page"><div class="loading">Đang tải...</div></div>`;

  let image, comments, saved = { daLuu: false };
  try {
    image = await Api.getImageById(id);
    comments = await Api.getComments(id);
    if (Auth.isLoggedIn()) {
      saved = await Api.checkSaved(id);
    }
  } catch (err) {
    $app.innerHTML = `<div class="page"><div class="empty-state">${esc(err.message)}</div></div>`;
    return;
  }

  const creator = image.nguoiDung || {};
  const isOwner = Auth.getUser() && Auth.getUser().id === creator.id;

  $app.innerHTML = `
    <div class="page">
      <div class="detail-layout">
        <div class="detail-image"><img src="${esc(image.duongDan)}" alt="${esc(image.tenHinh)}" /></div>
        <div class="detail-panel">
          <div class="actions">
            ${
              Auth.isLoggedIn()
                ? `<button class="btn ${saved.daLuu ? "save-btn saved" : "save-btn btn-primary"}" id="save-btn">${
                    saved.daLuu ? "Đã lưu ✓" : "Lưu"
                  }</button>`
                : ""
            }
            ${isOwner ? `<button class="btn btn-secondary" id="delete-btn">Xóa ảnh</button>` : ""}
          </div>
          <h1 class="detail-title">${esc(image.tenHinh)}</h1>
          ${image.moTa ? `<p class="detail-desc">${esc(image.moTa)}</p>` : ""}
          <div class="author-row">
            <span class="avatar">${
              creator.anhDaiDien ? `<img src="${esc(creator.anhDaiDien)}" alt="" />` : initials(creator.hoTen)
            }</span>
            <span>${esc(creator.hoTen || "Ẩn danh")}</span>
          </div>

          <div class="comments-section">
            <h3>Bình luận (${comments.length})</h3>
            <div id="comments-list">
              ${
                comments.length
                  ? comments
                      .map(
                        (c) => `
                <div class="comment-item">
                  <span class="avatar">${
                    c.nguoiDung?.anhDaiDien
                      ? `<img src="${esc(c.nguoiDung.anhDaiDien)}" alt="" />`
                      : initials(c.nguoiDung?.hoTen)
                  }</span>
                  <div><span class="comment-author">${esc(c.nguoiDung?.hoTen)}</span>${esc(c.noiDung)}</div>
                </div>`
                      )
                      .join("")
                  : `<p style="color:#999;font-size:14px;">Chưa có bình luận nào.</p>`
              }
            </div>
            ${
              Auth.isLoggedIn()
                ? `<form class="comment-form" id="comment-form">
                    <input type="text" name="noiDung" placeholder="Viết bình luận..." required />
                    <button class="btn btn-primary" type="submit">Gửi</button>
                  </form>`
                : `<p style="color:#999;font-size:14px;margin-top:16px;"><a href="#/login">Đăng nhập</a> để bình luận.</p>`
            }
          </div>
        </div>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        const result = await Api.toggleSave(id);
        saveBtn.textContent = result.daLuu ? "Đã lưu ✓" : "Lưu";
        saveBtn.classList.toggle("saved", result.daLuu);
      } catch (err) {
        toast(err.message);
      }
    });
  }

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Xóa ảnh này?")) return;
      try {
        await Api.deleteImage(id);
        toast("Đã xóa ảnh");
        navigate("/");
      } catch (err) {
        toast(err.message);
      }
    });
  }

  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(commentForm);
      try {
        await Api.addComment(id, fd.get("noiDung"));
        viewDetail(id); 
      } catch (err) {
        toast(err.message);
      }
    });
  }
}

async function viewManage() {
  if (!requireLogin()) return;

  $app.innerHTML = `<div class="page"><div class="loading">Đang tải...</div></div>`;

  let me;
  try {
    me = await Api.getMe();
  } catch (err) {
    $app.innerHTML = `<div class="page"><div class="empty-state">${esc(err.message)}</div></div>`;
    return;
  }

  $app.innerHTML = `
    <div class="page">
      <div class="manage-header">
        <span class="avatar">${me.anhDaiDien ? `<img src="${esc(me.anhDaiDien)}" alt="" />` : initials(me.hoTen)}</span>
        <h2 id="me-hoten">${esc(me.hoTen)}</h2>
        <p>${esc(me.email)}</p>
        <p id="me-tuoi">${me.tuoi ? `${me.tuoi} tuổi` : ""}</p>
        <button class="btn btn-secondary" id="edit-profile-btn" style="margin-top:10px;">Chỉnh sửa thông tin</button>
        <form id="edit-profile-form" style="display:none; max-width:320px; margin-top:16px; text-align:left;">
          <div class="field"><label>Họ tên</label><input type="text" name="hoTen" value="${esc(me.hoTen)}" required /></div>
          <div class="field"><label>Tuổi</label><input type="number" name="tuoi" value="${me.tuoi ?? ""}" min="1" /></div>
          <div class="field"><label>URL ảnh đại diện</label><input type="url" name="anhDaiDien" value="${esc(me.anhDaiDien || "")}" /></div>
          <button class="btn btn-primary" type="submit">Lưu thay đổi</button>
        </form>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="created">Ảnh đã tạo</button>
        <button class="tab-btn" data-tab="saved">Ảnh đã lưu</button>
      </div>

      <div class="masonry" id="manage-grid"></div>
    </div>
  `;


  const editBtn = document.getElementById("edit-profile-btn");
  const editForm = document.getElementById("edit-profile-form");
  editBtn.addEventListener("click", () => {
    editForm.style.display = editForm.style.display === "none" ? "block" : "none";
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(editForm);
    try {
      const updated = await Api.updateMe({
        hoTen: fd.get("hoTen"),
        tuoi: fd.get("tuoi") || null,
        anhDaiDien: fd.get("anhDaiDien") || null,
      });
      Auth.updateUser(updated);
      toast("Đã cập nhật thông tin cá nhân");
      viewManage(); 
      renderHeader("/manage");
    } catch (err) {
      toast(err.message);
    }
  });

  async function loadTab(tab) {
    const grid = document.getElementById("manage-grid");
    grid.innerHTML = `<div class="loading">Đang tải...</div>`;
    try {
      const images = tab === "created" ? await Api.getCreatedImages() : await Api.getSavedImages();
      if (!images.length) {
        grid.innerHTML = `<div class="empty-state">${
          tab === "created" ? "Bạn chưa đăng ảnh nào." : "Bạn chưa lưu ảnh nào."
        }</div>`;
        return;
      }
      grid.innerHTML = images.map((img) => pinCardHtml(img, { deletable: tab === "created" })).join("");
      attachPinCardEvents(grid, tab === "created" ? { onDelete: () => loadTab("created") } : undefined);
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">${esc(err.message)}</div>`;
    }
  }

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadTab(btn.dataset.tab);
    });
  });

  loadTab("created");
}

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  return hash;
}

function router() {
  const path = parseHash();
  const baseRoute = path.startsWith("/image/") ? "/image" : path;
  renderHeader(baseRoute === "/image" ? "" : path);

  if (path === "/" || path === "") {
    viewHome();
  } else if (path === "/login") {
    viewLogin();
  } else if (path === "/register") {
    viewRegister();
  } else if (path === "/upload") {
    viewUpload();
  } else if (path === "/manage") {
    viewManage();
  } else if (path.startsWith("/image/")) {
    const id = path.split("/image/")[1];
    viewDetail(id);
  } else {
    $app.innerHTML = `<div class="page"><div class="empty-state">Không tìm thấy trang.</div></div>`;
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);
