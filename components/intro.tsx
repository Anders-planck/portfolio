import React from 'react'
import Image from 'next/image'
import authorImage from '@/public/images/authors/me2.jpg'

export default function Intro() {
  return (
    <section className='flex items-center gap-x-10 gap-y-4 flex-col md:flex-row md:gap-y-0'>
      <div className='mt-2 flex-1 md:mt-0'>
        <h1 className='title no-underline'>
          Hello, I&apos;m Anders!
        </h1>
        <p className='mt-3 font-light text-muted-foreground'>
          I&apos;m a software engineer based in Ferrara, Italy.
          I&apos;m passionate about learning new technologies and building things that make life easier.
        </p>
      </div>
      <div className='relative'>
        <Image
          src={authorImage}
          alt='Anders'
          width={200}
          height={200}
          className='flex-1 rounded-lg'
        />
      </div>
    </section>
  )
}
