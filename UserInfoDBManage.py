import pymysql
import logging
#数据格式为一个账户对应一个数据库，一口井的数据对应一张表
class UserInfoDBManage:
    def __init__(self):
        self.db_name = 'LoggingOnline'
        self.db_user = 'root'
        self.db_pass = '******'
        self.db_ip = 'localhost'
        self.db_port = 3306

        # 读取数据库中的一列内容
    def ExecuteReadData(self, sql):
        """连接mysql数据库（读），并进行读的操作"""
        try:
            conn = pymysql.connect(db=self.db_name, user=self.db_user, passwd=self.db_pass,
                                   host=self.db_ip, port=int(self.db_port), charset="utf8")
            cursor = conn.cursor()
        except Exception as e:
            print(e)
            logging.error('数据库连接失败:%s' % e)
            return False

        try:
            cursor.execute(sql)
            getData = [row[0] for row in cursor.fetchall()]  # 将数据库返回的元组转换为列表
        except Exception as e:
            logging.error('数据读取失败:%s' % e)
            return False
        finally:
            cursor.close()
            conn.close()
        return getData

    def CheckUser(self,userName,passWord):
        command_ReadData = '''SELECT passWord FROM LoggingOnline WHERE userName = '{}';'''.format(userName)
        passWordFromDB = self.ExecuteReadData(command_ReadData)
        if passWordFromDB and (passWord == passWordFromDB[0]):
            return True
        else:
            return False
