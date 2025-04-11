> [!WARNING]
> このツールは現在開発中であり、ベータ版の状態です。<br>
> 一部の機能が正常に動作しないか、そもそも動きません。

# phonedev
スマホで使えるデベロッパーツールもどきです。<br>
[Discordサーバー](https://discord.gg/pGCcfzKfz3)
<img width="1512" alt="image" src="https://github.com/user-attachments/assets/d5e057bd-af37-4694-82d7-6e7184ce9076" />


## 起動方法
以下のコードをコピーし、ブラウザのURL欄に貼り付けてください。
```
javascript:(()=>{var script=document.createElement("script");script.src="https://phonedev.siyukatu.com/main.js?_="+Date.now();document.body.append(script);})();
```
コピーして貼り付けると、 `javascript:` の部分が消える場合があります。<br>
消える場合は手動で追加して下さい。<br>
ブックマーク追加がおすすめです。

### CSPが有効になっている場合
https://phonedev.siyukatu.com/main.js の内容を全てコピーし、 `javascript:` を付けて実行して下さい。

# ビルド方法
```
git clone https://github.com/siyukatu/phonedev
cd phonedev
npm run build
```
このコマンドを実行すると `output` フォルダが作成され、その中に `main.js` ファイルが生成されます。<br>
その `main.js` を実行するとツールが起動します。

## Cloudflare Pagesでのビルド設定
Build command: `npm run build`<br>
Build output directory: `output`<br>
その他お好みの設定を行って下さい。
