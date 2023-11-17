javascript:
H5PIntegration;
const User = H5PIntegration.user;
var Content = {};
for(i in H5PIntegration.contents) {
    Content = H5PIntegration.contents[i].jsonContent;
}
Content_json = eval("(" + Content + ")");

const Interations = Content_json.interactiveVideo.assets.interactions;
// console.log(Interations);
const libraryTitle_types = [
    "Image", "True/False Question", "Fill in the Blanks", 
    "Drag and Drop", "Single Choice Set", "Statements", 
    "Drag Text", "Mark the Words", "Multiple Choice"];
const QuestionOrders = [];
for (i=0; i<Interations.length; i++) {
    (Interations[i].duration).order = i;
    QuestionOrders.push(Interations[i].duration);
};
QuestionOrders.sort(function(a,b) {
    if (a.from == b.from) { // 如果开始时间相同，按结束时间排序
        return a.to - b.to; 
    }else{
        return a.from - b.from;
    }
});

newdoc=document.getElementsByClassName("h5p-iframe h5p-initialized")[0].contentWindow.document;

// 处理html字符实体
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// 休眠函数，单位ms
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


async function ShowAnswertoConsole() {
    for (i=0; i<Interations.length; i++) {
        switch (Interations[QuestionOrders[i].order].libraryTitle) {
            case libraryTitle_types[0]:
                // console.log("Image");
                console.log(`第${i+1}个互动是图片，无需答题`);
                break;
            case libraryTitle_types[1]:
                // console.log("True/False Question");
                console.log(`第${i+1}个互动是判断题，答案是${Interations[QuestionOrders[i].order].action.params.correct}`);
                break;
            case libraryTitle_types[2]:
                // console.log("Fill in the Blanks");
                // 第一个replace去掉转义符，第二个replace去除html标签
                var Text = decodeHtml(Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是填空题，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[3]:
                // console.log("Drag and Drop");
                if (Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].single == false) {
                    console.log(`第${i+1}个互动是拖拉题-分类，答案是\n(从0开始的索引，图片序号从左到右，分类栏从左到右)\n0：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].correctElements}\n1：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[1].correctElements}`);
                }else{
                    console.group(`第${i+1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                    for (j=0; j<Interations[QuestionOrders[i].order].action.params.question.task.dropZones.length; j++) {
                        console.log(`${j}：${Interations[QuestionOrders[i].order].action.params.question.task.elements[parseFloat(Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].correctElements[0])].type.params.text.replace(/<(\/)?\w+>/g, '').replace(/\\n/g,'')}x:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].x}，  y:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].y}`);
                    }
                    console.groupEnd(`第${i+1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                }
                break;
            case libraryTitle_types[4]:
                // console.log("Single Choice Set");
                console.group(`第${i+1}个互动是单选题，本互动内共${Interations[QuestionOrders[i].order].action.params.choices.length}题`);
                for (j=0;j<Interations[QuestionOrders[i].order].action.params.choices.length;j++) {
                    console.log(`第${j+1}题的答案是\n${decodeHtml(Interations[QuestionOrders[i].order].action.params.choices[j].answers[0].replace(/<(\/)?\w+>/g, ''))}`);
                }
                console.groupEnd(`第${i+1}个互动是单选题，本互动内共${Interations[QuestionOrders[i].order].action.params.choices.length}题`);
                break;
            case libraryTitle_types[5]:
                // console.log("Statements");
                console.log(`第${i+1}个互动是陈述题（单选），答案是\n${decodeHtml(Interations[QuestionOrders[i].order].action.params.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, ''))}`);
                break;
            case libraryTitle_types[6]:
                // console.log("Drag Text");
                Text = Interations[QuestionOrders[i].order].action.params.textField;
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是拖拉题-文本，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[7]:
                // console.log("Mark the Words");
                Text = decodeHtml(Interations[QuestionOrders[i].order].action.params.textField.replace(/<(\/)?\w+>/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是标记题，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[8]:
                // console.log("Multiple Choice");
                console.group(`第${i+1}个互动是多选题，答案是\n`);
                for (j=0; j<Interations[QuestionOrders[i].order].action.params.answers.length; j++) {
                    if (Interations[QuestionOrders[i].order].action.params.answers[j].correct == true) {
                        console.log(`True: ${decodeHtml(Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>/g, ''))}`);
                    }else{
                        console.log(`False: ${decodeHtml(Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>/g, ''))}`);
                    }
                }
                console.groupEnd(`第${i+1}个互动是多选题，答案是\n`);
                break;
            default:
                console.warn("Error or unknown type");
        };
    };
}


