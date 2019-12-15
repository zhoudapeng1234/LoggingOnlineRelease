
//定义函数发送Get请求获取岩性解释数据
function DLLithologyFromServer(tableName) {
  lithologyInterpretation=[];
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLLithologyFromServer?tableName='+tableName+'_litho', true);//第二步：打开连接
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      lithologyInterpretation = JSON.parse(jsonstr);
      console.log(lithologyInterpretation);
      RefreshPlot();
    }
  }
}


//定义函数发送Get请求获取绘图参数数据
function DLPlotParaFromServer(tableName,ifDLLithology){
  plotParameters=[];
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLPlotParaFromServer?tableName='+tableName+'_plot', true);//第二步：打开连接
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      plotParameters = JSON.parse(jsonstr);
      console.log(plotParameters);
      if(ifDLLithology){DLLithologyFromServer(tableName);}//解决异步问题
    }
  }
}


//定义函数发送Get请求获取测井数据,注意这里下载数据，绘图参数，岩性解释之间的逻辑关系，以及单向性。
function DLLoggingDataFromServer(tableName,ifDLPlotPara) {
  loggingData=[];
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLLoggingDataFromServer?tableName='+tableName, true);//第二步：打开连接
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      RawLoggignData2LoggingDataFormat(JSON.parse(jsonstr));
      console.log(loggingData);
      if(ifDLPlotPara){DLPlotParaFromServer(tableName,true);}//有异步问题需要考虑
    }
  }
}



//定义函数发送Get请求获取井名
function DLWellNamesFromServer() {
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLWellNamesFromServer', true);//第二步：打开连接 
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      loggingDataTablesName = JSON.parse(jsonstr);
      WellNames2Accordion(loggingDataTablesName);  
    }
  }
}

//上传单井数据到服务器
function ULLoggingDataToServer(tableName){
  //将loggingData数据转换为loggingDataJson,用于数据传输
  var loggingDataJson = loggingData;
  for(var para in loggingData){
    var data=[];
    for(var i in loggingData[para].rawData){
      data.push(loggingData[para].rawData[i][1])
    }
    loggingDataJson[para].rawData = data;
  }
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open("POST", "/ULLoggingDataToServer?tableName="+tableName, true);  
  httpRequest.setRequestHeader("Content-Type", "application/json");   //设置请求头信息
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      ULPlotParametersToServer(tableName);//解决异步问题
    }
  }
  httpRequest.send(JSON.stringify(loggingDataJson)); //设置为发送给服务器数据
}

//上传单井绘图参数数据到服务器
function ULPlotParametersToServer(tableName){
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open("POST", "/ULPlotParametersToServer?tableName="+tableName+"_plot", true);  
  httpRequest.setRequestHeader("Content-Type", "application/json");   //设置请求头信息
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      ULLithologysToServer(tableName)
    }
  }
  httpRequest.send(JSON.stringify(plotParameters)); //设置为发送给服务器数据
}
//上传单井岩性解释数据到服务器
function ULLithologysToServer(tableName){
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open("POST", "/ULLithologysToServer?tableName="+tableName+"_litho", true);  
  httpRequest.setRequestHeader("Content-Type", "application/json");   //设置请求头信息
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {}
  }
  httpRequest.send(JSON.stringify(lithologyInterpretation)); //设置为发送给服务器数据
}


//定义函数发送Get请求删除数据表
function DeleteWellFromServer(tableName) {
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DeleteWellFromServer?tableName='+tableName, true);//第二步：打开连接
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
      alert('删除成功')
    }
  }
}


//将井名数据转换为html显示accordion所需的格式化字符串
function WellNames2Accordion(wellNames)
{
  var strHtml='';
  for(var i=0;i<wellNames.length;i++)
  {
    var strTemp = '<h3>{0}</h3><div id = "{0}"><p>功能保留</p></div>';
    strTemp = formatString(strTemp,wellNames[i]);
    strHtml += strTemp;      
  }
  document.getElementById("loggingDataAccordion").innerHTML = strHtml;
  $("#loggingDataAccordion").accordion( "refresh" ); //刷新会导致默认激活条目上移一个 
}


//添加服务器数据管理界面
var loggingDataManageDialog = document.createElement("div");
loggingDataManageDialog.id = "dialog-dataManageInServer";
loggingDataManageDialog.title = "数据库管理";
document.body.appendChild(loggingDataManageDialog);
//添加测井数据到数据库中
var LoggingTableNameEdit = document.createElement("div");
LoggingTableNameEdit.innerHTML = '<label for="name">测井数据命名:  </label>\
<input type="text" id="loggingTableNameEdit" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>';
loggingDataManageDialog.appendChild(LoggingTableNameEdit);

//添加数据浏览列表
var loggingDataAccordion = document.createElement("div");
loggingDataAccordion.id = "loggingDataAccordion";
loggingDataAccordion.style = "margin-left:0px; margin-top:0px;";
loggingDataAccordion.innerHTML = '';
loggingDataManageDialog.appendChild(loggingDataAccordion);

loggingDataTablesName = []//测井数据表名称

$("#loggingDataAccordion").accordion({
  collapsible: true,
  active: false,
  //选择岩性的时候更新岩性预览界面相关参数
  activate: function (event, ui) {
    var layerName = ui.newHeader.text();
    if (layerName) {//active的激活有new和old之分避免出现layerName不合法的情况
      
      }

  }

});



  $("#dialog-dataManageInServer").dialog({
    autoOpen: false,
    height: 550,
    width: 750,
    modal: true,
    buttons: {
      "添加数据到数据库": function(){
        //添加测井数据到数据库中
        var tableName = document.getElementById("loggingTableNameEdit").value;
        if (tableName) {//命名检测
          if(loggingDataTablesName.includes(tableName)){
            alert("文件名已存在，请重新命名");
          }
          else{//文件命名正常
            ULLoggingDataToServer(tableName);
            tableNameInServer = tableName;
          }

        }
        $(this).dialog("close");
      },

      "加载测井数据文件": function () {
        //加载数据库中对应的测井数据
        var stateLoggingDataAccordion = $( "#loggingDataAccordion" ).accordion( "option", "active" );
        if (typeof(stateLoggingDataAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行删除,typeof是为了解决0和false的问题
          var tableName = document.getElementById("loggingDataAccordion").children[2*stateLoggingDataAccordion+1].id ;   
          ClearAllData();//清空所有数据，回到最初状态      
          DLLoggingDataFromServer(tableName,true);
          tableNameInServer = tableName;
        }
        $(this).dialog("close");
      },

      "删除测井数据文件": function () {
        //加载数据库中对应的测井数据
        var stateLoggingDataAccordion = $( "#loggingDataAccordion" ).accordion( "option", "active" );
        if (typeof(stateLoggingDataAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行删除,typeof是为了解决0和false的问题
          var tableName = document.getElementById("loggingDataAccordion").children[2*stateLoggingDataAccordion+1].id ;
          DeleteWellFromServer(tableName);
        }
        
        $(this).dialog("close");
      },
      "关闭": function () {
        $(this).dialog("close");
      }
    },
    close: function () {
    }
  });



