import PostModel from "../models/Post.js";

//Получение тегов
export const getLastTags = async (req, res) => {
    try {
        //в переменную posts записываем посты в кол-ве соответствующем лимиту
        const posts = await PostModel.find().limit(5).exec();

        const tags = posts.map(obj => obj.tags).flat().slice(0,5)

        //выводим посты
        res.json(tags)

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

//получение всех постов (сортировка по новизне)
export const getAll = async (req, res) => {
    try {

        //в переменную posts записываем все найденные посты
        //.populate('user').exec() - связываем с таблицей пользователей, чтобы получить информацию о пользователе
        const posts = await PostModel.find().populate('user').exec();

        //выводим посты
        res.json(posts.sort((a,b) => b.createdAt - a.createdAt))

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

//получение одной статьи и изменение счетчика просмотров статьи
export const getOne = async (req, res) => {
    try {

        //вытаскиваем id статьи из запроса /posts/:id
        const postId = req.params.id;

        const post = await PostModel.findById(postId).populate('user').exec()

        //находим и ОБНОВЛЯЕМ статью, добавляем кол-во просмотров +1
        PostModel.findOneAndUpdate({
                _id: postId,
            }, {
                //функция инкрементирования монго
                $inc: {viewsCount: 1}
            }, {
                returnDocument: 'after'
            },
            (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Не удалось вернуть статью'
                    })
                }

                if (!doc) {
                    return res.status(404).json({
                        message: 'Статья не найдена'
                    })
                }


                res.json(post)
            }
        ).populate('user')

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статью'
        })
    }
}

//удаление статьи
export const remove = async (req, res) => {
    try {

        //вытаскиваем id статьи из запроса /posts/:id
        const postId = req.params.id;

        PostModel.findOneAndDelete({
            _id: postId
        }, (err, doc) => {
            if (err) {
                console.log(err)
                return res.status(500).json({
                    message: 'Не удалось удалить статью'
                })
            }

            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена'
                })
            }

            //Статья успешно удалена, возвращаем ответ
            res.json({
                success: true
            })
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статью'
        })
    }
}

//функционал создания статьи
export const create = async (req, res) => {
    try {


        //подготавливаем (создаем) документ
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
            comments: req.body.comments,
        })

        //сохраняем документ
        const post = await doc.save()

        //возвращем готовый пост
        res.json(post)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

//обновление статьи
export const update = async (req, res) => {
    try {
        //вытаскиваем id статьи из запроса /posts/:id
        const postId = req.params.id;

        //по id находим статью и перезаписываем поля
        await PostModel.updateOne({
            _id: postId
        }, {
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        })

        res.json({
            success: true
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось обновить статью'
        })
    }
}
