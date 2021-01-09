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
        
        
        //color = '#990000'
        //colors = ['#990000', '#fff', '#594186', '#4fa9af', '#fdd884', '#f99254']
        colors = ['#9e0142', '#4b60b2', '#3695b8', '#ff974f', '#fff', '#92d5bb', ]
        flips  = [0, 0, 0, 1, 1, 1]
        // show badges
        for (ii=0; ii<achievs.length; ii++) {
            var Adict = obj[Adicts[ii]]
            if (Adict !== {}) {
                var achiev = achievs[ii]
                makeBadge(achiev, obj[achiev], Adict, labels[ii], obj.dark, colors[ii],
                    flips[ii])
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

function makeBadge(achiev, value, Adict, label, dark, color='#990000', flip=0) {
    $('#badges').append(showBadge(achiev, value, Adict, label, color))
    
    console.log('achiev:', achiev)
    
    var level = Adict.level + 5
    level = level > 7 ? 7 : level
    
    var contextDiv = 'c'+achiev
    var c = document.getElementById(contextDiv);
    var ctx = c.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = c.getBoundingClientRect();
    c.style.width = 71 + "px"
    c.style.height = 71 + "px"
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    sierpinski(ctx, 
        0, 0, 
        c.width/2, c.height, 
        c.width, 0, 
        level, dark, 1, color);
    ctx.textAlign = "center";
    ctx.font = dark ? 'normal 600 16px sans-serif' : 'normal 600 16px sans-serif'
    ctx.fillStyle = dark && flip ? '#000' : '#ebebeb' 
    ctx.fillText(achiev.substr(0,1).toUpperCase(), (c.width/2), c.height/2*0.85)
    
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
        level-1, dark, 1, color);
    ctx2.textAlign = "center";
    ctx2.font = dark ? 'normal 600 16px sans-serif' : 'normal 600 16px sans-serif'
    ctx2.fillStyle = dark && flip ? '#000' : '#ebebeb' 
    ctx2.fillText(achiev.substr(0,1).toUpperCase(), (c2.width/2), c2.height/2*0.85)
    
    var timeout
    var elem = $('#'+contextDiv)
    var elem2 = $('#'+contextDiv+'2')
    function fadeInOut(elem, elem2) {
        elem.fadeOut(1000).fadeIn(900)
    }
    elem.mouseover(function() {
        fadeInOut(elem, elem2)
        timeout = setInterval(() => fadeInOut(elem, elem2), 1900);
    }).mouseleave(function() {
        clearInterval(timeout)
        elem.stop(true,true).show()
    })
}

function showBadge(name, value, Adict, label, color) {
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
            + "          width: " + progress 
            +            "%; background-color: " 
            + (color == "#fff" ? "#ebebeb" : color) +";'>"
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

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 0.66;
    
    ctx.strokeStyle = '#000';
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
        
        drawTriangle(ctx, x31, y31, x12, y12, x23, y23, color);
        sierpinski(ctx, x1, y1, x12, y12, x31, y31, n-1, dark, !colorBit, baseColor);
        sierpinski(ctx, x2, y2, x12, y12, x23, y23, n-1, dark, !colorBit, baseColor);
        sierpinski(ctx, x3, y3, x31, y31, x23, y23, n-1, dark, !colorBit, baseColor);
    }
}
