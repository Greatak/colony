function loadData(){
    new Colony.Resource({   //adapting to the native ecosystem
        'name':'harmony',
        'meta':1
    });
    new Colony.Resource({   //support from corporate investors
        'name':'support',
        'meta':1,
        'startAmount':100
    });
    new Colony.Resource({
        'name' : 'population',
        'symbol' : 'Ppl',
        'startAmount' : 5,
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
                    "Not every expedition is successful, but they should always teach us something. Maybe it's worth another go?",
                    [{'text':'Try Again','effect':function(){ Colony.wipeSave(); location.reload(); }}]
                )
            }
        }
    });
    new Colony.Resource({
        'name':'housing',
        'symbol': 'Hs',
        'startAmount': 5,
        'cat':'primary'
    });
    new Colony.Resource({
        'name':'structure',
        'symbol':'St',
        'cat':'primary'
    });
    new Colony.Resource({
        'name': 'data',
        'cat': 'primary'
    })

    new Colony.Resource({
        'name' : 'food',
        'symbol' : 'Fd',
        'cat' : 'primary'
    });
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
        'types' : ['forage','basic-earth']
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
        'types' : ['basic-earth']
    });
    new Colony.Resource({
        'name':'ferae',
        'types' : ['animal']
    });
    new Colony.Resource({
        'name':'bovid',
        'types' : ['animal']
    });

    new Colony.Building({
        'name':'surveyor',
        'unlocked':1,
        'staffed':1,
        'use':{
            'population' : 1
        },
        'gather':{
            'forage' : 0.1
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
            'data': 0.05
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
        'desc':'Extracts valuable minerals for sale or study, also produces quite a bit of dirt as a byproduct'
    });
    new Colony.Building({
        'name' : 'engineer',
        'staffed':1,
        'use' : {
            'population' : 1
        },
        'convert' : [
           {'from' : {'soil':25,'rock':10},
            'to' : {'structure':1},
            'every':10}
        ],
        'upkeep':{
            'food':0.1
        },
        'desc':'Versatile builders to transform the raw landscape into a sprawling metropolis, with time'
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
        'provide': {'housing':3},
        'gather': {
            'population' : 0.05
        },
        
        'desc':'Brings in more people and gives them somewhere to sleep between flights'
    });

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
        var r = Colony.resByName[res];
        if(!r)return;
        return function(){ r.multipler *= n; };
    }
    function AddEff(res,n){
        var r = Colony.resByName[res];
        if(!r)return;
        return function(){ r.efficiency *= n; };
    }
    function Log(message,flag){
        return function(){ Colony.log(message,flag); };
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
        'displayName': 'Habitats',
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
        'desc':'Study local flora to find supplemental foods',
        'effects':[
            SetGroup('fruit','food'),
            AddEff('food',1.1),
            Log('The colonists grumble about rationing with so much food around.')
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
        'displayName': 'Edaphology',
        'cost':{
            'data': 20
        },
        'desc':"Local plants thrive in what appear to be rich soils. Gathering some is essential for cultivation.",
        'unlock':['miner','foundations']
    });
    new Colony.Tech({
        'name':'geophysics',
        'cost':{
            'rock': 20,
            'data':20
        },
        'desc':'Surface veins are ultimately shallow, detailed studies of the planet are needed to find rich deposits',
        'effects':[
            AddMult('rock',1.1),
            Log('Extensive mapping has revealed a few iron veins nearby')
        ],
        'unlock':['foundations','fuel extraction']
    });
    new Colony.Tech({
        'name':'foundations',
        'displayName': 'Foundations',
        'cost':{
            'soil':50,
            'rock': 30,
            'data': 20
        },
        'desc':"Solid footing is essential to establishing a permanent foothold on the planet",
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
        'desc':"Fuel for machinery and rockets has been a significant barrier to growth, fix that",
        'unlock':['methane well']
    });
}
Colony.ready = true;