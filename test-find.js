let arrs = [{users:['a','b','c']}];
let index = arrs.findIndex(x=>(x.users.findIndex(y=>y==='a')>=0));
console.log(index)