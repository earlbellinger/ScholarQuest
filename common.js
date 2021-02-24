/* todo: 

names for scholar levels 
notifications for scholar levels? 
new points for scholar levels? (e.g. one for each citation) such as:
    citations * 1
    + hindex  * 100
    + maxcite * 2
    + solo    * 50
    + first   * 100
    + papers  * 100
*/

//const achievs = ['papers', 'citations', 'hindex', 'maxcite', 'first', 'solo']
const achievs = ['papers', 'citations', 'first', 'maxcite', 'solo', 'hindex']
const badgeColors = ['#9e0142', '#4b60b2', '#3695b8', '#92d5bb', '#ff974f', '#fff']
const flips = [0, 0, 0, 1, 1, 1]

// 6*x*(x-1)/2+1
const scholarLevels = [0, 1, 7, 19, 37, 61, 91, 127, 169, 217, 271, 331, 397]
//const scholarTitles = ["Novice", "Starting Scholar", "Apprentice", 
//    "Adept", "Erudite", "Sage", "Master", "Legend"]
const scholarTitles = ["Iron", "Bronze", "Silver", 
    "Gold", "Platinum", "Diamond",
    "Challenger", "Master", "Grandmaster"]

function init() {
    chrome.storage.sync.set(
        {'user':       '',
         'name':       '',
         'citations':   0,
         'hindex':      0,
         'papers':      0,
         'maxcite':     0,
         'solo':        0,
         'first':       0,
         'Acitations': {},
         'Ahindex':    {},
         'Apapers':    {},
         'Amaxcite':   {},
         'Asolo':      {},
         'Afirst':     {},
         'dark':        0,
         'firstLoad':   1,
        },
        openScholar()
    );
}

function openScholar() {
    url = "https://scholar.google.com/citations?cstart=0&pagesize=10000"
    chrome.tabs.create({'url': url});
}

//citationLevels = [ 1, 10, 100, 1000, 10000, 100000, 1000000]
const citationAchievements = [{
        "title": "Joined the Conversation",
        "description": "Get your first citation",
        "amount": 1, 
    }, {
        "title": "Not Just a Footnote",
        "description": "Get cited 10 times",
        "amount": 10, 
    }, {
        "title": "Kind of a Big Deal",
        "description": "Get cited 100 times",
        "amount": 100, 
    }, {
        "title": "People Know Me",
        "description": "Get cited 1,000 times",
        "amount": 1000, 
    }, {
        "title": "Academic Rockstar",
        "description": "Get cited 10,000 times",
        "amount": 10000, 
    }, {
        "title": "Household Name",
        "description": "Get cited 100,000 times",
        "amount": 100000, 
    }, {
        "title": "Academic Millionaire",
        "description": "Get a million citations",
        "amount": 1000000, 
    }
]

//maxciteLevels  = [10, 50, 100,  200,   500, 1000, 10000, 100000]
const maxciteAchievements = [{
        "title": "Not for Naught",
        "description": "Get 10 citations on one paper",
        "amount": 10, 
    }, {
        "title": "A Useful Contribution",
        "description": "Get 50 citations on one paper",
        "amount": 50, 
    }, {
        "title": "Important Work",
        "description": "Get 100 citations on one paper",
        "amount": 100, 
    }, {
        "title": "Widely Used",
        "description": "Get 200 citations on one paper",
        "amount": 200, 
    }, {
        "title": "A Staple of the Field",
        "description": "Get 500 citations on one paper",
        "amount": 500, 
    }, {
        "title": "C.R.E.A.M.",
        "description": "Get 1,000 citations on one paper",
        "amount": 1000, 
    }, {
        "title": "Landmark Work",
        "description": "Get 10,000 citations on one paper",
        "amount": 10000, 
    }, {
        "title": "Common Knowledge",
        "description": "Get 100,000 citations on one paper",
        "amount": 100000, 
    }
]

//paperLevels    = [ 1, 2, 5, 10, 25, 50, 100, 200, 500, 1000, 10000]
const paperAchievements = [{
        "title": "The Journey Begins",
        "description": "Publish your first paper",
        "amount": 1, 
    }, {
        "title": "Not a One-Time Thing",
        "description": "Publish your second paper",
        "amount": 2, 
    }, {
        "title": "Level Up!",
        "description": "Publish five papers",
        "amount": 5, 
    }, {
        "title": "Hang Ten",
        "description": "Publish ten papers",
        "amount": 10, 
    }, {
        "title": "25 to Life",
        "description": "Publish 25 papers",
        "amount": 25, 
    }, {
        "title": "Perish Elixir",
        "description": "Publish 50 papers",
        "amount": 50, 
    }, {
        "title": "Prolific",
        "description": "Publish 100 papers",
        "amount": 100, 
    }, {
        "title": "",
        "description": "Publish 250 papers",
        "amount": 250, 
    }, {
        "title": "",
        "description": "Publish 500 papers",
        "amount": 500, 
    }, {
        "title": "",
        "description": "Publish 1,000 papers",
        "amount": 1000, 
    }
]

