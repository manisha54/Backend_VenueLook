const User = require('../models/User')


const getAllUsers = (req, res, next) => {
    User.find()
        .then(users => res.json(users))
        .catch(next)
}

const deleteAllUsers = (req, res, next) => {
    User.deleteMany()
        .then(reply => res.json(reply))
        .catch(next)
}


const getUserById = (req, res, next) => {
    User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                res.status(404).json({ error: 'user not found' })
            }
            res.json({
                success: true,
                data: [user]
            })
        })
        .catch(next)
}


const updateUserById = (req, res, next) => {
    User.findByIdAndUpdate(
        req.user.id,
        { $set: req.body },
        { new: true }
    )
        .then(updated => {
            if (!updated) {
                return res.status(404).json({ error: "User not found." });
            }
            return res.json({ message: "Profile updated successfully.", data: updated });
        })
        .catch(next);
}


// const deleteUserById = (req, res, next) => {
//     User.findByIdAndDelete(req.params.user_id)
//         .then(reply => res.status(204).end())
//         .catch(next)
// }

const deleteUserById = (req, res, next) => {
    User.findByIdAndDelete(req.user.id)
        .then(() => res.status(204).end())
        .catch(next);
}



module.exports = {
    getAllUsers,
    deleteAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,


}