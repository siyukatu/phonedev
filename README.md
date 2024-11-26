> [!WARNING]
> このツールは現在開発中であり、ベータ版の状態です。<br>
> 一部の機能が正常に動作しないか、そもそも動きません。

# phonedev
スマホで使えるデベロッパーツールもどきです。

## 起動方法
以下のコードをコピーし、ブラウザのURL欄に貼り付けてください。
```
javascript:(()=>{var script=document.createElement("script");script.src="https://phonedev.siyukatu.com/main.js";document.body.append(script);})();
```
コピーして貼り付けると、 `javascript:` の部分が消える場合があります。<br>
消える場合は手動で追加して下さい。

### CSPが有効になっている場合
対策を検討中です。

# ビルド方法
開発しやすくするためにファイルを複数に別けています。
```
git clone https://github.com/siyukatu/phonedev
cd phonedev
python3 build.py
```
するとoutputフォルダが作成され、その中にmain.jsファイルが生成されます。<br>
そのmain.jsを実行するとツールが起動します。

## Cloudflare Pagesでのビルド設定
Build command: `python3 build.py`<br>
Build output directory: `output`<br>
その他お好みの設定を行って下さい。
