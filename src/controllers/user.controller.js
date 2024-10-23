import {asyncHandler} from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        {
            message: "User registered successfully"
        });
})

export {
    registerUser
}
// const registerUser = asyncHandler(async (req, res) => {
//     const { username, fullname, email, password } = req.body;
//     if (!username || !fullname || !email || !password) {
//         res.status(400);
//         throw new Error("Please add all fields");
//     }
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//         res.status(400);
//         throw new Error("User already exists");
//     }
//     const user = await User.create({
//         username,
//         fullname,
//         email,
//         password,
//     });
//     if (user) {
//         res.status(201).json({
//             _id: user.id,
//             username: user.username,
//             fullname: user.fullname,
//             email: user.email,
//         });
//     } else {
//         res.status(400);
//         throw new Error("Invalid user data");
//     }
// });

// const loginUser = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         res.status(400);
//         throw new Error("Please add email and password");
//     }
//     const user = await User.findOne({ email });
//     if (user && (await user.isPasswordMatched(password))) {
//         res.json({
//             _id: user.id,
//             username: user.username,
//             fullname: user.fullname,
//             email: user.email,
//             accessToken: user.generateAccessToken(),
//         });
//     } else {
//         res.status(401);
//         throw new Error("Invalid email or password");
//     }
// });

// export {
//     registerUser,
//     loginUser,
// };