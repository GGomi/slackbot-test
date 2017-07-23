/*
 * CreateBy: CheeseLab
 * 
 * Date: 2017-07-22
 * 
 * User: Jeongmin
 */

/*
 * CreateBy: CheeseLab
 *
 * Date: 2017-07-22
 *
 * User: Jeongmin
 */

//create a bot
var Bot = require('slackbots');

//create request
var request = require('request');
var cheerio = require("cheerio");

// create setting
var setting = {
    token : '<Insert Token>',
    name : 'Test'
};

var bot = new Bot(setting);
var params = {
    as_user : 'true',
};
function channelIdToName(id) {
    var channels = bot.getChannels();
    if((typeof channels !== 'undefined')
        && (typeof channels._value !== 'undefined')
        && (typeof channels._value.channels !== 'undefined')){
        channels = channels._value.channels;
        //console.log(channels);
        for(var i=0; i<channels.length; i++){
            if(channels[i].id == id){
                return channels[i].name;
            }
        }
    }
    return '';
}
function userIdToName(id) {
    var users = bot.getUsers();
    if ((typeof users !== 'undefined')
        && (users._value !== 'undefined')
        && (users._value.members !== 'undefined')) {
        users = users._value.members;
        for (var i=0; i < users.length; i++ ) {
            if (users[i].id == id) {
                return users[i].name;
            }
        }
    }
    return '';
}

bot.on('start',function () {
});

bot.on('message',function (data) {
    //console.log(data);
    if(data.type == 'message'){
        var channelName = channelIdToName(data.channel);
        // console.log(channelName);
        var userName = userIdToName(data.user);
        var text = data.text;
        //console.log(data.ts + ':' + data.channel+'['+channelName+']:'+data.user+'['+userName+']:'+data.text);
        if(text.indexOf('안녕') != -1){
            var answer = 'Hello, World.';
            if(channelName != '') {
                bot.postMessageToChannel(channelName,answer,params);
            } else {
                bot.postMessageToUser(userName,answer, params);
            }
        } else if(text.indexOf('인기검색어 보여줘') != -1){
            //console.log('im in');
            var url = "https://www.naver.com";
            request(url, function(error, response, body) {
                if (error) throw error;
                var $ = cheerio.load(body);
                //console.log(body);
                var popularList = $("div.ah_roll_area li.ah_item a.ah_a");
                var answer ='';
                popularList.each(function () {
                    var num = $(this).find('span.ah_r').text();
                    var text = $(this).find('span.ah_k').text();
                    answer += num+"."+text+"\n";
                    //console.log(answer);
                });
                if(channelName != '') {
                    bot.postMessageToChannel(channelName,answer,params);
                } else {
                    bot.postMessageToUser(userName,answer,params);
                }
            });
        }

    }
});



