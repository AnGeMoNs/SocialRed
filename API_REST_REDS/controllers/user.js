const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const fs = require("fs");
const path = require("path");
const mongoosePaginate = require('mongoose-paginate-v2');
const Publication = require("../models/publication");
const Follow = require("../models/follow");

const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Message sent from the user controller",
        usuario: req.user
    });
};

const register = (req, res) => {
    let params = req.body;

    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Missing data for registration"
        });
    }

    let user_to_save = new User(params);

    User.find({ $or: [
        { email: user_to_save.email.toLowerCase() },
        { nick: user_to_save.nick.toLowerCase() }
    ]}).exec().then(users => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "The user already exists!!"
            });
        }

        bcrypt.hash(params.password, 10);
        return bcrypt.hash(params.password, 10);

    }).then(hashedPassword => {
        user_to_save.password = hashedPassword;
        return user_to_save.save(); // Save the user to the database
    }).then(userSaved => {
        res.status(200).json({
            status: "success",
            message: "User registration successful",
            user: userSaved
        });
    }).catch(error => {
        res.status(500).json({
            status: "error",
            message: "Error during registration",
            error: error.message
        });
    });
};

const login = async (req, res) => {
    let params = req.body;
    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Missing data to send"
        });
    }

    try {
        const user = await User.findOne({ email: params.email })
            .select({ "password": 0 });

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "User does not exist!!"
            });
        }
        const token = jwt.createToken(user);
        // Continue with your login logic here
        return res.status(200).json({
            status: "success",
            message: "You have successfully logged in!!",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error during login process",
            error: error.message
        });
    }
};

function esIdValido(id) {
    // Regular expression to validate a MongoDB ObjectId
    const regexObjectId = /^[0-9a-fA-F]{24}$/;

    return regexObjectId.test(id);
}

const profile = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ message: "ID is required" });
        }
        if (!esIdValido(id)) {
            return res.status(400).send({ message: "Invalid ID" });
        }
        const userProfile = await User.findById(id)
            .select({ password: 0, role: 0 });
        const followInfo = await followService.followThisUser(req.user.id, id);
        return res.status(200).send({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "User does not exist or there is an error"
        });
    }
};

const list = async (req, res) => {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 2;

    try {
        // Calculate the total number of documents
        const count = await User.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(count / itemsPerPage);
        // Ensure the requested page does not exceed the total number of pages
        page = page > totalPages ? totalPages : page;

        // Get the IDs of the followed users
        const followUserIds = await followService.followUserIds(req.user.id);

        // Retrieve users from the specific page
        const users = await User.find()
            .sort('_id')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .select("-password -email -role -__v");

        res.status(200).send({
            status: "success",
            users: users,
            total: count,
            page: page,
            itemsPerPage: itemsPerPage,
            totalPages: totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error during query",
            error: error.message
        });
    }
};

const update = async (req, res) => {
    let userId = req.user.id; // Ensure the user ID is correctly obtained
    let userToUpdate = req.body;

    // Remove fields that should not be updated directly
    delete userToUpdate.exp;
    delete userToUpdate.iat;
    delete userToUpdate.role;
    delete userToUpdate.imagen;

    // Check if the email or nick are used by another user
    try {
        let searchCriteria = {};
        if (userToUpdate.email) {
            searchCriteria.email = userToUpdate.email.toLowerCase();
        }
        if (userToUpdate.nick) {
            searchCriteria.nick = userToUpdate.nick.toLowerCase();
        }

        let existingUsers = await User.find({ $or: [searchCriteria], _id: { $ne: userId } });
        if (existingUsers.length > 0) {
            return res.status(200).send({
                status: "error",
                message: "Email or nick is already in use"
            });
        }

        // If a password is provided, hash it before updating
        if (userToUpdate.password) {
            userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
        } else {
            delete userToUpdate.password;
        }

        // Update the user
        let updatedUser = await User.findByIdAndUpdate(userId, userToUpdate, { new: true });
        return res.status(200).send({
            status: "success",
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error updating user",
            error: error.message
        });
    }
};

const upload = async (req, res) => {
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Request does not include an image"
        });
    }

    let image = req.file.originalname;
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).send({
            status: "error",
            message: "Invalid file extension"
        });
    }

    try {
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error uploading avatar"
            });
        }

        return res.status(200).send({
            status: "success",
            file: req.file,
            user: userUpdated
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error uploading avatar",
            error: error.message
        });
    }
};

const avatar = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/avatars/" + file;
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({ status: "error", message: "Image does not exist!!" });
        }
        return res.sendFile(path.resolve(filePath));
    });
};

const counters = async (req, res) => {
    let userId = req.user.id;
    if (req.params.id) {
        userId = req.params.id;
    }
    try {
        const following = await Follow.countDocuments({ "user": userId });
        const followed = await Follow.countDocuments({ "followed": userId });
        const publications = await Publication.countDocuments({ "user": userId });
        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error counting followers and publications",
            error: error.message
        });
    }
};

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
};

