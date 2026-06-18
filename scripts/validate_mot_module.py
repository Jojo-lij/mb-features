from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
MOT_PATH = ROOT / "js" / "modules" / "mot.js"
APP_PATH = ROOT / "js" / "app.js"

REQUIRED_SECTIONS = [
    "发现与选择",
    "价格与权益确认",
    "入住前确定性",
    "到店入住",
    "住中即时服务",
    "离店后闭环",
]

REQUIRED_FEATURES = [
    "智能选店助手",
    "酒店横向对比",
    "场景化酒店推荐",
    "人群化专项推荐",
    "目的地便利度评估",
    "权益最优推荐",
    "低摩擦身份认证",
    "会员权益价值显性化",
    "决策证据增强",
    "低价提醒",
    "候选房型与价格方案暂存",
    "入住准备清单",
    "房间准备状态",
    "AI 服务助手",
    "服务进度追踪",
    "积分获取与兑换闭环",
    "电子发票",
]


def fail(message):
    raise SystemExit(f"FAIL: {message}")


def main():
    mot = MOT_PATH.read_text(encoding="utf-8")
    app = APP_PATH.read_text(encoding="utf-8")

    for section in REQUIRED_SECTIONS:
        if section not in mot:
            fail(f"missing MOT section: {section}")

    section_count = len(re.findall(r"name:\s*'(?:发现与选择|价格与权益确认|入住前确定性|到店入住|住中即时服务|离店后闭环)'", mot))
    if section_count != 6:
        fail(f"MOT should have 6 journey sections, got {section_count}")

    if re.search(r"name:\s*'P[012] ·", mot):
        fail("section names should not carry priority; priority belongs to each MOT feature")

    if "name: '积分'" in mot:
        fail("standalone 积分 section should be merged into MOT sections")

    if "features: []" in mot:
        fail("MOT sections must not be empty")

    for feature in REQUIRED_FEATURES:
        if feature not in mot:
            fail(f"missing MOT feature: {feature}")

    live_count = mot.count("status: '已上线'")
    total_count = len(re.findall(r"id:\s*'MOT-", mot))
    if live_count:
        fail(f"MOT should focus on new/iteration/pending features, got {live_count} live items")
    if total_count < 24:
        fail(f"MOT should contain at least 24 feature ideas, got {total_count}")

    priority_count = len(re.findall(r"priority:\s*'P[012]'", mot))
    if priority_count != total_count:
        fail(f"every MOT feature should have its own priority, got {priority_count}/{total_count}")

    for status in ("新功能", "功能迭代", "待确认"):
        if f"status: '{status}'" not in mot:
            fail(f"missing status: {status}")

    for marker in ("mot-board", "mot-section-card", "mot-card-priority", "mot-card-status", "mot-card-id"):
        if marker not in app:
            fail(f"MOT rendering missing marker: {marker}")

    print("PASS: MOT module content is valid")


if __name__ == "__main__":
    main()
