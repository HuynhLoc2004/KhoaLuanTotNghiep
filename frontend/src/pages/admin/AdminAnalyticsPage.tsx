import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Compass,
  MapPin,
  Images,
  Languages as LanguagesIcon,
  RotateCw,
  Loader2,
  AlertTriangle,
  CircleSlash,
  Info,
  HardDrive,
  CheckCircle2,
  Table2,
  AreaChart
} from 'lucide-react';
import { API_BASE } from '../../services/api';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { TrendAreaChart } from '../../components/charts/TrendAreaChart';

interface LanguageCoverage {
  code: string;
  nativeName: string;
  isDefault: boolean;
  translatedRooms: number;
  partialRooms: number;
  totalRooms: number;
  coveragePercent: number;
}

interface PendingIssue {
  roomId: string;
  code: string;
  name: string;
  issues: string[];
}

interface OverviewData {
  rooms: {
    total: number;
    active: number;
    inactive: number;
    withPanorama: number;
    withOwnPanorama: number;
    withExternalPanorama: number;
    withHotspots: number;
    aiEnabled: number;
    totalHotspots: number;
    avgHotspots: number;
    digitizationPercent: number;
  };
  panoramas: {
    total: number;
    totalBytes: number;
    orphanCount: number;
    orphans: { id: string; filename: string; title: string; sizeBytes: number; createdAt: string }[];
    avgInputFrames: number;
    framesSampleCount: number;
    framesBelowStandard: number;
    framesBuckets: { label: string; belowStandard: boolean; count: number }[];
    byDay: { date: string; count: number }[];
    cumulative: { date: string; total: number }[];
  };
  languages: {
    totalRegistered: number;
    activeCount: number;
    coverage: LanguageCoverage[];
  };
  pending: PendingIssue[];
  pendingByType: { label: string; count: number }[];
  visitors: {
    hasAuthSystem: boolean;
    totalEvents: number;
    totalSessions: number;
    uniqueVisitors: number;
    authenticatedVisitors: number;
    anonymousVisitors: number;
    byDay: { date: string; dangNhap: number; vangLai: number; khachDuyNhat: number }[];
    byDevice: { device: string; sessions: number }[];
    topRooms: { roomId: string; code: string; name: string; views: number }[];
  };
  manualMetrics: { totalQrScans: number; source: string };
  visitorAnalytics: { available: boolean; reason: string };
  generatedAt: string;
}

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
};

