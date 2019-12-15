import pymysql
import logging
import hashlib
import json
import pickle
#数据格式为一个账户对应一个数据库，一口井的数据对应一张表
class LoggingDataDBManage:
    def __init__(self):
        #通用参数相当于静态成员变量
        self.db_user = 'root'
        self.db_pass = '******'
        self.db_ip = 'localhost'
        self.db_port = 3306

#读取数据库中的所有内容,返回字典格式数据，主要考虑数据库列的顺序会变。
    def ExecuteReadAllData(self,dataBaseName,tableName):
        outDicData = {}
        """ 连接mysql数据库（读），并进行读的操作"""
        try:
            conn = pymysql.connect(db=dataBaseName, user=self.db_user, passwd=self.db_pass, host=self.db_ip,
                                   port=int(self.db_port), charset="utf8")  # 连接数据库
            cursor = conn.cursor()
        except Exception as e:
            print(e)
            logging.error('数据库连接失败:%s' % e)
            return {}

        try:
            command_GetColumnsPara = '''show columns from {};'''.format(tableName)
            cursor.execute(command_GetColumnsPara)
            parameters = [row[0] for row in cursor.fetchall()]  # 将数据库返回的元组转换为列表
            for parameter in parameters:
                command_GetColumnData = '''select {} from {};'''.format(parameter, tableName)
                cursor.execute(command_GetColumnData)
                outDicData[parameter] = [row[0] for row in cursor.fetchall()]
        except Exception as e:
            logging.error('数据读取失败:%s' % e)
            return {}
        finally:
            cursor.close()
            conn.close()
        return outDicData

#读取数据库中的一列/一行内容
    def ExecuteReadOne(self,dataBaseName,sql,column=True):
        """
                连接mysql数据库（读），并进行读的操作
                """
        try:
            conn = pymysql.connect(db=dataBaseName, user=self.db_user, passwd=self.db_pass,
                                   host=self.db_ip, port=int(self.db_port), charset="utf8")
            cursor = conn.cursor()
        except Exception as e:
            print(e)
            logging.error('数据库连接失败:%s' % e)
            return []

        try:
            cursor.execute(sql)
            if column:
                getData = [row[0] for row in cursor.fetchall()]  # 将数据库返回的元组转换为列表
            else:
                getData = cursor.fetchall()[0] #直接返回元组只读1行
        except Exception as e:
            logging.error('数据读取失败:%s' % e)
            return []
        finally:
            cursor.close()
            conn.close()
        return getData


#写入数据到数据库中
    def ExecuteWriteCommand(self,dataBaseName,sql,db_data=()):
        """
        连接mysql数据库（写），并进行写的操作
        """
        try:
            conn = pymysql.connect(db=dataBaseName,user=self.db_user,passwd=self.db_pass,
                                   host=self.db_ip,port=int(self.db_port),charset="utf8")
            cursor = conn.cursor()
        except Exception as e:
            print(e)
            logging.error('数据库连接失败:%s' % e)
            return False

        try:
            if len(db_data) > 0:
                cursor.executemany(sql, db_data)
            else:
                cursor.execute(sql, db_data)
            conn.commit()
        except Exception as e:
            conn.rollback()
            logging.error('数据写入失败:%s' % e)
            return False
        finally:
            cursor.close()
            conn.close()
        return True

#删除数据表
    def DeleteWellFromDB(self,dataBaseName,tableName):
        command_DeleteRT = ''' DELETE FROM '''+dataBaseName+''' WHERE wellName ='{}';'''.format(tableName);
        self.ExecuteWriteCommand(dataBaseName,command_DeleteRT)
        command_DeleteInterTable = '''DROP TABLE {};'''.format(tableName+'_inter')
        self.ExecuteWriteCommand(dataBaseName,command_DeleteInterTable)
        command_DeleteDataTable = '''DROP TABLE {};'''.format(tableName+'_data')
        self.ExecuteWriteCommand(dataBaseName,command_DeleteDataTable)
        command_DeletePlotTablea = '''DROP TABLE {};'''.format(tableName+'_plot')
        self.ExecuteWriteCommand(dataBaseName,command_DeletePlotTablea)
        command_DeleteLithoTable = '''DROP TABLE {};'''.format(tableName+'_litho')
        self.ExecuteWriteCommand(dataBaseName,command_DeleteLithoTable)
        command_DeleteCoopTable = '''DROP TABLE {};'''.format(tableName+'_coop')
        self.ExecuteWriteCommand(dataBaseName,command_DeleteCoopTable)
        command_DeleteBlockTable = '''DROP TABLE {};'''.format(tableName+'_block')
        self.ExecuteWriteCommand(dataBaseName,command_DeleteBlockTable)


