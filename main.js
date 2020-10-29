const electron = require("electron"); //electron'u import et,asıl kütüphane

//kullanacağımız html sayfaları için;
const url = require("url");
const path = require("path");

//electron içinden kullanacaklarımız
const {app,BrowserWindow,Menu,ipcMain} = electron;

let mainWindow, addWindow;
let todoList = [];

//uygulama hazır olduğunda, her şey burada çalışacak
app.on('ready', () => {

    //pencere oluştur, nesne kuruculu
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    //pencere genişletilemiyor
    mainWindow.setResizable(false);


    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname,"pages/mainWindow.html"), //dizindeki main.html
            protocol: "file", //dosyadan geliyor
            slashes: true // /x/y/z
        })
    )

    //templateden menu üret
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //üretilen menüyü app menüsü olarak set et
    Menu.setApplicationMenu(mainMenu);


    //eğer ana pencerem kapatılırsa uygulamadan çık (diğer pencerelerde kapatılır)
    mainWindow.on('close',() => {
        app.quit();
    })

    //todo pencere eventleri
    ipcMain.on('todo:close',() => {
        app.quit();
        addWindow = null;
    });

    ipcMain.on('newToDo:close',() => {
        addWindow.close();
        addWindow = null;
    });

    ipcMain.on('newToDo:save',(err, data) => {
        if (data){

            let todo = {
                id: todoList.length + 1 ,
                text: data.todoValue,
            };

            //todo liste elemanı ekleyelim
            todoList.push(todo);

            //backend'den frontend'e bilgi gönderimi
            mainWindow.webContents.send('todo:addItem',todo);

            //veri referansı newden geliyorsa işimiz bitince pencereyi kapat
            if (data.ref == 'new'){
            //eğer veri varsa pencere kapatılabilir
            addWindow.close();
            addWindow = null;}
        }
    });

})
//menü templatemiz
const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni TODO Ekle",
                click(){
                    createWindow();
                }
            },
            {
                label: "Tümünü Sil"
            },
            {
                label: "Çıkış",
                role: "quit", //ön tanımlı rol
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",  //kısayol tuşu
            }
        ]
    },
]

//menü template yapısı

//eğer bilgisayar macos ise
if (process.platform == "darwin"){
    //menü elemanlarının önüne yeni bir eleman ekle
    mainMenuTemplate.unshift({
        label: app.getName(), //uygulama ismi
        role: "TODO"
    })
}

//geliştirici araçları
if (process.env.NODE_ENV !== "production")
{
    //eğer uygulama yayınlanmamış ise geliştirici araçlarını menüye ekle
    mainMenuTemplate.push(
        {
            label: "DevTools",
            submenu: [
                {
                    label: "Geliştirici Penceresini Aç",
                    click(item,focusedWindow){ //tıklanıldığında ne olacak
                        //hangi pencere açılacak
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    label: "Yenile",
                    role: "reload" //yenileme ön tanımı
                }
            ]
        }
    );
}

//yeni pencereyi oluşturacak
function createWindow() {
    addWindow = new BrowserWindow({
        frame:false, //bordersız
        width: 500,
        height: 300,
        title: "Yeni Bir Pencere",
        webPreferences: {
            nodeIntegration: true
        }
    });

    //pencere genişletilemiyor
    mainWindow.setResizable(false);


    //içeriği alalım
    addWindow.loadURL(url.format(
        {
            pathname: path.join(__dirname,"pages/newToDo.html"),
            protocol: "file",
            slashes: true,
        }
    ));

    //kapatıldığında null ata
    addWindow.on('close',() => {
        addWindow = null;
    })
}

//todlist'i return etsin
function getToDoList() {
    console.log(todoList);
}