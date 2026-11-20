// Interaction state checks with DOM/canvas stand-ins. This is not visual QA.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),byId=new Map(),created=[];
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(o,k)=>k in o?o[k]:(()=>{})});
class Element {
  constructor(tag='div'){this.tag=tag;this.nodes=[];this.attrs={};this.dataset={};this.events={};this.hidden=false;this.textContent='';this.classes=new Set();this.classList={toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k),contains:k=>this.classes.has(k)};created.push(this);}
  set innerHTML(s){this.html=s;this.nodes=[];for(const m of s.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)){const e=new Element(m[1]);for(const a of m[2].matchAll(/([a-z][a-z0-9-]*)="([^"]*)"/gi))e.setAttribute(a[1],a[2]);this.nodes.push(e);}}
  setAttribute(k,v){this.attrs[k]=String(v);if(k==='id'){this.id=v;byId.set(v,this);}if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
  getAttribute(k){return this.attrs[k];}
  removeAttribute(k){delete this.attrs[k];}
  prepend(e){this.nodes.unshift(e);}
  append(e){this.nodes.push(e);}
  querySelectorAll(s){return this.nodes.filter(e=>s==='a'?e.tag==='a':s==='[data-glue]'?'glue'in e.dataset:s.startsWith('.')?(e.attrs.class||'').split(' ').includes(s.slice(1)):false);}
  querySelector(s){return this.querySelectorAll(s)[0];}
  addEventListener(k,f){this.events[k]=f;}
  getBoundingClientRect(){return {width:this.id?.startsWith('e8Root')?300:640,height:this.id?.startsWith('e8Root')?190:440,left:0,top:0};}
  getContext(){return context;}
}
const document={body:new Element('body'),createElement:tag=>new Element(tag),getElementById:id=>{assert(byId.has(id),'Missing element '+id);return byId.get(id);}};
const sandbox={document,devicePixelRatio:1,addEventListener:()=>{},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};sandbox.window=sandbox;vm.createContext(sandbox);
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
for(const file of ['leech-three-e8-data.js','leech-three-e8.js'])vm.runInContext(read(file),sandbox,{timeout:2000});
const tab=read('index.html').match(/<template id="page-src-leech">([\s\S]*?)<\/template>/)[1];
const source=tab.slice(tab.indexOf('const Q = [];'),tab.indexOf("document.getElementById('sTotal')"));
const generated=new vm.Script(source+'\n({vecs,shellOf,N});').runInNewContext({}, {timeout:15000});
sandbox.LeechThreeE8.mount(generated);
const $=id=>document.getElementById(id),page=created.find(e=>e.id==='e8Construction'),bits=page.querySelectorAll('[data-glue]');
assert.equal(bits.length,12);assert(sandbox.__leechThreeE8Active);assert.equal(sandbox.__threeE8Check.rootCount,240);
const mask=()=>Number($('e8Label').textContent.replaceAll(',',''));
function choose(target){for(let i=0;i<12;i++)if(((mask()^target)>>i)&1)bits[i].onclick();assert.equal(mask(),target);}
choose(0);assert.equal($('e8ClassCount').textContent,'720');assert.equal($('e8SumTotal').textContent,'32');assert.equal($('e8Remainder').textContent,'Three E₈ blocks');
const before=$('e8VectorNumber').textContent;$('e8Next').onclick();assert.notEqual($('e8VectorNumber').textContent,before);$('e8Prev').onclick();assert.equal($('e8VectorNumber').textContent,before);
const empty=sandbox.__threeE8Check.classCounts.findIndex(n=>n===0);choose(empty);
assert.equal($('e8SelectedTitle').textContent,'No shortest vector here');assert.equal($('e8SumTotal').textContent,'—');assert($('e8Next').disabled);assert(!$('e8Empty').hidden);
$('e8Filter').onclick();assert.equal($('e8CloudCount').textContent,'196,560 shortest vectors · 24D → 2D');assert($('e8Empty').hidden);assert.equal($('e8SumTotal').textContent,'32');
$('e8Turn').oninput({target:{value:'1.2'}});
$('e8Original').onclick();assert(!sandbox.__leechThreeE8Active);assert(page.hidden);
$('e8Mode').onclick();assert(sandbox.__leechThreeE8Active);assert(!page.hidden);
for(const a of page.querySelectorAll('a')){assert.match(a.attrs.href,/\/blob\/[0-9a-f]{40}\//);assert.equal(a.attrs.target,'_blank');assert.equal(a.attrs.rel,'noopener noreferrer');}
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
console.log(JSON.stringify({status:'PASS',checks:['initial construction mode','12 glue switches','720 shortest vectors in base coset','previous/next selection','empty coset state','return to full shell','projection rotation handler','23-fold mode and return','published proof links'],
 source_sha256:Object.fromEntries(['leech-three-e8.js','leech-three-e8.css','leech-three-e8-data.js'].map(p=>[p,sha(read(p))])),scope:'DOM/canvas stand-ins; no browser layout, pixels or pointer hit-testing are verified by this test.'},null,2));
