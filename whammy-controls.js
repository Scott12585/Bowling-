const WHAMMY_SEASON='2026 American';
async function loadWhammySeason(){
 const el=document.getElementById('whammyButtons');if(!el)return;
 const oldRects={};el.querySelectorAll('.big-counter[data-player-id]').forEach(card=>oldRects[card.dataset.playerId]=card.getBoundingClientRect());
 const {data:p,error:pe}=await sb.from('card_game_players').select('*').eq('active',true).order('display_order');
 if(pe)return alert(pe.message);
 const {data:s,error:se}=await sb.from('card_game_season_stats').select('*').eq('season',WHAMMY_SEASON);
 if(se)return alert(se.message);
 const map=Object.fromEntries((s||[]).map(r=>[r.player_id,r]));
 const ranked=[...(p||[])].sort((a,b)=>Number(map[b.id]?.whammies||0)-Number(map[a.id]?.whammies||0)||a.display_order-b.display_order);
 el.innerHTML=ranked.map((player,i)=>{const row=map[player.id]||{};const value=row.whammies||0;return `<div class="big-counter rank-${i+1}" data-player-id="${player.id}"><span class="whammy-rank">${i+1}</span><h3>${player.name}</h3><div class="whammy-controls"><button class="whammy-up" onclick="whammyBump(${player.id},1)" aria-label="Increase ${player.name} Whammy">▲<span>UP</span></button><strong>${value}</strong><button class="whammy-down" ${value<=0?'disabled':''} onclick="whammyBump(${player.id},-1)" aria-label="Decrease ${player.name} Whammy">▼<span>DOWN</span></button></div></div>`}).join('');
 requestAnimationFrame(()=>{el.querySelectorAll('.big-counter[data-player-id]').forEach(card=>{const old=oldRects[card.dataset.playerId];if(!old)return;const now=card.getBoundingClientRect(),dy=old.top-now.top;if(Math.abs(dy)<2)return;card.style.transform='translateY('+dy+'px)';card.style.zIndex='5';card.classList.add(dy>0?'rank-rising':'rank-falling');requestAnimationFrame(()=>{card.style.transition='transform .7s cubic-bezier(.22,.8,.25,1),box-shadow .7s ease,background .7s ease';card.style.transform='translateY(0)';setTimeout(()=>{card.style.transition='';card.style.transform='';card.style.zIndex='';card.classList.remove('rank-rising','rank-falling')},780)})})});
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