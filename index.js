import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';


import {loginValidation, postCreateValidation, registerValidation} from "./validations.js";

import { checkAuth, handleValidationErrors } from "./utils/index.js";

import {PostController, UserController} from "./controllers/index.js";


//делаем подключение к БД монго, проверяем работоспособность
mongoose.connect(
    'mongodb+srv://admin:admin@cluster0.udzl8.mongodb.net/mern-blog?retryWrites=true&w=majority'
)
    .then(() => console.log('DB Ok'))
    .catch((err) => console.log('DB error', err))

//вся логика экспресса хранится в app
const app = express();

//создаем хранилище для картинок
const storage = multer.diskStorage({
    //создаем путь для сохранения картинок (запрос, файл, кб)
    destination: (_, __, cb) => {
        //cb н получает ошибок и объясняет, что полученные файлы сохраняются в uploads
        cb(null, 'uploads')
    },
    //задаем название файлам (_, filename, cb)
    filename: (_, file, cb) => {
        //вытаскиваем из файла оригинальное название
        cb(null, file.originalname)
    }
})

//работа с сохранением файлов через переменную upload
const upload = multer({storage})

//учим наше приложение воспринимать json формат
app.use(express.json())

//для связи фронта с беком
app.use(cors())

//обработавыем ЛЮБОЙ запрос на /uploads
//если пришел запрос, через функцию static проверяем есть ли в папке uploads то, что мы передаем в запросе
app.use('/uploads', express.static('uploads'))


//Делаем авторизацию пользователя
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)

//Пришел запрос на адрес /auth/register, данные проверились через registerValidation
//если все ОК, выполняется колбек
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

//Получаем информацию о пользователе по токену в теле запроса
//Проверка токена происходит через middleware checkAuth, функция решит можно передать информацию или нет
app.get('/auth/me', checkAuth, UserController.getMe)


//отедльный роут на загрузку картинки
//перед тем как выполнить cb, проводим проверку middleware upload, который проверить файл на соответствие картинке
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})


//Получение всех статей, авторизация не необходима
app.get('/posts', PostController.getAll)

//Получение тегов
app.get('/tags', PostController.getLastTags)

//Получение конкретной статьи
app.get('/posts/:id', PostController.getOne)

//Создание статьи, проверка на авторизацию по токену, валидация на соответствие поста шаблону
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)

//Удаление статьи
app.delete('/posts/:id', checkAuth, PostController.remove)

//Обновление статьи
app.patch('/posts/:id', postCreateValidation, checkAuth, handleValidationErrors, PostController.update)


//Запускаем сервер на порту 4444, обрабатываем ошибки
app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK')
})