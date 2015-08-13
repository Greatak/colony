var Colony = function(win,doc,undefined){
    var o = {};
    
/*/////////////////////////////////////////////////////////
INITIALIZATION
/////////////////////////////////////////////////////////*/
    o.version = 0.04;
    //Let's grab all the DOM elements
    o.elements = {};
    o.elements.resources = doc.querySelector('.resources');
    o.elements.resourceListPrimary = doc.querySelector('.resource-list.primary');
    o.elements.resourceListSecondary = doc.querySelector('.resource-list.secondary');
    o.elements.log = doc.querySelector('.log');
    o.elements.logList = doc.querySelector('.log-list');
    o.elements.build = doc.querySelector('.build');
    o.elements.buildList = doc.querySelector('.build-list');
    o.elements.tech = doc.querySelector('.tech');
    o.elements.techList = doc.querySelector('.tech-list');
    o.elements.techListBought = doc.querySelector('.tech-list-bought');
    o.elements.modal = doc.querySelector('.modal');
    o.elements.modalTitle = doc.querySelector('.modal h1');
    o.elements.modalContent = doc.querySelector('.modal-content p');
    o.elements.modalInput = doc.querySelector('.modal-content .text-box');
    o.elements.modalButtons = doc.querySelectorAll('.modal .button');
    o.elements.date = doc.querySelector('.date');
    o.elements.tooltip = doc.querySelector('.tooltip');
    o.elements.saved = doc.querySelector('.saved');
    
    for(var i = o.elements.modalButtons.length;i--;){o.elements.modalButtons[i].addEventListener('click',clickModal);}
    
    o.story = {};
    o.story.res = {};
    
    var paused = false;
    
    //Initialization stuff, this gets called after data.js loads
    function init(){
        o.loadStory();
        if(!o.story.mineralOrder){
            o.story.mineralOrder = choose([
                ['iron','aluminum','zinc','copper'],
                ['iron','aluminum','copper','zinc'],
                ['aluminum','iron','zinc','copper'],
                ['aluminum','iron','copper','zinc']
            ]);
        }
        
        loadData();
        if(!o.load()){
            var letters = [['D','S','K'],['SP','EG','VQ'],['a','b','c','d','e']];
            o.story.originalPlanetName = choose(letters[0])+choose(letters[1])+'-'+(Math.ceil(Math.random()*700))+choose(letters[2]);
            o.log('Arriving in system with a skeleton crew of 5 eager explorers');
            o.modal('Welcome!',
            "Congratulations! It's been quite the journey to get to this point, but here it is: " + o.story.planetName + ". All initial surveys indicated the planet should be devoid of intelligent life but plenty of biological activity to study and maintain a breathable atmosphere. As leader of this expedition, your staff expect you to see to their safety and keep them supplied, but they understand this won't be easy. Whether this will be a successful, long-term expedition remains to be seen, but there should be plenty of resources for the Colonial Development Consortium to see some return on their investment. Speaking of investments, it might be better for recruiting if we gave this colony a snappier name.",
            [{'text':"Let's go!",'effect':function(){
                o.story.planetName = o.Modal.input.value;
            }}],
            o.story.originalPlanetName)
        }
        o.resConsolodate();
        //check for saves and load them
        requestAnimationFrame(tick);
        setTimeout(o.save,60000);
    }
    
    
/*/////////////////////////////////////////////////////////
MAIN LOOP
/////////////////////////////////////////////////////////*/
    var totalTime = 0,  //this is milliseconds
        days = 0,
        oldTime = 0,
        dt = 0,         //this is seconds
        decaying = {};
    function tick(time){
        //todo: random events
        requestAnimationFrame(tick);
        dt = (time - oldTime);
        oldTime = time;
        if(paused)return;
        totalTime += dt;
        days = Math.floor(totalTime / 20000);
        dt /= 1000;
        
        o.elements.date.textContent = "Day " + days;
        
        decaying = {};
        for(var i = o.res.length;i--;){
            if(o.res[i].onTick)o.res[i].onTick(dt);
            o.res[i].update();
            //any resources with more used than they have, flag them
            if(o.res[i].used > o.res[i].amount){
                decaying[o.res[i].name] = {
                    'decay': o.res[i].used - o.res[i].amount,
                    'units': []
                }
            }
        }
        for(var i = o.builds.length;i--;){
            if(o.builds[i].onTick)o.builds[i].onTick(dt);
            o.builds[i].update(dt);
            //for flagged resources, add any buildings using them
            if(o.builds[i].amount > 0){
                for(var j in o.builds[i].use){
                    if(decaying[j]) decaying[j].units.push(o.builds[i]);
                }
            }
        }
        for(var i = o.techs.length;i--;){
            if(o.techs[i].onTick)o.techs[i].onTick(dt);
            o.techs[i].update();
        }
        
        for(var i in decaying){
            var total = o.resByName[i].used,
                amount = decaying[i].decay;
                
            for(var j in decaying[i].units){
                var s = Math.min(decaying[i].units[j].amount,Math.min(decaying[i].decay,Math.ceil(decaying[i].decay*((decaying[i].units[j].amount*decaying[i].units[j].use[i])/total))));
                decaying[i].units[j].die(s);
                amount -= s;
                if(amount <= 0) break;
            }
        }
    }

/*/////////////////////////////////////////////////////////
LOG AND NOTIFICATIONS
/////////////////////////////////////////////////////////*/    
    //post stuff to the history listing, message can be html
    o.log = function(message, tags){
        var e = doc.createElement('li');
        e.innerHTML = message;
        if(!tags) e.className = 'normal';
        o.elements.logList.appendChild(e);
        o.elements.logList.scrollTop = o.elements.logList.scrollHeight;
        if(tags){classDelay(e,tags,10);}
    }
    o.Modal = {
        'title': o.elements.modalTitle.textContent,
        'content': o.elements.modalContent.innerHTML,
        'container':o.elements.modal,
        'buttons': o.elements.modalButtons,
        'buttonEffects': [],
        'input': o.elements.modalInput,
        'open':function(){ paused = true; o.Modal.container.classList.add('open'); },
        'close':function(){ paused = false; o.Modal.container.classList.remove('open'); }
    }
    o.modal = function(title,content,buttons,textBox){
        o.elements.modalTitle.textContent = title;
        o.elements.modalContent.innerHTML = content;
        for(var i = 0; i < o.Modal.buttons.length; i++){
            if(!buttons[i]){
                o.Modal.buttons[i].style.display = 'none';
                o.Modal.buttonEffects[i] = function(){};
            }else{
                o.Modal.buttons[i].style.display = 'inline-block';
                o.Modal.buttons[i].value = buttons[i].text;
                o.Modal.buttonEffects[i] = buttons[i].effect;
            }
        }
        o.Modal.input.style.display = (textBox)?'block':'none';
        if(typeof textBox == 'string') o.Modal.input.value = textBox;
        o.Modal.open();
    }
    //o.note(message, class, postToLog)
    //o.noteHide()
    o.tooltip = function(e,content){
        o.elements.tooltip.classList.add('open');
        o.elements.tooltip.style.transform = 'translate('+e.clientX+'px,'+e.clientY+'px)';
        o.elements.tooltip.innerHTML = content.info();
    }
    o.tooltipHide = function(){
        o.elements.tooltip.classList.remove('open');
    }
    //o.tooltipAttach(element)
    
/*/////////////////////////////////////////////////////////
RESOURCES
/////////////////////////////////////////////////////////*/
    o.res = [];
    o.resByName = [];
    o.resByType = {};
    o.Resource = function(obj){
        this.used = 0;          //some stuff is used without being consumed
        this.parent = 0;        //if this is part of a composite, who does it contribute to?
        this.children = [];     //if this is a composite measure, what makes it?
        this.types = [];        //categories
        this.cat = 'secondary';
        this.icon = [0,0];         //coords for spritesheet
        this.desc = '';         //description for tooltip
        this.unlocked = 0;      //can you earn it?
        this.show = 0;        //does it show up?
        this.multiplier = 1;    //when earned, should we change the amount?
        this.efficiency = 1;    //when spent, should we change the amount?
        this.editable = 0;
        
        for (var i in obj) this[i]=obj[i];
        
        this.id = o.res.length;
        if(!o.story.res[this.name]) o.story.res[this.name] = {};
        if(!this.displayName) this.displayName = capitalize(this.name);
        
        if(this.prefix){
            if(!o.story.res[this.name].prefix)o.story.res[this.name].prefix = choose(this.prefix);
            this.displayName = capitalize(o.story.res[this.name].prefix) + ' ' + this.displayName;
        }
        
        this.amount = this.startAmount || 0;
        this.displayAmount = Math.floor(this.amount)
        
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'resource';
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*-80) + 'px ' + (this.icon[1]*128) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.name = doc.createElement('h3');
        this.element.name.textContent = this.displayName;
        this.element.container.appendChild(this.element.name);
        this.element.amount = doc.createElement('p');
        this.element.amount.textContent = (this.usable)? Math.floor(this.used) + '/' + this.displayAmount : this.disaplayAmount;
        this.element.container.appendChild(this.element.amount);
        if(!this.show){this.element.container.classList.add('hide');}
        this.element.edit = doc.createElement('div');
        this.element.edit.className = 'edit-button icon';
        this.element.edit.addEventListener('click',clickEdit);
        this.element.edit.dataset.id = this.name;
        this.element.container.appendChild(this.element.edit);
        switch(this.cat){
            case 'primary':
                o.elements.resourceListPrimary.appendChild(this.element.container);
                break;
            case 'secondary':
                o.elements.resourceListSecondary.appendChild(this.element.container);
                break;
        }
        var clicky = {'handleEvent': function(e){ o.tooltip(e,this.that); }, 'that':this }
        this.element.container.addEventListener('mouseover',clicky);
        this.element.container.addEventListener('mouseleave',o.tooltipHide);
        
        o.resByName[this.name] = this;
        for(var i in this.types){
            if(!o.resByType[this.types[i]]) o.resByType[this.types[i]] = [];
            o.resByType[this.types[i]].push(this);
        }
        o.res.push(this);
    }
    o.Resource.prototype.earn = function(amt){
        if(amt){
            if(this.children.length == 0){
                this.amount += amt * this.multiplier;
            }else{
                var total = amt;
                amt /= this.children.length;
                amt = Math.ceil(amt);
                for (var i in this.children){
                    this.children[i].amount += amt * this.children[i].multiplier;
                    total -= amt;
                    if(total < amt) amt -= total;
                }
            }
            this.needsUpdate = true;
        }
    }
    o.Resource.prototype.spend = function(amt){
        var childrenLength = 0,
            total = amt;
        if(amt){
            if(this.children.length == 0){
                this.amount -= amt * this.efficiency;
            }else{
                for(var i in this.children){
                    if(this.children[i].amount > 0) childrenLength++;
                }
                amt /= childrenLength;
                for (var i in this.children){
                    if(this.children[i].amount > 0){
                        this.children[i].amount -= amt * this.children[i].efficiency;
                        total -= amt;
                    }
                    if(total < amt) amt -= total;
                }
            }
            if(this.amount < 0) this.amount = 0;
            
            
            if(this.onSpend)this.onSpend(amt)
            this.needsUpdate = true;
        }
    }
    o.Resource.prototype.update = function(){
        //todo: icon fanciness
        if(this.children.length > 0){
            this.amount = 0;
            for(var i in this.children){
                this.amount += this.children[i].amount;
            }
        }
        this.element.name.textContent = this.displayName;
        this.element.amount.textContent = (this.usable)? Math.floor(this.used) + '/' + this.displayAmount : this.displayAmount;
        this.element.edit.style.display = (this.editable)?'block':'none';
        
        if(this.amount < 0) this.amount = 0;
        this.displayAmount = Math.floor(this.amount);
        if(!this.meta && this.displayAmount) this.show = 1;
        if(this.show){
            this.element.container.classList.remove('hide');
        }else{
            this.element.container.classList.add('hide');
        }
        this.needsUpdate = false;
    }
    o.Resource.prototype.info = function(){
        var s = '<h3>';
        s += this.name.charAt(0).toUpperCase() + this.name.slice(1);
        s += '</h3><p>';
        s += this.desc;
        s += '</p>';
        if(this.children.length > 0){
            s += '<ul>';
            for(var i in this.children){
                s += '<li>' + this.children[i].displayName + '</li>'
            }
            s += '</ul>';
        }
        return s;
    }
    o.Resource.prototype.rename = function(name){
        if(!name)return;
        o.story.res[this.name].prefix = name;
        this.displayName = capitalize(o.story.res[this.name].prefix) + ' ' + capitalize(this.name);
    }
    o.Resource.prototype.edit = function(){
        var that = this;
        Colony.modal(
            'Rename ' + this.displayName,
            "",
            [
                {'text':'Accept','effect':function(){ that.rename(o.Modal.input.value); }},
                {'text':'Cancel','effect':function(){ }}
            ],
            o.story.res[this.name].prefix
        )
    }
    //returns a resource or a list of resources of a type, always an array
    o.resGet = function(r){
        var out = [];
        if(o.resByType[r]){
            out = o.resByType[r];
        }else{
            out.push(o.resByName[r]);
        }
        return out;
    }
    //can grab multiple types, returns deduped list, always array
    o.resGetTypes = function(types){
        var o = [],
            all = [];
        for(var i in types){
            all.concat(o.resByType[types[i]]);
        }
        for(var i in all){
            if(o.indexOf(all[i]) == -1) o.push(all[i]);
        }
        return o;
    }
    //generates the children list for composite resources
    o.resConsolodate = function(){
        for(var i in o.res){
            o.res[i].children = [];
        }
        for(var i in o.res){
            if(o.res[i].parent){
                o.resByName[o.res[i].parent].children.push(o.res[i]);
                o.resByName[o.res[i].parent].needsUpdate = true;
            }
        }
    }
    
