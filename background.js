// Toolbar icon (or Alt+Shift+V): open the feed for the post you're looking at.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || tab.id == null) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'xrf-open-from-page' });
  } catch {
    if (/^https:\/\/(www\.)?x\.com\//.test(tab.url || '')) {
      // The tab was open before the extension was installed: reload so the script loads.
      chrome.tabs.reload(tab.id);
    } else {
      chrome.tabs.create({ url: 'https://x.com/i/bookmarks' });
    }
  }
});
