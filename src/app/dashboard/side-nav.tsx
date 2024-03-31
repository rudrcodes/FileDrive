'use client'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { FileIcon, StarIcon, TrashIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const SideNav = () => {
    const path = usePathname();
    return (
        <div className="w-40  flex flex-col gap-4">
            <Link href="/dashboard/files">

                <Button variant="link"

                    className={clsx("flex gap-2", {
                        "text-blue-400": path.includes("/dashboard/files")
                    })}
                >
                    <FileIcon /> All Files
                </Button>
            </Link>

            <Link href="/dashboard/favorites">
                <Button variant="link"
                    className={clsx("flex gap-2", {
                        "text-blue-400": path.includes("/dashboard/favorites")
                    })}
                >
                    <StarIcon /> Favorites Files
                </Button>
            </Link>

            <Link href="/dashboard/trash">
                <Button variant="link"
                    className={clsx("flex gap-2", {
                        "text-blue-400": path.includes("/dashboard/trash")
                    })}
                >
                    <TrashIcon /> Trash
                </Button>
            </Link>

        </div>
    )
}

export default SideNav