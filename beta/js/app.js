var Colony = (function(win,doc,undefined){
  var version = 0.001,
      debug = true;

  var public = private = {};
  public.version = private.version = version;
  public.debug = private.debug = debug;

  var game = {};
  game.story = {};
  private.game = game;

  public.currency = private.currency = '₰';

  //econ loop
  var ticksPerSecond = 2;
      oldTime = Date.now(),
      time = 0,
      dt = 0;
  function econLoop(){
    setTimeout(econLoop, 1000 / ticksPerSecond);
    time = Date.now();
    dt = (time - oldTime) / 1000;
    oldTime = time;

    for(var i = res.length;i--;){
      res[i].update(dt);
    }
    for(var i = ops.length;i--;){
      ops[i].update(dt);
    }
    for(var i = techs.length;i--;){
      techs[i].update(dt);
    }
    private.HR.update(dt)
  }

  //draw loop
  function drawLoop(time){
    requestAnimationFrame(drawLoop);
    for(var i = res.length;i--;){
      res[i].draw();
    }
    for(var i = ops.length;i--;){
      ops[i].draw();
    }
    private.HR.draw();
  }

  //class definitions

/*/////////////////////////////////////////////////////////////

RESOURCES

/////////////////////////////////////////////////////////////*/
  var res = [],
      resByName = [];
  private.res = res;
  private.resByName = resByName;
  function Resource(obj){
    this.hidden = 0;
    this.show = 0;
    this.category = 'inv';
    this.amount = 0;
    this.totalAmount = 0;
    this.multiplier = 1;       //when earned, multiply by this
    this.efficiency = 1;       //when spent, multiply by this

    this.children = [];

    this.history = {};         //keep a record of earned and spent with 1 second accuracy
    this.history.time = 0;
    this.history.hours = 0;
    this.history.days = 0;
    this.history.spent = [];
    this.history.earned = [];

    for(var i in obj){ this[i] = obj[i]; }
    if(!this.displayName) this.displayName = this.name[0].toUpperCase() + this.name.slice(1);

    this.element = {};
    this.firstDraw();

    resByName[this.name] = this;
    res.push(this);
  }
  Resource.prototype.earn = function(amt){
    if(this.onEarn && this.onEarn(amt)) return;
    //acounting
    this.history.earned[0] += amt;
    this.totalAmount += amt;

    //todo: resource weights?
    amt = +amt || 0;
    if(this.children.length == 0){
      this.amount += amt * this.multiplier;
    }else{
      var total = amt;
      amt /= this.children.length;
      amt = Math.ceil(amt);
      for (var i in this.children){
        this.children[i].earn(amt);
        total -= amt;
        if(total < amt) amt -= total;
      }
    }
  }
  Resource.prototype.spend = function(amt){
    if(this.onSpend && this.onSpend(amt)) return;
    //acounting
    this.history.spent[0] += amt;

    //todo: resource weights
    //todo: floating point protection
    amt = +amt || 0;
    if(this.children.length == 0){
      this.amount -= amt * this.efficiency;
    }else{
      var total = amt,
          weights = [];
      for(var i in this.children){
        if(!this.children[i].check()){
          weights[i] = this.children[i].amount / this.amount;
        }
      }
      for (var i in this.children){
        var a = amt * weights[i];
        if(this.children[i].check(a)){
          this.children[i].spend(a);
          total -= a;
        }
      }
    }
  }
  Resource.prototype.check = function(amt){
    amt = +amt || 0;
    return amt < this.amount
  }
  Resource.prototype.update = function(dt){
    if(this.onTick) this.onTick(dt);

    if(this.children.length != 0){
      this.amount = 0;
      for(var i in this.children){
        this.amount += this.children[i].amount;
      }
    }
    if(this.amount < 0) this.amount = 0;

    if(!this.show && !this.hidden && this.amount) this.show = 1;

    //accounting
    this.history.time += dt;
    while(this.history.time > 5){
      //just do a bunch of hours
      this.history.time -= 5;
      this.history.spent.unshift(0);
      this.history.spent.splice(24,1);
      this.history.earned.unshift(0);
      this.history.earned.splice(24,1);
      //this.history.hours += 1;
      //todo: limit time resolution after 24 hours
      //0-23, hourly
      //24-30, days 2-7
      //31-33, weeks 2-4
    }
  }
  Resource.prototype.firstDraw = function(){
    this.element.container = private.div('div.res.card');
    var l = private.div('div.left',this.element.container);
    this.element.title = private.div('h2.res-title',l);
    this.element.title.textContent = this.displayName;
    this.element.amount = private.div('h3.res-amount',l);
    this.element.amount.textContent = Math.floor(this.amount);
    var r = private.div('div.right',this.element.container);
    private.div('h4',r).textContent = 'Last Price';
    this.element.lastPrice = private.div('p',r);
    this.element.lastPrice.textContent = this.value||'N/A';
    this.element.lastChange = private.div('p',r);
    this.element.lastChange.textContent = this.dp||'N/A';
  }
  Resource.prototype.draw = function(){
    if(this.show && private.UI.panelsByName['inventory'].search(this.displayName)){
      this.element.container.classList.add('show');
    }else{
      this.element.container.classList.remove('show');
    }
    this.element.title.textContent = this.displayName;
    this.element.amount.textContent = Math.floor(this.amount);
    this.element.lastPrice.textContent = this.value||'N/A';
    this.element.lastChange.textContent = this.dp||'N/A';
  }
  private.Resource = Resource;

  function consolodateResources(){
    for(var i in res){
      res[i].children = [];
    }
    for(var i in res){
      if(res[i].parent){
        resByName[res[i].parent].children.push(res[i]);
      }
    }
  }
  private.consolodateResources = consolodateResources;


/*/////////////////////////////////////////////////////////////

OPERATIONS

/////////////////////////////////////////////////////////////*/
  var ops = [],
      opsByName = [];
  var globalGrowthRate = 1.1;
  private.ops = ops;
  private.opsByName = opsByName;
  function Operation(obj){
    this.desc = '';
    this.amount = 0;
    this.totalAmount = 0;
    this.growthRate = globalGrowthRate || 1;      //how much more expensive is the next one?
    this.productivity = 1;                          //when producing, multiply by this
    this.efficiency = 1;                            //when consuming, multiply by this
    this.salvage = 1;                               //when selling, multiply resources by this
    this.require = {};
    this.cost = 0;
    this.assign = {};
    this.earn = {};
    this.consume = {};
    this.upgrades = {};

    this.history = {};         //keep a record of earned and spent with 1 second accuracy
    this.history.time = 0;
    this.history.produced = [];
    this.history.capacity = [];

    for(var i in obj){ this[i] = obj[i]; }
    if(!this.displayName) this.displayName = this.name[0].toUpperCase() + this.name.slice(1);
    this.currentCost = this.cost;
    this.assignable = {};
    this.assigned = {};
    for(var i in this.assign){
      this.assignable[i] = this.assign[i] * this.amount;
      this.assigned[i] = 0;
    }

    this.element = {};
    this.firstDraw();
    if(this.onCommit) this.onCommit();

    opsByName[this.name] = this;
    ops.push(this);
  }
  Operation.prototype.buy = function(amt,force){
    amt = +amt || 0;
    if(this.onBuy && this.onBuy(amt,force)) return;

    for(var i = amt;i--;){
      if(!force && !this.afford()) break;
      this.amount += 1;
      if(!force) resByName['cash'].spend(this.currentCost);
      this.currentCost = this.cost * Math.pow(this.growthRate, this.amount);
      if(this.assign){
        for(var i in this.assign){
          this.assignable[i] += this.assign[i];
        }
      }
      if(!force) this.totalAmount += 1;
    }
    if(this.onCommit) this.onCommit();
  }
  Operation.prototype.sell = function(amt,force){
    amt = +amt || 0;
    if(amt == -1) amt = this.amount;
    if(this.onSell && this.onSell(amt,force)) return;

    for(var i = amt;i--;){
      this.amount -= 1;
      this.currentCost = this.cost * Math.pow(this.growthRate, this.amount);
      if(!force) resByName['cash'].earn(this.currentCost * this.salvage);
      if(this.assign){
        for(var i in this.assign){
          this.assignable[i] -= this.assign[i];
          if(this.assigned[i] < this.assignable[i]) this.assigned[i] = this.assignable[i];
        }
      }
      if(!force) this.totalAmount -= 1;
    }
    if(this.onCommit) this.onCommit();
  }
  Operation.prototype.afford = function(req){
    return resByName['cash'].check(this.currentCost);
  }
  Operation.prototype.commit = function(what,amt){
    if(!what){
      for(var i in this.assign){
        if(this.onCommit) this.onCommit(i,this.assigned[i]);
      }
    }
    if(!amt) return this.assigned[what];

    if(amt > this.assignable[what]) amt = this.assignable[what];
    if(amt < 0) amt = 0;
    this.assigned[what] = amt;
    if(this.onCommit) this.onCommit(what,amt);
  }
  Operation.prototype.update = function(dt){
    //accounting
    this.history.time += dt;
    while(this.history.time > 5){
      this.history.time -= 5;
      this.history.produced.unshift(0);
      this.history.produced.splice(24,1);
      this.history.capacity.unshift(0);
      this.history.capacity.splice(24,1);
    }

    if(!this.amount) return;

    var r = (Math.random() / 2) + 0.75;
    for(var i in this.earn){
      resByName[i].earn(this.earn[i] * dt * r * this.productivity);
    }
    for(var i in this.consume){
      resByName[i].spend(this.consume[i] * dt * r * this.efficiency);
    }
  }
  Operation.prototype.firstDraw = function(){
    var that = this;
    that.element.container = private.div('div.ops.box');
    var i = private.div('input.ops.toggle',that.element.container);
    i.type = 'checkbox'
    i.id = 'toggle-' + that.name;
    that.element.card = private.div('div.ops.card',that.element.container);
    var h = private.div('div.ops-header',that.element.card);
    private.div('label.toggle',h).htmlFor = i.id;
    that.element.title = private.div('h2.ops-title',h);
    that.element.title.textContent = that.displayName;
    that.element.amount = private.div('p.ops-amount.ops-' + that.name + '-amount',h);
    that.element.amount.textContent = Math.floor(that.amount);
    var c = private.div('div.content',that.element.card);
    private.div('p.desc',c).textContent = that.desc;
    //Buy Capacity
    private.div('h3',c).textContent = 'Purchasing';
    var b = private.div('div.staff-count',c);
    private.div('label',b).textContent = 'Expansion Capital';
    this.element.cost = private.div('p',b);
    var buy = private.div('div.purchase',c);
    if(!that.noSale){
      that.element.sell = private.div('div.sell-button',buy);
      that.element.sell.addEventListener('click',function(){ that.sell(1); });
    }
    that.element.buy = private.div('div.buy-button',buy);
    that.element.buy.addEventListener('click',function(){ that.buy(1); });
    //Staff it
    private.div('h3',c).textContent = 'Scheduling';
    var assign = private.div('div.assignables',c);
    that.element.sliders = {};
    for(var i in that.assignable){
      private.UI.slider(i,that);
      assign.appendChild(that.element.sliders[i].container);
    }
    //What're we making?
    private.div('h3',c).textContent = 'Production';
    that.element.produce = private.div('div.produce',c);
    var l = private.div('div.product.head',that.element.produce);
    private.div('label',l).textContent = 'Name';
    private.div('p',l).textContent = 'Capacity';
    private.div('p',l).textContent = 'Producing';
    for(var i in that.earn){
      that.element.produce.appendChild(private.UI.products(i,that));
    }
    //Errybody loves upgrades
    private.div('h3',c).textContent = 'Improvements';
    var tabs = private.div('div.tabs',c);
    var a = private.div('label.tab',tabs);
    a.textContent = 'Available';
    a.addEventListener('click',function(){
      a.classList.add('active');
      that.element.upgradesAvailable.classList.add('active');
      b.classList.remove('active');
      that.element.upgradesPurchased.classList.remove('active');
    });
    var b = private.div('label.tab',tabs);
    b.textContent = 'Purchased';
    b.addEventListener('click',function(){
      b.classList.add('active');
      that.element.upgradesPurchased.classList.add('active');
      a.classList.remove('active');
      that.element.upgradesAvailable.classList.remove('active');
    });
    that.element.upgradesAvailable = private.div('ul.improvements',tabs);
    that.element.upgradesPurchased = private.div('ul.improvements',tabs);

    a.click();
  }
  Operation.prototype.draw = function(){
    var that = this;
    if(that.show){
      that.element.container.classList.add('show');
    }else{
      that.element.container.classList.remove('show');
    }
    that.element.title.textContent = that.displayName;
    that.element.amount.textContent = Math.floor(that.amount);
    that.element.cost.textContent = that.currentCost;
    if(resByName['cash'].check(that.currentCost)){
      that.element.buy.classList.remove('hide');
      that.element.cost.classList.remove('expensive');
    }else{
      that.element.buy.classList.add('hide');
      that.element.cost.classList.add('expensive');
    }
    if(that.element.sell && that.amount){
      that.element.sell.classList.remove('hide');
    }else{
      that.element.sell.classList.add('hide');
    }
    for(var i in that.assignable){
      private.UI.slider(i,that,true);
    }
    that.element.produce.innerHTML = '';
    var l = private.div('div.product.head',that.element.produce);
    private.div('label',l).textContent = 'Name';
    private.div('p',l).textContent = 'Capacity';
    private.div('p',l).textContent = 'Producing';
    for(var i in that.earn){
      that.element.produce.appendChild(private.UI.products(i,that));
    }
  }
  private.Operation = Operation;

/*/////////////////////////////////////////////////////////////

UPGRADES

/////////////////////////////////////////////////////////////*/
  var techs = [],
      techsByName = [];
  private.techs = techs;
  private.techsByName = techsByName;
  function Tech(obj){
    this.op = '';
  }
  Tech.prototype.buy = function(amt,force){
    amt = +amt || 0;
    if(this.onBuy && this.onBuy(amt,force)) return;

    for(var i = amt;i--;){
      if(!force && !this.afford()) break;
      this.amount += 1;
      for(var i in this.cost){
        if(!force) resByName[i].spend(this.currentCost[i]);
        this.currentCost[i] = this.cost[i] * Math.pow(this.growthRate, this.amount);
      }
      if(this.assign){
        for(var i in this.assign){
          this.assignable[i] += this.assign[i];
        }
      }
      if(!force) this.totalAmount += 1;
    }
  }
  Tech.prototype.sell = function(amt,force){
    amt = +amt || 0;
    if(amt == -1) amt = this.amount;
    if(this.onSell && this.onSell(amt,force)) return;

    for(var i = amt;i--;){
      this.amount -= 1;
      for(var i in this.cost){
        this.currentCost[i] = this.cost[i] * Math.pow(this.growthRate, this.amount);
        if(!force) resByName[i].earn(this.currentCost[i] * this.salvage);
      }
      if(this.assign){
        for(var i in this.assign){
          this.assignable[i] -= this.assign;
          if(this.assigned[i] < this.assignable[i]) this.assigned[i] = this.assignable[i];
        }
      }
      if(!force) this.totalAmount -= 1;
    }
  }
  Tech.prototype.afford = function(req){
    if(!req){
      for(var i in this.cost){
        if(!resByName[i].check(this.cost[i])) return false;
      }
      if(this.use){
        for(var i in this.use){
          if(!resByName[i].check(this.use[i])) return false;
        }
      }
    }
    for(var i in this.require){
      var what = resByName[i] || opsByName[i] || techByName[i] || staffByName[i];
      if(!what || what.amount < this.require[i]) return false;
    }
    return true;
  }
  Tech.prototype.update = function(dt){

  }
  private.Tech = Tech;
  //asset
  //staff
  //financial

  //save/load
  function save(friendly){
    var saveObj = {};
    saveObj.version = version;
    saveObj.story = story;
    saveObj.res = {};
    saveObj.ops = {};
    saveObj.techs = {};
    for(var i = res.length;i--;){
      saveObj.res[res[i].name] = {
        'amount' : res[i].amount,
        'totalAmount' : res[i].total,
        'multiplier' : res[i].multiplier,
        'efficiency' : res[i].efficiency,
        'history' : res[i].history
      };
    }
    for(var i = ops.length;i--;){
      saveObj.ops[ops[i].name] = {
        'amount' : ops[i].amount,
        'totalAmount' : ops[i].total,
        'productivity' : ops[i].productivity,
        'efficiency' : ops[i].efficiency,
        'assigned' : ops[i].assigned,
        'assignable' : ops[i].assignable,
        'history' : ops[i].history
      };
    }
    for(var i = techs.length;i--;){
      saveObj.techs[techs[i].name] = (techs[i].amount)?1:0;
    }
    localStorage.setItem((debug)?'colony-game-save-beta':'colony-game-save',JSON.stringify(saveObj));
  }
  function load(friendly){
    var s = JSON.parse(localStorage.getItem((debug)?'colony-game-save-beta':'colony-game-save'));
    if(!s) return false;
    //future version tests
    for(var i in s.res){
      for(var j in s.res[i]){ resByName[i][j] = s.res[i][j]; }
    }
    for(var i in s.ops){
      for(var j in s.ops[i]){ opsByName[i][j] = s.ops[i][j]; }
    }
    for(var i in s.techs){
      if(s.techs[i]) techsByName[i].buy(1,1);
    }
    return true;
  }
  function wipeSave(friendly){
    localStorage.removeItem((debug)?'colony-game-save-beta':'colony-game-save');
  }

  //init
  function init(){
    loadModules();
    load();
    setTimeout(econLoop, 1000 / ticksPerSecond);
    requestAnimationFrame(drawLoop);
    private.UI.home();
    resByName['cash'].earn(100);
  }

  //modules
  var modules = [];
  function registerModule(what){
    if(typeof what == 'function') modules.push(what);
  }
  public.registerModule = private.registerModule = registerModule;

  function loadModules(){
    for(var i in modules){
      var t = modules[i](private,win,doc);
      private[t.name] = t;
    }
  }

  window.addEventListener('load',init);

  return (debug)?private:public;
})(window,document);

