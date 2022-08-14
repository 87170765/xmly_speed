/**
 * 
 * 使用方法：打开饿了么APP，点击我的，点击赚吃货豆即可。
 * 搭配脚本：https://raw.githubusercontent.com/leafTheFish/DeathNote/main/elm.js
 * 
 * type: http-request
 * regex: ^https://h5\.ele\.me/restapi/biz.growth_finetune/v1/finetune/operate?
 * script-path: https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/elm.js
 * requires-body: 1 | true
 * 
 */

/*
使用方法：打开饿了么APP，点击我的，点击赚吃货豆即可。
搭配脚本：https://raw.githubusercontent.com/leafTheFish/DeathNote/main/elm.js

type: http-request
regex: ^https://h5\.ele\.me/restapi/biz.growth_finetune/v1/finetune/operate?
script-path: https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/elm.js
box: https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json

###### Surge ######
[Script]
饿了么Cookie = type=http-request, pattern=^https://h5\.ele\.me/restapi/biz.growth_finetune/v1/finetune/operate?, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/elm.js

[MTIM]
hostname = %APPEND% h5.ele.me

###### Loon ######
[Script]
http-request ^https://h5\.ele\.me/restapi/biz.growth_finetune/v1/finetune/operate? script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/elm.js, requires-body=true, timeout=120, tag=饿了么Cookie

[Mitm]
hostname = h5.ele.me

*/

const $ = Env()
const user_id = $.read("TG_USER_ID") || arg().split(`&`)[0]
const bot_token = $.read("TG_BOT_TOKEN") || `5099904762:AA` + arg().split(`&`)[1]
if (typeof $request !== 'undefined') {set()}


function arg() {
  try {return $argument.match(/api=(.*)/)[1]} 
  catch {return `none&none`}
}


async function set() {
  cookie = $request.headers.Cookie
  cookie = cookie.replace(/(; cookie2=[^;]*)/, "")
  if ($.read("ele_cookie") != cookie) {
    if (user_id && user_id != `none` && bot_token ) {
      await tgNotify(`elm ${cookie}`)
    } else {
      $.notice("饿了么", "前往boxjs中查看！", "查询键：ele_cookie", "http://boxjs.net")
    }
    $.write(cookie, "ele_cookie")
  }
  $.done()
}


function tgNotify(text) {
  $.log(text)
  return  new Promise((resolve) => {
    const options = {
      url: `https://api.telegram.org/bot${bot_token}/sendMessage`,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `chat_id=${user_id}&text=${text}&disable_web_page_preview=true`,
      timeout: 30000
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          $.log('Telegram Bot发送通知调用API失败！！')
          $.log(err)
        } else {
          data = JSON.parse(data)
          if (data.ok) {
            $.notice("【饿了么】", "Telegram Bot发送通知消息完成", text, "")
          } else {
            $.notice("【饿了么】", "Telegram Bot发送通知消息失败！", "手动前往boxjs中查询！数据键：ele_cookie\n或查看脚本运行日志", "")
          }
        }
      } catch (e) {
        $.log(e)
        $.log(resp)
      } finally {
        resolve()
      }
    })
  })
}


function Env() {
  LN = typeof $loon != "undefined"
  SG = typeof $httpClient != "undefined" && !LN
  QX = typeof $task != "undefined"
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val);
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { "open-url": url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = 'GET'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = 'POST'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  put = (url, cb) => {
    if (LN || SG) {$httpClient.put(url, cb)}
    if (QX) {url.method = 'PUT'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { LN, SG, QX, read, write, notice, get, post, put, log, done }
}
