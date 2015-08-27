var Colony = function(win,doc,undefined){
    var o = {};
    
    o.version = 0.01;
    
/*/////////////////////////////////////////////////////////
INITIALIZATION
/////////////////////////////////////////////////////////*/
    var $ = function(s){return doc.querySelectorAll(s);};
    o.tickerTape = $('.ticker')[0];
    o.moneyBar = $('.money-box')[0];
    o.perSecond = $('.persecond')[0];
    o.planetSpace = $('.planetspace')[0];
    o.surveyButton = $('.survey-button')[0];
    o.surveyBoxes = Array.prototype.slice.call($('.survey-box'));
    o.tabs = Array.prototype.slice.call($('.tab'));
    o.techTab = o.tabs[1];
    o.techNote = $('.tab.tech .notification')[0]
    o.buildingList = $('.build.list')[0];
    o.technologyList = $('.tech.list')[0];
    o.modal = $('.modal')[0];
    o.modalTitle = $('.modal h1')[0];
    o.modalContent = $('.modal .content')[0];
    o.modalButtons = Array.prototype.slice.call($('.modal button'));
    
    var currencySign = '₰',
        paused = false,
        techHidden = true,
        newTechs = 0;
    
    o.story = {};
    
    function init(){
        if(!o.load()) firstTime();
        nextMessage();
        requestAnimationFrame(tick);
    }
    function firstTime(){
        var letters = [['D','S','K'],['SP','EG','VQ'],['a','b','c','d','e']];
            o.story.originalPlanetName = choose(letters[0])+choose(letters[1])+'-'+(Math.ceil(Math.random()*700))+choose(letters[2]);
        insertMessage({'text':'Colonists arrive at ' + o.story.originalPlanetName});
        insertMessage({'text':'Investors eager to hear results of planetary survey'});
        insertMessage({'text':'Good year for colony groundbreaking, analysts say'});
    }
    
/*/////////////////////////////////////////////////////////
MAIN LOOP
/////////////////////////////////////////////////////////*/
    var totalTime = 0,  //this is milliseconds
        lastTime = 0,
        days = 0,
        oldTime = 0,
        dt = 0;         //this is seconds
    function tick(time){
        requestAnimationFrame(tick);
        lastTime = time;
        dt = (time - oldTime);
        oldTime = time;
        if(paused)return;
        totalTime += dt;
        //days = Math.floor(totalTime / 20000);
        dt /= 1000;
        
        updateTicker(dt);
        updateEconomy(dt);
        for(var i in o.builds){
            o.builds[i].update(dt);
        }
        for(var i in o.techs){
            o.techs[i].update(dt);
        }
        updateEvent(dt);
    }

/*/////////////////////////////////////////////////////////
MONEY PRETTINESS
/////////////////////////////////////////////////////////*/
    function setMoneyBar(money){
        o.moneyBar.textContent = currencySign + prettify(money);
    }
    var ranges = [
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
    function prettify(n,p){
        if(p == undefined) p = 2;
        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
                return (n / ranges[i].divider).toFixed(p) + ranges[i].suffix;
            }
        }
        return n.toFixed(p);
    }
    o.setMoneyBar = setMoneyBar;
    
    function setPerSecond(){
        var m = 0;
        for(var i in o.builds){
            m += o.builds[i].amount * o.builds[i].multiplier * o.builds[i].earn;
        }
        o.perSecond.textContent = currencySign + prettify(m) + ' per second';
    }
    
