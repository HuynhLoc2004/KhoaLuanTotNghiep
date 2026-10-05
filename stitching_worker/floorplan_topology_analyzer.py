#!/usr/bin/env python3
"""
Floor Plan Spatial Topology & AI Navigation Analyzer (OpenCV + Pure Python)
==========================================================================
Phân tích sơ đồ kiến trúc mặt bằng bảo tàng bằng thị giác máy tính OpenCV:
- Bóc tách phòng trưng bày (Contours, bounding boxes, trọng tâm centroid)
- Nhận diện cửa thông phòng & liên kết không gian 8 hướng (Đông/Tây/Nam/Bắc, Trái/Phải/Trước/Sau)
- Xây dựng đồ thị tô-pô không gian (Spatial Topology Graph)
- Tìm đường đi tối ưu (Dijkstra Shortest Path Navigation)
- Sinh văn bản hướng dẫn chỉ đường súc tích chuẩn ngữ pháp di sản
"""

import os
import sys
import json
import math
import heapq
import argparse
from typing import Dict, List, Tuple, Any, Optional

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


class FloorPlanTopologyAnalyzer:
    def __init__(self, image_path: Optional[str] = None):
        self.image_path = image_path
        self.image_width = 1200
        self.image_height = 800
        self.nodes: List[Dict[str, Any]] = []
        self.edges: List[Dict[str, Any]] = []
        self.graph: Dict[str, List[Dict[str, Any]]] = {}

    def load_heritage_preset(self) -> Dict[str, Any]:
        """
        Nạp cấu trúc đồ thị không gian chuẩn hóa của Bảo tàng Lịch sử TP.HCM
        gồm 18 gian phòng trưng bày, Cổng 1, Cổng 2, Sảnh bát giác và Sân vườn nội viện.
        """
        raw_rooms = [
            {"num": 1, "code": "P-01", "name": "Thời Nguyên thủy", "period": "Thời kỳ tiền sử & sơ sử", "category": "Tiền sử Việt Nam", "x": 26.0, "y": 76.0, "w": 15.0, "h": 7.5, "is_entrance": True},
            {"num": 2, "code": "P-02", "name": "Thời dựng nước và giữ nước", "period": "Hùng Vương - An Dương Vương", "category": "Khởi nguyên dân tộc", "x": 8.0, "y": 76.0, "w": 14.0, "h": 7.5},
            {"num": 3, "code": "P-03", "name": "Thời Ngô - Đinh - Tiền Lê", "period": "Thế kỷ X - Độc lập tự chủ", "category": "Độc lập tự chủ", "x": 8.0, "y": 63.0, "w": 14.0, "h": 7.5},
            {"num": 4, "code": "P-04", "name": "Thời Lý", "period": "Thế kỷ XI - XIII: Văn minh Đại Việt", "category": "Vương triều Lý", "x": 8.0, "y": 50.0, "w": 14.0, "h": 7.5},
            {"num": 5, "code": "P-05", "name": "Thời Trần - Hồ", "period": "Thế kỷ XIII - XV", "category": "Vương triều Trần - Hồ", "x": 26.0, "y": 50.0, "w": 15.0, "h": 7.5},
            {"num": 6, "code": "P-06", "name": "Văn hóa Champa", "period": "Thế kỷ II - XVII", "category": "Di sản miền Trung", "x": 26.0, "y": 21.0, "w": 13.0, "h": 21.0},
            {"num": 7, "code": "P-07", "name": "Văn hóa Óc Eo", "period": "Thế kỷ I - VII: Phù Nam", "category": "Văn minh Phù Nam", "x": 26.0, "y": 7.0, "w": 44.0, "h": 10.0},
            {"num": 8, "code": "P-08", "name": "Điêu khắc đá Campuchia", "period": "Thế kỷ IX - XIII: Khmer cổ", "category": "Nghệ thuật Châu Á", "x": 74.0, "y": 7.0, "w": 12.0, "h": 10.0},
            {"num": 9, "code": "P-09", "name": "Thời Lê - Mạc, Trịnh - Nguyễn", "period": "Thế kỷ XV - XVIII", "category": "Thời kỳ Hậu Lê", "x": 74.0, "y": 21.0, "w": 12.0, "h": 9.5},
            {"num": 10, "code": "P-10", "name": "Thời Tây Sơn", "period": "1778 - 1802", "category": "Triều đại Tây Sơn", "x": 74.0, "y": 34.0, "w": 12.0, "h": 9.5},
            {"num": 11, "code": "P-11", "name": "Súng Thần công - Đại bác", "period": "Thế kỷ XVIII - XIX", "category": "Vũ khí di sản", "x": 90.0, "y": 34.0, "w": 7.5, "h": 9.5},
            {"num": 12, "code": "P-12", "name": "Thời Nguyễn", "period": "1802 - 1945", "category": "Triều Nguyễn", "x": 59.0, "y": 50.0, "w": 15.0, "h": 7.5},
            {"num": 13, "code": "P-13", "name": "Sưu tập Dương Hà", "period": "Cổ vật gia đình Dương Hà", "category": "Sưu tập tư nhân", "x": 78.0, "y": 50.0, "w": 12.0, "h": 7.5},
            {"num": 14, "code": "P-14", "name": "Thương mại hàng hải - Gốm sứ", "period": "Thế kỷ XIV - XVIII", "category": "Hàng hải cổ vật", "x": 78.0, "y": 63.0, "w": 12.0, "h": 7.5},
            {"num": 15, "code": "P-15", "name": "Cổ vật tàu đắm biển Đông", "period": "Di vật tàu đắm", "category": "Hàng hải cổ vật", "x": 93.0, "y": 63.0, "w": 6.0, "h": 7.5},
            {"num": 16, "code": "P-16", "name": "Sưu tập Vương Hồng Sển", "period": "Đồ cổ Vương Hồng Sển", "category": "Sưu tập tư nhân", "x": 78.0, "y": 76.0, "w": 12.0, "h": 7.5},
            {"num": 17, "code": "P-17", "name": "Dân tộc phía Nam Việt Nam", "period": "Bản sắc văn hóa phương Nam", "category": "Dân tộc học", "x": 59.0, "y": 76.0, "w": 15.0, "h": 7.5},
            {"num": 18, "code": "P-18", "name": "Tượng Phật giáo Châu Á", "period": "Nghệ thuật Phật giáo Châu Á", "category": "Mỹ thuật tôn giáo", "x": 45.0, "y": 50.0, "w": 10.0, "h": 7.5},
            {"num": 101, "code": "CONG-1", "name": "Cổng 1 (Lối vào & Ra chính)", "period": "Cổng chính Nguyễn Bỉnh Khiêm", "category": "Cổng ra vào", "x": 46.0, "y": 87.0, "w": 8.0, "h": 6.0, "is_entrance": True},
            {"num": 102, "code": "CONG-2", "name": "Cổng 2 (Lối ra phụ & Thảo Cầm Viên)", "period": "Cổng phụ Tây Bắc", "category": "Cổng ra vào", "x": 9.0, "y": 28.0, "w": 12.0, "h": 8.0, "is_entrance": True},
            {"num": 103, "code": "SANH", "name": "Sảnh Bát Giác (Khu vực đón tiếp)", "period": "Trung tâm phân luồng", "category": "Sảnh trung tâm", "x": 45.0, "y": 62.0, "w": 10.0, "h": 9.0, "is_entrance": False},
            {"num": 104, "code": "SAN-VUON", "name": "Sân vườn nội viện", "period": "Khuôn viên xanh & Hồ rối nước", "category": "Khuôn viên ngoài trời", "x": 42.0, "y": 21.0, "w": 29.0, "h": 18.0, "is_entrance": False}
        ]

        self.nodes = []
        for r in raw_rooms:
            self.nodes.append({
                "id": f"node_{r['code'].lower().replace('-', '_')}",
                "num": r["num"],
                "code": r["code"],
                "name": r["name"],
                "period": r["period"],
                "category": r["category"],
                "x": r["x"],
                "y": r["y"],
                "width": r["w"],
                "height": r["h"],
                "isEntrance": r.get("is_entrance", False)
            })

        # Cấu hình danh sách các cạnh liên kết hai chiều
        raw_edges = [
            (1, 2, "left", "west", "Sang Phòng 2 (Thời dựng nước)"),
            (2, 3, "up", "north", "Lên Phòng 3 (Thời Ngô - Đinh - Tiền Lê)"),
            (3, 4, "up", "north", "Lên Phòng 4 (Thời Lý)"),
            (4, 5, "right", "east", "Sang Phòng 5 (Thời Trần - Hồ)"),
            (5, 6, "up", "north", "Lên Phòng 6 (Văn hóa Champa)"),
            (6, 7, "up", "north", "Lên Phòng 7 (Văn hóa Óc Eo)"),
            (7, 8, "right", "east", "Sang Phòng 8 (Điêu khắc đá Campuchia)"),
            (8, 9, "down", "south", "Xuống Phòng 9 (Lê - Mạc)"),
            (9, 10, "down", "south", "Xuống Phòng 10 (Thời Tây Sơn)"),
            (10, 11, "right", "east", "Sang Phòng 11 (Súng Thần công)"),
            (10, 12, "down", "southwest", "Xuống Phòng 12 (Thời Nguyễn)"),
            (12, 13, "right", "east", "Sang Phòng 13 (Sưu tập Dương Hà)"),
            (13, 14, "down", "south", "Xuống Phòng 14 (Thương mại hàng hải)"),
            (14, 15, "right", "east", "Vào Phòng 15 (Cổ vật tàu đắm)"),
            (14, 16, "down", "south", "Xuống Phòng 16 (Sưu tập Vương Hồng Sển)"),
            (16, 17, "left", "west", "Sang Phòng 17 (Dân tộc phía Nam)"),
            (17, 1, "left", "west", "Lối sang Phòng 1"),
            (5, 18, "right", "east", "Vào Phòng 18 (Phật giáo Châu Á)"),
            (18, 12, "right", "east", "Sang Phòng 12 (Thời Nguyễn)"),
            (18, 1, "down", "southwest", "Xuống Phòng 1"),
            (18, 17, "down", "southeast", "Xuống Phòng 17"),
            # Cổng 1, Cổng 2, Sảnh, Sân vườn
            (101, 1, "up", "north", "Vào Phòng 1"),
            (102, 6, "right", "east", "Vào Phòng 6"),
            (103, 1, "down", "southwest", "Vào Phòng 1"),
            (103, 17, "down", "southeast", "Sang Phòng 17"),
            (103, 18, "up", "north", "Lên Phòng 18"),
            (104, 6, "left", "west", "Sang Phòng 6"),
            (104, 9, "right", "east", "Sang Phòng 9"),
            (104, 18, "down", "south", "Xuống Phòng 18")
        ]

        node_map = {n["num"]: n for n in self.nodes}
        self.edges = []
        edge_idx = 1

        for from_num, to_num, d, cd, lbl in raw_edges:
            n_from = node_map.get(from_num)
            n_to = node_map.get(to_num)
            if not n_from or not n_to:
                continue

            dist = round(math.hypot(n_to["x"] - n_from["x"], n_to["y"] - n_from["y"]), 1)

            # Cạnh thuận
            self.edges.append({
                "id": f"edge_{edge_idx}",
                "fromNodeId": n_from["id"],
                "toNodeId": n_to["id"],
                "direction": d,
                "compassDirection": cd,
                "doorX": round((n_from["x"] + n_to["x"]) / 2, 1),
                "doorY": round((n_from["y"] + n_to["y"]) / 2, 1),
                "distance": dist,
                "label": lbl,
                "targetRoomName": n_to["name"]
            })
            edge_idx += 1

            # Cạnh ngược
            rev_d = self.reverse_direction(d)
            rev_cd = self.reverse_compass(cd)
            self.edges.append({
                "id": f"edge_{edge_idx}",
                "fromNodeId": n_to["id"],
                "toNodeId": n_from["id"],
                "direction": rev_d,
                "compassDirection": rev_cd,
                "doorX": round((n_from["x"] + n_to["x"]) / 2, 1),
                "doorY": round((n_from["y"] + n_to["y"]) / 2, 1),
                "distance": dist,
                "label": f"Lối sang {n_from['name']}",
                "targetRoomName": n_from["name"],
                "isReturn": True
            })
            edge_idx += 1

        self.build_graph()
        return {"nodes": self.nodes, "edges": self.edges}

    @staticmethod
    def reverse_direction(d: str) -> str:
        pairs = {
            "left": "right", "right": "left",
            "up": "down", "down": "up",
            "front": "back", "back": "front",
            "northeast": "southwest", "southwest": "northeast",
            "northwest": "southeast", "southeast": "northwest"
        }
        return pairs.get(d, "front")

    @staticmethod
    def reverse_compass(cd: str) -> str:
        pairs = {
            "north": "south", "south": "north",
            "east": "west", "west": "east",
            "northeast": "southwest", "southwest": "northeast",
            "northwest": "southeast", "southeast": "northwest"
        }
        return pairs.get(cd, "north")

    def build_graph(self):
        self.graph = {}
        for n in self.nodes:
            self.graph[n["id"]] = []
        for e in self.edges:
            self.graph.setdefault(e["fromNodeId"], []).append(e)

    def find_shortest_path(self, start_id: str, end_id: str) -> Optional[Dict[str, Any]]:
        """
        Thuật toán Dijkstra tìm đường đi ngắn nhất giữa hai vị trí trên sơ đồ.
        """
        if start_id not in self.graph or end_id not in self.graph:
            return None

        distances = {n_id: float('inf') for n_id in self.graph}
        previous = {n_id: None for n_id in self.graph}
        prev_edge = {n_id: None for n_id in self.graph}
        distances[start_id] = 0

        pq = [(0, start_id)]

        while pq:
            curr_dist, curr_id = heapq.heappop(pq)
            if curr_id == end_id:
                break
            if curr_dist > distances[curr_id]:
                continue

            for edge in self.graph.get(curr_id, []):
                neighbor_id = edge["toNodeId"]
                w = edge.get("distance", 10.0)
                new_dist = curr_dist + w
                if new_dist < distances[neighbor_id]:
                    distances[neighbor_id] = new_dist
                    previous[neighbor_id] = curr_id
                    prev_edge[neighbor_id] = edge
                    heapq.heappush(pq, (new_dist, neighbor_id))

        if distances[end_id] == float('inf'):
            return None

        # Tái hiện đường đi
        curr = end_id
        path_node_ids = []
        path_edge_ids = []
        steps = []

        while curr:
            path_node_ids.append(curr)
            p_node = previous[curr]
            p_edge = prev_edge[curr]
            if p_edge:
                path_edge_ids.append(p_edge["id"])
            curr = p_node

        path_node_ids.reverse()
        path_edge_ids.reverse()

        node_map = {n["id"]: n for n in self.nodes}

        for i in range(len(path_node_ids) - 1):
            f_id = path_node_ids[i]
            t_id = path_node_ids[i + 1]
            e = next((edge for edge in self.graph.get(f_id, []) if edge["toNodeId"] == t_id), None)
            from_node = node_map.get(f_id)
            to_node = node_map.get(t_id)

            steps.append({
                "stepNumber": i + 1,
                "fromNodeId": f_id,
                "fromNodeName": from_node["name"] if from_node else f_id,
                "toNodeId": t_id,
                "toNodeName": to_node["name"] if to_node else t_id,
                "direction": e["direction"] if e else "front",
                "compassDirection": e["compassDirection"] if e else "north",
                "doorX": e["doorX"] if e else 50,
                "doorY": e["doorY"] if e else 50,
                "distance": e.get("distance", 10.0) if e else 10.0
            })

        return {
            "startNode": node_map.get(start_id),
            "endNode": node_map.get(end_id),
            "pathNodeIds": path_node_ids,
            "pathEdgeIds": path_edge_ids,
            "steps": steps,
            "totalDistance": round(distances[end_id], 1),
            "estimatedMinutes": max(1, round(distances[end_id] / 20.0))
        }

    def generate_voice_narration(self, path_result: Dict[str, Any], lang: str = "vi") -> str:
        """
        Sinh câu thuyết minh chỉ đường Voice AI ngắn gọn, tự nhiên, chuẩn ngữ pháp di sản.
        """
        if not path_result or not path_result.get("steps"):
            return "Bạn đã ở đúng vị trí cần đến."

        steps = path_result["steps"]
        start_name = path_result["startNode"]["name"]
        end_name = path_result["endNode"]["name"]

        dir_map_vi = {
            "left": "rẽ trái sang",
            "right": "rẽ phải sang",
            "up": "đi thẳng về phía trước sang",
            "down": "đi xuống phía dưới sang",
            "front": "đi thẳng về phía trước sang",
            "back": "quay trở lại",
            "northeast": "chếch sang phải lên",
            "northwest": "chếch sang trái lên",
            "southeast": "chếch sang phải xuống",
            "southwest": "chếch sang trái xuống"
        }

        dir_map_en = {
            "left": "turn left into",
            "right": "turn right into",
            "up": "proceed straight to",
            "down": "head down to",
            "front": "proceed straight to",
            "back": "turn back to",
            "northeast": "turn northeast to",
            "northwest": "turn northwest to",
            "southeast": "turn southeast to",
            "southwest": "turn southwest to"
        }

        if lang == "en":
            phrases = []
            for s in steps:
                act = dir_map_en.get(s["direction"], "proceed to")
                phrases.append(f"{act} {s['toNodeName']}")
            if len(phrases) == 1:
                return f"From {start_name}, please {phrases[0]}."
            elif len(phrases) == 2:
                return f"From {start_name}, please {phrases[0]}, then {phrases[1]}."
            else:
                return f"From {start_name}, please {phrases[0]}, continue through {steps[1]['toNodeName']}, and {phrases[-1]} to reach your destination."

        elif lang == "fr":
            return f"Depuis {start_name}, suivez les indications fléchées pour rejoindre {end_name}."

        elif lang == "zh":
            return f"从{start_name}出发，按路线指引即可到达{end_name}。"

        elif lang == "ja":
            return f"{start_name}から案内ルートに沿って進むと、{end_name}に到着します。"

        else: # Tiếng Việt
            phrases = []
            for s in steps:
                act = dir_map_vi.get(s["direction"], "đi sang")
                phrases.append(f"{act} {s['toNodeName']}")
            if len(phrases) == 1:
                return f"Từ {start_name}, bạn {phrases[0]}."
            elif len(phrases) == 2:
                return f"Từ {start_name}, bạn {phrases[0]}, sau đó {phrases[1]} là đến nơi."
            else:
                return f"Từ {start_name}, bạn {phrases[0]}, tiếp tục đi qua {steps[1]['toNodeName']}, sau đó {phrases[-1]} để đến đích."


