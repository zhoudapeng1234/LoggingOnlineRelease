//定义函数发送Get请求获取协作用户表
function DLCooperatorsFromServer(wellName) {
  var deferred=$.Deferred();
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open('GET', './DLCooperatorsFromServer?tableName='+wellName+'_coop', true);//第二步：打开连接
  httpRequest.addEventListener('load',function(){
    if(httpRequest.status == 200){
      var jsonstr = httpRequest.responseText;//获取到json字符串，还需解析
      cooperatorsUserName = JSON.parse(jsonstr);
      Cooperators2Accordion(cooperatorsUserName);
      deferred.resolve(httpRequest.response);
    }else{
      deferred.reject("HTTP error: " + httpRequest.status);
    }
  },false)
  httpRequest.send();//第三步：发送请求  将请求参数写在URL中
  return deferred.promise();
}

//上传协作者到数据库
function ULCooperatorToServer(wellName,cooperatorName,operation){
  var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
  httpRequest.open("POST", "/ULCooperatorToServer?tableName="+wellName+"_coop&cooperator="+cooperatorName+"&operation="+operation, true);  
  httpRequest.setRequestHeader("Content-Type", "application/json");   //设置请求头信息
  httpRequest.onreadystatechange = function () {if (httpRequest.readyState == 4 && httpRequest.status == 200) {}}
  httpRequest.send(); //设置为发送给服务器数据
}


//添加或删除协作者
var ManageCooperatorDialog = document.createElement("div");
ManageCooperatorDialog.id = "dialog-ManageCooperator";
ManageCooperatorDialog.title = "管理协作者";
document.body.appendChild(ManageCooperatorDialog);
//添加协作者用户名ID
var AddCooperatorName = document.createElement("div");
AddCooperatorName.innerHTML = '<label for="name">协作者:  </label>\
<input type="text" id="AddCooperatorName" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>';
ManageCooperatorDialog.appendChild(AddCooperatorName);
//添加协作者浏览列表
var ManageCooperatorAccordion = document.createElement("div");
ManageCooperatorAccordion.id = "ManageCooperatorAccordion";
ManageCooperatorAccordion.style = "margin-left:0px; margin-top:0px;";
ManageCooperatorAccordion.innerHTML = '';
ManageCooperatorDialog.appendChild(ManageCooperatorAccordion);



cooperatorsUserName = []

$("#ManageCooperatorAccordion").accordion({
  collapsible: true,
  active: false,
});




//将外部协作井名数据转换为html显示accordion所需的格式化字符串
function Cooperators2Accordion(cooperators)
{
  var strHtml='';
  for(var i=0;i<cooperators.length;i++)
  {
    var strTemp = '<h3>{0}</h3><div id = "{0}"><p>功能保留</p></div>';
    strTemp = formatString(strTemp,cooperators[i]);
    strHtml += strTemp;      
  }
  document.getElementById("ManageCooperatorAccordion").innerHTML = strHtml;
  $("#ManageCooperatorAccordion").accordion( "refresh" ); //刷新会导致默认激活条目上移一个 
}

$("#dialog-ManageCooperator").dialog({
    autoOpen: false,
    height: 550,
    width: 750,
    modal: true,
    buttons: {
      "添加协作者": function(){
        var cooperatorName = document.getElementById("AddCooperatorName").value;
        if (cooperatorName) {//命名检测
          if(cooperatorsUserName.includes(cooperatorName)){
            alert("该用户已存在，无需重复添加");
          }else{//文件命名正常
            cooperatorsUserName.push(cooperatorName);
            ULCooperatorToServer(GetCurrentWellInfo().wellName,cooperatorName,"Add");
          }
        }
        $(this).dialog("close");
      },
      "删除协作者": function () {
        var stateCooperatorAccordion = $( "#ManageCooperatorAccordion" ).accordion( "option", "active" );
        if (typeof(stateCooperatorAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行删除,typeof是为了解决0和false的问题
          var cooperatorName = document.getElementById("ManageCooperatorAccordion").children[2*stateCooperatorAccordion+1].id ;
          ULCooperatorToServer(GetCurrentWellInfo().wellName,cooperatorName,"Delete");
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
