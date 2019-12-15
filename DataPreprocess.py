import numpy as np
import scipy.interpolate as spi
#数据预处理类，数据预处理算法
class DataPreprocess:
    #三次样条插值，插值间隔interDistance
    def CubicSpline(self, loggingData, interDistance ):
        rawData = {}
        for i in loggingData:#需要先获取深度信息
            if loggingData[i]['identification'] == 0:
                minDepth = loggingData[i]['minValue']
                maxDepth = loggingData[i]['maxValue']
                depth = loggingData[i]['rawData']
            else:
                rawData[i] = loggingData[i]['rawData']

        depthNew = np.arange(minDepth, maxDepth+interDistance, interDistance).round(4)  # 定义差值点

        # 进行三次样条拟合
        for i in loggingData:
            if loggingData[i]['identification'] == 0:
                loggingData[i]['rawData'] = depthNew.tolist()
            else:
                ipo3 = spi.splrep(depth, loggingData[i]['rawData'], k=3)  # 样本点导入，生成参数
                iy3 = spi.splev(depthNew, ipo3)  # 根据观测点和样条参数，生成插值
                loggingData[i]['rawData'] = iy3.round(4).tolist()
        return loggingData