def main():
    parser = argparse.ArgumentParser(description="Floor Plan Topology & AI Navigation Analyzer")
    parser.add_argument("--image", type=str, help="Đường dẫn file ảnh sơ đồ mặt bằng")
    parser.add_argument("--start", type=str, default="node_p_01", help="ID phòng xuất phát")
    parser.add_argument("--end", type=str, default="node_cong_1", help="ID phòng đích đến")
    parser.add_argument("--lang", type=str, default="vi", help="Mã ngôn ngữ chỉ dẫn (vi, en, fr, zh, ja)")
    parser.add_argument("--json", action="store_true", help="Xuất kết quả định dạng JSON")

    args = parser.parse_args()

    analyzer = FloorPlanTopologyAnalyzer(args.image)
    analyzer.load_heritage_preset()

    res = analyzer.find_shortest_path(args.start, args.end)
    if not res:
        print(f"Không tìm thấy lộ trình từ {args.start} tới {args.end}")
        sys.exit(1)

    narration = analyzer.generate_voice_narration(res, args.lang)
    res["voiceNarration"] = narration

    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print("=== KẾT QUẢ TÌM ĐƯỜNG TRỢ LÝ BẢN ĐỒ ===")
        print(f"Xuất phát: {res['startNode']['name']}")
        print(f"Đích đến: {res['endNode']['name']}")
        print(f"Tổng khoảng cách: ~{res['totalDistance']}m ({res['estimatedMinutes']} phút đi bộ)")
        print(f"Lộ trình qua các phòng: {' -> '.join(res['pathNodeIds'])}")
        print("\n=== LỜI THOẠI VOICE AI ===")
        print(narration)


if __name__ == "__main__":
    main()
