'use client'
import Link from 'next/link'
import {  useState } from 'react';
import {useRouter} from 'next/navigation'
import toast, {Toaster} from 'react-hot-toast'
import axios from 'axios';

interface User {
  email: string | null,
  password: string | null,
}

const Page = () => {

  const router = useRouter();

  const [user, setUser] = useState<User>({
    email: null,
    password: null,
  })


  const loginHandler= async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    try {
      toast.loading("login...")
      const response = await axios.post("/api/users/login", user);
      console.log(response);
      toast.success("Login success")
      router.push("/profile")
    } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
              const actualError = error.response?.data?.error || "Unknown error";
              toast.error(actualError);
          } else {
              toast.error("Something went wrong");
        }
    } finally {
      
    }
  }

  return (
    <div className="flex flex-col justify-center sm:h-screen p-4">
        <Toaster position='top-right' reverseOrder={false} />
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8">
        <div className="text-center mb-12">
          <a href="javascript:void(0)">
          </a>
        </div>

        <form onSubmit={(e)=>loginHandler(e)}>
          <div className="space-y-6">
           <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">Email Id</label>
              <input name="email" type="email" className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter email" 
                value={user?.email || ""}
                onChange={(e)=>{
                  console.log(user?.email)
                  setUser(
                    prev => ({...prev, email: e.target.value})
                  )
                }}
              />
            </div>
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
              <input name="password" type="password" className="text-slate-900 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter password" 
                 value={user?.password || ""}
                onChange={(e)=>{
                  console.log(user?.password)
                  setUser(
                    prev => ({...prev, password: e.target.value})
                  )
                }} 
              />
            </div>
              <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="text-slate-600 ml-3 block text-sm">
                I accept the <a href="javascript:void(0);" className="text-blue-600 font-medium hover:underline ml-1">Terms and Conditions</a>
              </label>
            </div>
          </div>

          <div className="mt-12">
            <button type="submit" className="w-full py-3 px-4 text-sm  font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer" >
              Create an account
            </button>
          </div>
          <p className="text-slate-600 text-sm mt-6 text-center">No account? <Link href="/signup" className="text-blue-600 font-medium hover:underline ml-1">Sign up</Link></p>
        </form>
      </div>
    </div>
  )
}

export default Page 