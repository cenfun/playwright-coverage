# Playwright + MCR：浏览器端测试与 JavaScript 覆盖率

🌐 [English](README.md) | 简体中文

这是一个**可直接参考和复制的最小集成示例**，帮助你快速为自己的 Web 应用接入：

- **Playwright Test**：打开应用、执行真实交互并断言功能行为。
- **monocart-coverage-reports（MCR）**：汇总浏览器中实际执行的 JavaScript，生成代码覆盖率报告。

使用纯 JavaScript ESM，无需给应用代码插桩。覆盖的是**浏览器端应用代码**，不是 Playwright 测试脚本或 Node.js 后端。示例同时演示 CSS 覆盖率采集。

## 快速接入你自己的项目

要求 Node.js **22.15+（22.x）或 24+**，使用 Chromium 运行原生覆盖率采集。

### 1. 安装并启用 ESM

在项目根目录执行；全新目录先运行 `npm init -y`：

```sh
npm install --save-dev @playwright/test monocart-coverage-reports@^3
npx playwright install chromium
```

在 `package.json` 中合并以下设置，不要覆盖已有脚本：

```json
{
    "type": "module",
    "scripts": {
        "test:e2e": "playwright test"
    }
}
```

以下步骤适用于 ESM 项目。已有 Playwright 配置的项目应合并配置，不必重新初始化；不要为接入覆盖率而直接改写现有应用的模块体系。

### 2. 复制这 5 个文件

从本仓库根目录复制到你自己的项目根目录：

| 文件 | 作用 |
| --- | --- |
| [fixtures.js](fixtures.js) | 在每个测试前后启动、停止并保存页面 JS/CSS 覆盖率 |
| [mcr.config.js](mcr.config.js) | 统一报告名称、格式和输出目录 |
| [global.setup.js](global.setup.js) | 测试前清理旧报告和缓存 |
| [global-teardown.js](global-teardown.js) | 所有测试完成后合并数据并生成报告 |
| [playwright.config.js](playwright.config.js) | 配置 Chromium，连接全局生命周期 |

保留相对导入中的 `.js` 扩展名。建议在 `.gitignore` 中加入：

```gitignore
node_modules/
coverage-reports/
playwright-report/
test-results/
```

### 3. 指向你自己的应用

先启动你的 Web 应用，再在 `playwright.config.js` 的 `use` 中添加实际地址：

```js
use: {
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry'
}
```

如果希望 Playwright 自动启动应用，可在配置中添加 `webServer`，将命令和地址替换为项目实际值：

```js
webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI
}
```

已有启动流程时直接复用，不需要额外的覆盖率服务器。

### 4. 编写功能测试，导入扩展后的 `test`

创建 `tests/app.spec.js`。下面假设应用有一个初始值为 `0` 的计数器和一个 `Increment` 按钮；请替换为自己应用的选择器、交互与业务断言：

```js
import { test, expect } from '../fixtures.js';

test('点击按钮后计数增加', async ({ page }) => {
    await page.goto('/');

    const counter = page.getByTestId('counter');
    await expect(counter).toHaveText('0');
    await page.getByRole('button', { name: 'Increment', exact: true }).click();
    await expect(counter).toHaveText('1');
});
```

**必须从 `../fixtures.js` 导入 `test`，不能直接使用 `@playwright/test` 的原始 `test`。** 自动 fixture 会负责采集，测试本身只需要关注应用行为。

不需要复制本仓库的 Todo 页面或路由拦截代码，它们只是让示例可以离线运行。测试自己的应用时使用上面的 `baseURL` 和真实页面。

### 5. 运行并查看报告

```sh
npm run test:e2e
```

一次运行同时完成行为测试和覆盖率报告生成：

| 输出 | 用途 |
| --- | --- |
| `coverage-reports/index.html` | **JavaScript/CSS 代码覆盖率报告**，查看文件、行、函数和分支覆盖情况 |
| `coverage-reports/lcov.info` | 可供 CI 服务消费的 LCOV 报告 |
| `playwright-report/index.html` | Playwright 测试结果；可通过 `npx playwright show-report` 查看 |

打开覆盖率 HTML，确认包含预期的应用源文件，再根据未覆盖分支补充功能测试。接入打包应用时，应提供与测试产物匹配的 sourcemap，并按实际 URL / 映射路径排除第三方代码。

## 集成是如何工作的

```text
全局 setup 清理旧报告和缓存
  → 每个测试：启动页面覆盖率 → 执行业务断言 → 停止采集 → MCR.add()
  → 所有 worker 完成 → 全局 teardown 调用 MCR.generate()
```

- **在导航之前启动采集**，否则可能漏掉应用初始化执行的代码。
- fixture 使用 `{ auto: true }` 和 `try/finally`；普通断言失败时也会尝试保存覆盖率，且不掩盖失败状态。
- worker 只调用 `add()`。共享配置中保持 `cleanCache: false`，仅由全局流程清理和生成，避免并行测试互相覆盖数据。
- setup 同时清理旧报告和缓存；teardown 检查生成结果，缺失或为空时失败，避免误用旧报告。
- [mcr.config.js](mcr.config.js) 默认生成 `v8`、`console-summary`、`lcovonly`。只需要 HTML 和终端汇总时可移除 `lcovonly`；只需要 JS 时可在 fixture 中移除 CSS 的启动、停止和合并调用。

## 运行本仓库的离线示例

如果想先验证完整流程，再接入自己的应用：

```sh
npm install
npx playwright install chromium
npm test
```

[tests/demo-todo-app.spec.js](tests/demo-todo-app.spec.js) 通过 Playwright 路由加载 [tests/assets/todo/](tests/assets/todo/) 中的真实 HTML、ESM JavaScript 和 CSS，测试添加、清空输入、空白边界和文本渲染行为。无需启动服务器或访问外部网站，报告只包含 Todo 应用代码。

Linux CI 可使用 `npx playwright install --with-deps chromium` 安装浏览器及系统依赖。安装需要网络，已安装后的本地示例可离线测试。代码检查命令为 `npm run lint`。

## 使用边界

- 原生 `page.coverage` **仅支持 Chromium**。这个最小 fixture 只采集 Playwright 提供的 `page`；不要在测试中提前关闭它。额外页面、弹窗、worker 和后端需要单独设计采集方案。
- 不要用 `mcr test` 包装 Playwright 代替页面采集；浏览器内的 JavaScript 必须通过页面覆盖率 API 采集。
- 默认只统计已加载文件，未加载的应用文件不会自动算作 0%；完整源码范围可按需配置 MCR 的 `all`。覆盖率高不能替代有效的业务断言。
- 输出目录只能用于报告，不能指向源码；独立运行或 CI shard 不得共享正在使用的输出目录。

更多配置见 [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports)。
