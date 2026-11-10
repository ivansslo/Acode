# RocAide

<p align="center">
  <img src='res/logo_1.png' width='250'>
</p>

RocAide is a lightweight code editor and web IDE for Android — a fork of [Acode](https://github.com/Acode-Foundation/Acode) maintained by [Ivan Ssl](https://github.com/ivansslo). It adds a built-in **RocAI Agent console**: the agent's dashboard and a full Termux terminal, both embedded in the editor.

## • Overview

Whether you're working on HTML, CSS, JavaScript, or other programming languages, RocAide empowers you to code on-the-go with confidence — and pairs the editor with an AI coding agent through the built-in RocAI console.

## • Features

Everything Acode has:

- Edit and create websites, and instantly preview them in a browser.
- Seamlessly modify source files for various languages like Python, Java, JavaScript, and more.
- Built-in JavaScript console
- Enjoy multi-language editing support with easy management tools.
- Enjoy a large collection of community plugins to enhance your coding experience.

Plus the RocAide addition:

- **RocAI Agent console** — a built-in page with two tabs: **Dashboard** embeds the agent gateway on `127.0.0.1:9119`, and **Terminal** embeds a full Termux shell (ttyd on `127.0.0.1:7681`, path `/r0cterm/`). Status is polled every 5 s, and either view can be opened in the browser.

## • Installation

Prebuilt APKs are published on the [releases page](https://github.com/ivansslo/Acode/releases).

> RocAide is an independent fork and is not distributed via Google Play or F-Droid. For the original Acode editor, see [Acode-Foundation/Acode](https://github.com/Acode-Foundation/Acode).

## • Project Structure

<pre>
RocAide/
|
|- src/   - Core code and language files
|
|- www/   - Public documents, compiled files, and HTML templates
|
|- utils/ - CLI tools for building, string manipulation, and more
</pre>

## • Multi-language Support

Enhance RocAide's capabilities by adding new languages easily. Just create a file with the language code (e.g., en-us for English) in [`src/lang/`](https://github.com/Acode-Foundation/Acode/tree/main/src/lang) and include it in [`src/lib/lang.js`](https://github.com/Acode-Foundation/Acode/blob/main/src/lib/lang.js). Manage strings across languages effortlessly using utility commands:

```shell
pnpm run lang add
pnpm run lang remove
pnpm run lang search
pnpm run lang update
```

## • Contributing & Building the Application

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## • Developing a Plugin

For comprehensive documentation on creating plugins, visit the [repository](https://github.com/Acode-Foundation/acode-plugin) and the [Acode Plugin Documentation](https://docs.acode.app/). Plugins built for Acode work in RocAide — see [`plugins-src/rocai.dashboard/`](plugins-src/rocai.dashboard/) for a minimal example shipped in this repo.

## • Credits & License

RocAide is a fork of [Acode](https://github.com/Acode-Foundation/Acode), created by [Foxdebug (Ajit Kumar)](https://foxdebug.com) and its contributors. The original code is licensed under the MIT License — see [license.txt](license.txt). The RocAide fork is maintained by Ivan Ssl.
