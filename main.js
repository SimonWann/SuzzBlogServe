const express = require('express')
const fs = require('fs')
const path = require('path') 
const session = require('express-session')
const mongoose = require('mongoose')
const CryptoJS = require('crypto-js')
const history = require('connect-history-api-fallback')
// let connect = require('connect')
const bodyParser = require('body-parser')
let urlencodedParser = bodyParser.json()


const userSchema = new mongoose.Schema({
    username: String,
    passwd: String,
    sentence: String,
    paperNum: Number,
    article: 
    [
        {
            title: String,
            introduction: String,
            content: String,
            date: Number
        }
    ]
})

const app = express()
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
mongoose.connect('mongodb://localhost/blog-system').then(() => {
    console.log('db connected successfully')
    // return new Promise(resolve =)
    // const User = mongoose.model('User', userSchema)
    return new Promise(resolve => {
        resolve('data')
    })
},err => {
    console.log('err',err)
})
.then((data) => {
    const User = mongoose.model('User', userSchema)
    console.log('model return successfully')
    app.get('/lo', (req, res) => {
        User.find({username: 'SimoooWann'}).find((err, data) => {
            if(err) return console.log(err)
            if(!data) return console.log('dataNotFound')
            console.log(data)
            data[0].passwd = 'There is no password'
            res.send(
                data[0]
            ) 
        })
        
    })
    app.post('/loginSubmit', urlencodedParser, (req, res) => {
        req.body.passwd = decryptoPw(req.body.passwd)
        // console.log(req.body)
        User.find({username: req.body.username}).find((err, data) => {
            if(err || data[0] == null) return res.send({err: 'Not this user'})
            if(data[0].passwd === req.body.passwd) {
                data[0].passwd = 'There is no password'
                res.send(data[0])
            } else {
                res.send({err: 'Login info error!'})
            }
        })
    })
    app.get('/test', (req, res) => {
        const SimoooWann = new User({
            username: 'SimoooWann',
            passwd: 'qq123123',
            sentence: '……而大海那么哦蔚蓝',
            paperNum: 1,
            article: [
                {
                    title: 'Javascript',
                    introduction: '通过 javascript 实现的一个js数据结构库，包含栈，队列，优先级队列，链表，双向链表等',
                    content: '通过 javascript 实现的一个js数据结构库，包含栈，队列，优先级队列，链表，双向链表等',
                    date: Date.now()
                }
            ]
        })
        SimoooWann.save((err, data) => {
            if(err) return console.log(err)
            res.send('ok')
        })
    })
    app.post('/editSubmit', urlencodedParser, (req, res) => {
        console.log(req.body)
        article = req.body.article
        currentNum = req.body.currentNum
        username = req.body.username
        User.findOneAndUpdate({ username }, { $set: {
            
        } }, (err, data) => {
            if(err) return console.log(err)
            if(!data) return 'err'
            console.log(data)
            if(currentNum === -1) {
                article.introduction = article.content.slice(0,30) + '……'
                data.article.push(article)
                data.paperNum++
                console.log('add successfully!')
                data.save()
                res.send('modified ok')
            } else {
                console.log(data.article[currentNum].content)
                data.article[currentNum].title = article.title
                data.article[currentNum].content = article.content
                data.article[currentNum].introduction = article.content.slice(0,30) + '……'
                data.save()
                res.send('modified ok') 
            }
            
        })
        
    })
    app.post('/deleSubmit', urlencodedParser, (req, res) => {
        // console.log(req.body.article,'delete')
        article = req.body.article
        currentNum = req.body.currentNum
        username = req.body.username
        User.findOneAndUpdate({ username },{}, (err, data) => {
            console.log('hello')
            if(err) return console.log(err)
            if(!data) return 'err'
            console.log(currentNum)
            if(data.article.length < 2) {
                console.log(currentNum,'remove!')
                data.article[currentNum].title = ''
                data.article[currentNum].content = ''
                data.article[currentNum].introduction = ''
            } else {
                console.log('splice')
                data.article && data.article.splice(currentNum,1)
                data.paperNum--
            }
            
            console.log(data)
            data.save()
            res.send('deleted~')
        })
    })
    app.post('/addSubmit', urlencodedParser, (req, res) => {
        article = req.body.article
        currentNum = req.body.currentNum
        username = req.body.username
        console.log(req.body)
        User.findOneAndUpdate({ username }, {}, (err, data) => {
            if(err) return console.log(err)
            if(!data) return 'err'
            
            data.article.splice(data.article.length,0,{
                title: article.title,
                content: article.content,
                introduction: article.content.slice(0,30) + '……'
            })
            console.log('addddddd',data)
        })
    })

}).catch((err) => {
    console.log('err')
})
// let db = mongoose.Connection
// db.on('error', console.error.bind(console, 'connection error'))
// db.once('open', () => {
//     console.log('db connected successsfully!')
//     let dbs = new Promise((resolve) => {
//         resolve()
//     })
// })
// dbs.then((data) => {
    
// })



app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'simoooh'
}))

app.post('/', (req, res) => {
    // console.log(response)
})

app.use('/',express.static(path.join(__dirname)))
app.use(history())
app.listen(3001, () => {
    console.log('3001,running!')
})

function encryptoPw(passwd) {
    return CryptoJS.AES.encrypt(passwd, 'guilinmifen').toString()
}
function decryptoPw(encryptoPw) {
    let bytes  = CryptoJS.AES.decrypt(encryptoPw, 'guilinmifen')
    return bytes.toString(CryptoJS.enc.Utf8)
}