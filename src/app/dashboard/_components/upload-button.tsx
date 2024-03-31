"use client"
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";




import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
    title: z.string().min(1).max(200),
    file: z.custom<FileList>((val) => val instanceof FileList, "Required").
        refine((files) => files.length > 0, `Required`),
})

export const UploadButton = () => {
    const { toast } = useToast();

    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);


    const organization = useOrganization();
    const user = useUser();
    // console.log(user)
    // console.log(organization?.organization?.id)

    let orgId: string | undefined = undefined;
    if (organization?.isLoaded && user?.isLoaded) {
        orgId = organization?.organization?.id! || user?.user?.id!
    }
    // const orgId = organization?.id! ?? user?.user?.id!


    const createFile = useMutation(api.files.createFile)
    const generateUploadUrl = useMutation(api.files.generateUploadUrl)
    const files = useQuery(api.files.getFile,
        orgId ? { orgId } : "skip")

    // console.log("All files : ", files)

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            file: undefined
        },
    })

    const fileRef = form.register("file")
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!orgId) return

        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": values.file[0].type },
            body: values.file[0],
        });
        const { storageId } = await result.json();

        const types = {
            'image/png': 'image',
            'image/jpeg': 'image',
            'application/pdf': 'pdf',
            'text/csv': 'csv'
        } as Record<string, Doc<"files">["type"]>;
        console.log("File type :", values.file[0].type);
        try {
            await createFile({
                name: values.title,
                orgId,
                fileId: storageId,
                type: types[values.file[0].type]
            })

            form.reset();
            setIsFileDialogOpen(false)
            toast({
                variant: "success",
                title: "File Uploaded",
                description: "Now everyone can view your file"
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error in uploading file.",
                description: "Try again later."
            })
        }

        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        // generateUploadUrl()
        // console.log(values)
    }


    return (

        <Dialog open={isFileDialogOpen} onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen)
            form.reset()
        }}>
            <DialogTrigger asChild>
                <Button onClick={() => {

                }}>
                    Upload File
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mb-8">Upload your File here</DialogTitle>
                    <DialogDescription>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter file name here..." {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="file"
                                    // render={({ field }) => (
                                    render={() => (
                                        <FormItem>
                                            <FormLabel>File</FormLabel>
                                            <FormControl>
                                                <Input type="file" {...fileRef} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit"
                                    disabled={form.formState.isSubmitting}
                                    className="flex gap-1"
                                >
                                    {form.formState.isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Submit</Button>
                            </form>
                        </Form>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>



    );
}
