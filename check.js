var url = window.location.href
var params = new URLSearchParams(window.location.search)
var userPage = params.get('user')
if (userPage !== null) {
    // user is on a google scholar page, possibly their own 
    
    document.head.innerHTML += 
        "<link href='https://fonts.googleapis.com/css?family=Lato:100,300,400' rel='stylesheet' type='text/css'>"
    
    var head = document.getElementsByTagName('HEAD')[0]
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = chrome.extension.getURL('notification.css') 
    head.appendChild(link) 
    
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = chrome.extension.getURL('container.css') 
    head.appendChild(link) 
    
    document.body.innerHTML += 
         "\n<div id='scholarQuestButton'></div>"
        +"\n<div id='scholarQuestWindow'><div id='scholarQuestInner'></div></div>"
    $("#scholarQuestWindow").hide()
    
    var object = document.createElement('object')
    object.data = chrome.extension.getURL('optionsFrame.html') 
    object.id = 'badgePage'
    $("#scholarQuestInner").html(object);
    
    function toggle(tog) {
        tog ? $("#scholarQuestWindow").show() : $("#scholarQuestWindow").hide()
        $(document).on('click', '#scholarQuestButton', () => toggle(!tog));
    }
    $(document).on('click', '#scholarQuestButton', () => toggle(1));
    
    chrome.storage.sync.get("user", function(stored) {
        var user = stored.user;
        if (user === "") {
            // if blank, assume they're on their own page 
            user = userPage
            
            // obtain their first name 
            namediv = document.getElementById('gsc_prf_in')
            names = namediv.innerHTML.split('<button')[0]
            var name = parseFullName(names).first
            //name = namediv.innerHTML.split(' ')[0]
            
            chrome.storage.sync.set({
                "user": user,//url,
                "name": name//.first
            })
        }
        if (user === userPage) {
            showAllPapers() // and when there, check achievements 
        }
    })
}

function showAllPapers() {
    // modify the URL to request 10000 papers 
    // anyone with more papers than that is too busy to use this extension 
    showStr = ''//?cstart=0&pagesize=10000'
    if (!window.location.href.includes(showStr)) {
        window.location.href += showStr
    }
    
    // this will "show more" until all the papers are revealed 
    // could take a long time for people with a lot of papers 
    clicker = setInterval(showMore, 500)
    
    function showMore() {
        var showMoreButton = document.getElementById('gsc_bpf_more')
        if (showMoreButton.disabled) {
            clearInterval(clicker)
            checkAchievements()
        }
        showMoreButton.click()
    }
}

function checkAchievements() {
    dataTable = document.getElementById('gsc_rsb_st')
    cells = dataTable.querySelectorAll("td");
    citations = cells[1].firstChild.data
    hindex    = cells[4].firstChild.data
    i10index  = cells[7].firstChild.data
    
    papers  = 0
    maxcite = 0
    solo    = 0
    first   = 0
    var paperTable = document.getElementById('gsc_a_t')
    if (paperTable !== null) {
        var nodes   = paperTable.querySelectorAll('td')
        
        papers  = nodes.length/4
        maxcite = nodes[2].textContent
        
        // get surname 
        // only checks to see that the surname matches the first author surname 
        // will miscount if publishing e.g. with family members 
        // could modify the page to have a clickable icon for first author papers 
        //namediv = document.getElementById('gsc_prf_in')
        //names = namediv.innerHTML.split('<button')[0].split(' ')
        //surname = names[names.length-1]
        namediv = document.getElementById('gsc_prf_in')
        names = namediv.innerHTML.split('<button')[0]
        var name = parseFullName(names)
        var surname = name.last
        
        for (ii = 1; ii<=nodes.length; ii+=4) {
            //console.log(nodes[ii].innerText)
            var authors = nodes[ii].innerText.split('\n')[1].split(',')
            if (authors.length == 1) solo += 1
            if (authors[0].includes(surname)) first += 1
        }
    }
    chrome.storage.sync.set({
            'citations': citations,
            'hindex':    hindex,
            'papers':    papers,
            'maxcite':   maxcite, 
            'solo':      solo,
            'first':     first,
        },
        function() {
            document.body.innerHTML += "\n<div class='notification'></div>"
            
            var notiAlerts, timeoutId;
            function hideNoti() {
                notiAlerts.fadeOut(2000)
            }
            function stopTimer() {
                clearTimeout(timeoutId)
                notiAlerts.stop(true, true).show()
            }
            notiAlerts = $(".notification")
            notiAlerts.mouseenter(stopTimer)
            notiAlerts.mouseleave(() => timeoutId = setTimeout(hideNoti, 1000))
            timeoutId = setTimeout(hideNoti, 6000)
            
            check('citations', citations, citationAchievements)//Levels)
            check('hindex',    hindex,    hindexAchievements)//Levels)
            check('maxcite',   maxcite,   maxciteAchievements)//Levels)
            check('first',     first,     firstAchievements)//Levels)
            check('solo',      solo,      soloAchievements)//Levels)
            check('papers',    papers,    paperAchievements)//Levels)
            
        })
}

function check(name, val, achievements) {
    next = null
    for (ii = achievements.length - 1; ii >= 0; ii--) {
        achievement = achievements[ii]
        if (val >= achievement.amount) {
            setAchievement(name, achievement, ii, next)
            return;
        }
        next = achievement.amount
    }
}

function setAchievement(name, achievement, index, next) {
    var key = 'A' + name
    chrome.storage.sync.get(key, function(obj) {
        var best = -1
        if (key in obj && 'limit' in obj[key]) 
            best = obj[key]['limit']
        if (achievement.amount > best) {
            console.log('new achievement:', name, achievement.level)
            var Adict = {
                "title"  : achievement.title,
                "description": achievement.description, 
                "date"   : new Date().toISOString().slice(0, 10),
                "next"   : next, 
                "limit"  : achievement.amount,
                "level"  : index+1,
                "points" : index * (index + 1) / 2,
            }
            chrome.storage.sync.set({[key]: Adict})
            showNotification(name, Adict)
        }
    })
}

function showNotification(name, Adict) {
    $(".notification").append('<div class="noti" id="'+name+'">'
        + showBadge(name, Adict)
        + '<div class="noti_right noti_close" id="'+name+'"></div>'
        + '</div>'
    );
    
    var notiAlert = $("#"+name+".noti")
    notiAlert.hide()
    notiAlert.delay(($(".noti").length-1)*500)
    notiAlert.fadeIn(1000)
    notiAlert.mouseenter(() => notiAlert.stop(true, true).show())
    $("#"+name+".noti_close").click(() => notiAlert.stop(true, true).hide())
}

function showBadge(name, Adict) {
    return "<div class='badge noti_left' id='" + name + "'>"
        + "  <div class='badgeImage'></div>"
        + "  <div class='badgeContent'>"
        + "    <p><b>" + name + " Level " + Adict.level + "</b></p>"
        + "    <p>Earned with " 
        +        name.toLowerCase() + " &#8805; " + Adict.limit 
        + "    </p>"
        + "  </div>"
        + "</div>"
}
/*
function showBadge(name, Adict) {
    return "<div class='badge noti_left' id='" + name + "'>"
        + "  <div class='badgeImage'></div>"
        + "  <div class='badgeContent'>"
        + "    <p><b>" + Adict.title + "</b></p>"
        + "    <p>"+Adict.description+"</p>"
        + "    </div>"
        + "  </div>"
        + "</div>"
}
*/