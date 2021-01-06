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
        
        for (ii=0; ii<achievs.length; ii++) {
            var Adict = obj[Adicts[ii]]
            if (Adict !== {}) {
                var achiev = achievs[ii]
                $('#badges').append(showBadge(achiev, obj[achiev], Adict, labels[ii]))
                
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
                    0, c.height, 
                    c.width/2, 0, 
                    c.width, c.height, 
                    Adict.level, obj.dark);
                
                $('#'+contextDiv).mouseover(() => {
                        //alert($this.find('#'+contextDiv))
                        var c = document.getElementById(contextDiv);
                        var ctx = c.getContext('2d');
                        ctx.clearRect(0, 0, c.width, c.height)
                        sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
                            Adict.level-1, obj.dark);
                    })
                $('#'+contextDiv).mouseleave(() => {
                        var c = document.getElementById(contextDiv);
                        var ctx = c.getContext('2d');
                        ctx.clearRect(0, 0, c.width, c.height)
                        sierpinski(ctx, 0, c.height, c.width/2, 0, c.width, c.height, 
                            Adict.level, obj.dark);
                })
                
            }
        }
        
        /*
        badges.innerHTML += (obj.papers > 0) ? 
            showBadge('Papers', obj.papers, obj.Apapers) : ""
        badges.innerHTML += (obj.citations > 0) ? 
            showBadge('Citations', obj.citations, obj.Acitations) : ""
        badges.innerHTML += (obj.hindex >= 2) ? 
            showBadge('h-index', obj.hindex, obj.Ahindex) : ""
        badges.innerHTML += (obj.maxcite >= 10) ? 
            showBadge('Most Cited Paper', obj.maxcite, obj.Amaxcite) : ""
        badges.innerHTML += (obj.first > 0) ? 
            showBadge('First Author', obj.first, obj.Afirst) : ""
        badges.innerHTML += (obj.solo > 0) ? 
            showBadge('Solo Author', obj.solo, obj.Asolo) : ""
        //badges.innerHTML += "<footer class='clear'></footer>" // center badge?
        */
        
        /*
        $(document).ready(function () {
            c = document.getElementById('cpapers');
            ctx = c.getContext('2d');
            c.style.width = 64 + "px"
            c.style.height = 71 + "px"
            c.width = 400
            c.height = 400
            ctx.scale(10,10)
            sierpinski(ctx, 0, 40, 20, 0, 40, 40, obj.Apapers.level, obj.dark);
        })
        */
        
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
            + "  <div class='badgeImage'><canvas id='c" + name + "'></canvas>"
            + "<div style='text-align: center; font-size: 10px'><b>LEVEL "+ Adict.level +"</b></div></div>"
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

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    //ctx.translate(0.5,0.5);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    //ctx.translate(-0.5,-0.5);
    ctx.fillStyle = color;
    ctx.fill();
    //ctx.strokeStyle = color;
    //ctx.stroke();
}

function sierpinski(ctx, x1, y1, x2, y2, x3, y3, n, dark) {
    if(n > 0) {     
        var x12 = (x1 + x2)/2;
        var y12 = (y1 + y2)/2;
        var x23 = (x2 + x3)/2;
        var y23 = (y2 + y3)/2;
        var x31 = (x3 + x1)/2;
        var y31 = (y3 + y1)/2;
        
        var color = (n % 2) ? (dark ? '#ebebeb' : '#333') : '#990000' 
        
        drawTriangle(ctx, x31, y31, x12, y12, x23, y23, color);
        sierpinski(ctx, x1, y1, x12, y12, x31, y31, n-1, dark);
        sierpinski(ctx, x2, y2, x12, y12, x23, y23, n-1, dark);
        sierpinski(ctx, x3, y3, x31, y31, x23, y23, n-1, dark);
    }
}
