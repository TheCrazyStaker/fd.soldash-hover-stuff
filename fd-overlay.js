(function() {
  'use strict';

  var TERMS = {
    'All Slots':            { cat: 'Slots', desc: 'The main slot timeline showing all validators on the network. Each column is one slot (~400ms). Green = produced, grey = another validator, red = missed.' },
    'My Slots':             { cat: 'Slots', desc: 'Filters the slot timeline to show only slots assigned to your validator in the current epoch.' },
    'Root Slot':            { cat: 'Slots', desc: 'The most recently finalized slot — irreversible. The gap between Root and Processed shows how many slots are still in-flight and not yet finalized.' },
    'Confirmed Slot':       { cat: 'Slots', desc: 'Confirmed by 2/3+ of stake (supermajority). Not yet root, but safe to treat as final in most cases.' },
    'Processed Slot':       { cat: 'Slots', desc: "Your node's current frontier — the most recent slot processed locally. May not yet have full network confirmation." },
    'Time Until Leader':    { cat: 'Status', desc: 'Countdown until your validator becomes slot leader. Be fully synced before this — missing leader slots means lost block rewards.' },
    'Time until leader':    { cat: 'Status', desc: 'Countdown until your validator becomes slot leader. Be fully synced before this — missing leader slots means lost block rewards.' },
    'Next Leader Slot':     { cat: 'Status', desc: 'The exact slot number where your validator will next produce blocks. Each leader gets 4 consecutive slots (~1.6 seconds).' },
    'Next leader slot':     { cat: 'Status', desc: 'The exact slot number where your validator will next produce blocks. Each leader gets 4 consecutive slots (~1.6 seconds).' },
    'Vote Status':          { cat: 'Status', desc: '"voting" means your validator is in sync and sending votes correctly. Falling behind risks becoming delinquent and losing rewards.' },
    'Epoch':                { cat: 'Epoch', desc: 'An epoch is ~432,000 slots (~2 days). Staking rewards are distributed and the validator set is recalculated at each epoch boundary.' },
    'Current Epoch':        { cat: 'Epoch', desc: 'The current epoch number. Solana is on epoch 947+ on testnet.' },
    'Time to Next Epoch':   { cat: 'Epoch', desc: 'Time remaining until the current epoch ends and staking rewards are distributed.' },
    'Validators':           { cat: 'Validators', desc: 'Overview of the entire validator set — total count, stake breakdown between active and delinquent validators.' },
    'Total Validators':     { cat: 'Validators', desc: 'Total number of validators in the active set — both voting correctly and delinquent ones.' },
    'Non-delinquent Stake': { cat: 'Validators', desc: 'Total SOL delegated to validators voting correctly. Higher relative to total = healthier network.' },
    'Delinquent Stake':     { cat: 'Validators', desc: 'SOL delegated to validators not voting or significantly behind. Exceeding ~33% of total stake can halt the network.' },
    'RPC Nodes':            { cat: 'Validators', desc: 'Nodes exposing a public RPC endpoint. They do not produce blocks or vote and do not receive staking rewards.' },
    'Transactions':         { cat: 'TPS', desc: 'Overview of all transaction activity — total TPS, user transaction success/fail rates, and vote transactions.' },
    'Total TPS':            { cat: 'TPS', desc: 'Total transactions processed per second — includes both validator vote transactions and all user transactions.' },
    'Non-vote TPS Success': { cat: 'TPS', desc: 'User transactions successfully processed per second — DeFi, NFTs, transfers. This is the real application throughput.' },
    'Non-vote TPS Fail':    { cat: 'TPS', desc: 'User transactions that failed per second. Common causes: insufficient funds, slippage exceeded, congestion, or buggy program logic.' },
    'Vote TPS':             { cat: 'TPS', desc: 'Vote transactions from validators per second. These dominate total TPS count and are separate from user transactions.' },
    'TPU Waterfall':        { cat: 'Pipeline', desc: 'Visualizes the full transaction processing pipeline. Width = volume at each stage. Branches show where and how many transactions are dropped.' },
    'QUIC':                 { cat: 'Pipeline', desc: 'Primary protocol for receiving transactions. Based on UDP but with flow control and multiplexing. Frankendancer prioritizes QUIC.' },
    'UDP':                  { cat: 'Pipeline', desc: 'Legacy plain UDP path for receiving transactions. No flow control or reliability. Lower priority than QUIC.' },
    'Unparseable':          { cat: 'Pipeline', desc: 'Transactions that could not be parsed — invalid format, corrupted data, or wrong protocol version. Dropped immediately at ingress.' },
    'Duplicate':            { cat: 'Pipeline', desc: 'Transactions seen already in the pipeline and removed by the dedup tile. A small % is normal (client retries). High % = spam attack.' },
    'Buffered':             { cat: 'Pipeline', desc: 'Valid transactions waiting in the pack buffer, not yet selected for inclusion in the current block.' },
    'AlreadyExecuted':      { cat: 'Pipeline', desc: 'Transactions already executed in a previous block, received again from peers after confirmation. Normal network behavior.' },
    'Expired':              { cat: 'Pipeline', desc: 'Transactions that exceeded their validity window (blockhash too old) before being processed. Clients should resubmit.' },
    'Packed':               { cat: 'Pipeline', desc: 'Transactions selected by the pack tile and included in the current block — the final count that will be executed.' },
    'execle':               { cat: 'Pipeline', desc: 'Execution limit exceeded — transactions dropped because they would exceed the block compute unit limit. High = block is saturated.' },
    'sock':                 { cat: 'Tiles', desc: 'Network socket tile. sock (in) receives raw UDP/QUIC packets from the network. sock (out) sends shreds and votes to peers.' },
    'bundle':               { cat: 'Tiles', desc: 'Processes MEV bundles from Jito Block Engine — groups of transactions that must execute atomically in a specific order.' },
    'verify':               { cat: 'Tiles', desc: 'Verifies Ed25519 signatures on all transactions in parallel. Invalid signatures are dropped here before entering the pipeline.' },
    'dedup':                { cat: 'Tiles', desc: 'Removes duplicate transactions using a hash-based cache. Prevents the same transaction from clogging the pipeline.' },
    'resolh':               { cat: 'Tiles', desc: 'Resolves Address Lookup Tables (ALTs) — expands compact address references into full 32-byte public keys before execution.' },
    'resolv':               { cat: 'Tiles', desc: 'Resolves Address Lookup Tables (ALTs) — expands compact address references into full 32-byte public keys before execution.' },
    'pack':                 { cat: 'Tiles', desc: 'The scheduler tile — decides which transactions enter the next block, optimizing for fees, compute units, and no account conflicts.' },
    'bank':                 { cat: 'Tiles', desc: 'Executes transactions — runs Solana programs, updates balances, modifies account state. Multiple bank tiles run in parallel.' },
    'pohh':                 { cat: 'Tiles', desc: "Generates the Proof of History chain — a continuous SHA256 hash proving time has elapsed. Solana's decentralized clock." },
    'shred':                { cat: 'Tiles', desc: 'Fragments the block into shreds (~1.2KB each) using Reed-Solomon erasure coding. Broadcast immediately as produced during leadership.' },
    'Network Ingress':      { cat: 'Network', desc: 'Inbound traffic by protocol: turbine (shreds from validators), tpu (client transactions), gossip (network info), repair (missing shreds).' },
    'Network Egress':       { cat: 'Network', desc: 'Outbound traffic. Egress spikes significantly when you are leader broadcasting shreds. Low otherwise — just votes and gossip.' },
    'Status':   { cat: 'Status', desc: 'Real-time validator status — current slot number, vote status, time until next leader slot, and next leader slot number.' },
    'Slot':     { cat: 'Slots', desc: 'A slot is the basic time unit on Solana (~400ms). Each slot has one designated leader validator who must produce a block. If missed, it stays empty.' },
    'Slots':    { cat: 'Slots', desc: 'The slot timeline at the top of the dashboard. Each column = one slot (~400ms). Green = your validator produced it. Grey = another validator. Red = missed slot.' },
    'voting':   { cat: 'Status', desc: 'Your validator is actively voting — it is in sync with the network and submitting vote transactions each slot. This is the healthy state. If you see "delinquent" instead, your validator is falling behind.' },
    'behind':   { cat: 'Status', desc: 'The number of slots your validator is behind the current tip of the chain. Being 1 behind is normal due to network propagation delay. More than a few slots behind is a warning sign.' },
    'Gossip':   { cat: 'Network', desc: 'Gossip protocol traffic — validators share cluster information (node identity, stake, version) via gossip. It is low-bandwidth but essential for network topology discovery.' },
    'Received': { cat: 'Pipeline', desc: 'Total transaction packets received from all sources (QUIC + UDP) before any processing. This is the raw ingress volume into your validator.' },
    'Unresolved': { cat: 'Pipeline', desc: 'Transactions referencing Address Lookup Tables that could not be resolved — the table account was not found or not yet loaded. These are dropped.' },
    'Unexecutable': { cat: 'Pipeline', desc: 'Transactions that passed all checks but could not be executed — account state conflict, insufficient compute budget, or program error. Not counted as user failures.' },
    'Failure':  { cat: 'Pipeline', desc: 'Transactions that failed during execution — program returned an error, insufficient funds, or constraint violation. These are landed on-chain as failed transactions.' },
    'Success':  { cat: 'Pipeline', desc: 'Transactions that executed successfully and were included in the block. This is the final output of the TPU pipeline — real value delivered to users.' }
  };

  var sortedTerms = Object.keys(TERMS).sort(function(a, b) { return b.length - a.length; });

  // ── Create panel ──
  var panel = document.createElement('div');
  panel.id = 'fd-info-panel';
  panel.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:0',
    'right:0',
    'height:90px',
    'background:rgba(8,8,20,0.97)',
    'border-top:2px solid rgba(153,69,255,0.5)',
    'display:flex',
    'align-items:center',
    'padding:0 24px',
    'gap:16px',
    'z-index:99999',
    'font-family:monospace',
    'transition:opacity 0.2s',
    'pointer-events:none'
  ].join(';');

  var panelDefault = document.createElement('div');
  panelDefault.style.cssText = 'color:rgba(255,255,255,0.4);font-size:20px;display:flex;align-items:center;gap:8px;';
  panelDefault.innerHTML = '<span style="font-size:30px;">↑</span> Hover over any dashboard element for an explanation';

  var panelContent = document.createElement('div');
  panelContent.style.display = 'none';
  panelContent.style.cssText = 'display:none;width:100%;';

  var panelCat  = document.createElement('div');
  panelCat.style.cssText = 'font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9945ff;margin-bottom:3px;';

  var panelTerm = document.createElement('div');
  panelTerm.style.cssText = 'font-size:18px;font-weight:700;color:#e2e8f0;margin-bottom:4px;';

  var panelDesc = document.createElement('div');
  panelDesc.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;max-width:1000px;';

  panelContent.appendChild(panelCat);
  panelContent.appendChild(panelTerm);
  panelContent.appendChild(panelDesc);
  panel.appendChild(panelDefault);
  panel.appendChild(panelContent);
  document.body.appendChild(panel);

  // Pad bottom so content isn't hidden behind panel
  document.body.style.paddingBottom = '90px';

  function showTerm(term) {
    var t = TERMS[term];
    if (!t) return;
    panelDefault.style.display = 'none';
    panelContent.style.display = 'block';
    panelCat.textContent  = '▸ ' + t.cat;
    panelTerm.textContent = term;
    panelDesc.textContent = t.desc;
  }

  function hideTerm() {
    panelDefault.style.display = 'flex';
    panelContent.style.display = 'none';
  }

  // ── Mouse tracking ──
  var _lastTerm = null;
  var _raf = null;
  var _mouseX = 0, _mouseY = 0;

  document.addEventListener('mousemove', function(e) {
    _mouseX = e.clientX;
    _mouseY = e.clientY;
    if (!_raf) {
      _raf = requestAnimationFrame(checkHover);
    }
  });

  function findTermInText(txt) {
    if (!txt) return null;
    txt = txt.trim();
    if (!txt || txt.length > 60) return null;
    for (var k = 0; k < sortedTerms.length; k++) {
      if (txt.toLowerCase() === sortedTerms[k].toLowerCase()) return sortedTerms[k];
    }
    return null;
  }

  function checkHover() {
    _raf = null;
    var el = document.elementFromPoint(_mouseX, _mouseY);
    if (!el || el === panel) { if (_lastTerm) { _lastTerm = null; hideTerm(); } return; }

    var found = null;

    // SVG special case — scan tspans by proximity to mouse
    var svgEl = el.closest ? el.closest('svg') : null;
    if (svgEl) {
      var tspans = svgEl.querySelectorAll('tspan');
      var closest = null, closestDist = Infinity;
      for (var ti = 0; ti < tspans.length; ti++) {
        var tTxt = (tspans[ti].textContent || '').trim();
        if (!tTxt || !findTermInText(tTxt)) continue;
        var r = tspans[ti].getBoundingClientRect();
        if (r.width === 0 && r.height === 0 && tspans[ti].parentElement) {
          r = tspans[ti].parentElement.getBoundingClientRect();
        }
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dist = Math.sqrt((_mouseX - cx) * (_mouseX - cx) + (_mouseY - cy) * (_mouseY - cy));
        if (dist < closestDist) { closestDist = dist; closest = tspans[ti]; }
      }
      if (closest && closestDist < 120) {
        found = findTermInText(closest.textContent.trim());
      }
      if (!found) found = 'TPU Waterfall';
    }

    // Normal DOM walk
    if (!found) {
      var cur = el;
      for (var i = 0; i < 10 && cur && cur !== document.body; i++) {
        var txt = '';
        for (var j = 0; j < cur.childNodes.length; j++) {
          if (cur.childNodes[j].nodeType === 3) txt += cur.childNodes[j].textContent;
        }
        found = findTermInText(txt);
        if (!found && cur.childNodes.length <= 3) {
          found = findTermInText((cur.textContent || ''));
        }
        if (found) break;
        cur = cur.parentElement;
      }
    }

    if (found !== _lastTerm) {
      _lastTerm = found;
      if (found) showTerm(found);
      else hideTerm();
    }
  }

  // Also handle mouseleave
  document.addEventListener('mouseleave', function() {
    _lastTerm = null;
    hideTerm();
  });

})();
