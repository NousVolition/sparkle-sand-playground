'use strict';
// Exercise the proof-menu wiring with DOM stand-ins; no rendering claim.
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), data=require('../proof-coverage.js');
class Element {
  constructor(){this.children=[];this.events={};this.attrs={};this.open=false;this.textContent='';}
  append(e){this.children.push(e);}
  replaceChildren(){this.children=[];}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,f){(this.events[k] ||= []).push(f);}
  contains(e){return e===this || this.children.includes(e);}
  focus(){this.focused=true;}
}
const elements=Object.fromEntries(['proof-notes','proof-title','proof-status','proof-note','proof-links','proof-record'].map(id=>[id,new Element()]));
const summary=new Element(); elements['proof-notes'].querySelector=()=>summary;
const buttons=Object.keys(data.pages).map((key,i)=>{
  const e=new Element();e.dataset={mode:key};e.textContent=`${i+1}. ${key}`;e.classList={contains:()=>key==='e8insp'};return e;
});
const unknown=new Element();unknown.dataset={mode:'future-tab'};unknown.textContent='Future tab';unknown.classList={contains:()=>false};buttons.push(unknown);
const document=new Element();
document.getElementById=id=>elements[id];document.querySelectorAll=()=>buttons;document.createElement=()=>new Element();
vm.runInNewContext(fs.readFileSync(path.join(root,'proof-coverage.js'),'utf8'),{document},{timeout:1000});
assert.equal(elements['proof-title'].textContent,'30. e8insp');
let checked=0;
for(const b of buttons){
  for(const f of b.events.click) f();
  assert.equal(elements['proof-title'].textContent,b.textContent);
  const p=data.pages[b.dataset.mode], links=elements['proof-links'].children;
  if(!p){assert.equal(elements['proof-status'].textContent,'Not reviewed');assert.equal(links.length,0);continue;}
  assert.equal(elements['proof-status'].textContent,p.status);assert.equal(elements['proof-note'].textContent,p.note);
  const expected = (p.verification || []).concat(p.links);
  assert.equal(links.length,expected.length);
  links.forEach((li,i)=>{const a=li.children[0];assert.equal(a.href,expected[i].href);assert.equal(a.target,'_blank');assert.equal(a.rel,'noopener');assert(a.attrs['aria-label'].endsWith('(opens in a new tab)'));});
  assert(elements['proof-record'].href.endsWith('#'+b.dataset.mode)); checked++;
}
const panel=elements['proof-notes'];panel.open=true;
for(const f of document.events.keydown) f({key:'Escape'});
assert(!panel.open && summary.focused);
panel.open=true;for(const f of document.events.pointerdown) f({target:new Element()});assert(!panel.open);
console.log(JSON.stringify({status:'PASS',tab_selections:checked,initial_active_tab:'e8insp',unknown_tab_fallback:true,external_link_attributes:true,escape_and_outside_close:true,scope:'DOM stand-ins; no rendered browser test'},null,2));
