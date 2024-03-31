import { useMutation, useQuery } from "convex/react"

import { Doc } from "../../../../convex/_generated/dataModel"

import { Download, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from "lucide-react"
import { useState } from "react"
import { api } from "../../../../convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Protect } from "@clerk/nextjs"

function FileCardActions({ file, isFavorited }: { file: Doc<"files">, isFavorited: boolean }) {
    const { toast } = useToast();
    // Mutations :
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)

    const toggleFavorite = useMutation(api.files.toggleFavorite)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const me = useQuery(api.users.getMe)


    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for our deletion process.Files are deleted periodically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            //TODO : Actually delete file from the convex server
                            try {

                                await deleteFile({

                                    fileId: file._id
                                })
                                toast({
                                    variant: "default",
                                    title: "File marked for deletion",
                                    description: "The file will be deleted after 20 minutes. You can restore by then."
                                })
                            } catch (error) {
                                toast({
                                    variant: "destructive",
                                    title: "Error in deleting file ",
                                    description: "The file can't be deleted, either you don't have admin access or there is some backend problem going on."
                                })

                            }
                        }}>

                            Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>


                    <DropdownMenuItem className="cursor-pointer gap-1 flex" onClick={() => {
                        window.open(file.fileUrlRudransh!),
                            "_blank"
                    }}>
                        <Download className="w-4 h-4" />Download

                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                        toggleFavorite({
                            fileId: file._id
                        })
                    }}
                        className="flex gap-1 text-blue-600 items-center cursor-pointer">
                        {!isFavorited ?
                            <div className="flex justify-center items-center gap-1">
                                <StarHalf className="w-4 h-4" /> Favorite it
                            </div> :
                            <div className="flex justify-center items-center gap-1">
                                <StarIcon className="w-4 h-4" /> Unfavorite it
                            </div>
                        }

                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <Protect
                        condition={(checkRole) => {
                            return checkRole({
                                role: "org:admin",
                            }) || file.userId === me?._id
                        }}
                        fallback={<></>}
                    >
                        <DropdownMenuItem >

                            {file.shouldDelete ?
                                <div className="flex gap-1 text-green-600 items-center cursor-pointer"
                                    onClick={() => {
                                        restoreFile({
                                            fileId: file._id
                                        })
                                    }} >
                                    <UndoIcon className="w-4 h-4" />
                                    Restore file
                                </div>
                                :
                                <div className="flex gap-1 text-red-600 items-center cursor-pointer" onClick={() => {
                                    setIsConfirmOpen(true)
                                }} >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete file
                                </div>
                            }

                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}

export default FileCardActions