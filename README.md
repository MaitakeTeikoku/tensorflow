## Todo
1. GitHubからクローン。
    ```sh: ターミナル
    git clone https://github.com/MaitakeTeikoku/tensorflow.git
    ```
1. Reactのプロジェクトを作成。
    ```sh: ターミナル
    npm create vite@latest tensorflow
    ```
    ```sh: ターミナル
    Select a framework: » React
    Select a variant: » TypeScript + SWC
    ```
1. ディレクトリの移動。
    ```sh: ターミナル
    cd tensorflow
    ```
1. ライブラリをインストール。
    ```sh: ターミナル
    npm install
    ```
    ```sh: ターミナル
    npm i --save-dev @types/node
    ```
1. ローカルで起動。
    ```sh: ターミナル
    npm run dev
    ```
1. package.jsonの"scripts"に以下を追記。
    ```json: package.json
    "git": "git add . && git commit && git push origin main"
    ```
1. コミットしてプッシュ。
    ```sh: ターミナル
    npm run git
    ```