import {
  Building2,
  Menu,
  Image,
  Sparkles,
  Compass,
  Box,
  Layers,
  Phone
} from 'lucide-react';

export interface HomepageSectionDef {
  id: string;
  num: number;
  label: string;
  shortLabel: string;
  desc: string;
  icon: any;
}

export const HOMEPAGE_SECTIONS: HomepageSectionDef[] = [
  {
    id: 'panel-brand',
    num: 1,
    label: '1. Nhận diện thương hiệu & Logo',
    shortLabel: '1. Nhận diện & Logo',
    desc: 'Tên bảo tàng, tên rút gọn, logo chính thức, huy hiệu viết tắt và khẩu hiệu trên Navbar',
    icon: Building2
  },
  {
    id: 'panel-header-menu',
    num: 2,
    label: '2. Menu Header (Thanh điều hướng đa cấp)',
    shortLabel: '2. Menu Header',
    desc: 'Quản lý các nút menu trên Navbar, hỗ trợ menu con (dropdown đa cấp), loại liên kết và bật/tắt',
    icon: Menu
  },
  {
    id: 'panel-hero',
    num: 3,
    label: '3. Banner Hero toàn cảnh',
    shortLabel: '3. Banner Hero',
    desc: 'Tiêu đề chào đón, khẩu hiệu, 2 nút kêu gọi CTA, ảnh nền toàn cảnh và video nền',
    icon: Image
  },
  {
    id: 'panel-intro',
    num: 4,
    label: '4. Giới thiệu Không gian',
    shortLabel: '4. Giới thiệu Không gian',
    desc: 'Đoạn văn giới thiệu công trình di tích, thẻ danh hiệu bảo chứng và ảnh kiến trúc thực tế',
    icon: Sparkles
  },
  {
    id: 'panel-rooms',
    num: 5,
    label: '5. Gian phòng Tour 360°',
    shortLabel: '5. Gian phòng 360°',
    desc: 'Tiêu đề, mô tả khối không gian thực tế ảo và nút điều hướng khám phá toàn bộ phòng',
    icon: Compass
  },
  {
    id: 'panel-artifacts',
    num: 6,
    label: '6. Cổ vật & Bảo vật 3D',
    shortLabel: '6. Cổ vật 3D',
    desc: 'Tiêu đề, mô tả khối hiện vật di sản và nút điều hướng tra cứu bảo vật',
    icon: Box
  },
  {
    id: 'panel-guide-preview',
    num: 7,
    label: '7. Khối Cẩm nang tham quan',
    shortLabel: '7. Khối Cẩm nang',
    desc: 'Thẻ định danh, tiêu đề, mô tả và nút xem cẩm nang hiển thị trên Trang chủ',
    icon: Layers
  },
  {
    id: 'panel-footer',
    num: 8,
    label: '8. Chân trang & Liên hệ',
    shortLabel: '8. Chân trang & Liên hệ',
    desc: 'Địa chỉ bảo tàng, hotline, email tiếp nhận, thành phố và dòng chữ bản quyền chân trang',
    icon: Phone
  }
];
