// querystring
var qs = require("querystring");
var answer;
//create a bot
var Bot = require('slackbots');

//create request
var request = require('request');
var cheerio = require("cheerio");

// create setting
var setting = {
    token: 'TOKEN CODE',
    name: 'Im BOT'
};

var welcomeList = ['안녕하세요. 아래의 기능들을 사용할 수 있습니다.','1. 세경아 안녕','2. 세경아 인기검색어 보여줘','3. 세경아 기능 보여줘'];

var bot = new Bot(setting);
var params = {
    as_user: 'true'
};
function channelIdToName(id) {
    var channels = bot.getChannels();
    if ((typeof channels !== 'undefined')
        && (typeof channels._value !== 'undefined')
        && (typeof channels._value.channels !== 'undefined')) {
        channels = channels._value.channels;
        
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].id == id) {
                return channels[i].name;
            }
        }
    }
    return '';
}
function userIdToName(id) {
    var users = bot.getUsers();
    // console.log("id:::::::: "+id);
    if ((typeof users !== 'undefined')
        && (users._value !== 'undefined')
        && (users._value.members !== 'undefined')) {
        users = users._value.members;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == id) {
                return users[i].name;
            }
        }
    }
    return '';
}
bot.on('start', function (data) {
    // console.log(data);
    // var answer = '안녕하세요. 저는 세경봇입니다.\n \"세경아 기능보여줘\" 를 입력해보세요.';

    // var channelName = channelIdToName(data.channel);
    // var userName = userIdToName(data.user);

    // if(channelName != '') {
    //     bot.postMessageToChannel(channelName,answer,params);
    // } else {
    //     bot.postMessageToUser(userName,answer, params);
    // }
});