/*/////////////////////////////////////////////////////////
BUILDINGS AND UNITS
/////////////////////////////////////////////////////////*/
    o.builds = [];
    o.buildsByName = [];
    o.Building = function(obj){
        this.cost = {};
        this.use = {};
        this.req = {};
        this.provide = {};
        this.enroll = {};
        this.icon = [0,0];
        this.desc = '';
        this.unlocked = 0;
        this.show = 0;
        this.efficiency = 1;
        this.multiplier = 1;
        this.staffed = 0;
        
        for (var i in obj) this[i] = obj[i];
		this.id = o.builds.length;
		if (!this.displayName) this.displayName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
        
        this.amount = obj.startAmount || 0;
        
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'building';
        this.element.name = doc.createElement('h3');
        this.element.name.textContent = this.displayName;
        this.element.container.appendChild(this.element.name);
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*128) + 'px ' + (this.icon[1]*128) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.desc = doc.createElement('p');
        this.element.desc.textContent = this.desc;
        this.element.container.appendChild(this.element.desc);
        this.element.amount = doc.createElement('p');
        this.element.amount.textContent = Math.floor(this.amount);
        this.element.icon.appendChild(this.element.amount);
        this.element.buy = doc.createElement('div');
        this.element.buy.className = 'buy-button';
        this.element.buy.dataset.id = this.name;
        this.element.buy.addEventListener('click',clickBuy);
        this.element.icon.appendChild(this.element.buy);
        this.element.sell = doc.createElement('div');
        this.element.sell.className = 'sell-button';
        this.element.sell.dataset.id = this.name;
        this.element.sell.addEventListener('click',clickSell);
        this.element.icon.appendChild(this.element.sell);
        this.element.cost = doc.createElement('ul');
        this.element.cost.className = 'cost-list';
        var html = '';
        for(var i in this.cost){
            html += '<li>' + this.cost[i] + ' ' + o.resByName[i].name + '</li>';
        }
        this.element.cost.innerHTML = html;
        this.element.container.appendChild(this.element.cost);
        this.element.use = doc.createElement('ul');
        this.element.use.className = 'use-list';
        var html = '';
        for(var i in this.use){
            html += '<li>' + this.use[i] + ' ' + o.resByName[i].name + '</li>';
        }
        this.element.use.innerHTML = html;
        this.element.container.appendChild(this.element.use);
        if(!this.show){this.element.container.classList.add('hide');}
        o.elements.buildList.appendChild(this.element.container);
        this.needsUpdate = false;
        
        o.buildsByName[this.name] = this;
        o.builds.push(this);
    }
    o.Building.prototype.afford = function(amt){
        amt = amt || 1;
        for(var i in this.cost) if(o.resByName[i].amount < (this.cost[i]*amt)) return 0;
        for(var i in this.use) if((o.resByName[i].amount - o.resByName[i].used) < (this.use[i]*amt)) return 0;
        for(var i in this.req){
            var t = o.resByName[i] || o.buildsByName[i] || o.techsByName[i];
            if(!t && o.resByType[i]){
                var total = 0,
                    all = o.resByType[i];
                    for(var j in all) total += all[j].amount;
                    if(total < this.req[i]*amt) return 0;            
            }else if(!t || (t.usable && ((t.amount - t.used) < (this.req[i] * amt))) || t.amount < (this.req[i] * amt)) return 0;
        }
        return 1;
    }
    o.Building.prototype.buy = function(amt){
        amt = amt || 1;
        if(!this.afford(amt)) return;
        for(var i in this.cost) o.resByName[i].spend(this.cost[i]*amt);
        for(var i in this.use) o.resByName[i].used += (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].earn(this.provide[i]*amt);
        this.amount += amt;
        this.needsUpdate = true;
        this.element.amount.classList.add('bounce');
        classDelay(this.element.amount, 'bounce', 30);
        if(!this.staffed){
            for(var i in this.cost){
                this.cost[i] = Math.floor(this.cost[i] * Math.pow(1.1,amt));
            }
        }
        if(this.onBuy) this.onBuy(amt);
    }
    o.Building.prototype.forceBuy = function(amt){
        if(!amt) return;
        for(var i in this.use) o.resByName[i].used += (this.use[i]*amt);
        this.amount += amt;
        if(!this.staffed){
            for(var i in this.cost){
                this.cost[i] = Math.floor(this.cost[i] * Math.pow(1.1,amt));
            }
        }
    }
    o.Building.prototype.sell = function(amt){
        amt = amt || 1;
        if(!this.amount) return;
        for(var i in this.cost) o.resByName[i].earn(this.cost[i]*amt);
        for(var i in this.use) o.resByName[i].used -= (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].spend(this.provide[i]*amt);
        this.amount -= amt;
        this.needsUpdate = true;
        this.element.amount.classList.add('fallover');
        classDelay(this.element.amount, 'fallover', 100);
        if(this.onSell) this.onSell(amt);
    }
    o.Building.prototype.die = function(amt){
        //like selling, but no return on resources
        amt = amt || 1;
        if(!this.amount) return;
        
        for(var i in this.use) o.resByName[i].used -= (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].spend(this.cost[i]*amt);
        this.amount -= amt;
        if(this.onDie) this.onDie(amt);
    }
    o.Building.prototype.update = function(dt){
        //todo: icon fanciness
        //todo: convert to deltaTime system instead of random, decay already done
        this.element.amount.textContent = Math.floor(this.amount);
        if(this.afford(1) && this.unlocked){ this.element.buy.classList.remove('unaffordable'); }
        else{ this.element.buy.classList.add('unaffordable'); }
        if(this.amount){ this.element.sell.classList.remove('unaffordable'); }
        else{ this.element.sell.classList.add('unaffordable'); }
        if(this.unlocked) this.show = 1;
        if(this.show){
            this.element.container.classList.remove('hide');
        }else{
            this.element.container.classList.add('hide');
        }
        var html = '';
        for(var i in this.cost){
            html += '<li';
            if(this.cost[i] > o.resByName[i].amount) html += ' class=insufficient ';
            html += '>' + this.cost[i] + ' ' + o.resByName[i].name + '</li>';
        }
        this.element.cost.innerHTML = html;
        
        //loop through the different activity types it might have
        //start with gathering
        if(this.amount && this.gather){
            for(var i in this.gather){
                var res = i,
                    chance = this.gather[i] * this.amount * this.multiplier * dt,     //the gather number should be x per second
                    pool = o.resGet(res);
                    
                    if(pool.length > 0){
                        for(var j in pool){
                            var amount = (Math.random()+(pool[j].multiplier*(chance)));
                            if (pool[j].cap){
                                var cap = o.resByName[pool[j].cap].amount * (pool[j].capMult || 1);
                                if (pool[j].amount >= cap) amount = 0;
                            }
                            amount = Math.floor(amount);
                            if(amount > 0) pool[j].earn(amount);
                        }
                    }
            }
        }
        if(this.amount && this.convert){    
            for(var i in this.convert){
                if( Math.random()+((1/(this.convert[i].every || 1)) * dt) < 1) continue;
                var count = this.amount;
                //do we have enough for a full run?
                for(var j in this.convert[i].from){
                    var amt = this.convert[i].from[j] * count;
                    while(amt > o.resByName[j].amount){
                        amt -= this.convert[i].from[j];
                        count -= 1;
                    }
                }
                if(count < 0) count = 0;
                //now remove all the inputs
                for(var j in this.convert[i].from){ o.resByName[j].spend(this.convert[i].from[j] * count); }
                //and if there's not a fail chance, add the outputs
                if(Math.random()+(this.convert[i].chance || 1) > 1){
                    for(var j in this.convert[i].to){ o.resByName[j].earn(this.convert[i].to[j] * count); }
                }
            }
        }
        if(this.amount && this.upkeep){
            var count = this.amount;
            for(var i in this.upkeep){
                var amt = this.upkeep[i] * count * o.resByName[i].efficiency;
                while(amt > o.resByName[i].amount){
                    amt -= this.upkeep[i];
                    count -= 1;
                }
            }
            if(count < 0) count = 0;
            for(var i in this.upkeep){ o.resByName[i].spend(this.upkeep[i] * count * dt); }
            if(count != this.amount){
                if(this.recycled){
                    this.sell(this.amount - count)
                }else{
                    this.die(this.amount - count);
                }
            }
        }
        if(this.amount && this.enroll){
            for (var i in this.enroll){
                if (o.buildsByName[i].amount < this.amount * this.enroll[i]) o.buildsByName[i].buy(1);
            }
        }
    }
    //o.building.info
    
