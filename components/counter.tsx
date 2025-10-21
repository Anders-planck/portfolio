'use client';

import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon } from 'lucide-react';
import React from 'react'

export default function Counter() {
    const [count, setCount] = React.useState(0);
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);

  return (
    <div className='flex items-center gap-3'>
        <Button size={'icon'} onClick={decrement}>
            <MinusIcon />
        </Button>
        <p> current votes: {count}</p>
        <Button size={'icon'} onClick={increment}>
            <PlusIcon />
        </Button>
    </div>
  )
}
