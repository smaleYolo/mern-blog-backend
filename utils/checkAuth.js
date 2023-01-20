import jwt from "jsonwebtoken";

export default (req, res, next) => {

    //Забираем токен из запроса
    //Инсомния добавляет к токену приписку Bearer - убираем ее
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

    //если токен есть, расшифровываем, ищем пользователя по айди из расшифрованного токена
    //next для перехода на следующий этап в запросе app.get (index.js)
    if(token) {
        try {
            const decoded = jwt.verify(token, 'secret123');

            req.userId = decoded._id;

            next();
        }
        //обработка ошибки поиска пользователя
        catch (err) {
            console.log(err)
            return res.status(403).json({
                message: 'Нет доступа'
            })
        }
    }
    //обработка ошибки, когда токена нет
    else {
        return res.status(403).json({
            message: 'Нет доступа'
        })
    }
}