/*/////////////////////////////////////////////////////////
TICKER TAPE
/////////////////////////////////////////////////////////*/
    var tapeMessages = [],
        specialMessages = [],
        visibleMessages = [],
        tapePosition = 0,
        tickerSize = o.tickerTape.clientWidth,
        tickerSpeed = 80,
        needsMessage = false;
        
    o.tapeMessages = tapeMessages;
    o.visibleMessages = visibleMessages;
        
    function TapeMessage(obj){
        this.repeat = 0;
        for(var i in obj){ this[i] = obj[i]; }
        
        this.element = document.createElement('p');
        this.element.innerHTML = this.text || '';
        this.element.className = this.classes || '';
        
        this.pos = 0;
        this.size = this.element.clientWidth;
        this.signaled = false;
        
        tapeMessages.push(this);
        if(tapeMessages.length > 50) tapeMessages.shift();
    }
    TapeMessage.prototype.update = function(dt){
        this.pos -= tickerSpeed * dt;
        this.element.style.transform = 'translateX(' + this.pos + 'px)';
        if(!this.signaled && this.pos <= tickerSize-this.element.clientWidth){
            this.signaled = true;
            nextMessage();
        }
        if(this.pos <= -this.element.clientWidth) this.remove();
    }
    TapeMessage.prototype.add = function(){
        this.signaled = false;
        this.pos = tickerSize;
        o.tickerTape.appendChild(this.element);
        visibleMessages.push(this);
        tapeMessages.splice(tapeMessages.indexOf(this),1);
    }
    TapeMessage.prototype.remove = function(){
        o.tickerTape.removeChild(this.element);
        visibleMessages.splice(visibleMessages.indexOf(this),1);
        if(this.repeat--){
            tapeMessages.push(this);
        }
    }
    function nextMessage(){
        if(specialMessages[0]){
            var m = specialMessages.shift();
            m.add();
        }else if(tapeMessages[0]){
            tapeMessages[0].add();
        }else{
            needsMessage = true;
        }
    }
    function insertMessage(obj){
        var t = new TapeMessage(obj);
        if(t.special) specialMessages.push(t);
    }
    function updateTicker(dt){
        if(needsMessage && tapeMessages[0]){
            tapeMessages[0].add();
            needsMessage = false;
        }
        for(var i = visibleMessages.length;i--;){
            visibleMessages[i].update(dt);
        }
    }
    
/*/////////////////////////////////////////////////////////
ECONOMY
/////////////////////////////////////////////////////////*/
    var cashMoney = 0,
        allTimeMoney = 0,
        growthRate = 1.1;
    
    function updateEconomy(dt){
        cashMoney = Math.max(cashMoney,0);
        setMoneyBar(cashMoney);
        setPerSecond();
    }
    function earnMoney(amt,mult){
        amt = amt || 0;
        if(mult) amt *= cashMoney;
        cashMoney += amt;
        if(amt > 0) allTimeMoney += amt;
    }
    o.earnMoney = earnMoney;
    
    var clickCount = 0,
        surveyTimers = [],
        surveyRotations = [30,60,90,120,180,-30,-60,-90,-120];
    o.surveyBoxes[0].style.transform = 'rotate(40deg)';
    o.surveyBoxes[1].style.transform = 'rotate(-80deg)';
    o.surveyBoxes[2].style.transform = 'rotate(120deg)';
    function surveyClick(){
        clickCount++;
        if(clickCount == 20) o.surveyButton.style.opacity = 0;
        earnMoney(1);
        if(!surveyTimers[0]){
            o.surveyBoxes[0].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            o.surveyBoxes[0].classList.add('orbit');
            surveyTimers[0] = setTimeout(function(){
                surveyTimers[0] = 0;
                o.surveyBoxes[0].classList.remove('orbit');
            },1000);
        }else if(!surveyTimers[1]){
            o.surveyBoxes[1].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            o.surveyBoxes[1].classList.add('orbit');
            surveyTimers[1] = setTimeout(function(){
                surveyTimers[1] = 0;
                o.surveyBoxes[1].classList.remove('orbit');
            },1000);
        }else if(!surveyTimers[2]){
            o.surveyBoxes[2].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            o.surveyBoxes[2].classList.add('orbit');
            surveyTimers[2] = setTimeout(function(){
                surveyTimers[2] = 0;
                o.surveyBoxes[2].classList.remove('orbit');
            },1000);
        }else if(!surveyTimers[3]){
            o.surveyBoxes[3].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            o.surveyBoxes[3].classList.add('orbit');
            surveyTimers[3] = setTimeout(function(){
                surveyTimers[3] = 0;
                o.surveyBoxes[3].classList.remove('orbit');
            },1000);
        }else if(!surveyTimers[4]){
            o.surveyBoxes[4].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            o.surveyBoxes[4].classList.add('orbit');
            surveyTimers[4] = setTimeout(function(){
                surveyTimers[4] = 0;
                o.surveyBoxes[4].classList.remove('orbit');
            },1000);
        }
    }
    o.planetSpace.addEventListener('click',surveyClick);
