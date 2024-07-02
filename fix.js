const fs = require('fs');

//Этот скрипт заменяет все src="/ на src=" и ref="/ на ref="
//это нужно для сборки приложений с использованием cordova@9 и build-tools@29.0.2,30.0.3
//так как cordova в этих сборках загружает файлы из ФС а не с сервера



// Получение пути к файлу index.html из аргументов командной строки
const args = process.argv.slice(2); // первые два аргумента - путь к node и путь к скрипту
if (args.length !== 1) {
    console.error('Пожалуйста, укажите путь к файлу index.html как единственный аргумент.');
    process.exit(1);
}
const filePath = args[0];

// Проверка существования файла
if (!fs.existsSync(filePath)) {
    console.error('Файл не найден:', filePath);
    process.exit(1);
}

// Чтение содержимого файла
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    // Замена src="/ на src="
    const modifiedData = replaceAction(data)

    // Запись измененного содержимого обратно в файл
    fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
            return;
        }
        console.log('Файл успешно изменен.');
    });
});

function replaceAction(data){
    return data.replace(/src="\//g, 'src="').replace(/href="\//g, 'href="');
}