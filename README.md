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
    npm install @tensorflow/tfjs
    npm install @tensorflow-models/coco-ssd
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
1. クリーンアップ。
    - 以下を削除。
        - src/assets
        - src/index.css
        - src/App.css
        - public/vite.svg
    - publicにfavicon.icoをアップロード。
    - src/App.tsxを以下に変更。
        ```tsx
        function App() {

          return (
            <>
            </>
          )
        }

        export default App
        ```
    - index.htmlを以下に変更。（`lang="ja"`、`link  href="/favicon.ico"`、`<title></title>`）
        ```html
        <!doctype html>
        <html lang="ja">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>TensorFlow</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
        ```
    - vite.config.jsのdefineConfig内を以下に変更。（`server: { host: true },`を追記。）
        ```ts
        import { defineConfig } from "vite"
        import react from '@vitejs/plugin-react-swc'

        // https://vite.dev/config/
        export default defineConfig({
          plugins: [react()],
          server: { host: true },
        })
        ```
    - main.tsxを以下に変更。
        ```tsx
        import { StrictMode } from 'react'
        import { createRoot } from 'react-dom/client'
        import App from './App.tsx'

        createRoot(document.getElementById('root')!).render(
          <StrictMode>
              <App />
          </StrictMode>
        )
        ```