
var LithologySelectionStyle = document.createElement("style");
LithologySelectionStyle.innerHTML = '.custom-combobox\
 {\
  position: relative;\
  display: inline-block;\
}\
.custom-combobox-toggle {\
  position: absolute;\
  top: 0;\
  bottom: 0;\
  margin-left: -1px;\
  padding: 0;\
}\
.custom-combobox-input {\
  margin: 0;\
  padding: 5px 10px;\
}\
'
document.head.appendChild(LithologySelectionStyle);

//添加岩性编辑界面
var EditLithologyDialog = document.createElement("div");
EditLithologyDialog.id = "dialog-form";
EditLithologyDialog.title = "岩性编辑";
document.body.appendChild(EditLithologyDialog);

var LithologySelection = document.createElement("div");
LithologySelection.id = "lithologySelection"
LithologySelection.class = "ui-widget";
LithologySelection.innerHTML = '<select id="combobox">\
    <option value="">Select one...</option>\
    <option value="白云岩">白云岩</option>\
    <option value="粗砂岩">粗砂岩</option>\
    <option value="粉砂岩">粉砂岩</option>\
    <option value="钙质砂岩">钙质砂岩</option>\
    <option value="钙质页岩">钙质页岩</option>\
    <option value="钙质粘土">钙质粘土</option>\
    <option value="黄土">黄土</option>\
    <option value="灰岩">灰岩</option>\
    <option value="角砾岩">角砾岩</option>\
    <option value="砾石">砾石</option>\
    <option value="砾岩">砾岩</option>\
    <option value="煤">煤</option>\
    <option value="泥灰岩">泥灰岩</option>\
    <option value="泥质白云岩">泥质白云岩</option>\
    <option value="泥质粉砂岩">泥质粉砂岩</option>\
    <option value="泥质灰岩">泥质灰岩</option>\
    <option value="泥质砂岩">泥质砂岩</option>\
    <option value="凝灰质砂岩">凝灰质砂岩</option>\
    <option value="砂砾石">砂砾石</option>\
    <option value="砂质泥灰岩">砂质泥灰岩</option>\
    <option value="砂质页岩">砂质页岩</option>\
    <option value="碳质灰岩">碳质灰岩</option>\
    <option value="碳质页岩">碳质页岩</option>\
    <option value="碳质粘土">碳质粘土</option>\
    <option value="填筑土">填筑土</option>\
    <option value="细砂岩">细砂岩</option>\
    <option value="页岩">页岩</option>\
    <option value="粘土">粘土</option>\
    <option value="粘土岩(泥质)">粘土岩(泥质)</option>\
    <option value="中砂岩">中砂岩</option>\
  </select><br><br>';
EditLithologyDialog.appendChild(LithologySelection);

//添加岩性起始、结束深度输入框
var DepthStartEdit = document.createElement("div");
DepthStartEdit.innerHTML = '<label for="name">起始深度:  </label>\
<input type="text" id="depthStart" style="width:150px"  class="text ui-widget-content ui-corner-all"><br><br>\
<label for="name">结束深度:  </label>\
<input type="text" id="depthEnd" style="width:150px"  class="text ui-widget-content ui-corner-all">';
EditLithologyDialog.appendChild(DepthStartEdit);
//添加岩性预览界面
var canvaLith = document.createElement("canvas");
canvaLith.id = "editLithologyShow";
canvaLith.width = 56;
canvaLith.height = 200;//这里不能使用mm单位，只能使用像素
canvaLith.style = "margin-top: 57px; margin-left: 77px; border: 1px solid #aaaaaa; position: absolute";
EditLithologyDialog.appendChild(canvaLith);
var context = canvaLith.getContext("2d");
var img = new Image();

//添加确认修改岩性层按钮
var addLithologyButton = document.createElement("button");
addLithologyButton.id = "addLithologyButton";
addLithologyButton.textContent = "确认修改";
addLithologyButton.style = "margin-top: 187px; margin-left: 187px;position: absolute";
EditLithologyDialog.appendChild(addLithologyButton);

//添加确认删除岩性层按钮
var subLithologyButton = document.createElement("button");
subLithologyButton.id = "subLithologyButton";
subLithologyButton.textContent = "确认删除";
subLithologyButton.style = "margin-top: 237px; margin-left: 187px;position: absolute";
EditLithologyDialog.appendChild(subLithologyButton);

