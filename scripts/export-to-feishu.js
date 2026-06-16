/**
 * 万豪功能说明 — 飞书表格导出脚本
 *
 * 用途：将本地 js/modules/*.js 数据导出为 CSV，供导入飞书多维表格
 * 用法：node scripts/export-to-feishu.js
 * 输出：APP功能说明/export_YYYY-MM-DD.csv
 *
 * 字段映射（与飞书表格一致）：
 *   功能编号 | 功能名称 | 模块名称 | 分组名称 | 状态 | 简要说明 | 功能说明 | 截图路径 | 更新记录 | 排序
 */

const fs = require('fs');
const path = require('path');

// 配置
const REPO_ROOT = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(REPO_ROOT, 'js', 'modules');
const OUTPUT_DIR = REPO_ROOT;

// 状态映射：本地 → 飞书显示
const STATUS_MAP = {
  live: '已上线',
  new: '新增',
  iterate: '迭代中',
  design: '设计中',
  pending: '待确认'
};

// CSV 转义
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // 如果包含逗号、引号或换行，需要包裹引号
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// 提取截图路径（screenshot 或 screenshots）
function getScreenshotPaths(feature) {
  if (feature.screenshots && Array.isArray(feature.screenshots)) {
    return feature.screenshots.join('\n');
  }
  if (feature.screenshot) {
    return feature.screenshot;
  }
  return '';
}

// 读取模块文件并解析
function parseModules() {
  const modules = [];

  // 模拟 modules.push 环境
  const mockModules = {
    push: (module) => modules.push(module)
  };

  // 读取所有模块文件
  const files = fs.readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const filePath = path.join(MODULES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // 用 eval 在模拟环境中执行（模块文件结构简单，安全）
    // 替换 modules.push 为 mockModules.push
    const wrapped = content.replace(/modules\.push/g, 'mockModules.push');
    try {
      eval(wrapped);
    } catch (err) {
      console.error(`解析失败: ${file} — ${err.message}`);
    }
  }

  return modules;
}

// 生成 CSV
function generateCSV(modules) {
  const headers = [
    '功能编号', '功能名称', '模块名称', '分组名称', '状态',
    '简要说明', '功能说明', '截图路径', '更新记录', '排序'
  ];

  const rows = [];
  rows.push(headers.map(escapeCSV).join(','));

  let order = 0;

  for (const module of modules) {
    // 跳过特殊模块（overview, benchmark）
    if (module.isOverview || module.isBenchmark) continue;

    const moduleName = module.name || '';

    if (!module.sections || !Array.isArray(module.sections)) continue;

    for (const section of module.sections) {
      const sectionName = section.name || '';

      if (!section.features || !Array.isArray(section.features)) continue;

      for (const feature of section.features) {
        order++;
        const row = [
          feature.id || '',
          feature.name || '',
          moduleName,
          sectionName,
          STATUS_MAP[feature.status] || feature.status || '待确认',
          feature.desc || '',
          feature.detail || '',
          getScreenshotPaths(feature),
          feature.updateLog || '',
          order
        ];
        rows.push(row.map(escapeCSV).join(','));
      }
    }
  }

  return rows.join('\n');
}

// 主函数
function main() {
  console.log('开始导出模块数据...');
  console.log(`模块目录: ${MODULES_DIR}`);

  const modules = parseModules();
  console.log(`解析完成: ${modules.length} 个模块`);

  const csv = generateCSV(modules);

  const date = new Date().toISOString().split('T')[0];
  const outputFile = path.join(OUTPUT_DIR, `export_${date}.csv`);

  fs.writeFileSync(outputFile, '﻿' + csv, 'utf-8'); // BOM for Excel

  console.log(`导出完成: ${outputFile}`);
  console.log(`总行数: ${csv.split('\n').length - 1} 条功能记录`);
}

main();
