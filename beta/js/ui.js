Colony.registerModule(function(game,win,doc,undefined){
  var o = {};
  o.name = 'UI';

  function div(elem,target){
    var e = elem.split('.');
    var el = doc.createElement(e.shift());
    for(var i in e){
      el.className += ' ' + e[i];
    }
    if(target){
      target.appendChild(el);
    }
    return el;
  }
  game.div = o.div = div;

/*//////////////////////////////////////////////////////////
PANELS
//////////////////////////////////////////////////////////*/

  //UI is panel based
  //only attach panels that have been used, to form the visual part of the back stack
  //just pile on top of one another
  var panelSpace = $('.panel-space')[0];

  var panels = [],
      panelsByName = [],
      backStack = [];
  o.panels = panels;
  o.panelsByName = panelsByName;
  function Panel(obj){
    this.opened = false;

    for(var i in obj){ this[i] = obj[i]; }
    if(!this.displayName) this.displayName = this.name[0].toUpperCase() + this.name.slice(1);

    this.element = {};
    this.element.container = div('div.panel.' + this.name);
    this.element.header = div('div.panel-header', this.element.container);
    this.element.headerBack = div('div.header-back',this.element.header);
    this.element.headerBackText = div('p',this.element.headerBack);
    this.element.headerTitle = div('h1.header-title',this.element.header);
    if(this.searchable){
      var e = div('div.search-box',this.element.header);
      this.searchText = '';
      this.element.searchBox = div('input.search',e);
      this.element.searchBox.type = 'text';
      var that = this;
      this.element.searchBox.addEventListener('input',function(){
        that.searchText = this.value || '';
      });
    }
    this.element.content = div('div.panel-content', this.element.container);

    this.element.headerBack.addEventListener('click',handleHeaderBack);
    this.element.headerTitle.textContent = this.displayName;
    this.element.content = this.draw(this.element.content);

    panelsByName[this.name] = this;
    panels.push(this);
  }
  Panel.prototype.open = function(){
    if(backStack.length){
      this.element.headerBackText.textContent = backStack[backStack.length-1].displayName;
      backStack[backStack.length-1].element.container.classList.add('old');
    }else{
      this.element.headerBack.classList.add('hide');
    }

    panelSpace.appendChild(this.element.container);
    backStack.push(this);

    var that = this;
    setTimeout(function(){ that.element.container.className += ' open';},0);

    this.opened = true;

    //this.element.container.classList.add('open');
  }
  Panel.prototype.close = function(){
    var that = this;
    that.element.container.classList.remove('open');
    that.opened = false;
    win.setTimeout(function(){
      panelSpace.removeChild(that.element.container);
    },300);
    try{
      backStack[backStack.length-1].element.container.classList.remove('old');
    }catch(e){}
  }
  Panel.prototype.update = function(dt){
    if(!this.opened) return;
    this.element.content = this.draw(this.element.content);
  }
  Panel.prototype.search = function(what){
    if(!this.searchable) return false;
    if(this.searchText == '') return true;
    console.log(what);
    return what.toLowerCase().startsWith(this.searchText.toLowerCase());
  }
  game.Panel = o.Panel = Panel;

  function handleHeaderBack(){
    backStack.pop().close();
  }

  function slider(what,op,update){
    if(!update){
      op.element.sliders[what] = {};
      var s = op.element.sliders[what].container = div('div.slider');
      var l = div('div.left',s);
      op.element.sliders[what].title = div('label',l);
      op.element.sliders[what].title.textContent = game.resByName[what].displayName;
      op.element.sliders[what].available = div('p' + '.res-' + what + '-amount',l)
      op.element.sliders[what].available.textContent = game.resByName[what].amount;
      var r = div('div.right',s);
      var i = op.element.sliders[what].bar = div('input.slider-bar',r);
      var v = div('span.slider-value',r);
      i.addEventListener('input',function(){
        if(i.value > game.resByName[what].amount) i.value = game.resByName[what].amount;
        v.textContent = i.value;
      });
      i.addEventListener('change',function(){
        op.commit(what,this.value);
      });
      i.type = 'range';
      i.min = 0;
      i.max = op.assignable[what];
      i.value = op.assigned[what];
      v.textContent = i.value;
      return s;
    }else{
      op.element.sliders[what].title.textContent = game.resByName[what].displayName;
      op.element.sliders[what].available.textContent = game.resByName[what].amount;
      op.element.sliders[what].bar.max = op.assignable[what];
    }
  }
  o.slider = slider;
  function products(what,op){
    var l = div('div.product');
    div('label',l).textContent = game.resByName[what].displayName;
    div('p',l).textContent = op.earn[what] * op.amount;
    div('p',l).textContent = op.earn[what] * op.amount * op.productivity || 0;
    return l;
  }
  o.products = products;
  function drawUpgrade(what){
    var l = div('li.upgrade');
    div('h4',l).textContent = what.displayName;
    div('h5',l).textContent = 'Cost';
    for(var i in what.cost){
      div('p.cost',l).textContent = what.cost[i] + ' ' + game.resByName[i].displayName;
    }
    div('p.desc',l).textContent = what.desc;
    div('div.buy-button',l).addEventListener('click',function(){ what.buy(1); });
  }

  function home(){
    new Panel({
      'name':'home',
      'draw':function(box){
        box.innerHTML = '';
        for(var i in panels){
          var p = panels[i];
          var e = div('h2.home-link',box);
          e.textContent = panels[i].displayName;
          e.dataset.name = p.name;
          e.addEventListener('click',function(){ panelsByName[this.dataset.name].open(); });
        }
      }
    });
    panelsByName['home'].open();
  }
  o.home = home;

  return o;
})
