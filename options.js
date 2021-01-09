chrome.storage.onChanged.addListener(function(changes, namespace) {
    location.reload();
});

var settings = ['user', 'name', 'dark']
var achievs = ['papers', 'citations', 'hindex', 'maxcite', 'first', 'solo']
var labels = ['papers', 'citations', 'h-index', 
    'most cited paper', 'first author', 'sole author']
var Adicts = []
for (ii in achievs) Adicts.push('A'+achievs[ii])

const sep = "&nbsp;&nbsp;//&nbsp;&nbsp;"

let badges = document.getElementById('badges');
let res = document.getElementById('scholar');

chrome.storage.sync.get(settings.concat(achievs).concat(Adicts), function(obj) {
    
    if (obj.dark) {
        var head = document.getElementsByTagName('HEAD')[0]
        var link = document.createElement('link')
        link.rel = 'stylesheet'
        link.type = 'text/css'
        link.href = chrome.extension.getURL('optionsDark.css') 
        head.appendChild(link) 
    }
    
    if (obj.user === "") {
        badges.innerHTML = "Visit your Scholar profile to start tracking achievements";
    } else {
        
        // show badges
        for (ii=0; ii<achievs.length; ii++) {
            var Adict = obj[Adicts[ii]]
            if (Adict !== {}) {
                var achiev = achievs[ii]
                makeBadge(achiev, obj[achiev], Adict, labels[ii], obj.dark)
            }
        }
        
        // tally points for scholar level 
        var points = 0
        dicts = [obj.Acitations, obj.Ahindex, obj.Apapers, 
                 obj.Amaxcite, obj.Asolo, obj.Afirst]
        for (ii=0; ii<dicts.length; ii++) {
            if ('points' in dicts[ii]) {
                points += dicts[ii]['points']
            }
        }
        
        // 6*x*(x-1)/2+1
        var scholarLevels = [0, 1, 7, 19, 37, 61, 91, 127, 169, 217, 271, 331, 397]
        var scholarTitles = ["Novice", "Starting Scholar", "Apprentice", 
            "Adept Academic", "Erudite", "Sage", "Master", "Legend"]
        
        var level;
        next = null
        for (level = scholarLevels.length - 1; level >= 0; level--) {
            threshold = scholarLevels[level]
            if (points >= threshold) break;
            next = threshold
        }
        
        document.getElementById('level').innerHTML += 
            "Level "+level+"//"+scholarTitles[level] //"Intrepid Explorer"
        document.getElementById('scholarProgress').innerHTML += 
            "<div id='scholarEXP'>" 
            + (points-threshold)*10 + "/" + (next-threshold)*10
            + " EXP</div>"
            + "<div class='scholarProgressInner' style='width: "
            +   (points-threshold)/(next-threshold)*100
            + "%'></div>"
        
        res.innerHTML = 
            "<input type='checkbox' id='darkMode' name='darkMode' style='height:10px'"
            + (obj.dark > 0 ? "checked" : "") + ">"
            + "Dark mode"
            + sep
            + "Not " + obj.name + "? <a id='areset' href='#'>Change User</a>" 
            + sep
            + res.innerHTML
        
        $(document).on('click', '#areset', () =>
            chrome.runtime.sendMessage("init"));
        $(document).on('click', '#darkMode', () => 
            chrome.storage.sync.set({'dark': !obj.dark}));
    }
});

function showBadge(name, value, Adict, label) {
    if ('level' in Adict) {
        progress = value < Adict.next ? (value/Adict.next)*100 : 100
        progress = progress == 0 ? 1 : progress
        return "<div class='badge' id='" + name + "'>"
            + "  <div class='badgeImage'>"
            + "<canvas id='c" + name + "L'></canvas>"
            + "<canvas id='c" + name + "2'></canvas>"
            + "<canvas id='c" + name + "'></canvas>"
            + "<div id='level'><b>LEVEL "+ Adict.level +"</b></div></div>"
            + "  <div class='badgeContent'>"
            + "    <p><b>" + Adict.title + "</b></p>"
            + "    <p id='achievementDate' title='Achievement Date'>" 
            +        Adict.date 
            + "    </p>"
            + "    <p style='height-34px; vertical-align: bottom'>"+Adict.description+"</p>"
            + "    <div id='badgeBottom' title='Progress to next level'>"
            + "      <div class='progress'>"
            + "        <div class='progressInner' style='"
            + "          width: " + progress + "%'>"
            + "        </div>"
            + "      </div>"
            + "      <div id='nextLevel'>" + label + ": " 
            +          value + "/" + Adict.next 
            + "      </div>"
            + "    </div>"
            + "  </div>"
            + "</div>"
    }
    
    return ""
}

