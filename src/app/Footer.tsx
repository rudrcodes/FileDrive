import { Linkedin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
    return (
        <div className='z-10 relative flex-1 h-40 mt-12 bg-gray-100 flex justify-center items-center '>
            <div className="container flex items-center justify-between ">

                <Link href="/" className="flex gap-2 items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="FileDrive"
                        width="50"
                        height="50"

                    />
                    <span className="text-black font-bold">
                        FileDrive
                    </span>
                </Link>
                <Link target='_blank' className=' hover:scale-105' href="https://www.linkedin.com/in/rudransh-aggarwal-33653a1b6/">
                    <div className='flex gap-1 '>
                        <Linkedin className='w-5 h-5' /> Rudransh Aggarwal
                    </div>
                </Link>
            </div>

        </div>
    )
}

export default Footer