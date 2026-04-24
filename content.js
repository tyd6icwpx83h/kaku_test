// 置換処理の本体
function replaceText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.nodeValue;
    let newText = text;

    for (const [before, after] of Object.entries(wordMap)) {
      // 特殊文字をエスケープして正規表現を作成
      const escapedBefore = before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedBefore, 'gi');
      newText = newText.replace(regex, after);
    }

    if (newText !== text) {
      node.nodeValue = newText;
    }
  } else {
    // 子ノードも再帰的にチェック
    for (let child of node.childNodes) {
      replaceText(child);
    }
  }
}

// ページの変更を監視する設定
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // styleやscriptタグの中身は除外
      if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        replaceText(node);
      }
    });
  });
});

// 1. 初回実行（最初に読み込まれている分を置換）
replaceText(document.body);

// 2. 監視開始（後から追加される要素を置換）
observer.observe(document.body, {
  childList: true,
  subtree: true
});