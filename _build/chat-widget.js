// chat-widget.js â€” injects the Rhine Solution assistant (hubtown-style skin)
// into every EN page as a self-contained vanilla-JS widget. Talks to /api/chat
// (Gemini SSE proxy; local serve.js stubs it offline).
// Runs inside build-merged.js (after chrome).
'use strict';

const fs = require('fs');
const path = require('path');

const MERGED = path.resolve(__dirname, '..');

const WIDGET = `<script id="rhine-chat-widget">
(function(){
  if (document.getElementById('rhine-chat')) return;
  var CSS =
    '.rhine-chat{position:fixed;right:1rem;bottom:1rem;z-index:9500;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}'
  + '.rhine-chat *{box-sizing:border-box}'
  + '.rh-chat-fab{display:flex;align-items:center;justify-content:center;width:56px;height:56px;background:#020a19;color:#d5e0ff;border:1px solid rgba(126,167,255,.45);cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:.12em;text-transform:uppercase;position:relative;transition:transform .2s,background .2s}'
  + '.rh-chat-fab:hover{transform:translateY(-2px);background:#0a142e}'
  + '.rh-chat-fab::before,.rh-chat-fab::after{content:"";position:absolute;width:6px;height:6px;background:#2C6BFF}'
  + '.rh-chat-fab::before{top:-1px;left:-1px}'
  + '.rh-chat-fab::after{bottom:-1px;right:-1px}'
  + '.rh-chat-panel{position:absolute;right:0;bottom:66px;width:min(380px,calc(100vw - 2rem));height:min(520px,70vh);display:flex;flex-direction:column;background:#020a19;border:1px solid rgba(126,167,255,.25);box-shadow:0 20px 60px rgba(0,0,0,.6)}'
  + '.rh-chat-panel[hidden]{display:none}'
  + '.rh-chat-panel::before{content:"";position:absolute;top:-1px;left:-1px;width:8px;height:8px;background:#2C6BFF}'
  + '.rh-chat-panel::after{content:"";position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;background:#2C6BFF}'
  + '.rh-chat-head{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;border-bottom:1px solid rgba(126,167,255,.18);background:rgba(7,14,36,.6)}'
  + '.rh-chat-title{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#d5e0ff;font-weight:700}'
  + '.rh-chat-close{background:none;border:none;color:rgba(126,167,255,.7);cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:.1em;text-transform:uppercase}'
  + '.rh-chat-close:hover{color:#d5e0ff}'
  + '.rh-chat-msgs{flex:1;overflow-y:auto;padding:.75rem 1rem;display:flex;flex-direction:column;gap:.5rem}'
  + '.rh-chat-msg{max-width:85%;padding:.6rem .85rem;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}'
  + '.rh-chat-msg--assistant{align-self:flex-start;background:rgba(13,26,56,.9);border:1px solid rgba(126,167,255,.18);color:rgba(226,234,255,.92)}'
  + '.rh-chat-msg--user{align-self:flex-end;background:#2C6BFF;color:#fff}'
  + '.rh-chat-form{display:flex;gap:.5rem;padding:.75rem 1rem;border-top:1px solid rgba(126,167,255,.18);background:rgba(7,14,36,.6)}'
  + '.rh-chat-input{flex:1;min-width:0;padding:.6rem .85rem;border:1px solid rgba(126,167,255,.25);background:rgba(13,26,56,.9);color:#d5e0ff;font-family:inherit;font-size:13px;outline:none}'
  + '.rh-chat-send{background:#2C6BFF;color:#fff;border:none;padding:.6rem .9rem;cursor:pointer;font-family:inherit;font-size:10px;letter-spacing:.1em;text-transform:uppercase}'
  + '.rh-chat-send:disabled{opacity:.5;cursor:default}';
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var root=document.createElement('div');root.className='rhine-chat';root.id='rhine-chat';
  root.innerHTML='<div class="rh-chat-panel" hidden><div class="rh-chat-head"><span class="rh-chat-title">Rhine Solution Assistant</span><button class="rh-chat-close" type="button" aria-label="Close chat">Close</button></div><div class="rh-chat-msgs" role="log" aria-live="polite"></div><form class="rh-chat-form"><input class="rh-chat-input" type="text" placeholder="Ask about Rhine Solution..." autocomplete="off" aria-label="Chat message"/><button class="rh-chat-send" type="submit" aria-label="Send message">Send</button></form></div><button class="rh-chat-fab" type="button" aria-label="Open chat">Chat</button>';
  document.body.appendChild(root);
  var panel=root.querySelector('.rh-chat-panel'),msgs=root.querySelector('.rh-chat-msgs'),form=root.querySelector('.rh-chat-form'),input=root.querySelector('.rh-chat-input'),fab=root.querySelector('.rh-chat-fab'),sendBtn=root.querySelector('.rh-chat-send'),closeBtn=root.querySelector('.rh-chat-close');
  var open=false,busy=false,messages=[{role:'assistant',content:'Hi! I\\'m the Rhine Solution assistant. Ask me about the studio, our projects, the team, or how to get in touch.'}];
  function renderAll(){msgs.innerHTML='';messages.forEach(function(m){var d=document.createElement('div');d.className='rh-chat-msg rh-chat-msg--'+m.role;d.textContent=m.content||'';msgs.appendChild(d);});msgs.scrollTop=msgs.scrollHeight;}
  renderAll();
  function toggle(v){open=v!==undefined?v:!open;panel.hidden=!open;fab.setAttribute('aria-label',open?'Close chat':'Open chat');if(open){input.focus();}}
  fab.addEventListener('click',function(){toggle();});
  closeBtn.addEventListener('click',function(){toggle(false);});
  form.addEventListener('submit',function(e){e.preventDefault();send();});
  async function send(){
    var text=input.value.trim();if(!text||busy)return;
    input.value='';busy=true;sendBtn.disabled=true;
    messages.push({role:'user',content:text});
    var d=document.createElement('div');d.className='rh-chat-msg rh-chat-msg--assistant';d.textContent='â€¦';msgs.appendChild(d);
    var history=messages.slice(0,-1).concat([{role:'user',content:text}]);
    var full='';
    try{
      var res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,currentPath:location.pathname})});
      if(!res.ok||!res.body)throw new Error('chat '+res.status);
      var reader=res.body.getReader(),dec=new TextDecoder(),acc='';
      for(;;){
        var r=await reader.read();if(r.done)break;
        acc+=dec.decode(r.value,{stream:true});
        var lines=acc.split('\\n');acc=lines.pop()||'';
        for(var k=0;k<lines.length;k++){
          var line=lines[k].trim();if(line.indexOf('data:')!==0)continue;
          var payload=line.slice(5).trim();
          if(payload==='[DONE]'){break;}
          try{var j=JSON.parse(payload);
            var delta=(j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content)||
                      (j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts&&j.candidates[0].content.parts.map(function(p){return p.text||'';}).join(''))||'';
            if(delta){full+=delta;d.textContent=full;msgs.scrollTop=msgs.scrollHeight;}
          }catch(_){}
        }
      }
    }catch(err){
      full='';
    }finally{
      busy=false;sendBtn.disabled=false;
      var matches=(full||'').match(/\\[navigate:([^\\]]+)\\]/g)||[];
      var clean=(full||'').replace(/\\[navigate:[^\\]]+\\]/g,'').trim();
      if(clean){d.textContent=clean;}
      else{d.textContent='Sorry, I couldn\\'t reach the assistant right now. Please try again.';}
      if(matches.length){var token=matches[matches.length-1].replace('[navigate:','').replace(']','');var target=token.charAt(0)==='/'?token:'/'+token;setTimeout(function(){location.href=target;},400);}
    }
  }
})();
</script>`;

function injectChat(html) {
  if (html.includes('rhine-chat-widget')) return html;
  return html.replace('</body>', WIDGET + '</body>');
}

module.exports = { injectChat };

if (require.main === module) {
  const PAGES = ['', 'about', 'team', 'news', 'projects', 'contact', 'privacy-policy', 'terms-and-conditions'];
  let injected = 0;
  for (const p of PAGES) {
    const f = p ? path.join(MERGED, p, 'index.html') : path.join(MERGED, 'index.html');
    if (!fs.existsSync(f)) continue;
    const out = injectChat(fs.readFileSync(f, 'utf8'));
    if (out !== fs.readFileSync(f, 'utf8')) { fs.writeFileSync(f, out, 'utf8'); injected++; }
  }
  console.log('chat-widget: injected into', injected, 'EN pages');
}