async function AutoAnswer() {
    AllInterations=newdoc.getElementsByClassName("h5p-interactions-container")[0];
    for (i=0;i<AllInterations.children.length;i++) {
        AllInterations.children[i].click();
        await sleep(1000); // 等待页面元素加载
        switch (newdoc.getElementsByClassName("h5p-interactions-container")[0].children[i].getAttribute("title")) {
            case libraryTitle_types[0]: // done
                // console.log("Image");
                console.log(`第${i+1}个互动是图片，无需答题`);
                await sleep(500);
                break;
            case libraryTitle_types[1]: // done
                // console.log("True/False Question");
                console.group(`第${i+1}个互动是判断题，答案是${Interations[QuestionOrders[i].order].action.params.correct}`);
                console.log(`正在自动选择中……`);
                nowFocus=newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
                await sleep(500);
                nowQuestion=nowFocus[0].getElementsByClassName("h5p-true-false-answer"); //当前题目的元选项
                if (Interations[QuestionOrders[i].order].action.params.correct == 'true') {
                    if (nowQuestion[0].innerText == "True") {nowQuestion[0].click(); await sleep(500);}
                    else {nowQuestion[1].click(); await sleep(500);}
                }else{
                    if (nowQuestion[0].innerText == "False") {nowQuestion[0].click(); await sleep(500);}
                    else {nowQuestion[1].click(); await sleep(500);}
                }
                await sleep(500);
                nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
                await sleep(5000);
                console.log(`第${i+1}个互动已自动选择`);
                console.groupEnd(`第${i+1}个互动是判断题，答案是${Interations[QuestionOrders[i].order].action.params.correct}`);
                await sleep(500);
                break;
            case libraryTitle_types[2]: // done
                // console.log("Fill in the Blanks");
                // 第一个replace去掉转义符，第二个replace去除html标签
                var Text = decodeHtml(Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.group(`第${i+1}个互动是填空题，答案是\n${Text_withmark}`);
                console.log(`正在自动填入中……`);
                ans=Text.match(/\*(.*?)\*/g);
                for (j=0;j<ans.length;j++) {
                    ans[j] = ans[j].replace(/\*/g, ''); // 去掉*
                    if (ans[j].includes("/")){
                        ans[j] = ans[j].split("/"); // 如果有/，拆开
                    }
                }
                for (j=0;j<inputs.length;j++) {
                    if (typeof(ans[j])=="object") {inputs[j].value = ans[j][parseInt(Math.random()*ans[j].length)];} 
                    else {inputs[j].value = ans[j];}
                    console.log(`第${j+1}个空已自动填入`);
                    await sleep(1000);
                }
                nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
                await sleep(3000);
                console.log(`第${i+1}个互动已自动选择`);
                console.groupEnd(`第${i+1}个互动是填空题，答案是\n${Text_withmark}`);
                await sleep(500);
                break;
            case libraryTitle_types[3]:
                // console.log("Drag and Drop");
                if (Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].single == false) {
                    console.log(`第${i+1}个互动是拖拉题-分类，答案是\n(从0开始的索引，图片序号从左到右，分类栏从左到右)\n0：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].correctElements}\n1：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[1].correctElements}`);
                }else{
                    console.group(`第${i+1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                    for (j=0; j<Interations[QuestionOrders[i].order].action.params.question.task.dropZones.length; j++) {
                        console.log(`${j}：${Interations[QuestionOrders[i].order].action.params.question.task.elements[parseFloat(Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].correctElements[0])].type.params.text.replace(/<(\/)?\w+>/g, '').replace(/\\n/g,'')}x:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].x}，  y:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].y}`);
                    }
                    console.groupEnd(`第${i+1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                }
                break;
            case libraryTitle_types[4]: // done
                // console.log("Single Choice Set");
                console.group(`第${i+1}个互动是单选题，本互动内共${Interations[QuestionOrders[i].order].action.params.choices.length}题`);
                for (j=0;j<Interations[QuestionOrders[i].order].action.params.choices.length;j++) {
                    console.log(`第${j+1}题的答案是\n${decodeHtml(Interations[QuestionOrders[i].order].action.params.choices[j].answers[0].replace(/<(\/)?\w+>/g, ''))}`);
                }
                console.log(`正在自动选择中……`);
                nowFocus=newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
                await sleep(500);
                corrects=newdoc.getElementsByClassName("h5p-sc-is-correct");
                for (j=0;j<Interations[QuestionOrders[i].order].action.params.choices.length;j++) {
                    corrects[j].click();
                    console.log(`第${j+1}题已自动选择`);
                    await sleep(5000); // 等跳到下一页再选下一题
                }
                await sleep(5000); // 等待跳到结算页面
                // nowFocus[0].getElementsByClassName("h5p-question-iv-continue h5p-joubelui-button")[0].click(); // 点个continue
                console.log(`第${i+1}个互动已自动选择`);
                console.groupEnd(`第${i+1}个互动是单选题，本互动内共${Interations[QuestionOrders[i].order].action.params.choices.length}题`);
                await sleep(500);
                break;
            case libraryTitle_types[5]:
                // console.log("Statements");
                console.log(`第${i+1}个互动是陈述题（单选），答案是\n${decodeHtml(Interations[QuestionOrders[i].order].action.params.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, ''))}`);
                break;
            case libraryTitle_types[6]:
                // console.log("Drag Text");
                Text = Interations[QuestionOrders[i].order].action.params.textField;
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是拖拉题-文本，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[7]:
                // console.log("Mark the Words");
                Text = decodeHtml(Interations[QuestionOrders[i].order].action.params.textField.replace(/<(\/)?\w+>/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是标记题，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[8]: // done
                // console.log("Multiple Choice");
                console.group(`第${i+1}个互动是多选题，答案是\n`);
                for (j=0; j<Interations[QuestionOrders[i].order].action.params.answers.length; j++) {
                    if (Interations[QuestionOrders[i].order].action.params.answers[j].correct == true) {
                        console.log(`True: ${decodeHtml(Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>|\n/g, ''))}`);
                    }else{
                        console.log(`False: ${decodeHtml(Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>|\n/g, ''))}`);
                    }
                }
                console.log(`正在自动选择中……`);
                nowFocus=newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
                await sleep(500);
                nowQuestion=nowFocus[0].getElementsByClassName("h5p-alternative-inner"); //当前题目的选项
                for (j=0; j<Interations[QuestionOrders[i].order].action.params.answers.length; j++) {
                    if (Interations[QuestionOrders[i].order].action.params.answers[j].correct == true) {
                        for(k=0;k<nowQuestion.length;k++) {
                            if (nowQuestion[k].innerText == decodeHtml(Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>|\n/g, ''))) {
                                nowQuestion[k].click();
                                console.log(`第${k+1}个选项已自动选择`);
                                await sleep(500);
                            }
                        }
                    }
                }
                nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
                await sleep(5000);
                console.log(`第${i+1}个互动已自动选择`);
                console.groupEnd(`第${i+1}个互动是多选题，答案是\n`);
                await sleep(500);
                break;
            default:
                console.warn("Error or unknown type");
        };
    };
    await sleep(2000);
    console.log(`已自动答题完毕，提交中……`);

    newdoc.getElementsByClassName("h5p-control h5p-star h5p-star-foreground")[0].click(); // 呼出提交窗口
    await sleep(3000);
    console.log(`点击提交成功`);
    // todo：加个判断是否总得分相等再点击提交
    // newdoc.getElementsByClassName("h5p-interactive-video-endscreen-submit-button h5p-joubelui-button")[0].click(); // 点击提交按钮

}


