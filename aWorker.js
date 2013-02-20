importScripts("utils.js","cluster.js");
var rTree,p;
function newR(points){
    points = points || [];
    p=points;
    rTree = new RTree();
     p.forEach(function(v,i){
         rTree.insert(
             {x:v[0],y:v[1],w:0,h:0},v
         );
         });
}
function addToR(pts){
        p = p.concat(pts);
       pts.forEach(function(v,i){
         rTree.insert(
             {x:v[0],y:v[1],w:0,h:0},v
         );
         });
    };
    function getBbox(blat1,blng1,blat2,blng2){
        if(!blat1){
            return p;
        }
        return rTree.search({x:blat1,y:blng1,w:(blat2-blat1),h:(blng2-blng1)});
    };
    function makeClusters(blat1,blng1,blat2,blng2,size){
        var points = rTree.search({x:blat1,y:blng1,w:(blat2-blat1),h:(blng2-blng1)});
     var pLen = Math.floor(Math.sqrt(points.length/2));
      var tempclusters=[];
     //self.postMessage({console:[]});
     var out = {points:[],clusters:[]}
  if(pLen>6){
     var clusters = clusterfck.kmeans(points,pLen);
        clusters.forEach(function(pts){
            if(pts.length===0){
                return;
            }else if(pts.length < 4){
               pts.forEach(function(v){out.points.push(v);});
            }else{
                 tempclusters.push([pts,hull(pts),centroid(pts)]);
            }
           
        });
  }else{
      points.forEach(
          function(v){out.points.push(v);}
      );
  }
  if(tempclusters.length<2){
    out.clusters=tempclusters.map(function(v){
      return [v[0].length,v[1],v[2]];
    })
  }else{
    out.clusters=distanceCluster(tempclusters,size);
  }
  self.postMessage(out);
    }
function distanceCluster(clusters,size){
    var current = clusters.pop(),
    matched=[],
    notMatched=[],
    allpoints,
    out=[];
    while(current){
        clusters.forEach(function(v){
            var dif=[
            current[2][0]>v[2][0]?current[2][0]-v[2][0]:v[2][0]-current[2][0],
            current[2][1]>v[2][1]?current[2][0]-v[2][1]:v[2][1]-current[2][1]
            ];
            if(dif[0]<size[0]&&dif[1]<size[1]){
                matched.push(v);
           }else{
                notMatched.push(v);
            }
        });
        if(matched.length===0){
            out.push([current[0].length,current[1],current[2]]);
            current = clusters.pop();
            matched=[];
            notMatched=[];
        }else{
            matched.push(current);
            allpoints = matched.reduce(function(a,b){
                return a.concat(b.map(function(v){return v[0];}));
            },[]);
            current = [allpoints,hull(allpoints),centroid(allpoints)];
            matched = [];
            clusters=notMatched;
            notMatched=[];
        }
    }
    return out;
}  
self.onmessage=function(event){
    switch(event.data.action){
        case "create":
            newR(event.data.points);
            break;
        case "add":
             addToR(event.data.points);
             break;
        case "bbox":
            self.postMessage(getBbox.apply(self,event.data.bounds));
            break;
        case "cluster":
           makeClusters.apply(self,event.data.bounds);
            break;
        case "tree":
            self.postMessage(JSON.stringify(rTree.get_tree()));
    }
}
