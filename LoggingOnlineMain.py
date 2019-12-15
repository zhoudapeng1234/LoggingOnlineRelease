#LoggingOnline的主界面
from gevent import monkey
from bottle import route,run, template,default_app,static_file,request,redirect
from beaker.middleware import SessionMiddleware
import os,sys
from LoggingDataDBManage import LoggingDataDBManage
from UserInfoDBManage import UserInfoDBManage
from DataPreprocess import DataPreprocess
import json
import bottle
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024 # (or whatever you want)
monkey.patch_all()
#获取本脚本所在的路径
pro_path = os.path.split(os.path.realpath(__file__))[0]
sys.path.append(pro_path)

#定义资源路径，即静态资源路径，如css,js,及样式中用到的图片等各种静态资源
Assets_path = '/'.join((pro_path,'Assets'))


def checkLogin(fn):
    """验证登陆，如果没有登陆，则跳转到login页面"""
    def BtnPrv(*args,**kw):
        s = request.environ.get('beaker.session')
        userID = s.get('userid',None)
        if not userID:
            return redirect('/login')
        return fn(userID)
    return BtnPrv


@route('/Assets/<filename:re:.*\.css|.*\.js|.*\.png|.*\.jpg|.*\.gif|.*\.ico>')
def server_static(filename):
    """定义/assets/下的静态(css,js,图片)资源路径"""
    return static_file(filename, root=Assets_path)

#这里需要注意GET和POST的响应
@route('/', method = "GET")
@checkLogin
def LoggingOnlineMain(userID):
    return template('LoggingOnlineMain')

@route('/login', method = "GET")
def Login():
    return template('Login', message='')  # 模板可以使用html

#注册界面提示，以邮箱方式实现用户的创建
@route('/register', method = "POST")
def Register():
    registerName = request.forms.get('username')
    registerPassword = request.forms.get('password')
    email = request.forms.get('email')

    sender = '******@126.com'
    receiver = list()  # 接收者列表
    receiver.append('******@qq.com')
    copyReceive = list()  # 抄送者列表
    copyReceive.append('******@126.com')  # 添加到抄送列表
    username = '******@126.com'  # 发件人邮箱账号
    password = '******'  # 授权密码
    mailall = MIMEMultipart()
    mailall['Subject'] = "LoggingOnline账号申请！！！"  # 记住一定要设置，并且要稍微正式点
    mailall['From'] = sender  # 发件人邮箱
    mailall['To'] = ';'.join(receiver)  # 收件人邮箱,不同收件人邮箱之间用;分割
    mailall['CC'] = ';'.join(copyReceive)  # 抄送邮箱
    mailcontent = '申请者邮箱{}；申请账号名{}；申请密码{}'.format(email, registerName,registerPassword)
    mailall.attach(MIMEText(mailcontent, 'plain', 'utf-8'))
    fullmailtext = mailall.as_string()
    smtp = smtplib.SMTP_SSL('smtp.126.com', 465)
    smtp.login(username, password)
    smtp.sendmail(sender, receiver + copyReceive, fullmailtext)  # 发送的时候需要将收件人和抄送者全部添加到函数第二个参数里
    smtp.quit()
    return 'Wait the confirm email. You will receive the confirm email a few minutes later'

@route('/login', method = "POST")
def Login():
    userName = request.forms.get('username')
    passWord = request.forms.get('password')
    remember = request.forms.get('remember')
    ##更新session中的用户信息
    if UserInfoDBManage().CheckUser(userName,passWord):
        s = request.environ.get('beaker.session')
        s['userid'] = userName
        s.save()
        return redirect('/')
    else:
        message = '帐号或密码错误！'
        return template('login', message=message)

#从数据库中删除单井关联的所有文件
@route('/DeleteWellFromServer', method = "GET")
@checkLogin
def DeleteWellFromServer(userID):
    tableName = request.query.tableName
    dataBaseName = userID
    LoggingDataDBManage().DeleteWellFromDB(dataBaseName, tableName)



#从数据库中获取岩性解释数据
@route('/DLLithologyFromServer', method = "GET")
@checkLogin
def DLLithologyFromServer(userID):
    tableName = request.query.tableName
    dataBaseName = request.query.dataBaseName
    if not dataBaseName:
        dataBaseName = userID
    lithologys = LoggingDataDBManage().DLLithologyFromDB(dataBaseName, tableName)
    return json.dumps(lithologys)


