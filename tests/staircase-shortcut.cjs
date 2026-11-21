'use strict';
const assert=require('node:assert/strict'),{shortcut}=require('../staircase-shortcut.js');
const cases=[
  [1,-.079326406,-.068984585,.196611933,1e-9],
  [.1,-.083291683,-.083166931,.249376040,1e-9],
  [.01,-.083332917,-.083331667,.249993750,1e-9],
  [.001,-.08333332916666683,-.08333331666666931,.24999994,1e-8]
];
let worst=0;
for(const [e,a,b,c,tol] of cases){const r=shortcut(e);
  for(const [x,y] of [[r.first.space,a],[r.second.space,b],[r.difference,c],[r.difference,r.closed],[r.difference,r.alternating],[r.closed,r.alternating]]){
    const error=Math.abs(x-y);assert(error<tol,`${e}: ${x} versus ${y}: ${error}`);worst=Math.max(worst,error);
  }
  assert.equal(r.first.area,4*r.second.area);
}
console.log(JSON.stringify({cases:cases.length,maximumError:worst,passed:true}));
