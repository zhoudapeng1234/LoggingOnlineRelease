var EditPlotParametersStyle = document.createElement("style");
EditPlotParametersStyle.innerHTML = 'body {min-width: 520px;}\
.column {width: 370px;float: left;padding-bottom: 100px;}\
.portlet {margin: 0 1em 1em 0;padding: 0.3em;}\
.portlet-header {padding: 0.2em 0.3em;margin-bottom: 0.5em;position: relative;}\
.portlet-toggle {position: absolute;top: 50%;right: 0;margin-top: -8px;}\
.portlet-content {padding: 0.4em;}\
.portlet-placeholder {border: 1px dotted black; margin: 0 1em 1em 0;height: 50px;}'
document.head.appendChild(EditPlotParametersStyle);

//添加绘图参数编辑界面
var EditPlotParaDialog = document.createElement("div");
EditPlotParaDialog.id = "dialog-editPlotParameters";
EditPlotParaDialog.title = "编辑绘图参数";
document.body.appendChild(EditPlotParaDialog);

//添加绘图参数选择控件
var parameterSelection = document.createElement("select");
parameterSelection.id = "parameterSelection"
EditPlotParaDialog.appendChild(parameterSelection);



//添加起始、结束深度、最大、最小值、图道宽度输入框
var plotDepthEdit = document.createElement("div");
plotDepthEdit.style = "margin-top: 10px; margin-left: 0px;";
plotDepthEdit.innerHTML = '<label for="name">起始深度:  </label>\
<input type="text" id="plotDepthStartEdit" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>\
<label for="name">结束深度:  </label>\
<input type="text" id="plotDepthEndEdit" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>\
<label for="name">最小值:  </label>\
<input type="text" id="plotValueMinEdit" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>\
<label for="name">最大值:  </label>\
<input type="text" id="plotValueMaxEdit" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>\
<label for="name">道宽:  </label>\
<input type="text" id="plotTraceWidthEdit" style="width:150px"  class="text ui-widget-content ui-corner-all">';
EditPlotParaDialog.appendChild(plotDepthEdit);


//添加比例尺选择控件
var scaleSelection = document.createElement("select");
scaleSelection.id = "plotScaleSelection"
scaleSelection.style = "margin-left:70px; margin-top:20px"
scaleSelection.innerHTML = '<option value=1>1:50</option>\
    <option value =2>1:100</option>\
    <option value =3>1:200</option>\
    <option value =4>1:500</option>\
    <option value =5>1:1000</option>';
EditPlotParaDialog.appendChild(scaleSelection);
//添加说明标签
var mark = document.createElement("div");
mark.id = "mark"
mark.style = "margin-left:0px; margin-top:-25px"
mark.innerHTML = '<label for="plotScaleSelection">比例尺：</label>'
EditPlotParaDialog.appendChild(mark);
//添加图道类型选择控件
var plotStyleSelection = document.createElement("select");
plotStyleSelection.id = "plotStyleSelection"
plotStyleSelection.style = "margin-left:80px; margin-top:20px"
plotStyleSelection.innerHTML = '<option value = 1>线性</option>\
    <option value = 2 >对数</option>\
    <option value = 3 >深度</option>';
EditPlotParaDialog.appendChild(plotStyleSelection);
//添加说明标签
var mark = document.createElement("div");
mark.id = "mark"
mark.style = "margin-left:0px; margin-top:-25px"
mark.innerHTML = '<label for="plotStyleSelection">图道类型：</label>'
EditPlotParaDialog.appendChild(mark);

//添加确认修改绘图参数按钮
var addPlotParametersButton = document.createElement("button");
addPlotParametersButton.id = "addPlotParametersButton";
addPlotParametersButton.textContent = "确认修改";
addPlotParametersButton.style = "margin-top: 50px; margin-left: 20px;";
EditPlotParaDialog.appendChild(addPlotParametersButton);

//添加确认删除绘图参数按钮
var subPlotParametersButton = document.createElement("button");
subPlotParametersButton.id = "subPlotParametersButton";
subPlotParametersButton.textContent = "确认删除";
subPlotParametersButton.style = "margin-top: 50px; margin-left: 50px;";
EditPlotParaDialog.appendChild(subPlotParametersButton);


//添加绘图参数浏览控件，这里为了排序采用Portlets(门户组件的方式)进行显示。
var plotParametersPortlets = document.createElement("div");
plotParametersPortlets.id = "plotParametersPortlets";
plotParametersPortlets.style = "margin-left:350px; margin-top:-350px;";
plotParametersPortlets.className = "column";
plotParametersPortlets.innerHTML = '';
EditPlotParaDialog.appendChild(plotParametersPortlets);
//初始化编辑绘图参数对话框，这里考虑可能出现的绘制曲线少于数据曲线的问题
function InitialEditPlotParameters() {
  var parameterSelection = document.getElementById("parameterSelection");
  parameterSelection.innerHTML = '<option> </option>';
  for (var paraTrace in loggingData) {
    parameterSelection.options.add(new Option(paraTrace));
  }
  plotParameters2Portlets(plotParameters);
  $("#parameterSelection").selectmenu("refresh");
}

