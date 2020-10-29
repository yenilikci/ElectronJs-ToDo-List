const electron  = require("electron");
const {ipcRenderer} = electron;

checkToDoCount();

//normal ekleme
const todoValue = document.querySelector('#todoValue');

//klavye ile entera basarak veri ekleme
todoValue.addEventListener('keypress',(e) => {
    if (e.keyCode == 13){
      //entera basılmışsa
      ipcRenderer.send('newToDo:save',{ref:'main',todoValue: e.target.value});
      e.target.value = "";
    }
});

//ekleme butonu
const addBtn = document.querySelector('#addBtn');

//ekleme butonuna tıklanıldığında to do eklesin
addBtn.addEventListener('click', () => {
    ipcRenderer.send('newToDo:save',{ref:'main',todoValue: todoValue.value});
    todoValue.value = "";
})

//çıkış
document.querySelector('#closeBtn').addEventListener('click',() => {
    if (confirm("Çıkmak istediğinizden emin misiniz?")){
        ipcRenderer.send('todo:close');
    }
})


ipcRenderer.on('todo:addItem',(err,todo)=> {

//container
    const container = document.querySelector('.todo-container');

//row
    const row = document.createElement('div');
    row.className = "row";

//col
    const col = document.createElement('div');
    col.className = "todo-item p-2 mb-3 text-light bg-dark col-md-12 shadow card d-flex justify-content-center flex-row align-items-center";

//p
    const p = document.createElement('p');
    p.className = "m-0 w-100";
    p.innerText = todo.text;

//silme butonu
    const deleteBtn = document.createElement('button');
    deleteBtn.className = "btn btn-sm btn-outline-danger flex-shrink-1";
    deleteBtn.innerText = 'X';

//silme butonuna tıklanıldığında
    deleteBtn.addEventListener('click',(e) => {
        if (confirm("Bu kaydı silmek istediğinize emin misiniz?")){
            e.target.parentNode.parentNode.remove(); //rowu siler
            checkToDoCount(); //son element silinirse tekrar alert gelir
        }
    })

//içten dışa doğru ekleyelim
    col.appendChild(p);
    col.appendChild(deleteBtn);
    row.appendChild(col);
    container.appendChild(row);
    checkToDoCount(); //tekrar kontrol edelim
})

//todo kontrolleri
function checkToDoCount() {
    //container - todo'ların olduğu
    const container = document.querySelector('.todo-container');
    //alertContainer - alert'in olduğu
    const alertContainer = document.querySelector('.alert-container');

    document.querySelector('.total-count-container').innerText = container.children.length;

    console.log(container.children.length);
    if (container.children.length !== 0)
    {
        alertContainer.style.display = "none";
    }
    else
    {
        alertContainer.style.display = "block";
    }
}