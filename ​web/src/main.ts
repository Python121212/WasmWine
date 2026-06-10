// 4GB (Wasm32限界値) = 4,294,967,296 バイト
// ※実稼働ブラウザの制限に合わせ、初期割り当ては小さくし、必要に応じてgrowさせる設計に
const FOUR_GB_PAGES = 65536; // 64KB * 65536 = 4GB

async function initWasmWine() {
    console.log("[WasmWine] メモリ空間のプロビジョニングを開始...");

    // 1. 仕様書に準拠した4つの共有メモリの作成 (Multi-Memory)
    const memory0 = new WebAssembly.Memory({ initial: 256, maximum: FOUR_GB_PAGES, shared: true });
    const memory1 = new WebAssembly.Memory({ initial: 256, maximum: FOUR_GB_PAGES, shared: true });
    const memory2 = new WebAssembly.Memory({ initial: 256, maximum: FOUR_GB_PAGES, shared: true });
    const memory3 = new WebAssembly.Memory({ initial: 256, maximum: FOUR_GB_PAGES, shared: true });

    // Wasmモジュール間で共有する実行ファンクションテーブル
    const sharedTable = new WebAssembly.Table({
        element: "anyfunc",
        initial: 10000,
        maximum: 65536
    });

    // 2. Workersの並列起動 (ViteのインラインWorker参照を利用)
    const gameWorker = new Worker(
        new URL('./game.worker.ts', import.meta.url), 
        { type: 'module' }
    );
    const compilerWorker = new Worker(
        new URL('./compiler.worker.ts', import.meta.url), 
        { type: 'module' }
    );

    // 3. 各Workerへ全SAB（WebAssembly.Memoryのバッファ）とTableの参照を分配
    const initPayload = {
        type: "INIT_RUNTIMES",
        mem0: memory0.buffer,
        mem1: memory1.buffer,
        mem2: memory2.buffer,
        mem3: memory3.buffer,
        table: sharedTable
    };

    gameWorker.postMessage(initPayload);
    compilerWorker.postMessage(initPayload);

    console.log("[WasmWine] 全ランタイムへコンテキストを同期しました。システム駆動可能です。");
}

initWasmWine().catch(console.error);
