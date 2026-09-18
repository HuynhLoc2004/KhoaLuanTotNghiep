import fs from 'fs';
import path from 'path';
import { generateQRCodeDataUrl } from './services/qr.js';
import { ArtifactModel } from './models/Artifact.js';

export interface MuseumArtifact {
  id: string;
  code: string;
  name: string;
  period: string;
  roomId?: string;
  material?: string;
  dimensions?: string;
  origin?: string;
  description: string;
  audioNarrationUrl?: string;
  audioText?: string;
  images360: string[];
  model3dUrl?: string;
  thumbnailUrl: string;
  qrCodeDataUrl?: string;
  qrTargetUrl?: string;
  featured: boolean;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), 'data_artifacts.json');

// Khởi tạo các bảo vật di sản thật của Bảo tàng Lịch sử TP. Hồ Chí Minh
// Có chuỗi góc ảnh 360 xoay mâm đa chiều thật
const INITIAL_ARTIFACTS: Omit<MuseumArtifact, 'qrCodeDataUrl' | 'qrTargetUrl'>[] = [
  {
    id: 'art-tuong-phat-oc-eo',
    code: 'BVQG-01',
    name: 'Tượng Phật Gỗ Cổ Óc Eo',
    period: 'Thế kỷ IV - Nền văn hóa Óc Eo (Phù Nam)',
    roomId: 'room-oc-eo',
    material: 'Gỗ Sao nguyên khối ngâm đầm lầy cổ',
    dimensions: 'Cao 220 cm, Rộng 60 cm, Nặng ~80 kg',
    origin: 'Khai quật tại Giồng Xoài, Thoại Sơn, An Giang',
    description: 'Bảo vật Quốc gia độc bản của Việt Nam. Pho tượng thể hiện Đức Phật đứng trên tòa sen với phong cách nghệ thuật Amaravati kết hợp bản địa Nam Bộ. Tượng được bảo tồn nguyên vẹn hình dáng nhờ nằm hàng ngàn năm trong lớp bùn yếm khí.',
    audioText: 'Chào mừng quý khách đến với Bảo vật Quốc gia Tượng Phật Gỗ Óc Eo. Pho tượng này có niên đại từ thế kỷ thứ 4, được tạc từ một thân cây gỗ Sao nguyên khối. Điểm đặc biệt của bức tượng là tà áo cà sa mỏng manh buông dài theo phong cách điêu khắc Amaravati cổ kính, phản ánh thời kỳ cực thịnh của vương quốc cổ Phù Nam tại châu thổ sông Cửu Long.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80',
    images360: [
      'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    orderIndex: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'art-trong-dong-canh-thinh',
    code: 'BVQG-02',
    name: 'Trống Đồng Cảnh Thịnh Triều Tây Sơn',
    period: 'Niên hiệu Cảnh Thịnh thứ 8 (Năm 1800) - Thời Tây Sơn',
    roomId: 'room-sanh-chinh',
    material: 'Đồng đúc tinh xảo, chạm khắc chữ Hán và linh thú',
    dimensions: 'Đường kính mặt 54 cm, Thân cao 37.5 cm',
    origin: 'Đúc tại chùa Linh Nhân, đệ tử Thạch Biển phụng khắc',
    description: 'Chiếc trống đồng cổ duy nhất của Việt Nam được đúc dưới triều đại Hoàng đế Quang Toản (Cảnh Thịnh), mô phỏng hình dáng trống đồng cổ Đông Sơn nhưng văn hoa chạm khắc mang đậm dấu ấn phong cách nghệ thuật thời Tây Sơn thế kỷ 18.',
    audioText: 'Quý khách đang chiêm ngưỡng Trống đồng Cảnh Thịnh, một di vật vô cùng hiếm hoi còn nguyên vẹn từ phong trào khởi nghĩa Tây Sơn oai hùng. Thân trống được chạm khắc các dải mây, rồng phượng và 272 chữ Hán ca ngợi công đức đúc trống thờ Phật và cầu quốc thái dân an.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    images360: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    orderIndex: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'art-nu-than-laksmi',
    code: 'BV-CP-03',
    name: 'Tượng Nữ Thần Devi - Laksmi Champa',
    period: 'Thế kỷ VII - Nghệ thuật Chămpa cổ',
    roomId: 'room-tien-su',
    material: 'Sa thạch xám chạm nổi tinh xảo',
    dimensions: 'Cao 85 cm, Rộng 42 cm',
    origin: 'Khu di tích Chăm Tháp Mẫm, Nam Trung Bộ',
    description: 'Tác phẩm điêu khắc sa thạch tuyệt mỹ thể hiện Nữ thần Laksmi - biểu tượng của sắc đẹp, sự thịnh vượng và phồn thực trong văn hóa Ấn Độ giáo bản địa hóa tại vương quốc Chămpa cổ.',
    audioText: 'Bức tượng Nữ thần Devi hay Laksmi bằng sa thạch này thể hiện đỉnh cao của nghệ thuật điêu khắc Chămpa cổ thế kỷ thứ 7. Khuôn mặt nữ thần toát lên vẻ đẹp thanh tú, đôn hậu, thân hình uyển chuyển mang lại nguồn sinh khí và tài lộc.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    images360: [
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    orderIndex: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class ArtifactStore {
  private artifacts: MuseumArtifact[] = [];

  constructor() {
    this.loadSync();
    this.enrichQRCodes();
  }

  private loadSync() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.artifacts = JSON.parse(raw);
      } else {
        this.artifacts = INITIAL_ARTIFACTS.map(art => ({
          ...art,
          qrTargetUrl: `/artifact/${art.id}`,
          qrCodeDataUrl: ''
        }));
        this.save();
      }
    } catch {
      this.artifacts = INITIAL_ARTIFACTS.map(art => ({
        ...art,
        qrTargetUrl: `/artifact/${art.id}`,
        qrCodeDataUrl: ''
      }));
    }
  }

  private async enrichQRCodes() {
    try {
      let hasChanges = false;
      for (let i = 0; i < this.artifacts.length; i++) {
        if (!this.artifacts[i].qrCodeDataUrl) {
          const targetUrl = this.artifacts[i].qrTargetUrl || `/artifact/${this.artifacts[i].id}`;
          this.artifacts[i].qrCodeDataUrl = await generateQRCodeDataUrl(targetUrl);
          hasChanges = true;
        }
      }
      if (hasChanges) {
        this.save();
      }
    } catch (err) {
      console.error('[ArtifactStore] Lỗi enrich QR:', err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.artifacts, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ArtifactStore] Lỗi lưu file JSON:', err);
    }
  }

  public getAll(): MuseumArtifact[] {
    return [...this.artifacts].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getById(id: string): MuseumArtifact | undefined {
    return this.artifacts.find(a => a.id === id || a.code === id);
  }

  public async create(
    data: Omit<MuseumArtifact, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeDataUrl' | 'qrTargetUrl'>
  ): Promise<MuseumArtifact> {
    const id = `art-${Date.now()}`;
    const qrTargetUrl = `/artifact/${id}`;
    const qrCodeDataUrl = await generateQRCodeDataUrl(qrTargetUrl);

    const newArt: MuseumArtifact = {
      ...data,
      id,
      qrTargetUrl,
      qrCodeDataUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.artifacts.push(newArt);
    this.save();

    // Đồng bộ vào MongoDB nếu có kết nối
    try {
      await ArtifactModel.create(newArt);
    } catch (dbErr: any) {
      console.warn('[ArtifactStore] Đồng bộ MongoDB dự phòng:', dbErr.message);
    }

    return newArt;
  }

  public async update(id: string, patch: Partial<MuseumArtifact>): Promise<MuseumArtifact | null> {
    const index = this.artifacts.findIndex(a => a.id === id);
    if (index === -1) return null;

    // Cập nhật lại QR nếu URL thay đổi
    let qrCodeDataUrl = this.artifacts[index].qrCodeDataUrl;
    let qrTargetUrl = this.artifacts[index].qrTargetUrl || `/artifact/${id}`;
    if (patch.qrTargetUrl && patch.qrTargetUrl !== qrTargetUrl) {
      qrTargetUrl = patch.qrTargetUrl;
      qrCodeDataUrl = await generateQRCodeDataUrl(qrTargetUrl);
    }

    this.artifacts[index] = {
      ...this.artifacts[index],
      ...patch,
      qrTargetUrl,
      qrCodeDataUrl,
      updatedAt: new Date().toISOString()
    };

    this.save();

    try {
      await ArtifactModel.findOneAndUpdate({ id }, this.artifacts[index]);
    } catch {}

    return this.artifacts[index];
  }

  public async delete(id: string): Promise<boolean> {
    const prev = this.artifacts.length;
    this.artifacts = this.artifacts.filter(a => a.id !== id);
    if (this.artifacts.length !== prev) {
      this.save();
      try {
        await ArtifactModel.deleteOne({ id });
      } catch {}
      return true;
    }
    return false;
  }
}

export const artifactStore = new ArtifactStore();