//添加岩性划分列表，相关的解释也可放到这一部分
var lithologyAccordion = document.createElement("div");
lithologyAccordion.id = "lithologyAccordion";
lithologyAccordion.style = "margin-left:350px; margin-top:-100px;";
lithologyAccordion.innerHTML = '';
EditLithologyDialog.appendChild(lithologyAccordion);




var lithologyInterpretation =[];

/*
    函数:格式化字符串
    参数：str:字符串模板； data:数据
    调用方式:formatString("api/values/{id}/{name}",{id:101,name:"test"});
             formatString("api/values/{0}/{1}",101,"test");
*/
function formatString(str, data) {
  if (!str || data == undefined) {
    return str;
  }

  if (typeof data === "object") {
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        str = str.replace(new RegExp("\{" + key + "\}", "g"), data[key]);
      }
    }
  } else {
    var args = arguments,
      reg = new RegExp("\{([0-" + (args.length - 1) + "])\}", "g");
    return str.replace(reg, function (match, index) {
      return args[index - (-1)];
    });
  }
  return str;
}

//将岩性数据转换为html显示所需的格式化字符串
function lithologyInter2Accordion(lithologyInterpretation)
{
  var strHtml='';
  for(var i=0;i<lithologyInterpretation.length;i++)
  {
    var strTemp = '<h3>{0}（第{1}层）</h3><div id = "{0}（第{1}层）"><p>起始深度：{2}m</p><p>结束深度：{3}m</p></div>';
    strTemp = formatString(strTemp,lithologyInterpretation[i]["name"],i+1,lithologyInterpretation[i]["startDepth"],lithologyInterpretation[i]["endDepth"]);
    strHtml += strTemp;      
  }
  document.getElementById("lithologyAccordion").innerHTML = strHtml;
  $("#lithologyAccordion").accordion( "refresh" );  
}



