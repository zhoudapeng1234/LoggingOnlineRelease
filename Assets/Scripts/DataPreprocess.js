//获取三次样条插值后的结果
function CalcCubicSplineFromServer(interDistance) {
  var deferred = $.Deferred();
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('POST', './CalcCubicSplineFromServer?interDistance=' + interDistance, true);//第二步：打开连接  
  httpRequest.setRequestHeader("Content-Type", "application/json");   //设置请求头信息
  httpRequest.addEventListener('load', function () {
    if (httpRequest.status == 200) {
      // 3.1) RESOLVE the DEFERRED (this will trigger all the done()...)
      var jsonstr = httpRequest.responseText//获取到json字符串，还需解析
      RawLoggignData2LoggingDataFormat(JSON.parse(jsonstr))
      deferred.resolve(httpRequest.response);
    } else {// 3.2) REJECT the DEFERRED (this will trigger all the fail()...)
      deferred.reject("HTTP error: " + httpRequest.status);
    }
  }, false)
  var sendData = JSON.stringify(LoggingDataFormat2RawLoggignData())
  httpRequest.send(sendData);//第三步：发送请求  将请求参数写在URL中
  return deferred.promise(); 
}


//添加方法选择主界面
var dataPreprocessDialog = document.createElement("div");
dataPreprocessDialog.id = "dialog-dataPreprocess";
dataPreprocessDialog.title = "测井数据预处理";
document.body.appendChild(dataPreprocessDialog);

//添加方法按钮
var cubicSplineButton = document.createElement("div");
cubicSplineButton.innerHTML = '<br><input type="button" id="cubicSplineButton" value="三次样条插值" style="width:150px" >';
dataPreprocessDialog.appendChild(cubicSplineButton);

$("#cubicSplineButton").button().click(function( event ) {
  $.when(CalcCubicSplineFromServer(0.2)).done(function(){RefreshPlot()});
    $('#dialog-dataPreprocess').dialog('close')
});

$("#dialog-dataPreprocess").dialog({
    autoOpen: false,
    height: 550,
    width: 750,
    modal: true,
    buttons: {

      "关闭": function () {
        $(this).dialog("close")
      }
    },
    close: function () {
    }
  });
