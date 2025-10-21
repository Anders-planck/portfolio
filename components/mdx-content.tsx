import Counter from '@/components/counter';
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'
import React, { JSX } from 'react'
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

const components = {
    Counter,
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="my-6 w-full overflow-y-auto">
            <table className="w-full border-collapse border border-border" {...props} />
        </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="bg-muted/50" {...props} />
    ),
    tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody {...props} />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr className="border-b border-border transition-colors hover:bg-muted/50" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="px-4 py-2 text-left font-semibold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
    ),
};

export default function MdxContent(
    props: JSX.IntrinsicAttributes & MDXRemoteProps
) {
  return (
    <MDXRemote
        {...props}
        components={{
            ...components,
            ...(props.components || {})
        }}
        options={{
            mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                    [
                        rehypePrettyCode,
                        {
                            theme: 'one-dark-pro',
                        }
                    ]
                ]
            }
        }}
     />
  )
}