function $(what){
  return document.querySelectorAll(what);
}
function choose(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

var ranges = [
  { divider: 1e36},
  { divider: 1e33 , suffix: 'Dc' },
  { divider: 1e30 , suffix: 'No' },
  { divider: 1e27 , suffix: 'Oc' },
  { divider: 1e24 , suffix: 'Sp' },
  { divider: 1e21 , suffix: 'Sx' },
  { divider: 1e18 , suffix: 'Qi' },
  { divider: 1e15 , suffix: 'Qu' },
  { divider: 1e12 , suffix: 'T' },
  { divider: 1e9 , suffix: 'B' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' }
];
//truncates numbers into 1.3k and such
//prettify(number to be prettified,how many decimal points to spit out)
function prettify(n,p){
  //gotta use undefined here because 0 is a number I might wanna use
  if(p == undefined) p = 2;
  //basically, we loop through the array from the top
  //checking if the number is bigger than the suffix
  //if it is, divide by that number and we start at the top so the biggest possible number is used
  //then it tacks on the suffix as needed
  if (n >= ranges[0].divider) {
    return n.toExponential(2);
  }
  for (var i = 1; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return (n / ranges[i].divider).toFixed(p) + ranges[i].suffix;
    }
  }
  //if it's smaller than all of them, it just gives back the number with the appropriate number of decimals
  return n.toFixed(p);
}
