/* Copyright © 2026 NousVolition. All rights reserved. */
/* Numerical experiment. No stored zeta-zero ordinates are used by this module. */
(function (root) {
  'use strict';
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
  const scale=(a,x)=>[a[0]*x,a[1]*x], mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
  const div=(a,b)=>scale(mul(a,[b[0],-b[1]]),1/(b[0]*b[0]+b[1]*b[1]));
  const abs=a=>Math.hypot(...a), exp=a=>scale([Math.cos(a[1]),Math.sin(a[1])],Math.exp(a[0]));
  const log=a=>[Math.log(abs(a)),Math.atan2(a[1],a[0])];
  const sin=a=>[Math.sin(a[0])*Math.cosh(a[1]),Math.cos(a[0])*Math.sinh(a[1])];
  const coefficients=[676.5203681218851,-1259.1392167224028,771.32342877765313,
    -176.61502916214059,12.507343278686905,-0.13857109526572012,
    9.9843695780195716e-6,1.5056327351493116e-7];
  function gamma(z) {
    if(z[0]<0.5) return div([Math.PI,0],mul(sin(scale(z,Math.PI)),gamma(sub([1,0],z))));
    const w=sub(z,[1,0]); let a=[0.99999999999980993,0];
    coefficients.forEach((p,i)=>{a=add(a,div([p,0],add(w,[i+1,0])));});
    const t=add(w,[7.5,0]);
    return scale(mul(exp(sub(mul(add(w,[.5,0]),log(t)),t)),a),Math.sqrt(2*Math.PI));
  }
  const profiles=new Map();
  function profile(epsilon,cutoff) {
    const key=epsilon+':'+cutoff;
    if(profiles.has(key))return profiles.get(key);
    const N=Math.ceil(cutoff/epsilon), logs=new Float64Array(N), fade=new Float64Array(N);
    for(let n=1;n<=N;n++){logs[n-1]=Math.log(n);fade[n-1]=Math.exp(-epsilon*n);}
    const result={N,logs,fade}; profiles.set(key,result); return result;
  }
  function checkGapDomain(s,epsilon,cutoff) {
    if(!s.every(Number.isFinite)||s[0]<-1||s[0]>=1||Math.abs(s[1])>68||
       !Number.isFinite(epsilon)||epsilon<.001||epsilon>2||!Number.isFinite(cutoff)||cutoff<32||cutoff>96)
      throw new RangeError('Use −1 ≤ Re(s) < 1, |Im(s)| ≤ 68, 0.001 ≤ ε ≤ 2 and a cutoff from 32 to 96.');
  }
  function gap(s,epsilon,cutoff=48,basis) {
    checkGapDomain(s,epsilon,cutoff);
    const {N,logs,fade}=profile(epsilon,cutoff);let re=0,im=0,cr=0,ci=0;
    for(let i=0;i<N;i++){
      const amplitude=fade[i]*(basis ? basis.powers[i] : Math.exp(-s[0]*logs[i])), phase=-s[1]*logs[i];
      const yr=amplitude*(basis ? basis.cosines[i] : Math.cos(phase))-cr, tr=re+yr; cr=(tr-re)-yr;re=tr;
      const yi=amplitude*(basis ? basis.sines[i] : Math.sin(phase))-ci, ti=im+yi; ci=(ti-im)-yi;im=ti;
    }
    const area=mul(gamma(sub([1,0],s)),exp(scale(sub(s,[1,0]),Math.log(epsilon))));
    // n^(-sigma) <= n for sigma >= -1 gives a bound on the omitted series tail.
    const q=Math.exp(-epsilon), d=-Math.expm1(-epsilon);
    const tailBound=Math.exp(-epsilon*(N+1))*(1+N*d)/(d*d);
    return {value:sub([re,im],area),bars:[re,im],area,terms:N,tailBound};
  }
  function checkLevels(levels) {
    if(!Number.isInteger(levels)||levels<1||levels>5)throw new RangeError('Use 1 to 5 levels.');
  }
  function extrapolate(s,epsilon,levels=5,cutoff=48,basis) {
    checkLevels(levels);
    const samples=Array.from({length:levels},(_,j)=>gap(s,epsilon/2**j,cutoff,basis));
    let row=samples.map(x=>x.value);
    for(let k=1;k<levels;k++)row=row.slice(0,-1).map((x,j)=>scale(sub(scale(row[j+1],2**k),x),1/(2**k-1)));
    return {value:row[0],samples};
  }
  // The damping levels share n^(-s). Reuse its radial factor down each grid
  // column and its angular factor across each row of the same extrapolation.
  function prepareExtrapolatedRow(sigmas, epsilon, levels, cutoff=48) {
    checkLevels(levels);
    const finest = epsilon / 2**(levels-1);
    checkGapDomain([0,0], finest, cutoff);
    const {logs} = profile(finest, cutoff);
    const columns = Array.from(sigmas, sigma => {
      checkGapDomain([sigma,0], epsilon, cutoff);
      return {sigma, powers: logs.map(logN => Math.exp(-sigma * logN))};
    });
    const cosines = new Float64Array(logs.length), sines = new Float64Array(logs.length);
    return function row(t) {
      checkGapDomain([0,t], epsilon, cutoff);
      for (let i=0; i<logs.length; i++) {
        const phase = -t * logs[i];
        cosines[i] = Math.cos(phase);
        sines[i] = Math.sin(phase);
      }
      return columns.map(({sigma, powers}) =>
        extrapolate([sigma,t], epsilon, levels, cutoff, {powers, cosines, sines}).value);
    };
  }
  // Independent reference: Euler–Maclaurin summation, not used in gap(), search(), or findRoot().
  function zetaReference(s,N=48) {
    let z=[0,0]; const nPower=(n,a)=>exp(scale(a,Math.log(n)));
    for(let n=1;n<N;n++)z=add(z,nPower(n,scale(s,-1)));
    z=add(z,add(div(nPower(N,sub([1,0],s)),sub(s,[1,0])),scale(nPower(N,scale(s,-1)),.5)));
    const b=[1/12,-1/720,1/30240,-1/1209600,1/47900160,-691/1307674368000,
      7/523069747200,-3617/10670622842880000];
    let rising=[1,0];
    for(let k=1;k<=b.length;k++){
      if(k===1)rising=s;else rising=mul(mul(rising,add(s,[2*k-3,0])),add(s,[2*k-2,0]));
      z=add(z,scale(mul(rising,nPower(N,sub(scale(s,-1),[2*k-1,0]))),b[k-1]));
    }
    return z;
  }
  function findRoot(epsilon,{levels=1,seed=[.4,14],cutoff=48}={}) {
    const evaluate=s=>levels===1?gap(s,epsilon,cutoff).value:extrapolate(s,epsilon,levels,cutoff).value;
    let s=seed.slice(), converged=false;const history=[];
    for(let iteration=0;iteration<25;iteration++){
      const f=evaluate(s), residual=abs(f);history.push({sigma:s[0],t:s[1],residual});
      if(residual<2e-12){converged=true;break;}
      const h=1e-5, derivative=scale(sub(evaluate(add(s,[h,0])),evaluate(sub(s,[h,0]))),1/(2*h));
      if(abs(derivative)<1e-10)break;
      let step=div(f,derivative);if(abs(step)>.5)step=scale(step,.5/abs(step));
      let accepted=false;
      for(let j=0;j<14;j++){
        const candidate=sub(s,scale(step,2**(-j)));
        if(candidate[0]>-.95&&candidate[0]<.98&&candidate[1]>11&&candidate[1]<17&&abs(evaluate(candidate))<residual){s=candidate;accepted=true;break;}
      }
      if(!accepted)break;
    }
    const residual=abs(evaluate(s));return {sigma:s[0],t:s[1],residual,converged:converged||residual<2e-12,history};
  }
  function grid(epsilon,cols=33,rows=49) {
    const values=[];let best={residual:Infinity};
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const sigma=.1+.8*i/(cols-1),t=12+4*j/(rows-1),magnitude=abs(gap([sigma,t],epsilon).value);
      values.push(magnitude);if(magnitude<best.residual)best={sigma,t,residual:magnitude};
    }
    return {epsilon,cols,rows,sigmaMin:.1,sigmaMax:.9,tMin:12,tMax:16,values,best};
  }
  function search(epsilon,levels=1) {
    const coarse=grid(epsilon,9,25);
    return findRoot(epsilon,{levels,seed:[coarse.best.sigma,coarse.best.t]});
  }

  // Exact finite-series arithmetic for the separate Golay/Leech comparison.
  function convolve(a,b,degree=5){return Array.from({length:degree+1},(_,k)=>a.reduce((v,x,i)=>v+(i<=k?x*(b[k-i]||0n):0n),0n));}
  function thetaCoefficients(degree=5){
    const e4=Array(degree+1).fill(0n);e4[0]=1n;
    for(let n=1;n<=degree;n++)for(let d=1;d<=n;d++)if(n%d===0)e4[n]+=240n*BigInt(d)**3n;
    let product=Array(degree+1).fill(0n);product[0]=1n;
    for(let n=1;n<degree;n++)for(let j=0;j<24;j++){
      const factor=Array(degree+1).fill(0n);factor[0]=1n;factor[n]=-1n;product=convolve(product,factor,degree);
    }
    const delta=[0n,...product.slice(0,degree)], cube=convolve(convolve(e4,e4,degree),e4,degree);
    return {e4,delta,theta:cube.map((v,n)=>v-720n*delta[n])};
  }
  function golayBasis(){
    const residues=[...new Set(Array.from({length:22},(_,j)=>(j+1)**2%23))];
    const generators=Array.from({length:23},(_,shift)=>residues.reduce((m,r)=>m|(1<<((r+shift)%23)),1<<23)).concat([0xFFFFFF]);
    const basis=[];for(const g of generators){let v=g;for(const b of basis)v=Math.min(v,v^b);if(v){basis.push(v);basis.sort((a,b)=>b-a);}}
    return basis;
  }
  const basis=golayBasis(), code=new Set();
  for(let m=0;m<4096;m++){let w=0;basis.forEach((b,i)=>{if((m>>i)&1)w^=b;});code.add(w);}
  function weight(word){let n=0;for(let j=0;j<24;j++)n+=(word>>>j)&1;return n;}
  function guard(bits){
    if(typeof bits!=='string'||!/^[01]{24}$/.test(bits))return {valid:false,reason:'Enter exactly 24 binary digits.',weight:null,member:false};
    const word=parseInt(bits,2),w=weight(word),member=code.has(word),allowed=[0,8,12,16,24].includes(w);
    return {valid:member&&allowed,weight:w,member,allowedWeight:allowed,
      reason:member?'Golay member: this word passes the input guard.':allowed?'Allowed weight, but this word is not in the Golay code.':'This weight is not allowed in the Golay code.'};
  }
  function distribution(){const counts={};for(const w of code)counts[weight(w)]=(counts[weight(w)]||0)+1;return counts;}
  const api={gap,extrapolate,prepareExtrapolatedRow,zetaReference,findRoot,grid,search,gamma,thetaCoefficients,golayBasis,guard,distribution,complex:{add,sub,scale,mul,div,abs}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZeroGapMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
