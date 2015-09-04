var Colony = function(win,doc,undefined){
    var o = {};
    
    //todo: commodity markets
    //todo: message log
    //todo: lots of buildings
    //todo: harmony consequences
    //todo: support consequences
    //todo: independence consequences
    //todo: morale consequences
    //todo: colonial policies
    //todo: lots of events
    //todo: ticker message for tech unlocks
    //todo: prestige/new planets
    //todo: manual click modifiers
    //todo: building categories, invisible until tech
    //todo: pictures
    o.version = 0.02;
    
/*/////////////////////////////////////////////////////////
INITIALIZATION
/////////////////////////////////////////////////////////*/

    //jQuery's good for something
    var $ = function(s){return doc.querySelectorAll(s);};
    
    //real sloppy like, let's just save all the elements I need
    o.body = doc.body;
    o.tickerTape = $('.ticker')[0];
    o.moneyBar = $('.money-box')[0];
    o.menuButton = $('.menu-toggle')[0];
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
    
    //internal variables
    var currencySign = '₰', //pfennig!
        paused = false,
        techHidden = true,
        newTechs = 0;
        
    o.currency = currencySign;
    
    //might need to save some player data
    o.story = {};
    
    //loads and runs and stuff once the data file loads
    function init(){
        if(!o.load()) firstTime();
        nextMessage();
        requestAnimationFrame(tick);
        setTimeout(o.save,30000);
    }
    //if no save data, we need to start over
    function firstTime(){
        var letters = [['D','S','K'],['SP','EG','VQ'],['a','b','c','d','e']];
            o.story.originalPlanetName = choose(letters[0])+choose(letters[1])+'-'+(Math.ceil(Math.random()*700))+choose(letters[2]);
        insertMessage({'name':'start1','text':'Colonists arrive at ' + o.story.originalPlanetName});
        insertMessage({'name':'start2','text':'Investors eager to hear results of planetary survey'});
        insertMessage({'name':'start3','text':'Good year for colony groundbreaking, analysts say'});
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
        requestAnimationFrame(tick);    //next tick queued up
        lastTime = time;                //save it so we can implement offline winnings later
        dt = (time - oldTime);          //how long has it been since the last tick? We can do fps stuff later
        oldTime = time;                 //save for next tick
        if(paused)return;               //dunno if I'll do pausing, but whatever, just check
        totalTime += dt;                //total time spent in the game, don't count paused ticks
        //days = Math.floor(totalTime / 20000);     //this is for in-game timekeeping but not using yet
        dt /= 1000;                     //deltaTime should be in seconds for ease of defining other stuff
        
        updateTicker(dt);               //mostly just keeps things scrolling
        updateEconomy(dt);              //updates all the different money displays, calcs $/sec and such
        for(var i in o.builds){         //individual building logic, checks if you afford, and stuff
            o.builds[i].update(dt);
        }
        for(var i in o.techs){          //techs are almost the same thing as buildings, but separated for sanity
            o.techs[i].update(dt);
        }
        updateEvent(dt);                //runs tests to see if we should have an event happen
    }

/*/////////////////////////////////////////////////////////
MONEY PRETTINESS
/////////////////////////////////////////////////////////*/

    //convenience function, so I don't screw it up
    //passing variable lets me lie, if necessary
    function setMoneyBar(money){
        o.moneyBar.textContent = currencySign + prettify(money);
    }
    o.setMoneyBar = setMoneyBar;        //externally accessible for testing
    //oh boy how I wish this array wasn't needed, gotta be descending though
    //short scale numbers through, metric is weird for money
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
    //truncates numbers into 1.3k and such
    //prettify(number to be prettified,how many decimal points to spit out)
    function prettify(n,p){
        //gotta use undefined here because 0 is a number I might wanna use
        if(p == undefined) p = 2;
        //basically, we loop through the array from the top
        //checking if the number is bigger than the suffix
        //if it is, divide by that number and we start at the top so the biggest possible number is used
        //then it tacks on the suffix as needed
        for (var i = 0; i < ranges.length; i++) {
            if (n >= ranges[i].divider) {
                return (n / ranges[i].divider).toFixed(p) + ranges[i].suffix;
            }
        }
        //if it's smaller than all of them, it just gives back the number with the appropriate number of decimals
        return n.toFixed(p);
    }
    
    //just loops through the buildings and counts the earnings
    //could probably optimize moneymaking by just applying this number every tick, but meh
    function setPerSecond(){
        var m = 0;
        for(var i in o.builds){
            m += o.builds[i].amount * o.builds[i].multiplier * o.builds[i].earn * morale;
        }
        o.perSecond.textContent = '+ ' + prettify(m) + ' per second';
    }
    
/*/////////////////////////////////////////////////////////
TICKER TAPE
/////////////////////////////////////////////////////////*/

    //todo: message log
    var tapeMessages = [],                      //queued messages
        tapeNames = [],                         //names so we don't double up
        specialMessages = [],                   //priority queue, not used because it's acting weird
        visibleMessages = [],                   //messages actually scrolling right now
        tapePosition = 0,                       //where in the queue are we? not used
        tickerSize = o.tickerTape.clientWidth,  //just save how big the thing is
        tickerSpeed = 80,                       //how fast should we scroll in pixels/second
        needsMessage = false;                   //if the queue is empty, we wait
        
    o.tapeMessages = tapeMessages;              //external access for testing
    o.visibleMessages = visibleMessages;
    
    //possibly irresponsible class-making
    function TapeMessage(obj){
        if(tapeNames.indexOf(obj.name) != -1) return;
        //by default, don't repeat
        this.repeat = 0;
        
        //copy all the things
        for(var i in obj){ this[i] = obj[i]; }
        
        //element's pretty simple here
        this.element = document.createElement('p');
        this.element.innerHTML = this.text || '';
        this.element.className = this.classes || '';
        
        this.pos = 0;                           //where is it?
        this.size = this.element.clientWidth;   //how big is it, doesn't really work, this is just called every tick
        this.signaled = false;                  //once it is fully displayed, it can call for the next message
        
        tapeMessages.push(this);
        tapeNames.push(this.name);
        if(tapeMessages.length > 50) tapeMessages.shift();
    }
    //just scrolling logic
    TapeMessage.prototype.update = function(dt){
        //change position
        this.pos -= tickerSpeed * dt;
        //apply position
        this.element.style.transform = 'translateX(' + this.pos + 'px)';
        //if it's fully visible, ask for next message
        if(!this.signaled && this.pos <= tickerSize-this.element.clientWidth){
            this.signaled = true;
            nextMessage();
        }
        //if it's off-screen, get rid of it
        if(this.pos <= -this.element.clientWidth) this.remove();
    }
    //inserting onto the tape
    TapeMessage.prototype.add = function(){
        //initialize all the variables for this run
        this.signaled = false;
        this.pos = tickerSize;
        //tack it on the tape
        o.tickerTape.appendChild(this.element);
        //move it to the visible list so it'll update
        visibleMessages.push(this);
        //remove it from the queue
        tapeMessages.splice(tapeMessages.indexOf(this),1);
    }
    //taking it off the tape
    TapeMessage.prototype.remove = function(){
        //get rid of it
        o.tickerTape.removeChild(this.element);
        tapeNames.splice(tapeNames.indexOf(this.name),1);
        //stop updating it
        visibleMessages.splice(visibleMessages.indexOf(this),1);
        //if it's supposed to repeat, requeue it
        if(this.repeat--){
            tapeMessages.push(this);
            tapeNames.push(this.name);
        }
    }
    //ask for next message
    function nextMessage(){
        //any priority ones waiting?
        if(specialMessages[0]){
            var m = specialMessages.shift();
            m.add();
        //no? then are there any in the queue?
        }else if(tapeMessages[0]){
            tapeMessages[0].add();
        //no? then wait
        }else{
            needsMessage = true;
        }
    }
    //queue up a new message
    function insertMessage(obj){
        //make the message object
        var t = new TapeMessage(obj);
        //broken, probably because we don't return the message object
        if(t.special) specialMessages.push(t);
    }
    //update all the visible ones
    function updateTicker(dt){
        //if we're waiting for a message, and there is one, go
        if(needsMessage && tapeMessages[0]){
            tapeMessages[0].add();
            needsMessage = false;
        }
        //but mostly just make them move
        for(var i = visibleMessages.length;i--;){
            visibleMessages[i].update(dt);
        }
    }
    
/*/////////////////////////////////////////////////////////
ECONOMY
/////////////////////////////////////////////////////////*/

    //todo: commodity market
    var cashMoney = 0,      //current funds
        allTimeMoney = 0,   //cummulative money
        growthRate = 1.1,   //default building cost increase
        morale = 1;         //global efficiency multiplier
    
    //just setting the numbers and sanity checking
    function updateEconomy(dt){
        cashMoney = Math.max(cashMoney,0);
        setMoneyBar(cashMoney);
        setPerSecond();
    }
    //Should use this earn thing because it handles the allTimeMoney too
    //also makes it easy to add/subtract based on how much money you have
    function earnMoney(amt,mult){
        amt = amt || 0;
        if(mult) amt *= cashMoney;
        cashMoney += amt;
        if(amt > 0) allTimeMoney += amt;
    }
    o.earnMoney = earnMoney;
    //some day we'll make a spendMoney() function
    
    //Manual clicking stuff! Most of this is just prettiness
    var clickCount = 0,
        surveyTimers = [],
        surveyRotations = [30,60,90,120,180,-30,-60,-90,-120];
        
    //when you click, it gives you some money, counts the click, and sends one of the blips flying around the planet
    function surveyClick(){
        //count the click
        clickCount++;
        //after awhile, hide the button
        if(clickCount == 20) o.surveyButton.style.opacity = 0;
        //add a money! later this might have function to decide how much money and fire a ticker for survey results
        earnMoney(1);
        //now all this is just to do the satellite thing, it just repeats 5 times because there's 5 DOM elements that can do it
        //if there's an empty timer spot, use it
        if(!surveyTimers[0]){
            //give the satellite a random orientation
            o.surveyBoxes[0].style.transform = 'rotate(' + choose(surveyRotations) + 'deg)';
            //this class triggers a CSS animation that sends it around
            o.surveyBoxes[0].classList.add('orbit');
            //set a timer to disable the class after it's done and save the timer so we don't use this till the animation is done
            //could also do this with a animationend event, but this seemed easier
            //just gotta keep the timer synchronized to how long the animation is supposed to last
            surveyTimers[0] = setTimeout(function(){
                surveyTimers[0] = 0;
                o.surveyBoxes[0].classList.remove('orbit');
            },1000);
        //same thing for the other 4 satellites
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
    //add the click event
    o.planetSpace.addEventListener('click',surveyClick);
    
    var commodities = {'iron':1, 'aluminum':1, 'copper':1};
    
/*/////////////////////////////////////////////////////////
BUILDINGS
/////////////////////////////////////////////////////////*/

    o.builds = [];              //numeric iterator feels faster for tick looping, not tested though
    o.buildsByName = [];        //by name is useful for tests
    
    //building constructor
    o.Building = function(obj){
        //just setting some default properties
        this.unlocked = 0;          //can it be bought?
        this.show = 0;              //is it displayed?
        this.amount = 0;            //how many are there?
        this.totalAmount = 0;       //how many have been bought?
        this.offsetAmount = 0;
        this.growth = growthRate;   //how much more expensive is the next one?
        this.icon = [0,0];          //where's the picture?
        this.cost = 0;              //what's it cost?
        this.earn = 0;              //how much does it make?
        this.multiplier = 1;        //Should we make the earnings bigger?
        this.desc = '';             //description of thing
        
        //set all the things
        for(var i in obj){ this[i] = obj[i]; }
        
        //starts out with the initial cost
        this.currentCost = this.cost;
        //if no display name specified, use the internal name
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        //make the element, not complicated just verbose
        this.element = {};
        //start with the container
        this.element.container = doc.createElement('li');
        this.element.container.className = 'building';
        this.element.icon = doc.createElement('div');
        //then the icon, anything floated needs to come first
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*-64) + 'px ' + (this.icon[1]*64) + 'px';
        this.element.container.appendChild(this.element.icon);
        this.element.amount = doc.createElement('p');
        this.element.amount.textContent = Math.floor(this.amount);
        this.element.icon.appendChild(this.element.amount);
        //negative event buildings can't be sold
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
        //title is normal flow content so it comes at the end
        this.element.title = doc.createElement('h2');
        this.element.title.textContent = this.displayName;
        this.element.container.appendChild(this.element.title);
        this.element.earn = doc.createElement('p');
        this.element.title.appendChild(this.element.earn);
        //again, floated so it needs to come first despite showing up after costs
        this.element.desc = doc.createElement('p');
        this.element.desc.textContent = this.desc;
        this.element.container.appendChild(this.element.desc);
        //manually populating innerHTML of the list, this isn't too important as it's repeated every tick
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
        //add it to the list, but starts out hidden
        o.buildingList.appendChild(this.element.container);
        
        //add it to the lists
        o.buildsByName[this.name] = this;
        o.builds.push(this);
    }
    //check if we can afford, and update the icon, plus make money
    o.Building.prototype.update = function(dt){
        //custom tick function? do that
        if(this.onTick)this.onTick(dt);
        this.currentCost = this.cost * Math.pow(this.growth,this.totalAmount-this.offsetAmount);
        //if there's some to sell, make sell clickable
        if(!this.bad)this.element.sell.className = (this.amount <= 0 || this.name == 'explorer')?'fade sell-button':'sell-button';
        //update the amount
        this.element.amount.textContent = prettify(Math.floor(this.amount),0);
        
        //if unlocked and affordable, set it to show
        if(this.unlocked && this.afford()) this.show = 1;
        //if showable or you have some, show it
        //this is a separate step so that buildings can be made obsolete, and negative event buildings can show up without being normally buyable
        this.element.container.className = (this.show || this.amount)?'building':'building hide';
        //let the negative event buildings be visually styled
        if(this.bad) this.element.container.className += ' bad';
        
        //cost list is just reconstructed each tick, there's gotta be a better way to do this
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
        
        this.element.earn.textContent = currencySign + prettify(this.earn * this.multiplier) + '/sec';
        
        //after we make the list, if anything is unaffordable, don't let the buy button get clicked
        this.element.buy.className = (this.element.cost.querySelectorAll('.expensive').length)?'fade buy-button':'buy-button';
        
        //don't let there be less than 0 buildings
        this.amount = Math.max(0,this.amount);
        //earn money n stuff in proportion to the multiplier and timestep since earnings are specified per second
        if(this.type && typeModifiers[this.type] != undefined){
            //todo: commodity market
            //market has price per second
        }else{
            earnMoney(this.earn * dt * this.multiplier * this.amount * morale);
        }
        if(this.morale) morale += this.morale * this.amount * dt;
        if(this.harmony) harmony += this.harmony * this.amount * dt;
        if(this.inpendence) independence += this.independence * this.amount * dt;
        if(this.support) support += this.support * this.amount * dt;
    }
    //purchase the building, reused for technologies
    //if force then it doesn't cost anything
    o.Building.prototype.buy = function(amt,force){
        amt = amt || 0;
        //custom buy function? do it
        if(this.onBuy)this.onBuy(amt,force);
        //just do a loop for however many are getting purchased, so we can buy some of a big order
        for(var i = amt;i--;){
            //if not forced we need to make sure we can afford it
            if(!force){
                //loop through any building costs and quit if we can't handle it
                if(this.otherCost){
                    for(var i in this.otherCost){
                        if(o.buildsByName[i].amount < this.otherCost[i]) return;
                    }
                }
                //not enough money, quit
                if(cashMoney < this.currentCost) return;
                //actually spend the money
                //todo: spendMoney function
                cashMoney -= this.currentCost;
                //actually spend the other buildings
                if(this.otherCost){
                    for(var i in this.otherCost){
                        o.buildsByName[i].sell(this.otherCost[i],1);
                    }
                }
            }
            //if it's a negative event building, purchasing means destroying
            if(this.bad && !force){
                this.totalAmount++;
                this.amount--;
            //if it's been forced and not bad, just add the building, we already deducted funds
            }else{
                this.amount++;
                //only increase the total count if it's not forced, since forcing is used for save loading
                if(!force) this.totalAmount++;
            }
            //increase the cost, we need to do this clunky total amount thing to avoid floating point errors.
            //this is basically currentCost += currentCost * growth
            this.currentCost = this.cost * Math.pow(this.growth,this.totalAmount-this.offsetAmount);
        }
        //fun++
        if(this.element.amount){
            this.element.amount.classList.add('bounce');
            classDelay(this.element.amount, 'bounce', 30);
        }
    }
    //getting rid of a building! used for techs too
    //dying doesn't give you back resources or reduce the total purchased
    o.Building.prototype.sell = function(amt,die){
        amt = amt || 1;
        if(amt == -1) amt = this.amount;    //if -1, we're getting rid of everything
        //custom sell function? do it
        if(this.onSell)this.onSell(amt,die);
        //again, loop so we can abort in the middle and it's easier to handle the cost growth
        for(var i = amt;i--;){
            //get rid first
            this.amount--;
            if(!die){
                //if we sold and didn't die, we need to give back some money
                //todo: not give back all the money
                //reduce total amount
                this.totalAmount--;
                //jump the price back, giving us the price we used to buy this one
                this.currentCost = this.cost * Math.pow(this.growth,this.totalAmount-this.offsetAmount);
                //give back that money
                //todo: earnMoney issue with total money increasing, this isn't profit
                cashMoney += this.currentCost;
                //if there were building costs, give them back
                if(this.otherCost){
                    for(var i in this.otherCost){
                        o.buildsByName[i].buy(this.otherCost[i],1);
                    }
                }
            }
        }
        //fun++
        if(this.element.amount){
            this.element.amount.classList.add('fallover');
            classDelay(this.element.amount, 'fallover', 100);
        }
    }
    //checks if you can afford it, reused for techs
    //mostly used to determine if we show it or not
    o.Building.prototype.afford = function(){
        //this is for techs, since they work a little different
        if(this.require){
            for(var i in this.require){
                if(o.buildsByName[i].amount < this.require[i]) return 0;
            }
            return 1;
        }
        //but for buildings, is our allTimeMoney enough to cover it?
        if(this.currentCost > allTimeMoney) return 0;
        //if so, then do we have enough of the building costs?
        if(this.otherCost){
            for(var i in this.otherCost){
                if(o.buildsByName[i].totalAmount < this.otherCost[i]) return 0;
            }
        }
        return 1;
    }

/*/////////////////////////////////////////////////////////
TECHNOLOGIES
/////////////////////////////////////////////////////////*/


    o.techs = [];           //same as the buildings, this should loop faster, but is annoying to remember ids
    o.techsByName = [];
    
    //basically, this could've been the same class as Building
    o.Tech = function(obj){
        this.unlocked = 0;              //can we buy it?
        this.show = 0;                  //is it displayed?
        this.amount = 0;                //do you own it? Shouldn't go over 1
        this.totalAmount = 0;           //have you ever owned it?
        this.icon = [0,0];              //where's the picture?
        this.unlock = [];               //doesn't unlock anything else by default
        this.effects = [];              //has no other effects by default
        this.desc = '';                 //what does it say on the tile?
        this.unlockText = '';           //what ticker message when unlock?
        
        //set all the things
        for(var i in obj){ this[i] = obj[i]; }
        
        //start with the initial cost, this is just so we can reuse the building buy function
        this.currentCost = this.cost;
        //again, if no name given, use the internal one
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        //the element is basically the same as a building
        this.element = {};
        this.element.container = doc.createElement('li');
        this.element.container.className = 'technology';
        this.element.icon = doc.createElement('div');
        this.element.icon.className = 'icon';
        this.element.icon.style.backgroundPosition = (this.icon[0]*-64) + 'px ' + (this.icon[1]*64) + 'px';
        this.element.container.appendChild(this.element.icon);
        //there's just only a buy button
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
    //this is unique to it, since there's no need for earnings or anything
    o.Tech.prototype.update = function(dt){
        //starts the same, do any custom tick functions
        if(this.onTick)this.onTick(dt);
        //basically the same to check if we should show it, but...
        //tech tab isn't displayed by default so make that show up if it's the first tech
        //and make a notification to show when there's new techs
        if(!this.show && this.unlocked && this.afford()){
            this.show = 1;
            insertMessage({'name':this.name+'unlock','text':this.unlockText});
            newTechs++;
            o.techNote.textContent = newTechs;
            o.techNote.classList.remove('hide');
            if(techHidden){
                techHidden = false;
                o.techTab.classList.remove('hide');
            }
        }
        //again, show techs if we have it too
        this.element.container.className = (this.show || this.amount)?'technology':'technology hide';
        
        //if we don't have it yet
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
            
            //same trick to simplify afford checks
            this.element.buy.className = (this.element.cost.querySelectorAll('.expensive').length)?'fade buy-button':'buy-button';
        //already bought it, can't buy again
        //todo: wrap this into the buy function
        }else{
            this.element.container.className = 'technology bought';
            this.element.buy.className = 'hide';
        }
    }
    //mostly uses the Building buy function
    o.Tech.prototype.buy = function(amt,force){
        //start the same way
        o.Building.prototype.buy.call(this,amt,force);
        //but if there's unlocked stuff, do that
        for(var i in this.unlock){
            //unlocks might be a building or a tech so find it
            var t = o.buildsByName[this.unlock[i]] || o.techsByName[this.unlock[i]];
            if(t) t.unlocked = 1;
        }
        //any additional effects, do those too
        for(var i in this.effects){
            this.effects[i]();
        }
    }
    //these are completely identical to the Building ones
    o.Tech.prototype.sell = o.Building.prototype.sell;
    o.Tech.prototype.afford = o.Building.prototype.afford;

/*/////////////////////////////////////////////////////////
EVENTS
/////////////////////////////////////////////////////////*/

    //start with the modal popup thing, in a refactor, this should probably move to be next to the ticker stuff
    var modalEffects = [];      //what do the buttons do?
    //opening the modal window, can have 3 buttons
    //todo: content validation
    function openModal(title,content,buttons){
        //title for the top
        o.modalTitle.textContent = title;
        //what should fill up the box, can include HTML
        //todo: parser?
        o.modalContent.innerHTML = content;
        //for the buttons, use the button object, but only show any that are given
        for(var i = 3;i--;){
            //if it exists, show the button, set the text and save the effect
            if(buttons[i]){
                o.modalButtons[i].classList.remove('hide');
                o.modalButtons[i].textContent = buttons[i].text;
                modalEffects[i] = buttons[i].effect;
            //otherwise, hide the button, we don't need empty objects
            }else{
                o.modalButtons[i].classList.add('hide');
            }
        }
        //actually open the thing
        o.modal.classList.add('open');
    }
    //external access for testing
    o.openModal = openModal;
    //close the modal and free up the event system
    function closeModal(){
        o.modal.classList.remove('open');
        eventWaiting = 0;
    }
    //external access for testing
    o.closeModal = closeModal;
    
    var randomTick = 0,     //ticks govern what events can fire, 0-100
        eventWaiting = 0;   //if a modal is open, don't send more events
    //run checks and call any winners
    function updateEvent(dt){
        //give up if there's a modal waiting
        if(eventWaiting) return;
        //give us a random number
        randomTick = Math.random()*100;
        //list of possible winners
        var list = [];
        //if anyone passes their tests, add them to the list
        for(var i in o.events){
            list.push(o.events[i].test(dt));
        }
        //pick a winner from the possible winners
        var e = choose(list)
        if(e) e.go();
    }
    
    o.events = [];
    o.eventsByName = [];
    
    //event class so I can define them in data.js
    o.Event = function(obj){
        this.require = {};      //no requirements by default
        this.effects = [];      //no effects by default
        this.modal = 0;         //is it a modal?
        this.ticker = 0;        //or is this a ticker event?
        this.content = 0;       //no content by default
        this.chance = 0;        //0% chance per second by default
        
        //set all the things
        for(var i in obj){ this[i] = obj[i]; }
        //no display name? use the internal one
        this.displayName = this.displayName || this.name[0].toUpperCase() + this.name.slice(1);
        
        o.eventsByName[this.name] = this;
        o.events.push(this);
    }
    //each tick, we check to see if it can be used
    o.Event.prototype.test = function(dt){
        //randomTick is uniformly between 0-100, we want to add chance*dt to approximate a per second possibility
        //it should be over 100 in any given second chance% of the time
        if((randomTick + (this.chance*dt)) < 100) return;
        
        //assuming it's even possible, check the requirements
        for(var i in this.require){
            //easymode is a building or tech, find it first
            var t = o.buildsByName[i] || o.techsByName[i];
            if(t){
                //then, if it's a negative number, that means we want less than this amount
                if(this.require[i] < 0){
                    if(t.amount > Math.abs(this.require[i])) return;
                }else{
                    if(t.amount < this.require[i]) return;
                }
            //but there's other stuff we can test for
            //todo: make a resource list to make this easier to look up
            }else if(i == 'money'){
                if(this.require[i] < 0){
                    if(cashMoney > Math.abs(this.require[i])) return;
                }else{
                    if(cashMoney < this.require[i]) return;
                }
            //these are all basically the same, just different resources
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
            //todo: harmony, independence, morale and investor support
        }
        
        return this;
    }
    //if it wins, what do we do?
    o.Event.prototype.go = function(){
        //if content is dynamic, generate it
        if(typeof this.content == 'function'){
            var c = this.content();
        }else{
            var c = this.content;
        }
        if(this.ticker) c.name = this.name;
    
        //if it's modal, pause event system and open the window
        if(this.modal){
            eventWaiting = 1;
            openModal(this.displayName,c,this.buttons);
        //otherwise, just insert to the queue
        }else if(this.ticker){
            insertMessage(c);
        }
        //if it should only ever happen once, drop the chance to 0 so it always fails the test
        if(this.once) this.chance = 0;
        //execute any effects it might have
        for(var i in this.effects){
            this.effects[i]();
        }
    }

/*/////////////////////////////////////////////////////////
SAVE AND LOAD
/////////////////////////////////////////////////////////*/    
    
    //todo: obfuscation?
    //todo: compression?
    o.save = function(){
        //autosave every 30 seconds
        //todo: option to disable
        setTimeout(o.save,30000);
        if(paused)return;   //don't save mid-modal interrupt, just try again later, not currently used
        //set the local storage object
        localStorage.setItem('colony-game',JSON.stringify(writeSave()));
        //push the message to the ticker to notify
        //todo: different notification method?
        insertMessage({'name':'save','text':'Game Saved!'});
    }
    //mostly for testing, to return the contents of the save
    //todo: save exporting
    o.gimmeSave = function(){
        return JSON.parse(localStorage.getItem('colony-game'));
    }
    //todo: version testing?
    o.load = function(){
        //try to get a save
        var loaded = JSON.parse(localStorage.getItem('colony-game'));
        //if there isn't one, give upe
        if(!loaded)return false;
        //set the resources
        totalTime = loaded.time;
        lastTime = loaded.lastTime;
        cashMoney = loaded.cashMoney;
        allTimeMoney = loaded.allTimeMoney;
        //buy any techs we might need, literally buy to apply any effects
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
        //set the total for any buildings, but force buy the rest to trigger any buy functions
        for(var i in loaded.builds){
            o.buildsByName[i].totalAmount = loaded.builds[i].total;
            o.buildsByName[i].buy(loaded.builds[i].amount,1);
        }
        //when we load the page, we'd like to know if it worked
        return true;
    }
    //hard-reset, just deletes the file
    o.wipeSave = function(skip){
        localStorage.removeItem('colony-game');
        if(!skip) location.reload();
    }
    //basically just load backwards, this is called in save()
    function writeSave(){
        var obj = {'version':o.version,'builds':{},'techs':{},'story':{}};
        obj.cashMoney = cashMoney;
        obj.allTimeMoney = allTimeMoney;
        obj.time = totalTime;
        obj.lastTime = lastTime;
        //builds have 2 things, so we need objects to hold them
        for(var i in o.buildsByName){
            obj.builds[i] = {};
            obj.builds[i].amount = o.buildsByName[i].amount;
            obj.builds[i].total = o.buildsByName[i].totalAmount;
        }
        //techs are just purchased or not, so can just set the number
        for(var i in o.techsByName){
            obj.techs[i] = o.techsByName[i].amount;
        }
        //save any story points
        obj.story = o.story;
        return obj;
    }
    
/*/////////////////////////////////////////////////////////
HELPER FUNCTIONS
/////////////////////////////////////////////////////////*/

    //for buildings and techs, look up the relevant thing and buy it
    function clickBuy(e){
        var t = o.buildsByName[e.target.dataset.id] || o.techsByName[e.target.dataset.id];
        t.buy(1);
    }
    //same deal, look up the button's reference and sell it
    function clickSell(e){
        var t = o.buildsByName[e.target.dataset.id] || o.techsByName[e.target.dataset.id];
        t.sell(1);
    }
    
    //opens tabs
    //todo: colonial policy
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
                //clear any new tech notifications
                newTechs = 0;
                o.techNote.classList.add('hide');
                break;
        }
    }
    for(var i in o.tabs){ o.tabs[i].addEventListener('click',clickOpen); }
    
    //any button clicks in a modal, closes by default, don't need to include that
    function clickModal(e){
        var t = e.target.dataset.id;
        var cancel = false;
        if(modalEffects[t])cancel = modalEffects[t]();
        if(cancel){
            e.target.classList.add('fade');
        }else{
            closeModal();
        }
    }
    for(var i in o.modalButtons){ o.modalButtons[i].addEventListener('click',clickModal); }
    
    function menuToggle(){
        o.body.classList.toggle('menu');
    }
    o.menuButton.addEventListener('click', menuToggle);
    
    //helper function for any animations, toggles the class after so long
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
    
    //checks for data.js to be loaded
    function ready(){
        if(Colony.ready){init()}
        else {setTimeout(ready,10)};
    }
    setTimeout(ready, 10);
    return o;
}(window,document);

//given an array, pick a random value
function choose(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}