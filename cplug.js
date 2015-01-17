

//Define the Simple JS Inheritance prototype. Source : http://ejohn.org/blog/simple-javascript-inheritance/
(function(){var a=!1,b=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){};Class.extend=function(c){function d(){!a&&this.init&&this.init.apply(this,arguments)}var e=this.prototype;a=!0;var f=new this;a=!1;for(var g in c)f[g]="function"==typeof c[g]&&"function"==typeof e[g]&&b.test(c[g])?function(a,b){return function(){var c=this._super;this._super=e[a];var d=b.apply(this,arguments);this._super=c;return d}}(g,c[g]):c[g];d.prototype=f;d.prototype.constructor=d;d.extend=arguments.callee;return d}})();

// Check if we've been loaded before.
if (typeof window.cplug != "undefined") {
    cplug.close();

}

var cpURL = 'https://rawgit.com/Colgate/cplug/master/cplug.js',
    cplugModel = Class.extend({
    version: '1.1.0',
    userCache: {},
    debug: true,
    settings: {
        autoWootEnabled: true,
        autoJoinEnabled: true,
        notifier: {
            enabled: true,
            showWhenFocused: false,
            events: {
                djAdvance: true,
                chatMention: true
            }
        },
        notifyTimeout: 5000
    },
    init: function(reload) {
        if(this.settings.notifier.enabled == true && window.Notification.permission != "granted") window.Notification.requestPermission()
        this.functions.chatLog('#00ffff', 'Running cplug v' + this.version)
        this.proxy = {
            onDJAdvance:   $.proxy(this.onDJAdvance,        this),
            onChatCommand: $.proxy(this.handleChatCommands, this),
            onUserJoin:    $.proxy(this.onUserJoin,         this),
            onUserLeave:   $.proxy(this.onUserLeave,        this),
            onVoteUpdate:  $.proxy(this.onVoteUpdate,       this),
            onChat:        $.proxy(this.onChat,             this)
        }
        this.initListeners();
        setTimeout(function() { 
            if (cplug.debug) console.log('Generating User Cache');
            cplug.functions.genCache(); 
        }, 1000)
        this.loadSettings();
        this.initUI();
    },
    close: function() {
        this.killListeners();
        $('#cplug_icon, #cplug_menu').remove();
        $('#now-playing-time, #volume').css('right','54px');
        $('#history-button').css('right', '0px');
        $('#cplug_css').remove();
    },
    loadSettings: function() {
        if (typeof localStorage.cpSettings != "undefined") this.settings = JSON.parse(localStorage.cpSettings)
    },
    saveSettings: function() {
        localStorage.cpSettings = JSON.stringify(this.settings)
    },
    initListeners: function() {
        if (this.debug) console.log('Initializing event listeners')
        API.on(API.ADVANCE,      this.proxy.onDJAdvance)
        API.on(API.CHAT_COMMAND, this.proxy.onChatCommand)
        API.on(API.USER_JOIN,    this.proxy.onUserJoin)
        API.on(API.USER_LEAVE,   this.proxy.onUserLeave)
        API.on(API.VOTE_UPDATE,  this.proxy.onVoteUpdate)
        API.on(API.CHAT,         this.proxy.onChat)
    },
    initUI: function() {
        $('#now-playing-time, #volume').css('right','118px');
        $('#history-button').css('right', '54px');
        $('#history-button').after('<div style="position:absolute; right:0px; width:54px; height:54px; background-image:url(\'https://bug.dj/cplug_icon.png\'); cursor:pointer;" id="cplug_icon"></div>')
        $('#cplug_icon').mouseover(function() {
            $('<div id="tooltip" style="top: 60px; left: 1525px;" class="bottom"><div class="arrow-up"></div><span>cplug</span></div>').appendTo('body')
        })
        $('#cplug_settings').mouseout(function() {
            $('#tooltip').remove();
        })
        var css =   '<style type="text/css" id="cplug_css">' +
                    '#cplug_settings .tab-menu{top:15px;margin-left:2%;width:96%}#cplug_settings .tab-menu button{width:50%}#cplug_settings .tab-menu button:first-child{-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none}#cplug_settings .left{position:relative;float:left;width:50%;padding-left:20px;}' +
                    '#cplug_settings .right{position:relative;float:right;width:45%}#cplug_settings .container{position:relative}#cplug_settings .container .item{position:relative;margin-top:6px;height:25px;cursor:pointer}#cplug_settings .container .item i{top:2px;left:0;display:none}' +
                    '#cplug_settings .container .item.selected i{display:block}#cplug_settings .container .item span{position:absolute;left:17px;margin-left:10px;color:#808691}#cplug_settings .container .item.s-bg{display:none}#cplug_settings .container .cap{position:relative;top:6px;width:149px;height:68px}' +
                    '#cplug_settings .container .cap .title{position:relative;color:#808691}#cplug_settings .container .cap .value{position:relative;float:right;color:#808691;text-align:right}#cplug_settings .container .cap .counts{position:relative;margin-top:5px;margin-left:3px;max-width:145px;height:25px;text-align:justify;-ms-text-justify:distribute-all-lines;text-justify:distribute-all-lines}' +
                    '#cplug_settings .container .cap .counts .count{display:inline-block;width:23px;height:15px;vertical-align:top;font-size:14px}#cplug_settings .container .cap .counts .stretch{display:inline-block;width:135px;font-size:0;line-height:0}#cplug_settings .container .cap .slider{position:relative;width:150px;height:18px}' +
                    '#cplug_settings .container .cap .slider .bar{position:absolute;top:5px;left:0;width:100%;height:6px;border-radius:10px;background:#282c35}#cplug_settings .container .cap .slider .circle{position:absolute;top:0;left:115px;width:15px;height:15px;border-radius:50%;background:#808691}' +
                    '#cplug_settings .container .cap .slider .hit{position:absolute;top:0;left:7.5px;width:100%;height:17px;cursor:pointer}#cplug_settings .container label{position:absolute;top:8px;color:#808691;font-size:16px}#cplug_settings .container .refresh{position:absolute;top:85px;color:#808691}' +
                    '#cplug_settings .container button{position:absolute;top:37px;max-width:300px;width:90%;height:39px;background:#282c35;color:#808691;font-size:16px;font-family:"Open Sans",sans-serif;cursor:pointer}#cplug_settings .container button:hover{background:#f04f30;color:#eee}' +
                    '#cplug_settings .container .dropdown{position:absolute;top:37px;float:none;max-width:300px;width:90%}' +
                    '</style>'
                    $('head').append(css)
        $('#cplug_icon').click(function() { cplug.toggleUI();})
        $('<div id="cplug_menu" style="padding: 10px 25px; position:absolute; float: left; top:-832px; right: 345px; height:350px; width: 400px; background: #1c1f25;z-index: 10"></div>').appendTo('#room')
        var settings =  '<center><h2>cplug <small class="v"> version ' + this.version + '</small></h2><br />' +
                        '<div id="cplug_settings" class="user-content settings" style="left: 220px; width: 400px;"><div class="container">' + 
                        '</div></div>'
        $(settings).appendTo('#cplug_menu')
        $('.v').css('font-size', '60%')

        this.functions.menu.addHeader('General')
        this.functions.menu.addItem('AutoWoot', 'cps_aw', 'left', 'autoWootEnabled')
        this.functions.menu.addItem('AutoJoin', 'cps_aj', 'right', 'autoJoinEnabled')
        this.functions.menu.addHeader('Notifications')
        this.functions.menu.addItem('Enabled', 'cps_n_e', 'left', 'notifier', 'enabled')
        this.functions.menu.addItem('Show On Focus', 'cps_n_f', 'right', 'notifier', 'showWhenFocused')
        this.functions.menu.addHeader('Notification Types')
        this.functions.menu.addItem('DJ Advance', 'cps_n_t_dja', 'left', 'notifier', 'events', 'djAdvance')
        this.functions.menu.addItem('Chat Mention', 'cps_n_t_cm', 'right', 'notifier', 'events', 'chatMention')
    },
    toggleUI: function() {
        ($('#cplug_menu').css('top') != "54px" ? $('#cplug_menu').animate({'top':'54px'}, 500):$('#cplug_menu').animate({'top':'-' + $('#cplug_menu').css('height')}, 500))
    },
    killListeners: function() {
        if (this.debug) console.log('Killing event listeners')
        API.off(API.ADVANCE,      this.proxy.onDJAdvance)
        API.off(API.CHAT_COMMAND, this.proxy.onChatCommand)
        API.off(API.USER_JOIN,    this.proxy.onUserJoin)
        API.off(API.USER_LEAVE,   this.proxy.onUserLeave)
        API.off(API.VOTE_UPDATE,  this.proxy.onVoteUpdate)
        API.off(API.CHAT,         this.proxy.onChat)
    },
    onUserJoin: function(data) {
        this.functions.chatLog('#CC33FF', data.username + ' joined the room')
        if (this.userCache[data.id] == undefined) this.userCache[data.id] = data;
    },
    onUserLeave: function(data) {
        this.functions.chatLog('#CC33FF', data.username + ' left the room')
    },
    onDJAdvance: function(data) {
        if (this.settings.notifier.events.djAdvance) this.notifier.notify('Plug.DJ - DJ Advance Update', data.dj.username + ' is now playing ' + data.media.title + ' by ' + data.media.author, 'http://bug.dj/plug_icon.png')
        setTimeout(function() { 
            if (cplug.settings.autoWootEnabled) cplug.functions.woot()
            if (API.getWaitListPosition() < 0 && API.getUser().id != API.getDJ().id && cplug.settings.autoJoinEnabled) $('#dj-button').click()
        },3000)
    },
    onVoteUpdate: function(data) {
        if (data.vote == "-1") this.functions.chatLog('#FF0000', data.user.username + ' has mehed this song.')
    },
    onChat: function(data) {
        console.log(data);
        if(data.type == "mention" && this.settings.notifier.events.chatMention) {
            this.notifier.notify('Plug.DJ - Mentioned in chat', data.un + ': ' + data.message, 'http://bug.dj/plug_icon.png')
        }
    },
    handleChatCommands: function(data) {
        var args = data.replace('@', '').split(' ')
        if (args[0] === "/reload") $.getScript(cpURL);
        if (args[0] === "/skip") API.moderateForceSkip();
        if (args[0] === "/kick") API.moderateBanUser(this.functions.getUserFromArgs(data), 1, API.BAN.HOUR);
        if (args[0] === "/ban") API.moderateBanUser(this.functions.getUserFromArgs(data), 1, API.BAN.PERMA);
        if (args[0] === "/mute") API.moderateMuteUser(this.functions.getUserFromArgs(data),1, API.MUTE.SHORT);
        if (args[0] === "/aw") {
            cplug.settings.autoWootEnabled = !cplug.settings.autoWootEnabled;
            (this.settings.autoWootEnabled ? this.functions.chatLog('#00FF00', 'Autowoot enabled!'):this.functions.chatLog('#FF0000','Autowoot disabled!'))
            this.saveSettings();
        }
        if (args[0] === "/aj") {
            cplug.settings.autoJoinEnabled = !cplug.settings.autoJoinEnabled;
            (this.settings.autoJoinEnabled ? this.functions.chatLog('#00FF00', 'Autojoin enabled!'):this.functions.chatLog('#FF0000','Autojoin disabled!'))
            this.saveSettings();
        }
    },
    notifier: {
        notify: function(title, message, image) {
            if ((!cplug.settings.notifier.showWhenFocused && !document.hasFocus()) || cplug.settings.notifier.showWhenFocused) {
                var pop = new Notification(title, {icon: image, body: message})
                setTimeout(function() { pop.close()}, cplug.settings.notifyTimeout)
            }
        }   
    },
    functions: {
        getUserFromArgs: function(args) {
            var users = API.getUsers()
            for (var i in users) {
                if (args.indexOf(users[i].username) > -1) return users[i].id
            }
        },
        woot: function() { $('#woot').click() },
        meh: function() { $('#meh').click() },
        chatLog: function(color, message) {
            $('<div class="msg"><div class="text"><span style="color:' + color + '">' + message + '</span></div></div>').appendTo('#chat-messages');
            $("#chat-messages").animate({ scrollTop: $("#chat-messages")[0].scrollHeight}, 100);
        },
        genCache: function() {
            var users = API.getUsers();
            cplug.userCache = {};
            for (var i in users) {
                cplug.userCache[users[i].id] = users[i]
            }
        },
        getIDFromCache: function(args) {
            args = args.replace('@','')
            var cache = cplug.userCache;
            for (var i in cache) {
                if (args.indexOf(cache[i].username) > -1) {
                    return cache[i].id
                }
            }
        },
        menu: {
            addItem: function(displayName, shortname, side, parentSetting, childSetting, subChild) {
                if (subChild) var checked = cplug.settings[parentSetting][childSetting][subChild]
                else if (childSetting) var checked = cplug.settings[parentSetting][childSetting]
                else var checked = cplug.settings[parentSetting]
                $('<div class="' + side + '"><div id="' + shortname + '" class="item ' + (checked ? "selected": "") + '"><i class="icon icon-check-blue"></i><span>' + displayName + '</span></div></div>').appendTo('#cplug_settings .container')
                $('#' + shortname).click(function(e) {
                    if (subChild) {
                        cplug.settings[parentSetting][childSetting][subChild]=!cplug.settings[parentSetting][childSetting][subChild];
                        cplug.settings[parentSetting][childSetting][subChild] ? $(this).addClass('selected'):$(this).removeClass('selected')
                    } else if (childSetting) {
                        cplug.settings[parentSetting][childSetting]=!cplug.settings[parentSetting][childSetting];
                        cplug.settings[parentSetting][childSetting] ? $(this).addClass('selected'):$(this).removeClass('selected')
                    } else {
                    cplug.settings[parentSetting]=!cplug.settings[parentSetting];
                    cplug.settings[parentSetting] ? $(this).addClass('selected'):$(this).removeClass('selected')
                    }
                    cplug.saveSettings();
                })
            },
            addHeader: function(val) {
                $('<div class="header"><span>' + val + '</span></div>').appendTo('#cplug_settings .container')
            }
        }
    }
})
var cplug = new cplugModel()