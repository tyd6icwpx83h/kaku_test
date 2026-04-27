/**
 * 1. 現在のサイトURLに基づいて辞書を準備
 */
function getActiveDictionary() {
  const hostname = window.location.hostname;
  const currentSiteList = siteDictionaries[hostname] || {};
  const commonList = siteDictionaries["common"] || {};
  
  // 共通設定とサイト別設定を統合
  const merged = { ...commonList, ...currentSiteList };

  // 最長一致を実現するため、文字数の長い順にソートした配列を作成
  return Object.entries(merged).sort((a, b) => b[0].length - a[0].length);
}

const sortedWordList = getActiveDictionary();

/**
 * 2. テキスト置換の実行関数
 */
function replaceText(node) {
  // テキストノードの場合のみ処理
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.nodeValue;
    if (!text || !text.trim()) return;

    let newText = text;
    for (const [before, after] of sortedWordList) {
      // 記号が含まれていても大丈夫なようにエスケープ処理
      const escapedBefore = before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 全置換(g)と大文字小文字無視(i)の正規表現
      const regex = new RegExp(escapedBefore, 'gi');
      newText = newText.replace(regex, after);
    }

    // 変化があった場合のみDOMを更新
    if (newText !== text) {
      node.nodeValue = newText;
    }
  } else {
    // 編集してはいけないタグを除外
    const skipTags = ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT'];
    if (skipTags.includes(node.nodeName)) return;

    // 子ノードを再帰的にチェック
    for (let child of node.childNodes) {
      replaceText(child);
    }
  }
}

/**
 * 3. 実行および動的コンテンツの監視
 */
if (sortedWordList.length > 0) {
  // 初回実行：既に表示されている要素を置換
  replaceText(document.body);

  // 監視開始：JavaScriptで後から追加される要素を置換
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        replaceText(node);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
