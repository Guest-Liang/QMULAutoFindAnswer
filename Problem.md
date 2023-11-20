## undo
### 填空题
1.1填空题3识别不到已经答题   
1.2填空题124识别不到已经答题   
2.3填空题4识别不到已经答题   
3.2填空题2   
4.1第二个填空卡，识别不到已经答完题   
4.3填空题5   
4.4第三个填空题卡，识别不到已经答完题   
6.1第一个填空题卡，识别不到答完题   
7.2填空题卡，识别不到答完题   
8.1填空题卡，识别不到答完题    
10.1填空题卡，识别不到答完题   
10.3填空题卡，识别不到答完题
### 其他问题
fixed   


## pass
1.3 |   
2.1 | 2.2 | 2.4提前呼出 |   
3.1 | 3.3 |   
4.2a | 4.2b |   
6.2 | 6.3 | 6.4 |   
7.1 | 7.3 | 7.4 | 7.5 |   
8.2a提前结束，自动呼出，再点击提交窗口则会消失 | 8.2b | 8.3a | 8.3b | 8.4 |  
9.1a | 9.1b | 9.2a | 9.2b | 9.3a提前结束，自动呼出，再点击提交窗口则会消失 | 9.3b | 9.3c |   
10.2 | 10.4   




## 测试代码
```js
function fireKeyEvent(element, evtType, keyChar) {
    element.focus();
    var KeyboardEventInit = {key:keyChar, code:"", location:0, repeat:false, isComposing:false};
    var evtObj = new KeyboardEvent(evtType, KeyboardEventInit);
    element.dispatchEvent(evtObj);
}

var objInput = document.getElementById("sb_form_q");
objInput.addEventListener('keydown', function (e) {
    objInput.value += e.key;
}, false);

fireKeyEvent(objInput,"keydown","a");
```

