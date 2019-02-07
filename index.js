//create a bot
var Bot = require('slackbots');

//create request
var request = require('request');
var cheerio = require("cheerio");

// create setting
var setting = {
    token : 'TOKEN CODE',
    name : 'Im BOT'
};

var list = "1. 세경아 안녕\n";
list += "2. 세경아 인기검색어 보여줘\n";
list += "3. 세경아 기능보여줘\n";
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
        // console.log(channels);
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
    console.log(id);
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
    // var answer = '안녕하세요. 저는 봇입니다.';
    // var channelName = channelIdToName(data.channel);
    // var userName = userIdToName(data.user);
    // if(channelName != '') {
    //     bot.postMessageToChannel(channelName,answer,params);
    // } else {
    //     bot.postMessageToUser(userName,answer, params);
    // }
});

bot.on('message',function (data) {
    if(data.type == 'message') {
        //봇이 속한 채널이름 가져오기
        var channelName = channelIdToName(data.channel);

        //채팅을 한 유저네임 가져오기
        var userName = userIdToName(data.user);

        //채팅내용을 저장
        var text = data.text;

        //console.log(data.ts + ':' + data.channel+'['+channelName+']:'+data.user+'['+userName+']:'+data.text);
        //조건 시작
        if(text.indexOf('세경아') != -1&&text.indexOf('안녕') != -1){
            //인사 기능
            var answer = '안녕하세요 저는 신세경입니다.';
            if(channelName != '') {
                bot.postMessageToChannel(channelName,answer,params);
            } else {
                bot.postMessageToUser(userName,answer,params);
            }
        } else if(text.indexOf('세경') != -1 && text.indexOf('인기검색어 보여') != -1 ){
            //인기검색어 출력 기능
            var url = "https://www.naver.com";
            request(url, function(error, response, body) {
                if (error) throw error;
                var $ = cheerio.load(body);
                var answer = 'NAVER 실시간 인기검색어 1~20위\n';
                var popularList = $("div.ah_list li.ah_item a.ah_a");
                popularList.each(function (data) {
                    var num = $(this).find('span.ah_r').text();
                    var text = $(this).find('span.ah_k').text();
                    var longUrl = $(this).attr('href');
                    answer += '<' + longUrl + '|' + num+"."+text + '>\n';
                });
                if(channelName != '') {
                    bot.postMessageToChannel(channelName,answer,params);
                } else {
                    bot.postMessageToUser(userName,answer,params);
                }
            });
        } else if(text.indexOf('세경') != -1 && text.indexOf('기능보여줘') != -1){
            //기능 출력
            var answer = list;
            if(channelName != '') {
                bot.postMessageToChannel(channelName,answer,params);
            } else {
                bot.postMessageToUser(userName,answer,params);
            }
        } else if(badWord(text) != true) {
            var answer = '';
            if(text.indexOf('세경') != -1) {
                var list = ['뭐라고????','ㅎㅎ..정말싫다..','쓰레기냐?'];
                answer = list[Math.floor(Math.random() * list.length)];
            } else {
                answer = "욕하지말아요~~";
            }
            
            if(channelName != '') {
                bot.postMessageToChannel(channelName,answer,params);
            } else {
                bot.postMessageToUser(userName,answer,params);
            }
        }
    }
});

function badWord(text) {
    var list = ['닥쳐','씨발','시발','미친','개새끼','새끼','섹스','여친'];
    var flag = true;
    list.some(word => {
        if(text.indexOf(word) != -1) {
            flag = false;
            return true;
        }
    });

    return flag;
}




