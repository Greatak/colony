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
        Colony.resByName['food'].spend(amt);
        if(count != this.amount){
            this.spend(this.amount - count);
        }
    },
    'onSpend': function(amt){
        var s = (amt == 1)?'Someone ':amt + ' people ';
        Colony.log(s + 'died!','bad');
    }
});
new Colony.Resource({
    'name':'housing',
    'symbol': 'Hs',
    'startAmount': 5,
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
    'name': 'green berry',
    'types' : ['forage','plant']
});
new Colony.Resource({
    'name': 'blue fruit',
    'types' : ['forage','plant']
});
new Colony.Resource({
    'name': 'purple flower',
    'types' : ['forage','plant']
});
new Colony.Resource({
    'name': 'ferrous rock',
    'types' : ['forage','earth']
});
new Colony.Resource({
    'name': 'iridescent stone',
    'types' : ['forage','earth']
});
new Colony.Resource({
    'name': 'thorny bush',
    'types' : ['forage','plant']
});
new Colony.Resource({
    'name':'soil',
    'types' : ['earth']
});

new Colony.Building({
    'name':'surveyor',
    'unlocked':1,
    'use':{
        'population' : 1
    },
    'gather':{
        'forage' : 0.1
    },
    'desc':'Basic exploration staff to collect samples'
});
new Colony.Building({
    'name' : 'comm officer',
    'unlocked':1,
    'use' : {
        'population' : 1
    },
    'convert' : [
       {'from' : {'green berry':5},
        'to' : {'ration':1},
        'every':3},
       {'from' : {'purple flower':4},
        'to' : {'ration':1},
        'every':5},
       {'from' : {'ferrous rock':4},
        'to' : {'ration':1},
        'every':1},
       {'from' : {'iridescent stone':5},
        'to' : {'ration':2},
        'every':3}
    ],
    'desc':'Processes samples for upload and keeps the team supplied'
});
new Colony.Building({
    'name' : 'researcher',
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
    'use' : {
        'population' : 1
    },
    'gather':{
        'earth': 0.05
    },
    'upkeep':{
        'food':0.1
    },
    'desc':'Intensely studies anything your surveyors bring in'
});
new Colony.Building({
    'name': 'greenhouse',
    'cost': {
        'thorny bush': 40,
        'soil' : 10
    },
    'gather':{
        'plant': 0.05
    },
    'desc':'Grows a variety of native plants'
});
new Colony.Building({
    'name': 'shuttle',
    'displayName': 'Grounded Shuttle',
    'cost': {
        'thorny bush': 60,
        'soil' : 10
    },
    'provide': {'housing':3},
    'gather': {
        'population' : 0.05
    },
    
    'desc':'Grows a variety of native plants'
});

function SetGroup(res,parent){
    var r = Colony.resByName[res],
        p = Colony.resByName[parent];
    if(!r || !p)return;
    return function(){ r.parent = parent; Colony.resConsolodate();};
}
function Rename(res,name){
    var r = Colony.resByName[res];
    if(!r)return;
    return function(){ r.displayName = name; };
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
        'thorny bush': 10,
        'purple flower': 5,
        'iridescent stone': 2
    },
    'desc':'Evaluate the area for any useful resources',
    'unlock':['altfood','prospecting','researcher','habitation']
});
new Colony.Tech({
    'name':'habitation',
    'displayName': 'Habitats',
    'cost':{
        'thorny bush': 50,
        'ferrous rock': 15,
        'food': 50
    },
    'desc':'Little more than a clearing for shuttles, civilization must start somewhere',
    'unlock':['shuttle']
});
new Colony.Tech({
    'name':'altfood',
    'displayName': 'Alternative foods',
    'cost':{
        'blue fruit': 30,
        'data': 5
    },
    'desc':'Study local flora to find supplemental foods',
    'effects':[
        SetGroup('blue fruit','food'),
        AddEff('food',1.1),
        Log('The colonists grumble about rationing with so much food around.')
    ],
    'unlock':['xenobotany','edaphology']
});
new Colony.Tech({
    'name':'prospecting',
    'cost':{
        'ferrous rock': 10,
        'data': 5
    },
    'effects':[AddMult('ferrous rock',1.05)],
    'desc':'Initial surveying revealed valuable minerals, some dedicated searching will reveal veins',
    'unlock':['miner','geophysics']
});
new Colony.Tech({
    'name':'xenobotany',
    'displayName': 'Xenobotany',
    'cost':{
        'blue fruit': 20,
        'thorny bush': 30,
        'data':15
    },
    'desc':'Develop a classification system for the native plant life',
    'effects':[
        Rename('blue fruit','Azure Currant'),
        Rename('thorny bush','Cotton Pine'),
        Rename('green berry','Emerald Grape'),
        Rename('purple flower','Catawaba Blossom'),
        SetGroup('green berry','food')
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
        'ferrous rock': 20,
        'data':20
    },
    'desc':'Surface veins are ultimately shallow, detailed studies of the planet are needed to find rich deposits',
    'effects':[
        AddMult('ferrous rock',1.1),
        Log('Extensive mapping has revealed a few iron veins nearby')
    ],
    'unlock':['foundations','fuel extraction']
});
new Colony.Tech({
    'name':'foundations',
    'displayName': 'Foundations',
    'cost':{
        'soil':50,
        'ferrous rock': 30,
        'data': 20
    },
    'desc':"Solid footing is essential to establishing a permanent foothold on the planet",
    'unlock':['engineer','construction']
});

Colony.ready = true;