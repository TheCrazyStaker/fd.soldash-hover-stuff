# fd.soldash-hover-stuff

Educational hover overlay for the Frankendancer validator dashboard, built as part of [Soldash](https://soldash.space) — a Solana stake analytics tool by [Crazy Staking](https://github.com/TheCrazyStaker).

Live at: **[fd.soldash.space](https://fd.soldash.space)**

---

## What this does

The Frankendancer GUI (`fd.soldash.space`) is the official dashboard for a Frankendancer validator node running on Solana testnet. It displays real-time data — slot timelines, TPU pipeline waterfall, tile metrics, vote status, TPS — but without any explanations.

This repo adds an educational layer: hover over any element in the dashboard and a panel at the bottom explains what it means, with definitions sourced from the official [Firedancer documentation](https://docs.firedancer.io).

**~55 terms covered**, including all pipeline stages (QUIC, verify, dedup, pack, bank, pohh, shred), TPU Waterfall drop categories (Unparseable, Duplicate, Expired, Buffered, Packed, execle...), tile descriptions, slot/epoch concepts, and validator status fields.

---

## How it works

### 1. Nginx on the validator server — proxying the dashboard

The Frankendancer GUI runs locally on the validator at `http://127.0.0.1:8080`. We configured Nginx to:
- Expose it securely over HTTPS at `fd.soldash.space`
- Add WebSocket support (`Upgrade`, `Connection: upgrade`) so the real-time data stream works correctly
- Inject our overlay script into every page via `sub_filter`

```nginx
proxy_set_header Accept-Encoding "";
sub_filter '</body>' '<script src="https://soldash.space/fd-overlay.js"></script></body>';
sub_filter_once on;
```

### 2. fd-overlay.js — the hover system

The script is served as a static file from `soldash.space` and injected into `fd.soldash.space` on every page load. It:

- Creates a fixed panel at the bottom of the page
- Tracks mouse position using `requestAnimationFrame` for smooth, non-blocking detection
- For **regular DOM elements**: walks up to 10 levels up the element tree, checking direct text node content against a dictionary of known terms
- For **SVG elements** (like the TPU Waterfall chart, which is rendered as SVG): finds all `<tspan>` elements in the parent SVG and selects the one closest to the cursor by Euclidean distance
- On match: displays the term name, category, and description in the bottom panel
- On no match: shows the default "hover over any element" prompt

---

## Files

```
fd.soldash-hover-stuff/
├── fd-overlay.js                          # The hover overlay script (served from soldash.space/public/)
└── etc/
    └── nginx/
        ├── sites-available/
        │   └── soldash                    # Nginx config for soldash.space (includes /fd-proxy route)
        └── sites-enabled/
            └── fd.soldash.space           # Nginx config for fd.soldash.space (proxy + sub_filter injection)
```

---

## Infrastructure

| Component | Location | Role |
|-----------|----------|------|
| Frankendancer node | `localhost:8080 (validator server)` | Runs the validator + GUI |
| Nginx (validator server) | `fd.soldash.space:443` | Proxies GUI, injects overlay script |
| `fd-overlay.js` | `soldash.space/fd-overlay.js` | Served as static file, injected via sub_filter |
| Soldash dashboard | `soldash.space` | Main analytics tool, links to fd.soldash.space |

---

<img width="1868" height="897" alt="image" src="https://github.com/user-attachments/assets/c1b4217f-d617-474b-902f-8cd228c9846c" />


## Related

- [soldash](https://github.com/TheCrazyStaker/soldash) — the main Solana stake analytics dashboard
- [Firedancer docs](https://docs.firedancer.io) — official source for tile and pipeline definitions
- [Frankendancer](https://github.com/firedancer-io/firedancer) — the hybrid Firedancer/Agave validator client
