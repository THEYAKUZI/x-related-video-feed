# Chrome Web Store submission: copy-paste sheet

Upload `chrome-web-store-upload.zip` (made locally, not in the repo) under **Package**.
Then fill in each tab of the Developer Dashboard with the values below.

---

## Store listing tab

**Name / summary:** filled in automatically from the extension.

**Description:**

```
Scroll through related videos on x.com, just like swiping up in the X app.

On your phone, you can open a video and swipe up to get an endless feed of related videos. The desktop site doesn't have that. This extension adds it.

HOW IT WORKS
• Every post with a video gets a "Related" button next to like and bookmark.
• Click it to open a full-screen feed: that video first, then related ones, one at a time.
• Scroll with your mouse wheel or use the arrow keys.
• The recommendations come from X's own video feed, the same one the mobile app uses.
• When X runs out of related videos, the feed keeps going from the video you're watching.

FEATURES
• Like and bookmark without leaving the feed (saves to your real X bookmarks)
• "Similar" button to restart the feed from any video
• Auto-next, mute, fullscreen and keyboard shortcuts (press ? to see them all)
• Also opens from the toolbar button, or Alt+Shift+V on any video post

PRIVACY
Nothing is collected. The extension only runs on x.com and talks directly to X using the account you're already logged in with. No tracking, no ads, no outside servers.

Free and open source: https://github.com/THEYAKUZI/x-related-video-feed

Unofficial. Not affiliated with or endorsed by X Corp.
```

**Category:** Social Networking (or Entertainment)

**Language:** English

**Store icon (128×128):** `icons/icon128.png`

**Screenshots (1280×800):**
- `store/screenshot-1-feed-1280x800.png`
- `store/screenshot-2-shortcuts-1280x800.png`

**Small promo tile (440×280):** `store/promo-small-440x280.png`

**Marquee promo tile (1400×560, optional):** `store/promo-marquee-1400x560.png`

**Homepage URL:** `https://github.com/THEYAKUZI/x-related-video-feed`

**Support URL:** `https://github.com/THEYAKUZI/x-related-video-feed/issues`

**Mature content:** No

---

## Privacy tab

**Single purpose description:**

```
Adds a full-screen, scrollable feed of related videos to x.com, starting from a video the user picks. It's the same "swipe up for more" video feed that X's mobile app has.
```

**Permission justifications:**

- **storage**
  ```
  Saves the user's two player settings (mute and auto-next) so they are remembered between sessions.
  ```
- **activeTab**
  ```
  Lets the toolbar button and keyboard shortcut open the video feed for the post in the current tab.
  ```
- **Host permission (x.com)**
  ```
  The extension only runs on x.com. It adds a "Related" button to video posts and loads the related-video feed from X using the user's existing X session. Nothing is sent anywhere other than x.com.
  ```

**Are you using remote code?** No, I am not using remote code.

**Data usage:** don't tick any of the data types. Tick all three certification boxes at the bottom.

**Privacy policy URL:**

```
https://github.com/THEYAKUZI/x-related-video-feed/blob/main/PRIVACY.md
```

---

## Distribution tab

- **Payments:** Free
- **Visibility:** Public
- **Regions:** All regions
