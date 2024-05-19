const Follow = require("../models/follow");
const User = require("../models/user");
const followService = require("../services/followService");
const mongoosePaginate = require('mongoose-paginate-v2');

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Message sent from the follow controller"
    });
}

const save = async (req, res) => {
    const params = req.body;
    const identity = req.user;

    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    try {
        const followStored = await userToFollow.save();
        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Could not follow the user",
            error: error.message
        });
    }
};

const unfollow = async (req, res) => {
    const userId = req.user.id;
    const followedId = req.params.id;

    try {
        const followDeleted = await Follow.findOneAndDelete({
            "user": userId,
            "followed": followedId
        });

        if (!followDeleted) {
            return res.status(404).send({
                status: "error",
                message: "Follow relationship not found"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Follow successfully deleted"
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error unfollowing the user",
            error: error.message
        });
    }
};

const following = async (req, res) => {
    let userId = req.user.id;
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;

    try {
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: [
                { path: 'user', select: '-role -password -__v -email' },
                { path: 'followed', select: '-role -password -__v -email' }
            ]
        };

        const followFind = await Follow.paginate({ "user": userId }, options);
        let followUserIds = await followService.followUserIds(req.user.id);
        return res.status(200).send({
            status: "success",
            message: "List of users I am following",
            follows: followFind.docs, // Documents of the current page
            total: followFind.totalDocs, // Total documents
            pages: followFind.totalPages, // Total pages
            user_following: (await followUserIds).following,
            user_follow_me: (await followUserIds).followers
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error listing users",
            error: error.message
        });
    }
};

const followers = async (req, res) => {
    let userId = req.user.id;
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;
    try {
        const options = {
            page: page,
            limit: itemsPerPage,
            populate: [{ path: 'user', select: '-role -password -__v -email' }]
        };

        const followFind = await Follow.paginate({ "followed": userId }, options);
        let followUserIds = await followService.followUserIds(req.user.id);
        return res.status(200).send({
            status: "success",
            message: "List of users following me",
            follows: followFind.docs, // Documents of the current page
            total: followFind.totalDocs, // Total documents
            pages: followFind.totalPages, // Total pages
            user_following: (await followUserIds).following,
            user_follow_me: (await followUserIds).followers
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error listing users",
            error: error.message
        });
    }
}

module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
};
