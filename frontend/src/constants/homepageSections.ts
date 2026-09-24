import {
  Building2,
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
    id: 'panel-menu',
    num: 1,
    label: '1. Khung Menu & Nhận diện',
    shortLabel: '1. Menu & Nhận diện',
    desc: 'Tên bảo tàng, tên rút gọn, logo tải lên và khẩu hiệu trên thanh điều hướng Navbar',
    icon: Building2
  },
  {
    id: 'panel-hero',
    num: 2,
    label: '2. Banner Hero toàn cảnh',
    shortLabel: '2. Banner Hero',
    desc: 'Tiêu đề chào đón, khẩu hiệu, 2 nút kêu gọi CTA, ảnh nền toàn cảnh và video nền',
    icon: Image
  },
  {
    id: 'panel-intro',
    num: 3,
    label: '3. Giới thiệu Không gian',
    shortLabel: '3. Giới thiệu Không gian',
    desc: 'Đoạn văn giới thiệu công trình di tích, thẻ danh hiệu bảo chứng và ảnh kiến trúc thực tế',
    icon: Sparkles
  },
  {
    id: 'panel-rooms',
    num: 4,
    label: '4. Gian phòng Tour 360°',
    shortLabel: '4. Gian phòng 360°',
    desc: 'Tiêu đề, mô tả khối không gian thực tế ảo và nút điều hướng khám phá toàn bộ phòng',
    icon: Compass
  },
  {
    id: 'panel-artifacts',
    num: 5,
    label: '5. Cổ vật & Bảo vật 3D',
    shortLabel: '5. Cổ vật 3D',
    desc: 'Tiêu đề, mô tả khối hiện vật di sản và nút điều hướng tra cứu bảo vật',
    icon: Box
  },
  {
    id: 'panel-guide',
    num: 6,
    label: '6. Cẩm nang & Sơ đồ',
    shortLabel: '6. Cẩm nang & Sơ đồ',
    desc: 'Quản lý sơ đồ mặt bằng, tải ảnh bản vẽ và công cụ phân tích mạng liên kết topo cửa phòng',
    icon: Layers
  },
  {
    id: 'panel-footer',
    num: 7,
    label: '7. Chân trang & Liên hệ',
    shortLabel: '7. Chân trang & Liên hệ',
    desc: 'Địa chỉ bảo tàng, hotline, email tiếp nhận, thành phố và dòng chữ bản quyền chân trang',
    icon: Phone
  }
];
