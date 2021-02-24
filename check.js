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
            
            chrome.storage.sync.set({
                "user": user,
                "name": name
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
            chrome.storage.sync.get(achievs, function(obj) {
                checkAchievements(obj)
            })
        }
        showMoreButton.click()
    }
}

function checkAchievements(obj) {
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
        var nodes = paperTable.querySelectorAll('td')
        
        papers  = nodes.length/4
        maxcite = parseInt(nodes[2].textContent)
        
        // get surname 
        // only checks to see that the surname matches the first author surname 
        // will miscount if publishing e.g. with family members 
        // could modify the page to have a clickable icon for first author papers 
        namediv = document.getElementById('gsc_prf_in')
        names = namediv.innerHTML.split('<button')[0]
        var name = parseFullName(names)
        var surname = name.last
        
        for (ii = 1; ii<=nodes.length; ii+=4) {
            //console.log(nodes[ii].innerText)
            var authors = nodes[ii].innerText.split('\n')[1].split(',')
            if (authors.length == 1) solo += 1
            if (authors[0].includes(surname)) first += 1
            
            cite = parseInt(nodes[ii+1].textContent)
            console.log(cite)
            if (cite > maxcite) maxcite = cite 
        }
    }
    chrome.storage.sync.set({ // fix the "20 papers bug" from the show more button
            'citations': citations, 
            'hindex':    hindex, 
            'maxcite':   maxcite, 
            'papers':    papers == 20 & obj.papers > 20 ? obj.papers : papers,
            'solo':      papers == 20 & obj.papers > 20 ? obj.solo   : solo,
            'first':     papers == 20 & obj.papers > 20 ? obj.first  : first,
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
            
            check('citations', citations, citationAchievements)
            check('hindex',    hindex,    hindexAchievements)
            check('maxcite',   maxcite,   maxciteAchievements)
            check('first',     first,     firstAchievements)
            check('solo',      solo,      soloAchievements)
            check('papers',    papers,    paperAchievements)
            
        })
}

function check(name, val, achievements) {
    next = null
    for (ii = achievements.length - 1; ii >= 0; ii--) {
        achievement = achievements[ii]
        if (val >= achievement.amount) {
            setAchievement(name, achievement, ii, next.amount, next.description)
            return;
        }
        next = achievement
    }
}

function setAchievement(name, achievement, index, next, nextDescription) {
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
                "nextDescription": nextDescription,
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
    
    
    const color = badgeColors[achievs.indexOf(name)]
    var dark = 0
    var level = Adict.level 
    level = level > 7 ? 7 : level
    level2 = level > 4 ? 4 : level-1
    
    var contextDiv = 'c'+name
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
    ctx.fillText(name.substr(0,1).toUpperCase(), (c.width/2), c.height/2*0.85)
    
    $('#c'+name).hide()
    
    var contextDiv2 = 'c'+name+'2'
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
    ctx2.fillText(name.substr(0,1).toUpperCase(), (c2.width/2), c2.height/2*0.85)
    
    
    $('#c'+name).delay(($(".noti").length-1)*500+250).fadeIn(1000)
    
    var notiAlert = $("#"+name+".noti")
    notiAlert.hide()
    notiAlert.delay(($(".noti").length-1)*500).fadeIn(1000)
    notiAlert.mouseenter(() => notiAlert.stop(true, true).show())
    $("#"+name+".noti_close").click(() => notiAlert.stop(true, true).hide())
    
    function toggle(tog) {
        tog ? $("#scholarQuestWindow").show() : $("#scholarQuestWindow").hide()
        $(document).on('click', '#scholarQuestButton', () => toggle(!tog));
    }
    $(document).on('click', '.notification', () => toggle(1));
}

function showBadge(name, Adict) {
    return "<div class='badge noti_left' id='" + name + "'>"
        + "  <div class='badgeImage'>"
        + "<canvas id='c" + name + "2'></canvas>"
        + "<canvas id='c" + name + "'></canvas>"
        + "</div>"
        + "  <div class='badgeContent'>"
        + "    <p style='padding-bottom: 5px'><b>" + Adict.title + "</b></p>"
        + "    <p>"+Adict.description+"</p>"
        + "  </div>"
        + "</div>"
}