/*/////////////////////////////////////////////////////////
BUILDINGS
/////////////////////////////////////////////////////////*/
    o.builds = [];
    o.buildsByName = [];
    o.Building = function(obj){
        this.unlocked = 0;
        this.show = 0;
        this.amount = 0;
        this.totalAmount = 0;
        this.growth = growthRate;
        this.icon = [0,0];
        this.cost = 0;
        this.earn = 0;
        this.multiplier = 1;
        this.desc = '';
        
        for(var i in obj){ this[i] = obj[i]; }
        
        this.currentCost = this.cost;
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'building';
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*-64) + 'px ' + (this.icon[1]*64) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.amount = doc.createElement('p');
        this.element.amount.textContent = Math.floor(this.amount);
        this.element.icon.appendChild(this.element.amount);
        if(!this.bad){
            this.element.sell = doc.createElement('div');
            this.element.sell.className = 'sell-button';
            this.element.sell.dataset.id = this.name;
            this.element.sell.addEventListener('click',clickSell);
            this.element.icon.appendChild(this.element.sell);
        }
        this.element.buy = doc.createElement('div');
        this.element.buy.className = 'buy-button';
        this.element.buy.dataset.id = this.name;
        this.element.buy.addEventListener('click',clickBuy);
        this.element.icon.appendChild(this.element.buy);
        this.element.title = doc.createElement('h2');
        this.element.title.textContent = this.displayName;
        this.element.container.appendChild(this.element.title);
        this.element.desc = doc.createElement('p');
        this.element.desc.textContent = this.desc;
        this.element.container.appendChild(this.element.desc);
        this.element.cost = doc.createElement('ul');
        this.element.cost.className = 'cost';
        var html = '';
        html += '<li>' + currencySign + prettify(this.currentCost) + '</li>';
        if(this.otherCost){
            for(var i in this.otherCost){
                html += '<li>' + this.otherCost[i] + ' ' + o.buildsByName[i].displayName + '</li>';
            }
        }
        this.element.cost.innerHTML = html;
        this.element.container.appendChild(this.element.cost);
        o.buildingList.appendChild(this.element.container);
        
        
        o.buildsByName[this.name] = this;
        o.builds.push(this);
    }
    o.Building.prototype.update = function(dt){
        if(this.onTick)this.onTick(dt);
        if(!this.bad)this.element.sell.className = (this.amount <= 0)?'fade sell-button':'sell-button';
        this.element.amount.textContent = prettify(Math.floor(this.amount),0);
        
        if(this.unlocked && this.afford()) this.show = 1;
        this.element.container.className = (this.show || this.amount)?'building':'building hide';
        if(this.bad) this.element.container.className += ' bad';
        
        var html = '';
        html += '<li' + ((this.currentCost > cashMoney)?' class=expensive>':'>');
        html += currencySign + prettify(this.currentCost) + '</li>';
        if(this.otherCost){
            for(var i in this.otherCost){
                html += '<li' + ((o.buildsByName[i].amount < this.otherCost[i])?' class=expensive>':'>'); 
                html += this.otherCost[i] + ' ' + o.buildsByName[i].displayName + '</li>';
            }
        }
        this.element.cost.innerHTML = html;
        
        this.element.buy.className = (this.element.cost.querySelectorAll('.expensive').length)?'fade buy-button':'buy-button';
        
        this.amount = Math.max(0,this.amount);
        earnMoney(this.earn * dt * this.multiplier * this.amount);
    }
    o.Building.prototype.buy = function(amt,force){
        amt = amt || 0;
        if(this.onBuy)this.onBuy(amt,force);
        for(var i = amt;i--;){
            if(!force){
                if(this.otherCost){
                    for(var i in this.otherCost){
                        if(o.buildsByName[i].amount < this.otherCost[i]) return;
                    }
                }
                if(cashMoney < this.currentCost) break;
                cashMoney -= this.currentCost;
                if(this.otherCost){
                    for(var i in this.otherCost){
                        o.buildsByName[i].sell(this.otherCost[i],1);
                    }
                }
            }
            if(this.bad && !force){
                this.amount--;
            }else{
                this.amount++;
                if(!force) this.totalAmount++;
            }
            this.currentCost = this.cost * Math.pow(this.growth,this.totalAmount);
        }
        if(this.element.amount){
            this.element.amount.classList.add('bounce');
            classDelay(this.element.amount, 'bounce', 30);
        }
    }
    o.Building.prototype.sell = function(amt,die){
        amt = amt || 1;
        if(amt == -1) amt = this.amount;
        if(this.onSell)this.onSell(amt,die);
        for(var i = amt;i--;){
            this.amount--;
            if(!die){
                this.totalAmount--;
                this.currentCost = this.cost * Math.pow(1.1,this.totalAmount);
                cashMoney += this.currentCost;
                if(this.otherCost){
                    for(var i in this.otherCost){
                        o.buildsByName[i].buy(this.otherCost[i],1);
                    }
                }
            }
        }
        if(this.element.amount){
            this.element.amount.classList.add('fallover');
            classDelay(this.element.amount, 'fallover', 100);
        }
    }
    o.Building.prototype.afford = function(){
        if(this.require){
            for(var i in this.require){
                if(o.buildsByName[i].amount < this.require[i]) return 0;
            }
            return 1;
        }
        if(this.currentCost > allTimeMoney) return 0;
        if(this.otherCost){
            for(var i in this.otherCost){
                if(o.buildsByName[i].amount < this.otherCost[i]) return 0;
            }
        }
        return 1;
    }