function makeBadge(achiev, value, Adict, label, dark) {
    $('#badges').append(showBadge(achiev, value, Adict, label))
    
    console.log('achiev:', achiev)
    
    var contextDiv = 'c'+achiev
    var c = document.getElementById(contextDiv);
    var ctx = c.getContext('2d');
    c.style.width = 71 + "px"
    c.style.height = 71 + "px"
    var dpr = window.devicePixelRatio || 1;
    var rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    sierpinski(ctx, 
        0, 0, 
        c.width/2, c.height, 
        c.width, 0, 
        Adict.level, dark);
    ctx.textAlign = "center";
    ctx.font = '16px Lato'
    ctx.strokeStyle = dark ? '#121212' : '#ebebeb' 
    ctx.lineWidth = 1.5
    ctx.strokeText(achiev.substr(0,1).toUpperCase(), (c.width/2), c.height/2*0.85)
    
    var contextDiv2 = 'c'+achiev+'2'
    var c2 = document.getElementById(contextDiv2);
    var ctx2 = c2.getContext('2d');
    c2.style.width = 71 + "px"
    c2.style.height = 71 + "px"
    c2.width = rect.width * dpr;
    c2.height = rect.height * dpr;
    ctx2.scale(dpr, dpr);
    sierpinski(ctx2, 
        0, 0, 
        c.width/2, c.height, 
        c.width, 0, 
        Adict.level-1, dark);
    ctx2.textAlign = "center";
    ctx2.font = '16px Lato'
    ctx2.strokeStyle = dark ? '#121212' : '#ebebeb' 
    ctx2.lineWidth = 1.5
    ctx2.strokeText(achiev.substr(0,1).toUpperCase(), (c.width/2), c.height/2*0.85)
    
    var timeout
    var elem = $('#'+contextDiv)
    var elem2 = $('#'+contextDiv+'2')
    function fadeInOut(elem, elem2) {
        elem.fadeOut(1000).fadeIn(1000)
    }
    elem.mouseover(function() {
        fadeInOut(elem, elem2)
        timeout = setInterval(() => fadeInOut(elem, elem2), 2000);
    }).mouseleave(function() {
        clearInterval(timeout)
        elem.stop(true,true).show()
    })
    
    
    /*
    $('#'+contextDiv).hover(function() {
        $('#'+contextDiv).fadeOut(1000)
    }, function() {
        $('#'+contextDiv).stop(true,true).fadeIn(500) //fadeIn(1000)
    })
    */
    
    //$('#'+contextDiv).click(() => alert('hi'))
    
    /*
    $('#'+contextDiv).hover(function() {
        var c = this;
        var ctx = this.getContext('2d');
        while(1) {
            for (ii=0; ii<=Adict.level; ii++) {
                ctx.clearRect(0, 0, c.width, c.height)
                sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
                        ii, dark);
                //ctx.save()
            }
            for (ii=Adict.level; ii>=0; ii--) {
                ctx.clearRect(0, 0, c.width, c.height)
                sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
                        ii, dark);
                //ctx.save()
            }
        }
        //ctx.clearRect(0, 0, c.width, c.height)
        //sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
        //        Adict.level-1, dark);
    }, function() {
        var c = this;
        var ctx = this.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height)
        sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
                Adict.level, dark);
    })
    */
    
    
    
    //carpet(ctx, c.height, Adict.level, 0, 0, dark)
    
    //hilbertCurve(ctx)
    
    
    
    
    
    
    /*
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    const width = c.width-4;
    const height = c.height-4;
    
    const maxDepth = Adict.level;
    //const defaultScale = 10;
    //let curveScale = defaultScale;
    let defaultScale = 1;//dpr;
    let curveScale = defaultScale;//dpr;
    let scaleWidth = 1;
    let scaleHeight = 1;

    let dimensions = {
        minX: null,
        maxX: null,
        minY: null,
        maxY: null,
    };

    let currentDepth = 0;
    let currentAngle = 0;
    
    let x = 0;
    let y = 0;
    
    const clear = () => {
        ctx.clearRect(0, 0, width, height);
    };
    
    const adjustAngle = (curve, plusMinus) => {
        if (plusMinus === '+') {
            currentAngle -= curve.angle;
        } else {
            currentAngle += curve.angle;
        }
    };
    
    const stackPush = (curve) => {
        curve.stack.push([x, y, currentAngle]);
    };
    
    const stackPop = (curve) => {
        [x, y, currentAngle] = curve.stack.pop();
    };
    
    const drawLine = (curve, instruction, runForDimensions = true, dark=0, colorBit=1) => {
        const nextX = x + (Math.cos(currentAngle) * scaleWidth);//curveScale);
        const nextY = y + (Math.sin(currentAngle) * scaleHeight);//curveScale);
        if (!runForDimensions) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            var color = (colorBit) ? (dark ? '#ebebeb' : '#333') : '#990000' 
            //ctx.fillStyle = color;
            //ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.closePath();
            //ctx.fillStyle = color;
        }
        x = nextX;
        y = nextY;
        
        if (runForDimensions) {
            if (!dimensions.minX || x < dimensions.minX) {
                dimensions.minX = x;
            }
            if (!dimensions.maxX || x > dimensions.maxX) {
                dimensions.maxX = x;
            }
            if (!dimensions.minY || y < dimensions.minY) {
                dimensions.minY = y;
            }
            if (!dimensions.maxY || y > dimensions.maxY) {
                dimensions.maxY = y;
            }
        }
    };
    
    const drawCurve = (curve, runForDimensions = false) => {
        clear();
        x = 0;
        y = 0;
        currentAngle = curve.startAngle || 0;
        currentDepth = 0;
        curve.stack = [];
        const variablesPattern = (curve.variables || []).join('|');
        const regex = new RegExp(variablesPattern, 'g');
        const lSystemString = curve.result.replace(regex, '');
        const curveInstructions = lSystemString.split('');
        if (!runForDimensions) {
            ctx.save();
            ctx.translate(2,2);
        }
        
        //colorBit = 0
        curveInstructions.forEach((instruction) => {
            const method = map[instruction] || drawLine;
            //alert(instruction)
            method(curve, instruction, runForDimensions, dark=dark, colorBit=instruction == 'F');
            //colorBit = !colorBit;
        });
        
        if (!runForDimensions) {
            ctx.restore();
        }
    };
    
    const reset = (curve) => {
        x = 0;
        y = 0;
        
        dimensions = {
            minX: null,
            maxX: null,
            minY: null,
            maxY: null,
        };
        
        currentAngle = curve.startAngle || 0;
        currentDepth = 0;
        curveScale = defaultScale;
        
        curve.stack = [];
        curve.result = curve.axiom;
    };

    const generate = (curve) => {
        reset(curve);
        const maxLoops = 'maxDepth' in curve ? Math.min(curve.maxDepth, maxDepth) : maxDepth;
        while (currentDepth < maxLoops) {
            console.log('current depth:', currentDepth)
            const pattern = Object.keys(curve.rules).join('|');
            const regex = new RegExp(pattern, 'g');
            curve.result = curve.result.replace(regex, match => curve.rules[match]);
            currentDepth++;
        }
        drawCurve(curve, true);
        const totalWidth = Math.abs(dimensions.minX) + dimensions.maxX;
        const totalHeight = Math.abs(dimensions.minY) + dimensions.maxY;
        scaleWidth = width / totalWidth;
        scaleHeight = height / totalHeight;
        curveScale = defaultScale * Math.min(scaleWidth, scaleHeight);
        
        drawCurve(curve, false);
    };

    const map = {
        '+': adjustAngle,
        '-': adjustAngle,
        '[': stackPush,
        ']': stackPop,
    };
    
    //generate(hilbert)
    generate(peanoGosper)
    */
    
    
}




