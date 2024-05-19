const Publication = require("../models/publication");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");

const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Message sent from the publication controller"
    });
}

const save = async (req, res) => {
    try {
        const params = req.body;
        if (!params.text) {
            return res.status(400).send({ status: "error", message: "You must send the text of the publication" });
        }
        let newPublication = new Publication(params);
        newPublication.user = req.user.id;
        const publicationStored = await newPublication.save();
        return res.status(200).send({
            status: "success",
            message: "Save publication",
            publicationStored
        });
    } catch {
        return res.status(404).send({
            status: "error",
            message: "Error saving publication"
        });
    }
}

const detail = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const publicationStored = await Publication.findById(publicationId);
        return res.status(200).send({
            status: "success",
            message: "Show publication",
            publication: publicationStored
        });
    } catch {
        return res.status(404).send({
            status: "error",
            message: "Publication does not exist"
        });
    }
}

const remove = async (req, res) => {
    try {
        const publicationId = req.params.id;
        await Publication.findOneAndDelete({ "user": req.user.id, "_id": publicationId });
        return res.status(200).send({
            status: "success",
            message: "Publication deleted successfully",
            publication: publicationId
        });
    } catch {
        return res.status(500).send({
            status: "error",
            message: "Could not delete the publication"
        });
    }
}

const user = async (req, res) => {
    try {
        const userId = req.params.id;
        let page = 1;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }
        const itemsPerPage = 5;

        const options = {
            page: page,
            limit: itemsPerPage,
            sort: { created_at: -1 },
            populate: { path: 'user', select: '-role -password -__v' }
        };

        const result = await Publication.paginate({ "user": userId }, options);
        
        // Aquí usamos result.docs para verificar si hay publicaciones
        if (result.docs.length <= 0) {
            return res.status(404).send({
                status: "error",
                message: "No publications found for this user",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publications from a user's profile",
            publications: result.docs, // documents of the current page
            total: result.totalDocs, // total documents
            totalPages: result.totalPages, // total pages
            page: result.page // current page
        });
    } catch (error) {
        console.error(error); // For debugging
        return res.status(500).send({
            status: "error",
            message: "Error getting user publications",
            error: error.message
        });
    } 
}

const upload = async (req, res) => {
    const publicationId = req.params.id;
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
        const publicationUpdated = await Publication.findOneAndUpdate(
            { "user": req.user.id, "_id": publicationId },
            { file: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error uploading avatar"
            });
        }

        return res.status(200).send({
            status: "success",
            file: req.file,
            publication: publicationUpdated
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error uploading avatar",
            error: error.message
        });
    }
};

const media = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/publications/" + file;
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).send({ status: "error", message: "Image does not exist!!" });
        }
        return res.sendFile(path.resolve(filePath));
    });
};

const feed = async (req, res) => {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }
    const itemsPerPage = 5;

    try {
        const myFollows = await followService.followUserIds(req.user.id);

        const options = {
            page: page,
            limit: itemsPerPage,
            populate: { path: 'user', select: '-password -role -__v -email' },
            sort: { created_at: -1 }
        };

        // Use .paginate() directly on the model
        const publications = await Publication.paginate({
            user: { $in: myFollows.following }
        }, options);

        return res.status(200).send({
            status: "success",
            message: "Feed",
            myFollows: myFollows.following,
            publications: publications.docs, // documents of the current page
            pages: publications.totalPages, // total pages
            total: publications.totalDocs // total documents
        });
    } catch (error) {
        console.error(error); // For debugging
        return res.status(500).send({
            status: "error",
            message: "Could not list the feed publications",
            error: error.message
        });
    }
};

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
};