#从数据库中获取绘图参数数据
@route('/DLPlotParaFromServer', method = "GET")
@checkLogin
def DLPlotParaFromServer(userID):
    tableName = request.query.tableName
    dataBaseName = request.query.dataBaseName
    if not dataBaseName:
        dataBaseName = userID
    plotParameters = LoggingDataDBManage().DLPlotParaFromDB(dataBaseName, tableName)
    return json.dumps(plotParameters)


#从数据库中获取测井数据
@route('/DLLoggingDataFromServer', method = "GET")
@checkLogin
def DLLoggingDataFromServer(userID):
    tableName = request.query.tableName
    dataBaseName = request.query.dataBaseName
    if not dataBaseName:
        dataBaseName = userID

    loggingDataJson = LoggingDataDBManage().DLLoggingDataFromDB(dataBaseName, tableName)
    return json.dumps(loggingDataJson)

#获取数据库中的井名
@route('/DLWellNamesFromServer', method = "GET")
@checkLogin
def DLTablesNameFromServer(userID):
    dataBaseName = userID
    wellNamesJson = LoggingDataDBManage().DLWellNamesFromDB(dataBaseName)
    return json.dumps(wellNamesJson)

#上传测井数据
@route('/ULLoggingDataToServer', method = "POST")
@checkLogin
def ULLoggingDataToServer(userID):
    dataBaseName = request.query.dataBaseName
    tableName = request.query.tableName
    if not dataBaseName:
        dataBaseName = userID
    LoggingDataDBManage().ULLoggingDataToDB(dataBaseName,tableName,request.json)

#上传绘图参数
@route('/ULPlotParametersToServer', method = "POST")
@checkLogin
def ULPlotParametersToServer(userID):
    tableName = request.query.tableName
    dataBaseName = request.query.dataBaseName
    if not dataBaseName:
        dataBaseName = userID
    LoggingDataDBManage().ULPlotParametersTable(dataBaseName,tableName,request.json)

#上传岩性解释数据
@route('/ULLithologysToServer', method = "POST")
@checkLogin
def ULLithologysToServer(userID):
    wellName = request.query.wellName
    dataBaseName = request.query.dataBaseName
    if not dataBaseName:
        dataBaseName = userID
    LoggingDataDBManage().ULLithologyTable(dataBaseName,wellName+'_litho',request.json)
    ##判断是否为协作井
    cooperators = LoggingDataDBManage().DLCooperatorsTableFromDB(dataBaseName, wellName+'_coop')
    if cooperators:
        LoggingDataDBManage().AddBlockChainToDB(dataBaseName,wellName+'_block',userID,request.json)

#上传协作用户表
@route('/ULCooperatorToServer', method = "POST")
@checkLogin
def ULCooperatorToServer(userID):
    dataBaseName = userID
    tableName = request.query.tableName
    cooperator = request.query.cooperator
    operation = request.query.operation
    if "Add"==operation:
        LoggingDataDBManage().AddCooperatorToDB(dataBaseName,tableName,cooperator)
    else:
        LoggingDataDBManage().DeleteCooperatorFromDB(dataBaseName,tableName,cooperator)

#获取数据库中的协作用户表
@route('/DLCooperatorsFromServer', method = "GET")
@checkLogin
def DLCooperatorsFromServer(userID):
    dataBaseName = userID
    tableName = request.query.tableName
    cooperators = LoggingDataDBManage().DLCooperatorsTableFromDB(dataBaseName,tableName)
    return json.dumps(cooperators)

@route('/DeleteTableFromServer',method = "Get")
@checkLogin
def DeleteTableFromServer(userID):
    tableName = request.query.tableName
    dataBaseName = userID
    LoggingDataDBManage().DeleteTableFromDB(dataBaseName,tableName)


#下载协作井信息表
@route('/DLCoopWellsFromServer', method = "GET")
@checkLogin
def DLCoopWellsFromServer(userID):
    dataBaseName = userID
    tableName = userID+'_coop'
    wells = LoggingDataDBManage().DLCoopWellsFromDB(dataBaseName,tableName)
    return json.dumps(wells)


#用于获取数据预处理的计算结果
@route('/CalcCubicSplineFromServer', method = "POST")
@checkLogin
def CalcCubicSplineFromServer(userID):
    interDistance = request.query.interDistance
    loggingData = DataPreprocess().CubicSpline(request.json,float(interDistance))
    return json.dumps(loggingData)


#程序入口
if __name__ == '__main__':
    app = default_app()
    #设置session参数
    session_opts = {
        'session.type': 'file',
        'session.timeout': 3600,
        'session.data_dir': './sessions',
        'session.auto': True
    }
    app = SessionMiddleware(app, session_opts)
    run(app=app,host='0.0.0.0', port=80,debug=True,server='gevent')