const formatDayLabel = (iso: string): string => {
  const [, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}`;
};

export const AdminAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [xemBangNgay, setXemBangNgay] = useState(false);
  const [hoveredVisitDay, setHoveredVisitDay] = useState<number | null>(null);

  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(6);

  const fetchOverview = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/analytics/overview${refresh ? '?refresh=1' : ''}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Không tải được số liệu thống kê');
      setData(json.data);
      if (refresh) showToast('Đã tính lại số liệu từ cơ sở dữ liệu', 'success');
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !data) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
          <Loader2 size={26} className="spin" style={{ margin: '0 auto 10px', color: 'var(--primary)' }} />
          <div style={{ fontSize: 13 }}>Đang tổng hợp số liệu từ cơ sở dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-content">
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
          <AlertTriangle size={28} style={{ color: 'var(--error)', marginBottom: 10 }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-main)' }}>
            Không tải được báo cáo
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchOverview()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { rooms, panoramas, languages, pending, manualMetrics, visitorAnalytics, pendingByType, visitors } = data;
  const maxDayCount = Math.max(1, ...panoramas.byDay.map((d) => d.count));
  const totalProduced = panoramas.byDay.reduce((s, d) => s + d.count, 0);

  const maxBucket = Math.max(1, ...panoramas.framesBuckets.map((b) => b.count));
  const maxIssue = Math.max(1, ...pendingByType.map((i) => i.count));
  const maxPhien = Math.max(1, ...visitors.byDay.map((d) => d.dangNhap + d.vangLai));
  const tongPhien30 = visitors.byDay.reduce((s2, d) => s2 + d.dangNhap + d.vangLai, 0);
  const tenThietBi: Record<string, string> = {
    mobile: 'Điện thoại',
    tablet: 'Máy tính bảng',
    desktop: 'Máy tính',
    'khong-ro': 'Không rõ'
  };
  const cumulativePoints = panoramas.cumulative.map((c) => ({
    label: formatDayLabel(c.date),
    value: c.total
  }));

  const pagedPending = pending.slice(
    (pendingPage - 1) * pendingPageSize,
    pendingPage * pendingPageSize
  );

  return (
    <div className="admin-content">
      <div className="studio-header" style={{ marginBottom: 16 }}>
        <div className="studio-title-group">
          <h2>
            <BarChart3 size={20} />
            Báo cáo tình trạng số hóa
          </h2>
          <p>
            Số liệu đếm trực tiếp từ cơ sở dữ liệu gian phòng, ảnh 360 độ và ngôn ngữ.
            Cập nhật lúc {new Date(data.generatedAt).toLocaleString('vi-VN')}.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fetchOverview(true)}
          disabled={loading}
        >
          <RotateCw size={13} className={loading ? 'spin' : ''} />
          <span>Tính lại</span>
        </button>
      </div>

      {/* Cảnh báo phạm vi: không có dữ liệu lượt tham quan */}
      {!visitorAnalytics.available && (
        <div className="analytics-notice">
          <Info size={16} style={{ flexShrink: 0, marginTop: 1, color: 'var(--accent-gold)' }} />
          <div>
            <strong>Báo cáo này thống kê kho nội dung, chưa phải lượt tham quan của khách.</strong>
            <div style={{ marginTop: 3 }}>{visitorAnalytics.reason}</div>
          </div>
        </div>
      )}

      {/* ==== LƯỢT TRUY CẬP ==== */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">
          <h3 className="panel-title">Lượt truy cập 30 ngày</h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {tongPhien30} phiên · {visitors.uniqueVisitors} khách duy nhất
          </span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {!visitors.hasAuthSystem && (
            <p className="studio-device-note" style={{ marginBottom: 12 }}>
              Hệ thống chưa có chức năng đăng nhập, nên hiện mọi phiên đều được ghi là khách vãng lai.
              Cột đã đăng nhập sẽ có số ngay khi bổ sung đăng nhập, không cần sửa lại báo cáo.
            </p>
          )}

          {tongPhien30 === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Chưa ghi nhận lượt truy cập nào trong 30 ngày qua.
            </p>
          ) : (
            <>
              {/* Hai chuỗi dữ liệu nên bảng chú giải là bắt buộc */}
              <div className="visitor-legend">
                <span className="visitor-legend-item">
                  <span className="visitor-legend-swatch cat-1" />
                  Khách vãng lai
                </span>
                <span className="visitor-legend-item">
                  <span className="visitor-legend-swatch cat-2" />
                  Đã đăng nhập
                </span>
              </div>

              <div
                className="visitor-chart"
                role="application"
                tabIndex={0}
                aria-label={`Phiên truy cập theo ngày trong 30 ngày qua, tổng ${tongPhien30} phiên. Dùng phím mũi tên trái phải để đọc từng ngày.`}
                onFocus={() => setHoveredVisitDay((v) => (v === null ? visitors.byDay.length - 1 : v))}
                onBlur={() => setHoveredVisitDay(null)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    setHoveredVisitDay((v) => {
                      const cur = v === null ? visitors.byDay.length - 1 : v;
                      const next = e.key === 'ArrowLeft' ? cur - 1 : cur + 1;
                      return Math.min(visitors.byDay.length - 1, Math.max(0, next));
                    });
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    setHoveredVisitDay(0);
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    setHoveredVisitDay(visitors.byDay.length - 1);
                  } else if (e.key === 'Escape') {
                    setHoveredVisitDay(null);
                  }
                }}
              >
                {visitors.byDay.map((d, i) => {
                  const tong = d.dangNhap + d.vangLai;
                  return (
                    <div
                      key={d.date}
                      className={`visitor-col ${hoveredVisitDay === i ? 'is-hovered' : ''}`}
                      onMouseEnter={() => setHoveredVisitDay(i)}
                      onMouseLeave={() => setHoveredVisitDay(null)}
                    >
                      {tong === 0 ? (
                        <div className="visitor-seg is-empty" style={{ height: 2 }} />
                      ) : (
                        <>
                          <div
                            className="visitor-seg cat-1"
                            style={{ height: `${(d.vangLai / maxPhien) * 100}%` }}
                          />
                          {d.dangNhap > 0 && (
                            <div
                              className="visitor-seg cat-2"
                              style={{ height: `${(d.dangNhap / maxPhien) * 100}%` }}
                            />
                          )}
                        </>
                      )}
                      {hoveredVisitDay === i && (
                        <div
                          className={`daybar-tooltip ${
                            i <= 2 ? 'align-start' : i >= visitors.byDay.length - 3 ? 'align-end' : ''
                          }`}
                        >
                          <strong>{tong}</strong> phiên · {d.khachDuyNhat} khách · {formatDayLabel(d.date)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="daybar-axis">
                <span>{formatDayLabel(visitors.byDay[0].date)}</span>
                <span>{formatDayLabel(visitors.byDay[visitors.byDay.length - 1].date)}</span>
              </div>

              <div className="analytics-two-col" style={{ marginTop: 18 }}>
                <div>
                  <h4 className="sub-title">Phiên theo loại thiết bị</h4>
                  <div className="rank-list">
                    {visitors.byDevice.map((d) => (
                      <div className="rank-row" key={d.device}>
                        <div className="rank-label">
                          <span className="rank-name">{tenThietBi[d.device] || d.device}</span>
                        </div>
                        <div className="rank-track">
                          <div
                            className="rank-fill"
                            style={{
                              width: `${(d.sessions / Math.max(1, visitors.byDevice[0].sessions)) * 100}%`
                            }}
                          />
                        </div>
                        <span className="rank-value">{d.sessions}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="sub-title">Gian phòng được xem nhiều nhất</h4>
                  {visitors.topRooms.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                      Chưa ghi nhận lượt xem gian phòng nào.
                    </p>
                  ) : (
                    <div className="rank-list">
                      {visitors.topRooms.map((r) => (
                        <div className="rank-row" key={r.roomId} title={r.name}>
                          <div className="rank-label">
                            <span className="rank-code">{r.code}</span>
                            <span className="rank-name">{r.name}</span>
                          </div>
                          <div className="rank-track">
                            <div
                              className="rank-fill"
                              style={{ width: `${(r.views / visitors.topRooms[0].views) * 100}%` }}
                            />
                          </div>
                          <span className="rank-value">{r.views}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Gian phòng đang mở</div>
            <Compass size={15} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span>{rooms.active}/{rooms.total}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>phòng</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
              <span>Đã gắn ảnh 360 độ</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{rooms.digitizationPercent}%</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill" style={{ width: `${rooms.digitizationPercent}%` }} />
            </div>
            {rooms.withExternalPanorama > 0 && (
              <div className="stat-desc" style={{ marginTop: 5 }}>
                Trong đó {rooms.withExternalPanorama} phòng còn dùng ảnh nguồn ngoài, chưa phải ảnh bảo tàng tự ghép.
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Điểm neo hiện vật</div>
            <MapPin size={15} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value">{rooms.totalHotspots}</div>
          <div className="stat-desc">
            Trung bình {rooms.avgHotspots} điểm mỗi phòng · {rooms.withHotspots}/{rooms.total} phòng đã gắn
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Kho ảnh 360 độ</div>
            <Images size={15} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value">{panoramas.total.toLocaleString('vi-VN')}</div>
          {panoramas.total > 0 && (
            <div className="stat-spark" title="Quy mô kho ảnh tích lũy trong 30 ngày">
              <TrendAreaChart
                points={cumulativePoints}
                height={30}
                variant="sparkline"
                seriesLabel="Quy mô kho ảnh 360 độ tích lũy 30 ngày"
              />
            </div>
          )}
          <div className="stat-desc">
            {formatBytes(panoramas.totalBytes)} dung lượng
            {panoramas.orphanCount > 0 && ` · ${panoramas.orphanCount} ảnh chưa gắn phòng`}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Ngôn ngữ đang bật</div>
            <LanguagesIcon size={15} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span>{languages.activeCount}/{languages.totalRegistered}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>thứ tiếng</span>
          </div>
          <div className="stat-desc">{rooms.aiEnabled}/{rooms.total} phòng đã bật thuyết minh AI</div>
        </div>
      </div>

      <div className="analytics-two-col">
        {/* Độ phủ bản dịch: một chuỗi dữ liệu, thanh đơn sắc, nhãn trực tiếp */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Độ phủ bản dịch theo ngôn ngữ</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <p className="studio-device-note" style={{ marginBottom: 12 }}>
              Một gian phòng chỉ tính là đã dịch khi có đủ cả tên và mô tả ở ngôn ngữ đó.
            </p>
            {languages.coverage.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Chưa bật ngôn ngữ nào trong mục Quản trị Ngôn ngữ.
              </p>
            ) : (
              <div className="coverage-list">
                {languages.coverage.map((lang) => (
                  <div className="coverage-row" key={lang.code}>
                    <div className="coverage-label">
                      <span>{lang.nativeName}</span>
                      {lang.isDefault && <span className="coverage-tag">gốc</span>}
                    </div>
                    <div className="meter-track">
                      <div className="meter-fill" style={{ width: `${lang.coveragePercent}%` }} />
                    </div>
                    <div className="coverage-value">
                      {lang.translatedRooms}/{lang.totalRooms}
                      <span className="coverage-percent">{lang.coveragePercent}%</span>
                    </div>
                    {lang.partialRooms > 0 && (
                      <div className="coverage-note">
                        {lang.partialRooms} phòng mới dịch một phần
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sản lượng ghép ảnh 30 ngày */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Ảnh 360 độ tạo ra trong 30 ngày</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalProduced} ảnh</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setXemBangNgay((v) => !v)}
                aria-pressed={xemBangNgay}
                title={xemBangNgay ? 'Xem dạng đồ thị' : 'Xem dạng bảng số liệu'}
              >
                {xemBangNgay ? <AreaChart size={13} /> : <Table2 size={13} />}
                <span>{xemBangNgay ? 'Đồ thị' : 'Bảng'}</span>
              </button>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {totalProduced === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Chưa có ảnh nào được ghép trong 30 ngày gần đây.
              </p>
            ) : xemBangNgay ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <caption className="sr-only">Số ảnh 360 độ ghép theo từng ngày trong 30 ngày qua</caption>
                  <thead>
                    <tr>
                      <th scope="col">Ngày</th>
                      <th scope="col">Số ảnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panoramas.byDay
                      .filter((d) => d.count > 0)
                      .map((d) => (
                        <tr key={d.date}>
                          <td>{formatDayLabel(d.date)}</td>
                          <td className="num">{d.count}</td>
                        </tr>
                      ))}
                    <tr className="total-row">
                      <td>Tổng</td>
                      <td className="num">{totalProduced}</td>
                    </tr>
                  </tbody>
                </table>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0' }}>
                  Chỉ liệt kê những ngày có ảnh được ghép.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="daybar-chart"
                  role="application"
                  tabIndex={0}
                  aria-label={`Số ảnh 360 độ ghép theo từng ngày trong 30 ngày qua, tổng ${totalProduced} ảnh, cao nhất ${maxDayCount} ảnh một ngày. Dùng phím mũi tên trái phải để đọc từng ngày.`}
                  onFocus={() => setHoveredDay((v) => (v === null ? panoramas.byDay.length - 1 : v))}
                  onBlur={() => setHoveredDay(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      setHoveredDay((v) => {
                        const cur = v === null ? panoramas.byDay.length - 1 : v;
                        const next = e.key === 'ArrowLeft' ? cur - 1 : cur + 1;
                        return Math.min(panoramas.byDay.length - 1, Math.max(0, next));
                      });
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      setHoveredDay(0);
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      setHoveredDay(panoramas.byDay.length - 1);
                    } else if (e.key === 'Escape') {
                      setHoveredDay(null);
                    }
                  }}
                >
                  {panoramas.byDay.map((d, i) => (
                    <div
                      key={d.date}
                      className={`daybar-col ${hoveredDay === i ? 'is-hovered' : ''}`}
                      onMouseEnter={() => setHoveredDay(i)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div
                        className={`daybar-mark ${d.count === 0 ? 'is-empty' : ''}`}
                        style={{ height: `${Math.max(2, (d.count / maxDayCount) * 100)}%` }}
                      />
                      {hoveredDay === i && (
                        <div
                          className={`daybar-tooltip ${
                            i <= 2 ? 'align-start' : i >= panoramas.byDay.length - 3 ? 'align-end' : ''
                          }`}
                        >
                          <strong>{d.count}</strong> ảnh · {formatDayLabel(d.date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="daybar-axis">
                  <span>{formatDayLabel(panoramas.byDay[0].date)}</span>
                  <span>{formatDayLabel(panoramas.byDay[panoramas.byDay.length - 1].date)}</span>
                </div>
                {panoramas.framesSampleCount > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0' }}>
                    Trung bình {panoramas.avgInputFrames} ảnh góc đầu vào mỗi panorama
                    (trên {panoramas.framesSampleCount} ảnh có ghi nhận).
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-two-col" style={{ marginTop: 16 }}>
        {/* Tồn đọng theo loại việc: so sánh độ lớn giữa các hạng mục công việc */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Tồn đọng theo loại công việc</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {pendingByType.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Không còn hạng mục nào tồn đọng.</span>
              </div>
            ) : (
              <div className="rank-list">
                {pendingByType.map((it) => (
                  <div className="rank-row" key={it.label} title={it.label}>
                    <div className="rank-label">
                      <span className="rank-name">{it.label}</span>
                    </div>
                    <div className="rank-track">
                      <div className="rank-fill" style={{ width: `${(it.count / maxIssue) * 100}%` }} />
                    </div>
                    <span className="rank-value">{it.count}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.55 }}>
              Số gian phòng đang vướng mỗi loại việc. Một phòng có thể vướng nhiều loại cùng lúc.
            </p>
          </div>
        </div>

        {/* Phân bố ảnh góc đầu vào, đối chiếu chuẩn 16-24 tấm của thuật toán ghép */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">Số ảnh góc đầu vào mỗi panorama</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {panoramas.framesSampleCount === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Chưa có panorama nào ghi nhận số ảnh góc đầu vào.
              </p>
            ) : (
              <>
                <div className="histogram">
                  {panoramas.framesBuckets.map((b) => (
                    <div className="histogram-col" key={b.label}>
                      <div className="histogram-bar-area">
                        <span className="histogram-count">{b.count}</span>
                        <div
                          className="histogram-bar"
                          style={{ height: `${Math.max(b.count === 0 ? 0 : 4, (b.count / maxBucket) * 100)}%` }}
                        />
                      </div>
                      <div className={`histogram-label ${b.belowStandard ? '' : 'is-standard'}`}>
                        {b.label}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.55 }}>
                  Thuật toán ghép cần 16 đến 24 tấm để đủ độ gối đầu.{' '}
                  {panoramas.framesBelowStandard > 0 ? (
                    <>
                      Có <strong style={{ color: 'var(--text-main)' }}>{panoramas.framesBelowStandard}</strong> panorama
                      dựng từ dưới 16 tấm, nguy cơ hở mảng cao.
                    </>
                  ) : (
                    'Mọi panorama đều dựng từ đủ 16 tấm trở lên.'
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Việc tồn đọng: trạng thái bằng icon + chữ, không dựa vào màu */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <h3 className="panel-title">Việc tồn đọng theo gian phòng ({pending.length})</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {pending.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Mọi gian phòng đều đã đủ ảnh 360 độ, điểm neo và bản dịch.</span>
            </div>
          ) : (
            <>
              <div className="pending-list">
                {pagedPending.map((row) => (
                  <div className="pending-row" key={row.roomId}>
                    <div className="pending-room">
                      <span className="pending-code">{row.code}</span>
                      <span className="pending-name" title={row.name}>{row.name}</span>
                    </div>
                    <ul className="pending-issues">
                      {row.issues.map((issue) => (
                        <li key={issue}>
                          <CircleSlash size={12} style={{ flexShrink: 0 }} />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Pagination
                currentPage={pendingPage}
                totalItems={pending.length}
                pageSize={pendingPageSize}
                onPageChange={setPendingPage}
                onPageSizeChange={(n) => {
                  setPendingPageSize(n);
                  setPendingPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
                itemLabel="gian phòng"
              />
            </>
          )}
        </div>
      </div>

      {/* Ảnh mồ côi */}
      {panoramas.orphanCount > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">
            <h3 className="panel-title">Ảnh 360 độ chưa gắn vào gian phòng nào ({panoramas.orphanCount})</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div className="orphan-list">
              {panoramas.orphans.map((p) => (
                <div className="orphan-row" key={p.id || p.filename}>
                  <HardDrive size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="orphan-name" title={p.filename}>{p.title || p.filename}</span>
                  <span className="orphan-meta">{formatBytes(p.sizeBytes)}</span>
                  <span className="orphan-meta">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
              ))}
            </div>
            {panoramas.orphanCount > panoramas.orphans.length && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 0' }}>
                Hiển thị {panoramas.orphans.length} ảnh đầu tiên trên tổng số {panoramas.orphanCount}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Số liệu nhập tay: tách riêng, ghi rõ nguồn */}
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <h3 className="panel-title">Số liệu nhập thủ công</h3>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color)' }}>
              {manualMetrics.totalQrScans.toLocaleString('vi-VN')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-main)' }}>lượt quét QR</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5 }}>
            Nguồn: {manualMetrics.source}. Đây không phải số đo tự động, hệ thống chưa ghi nhận
            sự kiện quét thật, nên không dùng con số này để kết luận về lượng khách tham quan.
          </p>
        </div>
      </div>
    </div>
  );
};
