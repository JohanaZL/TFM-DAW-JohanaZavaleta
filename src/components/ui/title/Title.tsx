import { titleFont } from '@/config/fonts';
import React from 'react'

interface Props {
    title: string;
    subTitle?: string;
    className?: string;
}

export const Title = ({ title, subTitle, className }: Props) => {
  return (
    <div className={ `mt-3 ${ className }` }>
        <h1 className={ `${ titleFont.className } antialiased text-4xl font-semibold my-10` }>
            { title }
        </h1>

        {
            subTitle && ( <h3 className='text-xl mb-5'>{ subTitle }</h3> )
        }

    </div>
  )
}
