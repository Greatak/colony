Colony.registerModule(function(game,win,doc,undefined){
  var o = {};
  o.name = 'HR';

  o.hireTarget = 'human';
  o.hireTime = 10;
  o.maxHireTime = 10;
  o.hireCost = 0;
  o.maxHireCost = 10;
  o.applicantRate = 0.1;
  o.element = {};

  function update(dt){
    game.resByName['applicant'].earn(o.applicantRate * dt);
    updateSlider();
    o.element.hireProgress.style.transitionDuration = o.hireTime + 's';
  }
  o.update = update;

  function draw(){
    o.element.applicants.textContent = prettify(Math.floor(game.resByName['applicant'].amount));
    o.element.applicantRate.textContent = '+ ' + prettify(o.applicantRate,2) + '/s';
    o.element.employeeCount.textContent = prettify(Math.floor(game.resByName['staff'].amount));
    for(var i in o.element.employees){
      o.element.employees[i].count.textContent = prettify(Math.floor(game.resByName[i].amount));
    }
  }
  o.draw = draw;

  function drawSlider(){
    o.element.slider = {};
    o.element.slider.container = private.div('div.slider');
    private.div('label', o.element.slider.container).textContent = 'Signing Bonus';
    var r = private.div('div.right', o.element.slider.container);
    var i = o.element.slider.bar = private.div('input.slider-bar', r);
    var v = private.div('span.slider-value', r);
    o.element.slider.bar.type = 'range';
    o.element.slider.bar.min = 0;

    i.addEventListener('input',function(){
      v.textContent = game.currency + i.value;
    });
    i.addEventListener('change',function(){
      o.hireCost = i.value;
      o.hireTime = o.maxHireTime - (((o.hireCost/o.maxHireCost) * o.maxHireTime) - 1);
    });
    o.element.slider.bar.value = 0;
    v.textContent = game.currency + 0;
  }
  function updateSlider(){
    o.element.slider.bar.max = o.maxHireCost;
  }

  function hire(){
    if(!game.resByName['cash'].check(o.hireCost)) return;
    if(!game.resByName['applicant'].check(1)) return;
    game.resByName['cash'].spend(o.hireCost);
    game.resByName['applicant'].spend(1);
    o.element.hireButton.classList.add('load');
    setTimeout(function(){
      o.element.hireButton.classList.remove('load');
      game.resByName[o.hireTarget].earn(1);
    },o.hireTime*1000);
  }
  function hireChange(){
    o.hireTarget = this.value;
  }

  new game.Panel({
    'name':'workforce',
    'draw':function(box){
      game.consolodateResources();
      var that = this;
      box.innerHTML = '';
      game.div('p.desc',box).textContent = 'Placeholder HR description';
      private.div('h3',box).textContent = 'Recruiting';
      var b = private.div('div.staff-count',box);
      private.div('label',b).textContent = 'Total Applicants';
      o.element.applicants = private.div('p',b);
      var b = private.div('div.staff-count',box);
      private.div('label',b).textContent = 'New Applications';
      o.element.applicantRate = private.div('p',b);
      drawSlider();
      box.appendChild(o.element.slider.container);
      var hs = private.div('div.hire-box',box);
      o.element.hireButton = private.div('button.hire-button',hs);
      o.element.hireButton.addEventListener('click',hire);
      o.element.hireProgress = private.div('span.hire-progress',o.element.hireButton);
      var ho = private.div('select.hire-select',hs);
      for(var i in game.resByName['staff'].children){
        var r = game.resByName['staff'].children[i];
        var e = private.div('option',ho);
        e.value = r.name;
        e.textContent = r.displayName;
      }
      ho.addEventListener('change',hireChange);
      private.div('h3',box).textContent = 'Employees';
      var b = private.div('div.staff-count',box);
      private.div('label',b).textContent = 'Total';
      o.element.employeeCount = private.div('p',b);
      o.element.employees = {};
      var e = private.div('div.alternate',box);
      for(var i in game.resByName['staff'].children){
        var r = game.resByName['staff'].children[i];
        var b = private.div('div.staff-count',e);
        private.div('label',b).textContent = r.displayName;
        o.element.employees[r.name] = {}
        o.element.employees[r.name].count = private.div('p',b);
      }

      //hide these for now
      //private.div('h3',c).textContent = 'Contractors';
      //private.div('h3',c).textContent = 'Other Population';
      //upgrades
      private.div('h3',box).textContent = 'Improvements';
      var tabs = private.div('div.tabs',box);
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

      return box;
    }
  });

  return o;
})
