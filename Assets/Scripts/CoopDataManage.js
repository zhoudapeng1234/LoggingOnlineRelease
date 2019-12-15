//定义函数发送Get请求获取协作井列表
function DLCoopWellsFromServer() {
  var deferred=$.Deferred();
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLCoopWellsFromServer', true);//第二步：打开连接
  httpRequest.addEventListener('load',function(){
    if(httpRequest.status == 200){
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      CoopWells2Accordion(JSON.parse(jsonstr));
      deferred.resolve(httpRequest.response);
    }else{
      console.log('fail');
      deferred.reject("HTTP error: " + httpRequest.status);
    }
  },false)
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  return deferred.promise();
}


//添加协作数据库管理对话框
var coopDataManageDialog = document.createElement("div");
coopDataManageDialog.id = "dialog-coopDataManageInServer";
coopDataManageDialog.title = "协作数据库管理";
document.body.appendChild(coopDataManageDialog);

//添加数据浏览列表
var coopDataAccordion = document.createElement("div");
coopDataAccordion.id = "coopDataAccordion";
coopDataAccordion.style = "margin-left:0px; margin-top:0px;";
coopDataAccordion.innerHTML = '';
coopDataManageDialog.appendChild(coopDataAccordion);


$("#coopDataAccordion").accordion({
  collapsible: true,
  active: false,
});



//将外部协作井名数据转换为html显示accordion所需的格式化字符串
function CoopWells2Accordion(wellNames)
{
  var strHtml='';
  for(var i=0;i<wellNames.length;i++)
  {
    var strTemp = '<h3>{0}</h3><div id = "{0}"><p>拥有者：{1}</p></div>';
    strTemp = formatString(strTemp,wellNames[i].wellName,wellNames[i].userName);
    strHtml += strTemp;      
  }
  document.getElementById("coopDataAccordion").innerHTML = strHtml;
  $("#coopDataAccordion").accordion( "refresh" ); //刷新会导致默认激活条目上移一个 
}


$("#dialog-coopDataManageInServer").dialog({
    autoOpen: false,
    height: 550,
    width: 750,
    modal: true,
    buttons: {
      "加载测井数据文件": function () {
        var stateCoopDataAccordion = $( "#coopDataAccordion" ).accordion( "option", "active" );
        if (typeof(stateCoopDataAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行删除,typeof是为了解决0和false的问题
          var wellName = document.getElementById("coopDataAccordion").children[2*stateCoopDataAccordion+1].id ;
          var userName =document.getElementById("coopDataAccordion").children[2*stateCoopDataAccordion+1].innerText.substr(4);
          ClearAllData();//清空所有数据，回到最初状态      
          $.when(DLLoggingDataFromServer(wellName,userName)).done(function(){$.when(DLPlotParaFromServer(wellName,userName)).done(function(){DLLithologyFromServer(wellName,userName)})});
          SetCurrentWellInfo(userName,wellName);
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

