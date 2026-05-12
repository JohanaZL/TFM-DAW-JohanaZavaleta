import { Title } from '@/components/ui/title/Title'
import { titleFont } from '@/config/fonts'
import Image from 'next/image'


export default function Home() {
  return (
    <>
      <Title title='Tienda' subTitle='Todos los productos' className='mb-2'/>
    </>
  )
}