//firstLevels    = [1, 2, 5, 10, 15, 25, 50, 100, 250, 1000]
const firstAchievements = [{
        "title": "Scribe",
        "description": "Publish a paper as first author",
        "amount": 1, 
    }, {
        "title": "Sophomore Slump or Comeback of the Year",
        "description": "Publish two papers as first author",
        "amount": 2, 
    }, {
        "title": "Not a Fluke",
        "description": "Publish five papers as first author",
        "amount": 5, 
    }, {
        "title": "Getting Good At This",
        "description": "Publish ten papers as first author",
        "amount": 10, 
    }, {
        "title": "Me et al.",
        "description": "Publish 25 papers as first author",
        "amount": 25, 
    }, {
        "title": "Me First and the Gimme Gimmes",
        "description": "Publish 50 papers as first author",
        "amount": 50, 
    }, {
        "title": "Prolific",
        "description": "Publish 100 papers as first author",
        "amount": 100, 
    }, {
        "title": "Lifetime of Work",
        "description": "Publish 250 papers as first author",
        "amount": 250, 
    }, {
        "title": "Unstoppable",
        "description": "Publish 1,000 papers as first author",
        "amount": 1000, 
    }
]

//soloLevels    = [1, 2, 5, 10, 15, 25, 50, 100, 250, 1000]
const soloAchievements = [{
        "title": "Flying Solo",
        "description": "Publish alone",
        "amount": 1, 
    }, {
        "title": "Me, Myself, and I",
        "description": "Publish three times as sole author",
        "amount": 3, 
    }, {
        "title": "Redefining 'Bachelor of Science'",
        "description": "Publish ten times as sole author",
        "amount": 10, 
    }, {
        "title": "No Need For Friends",
        "description": "Publish 25 times as sole author",
        "amount": 25, 
    }, {
        "title": "Keep Out My Way, I've Work to Do",
        "description": "Publish 50 times as sole author",
        "amount": 50, 
    }, {
        "title": "Hermit",
        "description": "Publish 100 times as sole author",
        "amount": 100, 
    }, {
        "title": "Scholarship Solitude",
        "description": "Publish 250 times as sole author",
        "amount": 250, 
    }, {
        "title": "Unparalleled Dedication",
        "description": "Publish 1,000 times as sole author",
        "amount": 1000, 
    }
]

//hindexLevels   = [ 2,   5,   10,    15,   25,  50, 75, 100, 200, 300, 500]
const hindexAchievements = [{
        "title": "Two for Two",
        "description": "Publish two papers with at least two citations each",
        "amount": 2, 
    }, {
        "title": "Five for Five",
        "description": "Publish five papers with at least five citations each",
        "amount": 5, 
    }, {
        "title": "Double-double",
        "description": "Publish ten papers with at least ten citations each",
        "amount": 10, 
    }, {
        "title": "Citation Hunter",
        "description": "Get 15 citations on 15 papers",
        "amount": 15, 
    }, {
        "title": "Give No Quarter",
        "description": "Get 25 citations on 25 papers",
        "amount": 25, 
    }, {
        "title": "50/50",
        "description": "Get 50 citations on 50 papers",
        "amount": 50, 
    }, {
        "title": "75 Good Ones",
        "description": "Get 75 citations on 75 papers",
        "amount": 75, 
    }, {
        "title": "Triple-double",
        "description": "Get 100 citations on 100 papers",
        "amount": 100, 
    }
]

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color, dark) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 0.66;
    
    if (color != '#fff') {
        ctx.lineTo(x1, y1);
    }
    ctx.strokeStyle = dark ? '#2b2b2b' : '#000';
    ctx.stroke();
}

function sierpinski(ctx, x1, y1, x2, y2, x3, y3, n, dark, colorBit=1, baseColor='#990000') {
    if(n > 0) {     
        var x12 = (x1 + x2)/2;
        var y12 = (y1 + y2)/2;
        var x23 = (x2 + x3)/2;
        var y23 = (y2 + y3)/2;
        var x31 = (x3 + x1)/2;
        var y31 = (y3 + y1)/2;
        
        //var color = (colorBit) ? (dark ? '#ebebeb' : '#333') : '#990000' 
        var color 
        if (colorBit) {
            if (dark) {
                color = baseColor //'#ebebeb'
            } else {
                color = '#333'
            }
        } else {
            if (dark) {
                color = '#333'//'#ebebeb'
            } else {
                color = baseColor 
            }
        }
        
        drawTriangle(ctx, x31, y31, x12, y12, x23, y23, color, dark);
        sierpinski(ctx, x1, y1, x12, y12, x31, y31, n-1, dark, !colorBit, baseColor);
        sierpinski(ctx, x2, y2, x12, y12, x23, y23, n-1, dark, !colorBit, baseColor);
        sierpinski(ctx, x3, y3, x31, y31, x23, y23, n-1, dark, !colorBit, baseColor);
    }
}
