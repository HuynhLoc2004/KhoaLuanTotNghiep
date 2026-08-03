import {
  heritageTheme,
  renderCmsBlock,
  type CmsBlock,
  type CmsBlockType,
  type CmsHeroBlock,
  type CmsBannerBlock,
} from "@hcmc-museum/ui";

export interface FormValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export function validateBlockData(
  type: CmsBlockType,
  data: Record<string, unknown>,
): FormValidationResult {
  const errors: { field: string; message: string }[] = [];

  const rawId = data.id;
  const idVal = typeof rawId === "string" ? rawId : typeof rawId === "number" ? String(rawId) : "";
  if (idVal.trim().length === 0) {
    errors.push({ field: "id", message: "ID block không được để trống" });
  }

  const rawTitle = data.title;
  const titleVal =
    typeof rawTitle === "string" ? rawTitle : typeof rawTitle === "number" ? String(rawTitle) : "";
  if (titleVal.trim().length === 0) {
    errors.push({ field: "title", message: "Tiêu đề block không được để trống" });
  }

  if (type === "hero") {
    const rawSub = data.subtitle;
    const subVal =
      typeof rawSub === "string" ? rawSub : typeof rawSub === "number" ? String(rawSub) : "";
    if (subVal.trim().length === 0) {
      errors.push({
        field: "subtitle",
        message: "Mô tả phụ cho Hero block không được để trống",
      });
    }
  }

  if (type === "banner") {
    const rawMsg = data.message;
    const msgVal =
      typeof rawMsg === "string" ? rawMsg : typeof rawMsg === "number" ? String(rawMsg) : "";
    if (msgVal.trim().length === 0) {
      errors.push({
        field: "message",
        message: "Nội dung thông báo banner không được để trống",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function renderCmsBlockFormEditor(
  activeType: CmsBlockType = "hero",
  initialData?: CmsBlock,
): string {
  const heroData: CmsHeroBlock = initialData
    ? (initialData as CmsHeroBlock)
    : {
        type: "hero",
        id: "hero-draft-01",
        title: "Hành Trình Khám Phá Di Sản Bảo Tàng Lịch Sử",
        subtitle: "Không gian số hóa tương tác 3D và AI Guide hỗ trợ tham quan di sản",
        ctaText: "Khám Phá Bản Đồ 3D",
        ctaLink: "/map-3d",
      };

  const bannerData: CmsBannerBlock = initialData
    ? (initialData as CmsBannerBlock)
    : {
        type: "banner",
        id: "banner-draft-01",
        title: "Thông báo triển lãm mới",
        message: "Chào mừng quý khách đến với triển lãm di sản văn hóa Óc Eo trực tuyến.",
        variant: "announcement",
      };

  const blockTypeSelectorHtml = `
    <div style="margin-bottom: 1.5rem;">
      <label style="display: block; font-weight: bold; color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.5rem;">Loại Content Block:</label>
      <select id="select-block-type" style="width: 100%; padding: 0.625rem; background: ${heritageTheme.colors.bgDark}; color: ${heritageTheme.colors.textPrimary}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.25rem;">
        <option value="hero" ${activeType === "hero" ? "selected" : ""}>Hero Banner (Đầu trang)</option>
        <option value="artifact_grid" ${activeType === "artifact_grid" ? "selected" : ""}>Artifact Grid (Danh sách hiện vật 3D/2D)</option>
        <option value="timeline_preview" ${activeType === "timeline_preview" ? "selected" : ""}>Timeline Preview (Dòng thời gian)</option>
        <option value="banner" ${activeType === "banner" ? "selected" : ""}>Notice Banner (Thông báo)</option>
      </select>
    </div>
  `.trim();

  let fieldsFormHtml = "";

  if (activeType === "hero") {
    fieldsFormHtml = `
      <div id="form-hero-fields">
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">ID Block:</label>
          <input id="input-hero-id" type="text" value="${heroData.id}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Tiêu đề chính (Title):</label>
          <input id="input-hero-title" type="text" value="${heroData.title}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Mô tả phụ (Subtitle):</label>
          <textarea id="input-hero-subtitle" rows="3" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;">${heroData.subtitle}</textarea>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom: 1rem;">
          <div>
            <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Tên nút bấm CTA:</label>
            <input id="input-hero-cta-text" type="text" value="${heroData.ctaText ?? ""}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Đường dẫn CTA Link:</label>
            <input id="input-hero-cta-link" type="text" value="${heroData.ctaLink ?? ""}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
          </div>
        </div>
      </div>
    `.trim();
  } else {
    fieldsFormHtml = `
      <div id="form-banner-fields">
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">ID Block:</label>
          <input id="input-banner-id" type="text" value="${bannerData.id}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Tiêu đề Banner:</label>
          <input id="input-banner-title" type="text" value="${bannerData.title}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Nội dung thông báo (Message):</label>
          <textarea id="input-banner-message" rows="3" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;">${bannerData.message}</textarea>
        </div>
      </div>
    `.trim();
  }

  const livePreviewBlock = activeType === "hero" ? heroData : bannerData;
  const livePreviewHtml = renderCmsBlock(livePreviewBlock).html;

  return `
    <div id="cms-editor-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; background: ${heritageTheme.colors.bgDark}; color: ${heritageTheme.colors.textPrimary}; padding: 2rem; border-radius: 0.5rem; border: 1px solid ${heritageTheme.colors.borderGlass};">
      <div id="cms-form-panel" style="background: ${heritageTheme.colors.bgCard}; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid ${heritageTheme.colors.borderGlass};">
        <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.accentGold}; margin-bottom: 1rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 0.5rem;">Biên Tập Nội Dung Block (Form Editor)</h3>
        ${blockTypeSelectorHtml}
        ${fieldsFormHtml}
        <button id="btn-save-block" type="button" style="width: 100%; padding: 0.75rem; background: ${heritageTheme.colors.primaryRed}; color: ${heritageTheme.colors.textPrimary}; font-weight: bold; border: none; border-radius: 0.25rem; cursor: pointer; transition: ${heritageTheme.animations.transitionFast};">Lưu Cấu Hình Content Block</button>
      </div>
      <div id="cms-preview-panel" style="background: ${heritageTheme.colors.bgCard}; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid ${heritageTheme.colors.borderGlass};">
        <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; margin-bottom: 1rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 0.5rem;">Xem Trước Trực Tiếp (Live Preview)</h3>
        <div id="live-preview-box" style="border: 1px dashed ${heritageTheme.colors.borderGlass}; border-radius: 0.25rem; padding: 1rem;">
          ${livePreviewHtml}
        </div>
      </div>
    </div>
  `.trim();
}
