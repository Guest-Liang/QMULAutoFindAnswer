javascript:
H5PIntegration;
const User = H5PIntegration.user;
let Content = {};
for (let key in H5PIntegration.contents) {
    if (H5PIntegration.contents.hasOwnProperty(key)) {
        Content = H5PIntegration.contents[key].jsonContent;
    }
}
let Content_json = JSON.parse(Content);
const Interations = Content_json.interactiveVideo.assets.interactions;
// console.log(Interations);
const libraryTitle_types = [
    "Image", "True/False Question", "Fill in the Blanks",
    "Drag and Drop", "Single Choice Set", "Statements",
    "Drag Text", "Mark the Words", "Multiple Choice"
];
let QuestionOrders = [];
for (i = 0; i < Interations.length; i++) {
    (Interations[i].duration).order = i;
    QuestionOrders.push(Interations[i].duration);
}
QuestionOrders.sort(function (a, b) {
    return a.from === b.from ? a.to - b.to : a.from - b.from; // 如果开始时间相同按结束时间排序
});
let newdoc = document.getElementsByClassName("h5p-iframe h5p-initialized")[0].contentWindow.document;


// 自定义参数，单位ms
const TypeSpeed = 100; // 打字间隔，控制填空题单个字符输入间隔
const RelaxTime = 500; // 休息时间，控制大题间答题间隔
const CheckTime = 5000; // 点击Check后的休息时间，不建议低于4000
const inQuesLapse = 100; // 题目中的休息间隔，控制题目内部选项选择间隔，多个单选无效
// End of 自定义参数



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

// 辅助函数：处理判断题函数
async function handleTrueFalseQuestion(Mainly, index, newdoc, CheckTime) {
    console.group(`第${index + 1}个互动是判断题，答案是\n${Mainly.correct}`);
    console.log(`正在自动选择中……`);
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background");
    const nowQuestion = nowFocus[0].getElementsByClassName("h5p-true-false-answer");
    (Mainly.correct === 'true' ? (nowQuestion[0].innerText === "True" ? nowQuestion[0] : nowQuestion[1]) : (nowQuestion[0].innerText === "False" ? nowQuestion[0] : nowQuestion[1])).click();
    await sleep(500);
    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click();
    await sleep(CheckTime);
    console.log(`第${index + 1}个互动已自动选择`);
    console.groupEnd();
}

// 辅助函数：处理填空题
async function handleFillInBlanks(Mainly, index, newdoc, TypeSpeed, inQuesLapse, CheckTime) {
    const Text = decodeHtml(Mainly.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''));
    const Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
    console.group(`第${index + 1}个互动是填空题，答案是\n${Text_withmark}`);
    console.log(`正在自动填入中……`);
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background");
    const inputs = nowFocus[0].getElementsByClassName("h5p-text-input");
    const ans = Text.match(/\*(.*?)\*/g);

    for (let j = 0; j < ans.length; j++) {
        ans[j] = ans[j].replace(/\*/g, ''); // 去掉*
        if (ans[j].includes("/")) {
            ans[j] = ans[j].split("/"); // 如果有多个答案，取第一个
        }
    }
    for (let j = 0; j < inputs.length; j++) {
        inputs[j].focus();
        if (Array.isArray(ans[j])) {
            let r = Math.floor(Math.random() * ans[j].length); // 随机选择一个
            for (let char of ans[j][r]) {
                inputs[j].value += char;
                await sleep(TypeSpeed);
            }
        }
        else {
            for (let char of ans[j]) {
                inputs[j].value += char;
                await sleep(TypeSpeed);
            }
        }
        inputs[j].dispatchEvent(new Event('change')); // 触发change事件
        inputs[j].blur();
        console.log(`第${j + 1}个空已自动填入`);
        await sleep(inQuesLapse);
    }

    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click();
    await sleep(CheckTime);
    console.log(`第${index + 1}个互动已自动填入`);
    console.groupEnd();
}

