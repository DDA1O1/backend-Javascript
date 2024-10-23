import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {uploadOnCloudinaryImage} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate user input
    // check if user already exists: email, username
    // check for images, avatar 
    // upload image to cloudinary, avatar
    // create user object - create entry in database
    // remove password and refresh token field from response
    // check for user creation 
    // return res

    const {username, fullname, email, password} = req.body
    // console.log("email:", email);

    if (!username || !fullname || !email || !password) {
        throw new ApiError(400, "Please add all fields")       
    }
    
    const userExists = await User.findOne({$or: [{email}, {username}]})
    if (userExists) {
        throw new ApiError(400, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath ;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

     if (!avatarLocalPath) {
        throw new ApiError(400, "Please add avatar and cover image")
    }

    const avatar = await uploadOnCloudinaryImage(avatarLocalPath);
    const coverImage = await uploadOnCloudinaryImage(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Please add avatar and cover image")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar,
        coverImage: coverImage || ""
    })

   const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(400, "User not created")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created")
    )
})



export {
    registerUser
}
