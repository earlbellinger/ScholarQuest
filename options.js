chrome.storage.onChanged.addListener(function(changes, namespace) {
    location.reload();
});

var settings = ['user', 'name', 'dark']
var achievs = ['citations',  'hindex',  'papers',  'maxcite',  'solo',  'first']
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

function showBadge(name, value, Adict) {
    if ('level' in Adict) {
        progress = value < Adict.next ? (value/Adict.next)*100 : 100
        progress = progress == 0 ? 1 : progress
        return "<div class='badge' id='" + name + "'>"
            + "  <div class='badgeImage'></div>"
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
            + "      <div id='nextLevel'>" + name.toLowerCase() + ": " 
            +          value + "/" + Adict.next 
            + "      </div>"
            + "    </div>"
            + "  </div>"
            + "</div>"
    }
    return ""
}