#读取数据库中的井名，目前也就是loggingdatas中的WellName
    def DLWellNamesFromDB(self,dataBaseName):
        command_GetWellNames = '''SELECT wellName FROM ''' + dataBaseName + ''';'''
        wellNames = self.ExecuteReadOne(dataBaseName,command_GetWellNames)
        return wellNames
#读取测井数据文件,这里为了解决数据库中列顺序会变的问题故采用列表/索引来读取数据
    def DLLoggingDataFromDB(self,dataBaseName,tableName):
        loggingRawData = self.ExecuteReadAllData(dataBaseName,tableName+'_data')
        interData = self.ExecuteReadAllData(dataBaseName,tableName+'_inter')
        loggingDataJson={}
        for index, para in enumerate(interData['paraName']):
            loggingDataJson[para] = {}
            loggingDataJson[para]['identification'] = interData['identification'][index]
            loggingDataJson[para]['unit'] = interData['unit'][index]
            loggingDataJson[para]['minValue'] = interData['paraMinValue'][index]
            loggingDataJson[para]['maxValue'] = interData['paraMaxValue'][index]
            loggingDataJson[para]['rawData'] = loggingRawData[para]
        return loggingDataJson

#读取绘图参数文件
    def DLPlotParaFromDB(self,dataBaseName,tableName):
        plotParaJson =[]
        plotPara = self.ExecuteReadAllData(dataBaseName,tableName)
        for index, para in enumerate(plotPara['paraName']):
            temp ={}
            temp['paraName'] = para
            temp['depthStart'] = plotPara['depthStart'][index]
            temp['depthEnd'] = plotPara['depthEnd'][index]
            temp['tickInterval'] = plotPara['tickInterval'][index]
            temp['minValue'] = plotPara['paraMinValue'][index]
            temp['maxValue'] = plotPara['paraMaxValue'][index]
            temp['depthScale'] = plotPara['depthScale'][index]
            temp['plotStyle'] = plotPara['plotStyle'][index]
            temp['width'] = plotPara['width'][index]
            plotParaJson.append(temp)
        return plotParaJson
#读取岩性解释数据
    def DLLithologyFromDB(self, dataBaseName, tableName):
        lithologysJson = []
        lithologys = self.ExecuteReadAllData(dataBaseName,tableName)
        for index ,layer in enumerate(lithologys['lithology']):
            temp={}
            temp['name'] = layer
            temp['startDepth'] = lithologys['depthStart'][index]
            temp['endDepth'] = lithologys['depthEnd'][index]
            lithologysJson.append(temp)
        return lithologysJson



