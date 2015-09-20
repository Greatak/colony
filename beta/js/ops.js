Colony.registerModule(function(game,win,doc,undefined){
  var o = {};
  o.name = 'Ops';
  o.byId = function(what){
    return game.ops[what];
  }
  o.byName = function(what){
    return game.opsByName[what];
  }

  new game.Operation({
    'name':'prospecting',
    'show':1,
    'cost':50,
    'amount':1,
    'assign':{
      'staff':5
    },
    'earn':{
      'copperore':0.1,
      'aluminumore':1,
      'ironore':0.8,
      'rockore':1.2
    },
    'onCommit':staffCapacity,
    'desc':"Initial surveys included some spectroscopic data, but the investors always like to see the ore reserves confirmed by some people on the ground."
  });
  new game.Operation({
    'name':'biosurvey',
    'show':1,
    'cost':50,
    'amount':1,
    'assign':{
      'staff':5
    },
    'earn':{
      'genome':0.5,
    },
    'onCommit':staffCapacity,
    'desc':"Documenting the biodiversity of new planets is an essential task and many are willing to pay for your data, but your investors aren't interested."
  });

  function staffCapacity(){
    this.productivity = this.assigned['staff'] / this.assignable['staff'];
  }

  new game.Panel({
    'name':'operations',
    'draw':function(box){
      box.innerHTML = '';
      for(var i in game.opsByName){
        box.appendChild(game.opsByName[i].element.container);
      }
      return box;
    }
  });

  return o;
})
