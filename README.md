# 人生地图 · Life Atlas

一个本地优先的个人生命记录应用：从 3D 地球放大到城市与区县，点击大致位置后记录亲身经历，并可让 AI 在不编造事实的前提下帮你完善叙述。

## 已实现

- 地球与地图合并为一个 MapLibre 模块，远看是球体，放大后进入城市/区县地图
- 搜索城市或区县、点击地图、或使用设备当前位置
- 点击已有坐标查看经历，并可新建、编辑、删除和检索记录
- 记录时间、类型、人物、原始片段、完整叙事、摘要、感悟和标签
- 无 API Key 时提供本地智能整理（断句、分段、去重、摘要和标签）；配置 Key 后自动升级为 OpenAI 润色
- 双栏记忆工作台：左侧记录与逐项接受整理建议，右侧固定显示地图位置、记忆卡和照片时间线预览
- 30 秒快速记录与完整经历两种模式，支持原文保留、情绪、人物、人生章节、标签和私密等级
- 照片、视频、语音与文件保存到本地 R2 对象存储；照片可读取拍摄时间和位置
- 草稿自动保存和离开保护，默认仅自己可见
- 人生主线 XY 时间轴：X 轴是时间，Y 轴是不同主线，支持进度、下一步和关联经历节点
- 项目内本地 D1/SQLite 持久化，刷新和重启后仍保留经历

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。本地数据保存在项目的 `.wrangler/` 目录，该目录已被 Git 忽略。

## 可选：将本地整理升级为 OpenAI 完善

可直接点击地图右上角的“AI API 设置”，选择 OpenAI 或 DeepSeek，输入对应 API Key、模型 ID 并测试连接。两家的凭据分开保存；DeepSeek Responses API 默认使用 `deepseek-v4-flash`。默认只保存在当前浏览器会话；只有主动勾选后才会记住在此设备。API Key 不会写入人生记录数据库。

也可继续使用 `.env` 方式：

将 `.env.example` 复制为 `.env`，填入自己的 OpenAI API Key：

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.4-mini
```

然后重启 `npm run dev`。未配置时功能仍可用，并且内容不离开电脑。配置后，密钥只在本地服务端使用，不会发送到浏览器；点击完善时，当前草稿会发送到 OpenAI Responses API 进行处理。

## 校验

```bash
npm run build
npm test
npm run test:api   # 需要先启动 npm run dev
npx tsc --noEmit
npm run lint
```

## 数据说明

首次启动会放入几条可直接查看的演示经历，可以在界面内删除它们。

地图数据使用 OpenFreeMap/OpenStreetMap，地点名称查询使用 Nominatim，需要联网，不需要 Mapbox Token。