/*/////////////////////////////////////////////////////////
TECHNOLOGY
/////////////////////////////////////////////////////////*/
    o.techs = [];
    o.techsByName = [];
    o.Tech = function(obj){
        this.type = 'tech';
        this.cost = {};
        this.use = {};
        this.req = {};
        this.provide = {};
        this.enroll = {};
        this.effects = [];
        this.reverseEffects = [];
        this.icon = [0,0];
        this.desc = '';
        this.unlocked = 0;
        this.show = 1;
        
        for (var i in obj) this[i] = obj[i];
		this.id = o.techs.length;
		if (!this.displayName) this.displayName = this.name.charAt(0).toUpperCase() + this.name.slice(1);
        
        this.amount = obj.startAmount || 0;
        
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'technology';
        this.element.name = doc.createElement('h3');
        this.element.name.textContent = this.displayName;
        this.element.container.appendChild(this.element.name);
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.background = 'url("sprite.png")';
        this.element.icon.style.backgroundPosition = (this.icon[0]*32) + 'px ' + (this.icon[1]*32) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.desc = doc.createElement('p');
        this.element.desc.textContent = this.desc;
        this.element.container.appendChild(this.element.desc);
        this.element.buy = doc.createElement('div');
        this.element.buy.className = 'buy-button';
        this.element.buy.textContent = 'Buy';
        this.element.buy.dataset.id = this.name;
        this.element.buy.addEventListener('click', clickBuy);
        this.element.icon.appendChild(this.element.buy);
        this.element.cost = doc.createElement('ul');
        this.element.cost.className = 'cost-list';
        var html = '';
        for(var i in this.cost){
            html += '<li>' + this.cost[i] + ' ' + o.resByName[i].name + '</li>';
        }
        this.element.cost.innerHTML = html;
        this.element.container.appendChild(this.element.cost);
        if(!this.show){this.element.container.classList.add('hide');}
        switch(this.type){
            case 'tech':
                o.elements.techList.appendChild(this.element.container);
                break;
        }
        this.needsUpdate = false;
        
        o.techsByName[this.name] = this;
        o.techs.push(this);
    }
    o.Tech.prototype.afford = function(amt){
        amt = amt || 1;
        for(var i in this.cost) if(o.resByName[i].amount < (this.cost[i]*amt)) return 0;
        for(var i in this.use) if((o.resByName[i].amount - o.resByName[i].used) < (this.use[i]*amt)) return 0;
        for(var i in this.req){
            var t = o.resByName[i] || o.buildsByName[i] || o.techsByName[i];
            if(!t && o.resByType[i]){
                var total = 0,
                    all = o.resByType[i];
                    for(var j in all) total += all[j].amount;
                    if(total < this.req[i]*amt) return 0;            
            }else if(!t || (t.usable && ((t.amount - t.used) < (this.req[i] * amt))) || t.amount < (this.req[i] * amt)) return 0;
        }
        return 1;
    }
    o.Tech.prototype.buy = function(amt){
        amt = amt || 1;
        if(!this.afford(amt)) return;
        for(var i in this.cost) o.resByName[i].spend(this.cost[i]*amt);
        for(var i in this.use) o.resByName[i].used += (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].earn(this.provide[i]*amt);
        for(var i in this.unlock){
            var t = o.resByName[this.unlock[i]] || o.buildsByName[this.unlock[i]] || o.techsByName[this.unlock[i]];
            if(t && t.unlocked == 0) t.unlocked = 1;
        }
        for(var i in this.obsolete){
            if(o.buildsByName[this.obsolete[i]]){
                o.buildsByName[this.obsolete[i]].sell(o.buildsByName[this.obsolete[i]].amount);
                o.buildsByName[this.obsolete[i]].unlocked = -1;
            }else if(o.techsByName[this.obsolete[i]]){
                o.techsByName[this.obsolete[i]].die();
            }
        }
        for(var i in this.effects){
            this.effects[i]();
        }
        this.amount += amt;
        o.elements.techListBought.appendChild(this.element.container);
        this.element.buy.style.display = 'none';
        //todo: disable buying?
    }
    o.Tech.prototype.forceBuy = function(amt){
        amt = amt || 1;
        for(var i in this.use) o.resByName[i].used += (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].earn(this.provide[i]*amt);
        for(var i in this.unlock){
            var t = o.resByName[this.unlock[i]] || o.buildsByName[this.unlock[i]] || o.techsByName[this.unlock[i]];
            if(t && t.unlocked == 0) t.unlocked = 1;
        }
        for(var i in this.obsolete){
            if(o.buildsByName[this.obsolete[i]]){
                o.buildsByName[this.obsolete[i]].sell(o.buildsByName[this.obsolete[i]].amount);
                o.buildsByName[this.obsolete[i]].unlocked = -1;
            }else if(o.techsByName[this.obsolete[i]]){
                o.techsByName[this.obsolete[i]].die();
            }
        }
        for(var i in this.effects){
            this.effects[i]();
        }
        this.amount += amt;
        o.elements.techListBought.appendChild(this.element.container);
        this.element.buy.style.display = 'none';
    }
    o.Tech.prototype.sell = function(amt){
        //todo: this, but it probably won't be used, techs aren't sold
        amt = amt || 1;
        if(!this.amount) return;
        for(var i in this.cost) o.resByName[i].earn(this.cost[i]*amt);
        for(var i in this.use) o.resByName[i].used -= (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].spend(this.provide[i]*amt);
        this.amount -= amt;
        this.needsUpdate = true;
    }
    o.Tech.prototype.die = function(amt){
        //like selling, but no return on resources
        amt = amt || 1;
        if(!this.amount) return;
        
        for(var i in this.use) o.resByName[i].used -= (this.use[i]*amt);
        for(var i in this.provide) o.resByName[i].spend(this.cost[i]*amt);
        for(var i in this.unlock){
            if(o.buildsByName[this.unlock[i]]){
                o.buildsByName[this.unlock[i]].sell(o.buildsByName[this.unlock[i]].amount);
                o.buildsByName[this.unlock[i]].unlocked = -1;
            }else if(o.techsByName[this.unlock[i]]){
                o.techsByName[this.unlock[i]].die();
            }
        }
        for(var i in this.obsolete){
            var t = o.resByName[this.obsolete[i]] || o.buildsByName[this.obsolete[i]] || o.techsByName[this.obsolete[i]];
            if(t && t.unlocked == 0) t.unlocked = 1;
        }
        this.amount -= amt;
    }
    o.Tech.prototype.update = function(){
        if(this.unlocked && !this.show && this.afford())this.show = 1;
        if(this.show && this.unlocked){
            this.element.container.classList.remove('hide');
        }else{
            this.element.container.classList.add('hide');
        }
        if(!this.amount){
            if(this.afford(1)){ this.element.container.classList.remove('unaffordable'); }
            else{ this.element.container.classList.add('unaffordable'); }
        }
        var html = '';
        if(this.amount == 0){
            for(var i in this.cost){
                html += '<li';
                if(this.cost[i] > o.resByName[i].amount) html += ' class=insufficient ';
                html += '>' + this.cost[i] + ' ' + o.resByName[i].name + '</li>';
            }
        }
        this.element.cost.innerHTML = html;
    }

