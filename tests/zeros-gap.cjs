'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),m=require('../zeros-gap-math.js'),oracle=require('./zeros-gap-reference.json');
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const checked=[];function check(name,f){f();checked.push(name);}
let gapError=0,referenceError=0;
check('Direct gap agrees with 60-digit independent polylog/Gamma values',()=>{
 for(const c of oracle.cases){const s=[c.sigma,c.t];gapError=Math.max(gapError,distance(m.gap(s,c.epsilon).value,c.gap));referenceError=Math.max(referenceError,distance(m.zetaReference(s),c.zeta));}
 assert(gapError<2e-11, gapError);assert(referenceError<2e-11,referenceError);
});
check('Original s=-1 gap is recovered and nonfinite inputs are rejected',()=>{
 for(const e of [1,.1,.01,.001]){const d=-Math.expm1(-e),exact=Math.exp(-e)/(d*d)-1/e**2;assert(Math.abs(m.gap([-1,0],e).value[0]-exact)<1e-8);}
 for(const bad of [0,-.1,NaN,Infinity])assert.throws(()=>m.gap([.5,14],bad),RangeError);
 assert.throws(()=>m.gap([1,0],.1),RangeError);
});
const raw=[.2,.1,.05,.025].map(epsilon=>({epsilon,...m.search(epsilon)}));
check('Finite-damping roots converge without constraining Re(s) to 1/2',()=>{
 for(const r of raw)assert(r.converged&&r.residual<2e-12);
 for(let i=1;i<raw.length;i++)assert(distance([raw[i].sigma,raw[i].t],oracle.reference_zero)<distance([raw[i-1].sigma,raw[i-1].t],oracle.reference_zero));
 assert(raw[0].sigma<.3&&raw[3].sigma>.45&&raw[3].sigma<.49);
});
const estimates=[.1,.05,.025].map(epsilon=>({epsilon,levels:5,...m.search(epsilon,5)}));
check('Five-level extrapolation improves with damping halved',()=>{
 const errors=estimates.map(r=>distance([r.sigma,r.t],oracle.reference_zero));
 assert(errors[0]<1e-8&&errors[1]<3e-10&&errors[2]<2e-11);assert(errors[2]<errors[1]&&errors[1]<errors[0]);
});
check('Tail-cutoff doubling preserves the extrapolated candidate',()=>{
 const r=m.findRoot(.05,{levels:5,cutoff:96,seed:[.4,14]});
 assert(distance([r.sigma,r.t],[estimates[1].sigma,estimates[1].t])<1e-11);
});
const controls=[.4,.5,.6].map(sigma=>({sigma,t:oracle.reference_zero[1],magnitude:m.complex.abs(m.extrapolate([sigma,oracle.reference_zero[1]],.05).value)}));
check('The neighboring horizontal probes are distinguishable',()=>{assert(controls[0].magnitude>.05&&controls[2].magnitude>.05&&controls[1].magnitude<1e-9);});
check('The search does not consume stored zero ordinates or its independent reference',()=>{
 const text=fs.readFileSync(path.join(root,'zeros-gap-math.js'),'utf8');assert(!text.includes('RIEMANN_ZEROS')&&!text.includes('14.1347'));
 const body=text.slice(text.indexOf('function findRoot'),text.indexOf('// Exact finite-series'));
 assert(!body.includes('zetaReference'));
});
const theta=m.thetaCoefficients();
check('Exact integer coefficients match the four proved Leech shell counts',()=>assert.deepEqual(theta.theta.map(String),['1','0','196560','16773120','398034000','4629381120']));
check('Golay generator matches the proved playground basis',()=>assert.deepEqual(m.golayBasis(),[8729438,4716696,2358348,1179174,1005026,290622,145311,84390,42195,17118,15946,7973]));
check('All 4096 Golay words give the expected weight distribution',()=>assert.deepEqual(m.distribution(),{0:1,8:759,12:2576,16:759,24:1}));
check('An allowed weight cannot bypass membership or length checks',()=>{
 const invalid=m.guard('000000000000000011111111');assert.equal(invalid.weight,8);assert(invalid.allowedWeight&&!invalid.member&&!invalid.valid);
 for(const s of ['1'.repeat(25),'0'.repeat(23),'x'.repeat(24),''])assert(!m.guard(s).valid);
 assert(m.guard(m.golayBasis()[0].toString(2).padStart(24,'0')).valid);
});
const report={status:'PASS',checks:checked.length,checked,independent_reference:oracle.method,max_gap_reference_error:gapError,max_zeta_reference_error:referenceError,raw_roots:raw,extrapolated_roots:estimates,reference_zero:oracle.reference_zero,controls,theta_coefficients:theta.theta.map(String),delta_coefficients:theta.delta.map(String),golay_distribution:m.distribution(),domain:{sigma:[.1,.9],t:[12,16],epsilon:[.2,.1,.05,.025],series_cutoff:48},limitations:'Finite-window floating-point experiment; no interval enclosure, no proof of uniqueness or completeness of the zero search, and no RH proof. The full complex finite-part limit and theta identity are sourced mathematics, not new Lean theorems in this change.',source_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'zeros-gap-math.js'))).digest('hex')};
if(process.argv.includes('--save'))fs.writeFileSync(path.join(root,'docs/zeros-gap-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