#插入数据关系表，默认情况下一个数据库对应一个
    def ULLoggingDataToDB(self,dataBaseName, tableName, loggingData):
        command_InsertRT = '''INSERT INTO ''' + dataBaseName + '''(wellName,parasInterpTable,loggingDataTable,plotParametersTable,lithologyTable,cooperatorsTable,blocksTable)''' \
                           + ''' VALUES(%s,%s,%s,%s,%s,%s,%s);'''
        paraInterTable = tableName + "_inter"
        dataTable = tableName + "_data"
        plotTable = tableName + "_plot"
        lithoTable = tableName + "_litho"
        coopTable = tableName + "_coop"
        blockTable = tableName + "_block"
        self.ExecuteWriteCommand(dataBaseName,command_InsertRT, [[tableName, paraInterTable,dataTable , plotTable, lithoTable, coopTable, blockTable]])
    #创建参数解释表并插入数据，注意命名关键字冲突的问题
        command_CreateParaInter = '''CREATE TABLE '''+ paraInterTable \
                                  + '''( paraName VARCHAR(50), identification INT, unit VARCHAR(50), paraMinValue FLOAT, paraMaxValue FLOAT);'''
        self.ExecuteWriteCommand(dataBaseName,command_CreateParaInter)
        command_InsertParaInter = '''INSERT INTO '''+ paraInterTable +'''(paraName,identification,unit,paraMinValue,paraMaxValue)'''\
                                  +''' VALUES(%s,%s,%s,%s,%s);'''
        paraInterData= [[paraName,loggingData[paraName]['identification'],loggingData[paraName]['unit'],
                      loggingData[paraName]['minValue'],loggingData[paraName]['maxValue']] for paraName in loggingData]
        self.ExecuteWriteCommand(dataBaseName,command_InsertParaInter,paraInterData)
    #创建测井数据表并插入数据,二次传输有可能出现NULL的情况。
        parameters = list(loggingData.keys())  # 获取表中参数名称
        command_CreateDataTable = '''CREATE TABLE ''' + dataTable + '''('''
        for i in range(len(parameters) - 1):
            command_CreateDataTable += parameters[i] + ''' float,'''
        command_CreateDataTable += parameters[-1] + " float);"
        self.ExecuteWriteCommand(dataBaseName,command_CreateDataTable)
        command_InsertLoggingData = '''INSERT INTO ''' + dataTable + '''('''
        for i in range(len(parameters) - 1):
            command_InsertLoggingData += parameters[i] + ''','''
        command_InsertLoggingData += parameters[-1] + ''')'''
        command_InsertLoggingData += '''VALUES('''
        for i in range(len(parameters) - 1):
            command_InsertLoggingData += '''%s,'''
        command_InsertLoggingData += '''%s);'''
        # 以列表的形式添加数据
        loggingDataList = []
        for i in range(len(loggingData[parameters[0]]['rawData'])):
            loggingDataList.append([loggingData[iPara]['rawData'][i] for iPara in parameters])
        self.ExecuteWriteCommand(dataBaseName,command_InsertLoggingData, loggingDataList)

#创建绘图参数表并插入数据
    def ULPlotParametersTable(self,dataBaseName,tableName,plotParameters):
        #先删除再创建实现更新功能
        command_DeletePlotTable = '''DROP TABLE {};'''.format(tableName)
        self.ExecuteWriteCommand(dataBaseName,command_DeletePlotTable)
        command_CreatePlotTable = '''CREATE TABLE ''' + tableName \
                                  + '''( paraName VARCHAR(50), depthStart FLOAT, depthEnd FLOAT,'''\
                                  +'''tickInterval VARCHAR(50), paraMinValue FLOAT, paraMaxValue FLOAT,'''\
                                  +'''depthScale INT,plotStyle VARCHAR(50), width INT);'''
        self.ExecuteWriteCommand(dataBaseName,command_CreatePlotTable)
        command_InsertPlotPara = '''INSERT INTO ''' + tableName + '''(paraName,depthStart,depthEnd,tickInterval,'''\
                                  +'''paraMinValue,paraMaxValue,depthScale,plotStyle,width)''' \
                                  + ''' VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s);'''
        parameters = [[parameter['paraName'], parameter['depthStart'], parameter['depthEnd'], parameter['tickInterval'],
                       parameter['minValue'], parameter['maxValue'], parameter['depthScale'], parameter['plotStyle'],
                       parameter['width']] for parameter in plotParameters]
        self.ExecuteWriteCommand(dataBaseName,command_InsertPlotPara, parameters)

#创建岩性解释表并插入数据
    def ULLithologyTable(self,dataBaseName,tableName,lithologyInter):
        # 先删除再创建实现更新功能
        command_DeleteLithTable = '''DROP TABLE {};'''.format(tableName)
        self.ExecuteWriteCommand(dataBaseName,command_DeleteLithTable)
        command_CreateLithTable = '''CREATE TABLE '''+tableName+'''( lithology VARCHAR(50), depthStart FLOAT, depthEnd FLOAT);'''
        self.ExecuteWriteCommand(dataBaseName,command_CreateLithTable)
        if len(lithologyInter) == 0: #空即返回
            return
        command_InsertLith = '''INSERT INTO ''' + tableName + '''(lithology,depthStart,depthEnd) VALUES(%s,%s,%s);'''
        lithos = [[litho['name'], litho['startDepth'], litho['endDepth']] for litho in lithologyInter]
        self.ExecuteWriteCommand(dataBaseName,command_InsertLith, lithos)

