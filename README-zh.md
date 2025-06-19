# ModDota template

使用现代技术构建的 Dota 2 自定义游戏的模板。

[This tutorial](https://moddota.com/scripting/Typescript/typescript-introduction/) 说明如何设置和使用模板。

该模板包括：

- [TypeScript for Panorama](https://moddota.com/panorama/introduction-to-panorama-ui-with-typescript)
- [TypeScript for VScripts](https://typescripttolua.github.io/)
- 用于构建和启动自定义游戏的简单命令
- [Continuous Integration](#continuous-integration) support

## Getting Started

1. 克隆此存储库，或者，如果您计划在 GitHub 上为您的自定义游戏创建一个存储库, [create a new repository from this template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template)并改为克隆它.
2. 打开自定义游戏的目录，将 package.json 文件中的 'name' 字段更改为插件名称.
3. 打开该目录中的终端并运行“npm install”以安装依赖项。您还应该偶尔运行“npm update”来获取工具更新.

之后，您可以在 VSCode 中按“Ctrl+Shift+B”或在终端中运行“npm run dev”命令来编译代码并观察更改。

## Contents:

* **[src/common]:** TypeScript .d.ts类型声明文件，其类型可以在 Panorama 和 VScript 之间共享
* **[src/vscripts]:** Dota 插件 （Lua） vscript 的 TypeScript 代码。将 lua 编译为 game/scripts/vscripts。
* **[src/panorama]:** 全景 UI 的 TypeScript 代码。将 js 编译为 content/panorama/scripts/custom_game

--

* **[game/*]:** Dota 游戏目录，包含 npc kv 文件和编译的 lua 脚本等文件。
* **[content/*]:** Dota 内容目录包含脚本以外的全景源（xml、css、compiled js）

--

* **[scripts/*]:** 存储库安装脚本

## 持续集成

此模板包括一个[GitHub Actions](https://github.com/features/actions) [workflow](.github/workflows/ci.yml) 这会在每次提交时构建您的自定义游戏，并在出现类型错误时失败。