function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fillStyle = color;
    ctx.fill();
}

function sierpinski(ctx, x1, y1, x2, y2, x3, y3, n, dark, colorBit=1) {
    if(n > 0) {     
        var x12 = (x1 + x2)/2;
        var y12 = (y1 + y2)/2;
        var x23 = (x2 + x3)/2;
        var y23 = (y2 + y3)/2;
        var x31 = (x3 + x1)/2;
        var y31 = (y3 + y1)/2;
        
        var color = (colorBit) ? (dark ? '#ebebeb' : '#333') : '#990000' 
        
        drawTriangle(ctx, x31, y31, x12, y12, x23, y23, color);
        sierpinski(ctx, x1, y1, x12, y12, x31, y31, n-1, dark, !colorBit);
        sierpinski(ctx, x2, y2, x12, y12, x23, y23, n-1, dark, !colorBit);
        sierpinski(ctx, x3, y3, x31, y31, x23, y23, n-1, dark, !colorBit);
    }
}

function carpet(ctx, size, level, x0, y0, dark=0, colorBit=0) {
    if(level === 0) return;
    var s = size / 3;
    level--;
    var color = (colorBit) ? (dark ? '#ebebeb' : '#333') : '#990000' 
    ctx.fillStyle = color;
    ctx.fillRect(s + x0, s + y0, s, s);
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            if (!(x === 1 && y === 1)) {
                carpet(ctx, s, level, x0 + x * s, y0 + y * s, dark, !colorBit);
            }
        }
    }
}


