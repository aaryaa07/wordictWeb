var y = document.querySelectorAll(".card");
function handleClick(a){
    console.log(a.innerText);
    var word=a.innerText;
    console.log(word);
    
}
 
    for(var i=0;i<y.length;i++){
        y[i].addEventListener("onclick",handleClick);
        
    
    }