// utils/generateUser.js
import userModel from '../models/Usermodel.js';

const createUser = async({ Fullname, email, password, contact }) => {
    try {
        const user = await userModel.create({
            Fullname,
            email,
            password,
            contact
        });
        return user;
    } catch (err) {
        throw new Error(err.message);
    }
};

export { createUser };