// 辅助函数：处理拖拉题
async function handleDragAndDrop(Mainly, index, newdoc, inQuesLapse, CheckTime) {
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
    let ContenttoPut;
    switch (Mainly.question.task.elements[0].type.metadata.contentType) {
        case "Image":
            ContenttoPut = newdoc.querySelectorAll(".h5p-draggable.ui-draggable.ui-draggable-handle.h5p-image"); // querySelector静态拷贝
            console.log(`图片分类题目`);
            break;
        case "Text":
            ContenttoPut = newdoc.querySelectorAll(".h5p-draggable.ui-draggable.ui-draggable-handle.h5p-advanced-text"); // querySelector静态拷贝
            console.log(`文字分类题目`);
            break;
    }
    let DropZones = nowFocus[0].getElementsByClassName("h5p-dropzone"); // 当前题目的dropzones
    let DropZonesNum = Mainly.question.task.dropZones.length;
    if (Mainly.question.task.dropZones[0].single === false) {
        console.group(`第${index + 1}个互动是拖拉题-分类，答案是\n(从0开始的索引，内容序号从左到右，分类栏从左到右)：`);
        for (let j = 0; j < DropZonesNum; j++) {
            console.log(`${j}: ${Mainly.question.task.dropZones[j].correctElements}`);
        }
        console.log(`正在自动填入中……`);
        for (let j = 0; j < ContenttoPut.length; j++) {
            for (let k = 0; k < DropZonesNum; k++) {
                const result = Mainly.question.task.dropZones[k].correctElements.includes(j.toString());
                if (result) {
                    DropZones[k].appendChild(ContenttoPut[j]); // 将图片放入dropzone
                    ContenttoPut[j].click();
                    console.log(`第${j + 1}个选项已自动填入`);
                    await sleep(inQuesLapse);
                    break;
                }
            }
        }
    } else {
        console.group(`第${index + 1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
        for (let j = 0; j < DropZonesNum; j++) {
            console.log(`${j}：${decodeHtml(Mainly.question.task
                .elements[parseFloat(Mainly.question.task.dropZones[j].correctElements[0])]
                .type.params.text.replace(/<(\/)?\w+>|\n/g, ''))}\nx:${Mainly.question.task.dropZones[j].x}，  y:${Mainly.question.task.dropZones[j].y}`);
        }
        console.log(`正在自动填入中……`);
        let skip = []; // 用于记录已经填入的选项
        for (let j = 0; j < ContenttoPut.length; j++) {
            for (let k = 0; k < DropZones.length; k++) {
                var result = decodeHtml(Mainly.question.task
                    .elements[parseFloat(Mainly.question.task.dropZones[k].correctElements[0])]
                    .type.params.text.replace(/<(\/)?\w+>|\n/g, '')) === ContenttoPut[j].children[1].innerText;
                if (result && !skip.includes(k)) {
                    DropZones[k].appendChild(ContenttoPut[j]); // 将图片放入dropzone
                    DropZones[k].lastChild.click();
                    console.log(`第${j + 1}个选项已自动填入`);
                    skip.push(k);
                    await sleep(inQuesLapse);
                    break;
                }
            }
        }
    }
    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
    console.log(`第${index + 1}个互动已自动选择`);
    await sleep(CheckTime);
    console.groupEnd();
}

// 辅助函数：处理单选题
async function handleSingleChoiceSet(Mainly, index, newdoc) {
    let ActualLength = questions.filter(q => q.question !== undefined).length;
    console.group(`第${index + 1}个互动是单选题，本互动内共${ActualLength}题`);
    console.log(`正在自动选择中……`);
    for (let j = 0; j < ActualLength; j++) {
        console.log(`第${j + 1}题的答案是\n${decodeHtml(Mainly.choices[j].answers[0].replace(/<(\/)?\w+>/g, ''))}`);
    }
    let corrects = newdoc.getElementsByClassName("h5p-sc-is-correct");
    for (let j = 0; j < ActualLength; j++) {
        corrects[j].click();
        console.log(`第${j + 1}题已自动选择`);
        console.log(`等待跳转下一页……`);
        if (j === ActualLength - 1) { break; } // 如果是最后一题，不等待跳转下一页
        else { await sleep(5000); } // 等跳到下一页再选下一题
    }
    console.log(`等待跳转结算页……`);
    await sleep(5000); // 等待跳到结算页面
    console.log(`第${index + 1}个互动已自动选择`);
    console.groupEnd();
}

// 辅助函数：处理陈述题
async function handleStatements(Mainly, index, newdoc) {
    const ans = decodeHtml(Mainly.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''));
    console.group(`第${index + 1}个互动是陈述题（单选），答案是\n${ans}`);
    console.log(`正在自动选择中……`);
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
    const nowQuestion = nowFocus[0].getElementsByClassName("summary-claim-unclicked"); //当前题目的选项
    for (let j = 0; j < nowQuestion.length; j++) {
        if (nowQuestion[j].innerText === decodeHtml(Mainly.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''))) {
            nowQuestion[j].click();
            console.log(`第${j + 1}个选项已自动选择`);
            await sleep(5000);
        }
    }
    console.log(`第${index + 1}个互动已自动选择`);
    console.groupEnd();
}

// 辅助函数：处理拖拉文本题
async function handleDragText(Mainly, index, newdoc, inQuesLapse, CheckTime) {
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
    const Text = Mainly.textField;
    const Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
    console.group(`第${index + 1}个互动是拖拉题-文本，答案是\n${Text_withmark}`);
    console.log(`正在自动填入中……`);
    var DropZones = nowFocus[0].getElementsByClassName("h5p-drag-dropzone-container"); // 当前题目的dropzones
    var WordstoPut = newdoc.querySelectorAll(".ui-draggable.ui-draggable-handle"); // querySelector静态拷贝
    var ans = Text.match(/\*(.*?)\*/g);
    for (let j = 0; j < ans.length; j++) {
        ans[j] = ans[j].replace(/\*/g, ''); // 去掉*
    }
    for (let j = 0; j < DropZones.length; j++) {
        for (let k = 0; k < WordstoPut.length; k++) {
            let result = ans[j] === (WordstoPut[k].children.length === 0 ? WordstoPut[k].innerText : WordstoPut[k].children[0].innerText);
            if (result) {
                DropZones[j].children[0].appendChild(WordstoPut[k]); // 将文字放入dropzone
                WordstoPut[k].click();
                console.log(`第${j + 1}个选项已自动填入`);
                await sleep(inQuesLapse);
                break;
            }
        }
    }
    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
    console.log(`第${index + 1}个互动已自动选择`);
    await sleep(CheckTime);
    console.groupEnd();
}

// 辅助函数：处理标记题
async function handleMarktheWords(Mainly, index, newdoc, inQuesLapse, CheckTime) {
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
    const words = nowFocus[0].getElementsByClassName("h5p-word-selectable-words");
    const Text = decodeHtml(Mainly.textField.replace(/<(\/)?\w+>/g, ''));
    const Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
    console.group(`第${index + 1}个互动是标记题，答案是\n${Text_withmark}`);
    let ans = Text.match(/\*(.*?)\*/g);
    for (let j = 0; j < ans.length; j++) {
        ans[j] = ans[j].replace(/\*/g, ''); // 去掉*
        if (ans[j].includes("/")) {
            ans[j] = ans[j].split("/"); // 如果有/，拆开
        }
    }
    console.log(`正在自动选择中……`);
    for (let j = 0; j < words[0].children[0].children.length; j++) {
        if (ans.includes(words[0].children[0].children[j].innerText)) {
            words[0].children[0].children[j].click();
            console.log(`第${j + 1}个选项已自动选择`);
            await sleep(inQuesLapse);
        }
    }
    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
    await sleep(CheckTime);
    console.log(`第${index + 1}个互动已自动选择`);
    console.groupEnd();
}

// 辅助函数：处理多选题
async function handleMultipleChoice(Mainly, index, newdoc) {
    console.group(`第${index + 1}个互动是多选题，答案是\n`);
    for (let j = 0; j < Mainly.answers.length; j++) {
        console.log(`${Mainly.answers[j].correct === true ? 'True' : 'False'}: ${decodeHtml(Mainly.answers[j].text.replace(/<(\/)?\w+>|\n/g, ''))}`);
    }
    console.log(`正在自动选择中……`);
    const nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
    const nowQuestion = nowFocus[0].getElementsByClassName("h5p-alternative-inner"); //当前题目的选项
    for (let j = 0; j < Mainly.answers.length; j++) {
        for (let k = 0; k < nowQuestion.length; k++) {
            if (Mainly.answers[j].correct === true) {
                if (decodeHtml(nowQuestion[k].innerHTML.replace(/<(\/)?\w+>|\n/g, '')) === decodeHtml(Mainly.answers[j].text.replace(/<(\/)?\w+>|\n/g, '')))
                {
                    nowQuestion[k].click();
                    console.log(`第${k + 1}个选项已自动选择`);
                    await sleep(inQuesLapse);
                    break;
                }
            } else { break; }
        }
    }
    nowFocus[0].getElementsByClassName("h5p-question-check-answer h5p-joubelui-button")[0].click(); // 选完记得点击Check！
    console.log(`等待跳转结算页……`);
    await sleep(CheckTime);
    console.log(`第${i + 1}个互动已自动选择`);
    console.groupEnd();
}


async function ShowAnswertoConsole() {
    const AllInterations = newdoc.getElementsByClassName("h5p-interactions-container")[0]; // 获取所有互动
    await sleep(2000); // 等待页面元素加载
    for (let i = 0; i < AllInterations.children.length; i++) {
        const Mainly = Interations[QuestionOrders[i].order].action.params;
        AllInterations.children[i].click(); // 选中当前互动
        await sleep(1000); // 等待页面元素加载  
        let Text, Text_withmark;
        switch (AllInterations.children[i].getAttribute("title")) {
            case libraryTitle_types[0]: // done
                // console.log("Image");
                console.log(`第${i + 1}个互动是图片，无需答题`);
                break;
            case libraryTitle_types[1]: // done
                // console.log("True/False Question");
                console.group(`第${i + 1}个互动是判断题，答案是\n${Mainly.correct}`);
                console.groupEnd();
                break;
            case libraryTitle_types[2]: // done
                // console.log("Fill in the Blanks");
                Text = decodeHtml(Mainly.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.group(`第${i + 1}个互动是填空题，答案是\n${Text_withmark}`);
                console.groupEnd();
                break;
            case libraryTitle_types[3]: // done
                // console.log("Drag and Drop");
                let ContenttoPut;
                switch (Mainly.question.task.elements[0].type.metadata.contentType) {
                    case "Image":
                        ContenttoPut = newdoc.querySelectorAll(".h5p-draggable.ui-draggable.ui-draggable-handle.h5p-image"); // querySelector静态拷贝
                        console.log(`图片分类题目`);
                        break;
                    case "Text":
                        ContenttoPut = newdoc.querySelectorAll(".h5p-draggable.ui-draggable.ui-draggable-handle.h5p-advanced-text"); // querySelector静态拷贝
                        console.log(`文字分类题目`);
                        break;
                }
                let DropZonesNum = Mainly.question.task.dropZones.length;
                if (Mainly.question.task.dropZones[0].single === false) {
                    console.group(`第${i + 1}个互动是拖拉题-分类，答案是\n(从0开始的索引，内容序号从左到右，分类栏从左到右)：`);
                    for (let j = 0; j < DropZonesNum; j++) {
                        console.log(`${j}: ${Mainly.question.task.dropZones[j].correctElements}`);
                    }
                    console.log(`正在自动填入中……`);
                } else {
                    console.group(`第${i + 1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                    for (let j = 0; j < DropZonesNum; j++) {
                        console.log(`${j}：${decodeHtml(Mainly.question.task
                            .elements[parseFloat(Mainly.question.task.dropZones[j].correctElements[0])]
                            .type.params.text.replace(/<(\/)?\w+>|\n/g, ''))}\nx:${Mainly.question.task.dropZones[j].x}，  y:${Mainly.question.task.dropZones[j].y}`);
                    }
                }
                console.groupEnd();
                break;
            case libraryTitle_types[4]: // done
                // console.log("Single Choice Set");
                let ActualLength = questions.filter(q => q.question !== undefined).length;
                console.group(`第${i + 1}个互动是单选题，本互动内共${ActualLength}题`);
                for (let j = 0; j < ActualLength; j++) {
                    console.log(`第${j + 1}题的答案是\n${decodeHtml(Mainly.choices[j].answers[0].replace(/<(\/)?\w+>/g, ''))}`);
                }
                console.groupEnd();
                break;
            case libraryTitle_types[5]: // done
                // console.log("Statements");
                const ans = decodeHtml(Mainly.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>|\n/g, ''));
                console.group(`第${i + 1}个互动是陈述题（单选），答案是\n${ans}`);
                console.groupEnd();
                break;
            case libraryTitle_types[6]: // done
                // console.log("Drag Text");
                Text = Mainly.textField;
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.group(`第${i + 1}个互动是拖拉题-文本，答案是\n${Text_withmark}`);
                await sleep(CheckTime);
                console.groupEnd();
                await sleep(RelaxTime);
                break;
            case libraryTitle_types[7]: // done
                // console.log("Mark the Words");
                Text = decodeHtml(Mainly.textField.replace(/<(\/)?\w+>/g, ''));
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.group(`第${i + 1}个互动是标记题，答案是\n${Text_withmark}`);
                console.groupEnd();
                break;
            case libraryTitle_types[8]: // done
                // console.log("Multiple Choice");
                console.group(`第${i + 1}个互动是多选题，答案是\n`);
                for (let j = 0; j < Mainly.answers.length; j++) {
                    console.log(`${Mainly.answers[j].correct === true ? 'True' : 'False'}: ${decodeHtml(Mainly.answers[j].text.replace(/<(\/)?\w+>|\n/g, ''))}`);
                }
                console.groupEnd();
                break;
            default:
                console.warn("Error or unknown type");
        };
        // await sleep(RelaxTime);
    }
}


