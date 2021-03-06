// 如果没有这一行, 就没办法使用一些 let const 这样的特性
"use strict"


const request = require('request')
const cheerio = require('cheerio')

/*
本文件需要安装两个基本的库
request 用于下载网页
cheerio 用于解析网页数据

安装命令如下
npm install request cheerio
*/

// 定义一个类来保存回答的信息
// 这里只定义了 4 个要保存的数据
// 分别是  问题 作者 内容 链接
function Answer() {
    this.url = ''
    this.name = ''
}

let list = []
const log = function() {
    console.log.apply(console, arguments)
}


const answerFromDiv = function(div) {
    // 这个函数来从一个回答 div 里面读取回答信息
    const a = new Answer()
    // 使用 cheerio.load 函数来返回一个可以查询的特殊对象
    // 使用这个 options 才能使用 html() 函数来获取带回车的文本信息
    const options = {
        decodeEntities: false,
    }
    const e = cheerio.load(div, options)
    a.url = e('a').attr('href')
    a.name = e('.title').text()
    return a
}


const answersFromBody = function(body) {
    // cheerio.load 用字符串作为参数返回一个可以查询的特殊对象
    const options = {
        decodeEntities: false,
    }
    const e = cheerio.load(body, options)
    // 查询对象的查询语法和 DOM API 中的 querySelector 一样

     const divs = e('.imagechannelinfo')
    //  let divs = divs
    list = []
    for (var i = 0; i < divs.length; i++) {
        let element = divs[i]
        let div = e(element).html()
        let a = answerFromDiv(div)
        list.push(a)
    }
    // console.log(list);
     _saveJSON(`${__dirname}/data/url/`+ num +'.json',list)
}

const _saveJSON = function(path, answers) {
    // 这个函数用来把一个保存了所有电影对象的数组保存到文件中
    const fs = require('fs')
    const s = JSON.stringify(answers, null, 2)
    fs.writeFile(path, s, function(error) {
        if (error !== null) {
            console.log('*** 写入文件错误', error)
        } else {
            console.log('--- 保存成功')
        }
    })
}

const writeToFile = function(path, data) {
    const fs = require('fs')
    fs.writeFileSync(path, data, function(error) {
        if (error != null) {
            log('--- 写入成功', path)
        } else {
            log('*** 写入失败', path)
        }
    })
}


const cachedUrl = function(options, callback) {
    //const fs = require('fs')
    // 先生成对应的文件
    //const path = options.url.split('/').join('-').split(':').join('-')
    // 先尝试去硬盘中读取这个 url 对应的文件
    //fs.readFile(path, function(err, data) {
        //if (err != null) {
            // 读取这个文件失败
            // 读不到的话说明是第一次请求，那么就使用 request
    request(options, function(error, response, body) {
        // 下载好了之后，保存到本地文件
        // TODO, 应该下载成功之后再保存
        // writeToFile(path, body)
        callback(error, response, body)
    })
        //} else {
            ///log('读取到缓存的页面', path)
            // 读取到，说明已经下载过了，我们讲直接读取硬盘上的文件
        //    const response = {
            //    statusCode: 200,
        //    }
        //    callback(null, response, data)
    //    }
    //})
}


const __main = function(number) {
    // 这是主函数
    // 知乎答案
    const url = 'http://email.91dizhi.at.gmail.com.8h3.space/video.php?viewtype=detailed&category=&page=' + number
    console.log('url:',url);
    // request 从一个 url 下载数据并调用回调函数
    // 根据 伪装登录爬虫设置图例 替换 cookie 和 useragent 中的内容
    // 这里 useragent 我已经替换好了, 替换上你自己的 cookie 就好了
    const cookie = '__cfduid=d0e1eb948d15ca911f8cfa47a3370ad6e1492936887; CLIPSHARE=3c7f375msgedi2tj2nrdm0bn82; show_msg=1; 91username=e174596549; DUID=0fdfcHJoEyPBRQfBH4aAdn32rwXhXSV%2FHIB%2FlpogJZua6%2Frs; USERNAME=d7dfoWqnBcKMdENh6KQi%2FnzH5ZmK9wgFzicJrjPvoYzhWnCmakbf; user_level=1; EMAILVERIFIED=no; level=1; watch_times=8; __utma=38902711.697155163.1492936888.1492936888.1492936888.1; __utmb=38902711.0.10.1492936888; __utmc=38902711; __utmz=38902711.1492936888.1.1.utmcsr=dizhi.space|utmccn=(referral)|utmcmd=referral|utmcct=/Cazn2/'
    const useragent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    const headers = {
        //'Cookie': cookie,
        'User-Agent': useragent,
    }

    const options = {
        url: url,
        headers: headers,
    }
    cachedUrl(options, function(error, response, body) {
        // 回调函数的三个参数分别是  错误, 响应, 响应数据
        // 检查请求是否成功, statusCode 200 是成功的代码
        if (error === null && response.statusCode == 200) {
            console.log('read');
            const answers = answersFromBody(body)

            // 引入自己写的模块文件
            // ./ 表示当前目录
            // const utils = require('./utils')
            // const path = 'zhihu.answers' + number + '.txt'
            // utils.saveJSON(path, answers)
        } else {
            log('*** ERROR 请求失败 ', error)
        }
    })
}

// 程序开始的主函数
var num = 2
// __main(num)
// var i = 2
setInterval(function() {
    __main(num++)
}, 1000)
