const winsSb=supabase.createClient('https://qgkrwfwhweqyzlzgwair.supabase.co','sb_publishable_caoCyu6MQc5R_-4t4qGE3A_z23R4rYh');
let seasonWinPlayers=[];
async function loadSeasonWins(){
  const box=document.querySelector('#winsButtons'); if(!box)return;
  const {data:p,error:pe}=await winsSb.from('card_game_players').select('*').eq('active',true).order('display_order');
  if(pe)return alert(pe.message); seasonWinPlayers=p||[];
  const {data:s,error:se}=await winsSb.from('card_game_stats').select('player_id,games_won,card_game_nights!inner(season)').eq('card_game_nights.season','2026 American');
  if(se)return alert(se.message);
  const totals={}; seasonWinPlayers.forEach(p=>totals[p.id]=0); (s||[]).forEach(r=>{if(totals[r.player_id]!=null)totals[r.player_id]+=Number(r.games_won||0)});
  box.innerHTML=seasonWinPlayers.map(p=>`<div class="big-counter season-win-card"><h3>${p.name}</h3><div class="season-win-controls"><button class="season-win-down" onclick="changeSeasonWin(${p.id},-1,${totals[p.id]||0})" ${(totals[p.id]||0)<=0?'disabled':''}>▼</button><strong>${totals[p.id]||0}</strong><button class="season-win-up" onclick="changeSeasonWin(${p.id},1,${totals[p.id]||0})">▲</button></div></div>`).join('');
}
window.changeSeasonWin=async(pid,delta,total)=>{
  if(delta<0&&total<=0)return;
  let {data:n,error:ne}=await winsSb.from('card_game_nights').select('*').eq('season','2026 American').eq('week',1).maybeSingle();
  if(ne)return alert(ne.message); if(!n){const r=await winsSb.from('card_game_nights').insert({season:'2026 American',week:1}).select().single();if(r.error)return alert(r.error.message);n=r.data}
  const {data:old,error:oe}=await winsSb.from('card_game_stats').select('*').eq('night_id',n.id).eq('player_id',pid).maybeSingle(); if(oe)return alert(oe.message);
  const current=Number(old?.games_won||0),next=Math.max(0,current+delta);
  const row=old?{...old,games_won:next}:{night_id:n.id,player_id:pid,games_won:next};
  const {error}=await winsSb.from('card_game_stats').upsert(row,{onConflict:'night_id,player_id'}); if(error)return alert(error.message); await loadSeasonWins();
};
document.querySelector('[data-view="winsGame"]')?.addEventListener('click',()=>setTimeout(loadSeasonWins,250));