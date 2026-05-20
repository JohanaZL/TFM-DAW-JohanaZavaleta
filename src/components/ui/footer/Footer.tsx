import { titleFont } from '@/config/fonts'
import Link from 'next/link'
import React from 'react'

export const Footer = () => {
  return (
    <div className='flex flex-wrap w-full justify-center gap-y-1 text-xs mb-10 px-4'>

      <Link href='/'>
        <span className={`${ titleFont.className } antialiased font-bold`}>Teslo</span>
        <span>| shop</span>
        <span>© { new Date().getFullYear() } </span>
      </Link>

      <Link href='/' className='mx-3'>Privacidad & Legal</Link>
      <Link href='/' className='mx-3'>Ubicación</Link>

    </div>
  )
}
