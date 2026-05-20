import Link from 'next/link'
import React from 'react'

export const Footer = () => {
  return (
    <div className='flex flex-wrap w-full justify-center gap-y-1 text-xs mb-10 px-4'>

      <Link href='/'>
        <span className="text-primary font-semibold">Muebles con Alma</span>
        <span className="text-gray-500"> &copy; { new Date().getFullYear() } </span>
      </Link>

    </div>
  )
}
