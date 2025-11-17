'use client'
import axios from 'axios';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import toast, {Toaster} from 'react-hot-toast'
import { useEffect,useState } from 'react';


interface User {
  email: string;
  fullName: string;
  isAdmin: boolean;
  isVerified: boolean;
}

const Page = () => {

  const [user, setUser] = useState<User>()
  
  const router = useRouter();
  
  //! get user 

  const getUser = async () => {
    const data = await axios.get("api/users/me")
    const realData = data.data.data
    setUser(realData)
  }
  
  useEffect(()=>{
    getUser()
  }, [])


  //? Removing all toasts
  useEffect(()=>{
    toast.removeAll()
  }, [])

  const logout = async ()=>{
    try{
      await axios.get("/api/users/logout")
      toast.success("Logout successful")
      router.push("/login")
    } catch(error: unknown){
      if(error instanceof Error){
        toast.error(error.message)
      }
    }
  }


  return (
    <main className='w-screen h-screen bg-gray-800 text-white flex items-center justify-center'>
          <Toaster position='top-right' reverseOrder={false} /> 
          <div className="profile-container text-center flex flex-col gap-8 border p-3 rounded bg-gray-900 ">
            <p className='text-9xl'>{user?.fullName}</p>
            <button className="p-1 border rounded shadow-2xl bg-amber-400 cursor-pointer" onClick={logout}>Logout</button>
          </div>
    </main>
  )
}

export default Page 