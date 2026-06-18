from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
ANALYSIS_PATH = ROOT / "js" / "benchmark-analysis.js"
INDEX_PATH = ROOT / "index.html"
APP_PATH = ROOT / "js" / "app.js"

REQUIRED_FEATURES = {
    "F001",
    "F002",
    "F003",
    "F004",
    "F005",
    "F006",
    "F007",
    "F012",
    "F013",
    "F017",
}


def fail(message):
    raise SystemExit(f"FAIL: {message}")


def assert_contains(text, needle, label):
    if needle not in text:
        fail(f"{label} missing: {needle}")


def main():
    if not ANALYSIS_PATH.exists():
        fail("js/benchmark-analysis.js does not exist")

    analysis = ANALYSIS_PATH.read_text(encoding="utf-8")
    index = INDEX_PATH.read_text(encoding="utf-8")
    app = APP_PATH.read_text(encoding="utf-8")

    assert_contains(analysis, "window.benchmarkAnalysis", "analysis export")

    missing_features = [
        feature_id for feature_id in REQUIRED_FEATURES
        if not re.search(rf"\b{feature_id}\b", analysis)
    ]
    if missing_features:
        fail(f"analysis missing feature ids: {', '.join(missing_features)}")

    for field in ("evidence", "verification", "gap", "directions"):
        assert_contains(analysis, field, "analysis field")

    for phrase in (
        "住宿旅程管家",
        "住前选择权",
        "住中自助服务",
        "离店后闭环",
        "第一优先级标杆",
    ):
        assert_contains(analysis, phrase, "positioning analysis phrase")

    analysis_script = '<script src="js/benchmark-analysis.js"></script>'
    app_script = '<script src="js/app.js"></script>'
    if analysis_script not in index:
        fail("index.html does not load js/benchmark-analysis.js")
    if index.index(analysis_script) > index.index(app_script):
        fail("js/benchmark-analysis.js must load before js/app.js")

    assert_contains(app, "window.benchmarkAnalysis", "drawer lookup")
    assert_contains(app, "analysis?.verification", "manual verification rendering")
    assert_contains(app, "analysis?.gap", "manual gap rendering")
    assert_contains(app, "analysis?.evidence", "manual evidence rendering")
    assert_contains(app, "bm-position-panel", "positioning panel rendering")
    assert_contains(app, "bm-mot-panel", "MOT panel rendering")
    assert_contains(analysis, "关键 MOT 组", "MOT group title")
    assert_contains(analysis, "发现与选择", "MOT discovery")
    assert_contains(analysis, "价格与权益确认", "MOT value")
    assert_contains(analysis, "到店入住", "MOT arrival")
    assert_contains(app, "(mot.moments || []).length", "MOT count rendering")
    mot_count = len(re.findall(r'name:\s*"', analysis.split("featurePositions", 1)[0]))
    if mot_count < 6:
        fail(f"MOT moments should be at least 6, got {mot_count}")

    print("PASS: benchmark analysis wiring is valid")


if __name__ == "__main__":
    main()
