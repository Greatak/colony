Colony.registerModule(function(game,win,doc,undefined){
  var o = {};
  o.name = 'Res';
  o.byId = function(what){
    return game.res[what];
  }
  o.byName = function(what){
    return game.resByName[what];
  }

  new game.Resource({
    'name':'cash',
    'show':1
  });

  new game.Resource({
    'name':'copperore',
    'displayName':'Chalcophilic Ore Reserve'
  });
  new game.Resource({
    'name':'ironore',
    'displayName':'Ferrous Ore Reserve'
  });
  new game.Resource({
    'name':'aluminumore',
    'displayName':'Bauxite Deposit'
  });
  new game.Resource({
    'name':'rockore',
    'displayName':'Lithophilic Deposit'
  });

  new game.Resource({
    'name':'genome'
  });

  new game.Resource({
    'name':'staff',
    'category':'emp',
    'parent':'population'
  });
  new game.Resource({
    'name':'human',
    'category':'emp',
    'parent':'staff',
    'multiplier':1.2
  });
  new game.Resource({
    'name':'ignisato',
    'category':'emp',
    'parent':'staff',
    'efficiency':1.2
  });
  new game.Resource({
    'name':'applicant',
    'category':'emp'
  });

  new game.Resource({
    'name':'contractor',
    'category':'emp',
    'parent':'population'
  });

  new game.Resource({
    'name':'helot',
    'category':'emp',
    'parent':'population'
  });

  new game.Resource({
    'name':'population',
    'category':'emp'
  });

  new game.Panel({
    'name':'inventory',
    'searchable':1,
    'draw':function(box){
      box.innerHTML = '';
      for(var i in game.resByName){
        if(game.resByName[i].category != 'inv') continue;
        box.appendChild(game.resByName[i].element.container);
      }
      return box;
    }
  });

  return o;
})