/*/////////////////////////////////////////////////////////
TECHNOLOGIES
/////////////////////////////////////////////////////////*/
    o.techs = [];
    o.techsByName = [];
    o.Tech = function(obj){
        this.unlocked = 0;
        this.show = 0;
        this.amount = 0;
        this.totalAmount = 0;
        this.icon = [0,0];
        this.unlock = [];
        this.effects = [];
        this.desc = '';
        
        for(var i in obj){ this[i] = obj[i]; }
        
        this.currentCost = this.cost;
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'technology';
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*-64) + 'px ' + (this.icon[1]*64) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.buy = doc.createElement('div');
        this.element.buy.className = 'buy-button';
        this.element.buy.dataset.id = this.name;
        this.element.buy.addEventListener('click',clickBuy);
        this.element.icon.appendChild(this.element.buy);
        this.element.title = doc.createElement('h2');
        this.element.title.textContent = this.displayName;
        this.element.container.appendChild(this.element.title);
        this.element.desc = doc.createElement('p');
        this.element.desc.textContent = this.desc;
        this.element.container.appendChild(this.element.desc);
        this.element.cost = doc.createElement('ul');
        this.element.cost.className = 'cost';
        var html = '';
        html += '<li>' + currencySign + prettify(this.currentCost) + '</li>';
        if(this.otherCost){
            for(var i in this.otherCost){
                html += '<li>' + this.otherCost[i] + ' ' + o.buildsByName[i].displayName + '</li>';
            }
        }
        this.element.cost.innerHTML = html;
        this.element.container.appendChild(this.element.cost);
        o.technologyList.appendChild(this.element.container);
        
        o.techsByName[this.name] = this;
        o.techs.push(this);
    }
    o.Tech.prototype.update = function(dt){
        if(this.onTick)this.onTick(dt);
        if(!this.show && this.unlocked && this.afford()){
            this.show = 1;
            newTechs++;
            o.techNote.textContent = newTechs;
            o.techNote.classList.remove('hide');
            if(techHidden){
                techHidden = false;
                o.techTab.classList.remove('hide');
            }
        }
        this.element.container.className = (this.show || this.amount)?'technology':'technology hide';
        
        if(this.amount == 0){
            var html = '';
            html += '<li' + ((this.currentCost > cashMoney)?' class=expensive>':'>');
            html += currencySign + prettify(this.currentCost) + '</li>';
            if(this.otherCost){
                for(var i in this.otherCost){
                    html += '<li' + ((o.buildsByName[i].amount < this.otherCost[i])?' class=expensive>':'>'); 
                    html += this.otherCost[i] + ' ' + o.buildsByName[i].displayName + '</li>';
                }
            }
            this.element.cost.innerHTML = html;
            
            this.element.buy.className = (this.element.cost.querySelectorAll('.expensive').length)?'fade buy-button':'buy-button';
        }else{
            this.element.container.className = 'technology bought';
            this.element.buy.className = 'hide';
        }
    }
    o.Tech.prototype.buy = function(amt,force){
        o.Building.prototype.buy.call(this,amt,force);
        for(var i in this.unlock){
            var t = o.buildsByName[this.unlock[i]] || o.techsByName[this.unlock[i]];
            if(t) t.unlocked = 1;
        }
        for(var i in this.effects){
            this.effects[i]();
        }
    }
    o.Tech.prototype.sell = o.Building.prototype.sell;
    o.Tech.prototype.afford = o.Building.prototype.afford;

