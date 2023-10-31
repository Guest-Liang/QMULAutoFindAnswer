javascript:
H5PIntegration;
const User = H5PIntegration.user;
const Content = H5PIntegration.contents["cid-2642"].jsonContent;
let reg = /\\/g;
let Content_without_escape=Content.replace(reg,""); // remove escape character,去除转义字符，便于后续定位
Content_json = eval("(" + Content_without_escape + ")"); // convert string to json,将字符串转换为json
console.log(Content_json.interactiveVideo);

const Interations = Content_json.interactiveVideo.assets.interactions;
console.log(Interations);
libraryTitle_types = ["Image","True\\/False Question", "Fill in the Blanks"];
