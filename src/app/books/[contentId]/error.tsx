"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) { return <main><h1>書籍情報を表示できません</h1><p role="alert">読み込みに失敗しました。もう一度お試しください。</p><button onClick={reset}>再読み込み</button><Link href="/">本棚に戻る</Link></main>; }
