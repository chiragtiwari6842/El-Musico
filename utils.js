function TextAbstract(text, length){
    if (text == null){
        return "";
    }
    if(text.length <= length){
        return text;
    }
    text = text.substring(0, length);
    last = text.lastIndexOf(" ");
    text = text.substring(0, last);
    return text + "...";
}