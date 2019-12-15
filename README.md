# LoggingOnline测井解释平台设计方案
LoggingOnline是一款基于Web（BS架构）的在线测井解释平台，通过区块链技术提供数据追踪，其和其他平台最主要的区别体现在Online（在线）上，目前大多数的测井解释软件和平台多为单机版或客户端-服务器。设计这个平台的主要目的是为了弥补测井解释软件在这方面的缺陷，尝试使用新的技术构建测井解释软件。该平台以web应用的思路进行开发，尝试将这种软件开发思路应用于测井解释，这样对于开发者来说不存在传统软件所面临的系统不同以及软件版本更新的问题，对于使用者来说只要有一个浏览器就可以进行操作，随时使用。开发遵循的主体思路：既然是Online的，那么一定要体现其在线的特性，甚至为此可以牺牲一些离线的功能，不知道这种软件思路和测井能否碰撞出什么火花，期待平台的完成，其部署图如下。

![图片](https://uploader.shimo.im/f/aZZ7Zu8he9UQIO5O.png!thumbnail)

该平台基于Python的Bottle Web框架，采用经典的MVC架构进行设计：模型（Model）、视图（View）、控制器（Controller）分别对应功能结构上的3个部分：数据管理，绘图显示，消息响应。

数据管理（Model）负责MySQL数据库的管理以及后期各种解释算法的添加，其搭建在阿里云平台，采用Python的MyPySQL进行数据的读写。

绘图显示（View）负责测井数据的图像绘制，包括测井曲线、以及岩性解释图道的绘制，使用的开源库Highcharts进行曲线的绘制。

消息响应（Controller）负责响应用户的输入操作，分为两部分：前端和服务器，其中前端负责与用户的界面交互，如导入数据、修改绘图参数，上传数据到服务器等操作，使用jQuery(读取数据)，jQueryUI(交互界面)等开源库实现；服务器负责消息的传递、下载数据和结果反馈，前端与后端的通信采用Https协议，数据采用json格式。

![图片](https://uploader.shimo.im/f/gERlqsUw6ocRsS74.png!thumbnail)![图片](https://uploader.shimo.im/f/Dd7tlnn8gdQRZVtN.png!thumbnail)

# 一、需求分析（用例图）：
基于BS架构的测井解释平台，根据不同的用户角色设计不同的功能模块，目前以注册用户涉及的功能为主，实现绘图显示，岩性编辑，测井解释，数据管理；管理员涉及的功能模块将在下一个版本中实现。 平台用例图如下：

![图片](https://uploader.shimo.im/f/9T8YFpgPJiMWgp7W.png!thumbnail)

# 二、平台设计：
该平台目前包括的主要功能有：用户登录、本地数据文件导入、绘图参数设置、岩性划分、数据库管理以及协作解释等几个部分。

## 2.1 用户登录
用户登录包括新用户注册以及已有用户登录这两个功能。

### 2.1.1 用户注册
用户注册需要填写用户名，密码，以及注册邮箱，提交相关信息后管理员会收到注册申请邮件，管理员在后台添加相关的数据库以及表，添加完成后给注册邮箱发送注册成功邮件。

### 2.1.2 用户登录
登录页面实现用户的登录和注册管理，具有输入信息验证功能，能验证输入信息的有效性。用户信息统一保存在数据库中的用户信息记录表（loggingOnline）中。管理员用户主要负责用户的管理工作，包括创建、删除用户，权限变更等用户管理工作，管理数据库中的用户信息记录表。

| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 用户名   | varchar(50)   | Yes   | No   | 用户名   | 
| 2   | 密码   | varchar(50)   | No   | No   | 密码   | 
| 3   | 用户权限   | int   | No   | No   | 0:管理员;1:普通用户   | 


## 2.2 本地CSV数据文件导入  
外部导入的数据是平台最原始的数据来源，考虑到数据通用性，这里采用csv作为输入数据格式，数据在本地时加载数据的活动图如下：

![图片](https://uploader.shimo.im/f/ez2us0qG7jMDX3mu.png!thumbnail)

考虑到测井数据的特殊性，至少需要包括深度、参数名称以及单位这3种属性。同时为了兼容后面添加的智能解释功能，设计数据内容格式如下（参数名称等内容不建议为中文，如果使用中文必须确保编码为utf8）：

第一行：参数名称。

第二行：曲线标知。

第三行：参数单位。

从第四行开始为数据内容。

注：曲线标知具有唯一性，不同文件中具有相同标识的曲线具有一致的物理意义（单位相同），这主要是考虑到不同文件中参数名称和单位可能不一致，比如文件A中（Depth 0 m ）和文件B中（深度 0 米）具有相同的物理意义，为了统一参数以及后面人工智能解释准备。目前设计方案为，0代表深度（m）；负数代表解释后的参数（孔渗饱等）；1代表井径（in）；2代表密度（g/cm3）；3代表伽马（API）；4代表声波时差（us/m）；5代表自然电位（mv）；6代表深侧向电阻率（om）；7代表浅侧向电阻率（om）；8代表中子测井()，如果遇到没有单位的情况空着不填即可。

![图片](https://uploader.shimo.im/f/FlEAU8tp0Kg2nQvG.png!thumbnail)

## 2.3 前端数据格式设计
前端负责数据的可视化和用户交互，前端中的数据格式主要包括：测井数据，绘图模板以及岩性解释这3部分。

1、测井数据（loggingData）的数据格式，采用字典的形式，字典的键位测井参数名。

![图片](https://uploader.shimo.im/f/N10uW4ez1Kwts53g.png!thumbnail)

2、绘图模板（plotParameters）的数据格式，采用列表的形式，使用列表主要考虑图道之间有较强的先后逻辑关系。

![图片](https://uploader.shimo.im/f/fOCAZm6i2QU11mJJ.png!thumbnail)

3、岩性解释（lithologyInterpretation）的数据格式，采用列表的形式，使用列表主要考虑岩性分层之间也有较强的深浅逻辑关系。

![图片](https://uploader.shimo.im/f/hlcBAl3m3v4Ehck9.png!thumbnail)

## 2.4 前后端数据传输
数据采用json格式直接传递，传递的数据包括：测井曲线、绘图模板以及岩性解释。其中测井曲线数据以参数名称为键值：{参数名称 : {identification : 曲线标识, unit: "参数单位", rawData: [原始数据], minValue : 最小值, maxValue : 最大值 }}；

| 字段   | 类型   | 说明   | 
|:----:|:----:|:----:|
| identification    | int   | 曲线标识   | 
| unit   | string   | 参数单位   | 
| rawData   | [float]   | 原始数据   | 
| minValue    | float   | 最小值   | 
| maxValue    | float   | 最大值    | 


绘图模板的数据格式：{[{paraName : "参数名称", depthStart : 起始深度, depthEnd : 结束深度,  tickInterval : 显示间隔,  minValue : 绘图最小值,  maxValue : 绘图最大值, depthScale : 深度比例尺, plotStyle: "图道类型", width: 图道宽度 }]}；

| 字段   | 类型   | 说明   | 
|:----:|:----:|:----:|
| paraName    | string   | 参数名称   | 
| depthStart    | float   | 绘图起始深度   | 
| depthEnd    | float   | 绘图结束深度   | 
| tickInterval    | float   | 显示间隔   | 
| minValue    | float   | 绘图最小值   | 
| maxValue    | float   | 绘图最大值   | 
| depthScale    | float   | 深度比例尺   | 
| plotStyle   | string   | 图道类型   | 
| width   | int   | 图道宽度   | 


岩性解释的数据格式：{[{lithologyName : "岩性名称", startDepth : "起始深度", endDepth : "结束深度"}]}

| 字段   | 类型   | 说明   | 
|:----:|:----:|:----:|
| lithologyName    | string   | 岩性名称   | 
| startDepth    | float   | 起始深度   | 
| endDepth    | float   | 结束深度   | 


## 
## 2.5 数据库数据加载
数据库中的数据保存在云端数据库，通过数据库管理模块进行数据的调用，加载数据的活动图如下：

### ![图片](https://uploader.shimo.im/f/v8EHwa0OnbgplrsL.png!thumbnail)

测井数据保存在MySQL数据库中，MySQL数据库中的数据表只能是二维表结构，数据库中的数据格式需要特殊设计。为方便管理，这里为每一个用户创建一个以用户名命名的数据库database（userName）用于存放数据，其中包含唯一一个关系表（userName）用于存放各表之间的对应关系，唯一一个协作数据库表用于管理他人分享的协作数据，这种设计也是为后面添加多井管理留出数据接口。目前只涉及到单井数据，多井数据格式暂不考虑，后面拓展也可以使用类似的数据结构。为了处理简便，这里尽量保留较少的数据类型。

![图片](https://uploader.shimo.im/f/0NrH5DIUDqQLSk6j.png!thumbnail)

### **2.5.1 协作数据库表中的数据：**
| 序号   | 列名   | 数据类型   | 主键   | 外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 用户ID   | varchar(50)   | No   | No   | 数据来源于哪个用户   | 
| 2   | 井名   | varchar(50)   | No   | No   |  井名(不同用户的井名可相同)   | 

### **2.5.2 对应关系表中的数据：**
| 序号   | 列名   | 数据类型   | 主键   | 外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 井名   | varchar(50)   | Yes   | No   | 井名为主键具有唯一性   | 
| 2   | 参数解释表名   | varchar(50)   | No   | No   |  单井对应的参数解释表名   | 
| 3   | 测井数据表名   | varchar(50)   | No   | No   | 单井对应的测井数据表名   | 
| 4   | 绘图参数表名   | varchar(50)   | No   | No   | 单井对应的绘图参数表名   | 
| 5   | 岩性解释表名   | varchar(50)   | No   | No   | 单井对应的岩性解释表名   | 
| 6   | 协作用户表名   | varchar(50)   | No   | No   | 单井对应的协作用户表名   | 
| 7   | 区块链记录表名   | varchar(50)   | No   | No   | 单井对应的区块链记录表名   | 

### **2.5.3 参数解释表中的数据：**
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 参数名   | varchar(50)   | No   | No   | 测井数据参数名   | 
| 2   | 参数标识   | int   | No   | No   | 参数的唯一标识   | 
| 3   | 单位   | varchar(50)   | No   | No   | 参数的单位   | 
| 4   | 最小值   | float   | No   | No   | 该参数测井数据的最小值   | 
| 5   | 最大值   | float   | No   | No   | 该参数测井数据的最大值   | 

### **2.5.4 测井数据表中的数据：**
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 参数1   | float   | No   | No   | 参数1对应的测井数据   | 
| 2   | 参数2   | float   | No   | No   | 参数2对应的测井数据   | 
| 3   | 参数3   | float   | No   | No   | 参数3对应的测井数据   | 
| ......   | ......   | ......   | ......   | ......   | ......   | 

### **2.5.5 绘图参数表中的数据：**
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 参数名称   | varchar(50)   | No   | No   | 图道中绘制的参数   | 
| 2   | 起始深度   | float   | No   | No   | 绘图的起始深度   | 
| 3   | 结束深度   | float   | No   | No   | 绘图的结束深度   | 
| 4   | 标识间隔   | float   | No   | No   | 深度的标识间隔   | 
| 5   | 最小值   | float   | No   | No   | 绘图的最小值   | 
| 6   | 最大值   | float   | No   | No   | 绘图的最大值   | 
| 7   | 比例尺   | int   | No   | No   | 绘图的深度比例尺   | 
| 8   | 绘图类型   | varchar(50)   | No   | No   | 图道的类型   | 
| 9   | 图道宽度   | int   | No   | No   | 图道的宽度   | 

### **2.5.6 岩性解释表中的数据：**
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 岩性名称   | varchar(50)   | No   | No   | 该段的岩性名称   | 
| 2   | 起始深度   | float   | No   | No   | 该段岩性的起始深度   | 
| 3   | 结束深度   | float   | No   | No   | 该段岩性的结束深度   | 

### 2.5.7 协作用户表中的数据：
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 用户ID   | varchar(50)   | Yes   | No   | 该井除所有者外的协作者   | 

### 2.5.8 区块链记录表中的数据：
| 序号   | 列名   | 数据类型（长度）   | 是否主键   | 是否外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | ID   | INT UNSIGNED | Yes   | No   | AUTO_INCREMENT   | 
| 2   | 用户ID   | varchar(50)   | No   | No   | 当前区块的用户名   | 
| 3   | 前一个区块签名   | varchar(256)   | No   | No   | 前一个区块的签名   | 
| 4   | 当前区块签名   | varchar(256)   | No   | No   | 当前区块的签名   | 
| 5   | 当前区块内容   | mediumblob   | No   | No   | 当前区块的内容   | 


## 2.6 设置绘图参数
设置绘图参数模块主要实现的是绘图参数的修改，包括：显示深度、显示顺序、显示的幅值范围、比例尺、道宽、图道类型等，以修改参数为例其时序图如下。

![图片](https://uploader.shimo.im/f/qp4Di6KhsBY6pMlF.png!thumbnail)


## 2.7 岩性划分
岩性划分模块主要实现的是岩性地层的划分，根据国标GB958-89《区域地质图图例》设计了常用的30种岩性符号，暂时不支持岩性自定义功能，以添加地层岩性为例其时序图如下。

![图片](https://uploader.shimo.im/f/fvJOuz5hDaEqL0I5.png!thumbnail)

## 2.8 个人数据库管理
数据库管理模块主要负责上传数据到数据库、删除数据文件、下载数据文件等数据管理功能。这里的上传、删除和下载指的是该井名关联的所有文件，包括：数据文件、绘图文件以及岩性文件。其中下载http接口对应：（DLLithologyFromServer、DLPlotParaFromServer、DLLoggingDataFromServer） 上传http接口对应：（ULLoggingDataToServer、ULPlotParametersToServer、ULLithologysToServer ）删除http接口对应：（DeleteWellFromServer）。

![图片](https://uploader.shimo.im/f/JyBNhtaVovIEN1kN.png!thumbnail)

## 2.9 协作数据库管理
协作数据库中存放着当前用户需要协作处理的井，由于是协作数据只提供数据下载的功能。数据的上传功能不在这里提供。

![图片](https://uploader.shimo.im/f/eNqYP96WPg4QRcpV.png!thumbnail)

## 2.10 管理协作者
协作者管理用于添加、删除当前井的协作者，只有当前井的所有者有权限管理协作者，协作者无权管理协作者。

![图片](https://uploader.shimo.im/f/dSWJSIUJ5NQisAUf.png!thumbnail)

## 2.11 区块链保存解释流程
由于测井解释流程的特殊性和专业性，一口井的解释往往需要不同人在不同阶段完成不同的任务，主要可以分为数据预处理，测井资料定性解释，测井综合解释，在实际工作中，不同的情况下会有不同的任务划分。每个阶段的处理都影响着最终结果，对每个处理阶段的管控十分重要，区块链具有去中心化、开放性、独立性、安全性以及匿名性的特点，非常适合这种复杂情况下的数据追踪。利用分布式账本，我们可以清晰记录测井解释的每一个步骤，其高度的透明性和安全性，可以确保数据不被篡改，保证责任落实到每一个步骤的负责人。

目前只有岩性划分涉及解释数据上传，区块链的实现也围绕着这一部分，在点击“保存岩性文件到数据库后”，后台服务器会分析数据是否进行了修改，从而判断是否添加区块链中的新区块。区块的签名是由“用户名+前一个区块的签名+岩性解释”计算得来的，可以保证数据的准确性和真实性。

## 2.10 服务器框架设计
服务器在Python环境下采用Bottle框架进行搭建，主程序文件为：LoggingOnlineMain.py，数据库管理类：LoggingDataDBManage.py。其中LoggignOnlineMain.py主要负责服务器的运行以及处理相关的http请求，LoggingDataDBManage.py主要负责数据库管理，供LoggingOnlineMain.py调用。

### 2.10.1 LoggingOnlineMain对应的接口函数
![图片](https://uploader.shimo.im/f/v4LiUn4AloMPaJLa.png!thumbnail)

### 2.10.2 LoggingDataDBManage对应的类图
![图片](https://uploader.shimo.im/f/P9DV4pzsZeIlOpTS.png!thumbnail)

### 2.10.3 UserInfoDBManage对应的类图
![图片](https://uploader.shimo.im/f/oklZAnLPjsQ4q6ig.png!thumbnail)

## 2.11 数据库结构设计
数据库目前主要用于数据的存储，暂时不涉及复杂的查询和，复杂的表结构。数据库中的数据格式设计详见2.5，数据库中各表之间的实体-联系图如下。

![图片](https://uploader.shimo.im/f/Ex8XB3YRELgXFPYA.png!thumbnail)

# 三、使用说明书
本平台基于Google浏览器开发，暂时没有设置浏览器兼容配置，建议使用Google浏览器作进行操作，打开浏览器，输入网址：[http://zhoudapeng.top](http://zhoudapeng.top) 进入主界面，目前只有导入数据、设置绘图参数、岩性划分、数据管理这四部分功能：

![图片](https://uploader.shimo.im/f/ZWX3d8mPtwEizldz.png!thumbnail)

## 3.1 数据导入
数据导入功能是数据的来源，将外部数据导入解释平台进行处理，导入的测井数据格式要满足章节2.1.1 外部导入的数据格式中的要求。单击导入测井数据，这里以附件中的well1Data为例：

![图片](https://uploader.shimo.im/f/L5xsgRze51QMuk9W.png!thumbnail)

选择对应的测井数据文件，加载数据后，会根据数据默认生成绘图参数，并进行测井曲线的绘制。

![图片](https://uploader.shimo.im/f/D55RhbS6JmEJVaAi.png!thumbnail)

## 3.2 设置绘图参数
绘图参数的修改目前主要包括绘图比例尺、绘图的深度范围、绘图的数值范围、绘图的道宽、绘图的图道类型以及绘图的顺序。

![图片](https://uploader.shimo.im/f/HsMvimwF8i0qZepb.png!thumbnail)

要修改绘图参数，首先需要选择待修改的参数，由于目前只涉及单井的处理，所以深度显示范围，深度比例此具有全局一致性，也就是你修改任意一个测井参数的深度和比例尺，全局的深度范围和比例尺都会修改，图道类型、幅值范围以及道宽不受此限制，如果需要调整绘图顺序拖动右侧参数重新排列即可。点击“确认修改”可以看到修改后的效果，如果右侧参数列表中没有当前激活的参数，点击“确认修改”后就会添加新的图道，点击“确认删除”可以在绘图中删除激活的测井参数。点击“保存绘图参数到数据库”用于将绘图参数上传至数据库进行保存，如果数据是来源于外部导入的数据，首先应上传数据到数据库，然后再进行绘图参数的保存（操作详情见3.4 章节）。

![图片](https://uploader.shimo.im/f/LjEpD0zEnTsRrrk5.png!thumbnail)

修改绘图参数，调整比例尺后的绘图如下：

![图片](https://uploader.shimo.im/f/iBQ5RF1FmUw0roN6.png!thumbnail)

## 3.3 岩性划分
岩性划分主要用于地层岩性的划分，包括岩性种类、起始深度以及结束深度这三个参数的设置。

![图片](https://uploader.shimo.im/f/CeP2JRu4gK8asv2W.png!thumbnail)

要划分地层岩性，首先需要选择岩性类型，然后输入起始深度和结束深度。如果右侧地层列表没有展开，“确认修改”实现的是添加地层的功能，如果右侧地层列表有展开，“确认修改”实现的是修改地层参数的功能；点击“确认删除”可以删除右侧岩性列表展开的地层。点击“保存岩性文件到数据库”用于将岩性解释上传至数据库进行保存，如果数据是来源于外部导入的数据，首先应上传数据到数据库，然后再进行岩性文件的保存（操作详情见3.4 章节）。

![图片](https://uploader.shimo.im/f/6FpQxQsbR0sQa7K7.png!thumbnail)

## 3.4 数据管理
数据管理模块主要用于数据库文件的管理，包括添加数据到数据库、加载测井数据文件以及删除测井数据文件。添加数据到数据库实现将导入的测井数据上传致数据库，在上传数据的同时还会上传绘图参数以及岩性解释结果，测井数据的命名应该保证唯一性，不能重复；加载测井数据实现从数据库导入测井数据，同时导入绘图参数以及岩性解释结果；删除数据实现从数据库中删除选择的测井数据，从而对数据进行管理。

![图片](https://uploader.shimo.im/f/Ew4bWMJXeW8xIkSw.png!thumbnail)

# 四、开发注意事项
开发注意事项是指在开发过程中遇到的一些坑，这里选取部分进行说明，这些缺陷暂时通过一些技术手段进行了处理，不影响用户使用，后期可以考虑重新设计，从根本上解决问题。

## 4.1 数据库格式：
目前数据库中每种功能的数据都是单独用表保存的，主要因为开始设计的时候只考虑了基本功能，并且对数据库的使用也不熟悉。到目前每新加一口井就会创建6张表，这会造成数据库中表数量过多，实际上这些表均可使用blob数据类型进行替换，即每个用户一张表即可。

| 序号   | 列名   | 数据类型   | 主键   | 外键   | 说明   | 
|:----:|:----:|:----:|:----:|:----:|:----:|
| 1   | 井名   | varchar(50)   | Yes   | No   | 井名为主键具有唯一性   | 
| 2   | 参数解释表   | mediumblob   | No   | No   |  单井对应的参数解释表   | 
| 3   | 测井数据表   | mediumblob   | No   | No   | 单井对应的测井数据表   | 
| 4   | 绘图参数表   | mediumblob   | No   | No   | 单井对应的绘图参数表   | 
| 5   | 岩性解释表   | mediumblob   | No   | No   | 单井对应的岩性解释表   | 
| 6   | 协作用户表   | mediumblob   | No   | No   | 单井对应的协作用户表   | 
| 7   | 区块链记录表   | mediumblob   | No   | No   | 单井对应的区块链记录表   | 



## 4.1 MySQL数据库操作：
按目前的实现逻辑，在用户注册账号后需要为其创建相应的数据库以及数据表，对应的MySQL命令：

1、创建并插入用户信息

```
create database LoggingOnline default character set = 'utf8';
 CREATE TABLE `LoggingOnline` (`userName` varchar(50),`passWord` varchar(50) ,
  `privilege`  int , PRIMARY KEY (`userName`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;
insert into LoggingOnline (userName,passWord,privilege) values ('name1','123456','1');
```
### 2、创建用户个人数据库以及相关表

```
create database name1 default character set = 'utf8';
CREATE TABLE `name1_coop`( `userName` VARCHAR(50), `wellName` VARCHAR(50) )ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `name1`( `wellName` VARCHAR(50), `parasInterpTable` VARCHAR(50), `loggingDataTable` VARCHAR(50), `plotParametersTable` VARCHAR(50), `lithologyTable` VARCHAR(50), `cooperatorsTable` VARCHAR(50) ,`blocksTable` VARCHAR(50), PRIMARY KEY ( `wellName` ) )ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## 4.2 HighChart限制：
1、数据量较大时需要延x轴绘图再互换坐标轴，才能不影响屏幕取值功能。

2、绘图时数据要按升序排列，才能不影响幅值范围的设置，具体表现在深度范围的设置上。



