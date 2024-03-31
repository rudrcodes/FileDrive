"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FileCardActions from "./file-actions"


function UserCell({ userId }: { userId: Id<"users"> }) {
    const userProfile = useQuery(api.users.getUserProfile,
        { userId })

    return (
        <div className="flex gap-2 text-xs text-gray-700 items-center w-[40%] " >

            <Avatar className="w-8 h-8">
                <AvatarImage src={userProfile?.image} />
                <AvatarFallback>...</AvatarFallback>
            </Avatar>
            <div>{userProfile?.name}</div>
        </div>
    )
}
export const columns: ColumnDef<Doc<"files"> & { isFavorited: boolean }>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        header: "User",
        cell: ({ row }) => {
            return <UserCell userId={row.original.userId} />
        },
    },
    {

        header: "Uploaded on",
        cell: ({ row }) => {
            return <div>{formatRelative(new Date(row.original._creationTime), new Date())}</div>
        },
    },
    {

        header: "File Actions on",
        cell: ({ row }) => {
            return (
                <FileCardActions file={row.original} isFavorited={row.original.isFavorited} />
            )
        },
    },
]