$("#subLithologyButton").button().on("click", function () {
  var stateLithologyAccordion = $("#lithologyAccordion").accordion("option", "active");
  if (typeof(stateLithologyAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行删除,typeof是为了解决0和false的问题
    for(var i=0;i<lithologyInterpretation.length;i++){$("#"+"Lithology"+i).remove();}//删除需要特殊处理
    lithologyInterpretation.splice(stateLithologyAccordion,1);
    lithologyInter2Accordion(lithologyInterpretation);
    GetLithologyCanvas();  
    PlotLithology();
  }
});


$("#addLithologyButton").button().on("click", function () {
 
  var stateLithologyAccordion = $("#lithologyAccordion").accordion("option", "active");
  if (typeof(stateLithologyAccordion) == "number" ) {//如果accordion的选择状态是激活的，进行内容的修改,typeof是为了解决0和false的问题
    //岩性解释修改
    lithologyInterpretation[stateLithologyAccordion]['name'] = document.getElementById("lithologyName").value;
    lithologyInterpretation[stateLithologyAccordion]['startDepth'] = document.getElementById("depthStart").value;
    lithologyInterpretation[stateLithologyAccordion]['endDepth'] = document.getElementById("depthEnd").value;   
  }
  else {
    var lithName = document.getElementById("lithologyName").value;
    var depthStart = document.getElementById("depthStart").value;
    var depthEnd = document.getElementById("depthEnd").value;
    if (lithName && depthStart && depthEnd) {
      lithologyInterpretation.push({
        name:lithName,
        startDepth:depthStart,
        endDepth:depthEnd});     
    }   
  }
  lithologyInter2Accordion(lithologyInterpretation);
  GetLithologyCanvas();  
  PlotLithology();
});


$("#lithologyAccordion").accordion({
  collapsible: true,
  active: false,
  //选择岩性的时候更新岩性预览界面相关参数
  activate: function (event, ui) {
    var patternDepth = /(\d+(\.\d+)?)/;
    var layerName = ui.newHeader.text();
    if (layerName) {//active的激活有new和old之分避免出现layerName不合法的情况
      var layerLithology = layerName.slice(0, layerName.indexOf("（"));
      document.getElementById("lithologyName").value = layerLithology;
      document.getElementById("depthStart").value = document.getElementById(layerName).children[0].innerText.match(patternDepth)[0];
      document.getElementById("depthEnd").value = document.getElementById(layerName).children[1].innerText.match(patternDepth)[0];
      img.src = "../Assets/Images/"+layerLithology + ".png";
      img.onload = function () {
        var pattern = context.createPattern(img, "repeat");
        context.fillStyle = pattern;
        context.fillRect(0, 0, canvaLith.width, canvaLith.height);
      }
    }

  }

});

$(function () {
  $.widget("custom.combobox", {
    _create: function () {
      this.wrapper = $("<span>")
        .addClass("custom-combobox")
        .insertAfter(this.element);

      this.element.hide();
      this._createAutocomplete();
      this._createShowAllButton();
    },

    _createAutocomplete: function () {
      var selected = this.element.children(":selected"),
        value = selected.val() ? selected.text() : "";

      this.input = $("<input>")
        .appendTo(this.wrapper)
        .val(value)
        .attr("id", "lithologyName")
        .attr("title", "")
        .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
        .autocomplete({
          delay: 0,
          minLength: 0,
          source: $.proxy(this, "_source"),
          select: function (event, ui) {
            img.src = "../Assets/Images/" + ui.item.option.text + ".png";
            img.onload = function () {
              var pattern = context.createPattern(img, "repeat");
              context.fillStyle = pattern;
              context.fillRect(0, 0, canvaLith.width, canvaLith.height);
            }
          }
        })
        .tooltip({
          classes: {
            "ui-tooltip": "ui-state-highlight"
          }
        });

      this._on(this.input, {
        autocompleteselect: function (event, ui) {
          ui.item.option.selected = true;
          this._trigger("select", event, {
            item: ui.item.option
          });
        },

        autocompletechange: "_removeIfInvalid",

      });
    },

    _createShowAllButton: function () {
      var input = this.input,
        wasOpen = false;

      $("<a>")
        .attr("tabIndex", -1)
        .attr("title", "Show All Items")
        .tooltip()
        .appendTo(this.wrapper)
        .button({
          icons: {
            primary: "ui-icon-triangle-1-s"
          },
          text: false
        })
        .removeClass("ui-corner-all")
        .addClass("custom-combobox-toggle ui-corner-right")
        .on("mousedown", function () {
          wasOpen = input.autocomplete("widget").is(":visible");
        })
        .on("click", function () {
          input.trigger("focus");
          // Close if already visible
          if (wasOpen) {
            return;
          }

          // Pass empty string as value to search for, displaying all results
          input.autocomplete("search", "");

        });
    },

    _source: function (request, response) {
      var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
      response(this.element.children("option").map(function () {
        var text = $(this).text();
        if (this.value && (!request.term || matcher.test(text)))
          return {
            label: text,
            value: text,
            option: this
          };
      }));
    },

    _removeIfInvalid: function (event, ui) {

      // Selected an item, nothing to do
      if (ui.item) {
        return;
      }

      // Search for a match (case-insensitive)
      var value = this.input.val(),
        valueLowerCase = value.toLowerCase(),
        valid = false;
      this.element.children("option").each(function () {
        if ($(this).text().toLowerCase() === valueLowerCase) {
          this.selected = valid = true;
          return false;
        }
      });

      // Found a match, nothing to do
      if (valid) {
        return;
      }

      // Remove invalid value
      this.input
        .val("")
        .attr("title", value + " didn't match any item")
        .tooltip("open");
      this.element.val("");
      this._delay(function () {
        this.input.tooltip("close").attr("title", "");
      }, 2500);
      this.input.autocomplete("instance").term = "";
    },

    _destroy: function () {
      this.wrapper.remove();
      this.element.show();
    }
  });

  $("#combobox").combobox();
  $("#toggle").on("click", function () {
    $("#combobox").toggle();
  });
});

$("#dialog-form").dialog({
  autoOpen: false,
  height: 550,
  width: 750,
  modal: true,
  buttons: {
    "保存岩性文件到数据库": function () {
      dataBaseName = GetCurrentWellInfo().dataBaseName
      if(dataBaseName){
        var wellName = GetCurrentWellInfo().wellName;
        if(dataBaseName=="当前用户"){
          ULLithologysToServer(wellName);
        }
        else{
          ULLithologysToServer(wellName,dataBaseName);
        }
        
      }
      else{
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
