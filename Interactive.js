javascript:
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

H5PIntegration;
const User = H5PIntegration.user;
let Content = {};
for (let key in H5PIntegration.contents) {
    if (H5PIntegration.contents.hasOwnProperty(key)) {
        Content = H5PIntegration.contents[key].jsonContent;
    }
}
let ContentJson = JSON.parse(Content);

// questions.library去重
const questions = ContentJson.questions;
const uniqueLibraries = new Set();
questions.forEach(question => {
    uniqueLibraries.add(question.library);
});
const uniqueLibraryArray = Array.from(uniqueLibraries).sort();
console.log(`librarytypes共有${uniqueLibraryArray.length}种:\n[${uniqueLibraryArray}]`);

let newdoc = document.getElementsByClassName("h5p-iframe h5p-initialized")[0].contentWindow.document;


const progressItems = newdoc.querySelectorAll('.questionset.started .question-container.h5p-question');

// 遍历这些元素并展示class为h5p-question-introduction的子元素
progressItems.forEach((item, index) => {
    const questionIntro = item.querySelector('.h5p-question-introduction');
    questions.forEach(question => {
        if (decodeHtml(question.params.question) === questionIntro.textContent) {
            console.log(`Item ${index + 1} - Question Introduction: ${questionIntro.textContent}`);
            console.log(`11111111111111111111111111111`);
        } else {
            console.log(`222`);
        }
    });
});

