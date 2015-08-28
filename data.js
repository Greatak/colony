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
    'name':'farm',
    'cost':10000,
    'growth':1.3,
    'otherCost':{
        'garden':1
    },
    'earn':50,
    'desc':"Put those botanical samples to use. Some of them are edible; others we can export",
    'onBuy':function(amt){ Colony.buildsByName['explorer'].offsetAmount += amt; },
    'onSell':function(amt){ Colony.buildsByName['explorer'].offsetAmount -= amt; }
});
new Colony.Building({
    'name':'mine',
    'displayName':'Shaft Mine',
    'cost':50000,
    'otherCost':{
        'survey':1
    },
    'earn':200,
    'desc':"Industry must begin somewhere"
});

/*todo:
//some buildings make colonists cheaper
//some buildings make others more efficient
//some improve morale
//some reduce independence
//most just make money
    refinery
    methane well
    steel foundry
    alumina plant
    copper refining
    housing
    clinic
    medical research
    farms
    aeroponic towers
    factories
    launch facilities
    space elevator
    high rises
    civic centers
    museums
    zoos
    outposts
    homesteads
    police station
    hospital
    train stations
    laboratory
    ports
    aquaculture
    
//negative buildings
    mine collapse
    wild animal attack
    food shortage
    power failure
    worker strike
    disease outbreak
    riot
    protests
    robot uprising
    earthquake
    rocket crash
    ents
*/

//EFFECT FUNCTIONS

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
//generally, a building should have a 5, 25, 50, 100, 200

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
    'desc':"Optimized nutrition should let your explorers remain active for longer each day",
    'unlockText':"Explorers blame rations for slow progress"
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
    'desc':"Lightweight materials and better tools will make your explorers twice as efficient",
    'unlockText':"Equipment bid promises lighter loads, easier expeditions"
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
    'desc':"Survey satellites can provide maps to let your explorers cover more ground",
    'unlockText':"Topographic maps would help progress, explorers say"
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
    'desc':"Equipping your survey teams with sensitive magnetometers will let them find mineral veins more accurately",
    'unlockText':"Chemical tests too inaccurate, geologists concerned they can't find anything under thick regolith"
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
    'desc':"Detailed studies of the planet will provide a better background for future surveys, doubling efficiency",
    'unlockText':"Broad-scope geophysical surveys would be better use of resources, geologists claim"
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
    'desc':"Drilling paired with sensitive seismic monitoring equipment will allow us to map below the surface",
    'unlockText':"New equipment could let mines find deeper deposits, more accurately"
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
    'unlock':['farm'],
    'unlocked':1,
    'desc':"Developing a systematic nomenclature will allow for quicker evaluations of native plants",
    'unlockText':"Botanists eager to study local plantlife for novel adaptations"
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
    'desc':"Studying the soil composition will allow us to grow our own specimens in half the time",
    'unlockText':"Local plants could be valuable food source, but soil composition is a lingering question"
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
    'desc':"Understanding the relationships between different species will improve our greenhouse yields",
    'unlockText':"Biologists discover symbiotic microbes that could improve crop yields substantially"
});
new Colony.Tech({
    'name':'rotation',
    'displayName':'Crop Rotation',
    'cost':40000,
    'require':{
        'farm':5
    },
    'effects':[
        AddEarn('farm',50)
    ],
    'unlocked':1,
    'desc':"The new species require some study to establish crop rotation practices",
    'unlockText':"Nutrient cycles for native plants unknown, hampering local agriculture"
});
new Colony.Tech({
    'name':'condensers',
    'displayName':'Fog Irrigation',
    'cost':400000,
    'require':{
        'farm':25
    },
    'effects':[
        AddMultiplier('farm',2)
    ],
    'unlocked':1,
    'desc':"Extracting moisture from the night air can provide a reliable source of water",
    'unlockText':"Local aquifers unpredictable, farmers call for condensation to water crops"
});
//todo: native or imported variety decision
new Colony.Tech({
    'name':'genegarden',
    'displayName':'Adaptive Epigenetics',
    'cost':1200000,
    'require':{
        'farm':50
    },
    'effects':[
        AddMultiplier('farm',2)
    ],
    'unlocked':1,
    'desc':"Local flora has proven fruitful, but it's still hard to compete with offworld yields",
    'unlockText':"Scientists experiment with new cultivars to improve farm yield"
});
new Colony.Tech({
    'name':'trams',
    'displayName':'Hauler Trams',
    'cost':100000,
    'require':{
        'mine':5
    },
    'effects':[
        AddEarn('mine',300)
    ],
    'unlocked':1,
    'unlock':['mine'],
    'desc':"Fixed infrastructure for moving people and ore around mining facilities reduces operating costs",
    'unlockText':"Miners tired of lugging ore around by hand in this day and age"
});
new Colony.Tech({
    'name':'stableshaft',
    'displayName':'Shaft Stabilization',
    'cost':1000000,
    'require':{
        'mine':25
    },
    'effects':[
        AddMultiplier('mine',2)
    ],
    'unlocked':1,
    'desc':"Modular framework for structural supports allows mining to progress faster and reach deeper",
    'unlockText':"String of cave-in scares slows progress at new mine"
});
new Colony.Tech({
    'name':'telerobotics',
    'cost':3000000,
    'require':{
        'mine':50
    },
    'effects':[
        AddMultiplier('mine',2)
    ],
    'unlocked':1,
    'desc':"Robotic miners can operate with limited safety considerations and need less infrastructure to support",
    'unlockText':"Injuries and delays due to cave-ins a thing of the past with new advances in robotics"
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