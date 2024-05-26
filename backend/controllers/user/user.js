import { User } from "../../models/user.js";


async function getUsers(req, res) {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { username: { $regex: req.query.search, $options: "i" } }
            ]
        }
        : {};
    const users = await User.find(keyword).find({_id:{$ne:req.userId}});
    res.send(users);
}

async function changePicture(req, res) {
    try{
        const {
            picture,
            resizedPicture
        } = req.body;
        console.log(picture,resizedPicture);
        await User.findByIdAndUpdate(req.userId, {
            picture: picture,
            resizedPicture: resizedPicture
        });
        const user=await User.find({_id:req.userId});
        console.log(user);
        res.status(201).json({user:user});
    } catch(error){
        res.status(401).json({message:error.message});
    }
}

export { getUsers, changePicture };