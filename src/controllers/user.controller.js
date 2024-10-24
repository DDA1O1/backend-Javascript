import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {uploadOnCloudinaryImage} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

const loginUser = asyncHandler(async (req, res) => {
    // req body-> data
    // username or email
    // find user
    // check password
    // access and refresh token
    // send cookies

    const {email, username, password} = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Please add username or email")
    }

    // if (!username || !email) {
    //     throw new ApiError(400, "Please add username or email")
    // }

    const user = await User.findOne({$or: [{email}, {username}]})

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordMatched = await user.isPasswordMatched(password);

    if (!isPasswordMatched) {
        throw new ApiError(400, "Invalid credentials")
    }

    const access_token = await user.generateAccessToken();
    const refresh_token = await user.generateRefreshToken();

    if (!access_token || !refresh_token) {
        throw new ApiError(400, "Access token or refresh token not generated")
    }

    res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: true,
    })
    res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: true,
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                access_token,
                refresh_token,
                username: user.username,
                fullname: user.fullname,
                email: user.email
            },
            "User logged in"
        )
    )
    })

const logoutUser = asyncHandler(async (req, res) => {
    // delete cookies
    // send response
    await User.findOneAndUpdate({_id: req.user._id}, {
        refreshToken: "",
    }, {
        new: true
    })
    .then((user) => {
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        res.clearCookie("access_token")
        res.clearCookie("refresh_token")
        res.status(200).json(
            new ApiResponse(200, null, "User logged out")
        )
    })
})

const refreshUser = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refresh_token || req.body.refresh_token;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token not found")
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        if (!decoded) {
            throw new ApiError(400, "Invalid refresh token")
        }
    
        const user = await User.findById(decoded?._id);
    
        if (!user) {
            throw new ApiError(400, "User not found")
        }
    
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(400, "Refresh token not matched or expired")
        }
    
        const access_token = await user.generateAccessToken();
        const refresh_token = await user.generateRefreshToken();
    
        if (!access_token || !refresh_token) {
            throw new ApiError(400, "Access token or refresh token not generated")
        }
    
        res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: true,
        })
        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
        })
    
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    access_token,
                    refresh_token,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email
                },
                "User refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token")
    }
})

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    // update password
    // send response

    const {oldPassword, newPassword, confirmPassword} = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "Please add all fields")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password not matched")
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const isPasswordMatched = await user.isPasswordMatched(oldPassword);

    if (!isPasswordMatched) {
        throw new ApiError(400, "Old password not matched")
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // send response
    return res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateUser = asyncHandler(async (req, res) => {
    // update user
    // send response
    const {username, fullname, email} = req.body;

    if (!username || !fullname || !email) {
        throw new ApiError(400, "Please add all fields")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        username,
        fullname,
        email
    }, {
        new: true
    })
    .select("-password")
    .then((user) => {
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return res.status(200).json(
            new ApiResponse(200, user, "User updated successfully")
        )
    })
    .catch((error) => {
        throw new ApiError(400, error?.message || "User not updated")
    })
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    // update avatar
    // send response
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please add avatar")
    }

    const avatar = await uploadOnCloudinaryImage(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        avatar: avatar.url
    }, {
        new: true
    })
    .select("-password")
    .then((user) => {
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return res.status(200).json(
            new ApiResponse(200, user, "User avatar updated successfully")
        )
    })
    
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    // update cover image
    // send response
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Please add cover image")
    }

    const coverImage = await uploadOnCloudinaryImage(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        coverImage: coverImage.url
    }, {
        new: true
    })
    .select("-password")
    .then((user) => {
        if (!user) {
            throw new ApiError(400, "User not found")
        }
        return res.status(200).json(
            new ApiResponse(200, user, "User cover image updated successfully")
        )
    })
    
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshUser,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUser,
    updateUserAvatar,
    updateUserCoverImage
}