async function AutoAnswer() {
    const AllInterations = newdoc.getElementsByClassName("h5p-interactions-container")[0]; // 获取所有互动
    await sleep(2000); // 等待页面元素加载
    for (let i = 0; i < AllInterations.children.length; i++) {
        const Mainly = Interations[QuestionOrders[i].order].action.params;
        AllInterations.children[i].click(); // 选中当前互动
        await sleep(1000); // 等待页面元素加载  
        let nowFocus = newdoc.getElementsByClassName("h5p-overlay h5p-ie-transparent-background"); // 包装当前题目的元素
        switch (AllInterations.children[i].getAttribute("title")) {
            case libraryTitle_types[0]: // done
                // console.log("Image");
                console.group(`第${i + 1}个互动是图片，无需答题`);
                console.groupEnd();
                break;
            case libraryTitle_types[1]: // done
                // console.log("True/False Question");
                handleTrueFalseQuestion(Mainly, i, newdoc, CheckTime);
                break;
            case libraryTitle_types[2]: // done
                // console.log("Fill in the Blanks");
                handleFillInBlanks(Mainly, i, newdoc, TypeSpeed, inQuesLapse, CheckTime);
                break;
            case libraryTitle_types[3]: // done
                // console.log("Drag and Drop");
                handleDragAndDrop(Mainly, i, newdoc, inQuesLapse, CheckTime);
                break;
            case libraryTitle_types[4]: // done
                // console.log("Single Choice Set");
                handleSingleChoiceSet(Mainly, i, newdoc);
                break;
            case libraryTitle_types[5]: // done
                // console.log("Statements");
                handleStatements(Mainly, i, newdoc);
                break;
            case libraryTitle_types[6]: // done
                // console.log("Drag Text");
                handleDragText(Mainly, i, newdoc, inQuesLapse, CheckTime);
                break;
            case libraryTitle_types[7]: // done
                // console.log("Mark the Words");
                handleMarktheWords(Mainly, i, newdoc, inQuesLapse, CheckTime);
                break;
            case libraryTitle_types[8]: // done
                // console.log("Multiple Choice");
                handleMultipleChoice(Mainly, i, newdoc);
                break;
            default:
                console.warn("Error or unknown type");
        };
        await sleep(RelaxTime);
        if (nowFocus[0].getElementsByClassName("h5p-ssc-next-button h5p-joubelui-button").length !== 0) { // 如果有下一页按钮，点击下一页
            nowFocus[0].getElementsByClassName("h5p-ssc-next-button h5p-joubelui-button")[0].click();
            console.log(`正在跳转下一页……`);
            await sleep(5000);
        }
        if (nowFocus[0].getElementsByClassName("h5p-question-iv-continue h5p-joubelui-button").length !== 0) { // 如果有继续按钮，点一下
            nowFocus[0].getElementsByClassName("h5p-question-iv-continue h5p-joubelui-button")[0].click();
            console.log(`Continuning……`);
            await sleep(500);
        }
    };
    console.log(`已自动答题完毕`);

    // newdoc.getElementsByClassName("h5p-control h5p-star h5p-star-foreground")[0].click(); // 呼出提交窗口
    // await sleep(2000);
    // console.log(`呼出提交窗口成功`);
    // todo：加个判断是否总得分相等再点击提交
    // todo: await 元素加载完成再点击
    // newdoc.getElementsByClassName("h5p-interactive-video-endscreen-submit-button h5p-joubelui-button")[0].click(); // 点击提交按钮

}


const newbutton = document.createElement("button"); // 加个按钮咯，按了才能看到答案
newbutton.id = "QMULShowAnswerinConsole";
newbutton.className = "u-button nd-file-list-toolbar-action-item u-button--primary1";
newbutton.style.marginRight = "8px";
newbutton.innerText = "QMULShowAnswerinConsole";
document.querySelector("div.page-context-header").prepend(newbutton);
document.getElementById("QMULShowAnswerinConsole").addEventListener("click", () => {
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