#![no_std]
#![feature(alloc_error_handler)]

pub mod rt;

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

// 初期化時にJS側から渡される、またはWasm側で外部インポートするMulti-Memory用のフック
// 仕様書1-Aに基づき、Memory0〜3へアクセスするためのスタブ（JITコンパイラが利用）
#[no_mangle]
pub extern "C" fn wasmwine_init_system() -> u32 {
    // 初期化成功フラグ
    0
}
