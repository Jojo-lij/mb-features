import json
import re
import os

# 读取当前 benchmarkData
app_js_path = os.path.join(os.path.dirname(__file__), 'js', 'app.js')
with open(app_js_path, 'r', encoding='utf-8') as f:
    app_js_content = f.read()

# 提取 benchmarkData
start_marker = 'const benchmarkData = '
end_marker = ';\n    const bmBrands'

start_idx = app_js_content.find(start_marker)
end_idx = app_js_content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Could not find benchmarkData boundaries')
    exit(1)

bm_json_str = app_js_content[start_idx + len(start_marker):end_idx]

benchmark_data = json.loads(bm_json_str)
print(f'Loaded benchmarkData with {benchmark_data["summary"]["level3"]} features')

# 读取 Excel markdown
md_path = os.path.join(os.path.dirname(__file__), '功能对标分析', '酒店行业APP功能对标分析表.md')
with open(md_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

# 品牌映射
brand_map = {
    '万豪旅享家': 'marriott',
    '华住会': 'huazhu',
    '洲际优悦会': 'ihg',
    '亚朵': 'atour',
    '文华东方': 'mandarinOriental',
    '希尔顿荣誉会': 'hilton'
}

# 解析 markdown 表格 - 修复分隔行检测
def is_separator_line(line):
    """判断是否为分隔行（只包含 |、-、:、空格）"""
    stripped = line.strip()
    return all(c in '|-: ' for c in stripped)

lines = md_content.split('\n')
data_rows = []

for line in lines:
    if not line.strip().startswith('|'):
        continue
    if is_separator_line(line):
        continue
    # 跳过表头
    if '一级模块' in line:
        continue
    cells = line.split('|')
    cells = [c.strip() for c in cells]
    cells = cells[1:-1]  # 去掉首尾空元素

    if len(cells) >= 10:
        data_rows.append({
            'name': cells[2],
            'marriott': cells[4],
            'huazhu': cells[5],
            'ihg': cells[6],
            'atour': cells[7],
            'mandarinOriental': cells[8],
            'hilton': cells[9]
        })

print(f'Parsed {len(data_rows)} rows from Excel markdown')

# 解析分数
def parse_score(cell_text):
    if not cell_text or cell_text.strip() == '':
        return {'score': None, 'note': ''}

    trimmed = cell_text.strip()
    num_match = re.match(r'^(\d)', trimmed)
    if num_match:
        score = int(num_match.group(1))
        note = trimmed[1:].strip()
        note = re.sub(r'<br\s*/?>', ' ', note, flags=re.IGNORECASE)
        note = re.sub(r'</?small>', '', note, flags=re.IGNORECASE).strip()
        note = re.sub(r'^-\s*', '', note).strip()
        return {'score': score, 'note': note}

    return {'score': None, 'note': ''}

# 构建 Excel 数据映射
excel_map = {}
for row in data_rows:
    key = row['name'].strip()
    ratings = {}
    for excel_name, bm_key in brand_map.items():
        ratings[bm_key] = parse_score(row[bm_key])
    excel_map[key] = ratings

# 更新 benchmarkData 中的评分
updated_count = 0
mismatch_log = []

for module in benchmark_data['modules']:
    for section in module['sections']:
        for feature in section['features']:
            excel_ratings = excel_map.get(feature['name'])

            if excel_ratings:
                for excel_name, bm_key in brand_map.items():
                    excel_rating = excel_ratings[bm_key]
                    current_rating = feature['ratings'].get(bm_key)

                    if current_rating:
                        old_score = current_rating['score']
                        new_score = excel_rating['score']

                        if old_score != new_score:
                            mismatch_log.append({
                                'feature': feature['id'],
                                'name': feature['name'],
                                'brand': bm_key,
                                'old': old_score,
                                'new': new_score,
                                'note': excel_rating['note']
                            })
                            current_rating['score'] = new_score
                            if excel_rating['note']:
                                current_rating['note'] = excel_rating['note']
                            updated_count += 1
            else:
                print(f'Warning: Feature "{feature["name"]}" ({feature["id"]}) not found in Excel')

print(f'\nUpdated {updated_count} ratings')
print(f'Mismatches found: {len(mismatch_log)}')

for m in mismatch_log[:50]:
    note_str = f' ({m["note"]})' if m['note'] else ''
    print(f'  {m["feature"]} {m["name"]}: {m["brand"]} {m["old"]} -> {m["new"]}{note_str}')
if len(mismatch_log) > 50:
    print(f'  ... and {len(mismatch_log) - 50} more')

# 检查新功能点
existing_feature_names = set()
for module in benchmark_data['modules']:
    for section in module['sections']:
        for feature in section['features']:
            existing_feature_names.add(feature['name'])

new_features = []
for name in excel_map:
    if name not in existing_feature_names:
        new_features.append(name)

print(f'\nNew features to add: {len(new_features)}')
for f in new_features:
    print(f'  - {f}')

# 添加新功能点
# F145 用户偏好收集 -> 启动与引导 > 新用户引导
# F146 会员卡引导 -> 酒店预订全流程 > 酒店详情页
# F147 满意度调研 -> 酒店预订全流程 > 预订流程
# F148 取消原因 -> 酒店预订全流程 > 订单管理

new_feature_defs = [
    {
        'excel_name': '用户偏好收集',
        'id': 'F145',
        'name': '用户偏好收集',
        'module': '启动与引导',
        'section': '新用户引导',
        'description': '以问卷形式收集用户偏好（地理位置、旅行习惯等）'
    },
    {
        'excel_name': '会员卡引导（部分酒店适用）',
        'id': 'F146',
        'name': '会员卡引导（部分酒店适用）',
        'module': '酒店预订全流程',
        'section': '酒店详情页',
        'description': '引导用户购买付费会员卡'
    },
    {
        'excel_name': '满意度调研',
        'id': 'F147',
        'name': '满意度调研',
        'module': '酒店预订全流程',
        'section': '预订流程',
        'description': '询问用户对于预定流程的满意度'
    },
    {
        'excel_name': '取消原因',
        'id': 'F148',
        'name': '取消原因',
        'module': '酒店预订全流程',
        'section': '订单管理',
        'description': '填写取消原因'
    }
]

for fdef in new_feature_defs:
    excel_name = fdef['excel_name']
    if excel_name not in excel_map:
        print(f'  Skipping {excel_name}: not found in Excel')
        continue

    ratings_data = excel_map[excel_name]

    # 构建 ratings 对象
    ratings = {}
    for excel_label, bm_key in brand_map.items():
        r = ratings_data[bm_key]
        ratings[bm_key] = {'score': r['score'], 'note': r['note']}
    # 香格里拉默认 null
    ratings['shangriLa'] = {'score': None, 'note': '待验证'}

    new_feature = {
        'id': fdef['id'],
        'name': fdef['name'],
        'description': fdef['description'],
        'ratings': ratings,
        'matches': []
    }

    # 找到目标 module 和 section，添加功能
    for module in benchmark_data['modules']:
        if module['name'] == fdef['module']:
            for section in module['sections']:
                if section['name'] == fdef['section']:
                    section['features'].append(new_feature)
                    print(f'  Added {fdef["id"]} {fdef["name"]} to {fdef["module"]} > {fdef["section"]}')
                    break
            break

# 更新 summary
benchmark_data['summary']['level3'] = 148

# 输出更新后的 benchmarkData
updated_bm_string = json.dumps(benchmark_data, ensure_ascii=False)

# 替换 app.js 中的 benchmarkData
new_app_js_content = (
    app_js_content[:start_idx + len(start_marker)] +
    updated_bm_string +
    app_js_content[end_idx:]
)

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(new_app_js_content)

print('\napp.js updated successfully!')

# 保存日志
log_path = os.path.join(os.path.dirname(__file__), 'benchmark_update_log.json')
with open(log_path, 'w', encoding='utf-8') as f:
    json.dump({
        'updatedCount': updated_count,
        'mismatches': mismatch_log,
        'newFeatures': new_features
    }, f, ensure_ascii=False, indent=2)

print(f'Log saved to {log_path}')
