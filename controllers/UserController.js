import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";


//логика регистрации
export const register = async (req, res) => {
    try {

        //шифруем пароль через bcrypt
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        //подготовка документа на создание пользователя
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
        })

        //сохраняем пользователя в БД
        const user = await doc.save()

        //создаем токен для пользователя, срок действия 30 дней
        const token = jwt.sign({
                _id: user._id
            }, 'secret123',
            {
                expiresIn: '30d',
            })


        //деструктурируем данные о пользоваете, вытаскиваем ПАРОЛЬ и ВСЕ ОСТАЛЬНОЕ
        const {passwordHash, ...userData} = user._doc;

        //если ошибок нет, данные пользователя БЕЗ ПАРОЛЯ и токен
        res.json({
            ...userData,
            token
        })

    } catch (err) {
        //если получили ошибку - статус 500, ответ пользователю, а также выводим в консоль
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистирироваться',
        });
    }
}

//логика логина
export const login = async (req, res) => {
    try {
        //в переменную юзер записываем результат поиска по емейл
        const user = await UserModel.findOne({ email: req.body.email})

        //если юзер не найден, выводим ошибку
        if(!user) {
            return req.status(404).json({
                message: 'Данный пользователь не обнаружен!'
            })
        }

        //сравниваем вводимый пароль и пароль из БД
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        //обработка неверного пароля
        if(!isValidPass){
            return res.status(400).json({
                message: 'Неверный логин или пароль!'
            })
        }

        //если все ок, создаем токен
        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            }
        )

        //деструктурируем данные о пользоваете, вытаскиваем ПАРОЛЬ и ВСЕ ОСТАЛЬНОЕ
        const { passwordHash, ...userData} = user._doc;

        //если ошибок нет, данные пользователя БЕЗ ПАРОЛЯ и токен
        res.json({
            ...userData,
            token
        })

    } catch (err) {
        //если получили ошибку - статус 500, ответ пользователю, а также выводим в консоль
        console.log(err)
        res.status(500).json({
                message: 'Не удалось авторизироваться!'
            }
        )
    }
}

//логика получения данных пользователя
export const getMe = async (req, res) => {
    try {
        //из запроса после проверки получаем айди и записываем в юзера инфу
        const user = await UserModel.findById(req.userId);

        if(!user) {
            return res.status(404).json({
                message: 'Пользователь не найден!'
            })
        }

        const { passwordHash, ...userData } = user._doc;

        //возвращаем данные по пользователю
        res.json(userData)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа'
        })
    }
}