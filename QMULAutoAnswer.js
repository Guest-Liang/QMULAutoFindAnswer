javascript:
H5PIntegration;
const User = H5PIntegration.user;
const Content = H5PIntegration.contents["cid-2642"].jsonContent;
// let Content_without_escape=Content.replace(/\\/g,""); // remove escape character,去除转义字符，便于后续定位
// Content_json = eval("(" + Content_without_escape + ")"); // convert string to json,将字符串转换为json
Content_json = eval("(" + Content + ")");

const Interations = Content_json.interactiveVideo.assets.interactions;
// console.log(Interations);
const libraryTitle_types = ["Image","True/False Question", "Fill in the Blanks"];
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
// console.log(QuestionOrders);
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
            console.log(`第${i+1}个互动是填空题，答案是\n${Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')}`);
            // console.log(Interations[QuestionOrders[i].order].action.params.questions[0].replace(/[\n]/g, "").replace(/<[^>]+>/g, "")); 
            // console.log(Interations[QuestionOrders[i].order].action.params.questions[0].replace(/\\\//g, '/').replace(/<(\/)?\w+>/g, '').replace(/&nbsp;/g, ' ')); // 第一个replace去掉转义符，第二个replace去除html标签，第三个replace去除空格符
            break;
        default:
            console.log("Error or unknown type");
    };
};