#添加协作者
    def AddCooperatorToDB(self,dataBaseName,tableName,cooperator):
        ##添加协作者管理表
        command_CreateCoopTable = '''CREATE TABLE ''' + tableName + '''( userName VARCHAR(50),PRIMARY KEY (userName));'''
        #添加区块链记录表
        if self.ExecuteWriteCommand(dataBaseName, command_CreateCoopTable):
            content = self.DLLithologyFromDB(dataBaseName, tableName[:-5]+'_litho')
            LoggingDataDBManage().AddBlockChainToDB(dataBaseName, tableName[:-5] + '_block', dataBaseName, content)
        command_InsertCoop = '''INSERT INTO ''' + tableName + '''(userName) VALUES(%s);'''
        self.ExecuteWriteCommand(dataBaseName, command_InsertCoop, [cooperator])
        ##给协作者数据库中添加数据表信息
        command_InsertWell = '''INSERT INTO {} (userName,wellName) VALUES(%s,%s);'''.format(cooperator+'_coop')
        self.ExecuteWriteCommand(cooperator,command_InsertWell,[[dataBaseName,tableName[:-5]]])



#删除协作者
    def DeleteCooperatorFromDB(self,dataBaseName,tableName,cooperator):
        command_DeleteCooperator = ''' DELETE FROM '''+tableName+''' WHERE userName ='{}';'''.format(cooperator)
        self.ExecuteWriteCommand(dataBaseName,command_DeleteCooperator)
        ##从协作者数据库中删除数据信息表
        command_DeleteWell = ''' DELETE FROM {} WHERE wellName ='{}';'''.format(cooperator+'_coop',tableName[:-5]);
        self.ExecuteWriteCommand(cooperator,command_DeleteWell)

#读取协作者管理表
    def DLCooperatorsTableFromDB(self, dataBaseName, tableName):
        command_GetCooperators = '''SELECT userName FROM ''' + tableName + ''';'''
        cooperators = self.ExecuteReadOne(dataBaseName, command_GetCooperators)
        return cooperators

#获取外部协作数据表
    def DLCoopWellsFromDB(self, dataBaseName, tableName):
        wellsJson = []
        wells = self.ExecuteReadAllData(dataBaseName, tableName)
        for index, user in enumerate(wells['userName']):
            temp = {}
            temp['userName'] = user
            temp['wellName'] = wells['wellName'][index]
            wellsJson.append(temp)
        return wellsJson
#添加区块链记录表中的相关记录信息,目前有意义的数据只有岩性解释数据，这里以此为例
    def AddBlockChainToDB(self,dataBaseName,tableName,operator,contentJson):
        #如果不存在区块链表，先进行创建
        command_AddBlockTable = '''CREATE TABLE IF NOT EXISTS ''' + tableName \
                                + '''( id INT UNSIGNED AUTO_INCREMENT,userName VARCHAR(50), previousHash VARCHAR(256), currentHash VARCHAR(256),content MEDIUMBLOB,PRIMARY KEY (id));'''
        self.ExecuteWriteCommand(dataBaseName, command_AddBlockTable)
        command_GetBlockChain  = '''select userName, previousHash, currentHash from {} order by id desc limit 1'''.format(tableName)
        blockChain = self.ExecuteReadOne(dataBaseName,command_GetBlockChain,False)
        command_InsertBlockChain = '''INSERT INTO '''+tableName+'''(userName,previousHash,currentHash,content) VALUES(%s,%s,%s,%s);'''
        if blockChain:#存在区块链表的情况，userName代表之前的user，operator代表现在的user
            userName = blockChain[0]
            previousHash = blockChain[1]
            currentHash = hashlib.sha256(f'{userName}{previousHash}{json.dumps(contentJson)}'.encode()).hexdigest()
            if currentHash != blockChain[2]:
                content = pickle.dumps(contentJson)
                insertHash = hashlib.sha256(f'{operator}{blockChain[2]}{json.dumps(contentJson)}'.encode()).hexdigest()
                self.ExecuteWriteCommand(dataBaseName,command_InsertBlockChain,[[operator,blockChain[2],insertHash,content]])
        else:#不存在区块链的时候，插入数据体
            userName = operator
            previousHash = 0
            currentHash = hashlib.sha256(f'{userName}{previousHash}{json.dumps(contentJson)}'.encode()).hexdigest()
            content = pickle.dumps(contentJson)
            self.ExecuteWriteCommand(dataBaseName, command_InsertBlockChain,[[userName, previousHash, currentHash, content]])