/*/////////////////////////////////////////////////////////
EVENTS
/////////////////////////////////////////////////////////*/
    var modalEffects = [];
    function openModal(title,content,buttons){
        o.modalTitle.textContent = title;
        o.modalContent.innerHTML = content;
        for(var i = 3;i--;){
            if(buttons[i]){
                o.modalButtons[i].classList.remove('hide');
                o.modalButtons[i].textContent = buttons[i].text;
                modalEffects[i] = buttons[i].effect;
            }else{
                o.modalButtons[i].classList.add('hide');
            }
        }
        o.modal.classList.add('open');
    }
    o.openModal = openModal;
    function closeModal(){
        o.modal.classList.remove('open');
        eventWaiting = 0;
    }
    o.closeModal = closeModal;
    
    var randomTick = 0,
        eventWaiting = 0;
    function updateEvent(dt){
        if(eventWaiting) return;
        randomTick = Math.random()*100;
        var list = [];
        for(var i in o.events){
            list.push(o.events[i].test(dt));
        }
        var e = choose(list)
        if(e) e.go();
    }
    
    o.events = [];
    o.eventsByName = [];
    o.Event = function(obj){
        this.require = {};
        this.effects = [];
        this.modal = 0;
        this.content = 0;
        this.chance = 0;
        
        for(var i in obj){ this[i] = obj[i]; }
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        o.eventsByName[this.name] = this;
        o.events.push(this);
    }
    o.Event.prototype.test = function(dt){
        if((randomTick + (this.chance*dt)) < 100) return;
        
        for(var i in this.require){
            var t = o.buildsByName[i] || o.techsByName[i];
            if(t){
                if(this.require[i] < 0){
                    if(t.amount > Math.abs(this.require[i])) return;
                }else{
                    if(t.amount < this.require[i]) return;
                }
            }else if(i == 'money'){
                if(this.require[i] < 0){
                    if(cashMoney > Math.abs(this.require[i])) return;
                }else{
                    if(cashMoney < this.require[i]) return;
                }
            }else if(i == 'totalMoney'){
                if(this.require[i] < 0){
                    if(allTimeMoney > Math.abs(this.require[i])) return;
                }else{
                    if(allTimeMoney < this.require[i]) return;
                }
            }else if(i == 'time'){
                if(this.require[i] < 0){
                    if(totalTime > Math.abs(this.require[i])*1000) return;
                }else{
                    if(totalTime < this.require[i]*1000) return;
                }
            }
        }
        
        return this;
    }
    o.Event.prototype.go = function(){
        if(this.modal){
            eventWaiting = 1;
            openModal(this.displayName,this.content,this.buttons);
        }else if(this.ticker){
            insertMessage(this.content);
        }
        if(this.once) this.chance = 0;
        for(var i in this.effects){
            this.effects[i]();
        }
    }

