new Colony.Building({
    'name':'explorer',
    'cost':25,
    'growth':1.5,
    'earn':0.1,
    'unlocked':1,
    'desc':"First wave of colonists, eager to discover what this world holds"
});
new Colony.Building({
    'name':'survey',
    'displayName':'Prospecting Survey',
    'cost':100,
    'otherCost':{
        'explorer':3
    },
    'earn':2,
    'unlocked':1,
    'desc':"Search for mineral veins"
});
new Colony.Building({
    'name':'garden',
    'displayName':'Botanical Expedition',
    'cost':1500,
    'otherCost':{
        'explorer':5
    },
    'earn':10,
    'unlocked':1,
    'desc':"Devote some explorers to cataloguing native life"
});
new Colony.Building({
    'name':'mine',
    'displayName':'Shaft Mine',
    'cost':10000,
    'otherCost':{
        'survey':1
    },
    'earn':100,
    'desc':"Industry must begin somewhere"
});

function Moolah(amt){
    return function(){ Colony.earnMoney(amt); };
}
function AddEarn(what,amt){
    var r = Colony.buildsByName[what];
    if(r && amt) return function(){ r.earn += amt; };
}
function AddMultiplier(what,amt){
    var r = Colony.buildsByName[what];
    if(r && amt) return function(){ r.multiplier *= amt; };
}

//TECHNOLOGIES

new Colony.Tech({
    'name':'betterdiet',
    'displayName':'Energy-Rich Diet',
    'cost':100,
    'require':{
        'explorer':5
    },
    'effects':[
        AddEarn('explorer',0.2)
    ],
    'unlocked':1,
    'desc':"Optimized nutrition should let your explorers remain active for longer each day"
});
new Colony.Tech({
    'name':'betterequipment',
    'displayName':'Better Equipment',
    'cost':1000,
    'require':{
        'explorer':25
    },
    'effects':[
        AddMultiplier('explorer',2)
    ],
    'unlocked':1,
    'desc':"Lightweight materials and better tools will make your explorers twice as efficient"
});
new Colony.Tech({
    'name':'cartography',
    'cost':6000,
    'require':{
        'explorer':50
    },
    'effects':[
        AddMultiplier('explorer',2)
    ],
    'unlocked':1,
    'desc':"Survey satellites can provide maps to let your explorers cover more ground"
});
new Colony.Tech({
    'name':'magnetometers',
    'cost':400,
    'require':{
        'survey':5
    },
    'effects':[
        AddEarn('survey',30)
    ],
    'unlocked':1,
    'unlock':['mine'],
    'desc':"Equipping your survey teams with sensitive magnetometers will let them find mineral veins more accurately"
});
new Colony.Tech({
    'name':'geophysics',
    'cost':4000,
    'require':{
        'survey':25
    },
    'effects':[
        AddMultiplier('survey',2)
    ],
    'unlocked':1,
    'desc':"Detailed studies of the planet will provide a better background for future surveys, doubling efficiency"
});
new Colony.Tech({
    'name':'seismology',
    'displayName':'Vertical Seismic Profiling',
    'cost':12000,
    'require':{
        'survey':50
    },
    'effects':[
        AddMultiplier('survey',2)
    ],
    'unlocked':1,
    'desc':"Drilling paired with sensitive seismic monitoring equipment will allow us to map below the surface"
});
new Colony.Tech({
    'name':'xenobotany',
    'cost':9000,
    'require':{
        'garden':5
    },
    'effects':[
        AddEarn('garden',4)
    ],
    'unlocked':1,
    'desc':"Developing a systematic nomenclature will allow for quicker evaluations of native plants"
});
new Colony.Tech({
    'name':'edaphology',
    'cost':90000,
    'require':{
        'garden':25
    },
    'effects':[
        AddMultiplier('garden',2)
    ],
    'unlocked':1,
    'desc':"Studying the soil composition will allow us to grow our own specimens in half the time"
});
new Colony.Tech({
    'name':'alienecology',
    'displayName':'Alien Ecology',
    'cost':270000,
    'require':{
        'garden':50
    },
    'effects':[
        AddMultiplier('garden',2)
    ],
    'unlocked':1,
    'desc':"Understanding the relationships between different species will improve our greenhouse yields"
});
new Colony.Tech({
    'name':'trams',
    'displayName':'Hauler Trams',
    'cost':40000,
    'require':{
        'mine':5
    },
    'effects':[
        AddEarn('mine',300)
    ],
    'unlocked':1,
    'unlock':['mine'],
    'desc':"Fixed infrastructure for moving people and ore around mining facilities reduces operating costs"
});
new Colony.Tech({
    'name':'stableshaft',
    'displayName':'Shaft Stabilization',
    'cost':400000,
    'require':{
        'mine':25
    },
    'effects':[
        AddMultiplier('mine',2)
    ],
    'unlocked':1,
    'desc':"Modular framework for structural supports allows mining to progress faster and reach deeper"
});
new Colony.Tech({
    'name':'telerobotics',
    'cost':1200000,
    'require':{
        'mine':50
    },
    'effects':[
        AddMultiplier('mine',2)
    ],
    'unlocked':1,
    'desc':"Robotic miners can operate with limited safety considerations and need less infrastructure to support"
});

//MODAL EVENTS

new Colony.Event({
    'name':'startuphelp',
    'displayName':'Startup Capital',
    'modal':1,
    'content':'The Colonial Development Consortium is a little disappointed but eager to help you get started with a little startup money.',
    'buttons':[{'text':'Accept','effect':Moolah(20)}],
    'require':{
        'totalMoney':-100,
        'time':-600
    },
    'chance':1
});
new Colony.Event({
    'name':'startupfailure',
    'displayName':'Startup Disaster',
    'modal':1,
    'content':'A colony start up going this badly looks bad for all involved. Your investors are upset and demanding something to show for it.',
    'buttons':[{'text':'Accept','effect':Moolah(-20)}],
    'require':{
        'totalMoney':-100,
        'time':500
    },
    'chance':1
});
new Colony.Event({
    'name':'newinvestors',
    'displayName':'New Investors',
    'modal':1,
    'content':'New investors are interested in your colony and have chipped in more money.',
    'buttons':[{'text':'Accept','effect':Moolah(0.5,1)}],
    'require':{
        'time':500
    },
    'chance':0.5
});

//TICKER EVENTS

new Colony.Event({
    'name':'thornybush',
    'ticker':1,
    'content':{'text':"Botanists slowed by fast-growing thorny underbrush"},
    'require':{ 'garden':1 },
    'chance':2
});
new Colony.Event({
    'name':'veindiscovered',
    'ticker':1,
    'content':{'text':"Survey teams discovered a rich mineral deposit"},
    'require':{ 'survey':1 },
    'chance':2
});
new Colony.Event({
    'name':'mysteriousore',
    'ticker':1,
    'content':{'text':"Mysterious ore in mine baffles geologists"},
    'require':{ 'mine':5 },
    'chance':0.2
});

Colony.ready = true;