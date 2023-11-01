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


const newbutton = document.createElement("button");

newbutton.id = "QMULAutoFindAnswer";
newbutton.className = "u-button nd-file-list-toolbar-action-item u-button--primary";
newbutton.style.marginRight = "8px";
newbutton.innerText = "QMULAutoFindAnswer";
document.querySelector("div.page-context-header").prepend(newbutton);

document.getElementById("QMULAutoFindAnswer").addEventListener("click", () => {
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
                // 第一个replace去掉转义符，第二个replace去除html标签，第三个replace去除空格符
                var Text = Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ');
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是填空题，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[3]:
                // console.log("Drag and Drop");
                if (Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].single == false) {
                    console.log(`第${i+1}个互动是拖拉题-分类，答案是\n(从0开始的索引，图片序号从左到右，分类栏从左到右)\n0：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[0].correctElements}\n1：${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[1].correctElements}`);
                }else{
                    console.log(`第${i+1}个互动是拖拉题-一项一框，将画面向右视为x轴正方向，向下视为y轴正方向，左上角为原点，坐标为\n`);
                    for (j=0; j<Interations[QuestionOrders[i].order].action.params.question.task.dropZones.length; j++) {
                        console.log(`${j}：${Interations[QuestionOrders[i].order].action.params.question.task.elements[parseFloat(Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].correctElements[0])].type.params.text.replace(/<(\/)?\w+>/g, '').replace(/\\n/g,'')}x:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].x}，  y:${Interations[QuestionOrders[i].order].action.params.question.task.dropZones[j].y}`);
                    }
                }
                break;
            case libraryTitle_types[4]:
                // console.log("Single Choice Set");
                console.log(`第${i+1}个互动是单选题，答案是\n${Interations[QuestionOrders[i].order].action.params.choices[0].answers[0].replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')}`);
                break;
            case libraryTitle_types[5]:
                // console.log("Statements");
                console.log(`第${i+1}个互动是陈述题（单选），答案是\n${Interations[QuestionOrders[i].order].action.params.summaries[0].summary[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')}`);
                break;
            case libraryTitle_types[6]:
                // console.log("Drag Text");
                Text = Interations[QuestionOrders[i].order].action.params.textField;
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是拖拉题-文本，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[7]:
                // console.log("Mark the Words");
                Text = Interations[QuestionOrders[i].order].action.params.textField.replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ');
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[40;37m$1\x1b[0m");
                console.log(`第${i+1}个互动是标记题，答案是\n${Text_withmark}`);
                break;
            case libraryTitle_types[8]:
                // console.log("Multiple Choice");
                console.log(`第${i+1}个互动是多选题，答案是\n`);
                var AnswersNum = Interations[QuestionOrders[i].order].action.params.answers.length;
                for (j=0; j<AnswersNum; j++) {
                    if (Interations[QuestionOrders[i].order].action.params.answers[j].correct == true) {
                        console.log(`True: ${Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')}`);
                    }else{
                        console.log(`False: ${Interations[QuestionOrders[i].order].action.params.answers[j].text.replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')}`);
                    }
                }
                break;
            default:
                console.warn("Error or unknown type");
        };
    };
});