import {connect} from '@/db/config';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs'

connect()

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        const {fullName, email, password} = reqBody;

        console.log(reqBody);

        //! check if user already exists

        const user = await User.findOne({email})

        if(user){
            return NextResponse.json({error: "user already exists"}, {status: 400})
        }
        
        //! hash password

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        //! save user in database

        const newUser = new User({
            fullName,
            email, 
            password: hashedPassword
        })

        const savedUser = await newUser.save();

        console.log(savedUser);

        return NextResponse.json(
            {message: "user created successfully", success: true},
            {status: 201}
        )
        
    } catch (error: unknown) {
        if(error instanceof Error){
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: "unknown error happen"}, {status: 500})
    }
          
}