/*/////////////////////////////////////////////////////////
SAVE AND LOAD
/////////////////////////////////////////////////////////*/    
    
    o.save = function(){
        setTimeout(o.save,60000);
        if(paused)return;   //don't save mid-modal interrupt, just try again later
        localStorage.setItem('colony-game',JSON.stringify(writeSave()));
        insertMessage({'name':'save','text':'Game Saved!'});
    }
    o.gimmeSave = function(){
        return JSON.parse(localStorage.getItem('colony-game'));
    }
    o.load = function(){
        var loaded = JSON.parse(localStorage.getItem('colony-game'));
        if(!loaded)return false;
        totalTime = loaded.time;
        lastTime = loaded.lastTime;
        cashMoney = loaded.cashMoney;
        allTimeMoney = loaded.allTimeMoney;
        for(var i in loaded.techs){
            if(loaded.techs[i]){
                o.techsByName[i].buy(1,1);
                o.techsByName[i].show = 1;
                if(techHidden){
                    techHidden = false;
                    o.techTab.classList.remove('hide');
                }
            }
        }
        for(var i in loaded.builds){
            o.buildsByName[i].totalAmount = loaded.builds[i].total;
            o.buildsByName[i].buy(loaded.builds[i].amount,1);
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
        var obj = {'version':o.version,'builds':{},'techs':{},'story':{}};
        obj.cashMoney = cashMoney;
        obj.allTimeMoney = allTimeMoney;
        obj.time = totalTime;
        obj.lastTime = lastTime;
        for(var i in o.buildsByName){
            obj.builds[i] = {};
            obj.builds[i].amount = o.buildsByName[i].amount;
            obj.builds[i].total = o.buildsByName[i].totalAmount;
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
        t.buy(1);
    }
    function clickSell(e){
        var t = o.buildsByName[e.target.dataset.id] || o.techsByName[e.target.dataset.id];
        t.sell(1);
    }
    
    function clickOpen(e){
        var t = e.target.dataset.id;
        switch(t){
            case 'buildings':
                for(var i in o.tabs){ o.tabs[i].classList.remove('active'); }
                o.technologyList.classList.remove('active');
                o.buildingList.classList.add('active');
                e.target.classList.add('active');
                break;
            case 'technology':
                for(var i in o.tabs){ o.tabs[i].classList.remove('active'); }
                o.buildingList.classList.remove('active');
                o.technologyList.classList.add('active');
                e.target.classList.add('active');
                newTechs = 0;
                o.techNote.classList.add('hide');
                break;
        }
    }
    for(var i in o.tabs){ o.tabs[i].addEventListener('click',clickOpen); }
    
    function clickModal(e){
        var t = e.target.dataset.id;
        if(modalEffects[t])modalEffects[t]();
        closeModal();
    }
    for(var i in o.modalButtons){ o.modalButtons[i].addEventListener('click',clickModal); }
    
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
    return arr[Math.floor(Math.random() * arr.length)];
}