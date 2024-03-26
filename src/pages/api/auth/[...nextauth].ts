import nextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google'
const id = "1039647629083-le869tcjlnbstu5rp15uv2gprbfcf9as.apps.googleusercontent.com"
const  clientsecret ="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"
const secret = "19277c4845adb7cab70dd2876a7f8d15"

//http://localhost:3000/api/auth/callback/google
export const authOptions = {
    
    providers:[
        GoogleProvider({
            clientId:id as string,
            clientSecret:clientsecret as string,
        })
    ],
 secret: secret as string
}

export default nextAuth(authOptions)