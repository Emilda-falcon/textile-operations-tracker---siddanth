const stageColumns = [
  {name:'Received', tone:'', active:true},
  {name:'Pretreatment', tone:'', active:true},
  {name:'Dyeing', tone:'', active:true},
  {name:'Finishing', tone:'', active:true},
  {name:'Quality check', tone:'', active:false},
  {name:'Packing', tone:'', active:false},
  {name:'Reprocess', tone:'reprocess', active:false}
];
const activeStages = {
  'LOT-24081':['Pretreatment','Dyeing'],
  'LOT-24079':['Dyeing','Finishing'],
  'LOT-24077':['Quality check'],
  'LOT-24074':['Packing'],
  'LOT-24071':['Dyeing','Reprocess'],
  'LOT-24068':['Packing']
};
const lotIdentity = {
  'LOT-24081':'mint', 'LOT-24079':'violet', 'LOT-24077':'gold',
  'LOT-24074':'sky', 'LOT-24071':'coral', 'LOT-24068':'slate'
};
function lotStages(lot){ return activeStages[lot.id] || [lot.stage]; }
function kanbanCard(lot, column){
  const stages = lotStages(lot);
  const shared = stages.length > 1;
  const isReprocess = column.name === 'Reprocess';
  const current = lot.stage === column.name;
  const status = isReprocess ? 'Reprocess' : current ? lot.status : 'Partial handoff';
  const color = isReprocess ? 'red' : current ? lot.color : 'blue';
  const identity = lotIdentity[lot.id] || 'slate';
  return `<article class="kanban-card identity-${identity}" data-lot="${lot.id}" tabindex="0" aria-label="Open details for ${lot.id}">
    <div class="kanban-card-top"><div class="lot-card-name"><i class="identity-dot"></i><h3>${lot.id}</h3>${shared?`<span class="multi-stage-count">${stages.length}</span>`:''}</div><span class="percentage ${color}">${lot.progress}%</span></div>
    <div class="card-expanded-content">
      <div class="card-status">${tag(status,color)}</div>
      <p class="party">${esc(lot.party)}</p>
      <p class="material">${esc(lot.fabric)} · ${lot.qty}</p>
      <div class="progress"><i style="width:${lot.progress}%"></i></div>
      <div class="kanban-card-foot"><span>${lot.progress}% total</span><span>${lot.operator}</span></div>
      ${shared ? `<span class="stage-link ${isReprocess?'warn':''}">↔ ${stages.length} active stages</span>` : ''}
      <button class="lot-detail-link" data-lot="${lot.id}">View lot details →</button>
    </div>
  </article>`;
}
function kanbanBoard(lots){
  return `<div class="kanban-wrap"><div class="kanban-board">${stageColumns.map(column=>{
    const cards=lots.filter(l=>lotStages(l).includes(column.name));
    return `<section class="kanban-column ${column.tone}"><header class="kanban-column-header"><span class="kanban-column-title"><i class="stage-dot-small ${column.active?'active':''} ${column.name==='Reprocess'?'warning':''}"></i>${column.name}</span><span class="stage-counter">${cards.length}</span></header><div class="kanban-cards">${cards.map(l=>kanbanCard(l,column)).join('')||'<div class="kanban-empty">No active lots</div>'}</div></section>`;
  }).join('')}</div></div>`;
}
function pipeline(){
  const query=(state.query||'').toLowerCase();
  const lots=state.lots.filter(l=>!query||[l.id,l.party,l.fabric,l.stage,...lotStages(l)].join(' ').toLowerCase().includes(query));
  const board=state.pipelineMode!=='list';
  const switcher=`<div class="toolbar-toggles"><div class="view-toggle"><button class="${board?'active':''}" data-kanban-mode="board">▦ Board</button><button class="${!board?'active':''}" data-kanban-mode="list">☷ List</button></div></div>`;
  return header('Operations','Lot pipeline','Live stage occupancy. A lot may be shown in more than one active stage.',btn('＋ New lot','primary','new-lot'))+
    `<div class="panel"><div class="panel-header pipeline-toolbar"><div><h2 class="panel-title">${board?'Stage board':'Lot list'}</h2><p class="panel-caption">${board?'Matching colour marks and a numbered badge identify the same lot across multiple stages.':'Search all lots and open a job card for detail.'}</p></div>${switcher}</div><div class="filter-row"><input class="input" id="lot-search" value="${esc(state.query||'')}" placeholder="Search lot, party, material, or stage…"><button class="btn">All active stages</button></div>${board?kanbanBoard(lots):`<div class="pipeline-list visible">${table(lots)}</div>`}</div>`;
}
document.addEventListener('click', event => {
  const button=event.target.closest('[data-kanban-mode]');
  if(!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  state.pipelineMode=button.dataset.kanbanMode;
  render();
}, true);

function storekeeperScan(){
  return header('Chemical issue','Scan lot','Scan the job card to load the correct recipe. Quantities are calculated by the system.',btn('View store log','ghost','chemicals'))+
  `<section class="scan-layout"><div class="panel scan-card"><div class="scan-frame"><div class="scan-cross">⌗</div></div><h2 class="panel-title">Waiting for lot scan</h2><p class="panel-caption">Scan the QR on the job card before issuing any chemical or dye.</p><button class="btn primary" data-action="simulate-scan" style="margin-top:18px">⌗ Simulate lot scan</button></div><div class="panel"><div class="panel-header"><div><h2 class="panel-title">Store issue</h2><p class="panel-caption">Only the recipe for the scanned lot and current stage is shown.</p></div>${tag('Scan required','amber')}</div><form class="entry-form" id="store-issue-form"><input id="store-lot" type="hidden" value=""><div id="store-scan-status" class="callout amber" style="margin:0">Scan a job card to load the lot, jet and dyeing recipe.</div><div id="store-issue-content" style="opacity:.45;pointer-events:none"><div class="detail-fields" style="margin:13px 0"><div class="detail-field"><span>Current stage</span><strong>Dyeing</strong></div><div class="detail-field"><span>Jet / batch</span><strong>Jet 16 · D-1908</strong></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Item</th><th>Planned</th><th>Available stock</th><th>Actual issue</th></tr></thead><tbody><tr><td><strong>Reactive Blue 19</strong><br><span class="muted">DYE-RB19</span></td><td>0.122 kg</td><td>15.5 kg</td><td><input class="input store-qty" disabled value="0.122" aria-label="Reactive Blue actual issue"> kg</td></tr><tr><td><strong>Scarlet RR</strong><br><span class="muted">DYE-SRR</span></td><td>0.092 kg</td><td>8.2 kg</td><td><input class="input store-qty" disabled value="0.092" aria-label="Scarlet actual issue"> kg</td></tr><tr><td><strong>Acetic Acid 80%</strong><br><span class="muted">CHEM-AA80</span></td><td>1.525 L</td><td>58 L</td><td><input class="input store-qty" disabled value="1.525" aria-label="Acetic Acid actual issue"> L</td></tr></tbody></table></div><div class="field" style="margin-top:13px"><label>STORE NOTE (OPTIONAL)</label><input class="input" id="store-note" disabled placeholder="e.g. substitute batch used"></div></div><button class="btn primary" id="store-submit" type="submit" disabled>Confirm chemical issue →</button></form></div></section>`;
}
function scan(){
  if(state.role==='storekeeper')return storekeeperScan();
  return header('Floor entry','Scan & entry','Scan the QR code on the physical job card before recording any work.',btn('View recent entries','ghost','pipeline'))+
  `<section class="scan-layout"><div class="panel scan-card"><div class="scan-frame"><div class="scan-cross">⌗</div></div><h2 class="panel-title">Waiting for job-card scan</h2><p class="panel-caption">No lot is selected. Point the device at the QR code attached to the physical card.</p><button class="btn primary" data-action="simulate-scan" style="margin-top:18px">⌗ Simulate QR scan</button></div><div class="panel"><div class="panel-header"><div><h2 class="panel-title">Worker meter entry</h2><p class="panel-caption">This form unlocks after a successful scan.</p></div>${tag('Scan required','amber')}</div><form class="entry-form" id="entry-form"><input id="entry-lot" type="hidden" value=""><div id="scan-lot-status" class="callout amber" style="margin:0">Scan a job card to identify the lot and stage.</div><div class="form-row" id="scan-entry-fields" style="opacity:.45"><div class="field"><label>OUTPUT METERS</label><input class="input" id="entry-meters" type="number" disabled placeholder="Scan required"></div><div class="field"><label>OUTPUT ROLL COUNT</label><input class="input" type="number" disabled placeholder="Physical rolls produced"></div></div><div class="field" style="opacity:.45" id="scan-entry-type"><label>ENTRY TYPE</label><select class="select" disabled><option>Stage complete</option><option>Partial completion</option><option>Reprocess / return</option></select></div><div class="toggle-row" id="partial-row" style="opacity:.45;pointer-events:none"><span class="switch" id="partial-switch"><i></i></span><span>Mark as partial completion</span></div><div class="field" style="opacity:.45" id="scan-note"><label>NOTE (OPTIONAL)</label><input class="input" disabled placeholder="Scan required"></div><button class="btn primary" id="entry-submit" type="submit" disabled>Save stage entry →</button></form></div></section>`;
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-action="simulate-scan"]');
  if(!trigger)return;
  event.preventDefault();event.stopImmediatePropagation();
  const lot=state.lots.find(item=>item.id==='LOT-24081');
  if(state.role==='storekeeper'){
    document.getElementById('store-lot').value=lot.id;
    document.getElementById('store-scan-status').className='callout green';
    document.getElementById('store-scan-status').innerHTML=`<strong>${lot.id}</strong> · ${lot.party}<br>Recipe loaded: <strong>Dyeing · Jet 16 · Batch D-1908</strong>`;
    document.getElementById('store-issue-content').style.opacity='1';document.getElementById('store-issue-content').style.pointerEvents='';
    document.querySelectorAll('.store-qty, #store-note').forEach(field=>field.disabled=false);
    document.getElementById('store-submit').disabled=false;
    toast(`${lot.id} scanned · dyeing recipe loaded`);
    return;
  }
  document.getElementById('entry-lot').value=lot.id;
  document.getElementById('scan-lot-status').className='callout green';
  document.getElementById('scan-lot-status').innerHTML=`<strong>${lot.id}</strong> · ${lot.party}<br>Current stage: <strong>${lot.stage}</strong> · ${lot.qty} received`;
  document.querySelectorAll('#entry-form input:not(#entry-lot), #entry-form select').forEach(field=>field.disabled=false);
  ['scan-entry-fields','scan-entry-type','partial-row','scan-note'].forEach(id=>{const item=document.getElementById(id);item.style.opacity='1';item.style.pointerEvents='';});
  document.getElementById('entry-submit').disabled=false;
  toast(`${lot.id} scanned · meter entry unlocked`);
},true);
document.addEventListener('submit',event=>{if(event.target.id!=='store-issue-form')return;event.preventDefault();const lot=document.getElementById('store-lot').value;if(!lot)return;toast(`Chemical issue recorded for ${lot} · Jet 16`);},true);
