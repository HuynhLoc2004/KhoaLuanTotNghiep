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
  errors: Array<{ field: string; message: string }>;
}

export function validateBlockData(
  type: CmsBlockType,
  data: Record<string, unknown>,
): FormValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data["id"] || String(data["id"]).trim().length === 0) {
    errors.push({ field: "id", message: "ID block không được để trống" });
  }

  if (!data["title"] || String(data["title"]).trim().length === 0) {
    errors.push({ field: "title", message: "Tiêu đề block không được để trống" });
  }

  if (type === "hero") {
    if (!data["subtitle"] || String(data["subtitle"]).trim().length === 0) {
      errors.push({
        field: "subtitle",
        message: "Mô tả phụ cho Hero block không được để trống",
      });
    }
  }

  if (type === "banner") {
    if (!data["message"] || String(data["message"]).trim().length === 0) {
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
  const heroData: CmsHeroBlock = (initialData as CmsHeroBlock) || {
    type: "hero",
    id: "hero-draft-01",
    title: "Hành Trình Khám Phá Di Sản Bảo Tàng Lịch Sử",
    subtitle: "Không gian số hóa tương tác 3D và AI Guide hỗ trợ tham quan di sản",
    ctaText: "Khám Phá Bản Đồ 3D",
    ctaLink: "/map-3d",
  };

  const bannerData: CmsBannerBlock = (initialData as CmsBannerBlock) || {
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
            <input id="input-hero-cta-text" type="text" value="${heroData.ctaText || ""}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
          </div>
          <div>
            <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Đường dẫn CTA Link:</label>
            <input id="input-hero-cta-link" type="text" value="${heroData.ctaLink || ""}" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;" />
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
          <label style="display:block; font-size:0.875rem; color:${heritageTheme.colors.textSecondary}; margin-bottom:0.25rem;">Nội dung thông báo:</label>
          <textarea id="input-banner-message" rows="3" style="width:100%; padding:0.5rem; background:${heritageTheme.colors.bgDark}; color:${heritageTheme.colors.textPrimary}; border:1px solid rgba(255,255,255,0.1); border-radius:0.25rem;">${bannerData.message}</textarea>
        </div>
      </div>
    `.trim();
  }

  return `
    <form id="cms-block-form" style="background: ${heritageTheme.colors.bgCard}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 1.5rem;">
      <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; margin-bottom: 1.25rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 0.75rem;">Biên tập CMS Block</h3>
      ${blockTypeSelectorHtml}
      ${fieldsFormHtml}
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end;">
        <button id="btn-validate-block" type="button" style="padding: 0.625rem 1.25rem; background: transparent; border: 1px solid ${heritageTheme.colors.accentGold}; color: ${heritageTheme.colors.accentGold}; border-radius: 0.25rem; cursor: pointer; font-weight: bold;">Validate Payload</button>
        <button id="btn-save-block" type="submit" style="padding: 0.625rem 1.25rem; background: ${heritageTheme.colors.primaryRed}; border: 1px solid ${heritageTheme.colors.accentGold}; color: ${heritageTheme.colors.textPrimary}; border-radius: 0.25rem; cursor: pointer; font-weight: bold;">Lưu Block vào Draft</button>
      </div>
    </form>
  `.trim();
}

export function renderLivePreviewPanel(sampleBlock: CmsBlock): string {
  const renderedBlock = renderCmsBlock(sampleBlock);

  return `
    <div id="live-preview-container" style="background: ${heritageTheme.colors.bgDark}; border: 1px solid ${heritageTheme.colors.borderGlass}; border-radius: 0.5rem; padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid ${heritageTheme.colors.borderGlass}; padding-bottom: 0.75rem;">
        <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.accentGold}; margin: 0;">👁️ Bản Xem Trước Trực Tiếp (Live Preview)</h3>
        <span style="font-size: 0.75rem; color: ${heritageTheme.colors.textSecondary};">Simulating Public Web View</span>
      </div>
      <div id="preview-output" style="border: 1px dashed ${heritageTheme.colors.accentGold}; border-radius: 0.375rem; overflow: hidden;">
        ${renderedBlock.html}
      </div>
    </div>
  `.trim();
}
