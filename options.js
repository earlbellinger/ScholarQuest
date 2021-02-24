chrome.storage.onChanged.addListener(function(changes, namespace) {
    location.reload();
});

var settings = ['user', 'name', 'dark']
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
                makeBadge(achiev, obj[achiev], Adict, labels[ii], 
                    obj.dark, badgeColors[ii], flips[ii])
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
        
        var level;
        next = null
        for (level = scholarLevels.length - 1; level >= 0; level--) {
            threshold = scholarLevels[level]
            if (points >= threshold) break;
            next = threshold
        }
        if (level > scholarTitles.length - 1) {
            level = scholarTitles.length - 1
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
    $(function() {
    $('#badges').append(showBadge(achiev, value, Adict, label, color))
    
    console.log('achiev:', achiev)
    
    var level = Adict.level 
    level = level > 7 ? 7 : level
    level2 = level > 4 ? 4 : level-1
    //if (dark) {
    //    level2 = level > 2 ? 2 : level-1
    //}
    
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
        level2, dark, 1, color);
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
    });
}

function showBadge(name, value, Adict, label, color) {
    if ('level' in Adict) {
        progress = value < Adict.next ? (value/Adict.next)*100 : 100
        progress = progress == 0 ? 1 : progress
        return "<div class='badge' id='" + name + "'>"
            + "  <div class='badgeImage'>"
            + "<canvas id='c" + name + "2'></canvas>"
            + "<canvas id='c" + name + "'></canvas>"
            + "<div id='level' title='" + Adict.description + "'>"
            + "<b>LEVEL "+ Adict.level +"</b></div></div>"
            + "  <div class='badgeContent'>"
            + "    <p title='" + Adict.description + "'><b>" 
            +        Adict.title 
            + "    </b></p>"
            + "    <p id='achievementDate' title='Achievement Date'>" 
            +        Adict.date 
            + "    </p>"
            + "    <div style='height:34px; position: relative; margin-left: 100px'><span style='position: absolute; bottom: 0;'>"
            +        Adict.nextDescription
            + "    </span></div>"
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