/*
var x = 0, y = 0;
function drawHilbert(dx, dy, ctx) {
	ctx.moveTo(x, y);
	x += dx;
	y += dy;
	ctx.lineTo(x, y);
}

function hilbert(d, dx, dy, ctx) {
	if (d > 1) hilbert(d - 1, dy, dx, ctx);
	drawHilbert(dx, dy, ctx);
	if (d > 1) hilbert(d - 1, dx, dy, ctx);
	drawHilbert(dy, dx, ctx);
	if (d > 1) hilbert(d - 1, dx, dy, ctx);
	drawHilbert(-dx, -dy, ctx);
	if (d > 1) hilbert(d - 1, -dy, -dx, ctx);
}

function hilbertCurve(ctx) {
	ctx.beginPath();
	hilbert(7, 10, 0, ctx);
	ctx.stroke();
}
*/

/*
function sierpinski(ctx, x1, y1, x2, y2, x3, y3, n, dark, colorBit=1) {
    if(n > 0) {     
        var x12 = (x1 + x2)*1/3;
        var y12 = (y1 + y2)*1/3;
        var x23 = (x2 + x3)*1/3;
        var y23 = (y2 + y3)*1/3;
        var x31 = (x3 + x1)*1/3;
        var y31 = (y3 + y1)*1/3;
        
        var color = (colorBit) ? (dark ? '#ebebeb' : '#333') : '#990000' 
        
        drawTriangle(ctx, x31, y31, x12, y12, x23, y23, color);
        sierpinski(ctx, x1, y1, x12, y12, x31, y31, n-1, dark, !colorBit);
        sierpinski(ctx, x2, y2, x12, y12, x23, y23, n-1, dark, !colorBit);
        sierpinski(ctx, x3, y3, x31, y31, x23, y23, n-1, dark, !colorBit);
    }
}
*/






/*
const toRadian = Math.PI / 180;

const hilbert = {
	axiom: 'A',
	result: 'A',
	variables: ['A', 'B'],
	rules: {
		'A': '-BF+AFA+FB-',
		'B': '+AF-BFB-FA+',
	},
	angle: 90 * toRadian,
};

const koch = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': 'F+F-F-F+F',
	},
	angle: 90 * toRadian,
};

const kochSnowflake = {
	axiom: 'F++F++F',
	result: 'F',
	rules: {
		'F': 'F-F++F-F',
	},
	angle: 60 * toRadian,
};

const sierpinski = {
	axiom: 'F-G-G',
	result: 'F-G-G',
	rules: {
		'F': 'F-G+F+G-F',
		'G': 'GG',
	},
	angle: 120 * toRadian,
};

const sierpinskiArrowHead = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': '+B-A-B+',
		'B': '-A+B+A-',
	},
	angle: 60 * toRadian,
	maxDepth: 8,
};

const levy = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': '+F--F+',
	},
	angle: -45 * toRadian,
	maxDepth: 15,
};

const tree = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F-[[X]+X]+F[+FX]-X',
		'F': 'FF',
	},
	angle: -25 * toRadian,
	startAngle: -90 * toRadian,
	stack: [],
};

const tree2 = {
	axiom: 'X',
	result: 'X',
	rules: {
		'X': 'F[+X][-X]FX',
		'F': 'FF',
	},
	angle: -25.7 * toRadian,
	startAngle: -90 * toRadian,
	stack: [],
};

const peanoGosper = {
	axiom: 'A',
	result: 'A',
	rules: {
		'A': 'A-B--B+A++AA+B-',
		'B': '+A-BB--B-A++A+B',
	},
	startAngle: 0,
	angle: 60 * toRadian,
	stack: [],
	maxDepth: 5,
};

const peano = {
	axiom: 'F',
	result: 'F',
	rules: {
		'F': 'F+F-F-F-F+F+F+F-F',
	},
	maxDepth: 4,
	angle: 90 * toRadian,
	stack: [],
};


const dragon = {
	axiom: 'FX',
	result: 'FX',
	variables: ['X', 'Y'],
	rules: {
		'X': 'X+YF+',
		'Y': '-DX-Y',
	},
	angle: 90 * toRadian,
	stack: [],
	maxDepth: 15,
};
*/
