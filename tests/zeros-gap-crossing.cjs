'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const crossing=require('../zeros-gap-crossing.js'),M=require('../zeros-gap-math.js'),oracle=require('./zeros-gap-crossing-reference.json');
const pass=crossing.createPass(),cfg=pass.config,profile=pass.profile(),checked=[];
function check(name,f){f();checked.push(name);}
let maxError=0;
check('Seven crossing readings agree with an independent 60-digit reference',()=>{
  assert(Math.abs(cfg.center-oracle.config.center)<1e-12);assert(Math.abs(cfg.height-oracle.config.height)<1e-12);
  for(const fixture of oracle.cases){const r=pass.read(fixture.offset);const error=Math.hypot(r.real-fixture.reference[0],r.imaginary-fixture.reference[1]);maxError=Math.max(maxError,error);assert(error<2e-11);}
});
check('All 161 positions keep height and softening fixed and use the actual direct sum',()=>{
  assert(Object.isFrozen(cfg));assert.throws(()=>{cfg.height=14;},TypeError);
  for(const r of profile){assert.equal(r.height,cfg.height);assert.equal(r.epsilon,.05);assert.equal(r.sigma,cfg.center+r.offset);
    const v=M.gap([r.sigma,r.height],r.epsilon).value;assert.equal(r.real,v[0]);assert.equal(r.imaginary,v[1]);assert.equal(r.magnitude,Math.hypot(...v));}
});
check('Left and right readings have opposite real signs and positive sizes',()=>{
  for(const offset of [.0001,.005,.01,.02]){assert(pass.read(-offset).real<0);assert(pass.read(offset).real>0);assert(pass.read(-offset).magnitude>0&&pass.read(offset).magnitude>0);}
});
check('Sampled real part increases and sampled sizes fall then rise; this is not interval certification',()=>{
  for(let i=1;i<profile.length;i++){assert(profile[i].real>profile[i-1].real);if(i<=80)assert(profile[i].magnitude<profile[i-1].magnitude);else assert(profile[i].magnitude>profile[i-1].magnitude);}
});
check('Center retains its computed residual rather than replacing it with an exact zero',()=>{
  const r=pass.read(0);assert.equal(r.magnitude,cfg.centerResidual);assert(r.magnitude<1e-11);assert(r.magnitude>0);
});
check('Invalid or out-of-range offsets are rejected',()=>{for(const x of [NaN,Infinity,-Infinity,.021,-.021,undefined])assert.throws(()=>pass.read(x),RangeError);});
const report={status:'PASS',checkedAt:new Date().toISOString(),checks:checked.length,checked,
  config:cfg,readings:[-.02,-.01,-.005,0,.005,.01,.02].map(pass.read),
  independentReference:oracle.method,maxError,sampledPositions:profile.length,
  sourceHashes:Object.fromEntries(['zeros-gap-crossing.js','zeros-gap-math.js'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/\r\n/g,'\n')).digest('hex')])),
  limits:'A finite-softening slice, not an exact zeta zero. Samples do not establish strict monotonicity throughout an interval or an exact complex root; those remain hypotheses of the Lean theorem.'};
if(process.argv.includes('--save'))fs.writeFileSync(path.join(__dirname,'../docs/zeros-gap-crossing-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks:report.checks,maxError,config:cfg}));
