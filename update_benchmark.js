const fs = require('fs');
const path = require('path');

// 读取当前 benchmarkData
const appJsPath = path.join(__dirname, 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf-8');

// 提取 benchmarkData
const bmMatch = appJsContent.match(/const benchmarkData = ({.+?});\s*\n/);
if (!bmMatch) {
  console.error('Could not find benchmarkData');
  process.exit(1);
}

const benchmarkData = JSON.parse(bmMatch[1]);

// 读取 Excel markdown
const mdPath = path.join(__dirname, '功能对标分析', '酒店行业APP功能对标分析表.md');
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// 品牌映射：Excel列名 -> benchmarkData key
const brandMap = {
  '万豪旅享家': 'marriott',
  '华住会': 'huazhu',
  '洲际优悦会': 'ihg',
  '亚朵': 'atour',
  '文华东方': 'mandarinOriental',
  '希尔顿荣誉会': 'hilton'
};

// 解析 markdown 表格
const lines = mdContent.split('\n');
const dataRows = [];
let headerLine = null;

for (const line of lines) {
  if (line.startsWith('| 一级模块')) {
    headerLine = line;
    continue;
  }
  if (line.startsWith('|----------') || line.startsWith('|------') || !line.startsWith('|')) {
    continue;
  }
  if (line.startsWith('|') && headerLine) {
    // 解析数据行
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length >= 10) {
      dataRows.push({
        module1: cells[0],
        module2: cells[1],
        name: cells[2],
        description: cells[3],
        marriott: cells[4],
        huazhu: cells[5],
        ihg: cells[6],
        atour: cells[7],
        mandarinOriental: cells[8],
        hilton: cells[9]
      });
    }
  }
}

console.log(`Parsed ${dataRows.length} rows from Excel markdown`);

// 解析分数（从单元格文本中提取数字和备注）
function parseScore(cellText) {
  if (!cellText || cellText.trim() === '') {
    return { score: null, note: '' };
  }

  const trimmed = cellText.trim();

  // 匹配开头的数字
  const numMatch = trimmed.match(/^(\d)/);
  if (numMatch) {
    const score = parseInt(numMatch[1]);
    // 提取备注（去掉数字和 <br> 标签）
    let note = trimmed.substring(1).trim();
    // 去掉 <br> 和 <small> 标签
    note = note.replace(/<br\s*\/?>/gi, ' ').replace(/<\/?small>/gi, '').trim();
    // 去掉开头的 "- "
    note = note.replace(/^-\s*/, '').trim();
    return { score, note };
  }

  return { score: null, note: '' };
}

// 构建 Excel 数据映射：功能名 -> 各品牌评分
const excelMap = new Map();
for (const row of dataRows) {
  const key = row.name.trim();
  const ratings = {};

  for (const [excelName, bmKey] of Object.entries(brandMap)) {
    const cellText = row[bmKey];
    ratings[bmKey] = parseScore(cellText);
  }

  excelMap.set(key, { ...row, ratings });
}

// 更新 benchmarkData 中的评分
let updatedCount = 0;
let mismatchLog = [];

for (const module of benchmarkData.modules) {
  for (const section of module.sections) {
    for (const feature of section.features) {
      const excelRow = excelMap.get(feature.name);

      if (excelRow) {
        // 更新各品牌评分
        for (const [excelName, bmKey] of Object.entries(brandMap)) {
          const excelRating = excelRow.ratings[bmKey];
          const currentRating = feature.ratings[bmKey];

          if (currentRating) {
            const oldScore = currentRating.score;
            const newScore = excelRating.score;

            if (oldScore !== newScore) {
              mismatchLog.push({
                feature: feature.id,
                name: feature.name,
                brand: bmKey,
                old: oldScore,
                new: newScore,
                note: excelRating.note
              });
              currentRating.score = newScore;
              if (excelRating.note) {
                currentRating.note = excelRating.note;
              }
              updatedCount++;
            }
          }
        }

        // 香格里拉：Excel 中没有，保持原值（null）
      } else {
        console.log(`Warning: Feature "${feature.name}" (${feature.id}) not found in Excel`);
      }
    }
  }
}

console.log(`\nUpdated ${updatedCount} ratings`);
console.log(`\nMismatches found: ${mismatchLog.length}`);

// 打印前 20 个不匹配
mismatchLog.slice(0, 20).forEach(m => {
  console.log(`  ${m.feature} ${m.name}: ${m.brand} ${m.old} -> ${m.new} ${m.note ? '(' + m.note + ')' : ''}`);
});

// 检查是否有新功能点需要添加
const existingFeatureNames = new Set();
for (const module of benchmarkData.modules) {
  for (const section of module.sections) {
    for (const feature of section.features) {
      existingFeatureNames.add(feature.name);
    }
  }
}

const newFeatures = [];
for (const [name, row] of excelMap) {
  if (!existingFeatureNames.has(name)) {
    newFeatures.push({ name, ...row });
  }
}

console.log(`\nNew features to add: ${newFeatures.length}`);
newFeatures.forEach(f => console.log(`  - ${f.name}`));

// 更新 summary
benchmarkData.summary.level3 = 148;

// 输出更新后的 benchmarkData
const updatedBmString = JSON.stringify(benchmarkData);

// 替换 app.js 中的 benchmarkData
const newAppJsContent = appJsContent.replace(
  /const benchmarkData = {.+?};\s*\n/,
  `const benchmarkData = ${updatedBmString};\n`
);

fs.writeFileSync(appJsPath, newAppJsContent);
console.log('\napp.js updated successfully!');

// 保存日志
const logPath = path.join(__dirname, 'benchmark_update_log.json');
fs.writeFileSync(logPath, JSON.stringify({
  updatedCount,
  mismatches: mismatchLog,
  newFeatures: newFeatures.map(f => f.name)
}, null, 2));
console.log(`Log saved to ${logPath}`);