//将portlets显示的格式化字符串转换为绘图参数，这里主要提取左右位置信息
function GetPlotSort() {
  var plotParametersTemp = [];
  var portlet = document.getElementById("plotParametersPortlets");
  for (var i = 0; i < portlet.childElementCount; i++) {
    plotParametersTemp.push(plotParameters[GetPlotParametersIndex(portlet.children[i].children[0].innerText)]);
  }
  plotParameters = plotParametersTemp;
}


//将绘图参数数据转换为portlets显示所需的格式化字符串,这里需要用扩展函数代替刷新
function plotParameters2Portlets(plotParameters) {
  var strHtml = '';

  for (var i = 0; i < plotParameters.length; i++) {
    strTemp = '<div class="portlet">\
    <div class="portlet-header">{0}</div>\
    <div class="portlet-content"><p>起始深度：{1}</p><p>结束深度：{2}</p><p>深度显示间隔：{3}</p><p>最小值：{4}</p><p>最大值：{5}</p><p>绘制类型：{6}</p><p>道宽：{7}</p>\
    </div>\
  </div>'
    strTemp = formatString(strTemp, plotParameters[i].paraName, plotParameters[i].depthStart, plotParameters[i].depthEnd,
      plotParameters[i].tickInterval, plotParameters[i].minValue, plotParameters[i].maxValue, plotParameters[i].plotStyle, plotParameters[i].width);
    strHtml += strTemp;
  }
  document.getElementById("plotParametersPortlets").innerHTML = strHtml;

  //代替refresh函数实现刷新功能。
  $(".column").sortable({
    connectWith: ".column",
    handle: ".portlet-header",
    cancel: ".portlet-toggle",
    placeholder: "portlet-placeholder ui-corner-all"
  });

  $(".portlet")
    .addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
    .find(".portlet-header")
    .addClass("ui-widget-header ui-corner-all")
    .prepend("<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

  $(".portlet-toggle").click(function () {
    var icon = $(this);
    icon.toggleClass("ui-icon-minusthick ui-icon-plusthick");
    icon.closest(".portlet").find(".portlet-content").toggle();
  });

  $('.portlet-toggle').trigger('click');

}


$("#dialog-editPlotParameters").dialog({
  autoOpen: false,
  height: 550,
  width: 750,
  modal: true,
  buttons: {
    "保存绘图参数到数据库": function () {
      var dataBaseName = GetCurrentWellInfo().dataBaseName
      if (dataBaseName) {
        var wellName = GetCurrentWellInfo().wellName;
        if (dataBaseName == "当前用户") {
          ULPlotParametersToServer(wellName);
        }
        else {
          ULPlotParametersToServer(wellName, dataBaseName);
        }
      }
      else {
        alert('外部数据，请先保存数据到数据库。')
      }
      $(this).dialog("close");
    },

    "取消": function () {
      $(this).dialog("close");
    }
  },
  close: function () {

  }
});

//注意selectMenu需要放到dialog后面
$("#parameterSelection").selectmenu({
  change: function (event, data) {
    var parameterSelection = data.item.value;
    if (parameterSelection) {//参数有效，有效是指在loggingData中存在
      var index = GetPlotParametersIndex(parameterSelection);
      if (index < 0) {//小于0说明plotParameters中暂时不存在,采用默认参数赋值
        var depthName = "";
        for (var traceData in loggingData) { if (loggingData[traceData].identification == 0) { depthName = traceData } }
        document.getElementById("plotDepthStartEdit").value = loggingData[depthName].minValue;
        document.getElementById("plotDepthEndEdit").value = loggingData[depthName].maxValue;
        document.getElementById("plotValueMinEdit").value = loggingData[parameterSelection].minValue;
        document.getElementById("plotValueMaxEdit").value = loggingData[parameterSelection].maxValue;
        document.getElementById("plotTraceWidthEdit").value = 300;
        document.getElementById("plotStyleSelection").value = 1;//这个可以根据unit进行赋值
        document.getElementById("plotScaleSelection").value = 2;//1:100为默认比例尺       
      }
      else {
        document.getElementById("plotDepthStartEdit").value = plotParameters[index].depthStart;
        document.getElementById("plotDepthEndEdit").value = plotParameters[index].depthEnd;
        document.getElementById("plotValueMinEdit").value = plotParameters[index].minValue;
        document.getElementById("plotValueMaxEdit").value = plotParameters[index].maxValue;
        document.getElementById("plotTraceWidthEdit").value = plotParameters[index].width;
        switch (plotParameters[index].plotStyle) {
          case "Line":
            document.getElementById("plotStyleSelection").value = 1;
            break;
          case "Log":
            document.getElementById("plotStyleSelection").value = 2;
            break;
          case "Depth":
            document.getElementById("plotStyleSelection").value = 3;
            break;
        }
        switch (plotParameters[index].depthScale) {
          case 50:
            document.getElementById("plotScaleSelection").value = 1;
            break;
          case 100:
            document.getElementById("plotScaleSelection").value = 2;
            break;
          case 200:
            document.getElementById("plotScaleSelection").value = 3;
            break;
          case 500:
            document.getElementById("plotScaleSelection").value = 4;
            break;
          case 1000:
            document.getElementById("plotScaleSelection").value = 5;
            break;
        }
      }
    }
  }
});

//添加图道按钮同时也有确认修改的功能
$("#addPlotParametersButton").button().on("click", function () {
  //绘图排序不受参数是否有效影响
  GetPlotSort();
  var parameterSelection = document.getElementById("parameterSelection").value;
  if (parameterSelection) {//首先判断参数是否有效，在有效的前提下进行后面的赋值操作。
    var index = GetPlotParametersIndex(parameterSelection);
    if (index == -1) {//index为-1说明没有此图道，需要添加
      var temp = Object.create(null);//初始化plotParameters绘图参数
      temp.paraName = parameterSelection;
      temp.minValue = parseFloat(document.getElementById("plotValueMinEdit").value);
      temp.maxValue = parseFloat(document.getElementById("plotValueMaxEdit").value);
      switch (document.getElementById("plotStyleSelection").value) {//字符类型
        case "1":
          temp.plotStyle = "Line";
          break;
        case "2":
          temp.plotStyle = "Log";
          break;
        case "3":
          temp.plotStyle = "Depth";
          break;
      }
      temp.width = parseFloat(document.getElementById("plotTraceWidthEdit").value);
      plotParameters.push(temp);
    }
    else {//index不为-1说明有此图道，需要修改
      plotParameters[index].minValue = parseFloat(document.getElementById("plotValueMinEdit").value);
      plotParameters[index].maxValue = parseFloat(document.getElementById("plotValueMaxEdit").value);
      switch (document.getElementById("plotStyleSelection").value) {//字符类型
        case "1":
          plotParameters[index].plotStyle = "Line";
          break;
        case "2":
          plotParameters[index].plotStyle = "Log";
          break;
        case "3":
          plotParameters[index].plotStyle = "Depth";
          break;
      }
      plotParameters[index].width = parseFloat(document.getElementById("plotTraceWidthEdit").value);
    }

    //更新深度和比例尺，以当前有效参数为准，更新深度和比例尺目前是全局变量统一修改
    var depthStart = parseFloat(document.getElementById("plotDepthStartEdit").value);
    var depthEnd = parseFloat(document.getElementById("plotDepthEndEdit").value);
    var depthScale = 100;
    var tickInterval = 10;
    switch (document.getElementById("plotScaleSelection").value) {//字符类型
      case "1":
        depthScale = 50;
        break;
      case "2":
        depthScale = 100;
        break;
      case "3":
        depthScale = 200;
        break;
      case "4":
        depthScale = 500;
        break;
      case "5":
        depthScale = 1000;
        break;
    }
    for (var i = 0; i < plotParameters.length; i++) {
      plotParameters[i].depthStart = depthStart;
      plotParameters[i].depthEnd = depthEnd;
      plotParameters[i].depthScale = depthScale;
      plotParameters[i].tickInterval = tickInterval;
    }
    plotParameters2Portlets(plotParameters);
  }
  RefreshPlot();
});
//删除图道按钮
$("#subPlotParametersButton").button().on("click", function () {
  var index = GetPlotParametersIndex(document.getElementById("parameterSelection").value)
  if (index == -1) {//index为-1说明没有此图道需要删除
  }
  else {//index不为0说明有此图道需要删除
    plotParameters.splice(index, 1);
    plotParameters2Portlets(plotParameters);
    RefreshPlot();
  }
});
//根据参数名称获取绘图参数索引
function GetPlotParametersIndex(paraName) {
  var index = -1;
  for (var i = 0; i < plotParameters.length; i++) {
    if (plotParameters[i].paraName == paraName) {
      index = i;
    }
  }
  return index;
}
//根据修改的参数刷新绘图区域
function RefreshPlot() {
  GetPlotCanvas();
  GetLithologyCanvas()
  PlotLoggingLines_invert();
  PlotLithology();
}