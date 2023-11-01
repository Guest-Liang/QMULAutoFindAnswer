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
const libraryTitle_types = ["Image", "True/False Question", "Fill in the Blanks"];
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
                // window.alert(`第${i+1}个互动是图片，无需答题`);
                break;
            case libraryTitle_types[1]:
                // console.log("True/False Question");
                console.log(`第${i+1}个互动是判断题，答案是${Interations[QuestionOrders[i].order].action.params.correct}`);
                // window.alert(`第${i+1}个互动是判断题，答案是${Interations[QuestionOrders[i].order].action.params.correct}`);
                break;
            case libraryTitle_types[2]:
                // console.log("Fill in the Blanks");
                // 第一个replace去掉转义符，第二个replace去除html标签，第三个replace去除空格符
                var Text = Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ');
                Text_withmark = Text.replace(/\*(.*?)\*/g, "\x1b[42;30m$1\x1b[0m");
                console.log(`第${i+1}个互动是填空题，答案是\n${Text_withmark}`);
                break;
            default:
                console.warn("Error or unknown type");
        };
    };
});