import { Model, model, Schema } from "mongoose";
import bcrypt from 'bcrypt';

interface IUser {
    userName: string;
    email: string;
    password: string;
    createdAt: Date;
}

interface IUserModel extends Model<IUser> {
    login(email: string, password: string): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Needs validation
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function(next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error) {
        console.error(error);
        throw error;
    }
});

userSchema.statics.login = async function(email:string, password:string): Promise<IUser> {
    const user = await this.findOne({ email });

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error('Invalid credentials');

    return user;
}

const User = model<IUser, IUserModel>('User', userSchema);

export default User;
