import {connect} from '@/db/config';
import User from '@/models/userModel';
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs'

connect();

export async function POST(request: NextResponse){
    try {

        const reqBody = await request.json()
        const {email, password} = reqBody;

        console.log(reqBody)

        //! check user exists or not 

        const user = await User.findOne({email});

        const validPassword = await bcryptjs.compare(password, user.password);

        if(!validPassword){
            return NextResponse.json({message: "Invalid Password"}, {status: 401})
        }

        if(!user){
            return NextResponse.json({message: "User does not exists"}, {status: 400})
        }
        
        //!create token data 
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        //! create token 

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: '1d'})


        const response = NextResponse.json({
            message: "Login successfull",
            success: true
        })

        //! setting up cookie 
        
        response.cookies.set("token", token, {
            httpOnly: true
        });

        return response;

    } catch (error: unknown) {
        if(error instanceof Error){
            return NextResponse.json({error: error.message}, {status: 500})
        }
    }
}