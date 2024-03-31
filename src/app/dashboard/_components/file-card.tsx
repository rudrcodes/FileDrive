import { useQuery } from "convex/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelative } from 'date-fns'

import { Doc } from "../../../../convex/_generated/dataModel"

import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react"
import { ReactNode } from "react"
import { api } from "../../../../convex/_generated/api"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import FileCardActions from "./file-actions"

interface FileCardProps {
    file: Doc<"files"> & { isFavorited: boolean },
}


// TODO : SOLVED ✅ :This getUrl is expecting a diff fileID , and I'm giving it a different one , this has to be solved.
//* Solved : I used this storage method we get in the QueryCTX or MutationCTX : 
//*let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;


// function getFileUrl(fileId: Id<"_storage">): string {
//     console.log(`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`);

//     return `https://acoustic-kangaroo-501.convex.cloud/api/storage/kg21jjcxm0jjm2k74nxjhe5q6n6nr56m`

// }

export const FileCard = ({ file }: FileCardProps) => {
    // console.log("file in file card: ", file)
    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    })

    const types = {
        'image': <ImageIcon />,
        'pdf': <FileTextIcon />,
        'csv': <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;


    // const isFavorited = favorites.some(favorite => favorite.fileId === file._id)


    return (
        <>
            <Card className="relative border-2 border-gray-300">
                <CardHeader>
                    <CardTitle className="flex gap-2 text-base font-bold ">
                        <div className="flex justify-center">{types[file.type]}</div>
                        {file.name}
                    </CardTitle>

                    <div className="absolute top-2 right-2"><FileCardActions isFavorited={file.isFavorited} file={file} /></div>
                </CardHeader>

                <CardContent className="h-[150px] flex justify-center items-center">
                    {file.type === 'image' && (
                        <Image
                            src={file.fileUrlRudransh!}
                            // src={getFileUrl(file.fileId)}
                            alt={file.name}
                            width="200"
                            height="200"
                        />
                    )}
                    {file.type === "csv" && <GanttChartIcon className="h-20 w-20" />}
                    {file.type === "pdf" && <FileTextIcon className="h-20 w-20" />}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2 text-xs text-gray-700 items-center w-[40%] " >

                        <Avatar className="w-8 h-8">
                            <AvatarImage src={userProfile?.image} />
                            <AvatarFallback>...</AvatarFallback>
                        </Avatar>
                        {userProfile?.name}
                    </div>

                    <div className=" text-xs text-end">
                        Uploaded: {formatRelative(new Date(file._creationTime), new Date())}

                    </div>



                    {/* 
                    <Button onClick={() => window.open(file.fileUrlRudransh!)} variant="link" className="flex gap-2 justify-center items-center">
                        Open <ExternalLink className="w-4 h-4 hover:scale-110" />
                    </Button> */}
                </CardFooter>
            </Card>        </>

    )
}