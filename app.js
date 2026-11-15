const reports = [
  {id:1,type:'found',name:'Black laptop sleeve',category:'Electronics',location:'Central Library',date:'Today, 10:30 AM',description:'A black 14-inch laptop sleeve was handed to the library desk. Describe the laptop or a private mark to claim it.',icon:'💻'},
  {id:2,type:'lost',name:'Blue Hydro Flask bottle',category:'Water bottles',location:'Sports Complex',date:'Today, 9:15 AM',description:'Dark blue water bottle with a small mountain sticker near the bottom.',icon:'🧴'},
  {id:3,type:'found',name:'Wireless earbuds case',category:'Electronics',location:'Cafeteria',date:'Yesterday',description:'White wireless-earbuds case found on a cafeteria table. Provide a distinctive detail to claim.',icon:'🎧'},
  {id:4,type:'lost',name:'Grey backpack',category:'Bags',location:'Engineering Block',date:'Yesterday',description:'Grey backpack with a green notebook and a charger inside.',icon:'🎒'},
  {id:5,type:'found',name:'Set of keys',category:'Keys',location:'Main Auditorium',date:'Sep 9',description:'Three keys on a red fabric keychain were submitted to campus security.',icon:'🔑'},
  {id:6,type:'lost',name:'Silver watch',category:'Accessories',location:'Student Centre',date:'Sep 8',description:'Silver analog watch with a dark blue face, possibly left in the study area.',icon:'⌚'}
];
const list = document.querySelector('#report-list');
const search = document.querySelector('#search-input');
const typeFilter = document.querySelector('#type-filter');
const categoryFilter = document.querySelector('#category-filter');
const count = document.querySelector('#result-count');
const reportDialog = document.querySelector('#report-dialog');
const detailsDialog = document.querySelector('#details-dialog');
const authDialog = document.querySelector('#auth-dialog');
const authForm = document.querySelector('#auth-form');
const chatDialog = document.querySelector('#chat-dialog');
const chatForm = document.querySelector('#chat-form');
const form = document.querySelector('#report-form');

function renderReports(){
  const phrase = search.value.toLowerCase().trim();
  const filtered = reports.filter(r => (typeFilter.value === 'all' || r.type === typeFilter.value) && (categoryFilter.value === 'all' || r.category === categoryFilter.value) && `${r.name} ${r.category} ${r.location} ${r.description}`.toLowerCase().includes(phrase));
  count.textContent = `${filtered.length} active report${filtered.length === 1 ? '' : 's'}`;
  list.innerHTML = filtered.length ? filtered.map(r => `<article class="report-card" data-id="${r.id}" tabindex="0"><div class="report-image">${r.icon}</div><div class="report-body"><span class="tag ${r.type}">${r.type} item</span><h3>${r.name}</h3><div class="metadata"><span>⌖ ${r.location}</span><span>◷ ${r.date}</span></div></div></article>`).join('') : '<div class="empty-state"><h2>No matching reports</h2><p>Try a different item name, place, or category.</p></div>';
}
function showDetails(id){
  const r = reports.find(item => item.id === id);
  document.querySelector('#details-content').innerHTML = `<button class="close" type="button" data-close-dialog aria-label="Close" style="float:right">×</button><div class="details-image">${r.icon}</div><span class="tag ${r.type}">${r.type} item</span><h2>${r.name}</h2><p class="details-meta">⌖ ${r.location}<br>◷ ${r.date}<br>Category: ${r.category}</p><p>${r.description}</p><div class="claim-box"><h3>Is this your item?</h3><p>Send a private claim with identifying details. The finder or campus security will review it.</p><button class="button primary" id="claim-button">Submit a claim</button> <button class="button ghost" id="chat-button">Chat privately</button></div>`;
  detailsDialog.showModal();
}
function openReport(type){
  form.reset(); document.querySelector('#report-type').value = type;
  document.querySelector('#form-kicker').textContent = `New ${type} report`;
  document.querySelector('#form-title').textContent = `Report a ${type} item`;
  reportDialog.showModal();
}
function openAuth(){ authDialog.showModal(); }
function openChat(){ if(!sessionStorage.getItem('rv-student')){openAuth();return;} document.querySelector('#chat-messages').innerHTML='<div class="message them">Hello! I found this item and submitted it to campus security. Can you describe one private detail to verify it is yours?</div>'; chatDialog.showModal(); }
function updateAuthButton(){ const student = sessionStorage.getItem('rv-student'); const button = document.querySelector('#sign-in-button'); button.textContent = student ? `✓ ${student}` : 'Sign in with RV email'; }
document.addEventListener('click', e => {
  const card = e.target.closest('.report-card'); if(card) showDetails(Number(card.dataset.id));
  const report = e.target.closest('[data-open-report]'); if(report){ if(!sessionStorage.getItem('rv-student')) openAuth(); else openReport(report.dataset.openReport); }
  if(e.target.id === 'sign-in-button') openAuth();
  if(e.target.closest('[data-close-dialog]')) e.target.closest('dialog').close();
  if(e.target.id === 'claim-button'){ detailsDialog.close(); showToast('Claim request started — in the full app, you would answer ownership questions.'); }
  if(e.target.id === 'chat-button') openChat();
  const nav = e.target.closest('[data-view]'); if(nav){ document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('active')); nav.classList.add('active'); document.querySelectorAll('.view').forEach(x=>x.classList.remove('active')); document.querySelector(`#${nav.dataset.view}-view`).classList.add('active'); }
  if(e.target.id === 'clear-filters'){search.value='';typeFilter.value='all';categoryFilter.value='all';renderReports();}
});
document.addEventListener('keydown',e=>{const card=e.target.closest?.('.report-card');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showDetails(Number(card.dataset.id));}});
[search,typeFilter,categoryFilter].forEach(x=>x.addEventListener('input',renderReports));
form.addEventListener('submit',e=>{e.preventDefault(); const data=new FormData(form); const r={id:Date.now(),type:data.get('type'),name:data.get('name'),category:data.get('category'),location:data.get('location'),date:'Just now',description:data.get('description'),icon:data.get('category')==='Bags'?'🎒':data.get('category')==='Electronics'?'📱':'📦'};reports.unshift(r);reportDialog.close();renderReports();showToast('Your report is live. Matching students can now be notified.');});
authForm.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(authForm);const email=data.get('email').trim();if(!email.endsWith('@rvuniversity.edu.in')){showToast('Please use your official RV University email address.');return;}sessionStorage.setItem('rv-student',email.split('@')[0]);authDialog.close();updateAuthButton();showToast('Verification code sent. In the real app, students enter the code before access is granted.');});
chatForm.addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#chat-input');const message=input.value.trim();if(!message)return;document.querySelector('#chat-messages').insertAdjacentHTML('beforeend',`<div class="message me">${message.replace(/[<>]/g,'')}</div>`);input.value='';});
function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.style.opacity=1;setTimeout(()=>toast.style.opacity=0,3600)}
renderReports();
updateAuthButton();