const newbutton = document.createElement("button"); // 加个按钮咯，按了才能看到答案
newbutton.id = "QMULAutoFindAnswer";
newbutton.className = "u-button nd-file-list-toolbar-action-item u-button--primary1";
newbutton.style.marginRight = "8px";
newbutton.innerText = "QMULAutoFindAnswer";
document.querySelector("div.page-context-header").prepend(newbutton);
document.getElementById("QMULAutoFindAnswer").addEventListener("click", () => {
    ShowAnswertoConsole();
});

const newbutton2 = document.createElement("button"); // 加个按钮咯，按了才能自动答题
newbutton2.id = "AutoAnswer";
newbutton2.className = "u-button nd-file-list-toolbar-action-item u-button--primary2";
newbutton2.style.marginRight = "8px";
newbutton2.innerText = "AutoFind";
document.querySelector("div.page-context-header").prepend(newbutton2);
document.getElementById("AutoAnswer").addEventListener("click", () => {
    AutoAnswer();
});

/**
nowFocus=newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
inputs=nowFocus[0].getElementsByClassName("h5p-text-input"); // 当前题目的输入框
ans=Text.match(/\*(.*?)\*/g);
for (j=0;j<ans.length;j++) {
    ans[j] = ans[j].replace(/\*/g, ''); // 去掉*
    if (ans[j].includes("/")){
        ans[j] = ans[j].split("/"); // 如果有/，拆开
    }
}
for (j=0;j<inputs.length;j++) {
    if (typeof(ans[j])=="object") {
        inputs[j].value = ans[j][parseInt(Math.random()*ans[j].length)];
    }
    else {
        inputs[j].value = ans[j];
    }
}
var Text = decodeHtml(Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, ''));
Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
