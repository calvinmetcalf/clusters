//from d3
var centroid = function(coords){
function d3_number(x) {
  return x != null && !isNaN(x);
}
var mean = function(array, f) {
  var n = array.length,
      a,
      m = 0,
      i = -1,
      j = 0;
  if (arguments.length === 1) {
    while (++i < n) if (d3_number(a = array[i])) m += (a - m) / ++j;
  } else {
    while (++i < n) if (d3_number(a = f.call(array, array[i], i))) m += (a - m) / ++j;
  }
  return j ? m : undefined;
};

return [mean(coords,function(v){return v[0]}),mean(coords,function(v){return v[1]})]

}