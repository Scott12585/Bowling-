const WHAMMY_SEASON='2026 American';
async function loadWhammySeason(){
 const {data:p,error:pe}=await sb.from('card_game_players').select('*').eq('active',true).order('display_order');
 if(pe)return alert(pe.message);
 const {data:s,error:se}=await sb.from('card_game_season_stats').select('*').eq('season',WHAMMY_SEASON);
 if(se)return alert(se.message);
 const map=Object.fromEntries((s||[]).map(r=>[r.player_id,r]));
 const el=document.getElementById('whammyButtons');if(!el)return;
 el.innerHTML=(p||[]).map(player=>{const row=map[player.id]||{};const value=row.whammies||0;return `<div class="big-counter"><h3>${player.name}</h3><div class="whammy-controls"><button class="whammy-down" ${value<=0?'disabled':''} onclick="whammyBump(${player.id},-1)" aria-label="Decrease ${player.name} Whammy">▼</button><strong>${value}</strong><button class="whammy-up" onclick="whammyBump(${player.id},1)" aria-label="Increase ${player.name} Whammy">▲</button></div></div>`}).join('');
 const pot=(s||[]).reduce((total,row)=>total+Number(row.whammies||0),0);
 const potEl=document.getElementById('whammyPotAmount');if(potEl)potEl.textContent=`$${pot}`;
}
window.whammyBump=async(pid,delta)=>{
 const {data:old,error}=await sb.from('card_game_season_stats').select('*').eq('season',WHAMMY_SEASON).eq('player_id',pid).maybeSingle();if(error)return alert(error.message);
 const row={season:WHAMMY_SEASON,player_id:pid,assassinations:old?.assassinations||0,self_inflictions:old?.self_inflictions||0,whammies:Math.max(0,(old?.whammies||0)+delta),updated_at:new Date().toISOString()};
 const {error:saveError}=await sb.from('card_game_season_stats').upsert(row,{onConflict:'season,player_id'});if(saveError)return alert(saveError.message);loadWhammySeason();
};
window.loadWhammySeason=loadWhammySeason;
const whammyNav=document.querySelector('.nav[data-view="whammyGame"]');if(whammyNav)whammyNav.addEventListener('click',()=>setTimeout(loadWhammySeason,0));