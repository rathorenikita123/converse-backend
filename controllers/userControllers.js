import User from "../models/user.js";
import generateToken from "../config/token.js";
import bcrypt from "bcryptjs";

const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          {
            name: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      }
    : {};

  console.log(keyword, "keyword");

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.json(users);
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImage } = req.body;

    if (!name || !email || !password) {
      console.log("Please enter all fields");

      return res.status(400).json({ message: "Please enter all fields" });
    }

    const userExists = await User.findOne({ email }).exec();

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      profileImage,
    });

    if (newUser) {
      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        profileImage: newUser.profileImage,
        token: generateToken(newUser._id),
      });
      // res.status(201).json({ message: "User created successfully" });
    } else {
      console.log("Invalid user data");
      res.status(401).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, password);
    };

    if (user && matchPassword(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default { registerUser, authUser, allUsers };
