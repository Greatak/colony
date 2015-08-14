function loadData(){
//HIDDEN RESOURCES
    new Colony.Resource({   //adapting to the native ecosystem
        'name':'harmony',
        'meta':1
    });
    new Colony.Resource({   //support from corporate investors
        'name':'support',
        'meta':1,
        'startAmount':100
    });
    new Colony.Resource({   //happiness of colonists, should gradually decay, not implemented
        'name':'morale',
        'meta':1,
        'startAmount':100
    });
    new Colony.Resource({
        'name':'independence',
        'meta':1
    });
    new Colony.Resource({
        'name' : 'livestock',
        'meta':1
    });
    
//PRIMARY RESOURCES
    new Colony.Resource({
        'name' : 'population',
        'symbol' : 'Ppl',
        'startAmount' : 5,
        'icon':[2,0],
        'cap': 'housing',
        'usable': 1,
        'cat': 'primary',
        'onTick': function(dt){
            var count = this.amount,
                amt = 0.05 * count * dt * Colony.resByName['food'].efficiency;
                while(amt > Colony.resByName['food'].amount){
                    amt -= 3 * dt;
                    count -= 1;
                }
            if(count < 0) count = 0;
            if(amt < 0) amt = 0;
            Colony.resByName['food'].spend(amt);
            if(count != this.amount){
                this.spend(Math.max(0,this.amount - count));
            }
        },
        'onSpend': function(amt){
            var s = (amt == 1)?'Someone ':amt + ' people ';
            Colony.log(s + 'died!','bad');
            
            if(this.amount == 0){
                Colony.modal(
                    'Calamity!',
                    "Not every expedition is successful, but they should always teach us something. Maybe it's worth another go? Early colony efforts generally require a quartermaster to keep everyone fed, but he will need some progress to report back to your investors.",
                    [{'text':'Try Again','effect':function(){ Colony.wipeSave(); location.reload(); }}]
                )
            }
        }
    });
    new Colony.Resource({
        'name':'housing',
        'symbol': 'Hs',
        'icon':[3,0],
        'startAmount': 5,
        'cat':'primary'
    });
    new Colony.Resource({
        'name':'structure',
        'icon':[4,0],
        'symbol':'St',
        'cat':'primary'
    });
    new Colony.Resource({
        'name': 'data',
        'icon':[5,0],
        'cat': 'primary'
    });
    new Colony.Resource({
        'name' : 'food',
        'symbol' : 'Fd',
        'icon':[6,0],
        'cat' : 'primary',
        'desc': 'Your people will need at least 1 meal per day'
    });
    new Colony.Resource({
        'name': 'fuel',
        'icon':[7,0],
        'cat': 'primary'
    });
    new Colony.Resource({
        'name': 'energy',
        'usable':1,
        'icon':[8,0],
        'cat': 'primary'
    });
    new Colony.Resource({
        'name': 'materials',
        'icon':[9,0],
        'cat': 'primary'
    });
    
//SECONDARY RESOURCES
    new Colony.Resource({
        'name': 'ration',
        'displayName': 'Ration Pack',
        'parent': 'food',
        'startAmount': 20
    })
    new Colony.Resource({
        'name': 'berry',
        'prefix' : ['green','yellow','mauve'],
        'types' : ['forage','basic-plant']
    });
    new Colony.Resource({
        'name': 'fruit',
        'prefix' : ['blue','orange','sepia'],
        'types' : ['forage','basic-plant']
    });
    new Colony.Resource({
        'name': 'flower',
        'prefix' : ['purple','beige','white'],
        'types' : ['forage','basic-plant']
    });
    new Colony.Resource({
        'name': 'rock',
        'prefix' : ['ferrous','magnetic','aluminous'],
        'types' : ['forage','basic-earth'],
        'parent':'materials'
    });
    new Colony.Resource({
        'name': 'stone',
        'prefix' : ['iridescent','spar','ammolite'],
        'types' : ['forage','basic-earth']
    });
    new Colony.Resource({
        'name': 'bush',
        'prefix' : ['thorny','woody','wild'],
        'types' : ['forage','basic-plant']
    });
    new Colony.Resource({
        'name':'soil',
        'multiplier':2,
        'types' : ['basic-earth']
    });
    new Colony.Resource({
        'name':'ferae',
        'multiplier':0,
        'prefix' : ['canine','reptilian','amphibious'],
        'types' : ['animal']
    });
    new Colony.Resource({
        'name':'bovid',
        'multiplier':0,
        'prefix' : ['wooly','hooved','scaly'],
        'types' : ['animal']
    });
    new Colony.Resource({
        'name':'cow',
        'types': ['imported-animal']
    });
    new Colony.Resource({
        'name':'goat',
        'types': ['imported-animal']
    });
    new Colony.Resource({
        'name':'iron'
    });
    new Colony.Resource({
        'name':'copper'
    });
    new Colony.Resource({
        'name':'aluminum'
    });
    new Colony.Resource({
        'name':'zinc'
    });

//BUILDINGS
//
//name - internal id, can't overlap, visible if no displayName
//displayName - displayed on the building listStyleType
//icon - [x,y] simplified coordinates on the sprite sheet
//staffed - true/false, defaults false, if false, then it gets 10% more expensive each purchase
//unlocked - true/false, defaults false, if true, you start with this
//recycled - true/false, defaults false, if true, you get back the 'cost' resources when it fails upkeep
//desc - visible description, should be no more than a sentence
//efficiency - multiplies the upkeep rate
//multiplier - multiplies the gather rate
//
//use - resources that the building will passively occupy, like population or energy
//cost - resources needed to buy it
//req - resources you just need to have to buy it, can also be other buildings or techs
//gather - resoruces to acquire per second, can use resource types too
//convert - array of conversion objects {'from':{resourcelist},'to':{resourcelist},'every':x,'chance':y}
//  every x seconds tries to use up as many sets of 'from' as there are buildings owned
//  gives you a corresponding number of 'to' sets, but if 'chance' is set then it fails and gives nothing y percent of the time
//upkeep - resources you need per second to keep the building, works sort of like convert, destroying only enough to satisfy the inadequate resource
//provide - resources the building passively adds as long as you have it
//enroll - buildings that it will continue to try to make until at least that many exist
//onTick(dt) - function to execute every game tick, dt is time, in seconds, since the last tick
//onBuy(amount) - function to execute any time one of these are bought, doesn't fire on a forceBuy (like when the game loads)
//onSell(amount) - function to execute any time one of these are sold
//onDie(amount) - function to execute any time one of these dies
//
    new Colony.Building({
        'name':'surveyor',
        'unlocked':1,
        'staffed':1,
        'use':{
            'population' : 1
        },
        'gather':{
            'forage' : 0.1,
            'animal' : 0.02
        },
        'desc':'Basic exploration staff to collect samples'
    });
    new Colony.Building({
        'name' : 'quartermaster',
        'unlocked':1,
        'staffed':1,
        'use' : {
            'population' : 1
        },
        'convert' : [
           {'from' : {'berry':5},
            'to' : {'ration':1},
            'every':3},
           {'from' : {'flower':4},
            'to' : {'ration':1},
            'every':5},
           {'from' : {'rock':4},
            'to' : {'ration':1},
            'every':1},
           {'from' : {'stone':5},
            'to' : {'ration':2},
            'every':3}
        ],
        'desc':'Processes samples for upload and keeps the team supplied'
    });
    new Colony.Building({
        'name' : 'researcher',
        'staffed':1,
        'use' : {
            'population' : 1
        },
        'gather':{
            'data': 0.1
        },
        'upkeep':{
            'food':0.05
        },
        'desc':'Intensely studies anything your surveyors bring in'
    });
    new Colony.Building({
        'name' : 'miner',
        'staffed':1,
        'use' : {
            'population' : 1
        },
        'gather':{
            'basic-earth': 0.05
        },
        'upkeep':{
            'food':0.1
        },
        'desc':'Extracts valuable minerals for sale or study'
    });
    new Colony.Building({
        'name' : 'engineer',
        'staffed':1,
        'use' : {
            'population' : 1
        },
        'convert' : [
           {'from' : {'soil':25,'materials':10},
            'to' : {'structure':1},
            'every':10}
        ],
        'upkeep':{
            'food':0.1
        },
        'desc':'Versatile builders necessary to build anything substantial'
    });

    new Colony.Building({
        'name': 'greenhouse',
        'cost': {
            'bush': 40,
            'soil' : 10
        },
        'gather':{
            'basic-plant': 0.01
        },
        'desc':'Grows a variety of native plants'
    });
    new Colony.Building({
        'name': 'shuttle',
        'displayName': 'Grounded Shuttle',
        'cost': {
            'bush': 60,
            'soil' : 10
        },
        'provide': {'housing':2},
        'gather': {
            'population' : 0.05
        },
        
        'desc':'Brings in more people and gives them somewhere to sleep between flights'
    });
    new Colony.Building({
        'name':'ranch',
        'req':{
            'domestication':1,
            'husbandry':1
        },
        'cost':{
            'bush':50,
            'materials':10,
            'soil':30
        },
        'convert':[
            {'from' : {'bovid':2},
            'to' : {'bovid':3},
            'every':10},
            {'from' : {'cow':2},
            'to' : {'cow':3},
            'every':10},
            {'from' : {'goat':2},
            'to' : {'goat':3},
            'every':10},
            {'from' : {'ferae':2},
            'to' : {'ferae':3},
            'every':20}
        ],
        'desc':"Raises animals, but they'll die without flowers to eat",
        'onTick': function(dt){
            var count = this.amount,
                amt = 0.05 * count * dt * Colony.resByName['flower'].efficiency;
                while(amt > Colony.resByName['flower'].amount){
                    amt -= 3 * dt;
                    count -= 1;
                }
            if(count < 0) count = 0;
            if(amt < 0) amt = 0;
            Colony.resByName['flower'].spend(amt);
            if(count != this.amount){
                Colony.resByName['livestock'].spend(Math.max(0,this.amount - count));
            }
        }
    });
    new Colony.Building({
        'name':'methane well',
        'displayName':'Methane Well',
        'cost':{
            'materials':50
        },
        'gather':{
            'fuel':0.5
        },
        'desc':'Extracts fuel to vital to expand the colony'
    });
    new Colony.Building({
        'name':'methplant',
        'displayName':'Combustion Power Plant',
        'recycled':1,
        'use':{
            'structure':5
        },
        'cost':{
            'materials':100
        },
        'upkeep':{
            'fuel':1
        },
        'provide':{
            'energy':50
        },
        'desc':'Burns fuel to provide a source of power'
    });
    new Colony.Building({
        'name':'simplehouse',
        'displayName':'Small Dwelling',
        'use':{
            'structure':1,
            'energy':5
        },
        'cost':{
            'bush':100,
            'materials':20
        },
        'provide':{
            'housing':8
        }
    });
    new Colony.Building({
        'name':'refinery',
        'use':{
            'structure':5,
            'energy':15
        },
        'cost':{
            'materials':120,
        },
        'convert':[{
            'from':{'rock':20},
            'to':{ 
                [Colony.story.mineralOrder[0]] : 9,
                [Colony.story.mineralOrder[1]] : 7,
                [Colony.story.mineralOrder[2]] : 4,
                [Colony.story.mineralOrder[3]] : 3
            },
            'every':10
        }]
    });

//TECHNOLOGY    
    function SetGroup(res,parent){
        var r = Colony.resByName[res],
            p = Colony.resByName[parent];
        if(!r || !p)return;
        return function(){ r.parent = parent; Colony.resConsolodate();};
    }
    function Rename(res,name,edit){
        var r = Colony.resByName[res];
        if(!r)return;
        return function(){
            if(edit)r.editable = true;
            r.rename(name);
        };
    }
    function AddMult(res,n){
        var r = Colony.resByName[res]||Colony.buildsByName[res];
        if(!r)return;
        return function(){ r.multiplier *= n; };
    }
    function SetMult(res,n){
        var r = Colony.resByName[res];
        if(!r)return;
        return function(){ r.multiplier = n; };
    }
    function AddEff(res,n){
        var r = Colony.resByName[res];
        if(!r)return;
        return function(){ r.efficiency *= n; };
    }
    function Log(message,flag){
        return function(){ Colony.log(message,flag); };
    }
    function AddUpkeep(build,res,amount){
        var b = Colony.buildsByName[build],
            r = Colony.resByName[res];
        if(!r || !b)return;
        return function(){ b.upkeep[res] = amount; }
    }

    new Colony.Tech({
        'name':'basic survey',
        'displayName': 'Basic Survey',
        'unlocked':1,
        'cost':{
            'bush': 10,
            'flower': 5,
            'stone': 2
        },
        'desc':'Evaluate the area for any useful resources',
        'unlock':['altfood','prospecting','researcher','habitation']
    });
    new Colony.Tech({
        'name':'habitation',
        'cost':{
            'bush': 50,
            'rock': 15,
            'food': 50
        },
        'desc':'Little more than a clearing for shuttles, civilization must start somewhere',
        'unlock':['shuttle']
    });
    new Colony.Tech({
        'name':'altfood',
        'displayName': 'Alternative foods',
        'cost':{
            'fruit': 30,
            'data': 5
        },
        'desc':'Study local flora for anything edible',
        'effects':[
            SetGroup('fruit','food'),
            AddEff('food',1.1),
            Log('Colonists grumble about rationing with so much food around')
        ],
        'unlock':['xenobotany','edaphology']
    });
    new Colony.Tech({
        'name':'prospecting',
        'cost':{
            'rock': 10,
            'data': 5
        },
        'effects':[AddMult('rock',1.05)],
        'desc':'Initial surveying revealed valuable minerals, some dedicated searching will reveal veins',
        'unlock':['miner','geophysics']
    });
    new Colony.Tech({
        'name':'xenobotany',
        'displayName': 'Xenobotany',
        'cost':{
            'fruit': 20,
            'bush': 30,
            'data':15
        },
        'desc':'Develop a classification system for the native plant life',
        'effects':[
            Rename('fruit','Azure Currant',1),
            Rename('bush','Cotton Pine',1),
            Rename('berry','Emerald Grape',1),
            Rename('flower','Catawaba Blossom',1),
            SetGroup('berry','food')
        ],
        'unlock':['greenhouse']
    });
    new Colony.Tech({
        'name':'edaphology',
        'cost':{
            'data': 20
        },
        'desc':"Local plants thrive in what appear to be rich soils. Gathering some is essential for cultivation.",
        'unlock':['miner','foundations','zoology']
    });
    new Colony.Tech({
        'name':'zoology',
        'displayName':'Native Zoology',
        'cost':{
            'flower':50,
            'data':10
        },
        'desc':"Local wildlife has caught the curiosity of some colonists, your survey teams should be able to capture some.",
        'effects':[
            SetMult('ferae',1),
            SetMult('bovid',1),
            SetGroup('bovid','food'),
            SetGroup('ferae','food')
        ],
        'unlock':['domestication','husbandry','taxonomy']
    });
    new Colony.Tech({
        'name':'domestication',
        'displayName':'Docile Epigenetics',
        'cost':{
            'bovid':2,
            'data':20
        },
        'desc':"Fast-track domestication for the native bovids",
        'effects':[
            AddMult('bovid',1.3)
        ],
        'unlock':['ranch']
    });
    new Colony.Tech({
        'name':'husbandry',
        'displayName':'Embryo Transfer',
        'cost':{
            'bovid':10,
            'data':30
        },
        'desc':"Long-term domestication will require modern husbandry techniques",
        'unlock':['ranch']
    });
    new Colony.Tech({
        'name':'taxonomy',
        'req':{
            'ferae':1,
            'bovid':1
        },
        'cost':{
            'data':40
        },
        'desc':"Snappier names might increase interest in the local ecosystem",
        'effects':[
            Rename('ferae','',1),
            Rename('bovid','',1)
        ]
    });
    new Colony.Tech({
        'name':'geophysics',
        'cost':{
            'rock': 20,
            'data':20
        },
        'desc':'Surface veins are shallow, detailed studies of the planet are needed to find rich deposits',
        'effects':[
            AddMult('rock',1.1),
            Log('Extensive mapping has reveal rich deposits nearby')
        ],
        'unlock':['foundations','fuel extraction','mineadmin']
    });
    new Colony.Tech({
        'name':'mineadmin',
        'displayName':'Mining Administration',
        'req':{
            'miner':10
        },
        'cost':{
            'rock': 40,
            'data': 30
        },
        'desc':"Systematic oversight will improve mining yields and open new areas of study",
        'effects':[
            AddMult('miner',1.3)
        ],
        'unlock':['openpit','shaftdevelopment','orewarehouse']
    });
    new Colony.Tech({
        'name':'orewarehouse',
        'displayName': 'Mining Admin Depot',
        'req':{
            'miner':20
        },
        'cost':{
            'materials':100,
            'bush':50
        },
        'effects':[
            AddMult('miner',1.1)
        ],
        'desc':"We should construct a central warehouse and processing facility to improve coordination",
        'unlock':['metallurgy']
    });
    new Colony.Tech({
        'name':'metallurgy',
        'displayName':'Refining Facilities',
        'cost':{
            'rock':140,
            'fuel':40,
            'data':50
        },
        'desc':"Raw ore has little value off-world and refined materials will be more efficient to build with.",
        'effects':[
            SetGroup('aluminium','materials'),
            SetGroup('iron','materials'),
            SetGroup('copper','materials'),
            SetGroup('zinc','materials'),
        ],
        'unlock':['refinery']
    });
    new Colony.Tech({
        'name':'openpit',
        'displayName':'Strip Mine',
        'req':{
            'methplant':1
        },
        'cost':{
            'materials':150
        },
        'effects':[
            AddMult('miner',1.7),
            AddUpkeep('miner','fuel',2)
        ],
        'desc':"Massive pit mining will greatly improve yields, but miners will require quite a bit of fuel"
    });
    new Colony.Tech({
        'name':'shaftdevelopment',
        'displayName': 'Mine Shaft Development',
        'req':{
            'miner':30
        },
        'cost':{
            'materials':100
        },
        'effects':[
            AddMult('soil',1.2)
        ],
        'desc':"Preparation will improve long-term success of mines"
    });
    new Colony.Tech({
        'name':'foundations',
        'displayName': 'Foundations',
        'cost':{
            'soil':50,
            'rock': 30,
            'data': 20
        },
        'desc':"Solid footing is essential to establishing a permanent foothold on the planet.",
        'effects':[Log('Colonial administrator determined to establish settlement on ' + Colony.story.planetName)],
        'unlock':['engineer','construction']
    });
    new Colony.Tech({
        'name':'fuel extraction',
        'displayName': 'Fuel Extraction',
        'cost':{
            'soil':40,
            'rock': 15,
            'data': 25
        },
        'desc':"Fuel for machinery and rockets has been a significant barrier to growth. Let's fix that.",
        'unlock':['hydrogen mining','methplant','methane well']
    });
    new Colony.Tech({
        'name':'hydrogen mining',
        'displayName': 'Hydrogen Liberation',
        'req':{
            'engineer':3
        },
        'cost':{
            'fuel':50,
            'data':25
        },
        'effects':[
            AddMult('methane well',2)
        ],
        'unlock':['rocketry'],
        'desc':"We can fit our methane wells with equipment to produce pure hydrogen for rocket fuel."
    });
    new Colony.Tech({
        'name':'construction',
        'req':{
            'engineer':2
        },
        'cost':{
            'rock':20,
            'structure':5
        },
        'desc':"Our engineers can start planning for development, starting with housing.",
        'unlock':['simplehouse']
    })
}
Colony.ready = true;