bot.on('message', function (data) {
    if (data.type == 'message') {
        answer = '';
        //봇이 속한 채널이름 가져오기
        var channelName = channelIdToName(data.channel);

        //채팅을 한 유저네임 가져오기
        var userName = userIdToName(data.user);
        console.log(userName);
        //채팅내용을 저장
        var text = data.text;

        //console.log(data.ts + ':' + data.channel+'['+channelName+']:'+data.user+'['+userName+']:'+data.text);

        //조건 시작
        if (text.indexOf('세경아') != -1 && text.indexOf('안녕') != -1) {
            //인사 기능
            answer = '안녕하세요 저는 신세경입니다.';
        } else if(text.indexOf('세경') != -1 && text.indexOf('검색해줘') != -1) {
            var url = 'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=';
            var textArr = text.split(' ');
            var result = textArr.splice(1,textArr.length-2);
            if(result.length > 1) {
                result = result.join('%20');
            } else {
                result = result.join('');
            }
            answer = url + result;
        } else if (text.indexOf('세경') != -1 && text.indexOf('기능') != -1 && text.indexOf('보여') != -1) {
            //기능 출력
            answer = welcomeList.join("\n");
        } else if (text.indexOf('세경') != -1 && text.indexOf('인기검색어') != -1 && text.indexOf('보여') != -1) {
            //인기검색어 출력 기능
            var url = "https://www.naver.com";
            request(url, function (error, response, body) {
                if (error) throw error;

                var $ = cheerio.load(body);
                var answer = 'NAVER 실시간 인기검색어 1~20위\n';
                var popularList = $("div.ah_list li.ah_item a.ah_a");
                console.log(popularList);
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
        } else if (badWord(text) != true) {
            if (text.indexOf('세경') != -1) {
                var list = ['뭐라고????', 'ㅎㅎ..정말싫다..', '쓰레기니?', '인성 터졌네;'];
                answer = list[Math.floor(Math.random() * list.length)];
            } else {
                answer = "욕쟁이세요??";
            }
        } else if (text.indexOf('세경') != -1 && text.indexOf('알람 맞춰줘') != -1) {
            var who, when, what;
            var addwhen = false;
            var textarray = text.split(" ");
            var now = new Date();
            var future = new Date();

            for (var x = 0; x < textarray.length; x++) {
                if (textarray[x].indexOf("에게") > -1) {
                    who = textarray[x].split("에게")[0];
                } else if (textarray[x].indexOf("후에") > -1) {
                    when = textarray[x].split("후에")[0];
                    addwhen = true;
                } else if (textarray[x].indexOf("에") > -1) {
                    when = textarray[x].split("에")[0];
                } else if (textarray[x].indexOf("라고") > -1) {
                    what = textarray[x].split("라고")[0];
                }
            }
            
            console.log(now);
            if (addwhen) {
                if (when.split("시간").length == 2) {
                    var hour = when.split("시간")[0] * 1;
                    var min = 0;
                    if (when.split("분").length == 2) {
                        min = when.split("시간")[1].split("분")[0] * 1;
                    }

                    future.setHours(now.getHours() + hour, now.getMinutes() + min);
                } else {
                    var min = when.split("분")[0] * 1;
                    console.log(min);
                    future.setMinutes(now.getMinutes() + min);
                }
            } else {
                var hour = when.split("시")[0] * 1;
                var min = when.split("시")[1].split("분")[0] * 1;
                var ampm = when.split("시")[1].split("분")[1];
                if (ampm == "pm") { hour = hour + 12; }
                future.setHours(hour, min, "00");
            }
            var differTime = future.getTime() - now.getTime();

            setTimeout(function () {
                if (who == "전부" || who == "모두") {
                    if (channelName != '') {
                        bot.postMessageToChannel(channelName, what, params);
                    }
                }
                else if (who == undefined || who == "나") {
                    bot.postMessageToUser(userName, what, params);
                }
                else {
                    bot.postMessageToUser(who, what, params);
                }
            }, differTime);
        } else if (text.indexOf('세경') != -1 && text.indexOf('맛집') != -1 && text.indexOf('추천') != -1) {
            var where;
            var url = "https://store.naver.com/restaurants/list?filterId=s13473078&query=";
            var textArray = text.split(" ");
            
            if (textArray[1].indexOf("역") != -1) {
                where = textArray[1];
            }
            if (where != null) {
                var word = where + " 맛집";
                url = url + qs.escape(word);
                answer = where + " 맛집 리스트\n";
                request(url, function (error, response, body) {
                    if (error) throw error;

                    console.log("URL:::" + url);
                    console.log(body);
                    var $ = cheerio.load(body);
                    var placeList = $("");
                    console.log(placeList);
                    placeList.each(function (data) {
                        var text = $(this).find(".name").attr("title");
                        var category = $(this).find(".category").text();
                        var link = $(this).find(".name").attr("href");
                        answer += "<" + link + "|" + text + "(" + category + ")>\n";
                        console.log("answer::::::: " + answer);
                    });

                    if (channelName != '') {
                        bot.postMessageToChannel(channelName, answer, params);
                    } else {
                        bot.postMessageToUser(userName, answer, params);
                    }
                });
            }
            else {
                answer = "ex) 세경아 OO역 맛집 추천해줘";
                if (channelName != '') {
                    bot.postMessageToChannel(channelName, answer, params);
                } else {
                    bot.postMessageToUser(userName, answer, params);
                }
            }
        }

        if (channelName != '' && answer != '') {
            bot.postMessageToChannel(channelName, answer, params);
        } else {
            bot.postMessageToUser(userName, answer, params);
        }
    }
});

function badWord(text) {
    // 욕설 리스트 ()
    var list = ["10새", "10새기","10새리","10세리","10쉐이","10쉑","10스","10쌔","10쌔기","10쎄","10알","10창","10탱","18","18것","18넘","18년","18노","18놈","18뇬","18럼","18롬","18새","18새끼","18색","18세끼","18세리","18섹","18쉑","18스","18아","G스팟","X끼","ass","bitch","bogi","boji","bozi","damm","fuck","g랄","jaji","jazi","jot","oral","sex","shit","shutup","sibal","sipal","si발","ssiba","suck","tlqkf","wtf","zot","z랄","ㄱㅐ","ㄲㅈ","ㄲㅏ","ㄲㅑ","ㄲㅣ","ㅁㅊ","ㅂㅅ","ㅄ","ㅅㅂ","ㅅㅂㄹㅁ","ㅅㅍ","ㅅㅐ","ㅆㅂㄹㅁ","ㅆㅍ","ㅆㅣ","ㅆ앙","ㅈㄹ","ㅍㅏ","ㅗ","凸","간나","갈보","강간","강아지","같은년","같은뇬","개가튼넘","개같네","개같은","개구라","개년","개놈","개뇬","개대중","개독","개돼중","개랄","개보지","개뻥","개뿔","개새","개새기","개새끼","개새키","개색기","개색끼","개색키","개색히","개섀끼","개세","개세끼","개세이","개소리","개쇳기","개수작","개쉐","개쉐리","개쉐이","개쉑","개쉽","개스끼","개시키","개십새기","개십새끼","개쌔끼","개쐑","개쑈","개씹","개아들","개자슥","개자식","개자지","개접","개좆","개좌식","개처럼","개허접","걔새","걔수작","걔시끼","걔시키","걔썌","거시기","걸레","게색기","게색끼","고추","고츄","곧츄","곧휴","곶츄","곶휴","광뇬","구녕","구라","구멍","그년","그새끼","까러","깔어","꺼져","껃여","껃져","껒여","꼬봉","꼬우냐","꼬추","꼬츄","꼳츄","꼳휴","꼴린다","꼽냐","꼽다","꼽사리","꽂추","꽂츄","녜미","놈현","뇬","눈까러","눈깔","눈깔어","뉘미럴","늬미","늬미럴","니귀미","니기미","니미","니미랄","니미럴","니미씹","니아배","니아베","니아비","니어매","니어메","니어미","닝기리","닝기미","닥쳐","닥쵸","닭쳐","대가리","대갈","뎡신","도라이","돈놈","돌아이","돌은놈","되질래","뒈져","뒈져라","뒈진","뒈진다","뒈질","뒤질래","등신","디져라","디진다","디질래","딩시","따식","딸딸이","때놈","또라이","똘기","똘아이","똘추","뙈놈","뙤놈","뙨넘","뙨놈","뚜쟁","띠바","띠발","띠불","띠팔","랄지","메친넘","메친놈","미췬","미친","미친넘","미친년","미친놈","미친새끼","미친스까이","미틴","미틴넘","미틴년","미틴놈","바랄년","뱅마","뱅신","벼엉신","병쉰","병신","병자","보지","부랄","부럴","불알","불할","붕가","붙어먹","뷰웅","븅","븅신","빌어먹","빌어먹을","빙시","빙신","빠가","빠구리","빠굴","빠큐","빡유","빸유","뻐큐","뻑큐","뽀지","뽀찌","뽁큐","삐리리","사까시","사까아시","사까아시이","삿갓이","상넘이","상놈을","상놈의","상놈이","새X","새갸","새꺄","새끼","새새끼","새키","색끼","생쑈","샫업","샷업","성교","성노예","성폭행","세갸","세꺄","세끼","섹스","쇅끼","쇡끼","쇼하네","쉐","쉐기","쉐끼","쉐리","쉐에기","쉐키","쉑","쉣","쉨","쉬박","쉬발","쉬밸","쉬벌","쉬빡","쉬뻘","쉬탱","쉬팍","쉬펄","쉽세","쉽알","슈바","슈발","스패킹","스팽","시bal","시궁창","시끼","시댕","시뎅","시랄","시바","시발","시방","시밬","시벌","시부랄","시부럴","시부리","시불","시브랄","시이발","시팍","시팔","시펄","신발끈","심발끈","심탱","십8","십라","십새","십새끼","십세","십쉐","십쉐이","십스키","십쌔","십창","십탱","싶알","싸가지","싹아지","쌉년","쌍넘","쌍년","쌍놈","쌍뇬","쌍쌍보지","쌔끼","쌕","쌩쑈","쌰럽","쌴년","썅","썅년","썅놈","썡쇼","써벌","썩을년","썩을놈","쎄꺄","쎄엑","쎄엑스","쎅쓰","쑤시자","쑤우시자","쒸벌","쒸뻘","쒸팔","쒸펄","쓰바","쓰박","쓰발","쓰벌","쓰파","쓰팔","씁새","씁얼","씌파","씨8","씨가랭","씨끼","씨댕","씨뎅","씨바","씨바랄","씨박","씨발","씨방","씨방새","씨방세","씨밸","씨뱅","씨벌","씨벨","씨봉","씨봉알","씨부랄","씨부럴","씨부렁","씨부리","씨불","씨붕","씨브랄","씨빠","씨빨","씨뽀랄","씨앙","씨엑스","씨파","씨팍","씨팔","씨펄","씨퐁","씸년","씸뇬","씸새끼","씹같","씹년","씹뇬","씹덕","씹덕후","씹물","씹보지","씹새","씹새기","씹새끼","씹새리","씹세","씹쉐","씹스키","씹쌔","씹이","씹자지","씹질","씹창","씹탱","씹퇭","씹팔","씹할","씹헐","아가리","아갈","아갈빡","아갈이","아갈통","아구창","아구통","아굴","아닥","아헤가오","애무","애미","애비","앰창","얌마","양넘","양년","양놈","엄창","에미","에비","엠병","엠창","여물통","염병","염창","엿같","옘병","옘빙","오라질","오라질년","오랄","오입","왜년","왜놈","욤병","유두","유방","육갑","은년","을년","이년","이새끼","이새키","이스끼","이스키","임마","입싸","자슥","자지","잡것","잡넘","잡년","잡놈","저년","저새끼","접년","정액","젖꼭지","젖꼮찌","젖밥","조까","조까치","조낸","조또","조랭","조빠","조쟁이","조지냐","조진다","조질래","조찐","존나","존나게","존니","존만","존만한","졸라","졸래","좀물","좁년","좁밥","좃","좃까","좃또","좃만","좃밥","좃이","좃찐","좆","좆같","좆까","좆나","좆또","좆만","좆밥","좆이","좆찐","좇같","좇이","좋같은","좋만","좌식","주글","주글래","주데이","주뎅","주뎅이","주둥아리","주둥이","주디","주접","주접떨","죽고잡","죽을래","죽통","쥐랄","쥐롤","쥬디","지X","지ral","지랄","지럴","지롤","지미랄","지스팟","질싸","짜식","짜아식","짜지","짜찌","쪼다","쫍빱","찌랄","창남","창녀","창년","창놈","쳐닥","촌년","촌놈","캐년","캐놈","캐스끼","캐스키","캐시키","크리토리스","클리토리스","탱구","팔럼","퍽큐","헐보","호구","호로","후라덜","후라들","후래자식","후레자식","후레","후뢰","후장","새애액스","세에엑스","세애액스","새에액스","색스","샥스","쎽","쎡","쎾","쏐","쒝","쒞","챵년"];
    
    var flag = true;
    list.some(word => {
        if (text.indexOf(word) != -1) {
            flag = false;
            return true;
        }
    });

    return flag;
}