/*/////////////////////////////////////////////////////////
SAVE AND LOAD
/////////////////////////////////////////////////////////*/    
    
    o.save = function(){
        setTimeout(o.save,60000);
        if(paused)return;   //don't save mid-modal interrupt, just try again later
        localStorage.setItem('colony-game',JSON.stringify(writeSave()));
        o.elements.saved.classList.add('open');
        classDelay(o.elements.saved,'open',1000);
    }
    o.gimmeSave = function(){
        return JSON.parse(localStorage.getItem('colony-game'));
    }
    o.load = function(){
        var loaded = JSON.parse(localStorage.getItem('colony-game'));
        if(!loaded)return false;
        totalTime = loaded.time;
        for(var i in loaded.res){
            o.resByName[i].amount = loaded.res[i].amount;
            o.resByName[i].multiplier = loaded.res[i].multiplier;
            o.resByName[i].efficiency = loaded.res[i].efficiency;
        }
        for(var i in loaded.techs){
            if(loaded.techs[i]) o.techsByName[i].forceBuy();
        }
        for(var i in loaded.builds){
            o.buildsByName[i].forceBuy(loaded.builds[i].amount);
            o.buildsByName[i].multiplier = loaded.builds[i].multiplier;
            o.buildsByName[i].efficiency = loaded.builds[i].efficiency;
        }
        return true;
    }
    o.loadStory = function(){
        var loaded = JSON.parse(localStorage.getItem('colony-game'));
        if(!loaded)return false;
        o.story = loaded.story;
    }
    o.wipeSave = function(){
        localStorage.removeItem('colony-game');
    }
    function writeSave(){
        var obj = {'version':o.version,'res':{},'builds':{},'techs':{},'story':{},'time':totalTime};
        for(var i in o.resByName){
            obj.res[i] = {};
            obj.res[i].amount = o.resByName[i].amount;
            obj.res[i].multiplier = o.resByName[i].multiplier;
            obj.res[i].efficiency = o.resByName[i].efficiency;
        }
        for(var i in o.buildsByName){
            obj.builds[i] = {};
            obj.builds[i].amount = o.buildsByName[i].amount;
            obj.builds[i].multiplier = o.buildsByName[i].multiplier;
            obj.builds[i].efficiency = o.buildsByName[i].efficiency;
        }
        for(var i in o.techsByName){
            obj.techs[i] = o.techsByName[i].amount;
        }
        obj.story = o.story;
        return obj;
    }
    
/*/////////////////////////////////////////////////////////
HELPER FUNCTIONS
/////////////////////////////////////////////////////////*/
    function clickBuy(e){
        var t = o.buildsByName[e.target.dataset.id] || o.techsByName[e.target.dataset.id];
        t.buy();
    }
    function clickSell(e){
        var t = o.buildsByName[e.target.dataset.id] || o.techsByName[e.target.dataset.id];
        t.sell();
    }
    function clickModal(e){
        var t = o.Modal.buttonEffects[e.target.dataset.id];
        if(t) t();
        o.Modal.close();
    }
    function clickEdit(e){
        var t = o.resByName[e.target.dataset.id];
        t.edit();
    }
    
    function classDelay(element,tag,delay){
        setTimeout(function(){
            if(tag.isArray){
                for(var i in tag){
                    element.classList.toggle(tag[i]);
                }
            }else{
                element.classList.toggle(tag);
            }
        },delay)
    }
    
    
    function ready(){
        if(Colony.ready){init()}
        else {setTimeout(ready,10)};
    }
    setTimeout(ready, 10);
    return o;
}(window,document);
function choose(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}
function capitalize(s){
    return s.charAt(0).toUpperCase() + s.slice(1)
}