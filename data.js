new Colony.Building({
    'bad':1,
    'name':'collapsemine',
    'displayName':'Mine Collapse!',
    'cost':50000,
    'earn':-250,
    'desc':"Miners are trapped and safety concerns impair progress at other sites"
});

new Colony.Building({
    'name':'explorer',
    'group':'staff',
    'cost':25,
    'earn':0.1,
    'unlocked':1,
    'desc':"Basic staff. They might have many different specializations, but you'll need them to do much of anything here."
});
new Colony.Building({
    'name':'survey',
    'displayName':'Prospecting Survey',
    'group':'staff',
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
    'group':'staff',
    'cost':1500,
    'otherCost':{
        'explorer':5
    },
    'earn':10,
    'unlocked':1,
    'desc':"Devote some explorers to cataloguing native life"
});
new Colony.Building({
    'name':'deposit',
    'displayName':'Mineral Deposit',
    'group':'mining',
    'cost':10000,
    'otherCost':{
        'survey':1
    },
    'earn':40,
    'desc':"A profitable mine requires a deposit such as this one under it"
});
new Colony.Building({
    'name':'arable',
    'displayName':'Arable Land',
    'group':'agriculture',
    'cost':25000,
    'otherCost':{
        'garden':1
    },
    'earn':100,
    'desc':"Basic building blocks for agriculture require fertile soil and room to grow"
});
new Colony.Building({
    'name':'shaft',
    'displayName':'Shaft Mine',
    'group':'mining',
    'cost':80000,
    'otherCost':{
        'deposit':1
    },
    'earn':2500,
    'desc':"Targeted excavations limit impact and keep profits high, at the cost of safety risks"
});
new Colony.Building({
    'name':'foundation',
    'displayName':'Development Site',
    'group':'civic',
    'cost':100000,
    'earn':400,
    'desc':"If this colony is to thrive, we must set aside some resources for basic infrastructure and residential development",
});
new Colony.Building({
    'name':'reserve',
    'displayName':'Nature Reserve',
    'group':'agriculture',
    'cost':300000,
    'otherCost':{
        'arable':1
    },
    'earn':{'explorer':0.01},
    'desc':"Protecting the native wildlife will allow us useful research opportunities"
});
new Colony.Building({
    'name':'greenhouse',
    'group':'agriculture',
    'cost':6100000,
    'otherCost':{
        'arable':1
    },
    'earn':{'explorer':0.05},
    'desc':"Imported crops will be more familiar to our colonists, but they require a carefully maintained climate"
});
new Colony.Building({
    'name':'pit',
    'displayName':'Open Pit Mine',
    'group':'mining',
    'cost':96000000,
    'otherCost':{
        'deposit':1
    },
    'earn':3000000,
    'desc':"Quarries offer a safer mining method as well as building materials, with a huge impact on the ground"
});
new Colony.Building({
    'name':'refinery',
    'displayName':'Ore Processing Plant',
    'group':'mining',
    'cost':2500000000,
    'otherCost':{
        'foundation':1
    },
    'earn':50000000,
    'desc':"If we want our colony to advanced past an extractive economy, we need to develop refining capabilities"
});
new Colony.Building({
    'name':'well',
    'displayName':'Methane Well',
    'group':'mining',
    'cost':45000000000,
    'earn':450000000,
    'desc':"A steady fuel supply will allow us to move ahead faster and develop more off-world commerce"
});
//buildings cheaper
new Colony.Building({
    'name':'transportation',
    'displayName':'Street Grid',
    'group':'civic',
    'cost':50000,
    'otherCost':{
        'foundation':1
    },
    'earn':200,
    'morale':-0.01,
    'desc':"To expand beyond the initial prefab housing, we'll need some street infrastructure"
});
//colonists cheaper
new Colony.Building({
    'name':'residence',
    'displayName':'Residential District',
    'group':'civic',
    'cost':50000,
    'otherCost':{
        'foundation':1
    },
    'earn':200,
    'morale':-0.01,
    'desc':"Roughing it might pass for early pioneers, but to attract real talent, we'll need some proper housing"
});
//morale
new Colony.Building({
    'name':'clinic',
    'group':'civic',
    'cost':50000,
    'otherCost':{
        'foundation':1
    },
    'earn':200,
    'morale':-0.01,
    'desc':"Industrial accidents, alien diseases or just checkups, medicine is crucial for keeping things running smoothly"
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

function Moolah(amt,mult){
    return function(){ Colony.earnMoney(amt,mult); };
}
function Chance(event,n){
    return function(){ Colony.eventsByName[event].chance = n; };
}
function AddEarn(what,amt){
    var r = Colony.buildsByName[what];
    if(r && amt) return function(){ r.earn['money'] += amt; };
}
function AddMultiplier(what,amt){
    var r = Colony.buildsByName[what];
    if(r && amt) return function(){ r.multiplier *= amt; };
}
function GiveBuilding(what,amt){
    var r = Colony.buildsByName[what];
    if(r && amt) return function(){ r.buy(amt,1); }
}
function Name(what,name){
    var r = Colony.buildsByName[what];
    if(r && name) return function(){ r.displayName = name; r.element.title.textContent = name; }
}

//TECHNOLOGIES
//generally, a building should have a 5, 25, 50, 100, 200

//explorers
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
    'cost':200,
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
    'cost':2000,
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
//survey
new Colony.Tech({
    'name':'magnetometers',
    'cost':400,
    'require':{
        'survey':5
    },
    'effects':[
        AddEarn('survey',1)
    ],
    'unlocked':1,
    'unlock':['deposit'],
    'desc':"Equipping your survey teams with sensitive magnetometers will let them find mineral veins more accurately",
    'unlockText':"Chemical tests too inaccurate, geologists concerned they can't find anything under thick regolith"
});
new Colony.Tech({
    'name':'geophysics',
    'cost':800,
    'require':{
        'survey':25
    },
    'effects':[
        AddMultiplier('survey',2)
    ],
    'unlocked':1,
    'unlock':['well'],
    'desc':"Detailed studies of the planet will provide a better background for future surveys, doubling efficiency",
    'unlockText':"Broad-scope geophysical surveys would be better use of resources, geologists claim"
});
new Colony.Tech({
    'name':'seismology',
    'displayName':'Vertical Seismic Profiling',
    'cost':8000,
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
//garden
new Colony.Tech({
    'name':'xenobotany',
    'cost':6000,
    'require':{
        'garden':5
    },
    'effects':[
        AddEarn('garden',6)
    ],
    'unlock':['arable'],
    'unlocked':1,
    'desc':"Developing a systematic nomenclature will allow for quicker evaluations of native plants",
    'unlockText':"Botanists eager to study local plant life for novel adaptations"
});
new Colony.Tech({
    'name':'biochemicalmodeling',
    'displayName':'Biochemical Modeling',
    'cost':12000,
    'require':{
        'garden':25
    },
    'effects':[
        AddMultiplier('garden',2)
    ],
    'unlocked':1,
    'desc':"Native organisms can be studied at a genetic level to search for any novel protein structures",
    'unlockText':"Biologists begin project to map native genomes"
});
new Colony.Tech({
    'name':'alienecology',
    'displayName':'Alien Ecology',
    'cost':120000,
    'require':{
        'garden':50
    },
    'effects':[
        AddMultiplier('garden',2)
    ],
    'unlocked':1,
    'desc':"Understanding the relationships between different species will improve yields",
    'unlockText':"Biologists discover symbiotic microbes that could improve crop yields substantially"
});
//deposit
new Colony.Tech({
    'name':'tandemexporation',
    'displayName':'Tandem Exploration',
    'cost':40000,
    'require':{
        'deposit':5
    },
    'effects':[
        AddEarn('deposit',24)
    ],
    'unlock':['shaft'],
    'unlocked':1,
    'desc':"We should assay deposits for valuable secondary resources",
    'unlockText':"Prospecting teams warn administration may overlook secondary deposits"
});
new Colony.Tech({
    'name':'reservedefinition',
    'displayName':'Ore Reserve Definition',
    'cost':80000,
    'require':{
        'deposit':25
    },
    'effects':[
        AddMultiplier('deposit',2)
    ],
    'unlocked':1,
    'desc':"A detailed statistical analysis of deposits will allow us access to greater capital and get the investors off our backs",
    'unlockText':"Colonial investors want guarantees of return, threatening to pull out"
});
new Colony.Tech({
    'name':'biodiscovery',
    'cost':800000,
    'require':{
        'deposit':50
    },
    'effects':[
        AddMultiplier('deposit',2)
    ],
    'unlocked':1,
    'desc':"Specially-designed plants can leech minerals from the soil to reveal deposits with greater sensitivity than chemical assays",
    'unlockText':"New superplants could make prospecting a thing of the past"
});
//arable
new Colony.Tech({
    'name':'edaphology',
    'cost':100000,
    'require':{
        'arable':5
    },
    'effects':[
        AddEarn('arable',60)
    ],
    'unlock':['reserve'],
    'unlocked':1,
    'desc':"Studying the soil composition will allow us to grow our own specimens in half the time",
    'unlockText':"Local plants could be valuable food source, but soil composition is a lingering question"
});
new Colony.Tech({
    'name':'condensers',
    'displayName':'Fog Irrigation',
    'cost':200000,
    'require':{
        'arable':25
    },
    'effects':[
        AddMultiplier('arable',2)
    ],
    'unlocked':1,
    'desc':"Extracting moisture from the night air can provide a reliable source of water",
    'unlockText':"Local aquifers unpredictable, farmers call for condensation to water crops"
});
new Colony.Tech({
    'name':'bioremediation',
    'cost':2000000,
    'require':{
        'arable':50
    },
    'effects':[
        AddEarn('arable',2)
    ],
    'unlocked':1,
    'desc':"Utilizing engineered microbes and fungi, we can enrich the soil and manufacture climates locally",
    'unlockText':"Scientists crack climate control with new gene therapies"
});
//shaft
new Colony.Tech({
    'name':'trams',
    'displayName':'Hauler Trams',
    'cost':320000,
    'require':{
        'shaft':5
    },
    'effects':[
        AddEarn('shaft',1500)
    ],
    'unlocked':1,
    'unlock':['pit'],
    'desc':"Fixed infrastructure for moving people and ore around mining facilities reduces operating costs",
    'unlockText':"Miners tired of lugging ore around by hand in this day and age"
});
new Colony.Tech({
    'name':'stableshaft',
    'displayName':'Shaft Stabilization',
    'cost':1280000,
    'require':{
        'shaft':25
    },
    'effects':[
        AddMultiplier('shaft',2),
        Chance('minecollapse',0)
    ],
    'unlocked':1,
    'desc':"Modular framework for structural supports allows mining to progress faster and reach deeper",
    'unlockText':"String of cave-in scares slows progress at new mine"
});
new Colony.Tech({
    'name':'telerobotics',
    'cost':12800000,
    'require':{
        'shaft':50
    },
    'effects':[
        AddMultiplier('shaft',2)
    ],
    'unlocked':1,
    'desc':"Robotic miners can operate with limited safety considerations and need less infrastructure to support",
    'unlockText':"Injuries and delays due to cave-ins a thing of the past with new advances in robotics"
});
//development
/*new Colony.Tech({
    'name':'fxenobotany',
    'cost':400000,
    'require':{
        'development':5
    },
    'effects':[
        AddEarn('development',240)
    ],
    'unlock':['house'],
    'unlocked':1,
    'desc':"Developing a systematic nomenclature will allow for quicker evaluations of native plants",
    'unlockText':"Botanists eager to study local plantlife for novel adaptations"
});
new Colony.Tech({
    'name':'eddaphology',
    'cost':800000,
    'require':{
        'development':25
    },
    'effects':[
        AddMultiplier('development',2)
    ],
    'unlocked':1,
    'desc':"Studying the soil composition will allow us to grow our own specimens in half the time",
    'unlockText':"Local plants could be valuable food source, but soil composition is a lingering question"
});
new Colony.Tech({
    'name':'alienedcology',
    'displayName':'Alien Ecology',
    'cost':8000000,
    'require':{
        'development':50
    },
    'effects':[
        AddMultiplier('development',2)
    ],
    'unlocked':1,
    'desc':"Understanding the relationships between different species will improve our greenhouse yields",
    'unlockText':"Biologists discover symbiotic microbes that could improve crop yields substantially"
});*/
//reserve
new Colony.Tech({
    'name':'epigenetics',
    'displayName':'Adaptive Epigenetics',
    'cost':1200000,
    'require':{
        'reserve':5
    },
    'effects':[
        AddEarn('reserve',4500)
    ],
    'unlock':['greenhouse'],
    'unlocked':1,
    'desc':"Preliminary results have identified useful native species to develop into cultivars",
    'unlockText':"Biologists optimistic about local agriculture"
});
new Colony.Tech({
    'name':'urbanparks',
    'displayName':'Urban Parks',
    'cost':2400000,
    'require':{
        'reserve':25
    },
    'effects':[
        AddMultiplier('reserve',2)
    ],
    'unlocked':1,
    'desc':"We have the opportunity to introduce native species into our urban spaces",
    'unlockText':"Colonists demand more life in neighborhoods"
});
new Colony.Tech({
    'name':'genesplicing',
    'displayName':'Gene Gardens',
    'cost':24000000,
    'require':{
        'reserve':50
    },
    'effects':[
        AddMultiplier('reserve',2)
    ],
    'unlocked':1,
    'desc':"Improve survivability for colonists and cultivated plants with genetic modifications inspired by local adaptations",
    'unlockText':"Puritans question if geneticists have gone too far with new trials"
});
//greenhouse
new Colony.Tech({
    'name':'solarenergy',
    'displayName':'Solar Collectors',
    'cost':24400000,
    'require':{
        'greenhouse':5
    },
    'effects':[
        AddEarn('greenhouse',90000)
    ],
    'unlocked':1,
    'desc':"With mirrors and satellites, we can channel more sunlight into our greenhouses, allowing them to expand further",
    'unlockText':"Farmers blame lack of sunlight for low yields"
});
new Colony.Tech({
    'name':'airgenerators',
    'displayName':'Atmospheric Replacement',
    'cost':48800000,
    'require':{
        'greenhouse':25
    },
    'effects':[
        AddMultiplier('greenhouse',2)
    ],
    'unlocked':1,
    'desc':"Imported crops do not grow optimally with native air, better filters and processing can alleviate this issue",
    'unlockText':"Bad air slowing greenhouse development"
});
new Colony.Tech({
    'name':'ecoreplace',
    'displayName':'Ecosystem Engineering',
    'cost':488000000,
    'require':{
        'greenhouse':50
    },
    'effects':[
        AddMultiplier('greenhouse',2)
    ],
    'unlocked':1,
    'desc':"Clever greenhouse design and extensive use of atmospheric conditioning can allow us to build large, open-air farms",
    'unlockText':"Protests delay first steps to terraforming"
});
//pit
new Colony.Tech({
    'name':'megadiggers',
    'displayName':'Bucket Wheel Excavators',
    'cost':384000000,
    'require':{
        'pit':5
    },
    'effects':[
        AddEarn('pit',1800000)
    ],
    'unlocked':1,
    'desc':"Explosives and tractors can only get so far, bring in some heavy equipment to get things going",
    'unlockText':"Investors offer to pay for better mining tools"
});
new Colony.Tech({
    'name':'faultmapping',
    'displayName':'Fault Mapping',
    'cost':768000000,
    'require':{
        'pit':25
    },
    'effects':[
        AddMultiplier('pit',2)
    ],
    'unlocked':1,
    'desc':"The landslides plague quarry operations could be prevented with more in depth surveys",
    'unlockText':"Miners threaten to strike if landslides not stopped"
});
new Colony.Tech({
    'name':'ribboncutting',
    'displayName':'Ribbon Drive Excavation',
    'cost':7680000000,
    'require':{
        'pit':50
    },
    'effects':[
        AddMultiplier('pit',2)
    ],
    'unlocked':1,
    'desc':"FTL drives can atomize and skim off rock much faster than conventional methods",
    'unlockText':"Bad quarter prompts investors authorize unorthodox excavation tactics"
});
//refinery
/*new Colony.Tech({
    'name':'xenqobotany',
    'cost':9000,
    'require':{
        'garden':5
    },
    'effects':[
        AddEarn('garden',4)
    ],
    'unlocked':1,
    'desc':"Developing a systematic nomenclature will allow for quicker evaluations of native plants",
    'unlockText':"Botanists eager to study local plantlife for novel adaptations"
});
new Colony.Tech({
    'name':'edaphqology',
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
    'name':'alieneqcology',
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
//well
new Colony.Tech({
    'name':'xenobqotany',
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
    'name':'edapqhology',
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
    'name':'aliewnecology',
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
});*/

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

new Colony.Event({
    'name':'newsettlers',
    'displayName':'New Colonists',
    'modal':1,
    'content':'A recent news bulletin about your colony has attracted attention and a group of independent colonists have arrived, looking for their fortune.',
    'buttons':[{'text':'Welcome Aboard','effect':GiveBuilding('explorer',5)}],
    'require':{
        'explorer':-30
    },
    'chance':1
});

new Colony.Event({
    'name':'minecollapse',
    'displayName':'Mine Collapse!',
    'modal':1,
    'content':"<p>Overeager mining crews ignited a methane pocket and triggered a cave-in at one of our mines. They managed to get to an emergency shelter, but they can't stay down there forever. Our engineers have assessed the collapse and tell me it hasn't compromised the structure so we should be able to excavate without complication. They've put together two plans for your consideration:</p><p><b>Plan A:</b> If we've got a prospecting team and "+Colony.currency+"40,000, we can blast through the debris and get them out. If we do this, most of the prospecting team will stay on while we rebuild the mine.</p><p><b>Plan B:</b> Otherwise, they say it'll cost almost as much as a new mine if we let the rubble settle but you can safely deal with it without any more personnel.",
    'buttons':[
        {'text':'Plan A','effect':function(){
            if(Colony.buildsByName['survey'].amount == 0) return true;
            Colony.earnMoney(-40000);
            Colony.buildsByName['survey'].sell(1,1);
            Colony.buildsByName['explorer'].buy(1,1);
        }},
        {'text':'Plan B','effect':function(){Colony.buildsByName['collapsemine'].buy(1,1);}}
    ],
    'require':{
        'shaft':1
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