# Related Video Feed for X

A free browser extension that brings the X (Twitter) app's **"swipe up for more"** video feed to x.com on desktop.

On your phone, you can open a video and swipe up to get an endless feed of related videos.
The desktop site doesn't have that. This extension adds it: pick any video (for example one from
your Bookmarks), click **Related**, and you get a full-screen feed of related videos that you
scroll through one at a time.

It uses the same feed X's own apps use, so the recommendations come from X itself and are seeded
by the video you start from. It runs inside x.com with your existing login. Nothing is sent
anywhere except x.com.

> Unofficial. Not affiliated with or endorsed by X Corp. It relies on X's private web API,
> which can change at any time.

## Install (Chrome, Edge or Brave)

1. Download **`x-related-video-feed.zip`** from the [latest release](../../releases/latest) and unzip it.
2. Open `chrome://extensions` (Edge: `edge://extensions`).
3. Turn on **Developer mode** (top-right toggle; in Edge it's on the left).
4. Click **Load unpacked** and pick the unzipped folder (the one that contains `manifest.json`).
5. Reload any x.com tabs you already had open.

To update later, download the new ZIP, replace the folder, and click the reload icon on the
extension's card in `chrome://extensions`.

## Use

- Every post with a video gets a blue **▶ Related** button next to like/bookmark.
  Click it to open the feed, starting with that video.
- Or open a video post and click the extension's toolbar icon (or press **Alt+Shift+V**).
- When X runs out of related videos, the feed automatically continues from the video you're
  watching, so it keeps going.

| Key | Action |
| --- | --- |
| ↓ / J / mouse wheel | Next video |
| ↑ / K | Previous video |
| Space / click | Pause / play |
| ← / → | Back / forward 5 seconds |
| M | Mute |
| L | Like |
| B | Bookmark (adds to your real X bookmarks) |
| S | **Similar**: restart the feed from the current video |
| O | Open the post in a new tab |
| A | Auto-next (play the next video when one ends) |
| F | Fullscreen |
| Esc | Close |

## Troubleshooting

- **"X refused the request (HTTP 404)"**: make sure you're logged in on x.com and reload the page.
  If it keeps happening on every video, X has probably changed its internal API. Please open an issue.
- **"No playable videos found"**: the post's video may have been deleted, or the account is private.
- **Sensitive videos missing**: in X, go to Settings → Privacy and safety → Content you see and
  turn on "Display media that may contain sensitive content".
- **Rate limit**: X limits how many requests an account can make. Wait a few minutes.

## How it works

- `src/xapi.js` calls X's internal `ImmersiveMedia` GraphQL endpoint, which X's own viewer uses
  for this feed. It signs requests the way x.com does (`x-client-transaction-id`). It also reads
  X's current API IDs and feature flags from X's own JavaScript at runtime, so it survives most
  routine changes on X's side.
- `src/player.js` + `src/player.css`: the full-screen player.
- `src/content.js`: adds the Related button to posts.
- `background.js`: toolbar icon / keyboard shortcut.

## Support the project

It's free and always will be. If it's useful to you and you want to say thanks, you can
[sponsor me on GitHub](https://github.com/sponsors/THEYAKUZI). Bug reports and ideas are welcome
too: [open an issue](../../issues).

## Privacy

Collects nothing. Everything happens between your browser and x.com. See [PRIVACY.md](PRIVACY.md).

## License

MIT. See [LICENSE](LICENSE). The request-signing code is adapted from
[x-client-transaction-id](https://github.com/Lqm1/x-client-transaction-id) (MIT). See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
