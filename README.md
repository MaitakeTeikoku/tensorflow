## Todo
1. GitHubからクローン。
    ```bash
    git clone https://github.com/MaitakeTeikoku/tensorflow.git
    ```
1. Reactのプロジェクトを作成。
    ```bash
    npm create vite@latest tensorflow
    ```
    ```bash
    Select a framework: » React
    Select a variant: » TypeScript + SWC
    ```
1. ディレクトリの移動。
    ```bash
    cd tensorflow
    ```
1. ライブラリをインストール。
    ```bash
    npm install
    ```
1. ローカルで起動。
    ```bash
    npm run dev
    ```
1. package.jsonの"scripts"に以下を追記。
    ```json
    "git": "git add . && git commit && git push origin main"
    ```
1. コミットしてプッシュ。
    ```bash
    npm run git
    ```